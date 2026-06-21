import type { Edge, Node } from '@xyflow/react';
import type {
  CanvasSide,
  CardNodeData,
  JsonCanvas,
  JsonCanvasEdge,
  JsonCanvasNode,
} from '../types/jsonCanvas';
import { edgeLabelProps, normalizeFlowEdge, syncEdgesWithSourceColors } from './flowEdges';

function sideToHandle(side: CanvasSide | undefined, role: 'source' | 'target'): string {
  const resolved = side ?? (role === 'source' ? 'right' : 'left');
  return `source-${resolved}-a`;
}

function handleToSide(handleId: string | null | undefined, fallback: CanvasSide): CanvasSide {
  if (!handleId) return fallback;
  const match = handleId.match(/(?:^source-|^target-)(top|right|bottom|left)/);
  if (match) return match[1] as CanvasSide;
  return fallback;
}

export function canvasToFlow(canvas: JsonCanvas): { nodes: Node<CardNodeData>[]; edges: Edge[] } {
  const nodes: Node<CardNodeData>[] = (canvas.nodes ?? []).map((node) => {
    const data: CardNodeData = {
      canvasType: node.type,
      color: node.color,
    };

    if (node.type === 'text') {
      data.text = node.text;
      if (node.label) data.label = node.label;
    }
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

  const edges: Edge[] = syncEdgesWithSourceColors(
    nodes,
    (canvas.edges ?? []).map((edge) =>
      normalizeFlowEdge({
        id: edge.id,
        source: edge.fromNode,
        target: edge.toNode,
        sourceHandle: sideToHandle(edge.fromSide, 'source'),
        targetHandle: sideToHandle(edge.toSide, 'target'),
        ...edgeLabelProps(edge.label),
      }),
    ),
  );

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

  return { ...base, type: 'text', text: node.data.text ?? '', label: node.data.label };
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
    color: nodes.find((node) => node.id === edge.source)?.data.color,
  }));

  return { nodes: canvasNodes, edges: canvasEdges };
}

export function parseCanvasFile(content: string): JsonCanvas {
  const parsed = JSON.parse(content) as JsonCanvas;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Неверный формат .canvas');
  }
  return parsed;
}

export const EMPTY_CANVAS: JsonCanvas = { nodes: [], edges: [] };

export { DEMO_CANVAS, DEMO_BOARD_NAME } from './demoCanvas';
