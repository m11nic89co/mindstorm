import { describe, expect, it } from 'vitest';
import { PRINT_SCALE, viewportAtScale } from './printLayout';

describe('viewportAtScale', () => {
  it('keeps the flow point under the screen center when zooming', () => {
    const viewport = { x: 100, y: 50, zoom: 1 };
    const center = { x: 400, y: 300 };
    const next = viewportAtScale(viewport, PRINT_SCALE, center);

    expect(next.zoom).toBeCloseTo(0.5);
    const flowBeforeX = (center.x - viewport.x) / viewport.zoom;
    const flowBeforeY = (center.y - viewport.y) / viewport.zoom;
    const flowAfterX = (center.x - next.x) / next.zoom;
    const flowAfterY = (center.y - next.y) / next.zoom;
    expect(flowAfterX).toBeCloseTo(flowBeforeX);
    expect(flowAfterY).toBeCloseTo(flowBeforeY);
  });
});
