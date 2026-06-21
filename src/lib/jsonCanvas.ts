import type { Edge, Node } from '@xyflow/react';
import { PRESET_COLORS } from './colors';
import type {
  CanvasSide,
  CardNodeData,
  JsonCanvas,
  JsonCanvasEdge,
  JsonCanvasNode,
} from '../types/jsonCanvas';

export function createId(prefix = 'node'): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function sideToHandle(side: CanvasSide | undefined, role: 'source' | 'target'): string {
  const resolved = side ?? (role === 'source' ? 'right' : 'left');
  return `${role}-${resolved}`;
}

function handleToSide(handleId: string | null | undefined, fallback: CanvasSide): CanvasSide {
  if (!handleId) return fallback;
  const side = handleId.split('-').pop();
  if (side === 'top' || side === 'right' || side === 'bottom' || side === 'left') {
    return side;
  }
  return fallback;
}

function edgeStyle(color?: JsonCanvasEdge['color']) {
  if (color && color in PRESET_COLORS) {
    return { stroke: PRESET_COLORS[color].border, strokeWidth: 2 };
  }
  return { stroke: 'rgba(165, 180, 252, 0.55)', strokeWidth: 2 };
}

export function canvasToFlow(canvas: JsonCanvas): { nodes: Node<CardNodeData>[]; edges: Edge[] } {
  const nodes: Node<CardNodeData>[] = (canvas.nodes ?? []).map((node) => {
    const data: CardNodeData = {
      canvasType: node.type,
      color: node.color,
    };

    if (node.type === 'text') data.text = node.text;
    if (node.type === 'link') data.url = node.url;
    if (node.type === 'group') data.label = node.label;
    if (node.type === 'file') data.file = node.file;

    return {
      id: node.id,
      type: node.type === 'group' ? 'groupCard' : 'textCard',
      position: { x: node.x, y: node.y },
      style: { width: node.width, height: node.height },
      data,
      zIndex: node.type === 'group' ? -1 : 1,
    };
  });

  const edges: Edge[] = (canvas.edges ?? []).map((edge) => ({
    id: edge.id,
    source: edge.fromNode,
    target: edge.toNode,
    sourceHandle: sideToHandle(edge.fromSide, 'source'),
    targetHandle: sideToHandle(edge.toSide, 'target'),
    label: edge.label,
    type: 'smoothstep',
    animated: true,
    style: edgeStyle(edge.color),
    labelStyle: { fill: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 500 },
    labelBgStyle: { fill: 'rgba(11, 13, 20, 0.88)', fillOpacity: 1 },
    labelBgPadding: [6, 10] as [number, number],
    labelBgBorderRadius: 8,
    data: { color: edge.color },
  }));

  return { nodes, edges };
}

function flowNodeToCanvas(node: Node<CardNodeData>): JsonCanvasNode {
  const width = Math.round(
    Number(node.width ?? node.style?.width ?? node.measured?.width ?? 260),
  );
  const height = Math.round(
    Number(node.height ?? node.style?.height ?? node.measured?.height ?? 120),
  );
  const base = {
    id: node.id,
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
    width,
    height,
    color: node.data.color,
  };

  if (node.data.canvasType === 'link') {
    return { ...base, type: 'link', url: node.data.url ?? 'https://' };
  }

  if (node.data.canvasType === 'group') {
    return { ...base, type: 'group', label: node.data.label ?? 'Группа' };
  }

  if (node.data.canvasType === 'file') {
    return { ...base, type: 'file', file: node.data.file ?? 'attachment.png' };
  }

  return { ...base, type: 'text', text: node.data.text ?? '' };
}

export function flowToCanvas(nodes: Node<CardNodeData>[], edges: Edge[]): JsonCanvas {
  const canvasNodes = nodes
    .slice()
    .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
    .map(flowNodeToCanvas);

  const canvasEdges: JsonCanvasEdge[] = edges.map((edge) => ({
    id: edge.id,
    fromNode: edge.source,
    toNode: edge.target,
    fromSide: handleToSide(edge.sourceHandle, 'right'),
    toSide: handleToSide(edge.targetHandle, 'left'),
    fromEnd: 'none',
    toEnd: 'arrow',
    label: typeof edge.label === 'string' ? edge.label : undefined,
    color: edge.data?.color as JsonCanvasEdge['color'],
  }));

  return { nodes: canvasNodes, edges: canvasEdges };
}

export function parseCanvasFile(content: string): JsonCanvas {
  const parsed = JSON.parse(content) as JsonCanvas;
  if (!parsed || (typeof parsed !== 'object')) {
    throw new Error('Неверный формат .canvas');
  }
  return parsed;
}

export const EMPTY_CANVAS: JsonCanvas = { nodes: [], edges: [] };

export { DEMO_CANVAS, DEMO_BOARD_NAME } from './demoCanvas';
