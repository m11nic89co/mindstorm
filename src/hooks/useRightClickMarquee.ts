import { useEffect, useRef } from 'react';
import type { Edge, Node } from '@xyflow/react';
import type { CardNodeData } from '../types/jsonCanvas';

type ScreenRect = { x: number; y: number; w: number; h: number };

type FlowRect = { x: number; y: number; w: number; h: number };

function nodeSize(node: Node<CardNodeData>) {
  return {
    w: Number(node.width ?? node.measured?.width ?? node.style?.width ?? 260),
    h: Number(node.height ?? node.measured?.height ?? node.style?.height ?? 120),
  };
}

function intersects(a: FlowRect, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function isGroupNode(node: Node<CardNodeData>) {
  return node.type === 'groupCard' || node.data.canvasType === 'group';
}

/** Группа попадает в выделение только если рамка касается её границы, а не внутренней области. */
function intersectsGroupBorder(marquee: FlowRect, node: Node<CardNodeData>, border = 10) {
  const { w, h } = nodeSize(node);
  const outer = { x: node.position.x, y: node.position.y, w, h };
  if (!intersects(marquee, outer)) return false;

  const inset = Math.min(border, w / 4, h / 4);
  const inner = {
    x: outer.x + inset,
    y: outer.y + inset,
    w: Math.max(0, w - inset * 2),
    h: Math.max(0, h - inset * 2),
  };

  if (inner.w <= 0 || inner.h <= 0) return true;

  const bands = [
    { x: outer.x, y: outer.y, w: outer.w, h: inner.y - outer.y },
    { x: outer.x, y: inner.y + inner.h, w: outer.w, h: outer.y + outer.h - (inner.y + inner.h) },
    { x: outer.x, y: inner.y, w: inner.x - outer.x, h: inner.h },
    { x: inner.x + inner.w, y: inner.y, w: outer.x + outer.w - (inner.x + inner.w), h: inner.h },
  ];

  return bands.some((band) => band.w > 0 && band.h > 0 && intersects(marquee, band));
}

function nodeHitByMarquee(marquee: FlowRect, node: Node<CardNodeData>) {
  if (isGroupNode(node) && node.data.locked) return false;
  const { w, h } = nodeSize(node);
  if (isGroupNode(node)) return intersectsGroupBorder(marquee, node);
  return intersects(marquee, { x: node.position.x, y: node.position.y, w, h });
}

type UseRightClickMarqueeOptions = {
  setNodes: React.Dispatch<React.SetStateAction<Node<CardNodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number };
  paneSelector?: string;
};

export function useRightClickMarquee({
  setNodes,
  setEdges,
  screenToFlowPosition,
  paneSelector = '.mind-canvas .react-flow__pane',
}: UseRightClickMarqueeOptions) {
  const dragRef = useRef<{ startX: number; startY: number; pointerId: number } | null>(null);
  const setNodesRef = useRef(setNodes);
  const setEdgesRef = useRef(setEdges);
  const screenToFlowRef = useRef(screenToFlowPosition);

  setNodesRef.current = setNodes;
  setEdgesRef.current = setEdges;
  screenToFlowRef.current = screenToFlowPosition;

  useEffect(() => {
    let pane: HTMLElement | null = null;
    let disposed = false;
    let rafId = 0;

    const overlay = document.createElement('div');
    overlay.className =
      'pointer-events-none fixed z-30 border border-cyan-400/40 bg-cyan-400/8 hidden';
    document.body.appendChild(overlay);

    const showMarquee = (rect: ScreenRect) => {
      overlay.style.display = 'block';
      overlay.style.left = `${rect.x}px`;
      overlay.style.top = `${rect.y}px`;
      overlay.style.width = `${rect.w}px`;
      overlay.style.height = `${rect.h}px`;
    };

    const hideMarquee = () => {
      overlay.style.display = 'none';
    };

    const onContextMenu = (event: Event) => event.preventDefault();

    const onPointerDown = (event: PointerEvent) => {
      if (!pane || event.button !== 2) return;
      const target = event.target as HTMLElement;
      if (target.closest('.react-flow__handle')) return;
      if (!pane.contains(target)) return;

      event.preventDefault();
      dragRef.current = { startX: event.clientX, startY: event.clientY, pointerId: event.pointerId };
      showMarquee({ x: event.clientX, y: event.clientY, w: 0, h: 0 });
      pane.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;

      showMarquee({
        x: Math.min(drag.startX, event.clientX),
        y: Math.min(drag.startY, event.clientY),
        w: Math.abs(event.clientX - drag.startX),
        h: Math.abs(event.clientY - drag.startY),
      });
    };

    const finish = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;

      dragRef.current = null;
      hideMarquee();

      if (pane?.hasPointerCapture(event.pointerId)) {
        pane.releasePointerCapture(event.pointerId);
      }

      const dx = Math.abs(event.clientX - drag.startX);
      const dy = Math.abs(event.clientY - drag.startY);
      if (dx < 6 && dy < 6) return;

      const p1 = screenToFlowRef.current({ x: drag.startX, y: drag.startY });
      const p2 = screenToFlowRef.current({ x: event.clientX, y: event.clientY });
      const rect: FlowRect = {
        x: Math.min(p1.x, p2.x),
        y: Math.min(p1.y, p2.y),
        w: Math.abs(p2.x - p1.x),
        h: Math.abs(p2.y - p1.y),
      };

      setNodesRef.current((nodes) => {
        const selectedIds = new Set<string>();
        const nextNodes = nodes.map((node) => {
          const hit = nodeHitByMarquee(rect, node);
          if (hit) selectedIds.add(node.id);
          return { ...node, selected: hit };
        });
        setEdgesRef.current((edges) =>
          edges.map((edge) => ({
            ...edge,
            selected: selectedIds.has(edge.source) && selectedIds.has(edge.target),
          })),
        );
        return nextNodes;
      });
    };

    const attach = (el: HTMLElement) => {
      el.addEventListener('contextmenu', onContextMenu);
      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointermove', onPointerMove);
      el.addEventListener('pointerup', finish);
      el.addEventListener('pointercancel', finish);
    };

    const detach = (el: HTMLElement) => {
      el.removeEventListener('contextmenu', onContextMenu);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', finish);
      el.removeEventListener('pointercancel', finish);
    };

    const bind = () => {
      if (disposed) return;
      const el = document.querySelector(paneSelector) as HTMLElement | null;
      if (!el) {
        rafId = window.requestAnimationFrame(bind);
        return;
      }
      pane = el;
      attach(el);
    };

    bind();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      if (pane) detach(pane);
      overlay.remove();
    };
  }, [paneSelector]);
}
