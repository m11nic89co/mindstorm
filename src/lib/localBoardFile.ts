import type { JsonCanvas } from '../types/jsonCanvas';
import { getStartInHandle, rememberFileHandle } from './fileHandleStorage';
import { triggerPngDownload } from './exportPng';
import { parseCanvasFile } from './jsonCanvas';

/** Формат файла MindStorm — JSON Canvas + метаданные, расширение .mindstorm */
export const BOARD_FILE_EXTENSION = '.mindstorm';
export const PNG_FILE_EXTENSION = '.png';
export const BOARD_FILE_ACCEPT = '.mindstorm,.mindshtorm,.canvas,application/json';

export const BOARD_FORMAT_ID = 'mindstorm-board';
export const LEGACY_BOARD_FORMAT_ID = 'mindshtorm-board';

export type MindStormBoardFile = {
  format: typeof BOARD_FORMAT_ID | typeof LEGACY_BOARD_FORMAT_ID;
  version: 1;
  title: string;
  savedAt: string;
  canvas: JsonCanvas;
};

export type SaveBoardFormat = 'png' | 'mindstorm';

export type SaveBoardResult = {
  filename: string;
  method: 'picker' | 'download';
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

/** Имя файла по локальной дате и времени, например `2026-06-22_20-54-33`. */
export function buildTimestampSaveTitle(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('-');
  const time = [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join('-');
  return `${date}_${time}`;
}

export function canUseSaveFilePicker(): boolean {
  return typeof window.showSaveFilePicker === 'function';
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

function isPngName(name: string): boolean {
  return name.toLowerCase().endsWith(PNG_FILE_EXTENSION);
}

export type SaveBoardOptions = {
  defaultTitle?: string;
  typeDescription?: string;
  pngTypeDescription?: string;
  /** PNG-снимок схемы — если есть, PNG будет форматом по умолчанию */
  pngBlob?: Blob;
};

/** Системный диалог «Сохранить как» (Chrome/Edge) или скачивание. По умолчанию PNG. */
export async function saveBoardToDisk(
  title: string,
  canvas: JsonCanvas,
  options?: SaveBoardOptions,
): Promise<SaveBoardResult> {
  const safeTitle = title.trim() || options?.defaultTitle || 'my-board';
  const pngName = buildPngFilename(safeTitle);
  const boardName = buildFilename(safeTitle);
  const json = JSON.stringify(buildBoardFile(safeTitle, canvas), null, 2);
  const preferPng = Boolean(options?.pngBlob);

  const picker = window.showSaveFilePicker;
  if (picker) {
    try {
      const startIn = await getStartInHandle();
      const types: Array<{ description?: string; accept: Record<string, string[]> }> = [];
      if (preferPng) {
        types.push({
          description: options?.pngTypeDescription ?? 'PNG image',
          accept: { 'image/png': ['.png'] },
        });
      }
      types.push({
        description: options?.typeDescription ?? 'MindStorm board',
        accept: { 'application/json': ['.mindstorm'] },
      });

      const handle = await picker.call(window, {
        suggestedName: preferPng ? pngName : boardName,
        ...(startIn ? { startIn } : {}),
        types,
      });

      const format: SaveBoardFormat = isPngName(handle.name) && options?.pngBlob ? 'png' : 'mindstorm';
      const blob =
        format === 'png' && options?.pngBlob
          ? options.pngBlob
          : new Blob([json], { type: 'application/json;charset=utf-8' });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      await rememberFileHandle(handle);
      return { filename: handle.name, method: 'picker', format };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new SaveCancelledError();
      }
    }
  }

  if (preferPng && options?.pngBlob) {
    triggerPngDownload(pngName, options.pngBlob);
    return { filename: pngName, method: 'download', format: 'png' };
  }

  triggerJsonDownload(boardName, json);
  return { filename: boardName, method: 'download', format: 'mindstorm' };
}

export type OpenBoardResult = {
  title: string;
  canvas: JsonCanvas;
  filename: string;
};

/** Системный диалог «Открыть» в той же папке, что и последнее сохранение. */
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
  return filename.replace(/\.(mindstorm|mindshtorm|canvas|png)$/i, '') || 'моя-схема';
}

export function saveSuccessMessage(
  result: SaveBoardResult,
  messages: { savedAs: (filename: string) => string; savedDownloads: (filename: string) => string },
): string {
  if (result.method === 'picker') {
    return messages.savedAs(result.filename);
  }
  return messages.savedDownloads(result.filename);
}
