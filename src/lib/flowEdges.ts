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

const BASE_PATH_OFFSET = 20;
const LANE_OFFSET_STEP = 11;
const LANE_STEP_SHIFT = 0.09;

function undirectedPairKey(source: string, target: string): string {
  return source < target ? `${source}|${target}` : `${target}|${source}`;
}

function laneForIndex(index: number, total: number): number {
  if (total <= 1) return 0;
  return index - (total - 1) / 2;
}

/** Разводит параллельные связи между одной парой карточек — offset и stepPosition по «полосам». */
export function assignEdgeLaneOffsets(edges: Edge[]): Edge[] {
  const groups = new Map<string, Edge[]>();

  for (const edge of edges) {
    const key = undirectedPairKey(edge.source, edge.target);
    const list = groups.get(key) ?? [];
    list.push(edge);
    groups.set(key, list);
  }

  const laneById = new Map<string, number>();

  for (const group of groups.values()) {
    if (group.length <= 1) continue;

    const sorted = [...group].sort((a, b) => {
      const sigA = `${a.source}:${a.sourceHandle ?? ''}:${a.target}:${a.targetHandle ?? ''}`;
      const sigB = `${b.source}:${b.sourceHandle ?? ''}:${b.target}:${b.targetHandle ?? ''}`;
      return sigA.localeCompare(sigB) || a.id.localeCompare(b.id);
    });

    sorted.forEach((edge, index) => {
      laneById.set(edge.id, laneForIndex(index, sorted.length));
    });
  }

  return edges.map((edge) => {
    const lane = laneById.get(edge.id);
    if (lane === undefined) return edge;

    if (lane === 0) {
      return {
        ...edge,
        pathOptions: {
          borderRadius: 8,
          offset: BASE_PATH_OFFSET,
          stepPosition: 0.5,
        },
      };
    }

    return {
      ...edge,
      pathOptions: {
        borderRadius: 8,
        offset: Math.max(10, BASE_PATH_OFFSET + lane * LANE_OFFSET_STEP),
        stepPosition: Math.min(0.82, Math.max(0.18, 0.5 + lane * LANE_STEP_SHIFT)),
      },
    };
  });
}

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
  const normalized = edges.map((edge) => normalizeFlowEdge(edge, byId.get(edge.source)?.data.color));
  return assignEdgeLaneOffsets(normalized);
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

function findEdgeIndexForConnection(edges: Edge[], connection: Connection): number {
  const { source, target, sourceHandle, targetHandle } = connection;
  if (!source || !target) return -1;

  // Одна исходящая связь на точку (handle) — до 8 на карточку
  if (sourceHandle) {
    return edges.findIndex((edge) => edge.source === source && edge.sourceHandle === sourceHandle);
  }

  return edges.findIndex(
    (edge) =>
      edge.source === source &&
      edge.target === target &&
      edge.sourceHandle === sourceHandle &&
      edge.targetHandle === targetHandle,
  );
}

/** До одной связи на каждую точку (handle); A→B и B→A — разные связи. */
export function applyConnection(
  edges: Edge[],
  connection: Connection,
  nodes: Node<CardNodeData>[],
): Edge[] {
  const { source, target, sourceHandle, targetHandle } = connection;
  if (!source || !target || source === target) return edges;

  const sourceColor = nodes.find((node) => node.id === source)?.data.color;
  const idx = findEdgeIndexForConnection(edges, connection);

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

  const nextEdges =
    idx >= 0 ? edges.map((edge, i) => (i === idx ? { ...edges[idx], ...nextEdge } : edge)) : [...edges, nextEdge];

  return syncEdgesWithSourceColors(nodes, nextEdges);
}
