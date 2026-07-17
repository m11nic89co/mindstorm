import { describe, expect, it } from 'vitest';
import type { Edge, Node } from '@xyflow/react';
import type { CardNodeData } from '../types/jsonCanvas';
import {
  applyPrintVisibility,
  hasPrintableSelection,
  resolvePrintFragment,
} from './printBoard';

function textNode(id: string, selected = false): Node<CardNodeData> {
  return {
    id,
    type: 'textCard',
    position: { x: 0, y: 0 },
    selected,
    data: { canvasType: 'text', label: id },
  };
}

function edge(id: string, source: string, target: string, selected = false): Edge {
  return { id, source, target, selected };
}

describe('resolvePrintFragment', () => {
  it('returns null when nothing selected', () => {
    const nodes = [textNode('a'), textNode('b')];
    const edges = [edge('e1', 'a', 'b')];
    expect(resolvePrintFragment(nodes, edges)).toBeNull();
    expect(hasPrintableSelection(nodes, edges)).toBe(false);
  });

  it('includes edges between selected nodes', () => {
    const nodes = [textNode('a', true), textNode('b', true), textNode('c')];
    const edges = [edge('e1', 'a', 'b'), edge('e2', 'b', 'c')];
    const fragment = resolvePrintFragment(nodes, edges);
    expect(fragment).not.toBeNull();
    expect([...fragment!.nodeIds].sort()).toEqual(['a', 'b']);
    expect([...fragment!.edgeIds]).toEqual(['e1']);
  });

  it('includes endpoints of a selected edge', () => {
    const nodes = [textNode('a'), textNode('b'), textNode('c')];
    const edges = [edge('e1', 'a', 'b', true), edge('e2', 'b', 'c')];
    const fragment = resolvePrintFragment(nodes, edges);
    expect(fragment).not.toBeNull();
    expect([...fragment!.nodeIds].sort()).toEqual(['a', 'b']);
    expect([...fragment!.edgeIds]).toEqual(['e1']);
  });
});

describe('applyPrintVisibility', () => {
  it('hides nodes and edges outside the fragment', () => {
    const nodes = [textNode('a', true), textNode('b', true), textNode('c')];
    const edges = [edge('e1', 'a', 'b'), edge('e2', 'b', 'c')];
    const fragment = resolvePrintFragment(nodes, edges)!;
    const next = applyPrintVisibility(nodes, edges, fragment);
    expect(next.nodes.find((n) => n.id === 'a')?.hidden).toBe(false);
    expect(next.nodes.find((n) => n.id === 'c')?.hidden).toBe(true);
    expect(next.edges.find((e) => e.id === 'e1')?.hidden).toBe(false);
    expect(next.edges.find((e) => e.id === 'e2')?.hidden).toBe(true);
    expect(next.nodes.every((n) => !n.selected)).toBe(true);
  });
});
