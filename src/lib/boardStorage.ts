import type { Edge, Node } from '@xyflow/react';
import { readLocale } from '../i18n/localeStorage';
import type { CardNodeData, JsonCanvas } from '../types/jsonCanvas';
import { getDemoCanvas } from './demoCanvas';
import { flowToCanvas } from './jsonCanvas';

export const CANVAS_STORAGE_KEY = 'mindstorm.canvas.v1';
export const LEGACY_CANVAS_STORAGE_KEY = 'mindshtorm.canvas.v1';
export const BOARD_NAME_KEY = 'mindstorm.boardName';
export const LEGACY_BOARD_NAME_KEY = 'mindshtorm.boardName';

export function loadStoredCanvas(): JsonCanvas {
  try {
    let raw = localStorage.getItem(CANVAS_STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_CANVAS_STORAGE_KEY);
      if (raw) localStorage.setItem(CANVAS_STORAGE_KEY, raw);
    }
    if (raw) return JSON.parse(raw) as JsonCanvas;
  } catch {
    /* fallback to demo */
  }
  return getDemoCanvas(readLocale());
}

export function persistCanvas(nodes: Node<CardNodeData>[], edges: Edge[]): void {
  localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(flowToCanvas(nodes, edges)));
}

export function readBoardName(): string | null {
  const name = localStorage.getItem(BOARD_NAME_KEY) ?? localStorage.getItem(LEGACY_BOARD_NAME_KEY);
  if (name && !localStorage.getItem(BOARD_NAME_KEY)) {
    localStorage.setItem(BOARD_NAME_KEY, name);
  }
  return name;
}

export function writeBoardName(name: string | null): void {
  if (name) localStorage.setItem(BOARD_NAME_KEY, name);
  else localStorage.removeItem(BOARD_NAME_KEY);
}
