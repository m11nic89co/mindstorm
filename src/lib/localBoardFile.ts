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

export function buildBoardFile(title: string, canvas: JsonCanvas): MindShtormBoardFile {
  const safeTitle = title.trim() || 'схема';
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
  return base || 'схема';
}

export function downloadBoardFile(title: string, canvas: JsonCanvas) {
  const payload = buildBoardFile(title, canvas);
  const filename = `${sanitizeFilename(title)}${BOARD_FILE_EXTENSION}`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
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
