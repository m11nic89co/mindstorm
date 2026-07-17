import type { JsonCanvas } from '../types/jsonCanvas';
import {
  ensureHandlePermission,
  getStartInHandle,
  rememberFileHandle,
  rememberSavesDirHandle,
  resolveSavesDirectory,
  readSavesDirHandle,
} from './fileHandleStorage';
import { triggerPngDownload } from './exportPng';
import { parseCanvasFile } from './jsonCanvas';

/** Формат файла MindStorm — JSON Canvas + метаданные, расширение .mindstorm */
export const BOARD_FILE_EXTENSION = '.mindstorm';
export const PNG_FILE_EXTENSION = '.png';
/** Подпапка для PNG-превью внутри папки сохранений (создаётся при первом save). */
export const PNG_SUBDIR = 'png';
export const BOARD_FILE_ACCEPT = '.mindstorm,.mindshtorm,.canvas,application/json';

export const BOARD_FORMAT_ID = 'mindstorm-board';
export const LEGACY_BOARD_FORMAT_ID = 'mindshtorm-board';

/** Суффикс даты/времени в имени: `2026-07-17_10-13-28`. */
const TIMESTAMP_SUFFIX_RE = /\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/;

export type MindStormBoardFile = {
  format: typeof BOARD_FORMAT_ID | typeof LEGACY_BOARD_FORMAT_ID;
  version: 1;
  title: string;
  savedAt: string;
  canvas: JsonCanvas;
};

export type SaveBoardFormat = 'both' | 'png' | 'mindstorm';

export type SaveBoardResult = {
  /** Краткое описание для toast (оба имени или одно). */
  filename: string;
  /** Итоговое имя схемы (без расширения). */
  title: string;
  method: 'picker' | 'folder' | 'download';
  format: SaveBoardFormat;
};

export class SaveCancelledError extends Error {
  constructor() {
    super('CANCELLED');
    this.name = 'SaveCancelledError';
  }
}

function isBoardFile(parsed: unknown): parsed is MindStormBoardFile {
  if (!parsed || typeof parsed !== 'object') return false;
  const format = (parsed as MindStormBoardFile).format;
  return format === BOARD_FORMAT_ID || format === LEGACY_BOARD_FORMAT_ID;
}

export function buildBoardFile(title: string, canvas: JsonCanvas): MindStormBoardFile {
  const safeTitle = title.trim() || 'моя-схема';
  return {
    format: BOARD_FORMAT_ID,
    version: 1,
    title: safeTitle,
    savedAt: new Date().toISOString(),
    canvas,
  };
}

export function parseBoardFile(content: string, fallbackTitle = 'схема'): {
  title: string;
  canvas: JsonCanvas;
} {
  const parsed = JSON.parse(content) as MindStormBoardFile | JsonCanvas;

  if (isBoardFile(parsed)) {
    if (!parsed.canvas || typeof parsed.canvas !== 'object') {
      throw new Error('В файле .mindstorm нет данных схемы');
    }
    return {
      title: parsed.title?.trim() || fallbackTitle,
      canvas: parsed.canvas,
    };
  }

  return {
    title: fallbackTitle,
    canvas: parseCanvasFile(content),
  };
}

export function sanitizeFilename(title: string): string {
  const base = title.trim().replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-');
  return base || 'моя-схема';
}

export function buildFilename(title: string): string {
  return `${sanitizeFilename(title)}${BOARD_FILE_EXTENSION}`;
}

export function buildPngFilename(title: string): string {
  return `${sanitizeFilename(title)}${PNG_FILE_EXTENSION}`;
}

/** Относительный путь PNG внутри папки saves, например `png/board.png`. */
export function buildPngRelativePath(title: string): string {
  return `${PNG_SUBDIR}/${buildPngFilename(title)}`;
}

/** Папка `png` внутри saves — создаётся, если ещё нет. */
export async function resolvePngDirectory(
  savesDir: FileSystemDirectoryHandle,
): Promise<FileSystemDirectoryHandle> {
  return savesDir.getDirectoryHandle(PNG_SUBDIR, { create: true });
}

/** Имя файла по локальной дате и времени, например `2026-06-22_20-54-33`. */
export function buildTimestampSaveTitle(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('-');
  const time = [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join('-');
  return `${date}_${time}`;
}

/**
 * Убирает суффикс `YYYY-MM-DD_HH-MM-SS` из имени (и расширение, если есть).
 * `SUH2026-07-17_10-13-28` → `SUH`
 */
export function stripTimestampSuffix(name: string): string {
  const withoutExt = name.trim().replace(/\.(mindstorm|mindshtorm|canvas|png)$/i, '');
  return withoutExt.replace(TIMESTAMP_SUFFIX_RE, '');
}

/**
 * Предлагаемое имя для Save As: префикс прошлого имени + текущие дата/время.
 * `SUH2026-07-17_10-13-28` → `SUH2026-07-17_10-21-00`
 */
export function suggestSaveTitle(
  previousName: string | null | undefined,
  now: Date = new Date(),
): string {
  const stamp = buildTimestampSaveTitle(now);
  const raw = previousName?.trim();
  if (!raw) return stamp;
  return `${stripTimestampSuffix(raw)}${stamp}`;
}

export function canUseSaveFilePicker(): boolean {
  return typeof window.showSaveFilePicker === 'function';
}

export function canUseDirectoryPicker(): boolean {
  return typeof window.showDirectoryPicker === 'function';
}

export function canUseOpenFilePicker(): boolean {
  return typeof window.showOpenFilePicker === 'function';
}

function triggerJsonDownload(filename: string, json: string) {
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function writeBlobToFileHandle(fileHandle: FileSystemFileHandle, blob: Blob): Promise<void> {
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

async function writeBlobToDirectory(
  dir: FileSystemDirectoryHandle,
  filename: string,
  blob: Blob,
): Promise<FileSystemFileHandle> {
  const fileHandle = await dir.getFileHandle(filename, { create: true });
  await writeBlobToFileHandle(fileHandle, blob);
  return fileHandle;
}

/** Родительская папка файла — если браузер поддерживает getParent(). */
async function tryGetParentDirectory(
  fileHandle: FileSystemFileHandle,
): Promise<FileSystemDirectoryHandle | null> {
  const withParent = fileHandle as FileSystemFileHandle & {
    getParent?: () => Promise<FileSystemDirectoryHandle>;
  };
  if (typeof withParent.getParent !== 'function') return null;
  try {
    return await withParent.getParent();
  } catch {
    return null;
  }
}

async function resolvePngParentDirectory(
  fileHandle: FileSystemFileHandle,
  startIn?: FileSystemHandle,
): Promise<FileSystemDirectoryHandle | null> {
  const parent = await tryGetParentDirectory(fileHandle);
  if (parent) {
    await rememberSavesDirHandle(parent);
    return parent;
  }

  if (startIn?.kind === 'directory') {
    const dir = startIn as FileSystemDirectoryHandle;
    if (await ensureHandlePermission(dir, 'readwrite')) {
      await rememberSavesDirHandle(dir);
      return dir;
    }
  }

  const remembered = await readSavesDirHandle();
  if (remembered && (await ensureHandlePermission(remembered, 'readwrite'))) {
    return remembered;
  }

  return null;
}

async function writePngPreview(
  parentDir: FileSystemDirectoryHandle,
  title: string,
  pngBlob: Blob,
): Promise<string> {
  const pngDir = await resolvePngDirectory(parentDir);
  const pngName = buildPngFilename(title);
  await writeBlobToDirectory(pngDir, pngName, pngBlob);
  return buildPngRelativePath(title);
}

export type SaveBoardOptions = {
  defaultTitle?: string;
  typeDescription?: string;
  pngTypeDescription?: string;
  /** Готовый PNG (если уже снят). */
  pngBlob?: Blob;
  /**
   * Снимок после системного диалога «Сохранить» —
   * picker должен вызваться сразу по клику (user gesture).
   */
  capturePng?: () => Promise<Blob | undefined>;
  /** Имя уже выбрано в UI — не открывать showSaveFilePicker повторно. */
  skipNativePicker?: boolean;
};

/**
 * Сохраняет схему через системный диалог «Сохранить как» (имя + папка).
 * `.mindstorm` — куда выбрал пользователь; PNG — в `png/` той же папки (если доступна).
 * Fallback: папка saves / «Загрузки».
 */
export async function saveBoardToDisk(
  title: string,
  canvas: JsonCanvas,
  options?: SaveBoardOptions,
): Promise<SaveBoardResult> {
  const suggestedTitle = title.trim() || options?.defaultTitle || 'my-board';
  const typeDescription = options?.typeDescription ?? 'MindStorm board';

  const resolvePngBlob = async (): Promise<Blob | undefined> => {
    if (options?.pngBlob) return options.pngBlob;
    if (options?.capturePng) {
      try {
        return await options.capturePng();
      } catch {
        return undefined;
      }
    }
    return undefined;
  };

  if (canUseSaveFilePicker() && !options?.skipNativePicker) {
    try {
      const startIn = await getStartInHandle();
      const picker = window.showSaveFilePicker!;
      const fileHandle = await picker.call(window, {
        suggestedName: buildFilename(suggestedTitle),
        id: 'mindstorm-save',
        ...(startIn ? { startIn } : { startIn: 'documents' as const }),
        types: [
          {
            description: typeDescription,
            accept: {
              'application/json': ['.mindstorm', '.mindshtorm'],
            },
          },
        ],
      });

      const savedTitle = titleFromFilename(fileHandle.name) || suggestedTitle;
      const json = JSON.stringify(buildBoardFile(savedTitle, canvas), null, 2);
      const jsonBlob = new Blob([json], { type: 'application/json;charset=utf-8' });
      await writeBlobToFileHandle(fileHandle, jsonBlob);
      await rememberFileHandle(fileHandle);

      const pngBlob = await resolvePngBlob();
      if (pngBlob) {
        const parent = await resolvePngParentDirectory(fileHandle, startIn);
        if (parent) {
          const pngRel = await writePngPreview(parent, savedTitle, pngBlob);
          return {
            filename: `${fileHandle.name} + ${pngRel}`,
            title: savedTitle,
            method: 'picker',
            format: 'both',
          };
        }
        window.setTimeout(() => triggerPngDownload(buildPngFilename(savedTitle), pngBlob), 200);
        return {
          filename: `${fileHandle.name} + ${buildPngFilename(savedTitle)}`,
          title: savedTitle,
          method: 'picker',
          format: 'both',
        };
      }

      return {
        filename: fileHandle.name,
        title: savedTitle,
        method: 'picker',
        format: 'mindstorm',
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new SaveCancelledError();
      }
      /* picker недоступен / permission — fallback */
    }
  }

  const pngBlob = await resolvePngBlob();
  const boardName = buildFilename(suggestedTitle);
  const json = JSON.stringify(buildBoardFile(suggestedTitle, canvas), null, 2);
  const jsonBlob = new Blob([json], { type: 'application/json;charset=utf-8' });

  if (canUseDirectoryPicker()) {
    try {
      const dir = await resolveSavesDirectory();
      const boardHandle = await writeBlobToDirectory(dir, boardName, jsonBlob);
      await rememberFileHandle(boardHandle);

      if (pngBlob) {
        const pngRel = await writePngPreview(dir, suggestedTitle, pngBlob);
        return {
          filename: `${boardName} + ${pngRel}`,
          title: suggestedTitle,
          method: 'folder',
          format: 'both',
        };
      }

      return {
        filename: boardName,
        title: suggestedTitle,
        method: 'folder',
        format: 'mindstorm',
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new SaveCancelledError();
      }
    }
  }

  triggerJsonDownload(boardName, json);
  if (pngBlob) {
    window.setTimeout(() => triggerPngDownload(buildPngFilename(suggestedTitle), pngBlob), 200);
    return {
      filename: `${boardName} + ${buildPngFilename(suggestedTitle)}`,
      title: suggestedTitle,
      method: 'download',
      format: 'both',
    };
  }

  return {
    filename: boardName,
    title: suggestedTitle,
    method: 'download',
    format: 'mindstorm',
  };
}

export type OpenBoardResult = {
  title: string;
  canvas: JsonCanvas;
  filename: string;
};

/** Системный диалог «Открыть» в папке сохранений. */
export async function openBoardFromDisk(options?: {
  typeDescription?: string;
}): Promise<OpenBoardResult> {
  const openPicker = window.showOpenFilePicker;
  if (!openPicker) {
    throw new Error('OPEN_PICKER_UNAVAILABLE');
  }

  try {
    const startIn = await getStartInHandle();
    const [handle] = await openPicker.call(window, {
      multiple: false,
      ...(startIn ? { startIn } : {}),
      types: [
        {
          description: options?.typeDescription ?? 'MindStorm board',
          accept: {
            'application/json': ['.mindstorm', '.mindshtorm', '.canvas'],
          },
        },
      ],
    });

    await rememberFileHandle(handle);
    const file = await handle.getFile();
    const text = await file.text();
    const fallbackTitle = file.name.replace(/\.(mindstorm|mindshtorm|canvas)$/i, '') || 'схема';
    const parsed = parseBoardFile(text, fallbackTitle);
    return { ...parsed, filename: file.name };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new SaveCancelledError();
    }
    throw error;
  }
}

export function readBoardFromFile(file: File): Promise<{ title: string; canvas: JsonCanvas }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const fallbackTitle =
          file.name.replace(/\.(mindstorm|mindshtorm|canvas)$/i, '') || 'схема';
        resolve(parseBoardFile(String(reader.result ?? ''), fallbackTitle));
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Не удалось прочитать файл'));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file, 'utf-8');
  });
}

export function titleFromFilename(filename: string): string {
  const first = filename.split('+')[0]?.trim() ?? filename;
  return first.replace(/\.(mindstorm|mindshtorm|canvas|png)$/i, '') || 'моя-схема';
}

export function saveSuccessMessage(
  result: SaveBoardResult,
  messages: {
    savedAs: (filename: string) => string;
    savedDownloads: (filename: string) => string;
    savedFolder?: (filename: string) => string;
  },
): string {
  if (result.method === 'download') {
    return messages.savedDownloads(result.filename);
  }
  return (messages.savedFolder ?? messages.savedAs)(result.filename);
}
