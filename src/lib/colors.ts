import type { CanvasColor } from '../types/jsonCanvas';

export const PRESET_COLORS: Record<string, { bg: string; border: string; glow: string; name: string }> = {
  '1': { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(248, 113, 113, 0.55)', glow: 'rgba(239, 68, 68, 0.2)', name: 'Красный' },
  '2': { bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(251, 146, 60, 0.55)', glow: 'rgba(249, 115, 22, 0.2)', name: 'Оранжевый' },
  '3': { bg: 'rgba(234, 179, 8, 0.12)', border: 'rgba(250, 204, 21, 0.55)', glow: 'rgba(234, 179, 8, 0.2)', name: 'Жёлтый' },
  '4': { bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(74, 222, 128, 0.55)', glow: 'rgba(34, 197, 94, 0.2)', name: 'Зелёный' },
  '5': { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(34, 211, 238, 0.55)', glow: 'rgba(6, 182, 212, 0.2)', name: 'Бирюзовый' },
  '6': { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(192, 132, 252, 0.55)', glow: 'rgba(168, 85, 247, 0.2)', name: 'Фиолетовый' },
  '7': { bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(251, 113, 133, 0.55)', glow: 'rgba(244, 63, 94, 0.2)', name: 'Розовый' },
  '8': { bg: 'rgba(217, 70, 239, 0.12)', border: 'rgba(232, 121, 249, 0.55)', glow: 'rgba(217, 70, 239, 0.2)', name: 'Фуксия' },
  '9': { bg: 'rgba(132, 204, 22, 0.12)', border: 'rgba(163, 230, 53, 0.55)', glow: 'rgba(132, 204, 22, 0.2)', name: 'Лайм' },
  '10': { bg: 'rgba(20, 184, 166, 0.12)', border: 'rgba(45, 212, 191, 0.55)', glow: 'rgba(20, 184, 166, 0.2)', name: 'Морская волна' },
  '11': { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(96, 165, 250, 0.55)', glow: 'rgba(59, 130, 246, 0.2)', name: 'Синий' },
  '12': { bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(203, 213, 225, 0.5)', glow: 'rgba(148, 163, 184, 0.2)', name: 'Серый' },
};

export const DEFAULT_CARD = {
  bg: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.14)',
  glow: 'rgba(99, 102, 241, 0.15)',
};

export const COLOR_IDS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
] as const satisfies readonly CanvasColor[];

export function resolveColor(color?: CanvasColor) {
  if (!color) return DEFAULT_CARD;
  if (color in PRESET_COLORS) return PRESET_COLORS[color];
  return {
    bg: `${color}20`,
    border: `${color}66`,
    glow: `${color}33`,
  };
}

export function swatchFill(color: CanvasColor): string {
  return PRESET_COLORS[color]?.border ?? DEFAULT_CARD.border;
}

export function swatchTitle(color: CanvasColor): string {
  return PRESET_COLORS[color]?.name ?? 'Свой цвет';
}
