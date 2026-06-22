import { describe, expect, it } from 'vitest';
import type { Node } from '@xyflow/react';
import type { CardNodeData } from '../types/jsonCanvas';
import {
  GROUP_RESIZE_MIN,
  applyGroupResizeToNodes,
  centerInsideGroup,
  createGroupResizeSnapshot,
  nodeSize,
  nodesInsideGroupTree,
  nodesToResizeWithGroup,
} from './groupResize';

function textNode(
  id: string,
  x: number,
  y: number,
  w = 200,
  h = 100,
  selected = false,
): Node<CardNodeData> {
  return {
    id,
    type: 'textCard',
    position: { x, y },
    width: w,
    height: h,
    selected,
    data: { canvasType: 'text', text: id, label: id },
  };
}

function groupNode(
  id: string,
  x: number,
  y: number,
  w = 400,
  h = 300,
  selected = false,
): Node<CardNodeData> {
  return {
    id,
    type: 'groupCard',
    position: { x, y },
    width: w,
    height: h,
    selected,
    data: { canvasType: 'group', label: id },
  };
}

describe('nodesInsideGroupTree', () => {
  it('includes text cards whose center is inside the root group', () => {
    const root = groupNode('g1', 0, 0, 400, 300);
    const inside = textNode('c1', 50, 50);
    const outside = textNode('c2', 500, 50);
    const nodes = [root, inside, outside];

    const insideIds = nodesInsideGroupTree(root, nodes).map((n) => n.id);
    expect(insideIds).toContain('c1');
    expect(insideIds).not.toContain('c2');
    expect(insideIds).not.toContain('g1');
  });

  it('includes nested groups and their contents recursively', () => {
    const root = groupNode('root', 0, 0, 600, 500);
    const nested = groupNode('nested', 80, 80, 200, 160);
    const innerCard = textNode('inner', 120, 120, 120, 80);
    const nodes = [root, nested, innerCard];

    const ids = nodesInsideGroupTree(root, nodes).map((n) => n.id);
    expect(ids).toEqual(expect.arrayContaining(['nested', 'inner']));
  });
});

describe('nodesToResizeWithGroup', () => {
  it('returns only selected nodes inside the group', () => {
    const root = groupNode('g1', 0, 0, 400, 300);
    const selected = textNode('sel', 50, 50, 200, 100, true);
    const unselected = textNode('unsel', 150, 150, 200, 100, false);
    const nodes = [root, selected, unselected];

    const ids = nodesToResizeWithGroup(root, nodes).map((n) => n.id);
    expect(ids).toEqual(['sel']);
  });

  it('includes full subtree when a nested group is selected', () => {
    const root = groupNode('root', 0, 0, 600, 500);
    const nested = groupNode('nested', 80, 80, 200, 160, true);
    const innerCard = textNode('inner', 120, 120, 120, 80, false);
    const nodes = [root, nested, innerCard];

    const ids = nodesToResizeWithGroup(root, nodes).map((n) => n.id);
    expect(ids).toEqual(expect.arrayContaining(['nested', 'inner']));
  });
});

describe('createGroupResizeSnapshot + applyGroupResizeToNodes', () => {
  it('scales text cards proportionally when the root group is resized', () => {
    const root = groupNode('g1', 100, 100, 400, 300);
    const card = textNode('c1', 200, 175, 200, 100, true);
    const nodes = [root, card];

    const snapshot = createGroupResizeSnapshot(root, nodes);
    const next = applyGroupResizeToNodes(nodes, snapshot, {
      x: 100,
      y: 100,
      width: 800,
      height: 600,
    });

    const resizedCard = next.find((n) => n.id === 'c1')!;
    expect(resizedCard.position).toEqual({ x: 300, y: 250 });
    expect(nodeSize(resizedCard)).toEqual({ w: 400, h: 200 });
  });

  it('leaves unselected cards unchanged when the root group is resized', () => {
    const root = groupNode('g1', 100, 100, 400, 300);
    const card = textNode('c1', 200, 175, 200, 100, false);
    const nodes = [root, card];

    const snapshot = createGroupResizeSnapshot(root, nodes);
    expect(snapshot.children).toHaveLength(0);

    const next = applyGroupResizeToNodes(nodes, snapshot, {
      x: 100,
      y: 100,
      width: 800,
      height: 600,
    });

    const unchanged = next.find((n) => n.id === 'c1')!;
    expect(unchanged.position).toEqual(card.position);
    expect(nodeSize(unchanged)).toEqual(nodeSize(card));
  });

  it('scales nested groups and their children from root snapshot', () => {
    const root = groupNode('root', 0, 0, 400, 400);
    const nested = groupNode('nested', 50, 50, 150, 120, true);
    const inner = textNode('inner', 80, 80, 80, 60);
    const nodes = [root, nested, inner];

    const snapshot = createGroupResizeSnapshot(root, nodes);
    expect(snapshot.children.map((c) => c.id)).toEqual(expect.arrayContaining(['nested', 'inner']));

    const next = applyGroupResizeToNodes(nodes, snapshot, {
      x: 0,
      y: 0,
      width: 800,
      height: 800,
    });

    const resizedNested = next.find((n) => n.id === 'nested')!;
    const resizedInner = next.find((n) => n.id === 'inner')!;
    expect(nodeSize(resizedNested)).toEqual({ w: 300, h: 240 });
    expect(resizedInner.position).toEqual({ x: 160, y: 160 });
    expect(nodeSize(resizedInner)).toEqual({ w: 160, h: 120 });
  });

  it('does not change nodes outside the group bbox', () => {
    const root = groupNode('g1', 0, 0, 200, 200);
    const inside = textNode('in', 50, 50, 200, 100, true);
    const outside = textNode('out', 400, 50);
    const nodes = [root, inside, outside];

    const snapshot = createGroupResizeSnapshot(root, nodes);
    const next = applyGroupResizeToNodes(nodes, snapshot, {
      x: 0,
      y: 0,
      width: 400,
      height: 400,
    });

    const unchanged = next.find((n) => n.id === 'out')!;
    expect(unchanged.position).toEqual(outside.position);
    expect(nodeSize(unchanged)).toEqual(nodeSize(outside));
  });

  it('enforces minimum sizes for text cards and nested groups', () => {
    const root = groupNode('g1', 0, 0, 400, 400);
    const tinyText = textNode('text', 150, 150, 200, 100, true);
    const tinyGroup = groupNode('sub', 160, 160, 180, 140, true);
    const nodes = [root, tinyText, tinyGroup];

    const snapshot = createGroupResizeSnapshot(root, nodes);
    const next = applyGroupResizeToNodes(nodes, snapshot, {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
    });

    const text = next.find((n) => n.id === 'text')!;
    const sub = next.find((n) => n.id === 'sub')!;
    expect(nodeSize(text).w).toBeGreaterThanOrEqual(GROUP_RESIZE_MIN.textWidth);
    expect(nodeSize(text).h).toBeGreaterThanOrEqual(GROUP_RESIZE_MIN.textHeight);
    expect(nodeSize(sub).w).toBeGreaterThanOrEqual(GROUP_RESIZE_MIN.groupWidth);
    expect(nodeSize(sub).h).toBeGreaterThanOrEqual(GROUP_RESIZE_MIN.groupHeight);
  });
});

describe('centerInsideGroup', () => {
  it('uses node center for inclusion test', () => {
    const card = textNode('c', 0, 0, 100, 100);
    expect(centerInsideGroup(card, { x: 40, y: 40, w: 30, h: 30 })).toBe(true);
    expect(centerInsideGroup(card, { x: 200, y: 200, w: 50, h: 50 })).toBe(false);
  });
});
