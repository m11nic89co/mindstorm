import { MarkerType, type Connection, type Edge, type Node } from '@xyflow/react';
import { PRESET_COLORS } from './colors';
import { createId } from './id';
import type { CanvasColor, CardNodeData } from '../types/jsonCanvas';

export const FLOW_EDGE_STYLE = {
  stroke: 'rgba(165, 180, 252, 0.65)',
  strokeWidth: 2,
};

export const FLOW_EDGE_LABELS = {
  labelStyle: { fill: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: 500 },
  labelBgStyle: { fill: 'rgba(11, 13, 20, 0.82)', fillOpacity: 1 },
  labelBgPadding: [4, 7] as [number, number],
  labelBgBorderRadius: 6,
};

export function edgeLabelProps(label?: string) {
  const trimmed = label?.trim();
  if (!trimmed) return { label: undefined };
  return { label: trimmed, ...FLOW_EDGE_LABELS };
}

export function setEdgeLabel(edge: Edge, label?: string): Edge {
  const props = edgeLabelProps(label);
  if (!props.label) {
    const next = { ...edge };
    delete next.label;
    delete next.labelStyle;
    delete next.labelBgStyle;
    delete next.labelBgPadding;
    delete next.labelBgBorderRadius;
    return next;
  }
  return { ...edge, ...props };
}

export function strokeForNodeColor(color?: CanvasColor) {
  if (color && color in PRESET_COLORS) {
    return { stroke: PRESET_COLORS[color].border, strokeWidth: 2 };
  }
  return FLOW_EDGE_STYLE;
}

/** @deprecated используйте strokeForNodeColor */
export function strokeForEdge(color?: CanvasColor) {
  return strokeForNodeColor(color);
}

function arrowMarker(color?: CanvasColor) {
  return {
    type: MarkerType.ArrowClosed,
    width: 10,
    height: 10,
    color: strokeForNodeColor(color).stroke,
  };
}

const FLOW_EDGE_BASE = {
  type: 'smoothstep' as const,
  animated: true,
};

export function normalizeFlowEdge(edge: Edge, sourceColor?: CanvasColor): Edge {
  const color = sourceColor ?? (edge.data?.sourceColor as CanvasColor | undefined);
  const style = strokeForNodeColor(color);
  const labelProps = edgeLabelProps(typeof edge.label === 'string' ? edge.label : undefined);
  return {
    ...edge,
    ...FLOW_EDGE_BASE,
    ...labelProps,
    selectable: edge.selectable ?? true,
    focusable: edge.focusable ?? true,
    deletable: edge.deletable ?? true,
    reconnectable: edge.reconnectable ?? true,
    interactionWidth: edge.interactionWidth ?? 24,
    markerStart: undefined,
    markerEnd: arrowMarker(color),
    style: { ...style, ...edge.style, stroke: style.stroke, strokeWidth: style.strokeWidth },
    data: { ...edge.data, sourceColor: color },
  };
}

export function syncEdgesWithSourceColors(nodes: Node<CardNodeData>[], edges: Edge[]): Edge[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return edges.map((edge) => normalizeFlowEdge(edge, byId.get(edge.source)?.data.color));
}

/** Точка, откуда потянули, всегда source — стрелка (markerEnd) на target. */
export function connectionFromDragStart(
  connection: Connection,
  dragStartNodeId: string | null,
): Connection {
  const { source, target, sourceHandle, targetHandle } = connection;
  if (!source || !target || !dragStartNodeId || source === target) return connection;
  if (source === dragStartNodeId) return connection;
  if (target === dragStartNodeId) {
    return {
      source: target,
      target: source,
      sourceHandle: targetHandle,
      targetHandle: sourceHandle,
    };
  }
  return connection;
}

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
export function applyConnection(
  edges: Edge[],
  connection: Connection,
  nodes: Node<CardNodeData>[],
): Edge[] {
  const { source, target, sourceHandle, targetHandle } = connection;
  if (!source || !target || source === target) return edges;

  const sourceColor = nodes.find((node) => node.id === source)?.data.color;
  const idx = edges.findIndex((edge) => isSameNodePair(edge.source, edge.target, source, target));

  const nextEdge: Edge = normalizeFlowEdge(
    {
      id: idx >= 0 ? edges[idx].id : createId('edge'),
      source,
      target,
      sourceHandle,
      targetHandle,
    },
    sourceColor,
  );

  if (idx >= 0) {
    return edges.map((edge, i) => (i === idx ? { ...edges[idx], ...nextEdge } : edge));
  }

  return [...edges, nextEdge];
}
