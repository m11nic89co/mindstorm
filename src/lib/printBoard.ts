import type { Edge, Node } from '@xyflow/react';
import type { CardNodeData } from '../types/jsonCanvas';

export type PrintScope = 'all' | 'selection';

export type PrintFragment = {
  nodeIds: Set<string>;
  edgeIds: Set<string>;
};

/** Узлы и связи для печати выделенного фрагмента (A). */
export function resolvePrintFragment(
  nodes: Node<CardNodeData>[],
  edges: Edge[],
): PrintFragment | null {
  const selectedNodes = nodes.filter((node) => node.selected);
  const selectedEdges = edges.filter((edge) => edge.selected);
  if (!selectedNodes.length && !selectedEdges.length) return null;

  const nodeIds = new Set(selectedNodes.map((node) => node.id));
  for (const edge of selectedEdges) {
    nodeIds.add(edge.source);
    nodeIds.add(edge.target);
  }

  const edgeIds = new Set<string>();
  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      edgeIds.add(edge.id);
    }
  }
  for (const edge of selectedEdges) {
    edgeIds.add(edge.id);
  }

  return { nodeIds, edgeIds };
}

export function hasPrintableSelection(nodes: Node<CardNodeData>[], edges: Edge[]): boolean {
  return resolvePrintFragment(nodes, edges) !== null;
}

export function applyPrintVisibility(
  nodes: Node<CardNodeData>[],
  edges: Edge[],
  fragment: PrintFragment | null,
): { nodes: Node<CardNodeData>[]; edges: Edge[] } {
  if (!fragment) {
    return {
      nodes: nodes.map((node) => ({ ...node, hidden: false, selected: false })),
      edges: edges.map((edge) => ({ ...edge, hidden: false, selected: false })),
    };
  }

  return {
    nodes: nodes.map((node) => ({
      ...node,
      hidden: !fragment.nodeIds.has(node.id),
      selected: false,
    })),
    edges: edges.map((edge) => ({
      ...edge,
      hidden: !fragment.edgeIds.has(edge.id),
      selected: false,
    })),
  };
}
