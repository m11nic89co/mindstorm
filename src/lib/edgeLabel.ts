/** Размер шрифта подписи связи по умолчанию (px) — совпадает с CSS `.ms-edge-label`. */
export const DEFAULT_EDGE_LABEL_FONT_SIZE = 9;

export const MIN_EDGE_LABEL_FONT_SIZE = 8;
export const MAX_EDGE_LABEL_FONT_SIZE = 36;

export function clampEdgeLabelFontSize(size: number): number {
  return Math.min(MAX_EDGE_LABEL_FONT_SIZE, Math.max(MIN_EDGE_LABEL_FONT_SIZE, Math.round(size)));
}

export function resolveEdgeLabelFontSize(size?: number): number {
  if (size == null || !Number.isFinite(size)) return DEFAULT_EDGE_LABEL_FONT_SIZE;
  return clampEdgeLabelFontSize(size);
}
