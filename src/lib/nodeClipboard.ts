import type { Node } from '@xyflow/react';
import type { CardNodeData } from '../types/jsonCanvas';

export const PASTE_OFFSET = { x: 28, y: 28 } as const;

export function isCopyableNode(node: Node<CardNodeData>): boolean {
  return node.type === 'textCard' || node.type === 'plainText' || node.type === 'groupCard';
}

export function cloneNodeForPaste(
  source: Node<CardNodeData>,
  id: string,
  offset: { x: number; y: number },
): Node<CardNodeData> {
  const clone = structuredClone(source);
  clone.id = id;
  clone.position = {
    x: source.position.x + offset.x,
    y: source.position.y + offset.y,
  };
  clone.selected = true;
  return clone;
}

/** Группы — в начало массива (z-index -1), карточки — после них. */
export function mergePastedNodes(
  existing: Node<CardNodeData>[],
  pasted: Node<CardNodeData>[],
): Node<CardNodeData>[] {
  const deselected = existing.map((node) => ({ ...node, selected: false }));
  const groups = pasted.filter((node) => node.type === 'groupCard');
  const cards = pasted.filter((node) => node.type === 'textCard' || node.type === 'plainText');
  return [...groups, ...cards, ...deselected];
}
