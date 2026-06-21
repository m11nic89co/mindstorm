import type { JsonCanvas } from '../types/jsonCanvas';
import { parseCanvasFile } from './jsonCanvas';

/** Формат файла MindStorm — JSON Canvas + метаданные, расширение .mindstorm */
export const BOARD_FILE_EXTENSION = '.mindstorm';
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

export type SaveBoardResult = {
  filename: string;
  method: 'picker' | 'download';
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

export function canUseSaveFilePicker(): boolean {
  return typeof window.showSaveFilePicker === 'function';
}

function triggerDownload(filename: string, json: string) {
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

/** Системный диалог «Сохранить как» (Chrome/Edge) или скачивание в «Загрузки». */
export async function saveBoardToDisk(
  title: string,
  canvas: JsonCanvas,
  options?: { defaultTitle?: string; typeDescription?: string },
): Promise<SaveBoardResult> {
  const safeTitle = title.trim() || options?.defaultTitle || 'my-board';
  const filename = buildFilename(safeTitle);
  const json = JSON.stringify(buildBoardFile(safeTitle, canvas), null, 2);

  const picker = window.showSaveFilePicker;
  if (picker) {
    try {
      const handle = await picker.call(window, {
        suggestedName: filename,
        types: [
          {
            description: options?.typeDescription ?? 'MindStorm board',
            accept: { 'application/json': ['.mindstorm'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(new Blob([json], { type: 'application/json;charset=utf-8' }));
      await writable.close();
      return { filename: handle.name, method: 'picker' };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new SaveCancelledError();
      }
    }
  }

  triggerDownload(filename, json);
  return { filename, method: 'download' };
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
  return filename.replace(/\.(mindstorm|mindshtorm|canvas)$/i, '') || 'моя-схема';
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
