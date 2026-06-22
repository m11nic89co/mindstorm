import { describe, expect, it } from 'vitest';
import type { Node } from '@xyflow/react';
import type { CardNodeData } from '../types/jsonCanvas';
import { applyGroupNodeInteraction, isGroupLocked } from './groupLock';

function groupNode(locked = false): Node<CardNodeData> {
  return {
    id: 'g1',
    type: 'groupCard',
    position: { x: 0, y: 0 },
    selected: true,
    draggable: true,
    selectable: true,
    data: { canvasType: 'group', label: 'G', locked },
  };
}

describe('groupLock', () => {
  it('locks group interaction flags', () => {
    const locked = applyGroupNodeInteraction(groupNode(true));
    expect(isGroupLocked(locked.data)).toBe(true);
    expect(locked.draggable).toBe(false);
    expect(locked.selectable).toBe(false);
    expect(locked.selected).toBe(false);
    expect(locked.className).toBe('group-node-locked');
  });

  it('restores interaction when unlocked', () => {
    const unlocked = applyGroupNodeInteraction(groupNode(false));
    expect(unlocked.draggable).toBe(true);
    expect(unlocked.selectable).toBe(true);
    expect(unlocked.className).toBeUndefined();
  });
});
