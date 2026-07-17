import { describe, expect, it } from 'vitest';
import type { Edge, Node } from '@xyflow/react';
import { assignEdgeLaneOffsets } from './flowEdges';
import type { CardNodeData } from '../types/jsonCanvas';

function node(id: string, x: number, y: number): Node<CardNodeData> {
  return {
    id,
    position: { x, y },
    data: { canvasType: 'text' },
  };
}

function edge(
  id: string,
  source: string,
  target: string,
  sourceHandle: string,
  targetHandle: string,
): Edge {
  return { id, source, target, sourceHandle, targetHandle };
}

describe('assignEdgeLaneOffsets', () => {
  it('разводит входящие в одну сторону разными offset', () => {
    const nodes = [node('a', 0, 0), node('b', 0, 200), node('backend', 400, 100)];
    const edges = [
      edge('e1', 'a', 'backend', 'source-right-a', 'source-left-a'),
      edge('e2', 'b', 'backend', 'source-right-a', 'source-left-b'),
    ];

    const next = assignEdgeLaneOffsets(edges, nodes);
    const o1 = next.find((e) => e.id === 'e1')?.pathOptions?.offset ?? 0;
    const o2 = next.find((e) => e.id === 'e2')?.pathOptions?.offset ?? 0;

    expect(o1).not.toBe(o2);
    expect(Math.abs(o1 - o2)).toBeGreaterThanOrEqual(16);
  });

  it('сдвигает stepPosition у коридорных рёбер (иначе centerX совпадает)', () => {
    const nodes = [node('a', 0, 0), node('b', 0, 200), node('backend', 400, 100)];
    const edges = [
      edge('e1', 'a', 'backend', 'source-right-a', 'source-left-a'),
      edge('e2', 'b', 'backend', 'source-right-a', 'source-left-d'),
    ];

    const next = assignEdgeLaneOffsets(edges, nodes);
    const s1 = next.find((e) => e.id === 'e1')?.pathOptions?.stepPosition ?? 0.5;
    const s2 = next.find((e) => e.id === 'e2')?.pathOptions?.stepPosition ?? 0.5;

    expect(s1).not.toBe(s2);
    expect(Math.abs(s1 - s2)).toBeGreaterThanOrEqual(0.08);
  });

  it('одиночная связь получает дефолтный offset', () => {
    const nodes = [node('a', 0, 0), node('b', 200, 0)];
    const edges = [edge('e1', 'a', 'b', 'source-right-a', 'source-left-a')];
    const next = assignEdgeLaneOffsets(edges, nodes);
    expect(next[0].pathOptions?.offset).toBe(20);
    expect(next[0].pathOptions?.stepPosition).toBe(0.5);
  });
});
