/** Масштаб печати по умолчанию (50%). */
export const PRINT_SCALE = 0.5;

/**
 * Сохраняет центр viewport при смене zoom (для печати 50% после fitView).
 */
export function viewportAtScale(
  viewport: { x: number; y: number; zoom: number },
  scale: number,
  center: { x: number; y: number },
): { x: number; y: number; zoom: number } {
  const nextZoom = Math.max(0.02, viewport.zoom * scale);
  const flowX = (center.x - viewport.x) / viewport.zoom;
  const flowY = (center.y - viewport.y) / viewport.zoom;
  return {
    x: center.x - flowX * nextZoom,
    y: center.y - flowY * nextZoom,
    zoom: nextZoom,
  };
}
