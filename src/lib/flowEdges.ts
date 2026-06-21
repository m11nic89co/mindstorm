import type { Connection, Edge } from '@xyflow/react';
import { createId } from './jsonCanvas';

export const FLOW_EDGE_STYLE = {
  stroke: 'rgba(165, 180, 252, 0.65)',
  strokeWidth: 2,
};

function isSameNodePair(
  sourceA: string,
  targetA: string,
  sourceB: string,
  targetB: string,
): boolean {
  return (
    (sourceA === sourceB && targetA === targetB) || (sourceA === targetB && targetA === sourceB)
  );
}

/** Одна связь на пару карточек; обратное направление переворачивает существующую. */
export function applyConnection(edges: Edge[], connection: Connection): Edge[] {
  const { source, target, sourceHandle, targetHandle } = connection;
  if (!source || !target || source === target) return edges;

  const idx = edges.findIndex((edge) => isSameNodePair(edge.source, edge.target, source, target));

  const edgeBase = {
    type: 'smoothstep' as const,
    animated: true,
    style: FLOW_EDGE_STYLE,
  };

  if (idx >= 0) {
    const existing = edges[idx];
    const updated: Edge = {
      ...existing,
      source,
      target,
      sourceHandle,
      targetHandle,
      ...edgeBase,
    };
    return edges.map((edge, i) => (i === idx ? updated : edge));
  }

  return [
    ...edges,
    {
      id: createId('edge'),
      source,
      target,
      sourceHandle,
      targetHandle,
      ...edgeBase,
    },
  ];
}

export function withAnimatedEdges(edges: Edge[]): Edge[] {
  return edges.map((edge) => ({
    ...edge,
    animated: true,
    type: edge.type ?? 'smoothstep',
    style: { ...FLOW_EDGE_STYLE, ...edge.style },
  }));
}
