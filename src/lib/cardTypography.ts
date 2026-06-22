/** Размер шрифта заголовка text-карточки по умолчанию (px). */
export const DEFAULT_LABEL_FONT_SIZE = 15;

/** Размер шрифта тела text-карточки по умолчанию (px, ≈ Tailwind text-sm). */
export const DEFAULT_TEXT_FONT_SIZE = 14;

export const MIN_CARD_FONT_SIZE = 10;
export const MAX_CARD_FONT_SIZE = 36;

/** Цвет новой карточки при двойном клике по холсту (12 = серый). */
export const DOUBLE_CLICK_CARD_COLOR = '12';

export function clampCardFontSize(size: number): number {
  return Math.min(MAX_CARD_FONT_SIZE, Math.max(MIN_CARD_FONT_SIZE, Math.round(size)));
}

export function resolveLabelFontSize(size?: number): number {
  if (size == null || !Number.isFinite(size)) return DEFAULT_LABEL_FONT_SIZE;
  return clampCardFontSize(size);
}

export function resolveTextFontSize(size?: number): number {
  if (size == null || !Number.isFinite(size)) return DEFAULT_TEXT_FONT_SIZE;
  return clampCardFontSize(size);
}
