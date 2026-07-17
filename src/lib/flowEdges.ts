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
/** Расстояние между параллельными коридорами у узлов (px на единицу lane). */
const LANE_OFFSET_STEP = 18;
/** Сдвиг середины пути для параллельных пар A↔B. */
const LANE_STEP_SHIFT = 0.12;
/**
 * Сдвиг stepPosition для коридоров у стороны узла.
 * Без этого длинный вертикальный/горизонтальный сегмент остаётся на одном centerX
 * (offset симметрично сжимает оба конца → середина не двигается).
 */
const CORRIDOR_STEP_SHIFT = 0.1;
const MIN_PATH_OFFSET = 10;
const MAX_PATH_OFFSET = 96;
const DEFAULT_PATH_OPTIONS = {
  borderRadius: 8,
  offset: BASE_PATH_OFFSET,
  stepPosition: 0.5,
} as const;

type CanvasSide = 'top' | 'right' | 'bottom' | 'left';

function undirectedPairKey(source: string, target: string): string {
  return source < target ? `${source}|${target}` : `${target}|${source}`;
}

function laneForIndex(index: number, total: number): number {
  if (total <= 1) return 0;
  return index - (total - 1) / 2;
}

function sideFromHandle(handleId: string | null | undefined, fallback: CanvasSide): CanvasSide {
  if (!handleId) return fallback;
  const match = handleId.match(/^source-(top|right|bottom|left)/);
  if (match) return match[1] as CanvasSide;
  return fallback;
}

function assignLanesInGroups(
  groups: Map<string, Edge[]>,
  sortGroup: (edges: Edge[], groupKey: string) => Edge[],
): Map<string, number> {
  const laneById = new Map<string, number>();

  for (const [key, group] of groups) {
    if (group.length <= 1) continue;
    const sorted = sortGroup(group, key);
    sorted.forEach((edge, index) => {
      laneById.set(edge.id, laneForIndex(index, sorted.length));
    });
  }

  return laneById;
}

function corridorSortKey(side: CanvasSide): 'x' | 'y' {
  return side === 'left' || side === 'right' ? 'y' : 'x';
}

/**
 * Разводит связи в коридорах у сторон узлов (offset) и параллельные пары (stepPosition).
 * Offset считается runtime — в файл не пишется.
 */
export function assignEdgeLaneOffsets(
  edges: Edge[],
  nodes: Node<CardNodeData>[] = [],
): Edge[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  const pairGroups = new Map<string, Edge[]>();
  const fromGroups = new Map<string, Edge[]>();
  const toGroups = new Map<string, Edge[]>();

  for (const edge of edges) {
    const pairKey = undirectedPairKey(edge.source, edge.target);
    const pairList = pairGroups.get(pairKey) ?? [];
    pairList.push(edge);
    pairGroups.set(pairKey, pairList);

    const fromSide = sideFromHandle(edge.sourceHandle, 'right');
    const fromKey = `from:${edge.source}:${fromSide}`;
    const fromList = fromGroups.get(fromKey) ?? [];
    fromList.push(edge);
    fromGroups.set(fromKey, fromList);

    const toSide = sideFromHandle(edge.targetHandle, 'left');
    const toKey = `to:${edge.target}:${toSide}`;
    const toList = toGroups.get(toKey) ?? [];
    toList.push(edge);
    toGroups.set(toKey, toList);
  }

  const pairLaneById = assignLanesInGroups(pairGroups, (group) =>
    [...group].sort((a, b) => {
      const sigA = `${a.source}:${a.sourceHandle ?? ''}:${a.target}:${a.targetHandle ?? ''}`;
      const sigB = `${b.source}:${b.sourceHandle ?? ''}:${b.target}:${b.targetHandle ?? ''}`;
      return sigA.localeCompare(sigB) || a.id.localeCompare(b.id);
    }),
  );

  const sortByOtherEnd = (role: 'from' | 'to') => (group: Edge[], groupKey: string) => {
    const side = groupKey.split(':')[2] as CanvasSide;
    const axis = corridorSortKey(side);
    return [...group].sort((a, b) => {
      const otherA = role === 'from' ? a.target : a.source;
      const otherB = role === 'from' ? b.target : b.source;
      const posA = nodesById.get(otherA)?.position;
      const posB = nodesById.get(otherB)?.position;
      const va = posA?.[axis] ?? 0;
      const vb = posB?.[axis] ?? 0;
      if (va !== vb) return va - vb;
      return a.id.localeCompare(b.id);
    });
  };

  const fromLaneById = assignLanesInGroups(fromGroups, sortByOtherEnd('from'));
  const toLaneById = assignLanesInGroups(toGroups, sortByOtherEnd('to'));

  return edges.map((edge) => {
    const pairLane = pairLaneById.get(edge.id) ?? 0;
    const fromLane = fromLaneById.get(edge.id) ?? 0;
    const toLane = toLaneById.get(edge.id) ?? 0;
    const corridorLane = fromLane + toLane;

    const offset = Math.min(
      MAX_PATH_OFFSET,
      Math.max(MIN_PATH_OFFSET, BASE_PATH_OFFSET + corridorLane * LANE_OFFSET_STEP),
    );
    const stepPosition = Math.min(
      0.82,
      Math.max(
        0.18,
        0.5 + pairLane * LANE_STEP_SHIFT + corridorLane * CORRIDOR_STEP_SHIFT,
      ),
    );

    if (corridorLane === 0 && pairLane === 0) {
      return { ...edge, pathOptions: { ...DEFAULT_PATH_OPTIONS } };
    }

    return {
      ...edge,
      pathOptions: {
        borderRadius: 8,
        offset,
        stepPosition,
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
  return assignEdgeLaneOffsets(normalized, nodes);
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

  // Одна исходящая связь на точку (handle) — до 16 на карточку / группу
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
  const existing = idx >= 0 ? edges[idx] : undefined;

  const nextEdge: Edge = normalizeFlowEdge(
    {
      id: existing?.id ?? createId('edge'),
      source,
      target,
      sourceHandle,
      targetHandle,
      ...(existing && typeof existing.label === 'string'
        ? edgeLabelProps(existing.label)
        : {}),
      data: existing?.data,
    },
    sourceColor,
  );

  const nextEdges =
    idx >= 0 ? edges.map((edge, i) => (i === idx ? { ...existing, ...nextEdge } : edge)) : [...edges, nextEdge];

  return syncEdgesWithSourceColors(nodes, nextEdges);
}
