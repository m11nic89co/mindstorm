import type { Theme } from '../theme/themes';
import type { CanvasColor } from '../types/jsonCanvas';

type ColorPalette = { bg: string; border: string; glow: string; name: string };

const PRESET_COLORS_DARK: Record<string, ColorPalette> = {
  '1': { bg: 'rgba(239, 68, 68, 0.055)', border: 'rgba(248, 113, 113, 0.55)', glow: 'rgba(239, 68, 68, 0.2)', name: 'Красный' },
  '2': { bg: 'rgba(249, 115, 22, 0.055)', border: 'rgba(251, 146, 60, 0.55)', glow: 'rgba(249, 115, 22, 0.2)', name: 'Оранжевый' },
  '3': { bg: 'rgba(234, 179, 8, 0.055)', border: 'rgba(250, 204, 21, 0.55)', glow: 'rgba(234, 179, 8, 0.2)', name: 'Жёлтый' },
  '4': { bg: 'rgba(34, 197, 94, 0.055)', border: 'rgba(74, 222, 128, 0.55)', glow: 'rgba(34, 197, 94, 0.2)', name: 'Зелёный' },
  '5': { bg: 'rgba(6, 182, 212, 0.055)', border: 'rgba(34, 211, 238, 0.55)', glow: 'rgba(6, 182, 212, 0.2)', name: 'Бирюзовый' },
  '6': { bg: 'rgba(168, 85, 247, 0.055)', border: 'rgba(192, 132, 252, 0.55)', glow: 'rgba(168, 85, 247, 0.2)', name: 'Фиолетовый' },
  '7': { bg: 'rgba(244, 63, 94, 0.055)', border: 'rgba(251, 113, 133, 0.55)', glow: 'rgba(244, 63, 94, 0.2)', name: 'Розовый' },
  '8': { bg: 'rgba(217, 70, 239, 0.055)', border: 'rgba(232, 121, 249, 0.55)', glow: 'rgba(217, 70, 239, 0.2)', name: 'Фуксия' },
  '9': { bg: 'rgba(132, 204, 22, 0.055)', border: 'rgba(163, 230, 53, 0.55)', glow: 'rgba(132, 204, 22, 0.2)', name: 'Лайм' },
  '10': { bg: 'rgba(20, 184, 166, 0.055)', border: 'rgba(45, 212, 191, 0.55)', glow: 'rgba(20, 184, 166, 0.2)', name: 'Морская волна' },
  '11': { bg: 'rgba(59, 130, 246, 0.055)', border: 'rgba(96, 165, 250, 0.55)', glow: 'rgba(59, 130, 246, 0.2)', name: 'Синий' },
  '12': { bg: 'rgba(148, 163, 184, 0.055)', border: 'rgba(203, 213, 225, 0.5)', glow: 'rgba(148, 163, 184, 0.2)', name: 'Серый' },
};

const PRESET_COLORS_LIGHT: Record<string, ColorPalette> = {
  '1': { bg: 'rgba(254, 226, 226, 0.92)', border: 'rgba(239, 68, 68, 0.55)', glow: 'rgba(239, 68, 68, 0.16)', name: 'Красный' },
  '2': { bg: 'rgba(255, 237, 213, 0.92)', border: 'rgba(249, 115, 22, 0.55)', glow: 'rgba(249, 115, 22, 0.16)', name: 'Оранжевый' },
  '3': { bg: 'rgba(254, 249, 195, 0.94)', border: 'rgba(202, 138, 4, 0.5)', glow: 'rgba(234, 179, 8, 0.16)', name: 'Жёлтый' },
  '4': { bg: 'rgba(220, 252, 231, 0.92)', border: 'rgba(34, 197, 94, 0.5)', glow: 'rgba(34, 197, 94, 0.16)', name: 'Зелёный' },
  '5': { bg: 'rgba(207, 250, 254, 0.92)', border: 'rgba(6, 182, 212, 0.5)', glow: 'rgba(6, 182, 212, 0.16)', name: 'Бирюзовый' },
  '6': { bg: 'rgba(243, 232, 255, 0.92)', border: 'rgba(168, 85, 247, 0.5)', glow: 'rgba(168, 85, 247, 0.16)', name: 'Фиолетовый' },
  '7': { bg: 'rgba(255, 228, 230, 0.92)', border: 'rgba(244, 63, 94, 0.5)', glow: 'rgba(244, 63, 94, 0.16)', name: 'Розовый' },
  '8': { bg: 'rgba(250, 232, 255, 0.92)', border: 'rgba(217, 70, 239, 0.5)', glow: 'rgba(217, 70, 239, 0.16)', name: 'Фуксия' },
  '9': { bg: 'rgba(236, 252, 203, 0.92)', border: 'rgba(132, 204, 22, 0.5)', glow: 'rgba(132, 204, 22, 0.16)', name: 'Лайм' },
  '10': { bg: 'rgba(204, 251, 241, 0.92)', border: 'rgba(20, 184, 166, 0.5)', glow: 'rgba(20, 184, 166, 0.16)', name: 'Морская волна' },
  '11': { bg: 'rgba(219, 234, 254, 0.92)', border: 'rgba(59, 130, 246, 0.5)', glow: 'rgba(59, 130, 246, 0.16)', name: 'Синий' },
  '12': { bg: 'rgba(241, 245, 249, 0.96)', border: 'rgba(100, 116, 139, 0.45)', glow: 'rgba(148, 163, 184, 0.16)', name: 'Серый' },
};

export const PRESET_COLORS = PRESET_COLORS_DARK;

export const DEFAULT_CARD = {
  bg: 'rgba(255, 255, 255, 0.035)',
  border: 'rgba(255, 255, 255, 0.14)',
  glow: 'rgba(99, 102, 241, 0.15)',
};

const DEFAULT_CARD_LIGHT = {
  bg: 'rgba(255, 255, 255, 0.94)',
  border: 'rgba(15, 23, 42, 0.14)',
  glow: 'rgba(99, 102, 241, 0.12)',
};

export const COLOR_IDS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
] as const satisfies readonly CanvasColor[];

export function resolveColor(color?: CanvasColor, theme: Theme = 'dark') {
  const presets = theme === 'light' ? PRESET_COLORS_LIGHT : PRESET_COLORS_DARK;
  const fallback = theme === 'light' ? DEFAULT_CARD_LIGHT : DEFAULT_CARD;
  if (!color) return fallback;
  if (color in presets) return presets[color];
  return {
    bg: theme === 'light' ? `${color}22` : `${color}20`,
    border: `${color}66`,
    glow: `${color}33`,
  };
}

export function swatchFill(color: CanvasColor): string {
  return PRESET_COLORS_DARK[color]?.border ?? DEFAULT_CARD.border;
}

export function swatchTitle(
  color: CanvasColor,
  colorNames?: Record<string, string>,
  customLabel = 'Custom color',
): string {
  return colorNames?.[color] ?? PRESET_COLORS_DARK[color]?.name ?? customLabel;
}
