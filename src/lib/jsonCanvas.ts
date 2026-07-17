import type { Edge, Node } from '@xyflow/react';
import type {
  CanvasSide,
  CardNodeData,
  EdgeData,
  HandleSlot,
  JsonCanvas,
  JsonCanvasEdge,
  JsonCanvasNode,
} from '../types/jsonCanvas';
import { applyGroupInteractionToNodes } from './groupLock';
import { edgeLabelProps, normalizeFlowEdge, syncEdgesWithSourceColors } from './flowEdges';

function sideToHandle(
  side: CanvasSide | undefined,
  slot: HandleSlot | undefined,
  role: 'source' | 'target',
): string {
  const resolved = side ?? (role === 'source' ? 'right' : 'left');
  return `source-${resolved}-${slot ?? 'a'}`;
}

function handleToSideAndSlot(
  handleId: string | null | undefined,
  fallback: CanvasSide,
): { side: CanvasSide; slot: HandleSlot } {
  if (!handleId) return { side: fallback, slot: 'a' };
  const match = handleId.match(/^source-(top|right|bottom|left)(?:-(a|b|c|d))?$/);
  if (match) {
    return { side: match[1] as CanvasSide, slot: (match[2] as HandleSlot | undefined) ?? 'a' };
  }
  return { side: fallback, slot: 'a' };
}

export function canvasToFlow(canvas: JsonCanvas): { nodes: Node<CardNodeData>[]; edges: Edge[] } {
  const flowNodes = (canvas.nodes ?? []).map((node) => {
    const data: CardNodeData = {
      canvasType: node.type,
      color: node.color,
    };

    if (node.type === 'text') {
      data.text = node.text;
      if (node.label) data.label = node.label;
      if (node.labelFontSize != null) data.labelFontSize = node.labelFontSize;
      if (node.textFontSize != null) data.textFontSize = node.textFontSize;
      if (node.plain === true) data.canvasType = 'plain';
    }
    if (node.type === 'link') data.url = node.url;
    if (node.type === 'group') {
      data.label = node.label;
      if (node.labelFontSize != null) data.labelFontSize = node.labelFontSize;
      if (node.locked === true) data.locked = true;
    }
    if (node.type === 'file') data.file = node.file;
    if (node.i18n) data.i18n = node.i18n;

    const flowType =
      node.type === 'group' ? 'groupCard' : data.canvasType === 'plain' ? 'plainText' : 'textCard';

    return {
      id: node.id,
      type: flowType,
      position: { x: node.x, y: node.y },
      style: { width: node.width, height: node.height },
      data,
      zIndex: node.type === 'group' ? -1 : 1,
    };
  });

  const nodes = applyGroupInteractionToNodes(flowNodes);

  const edges: Edge[] = syncEdgesWithSourceColors(
    nodes,
    (canvas.edges ?? []).map((edge) => {
      const data: EdgeData = {
        ...(edge.i18n ? { i18n: edge.i18n } : {}),
        ...(edge.labelFontSize != null ? { labelFontSize: edge.labelFontSize } : {}),
        ...(edge.labelColor != null ? { labelColor: edge.labelColor } : {}),
      };
      return normalizeFlowEdge({
        id: edge.id,
        source: edge.fromNode,
        target: edge.toNode,
        sourceHandle: sideToHandle(edge.fromSide, edge.fromSlot, 'source'),
        targetHandle: sideToHandle(edge.toSide, edge.toSlot, 'target'),
        ...edgeLabelProps(edge.label),
        data: Object.keys(data).length > 0 ? data : undefined,
      });
    }),
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
    return {
      ...base,
      type: 'group',
      label: node.data.label ?? 'Группа',
      ...(node.data.labelFontSize != null ? { labelFontSize: node.data.labelFontSize } : {}),
      ...(node.data.locked === true ? { locked: true } : {}),
      i18n: node.data.i18n,
    };
  }

  if (node.data.canvasType === 'file') {
    return { ...base, type: 'file', file: node.data.file ?? 'attachment.png' };
  }

  if (node.data.canvasType === 'plain') {
    return {
      ...base,
      type: 'text',
      text: node.data.text ?? '',
      plain: true,
      ...(node.data.textFontSize != null ? { textFontSize: node.data.textFontSize } : {}),
      i18n: node.data.i18n,
    };
  }

  return {
    ...base,
    type: 'text',
    text: node.data.text ?? '',
    label: node.data.label,
    ...(node.data.labelFontSize != null ? { labelFontSize: node.data.labelFontSize } : {}),
    ...(node.data.textFontSize != null ? { textFontSize: node.data.textFontSize } : {}),
    i18n: node.data.i18n,
  };
}

export function flowToCanvas(nodes: Node<CardNodeData>[], edges: Edge[]): JsonCanvas {
  const canvasNodes = nodes
    .slice()
    .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
    .map(flowNodeToCanvas);

  const canvasEdges: JsonCanvasEdge[] = edges.map((edge) => {
    const from = handleToSideAndSlot(edge.sourceHandle, 'right');
    const to = handleToSideAndSlot(edge.targetHandle, 'left');
    const data = edge.data as EdgeData | undefined;
    const i18n = data?.i18n;
    return {
      id: edge.id,
      fromNode: edge.source,
      toNode: edge.target,
      fromSide: from.side,
      fromSlot: from.slot,
      toSide: to.side,
      toSlot: to.slot,
      fromEnd: 'none',
      toEnd: 'arrow',
      label: typeof edge.label === 'string' ? edge.label : undefined,
      color: nodes.find((node) => node.id === edge.source)?.data.color,
      ...(data?.labelFontSize != null ? { labelFontSize: data.labelFontSize } : {}),
      ...(data?.labelColor != null ? { labelColor: data.labelColor } : {}),
      ...(i18n ? { i18n } : {}),
    };
  });

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
