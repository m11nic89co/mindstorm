import type { Node } from '@xyflow/react';
import type { CardNodeData } from '../types/jsonCanvas';

export type FlowRect = { x: number; y: number; w: number; h: number };

export type GroupResizeChildSnapshot = {
  id: string;
  relX: number;
  relY: number;
  relW: number;
  relH: number;
};

export type GroupResizeSnapshot = {
  groupId: string;
  groupX: number;
  groupY: number;
  groupW: number;
  groupH: number;
  children: GroupResizeChildSnapshot[];
};

const MIN_TEXT_WIDTH = 160;
const MIN_TEXT_HEIGHT = 72;
const MIN_GROUP_WIDTH = 220;
const MIN_GROUP_HEIGHT = 120;

export const GROUP_RESIZE_MIN = {
  textWidth: MIN_TEXT_WIDTH,
  textHeight: MIN_TEXT_HEIGHT,
  groupWidth: MIN_GROUP_WIDTH,
  groupHeight: MIN_GROUP_HEIGHT,
} as const;

export function nodeSize(node: Node<CardNodeData>): { w: number; h: number } {
  return {
    w: Number(node.width ?? node.measured?.width ?? node.style?.width ?? 260),
    h: Number(node.height ?? node.measured?.height ?? node.style?.height ?? 120),
  };
}

export function isGroupNode(node: Node<CardNodeData>): boolean {
  return node.type === 'groupCard' || node.data.canvasType === 'group';
}

export function isTextCardNode(node: Node<CardNodeData>): boolean {
  return node.data.canvasType === 'text' || node.type === 'textCard';
}

export function isPlainTextNode(node: Node<CardNodeData>): boolean {
  return node.data.canvasType === 'plain' || node.type === 'plainText';
}

export function isResizableGroupContent(node: Node<CardNodeData>): boolean {
  return isTextCardNode(node) || isPlainTextNode(node) || isGroupNode(node);
}

export function nodeCenter(node: Node<CardNodeData>): { x: number; y: number } {
  const { w, h } = nodeSize(node);
  return { x: node.position.x + w / 2, y: node.position.y + h / 2 };
}

/** Центр узла внутри прямоугольника группы. */
export function centerInsideGroup(card: Node<CardNodeData>, group: FlowRect): boolean {
  const { x: cx, y: cy } = nodeCenter(card);
  return cx >= group.x && cx <= group.x + group.w && cy >= group.y && cy <= group.y + group.h;
}

export function groupFlowRect(group: Node<CardNodeData>): FlowRect {
  const { w, h } = nodeSize(group);
  return { x: group.position.x, y: group.position.y, w, h };
}

/**
 * Все карточки и вложенные группы внутри контейнера (рекурсивно).
 * Координаты снимка всегда относительно rootGroup — единое масштабирование при её resize.
 */
export function nodesInsideGroupTree(
  rootGroup: Node<CardNodeData>,
  nodes: Node<CardNodeData>[],
): Node<CardNodeData>[] {
  const result = new Map<string, Node<CardNodeData>>();
  const containers: Node<CardNodeData>[] = [rootGroup];

  for (const container of containers) {
    const rect = groupFlowRect(container);

    for (const node of nodes) {
      if (node.id === rootGroup.id) continue;
      if (result.has(node.id)) continue;
      if (!isResizableGroupContent(node)) continue;
      if (!centerInsideGroup(node, rect)) continue;

      result.set(node.id, node);
      if (isGroupNode(node)) {
        containers.push(node);
      }
    }
  }

  return Array.from(result.values());
}

export function minSizeForNode(node: Node<CardNodeData>): { w: number; h: number } {
  if (isGroupNode(node)) {
    return { w: MIN_GROUP_WIDTH, h: MIN_GROUP_HEIGHT };
  }
  return { w: MIN_TEXT_WIDTH, h: MIN_TEXT_HEIGHT };
}

/**
 * Узлы, которые масштабируются вместе с группой при resize:
 * — выделенные text-карточки и группы внутри rootGroup;
 * — всё содержимое выделенной вложенной группы (рекурсивно).
 * Невыделенные карточки остаются на месте с прежним размером.
 */
export function nodesToResizeWithGroup(
  rootGroup: Node<CardNodeData>,
  nodes: Node<CardNodeData>[],
): Node<CardNodeData>[] {
  const insideTree = nodesInsideGroupTree(rootGroup, nodes);
  const result = new Map<string, Node<CardNodeData>>();

  for (const node of insideTree) {
    if (!node.selected) continue;
    result.set(node.id, node);
    if (isGroupNode(node)) {
      for (const desc of nodesInsideGroupTree(node, nodes)) {
        result.set(desc.id, desc);
      }
    }
  }

  return Array.from(result.values());
}

export function createGroupResizeSnapshot(
  group: Node<CardNodeData>,
  nodes: Node<CardNodeData>[],
): GroupResizeSnapshot {
  const { w: groupW, h: groupH } = nodeSize(group);
  const groupX = group.position.x;
  const groupY = group.position.y;
  const safeW = groupW > 0 ? groupW : 1;
  const safeH = groupH > 0 ? groupH : 1;

  const children = nodesToResizeWithGroup(group, nodes).map((child) => {
    const { w, h } = nodeSize(child);
    return {
      id: child.id,
      relX: (child.position.x - groupX) / safeW,
      relY: (child.position.y - groupY) / safeH,
      relW: w / safeW,
      relH: h / safeH,
    };
  });

  return {
    groupId: group.id,
    groupX,
    groupY,
    groupW: safeW,
    groupH: safeH,
    children,
  };
}

export function applyGroupResizeToNodes(
  nodes: Node<CardNodeData>[],
  snapshot: GroupResizeSnapshot,
  next: { x: number; y: number; width: number; height: number },
): Node<CardNodeData>[] {
  const gw2 = Math.max(1, next.width);
  const gh2 = Math.max(1, next.height);
  const childById = new Map(snapshot.children.map((child) => [child.id, child]));

  return nodes.map((node) => {
    if (node.id === snapshot.groupId) {
      return {
        ...node,
        position: { x: next.x, y: next.y },
        width: gw2,
        height: gh2,
        style: { ...node.style, width: gw2, height: gh2 },
      };
    }

    const child = childById.get(node.id);
    if (!child) return node;

    const { w: minW, h: minH } = minSizeForNode(node);
    const newW = Math.max(minW, child.relW * gw2);
    const newH = Math.max(minH, child.relH * gh2);
    const newX = next.x + child.relX * gw2;
    const newY = next.y + child.relY * gh2;

    return {
      ...node,
      position: { x: newX, y: newY },
      width: newW,
      height: newH,
      style: { ...node.style, width: newW, height: newH },
    };
  });
}
