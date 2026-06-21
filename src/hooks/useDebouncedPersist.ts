import { useEffect, useRef, type RefObject } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { persistCanvas } from '../lib/boardStorage';
import type { CardNodeData } from '../types/jsonCanvas';

const PERSIST_MS = 400;

export function useDebouncedPersist(
  nodes: Node<CardNodeData>[],
  edges: Edge[],
  pausedRef?: RefObject<boolean>,
) {
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (pausedRef?.current) return;

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => persistCanvas(nodes, edges), PERSIST_MS);
    return () => window.clearTimeout(timer.current);
  }, [nodes, edges, pausedRef]);
}
