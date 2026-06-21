import type { JsonCanvas } from '../types/jsonCanvas';
import { parseCanvasFile } from './jsonCanvas';

/** Формат файла MindShtorm — JSON Canvas + метаданные, расширение .mindshtorm */
export const BOARD_FILE_EXTENSION = '.mindshtorm';
export const BOARD_FILE_ACCEPT = '.mindshtorm,.canvas,application/json';

export type MindShtormBoardFile = {
  format: 'mindshtorm-board';
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

export function buildBoardFile(title: string, canvas: JsonCanvas): MindShtormBoardFile {
  const safeTitle = title.trim() || 'моя-схема';
  return {
    format: 'mindshtorm-board',
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
  const parsed = JSON.parse(content) as MindShtormBoardFile | JsonCanvas;

  if (parsed && typeof parsed === 'object' && 'format' in parsed && parsed.format === 'mindshtorm-board') {
    const file = parsed as MindShtormBoardFile;
    if (!file.canvas || typeof file.canvas !== 'object') {
      throw new Error('В файле .mindshtorm нет данных схемы');
    }
    return {
      title: file.title?.trim() || fallbackTitle,
      canvas: file.canvas,
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
export async function saveBoardToDisk(title: string, canvas: JsonCanvas): Promise<SaveBoardResult> {
  const safeTitle = title.trim() || 'моя-схема';
  const filename = buildFilename(safeTitle);
  const json = JSON.stringify(buildBoardFile(safeTitle, canvas), null, 2);

  const picker = window.showSaveFilePicker;
  if (picker) {
    try {
      const handle = await picker.call(window, {
        suggestedName: filename,
        types: [
          {
            description: 'Схема MindShtorm',
            accept: { 'application/json': ['.mindshtorm'] },
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

/** @deprecated используйте saveBoardToDisk */
export function downloadBoardFile(title: string, canvas: JsonCanvas) {
  const safeTitle = title.trim() || 'моя-схема';
  const json = JSON.stringify(buildBoardFile(safeTitle, canvas), null, 2);
  triggerDownload(buildFilename(safeTitle), json);
}

export function readBoardFromFile(file: File): Promise<{ title: string; canvas: JsonCanvas }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const fallbackTitle = file.name.replace(/\.(mindshtorm|canvas)$/i, '') || 'схема';
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
  return filename.replace(/\.(mindshtorm|canvas)$/i, '') || 'моя-схема';
}

export function saveSuccessMessage(result: SaveBoardResult): string {
  if (result.method === 'picker') {
    return `Сохранено: ${result.filename}`;
  }
  return `Файл ${result.filename} отправлен в папку «Загрузки»`;
}
