import type { Node } from '@xyflow/react';
import type { CardNodeData } from '../types/jsonCanvas';

export function isGroupLocked(data: CardNodeData): boolean {
  return data.canvasType === 'group' && data.locked === true;
}

/** Draggable/selectable и CSS для группы по флагу locked. */
export function applyGroupNodeInteraction(node: Node<CardNodeData>): Node<CardNodeData> {
  if (node.type !== 'groupCard') return node;

  const locked = isGroupLocked(node.data);
  return {
    ...node,
    draggable: !locked,
    selectable: !locked,
    className: locked ? 'group-node-locked' : undefined,
    selected: locked ? false : node.selected,
  };
}

export function applyGroupInteractionToNodes(nodes: Node<CardNodeData>[]): Node<CardNodeData>[] {
  return nodes.map((node) => applyGroupNodeInteraction(node));
}
