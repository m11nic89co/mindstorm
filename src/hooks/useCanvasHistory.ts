import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { Edge, Node } from '@xyflow/react';
import type { CardNodeData } from '../types/jsonCanvas';

export type CanvasSnapshot = {
  nodes: Node<CardNodeData>[];
  edges: Edge[];
};

const MAX_HISTORY = 60;
const DEBOUNCE_MS = 380;

function cloneSnapshot(nodes: Node<CardNodeData>[], edges: Edge[]): CanvasSnapshot {
  return {
    nodes: structuredClone(nodes),
    edges: structuredClone(edges),
  };
}

function snapshotsEqual(a: CanvasSnapshot, b: CanvasSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useCanvasHistory(
  nodes: Node<CardNodeData>[],
  edges: Edge[],
  setNodes: Dispatch<SetStateAction<Node<CardNodeData>[]>>,
  setEdges: Dispatch<SetStateAction<Edge[]>>,
) {
  const stackRef = useRef<CanvasSnapshot[]>([cloneSnapshot(nodes, edges)]);
  const pointerRef = useRef(0);
  const applyingRef = useRef(false);
  const debounceRef = useRef<number | undefined>(undefined);
  const [, setRevision] = useState(0);

  const bump = useCallback(() => setRevision((v) => v + 1), []);

  const canUndo = pointerRef.current > 0;
  const canRedo = pointerRef.current < stackRef.current.length - 1;

  const applySnapshot = useCallback(
    (snapshot: CanvasSnapshot) => {
      applyingRef.current = true;
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      window.requestAnimationFrame(() => {
        applyingRef.current = false;
      });
    },
    [setEdges, setNodes],
  );

  const resetHistory = useCallback(
    (nextNodes: Node<CardNodeData>[], nextEdges: Edge[]) => {
      window.clearTimeout(debounceRef.current);
      const snap = cloneSnapshot(nextNodes, nextEdges);
      stackRef.current = [snap];
      pointerRef.current = 0;
      bump();
    },
    [bump],
  );

  useEffect(() => {
    if (applyingRef.current) return;

    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (applyingRef.current) return;

      const snap = cloneSnapshot(nodes, edges);
      const stack = stackRef.current;
      const ptr = pointerRef.current;
      const current = stack[ptr];
      if (current && snapshotsEqual(current, snap)) return;

      let truncated = stack.slice(0, ptr + 1);
      truncated.push(snap);
      if (truncated.length > MAX_HISTORY) {
        truncated = truncated.slice(truncated.length - MAX_HISTORY);
      }
      pointerRef.current = truncated.length - 1;
      stackRef.current = truncated;
      bump();
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(debounceRef.current);
  }, [nodes, edges, bump]);

  const undo = useCallback(() => {
    if (pointerRef.current <= 0) return;
    pointerRef.current -= 1;
    applySnapshot(stackRef.current[pointerRef.current]);
    bump();
  }, [applySnapshot, bump]);

  const redo = useCallback(() => {
    if (pointerRef.current >= stackRef.current.length - 1) return;
    pointerRef.current += 1;
    applySnapshot(stackRef.current[pointerRef.current]);
    bump();
  }, [applySnapshot, bump]);

  return { canUndo, canRedo, undo, redo, resetHistory };
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'TEXTAREA' || tag === 'INPUT' || target.isContentEditable;
}

export function runHistoryShortcut(
  event: KeyboardEvent,
  undo: () => void,
  redo: () => void,
): boolean {
  if (!event.metaKey && !event.ctrlKey) return false;
  if (isTypingTarget(event.target)) return false;

  const key = event.key.toLowerCase();
  if (key === 'z' && !event.shiftKey) {
    event.preventDefault();
    undo();
    return true;
  }
  if (key === 'y' || (key === 'z' && event.shiftKey)) {
    event.preventDefault();
    redo();
    return true;
  }
  return false;
}
