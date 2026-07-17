/** Масштаб после fitView: 1 = весь контент максимально крупно на странице. */
export const PRINT_SCALE = 1;

/**
 * Сохраняет центр viewport при смене zoom (для печати после fitView).
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
