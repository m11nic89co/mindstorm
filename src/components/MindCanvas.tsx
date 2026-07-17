import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CanvasActionsContext } from '../context/canvasActions';
import { PrintBoardModal, SaveBoardModal } from './FileModals';
import { DemoSplash, DEMO_WELCOME_SEEN_KEY } from './DemoSplash';
import { Toast } from './Toast';
import { MindSmoothStepEdge } from './edges/MindSmoothStepEdge';
import { canvasToFlow, flowToCanvas, EMPTY_CANVAS } from '../lib/jsonCanvas';
import { applyConnection, connectionFromDragStart, FLOW_EDGE_STYLE, strokeForNodeColor, syncEdgesWithSourceColors } from '../lib/flowEdges';
import { useLocale } from '../i18n/LocaleProvider';
import { readLocale } from '../i18n/localeStorage';
import { messagesFor } from '../i18n/messages';
import { LOCALES } from '../i18n/locales';
import { useTheme } from '../theme/ThemeProvider';
import {
  applyGroupResizeToNodes,
  createGroupResizeSnapshot,
  type GroupResizeSnapshot,
} from '../lib/groupResize';
import { applyGroupNodeInteraction } from '../lib/groupLock';
import {
  DEFAULT_PLAIN_COLOR,
  DEFAULT_PLAIN_FONT_SIZE,
  DOUBLE_CLICK_CARD_COLOR,
} from '../lib/cardTypography';
import { PRINT_SCALE, viewportAtScale } from '../lib/printLayout';
import {
  getDemoBoardName,
  demoFlowPresentation,
  demoStats,
  isDemoBoardName,
} from '../lib/demoCanvas';
import {
  materializeEdgeLocale,
  materializeNodeLocale,
  syncEdgeI18nOnEdit,
  syncNodeI18nOnEdit,
} from '../lib/nodeLocale';
import { createId } from '../lib/id';
import {
  cloneNodeForPaste,
  isCopyableNode,
  mergePastedNodes,
  PASTE_OFFSET,
} from '../lib/nodeClipboard';
import {
  CANVAS_STORAGE_KEY,
  LEGACY_CANVAS_STORAGE_KEY,
  loadStoredCanvas,
  persistCanvas,
  readBoardName,
  writeBoardName,
} from '../lib/boardStorage';
import {
  BOARD_FILE_ACCEPT,
  SaveCancelledError,
  buildTimestampSaveTitle,
  canUseOpenFilePicker,
  canUseSaveFilePicker,
  openBoardFromDisk,
  readBoardFromFile,
  saveBoardToDisk,
  saveSuccessMessage,
  titleFromFilename,
} from '../lib/localBoardFile';
import { captureBoardPng } from '../lib/exportPng';
import type { CardNodeData, JsonCanvas, NodeI18n } from '../types/jsonCanvas';
import { HintBar, EdgeSelectionPanel, SelectionPanel, Toolbar } from './Toolbar';
import { GroupCardNode, PlainTextNode, TextCardNode } from './nodes/CardNodes';
import { useCanvasHistory } from '../hooks/useCanvasHistory';
import { useCanvasShortcuts } from '../hooks/useCanvasShortcuts';
import { useDebouncedPersist } from '../hooks/useDebouncedPersist';
import { useRightClickMarquee } from '../hooks/useRightClickMarquee';
import {
  applyPrintVisibility,
  hasPrintableSelection,
  resolvePrintFragment,
  type PrintScope,
} from '../lib/printBoard';

const nodeTypes: NodeTypes = {
  textCard: TextCardNode,
  plainText: PlainTextNode,
  groupCard: GroupCardNode,
};

const edgeTypes: EdgeTypes = {
  smoothstep: MindSmoothStepEdge,
};

function MindCanvasInner() {
  const { locale, m } = useLocale();
  const { theme, setPrintLight } = useTheme();
  const initialFlow = useMemo(() => {
    const loc = readLocale();
    const flow = canvasToFlow(loadStoredCanvas());
    const nodes = flow.nodes.map((node) => ({
      ...node,
      data: materializeNodeLocale(node.data, loc),
    }));
    const edges = syncEdgesWithSourceColors(
      nodes,
      flow.edges.map((edge) => materializeEdgeLocale(edge, loc)),
    );
    return { nodes, edges };
  }, []);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CardNodeData>>(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
  const dragPausedRef = useRef(false);
  const { canUndo, canRedo, undo, redo, resetHistory, commitNow } = useCanvasHistory(
    nodes,
    edges,
    setNodes,
    setEdges,
    dragPausedRef,
  );
  const { screenToFlowPosition, fitView, getViewport, setViewport } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const connectStartNodeRef = useRef<string | null>(null);
  const groupResizeSnapshotRef = useRef<GroupResizeSnapshot | null>(null);
  const groupResizeLatestNodesRef = useRef<Node<CardNodeData>[] | null>(null);
  const nodeClipboardRef = useRef<Node<CardNodeData>[] | null>(null);
  const pasteGenerationRef = useRef(0);
  nodesRef.current = nodes;
  edgesRef.current = edges;
  const toastTimer = useRef<number | undefined>(undefined);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRestoreRef = useRef<{
    nodes: Node<CardNodeData>[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [connectLineStyle, setConnectLineStyle] = useState(FLOW_EDGE_STYLE);
  const [canvasDragging, setCanvasDragging] = useState(false);
  const [groupResizingId, setGroupResizingId] = useState<string | null>(null);
  const [demoRevealing, setDemoRevealing] = useState(false);
  const [demoSplash, setDemoSplash] = useState(false);
  const demoStatsMemo = useMemo(() => demoStats(locale), [locale]);
  const [activeBoardName, setActiveBoardName] = useState<string | null>(() => readBoardName());

  useDebouncedPersist(nodes, edges, dragPausedRef);

  useRightClickMarquee({ setNodes, setEdges, screenToFlowPosition });

  const selectedNode = nodes.find((n) => n.selected);
  const selectedEdge = edges.find((e) => e.selected);

  const onNodeDragStart = useCallback(() => {
    dragPausedRef.current = true;
    setCanvasDragging(true);
  }, []);

  const onNodeDragStop = useCallback(() => {
    dragPausedRef.current = false;
    setCanvasDragging(false);
    commitNow();
    persistCanvas(nodesRef.current, edgesRef.current);
  }, [commitNow]);

  const onGroupResizeStart = useCallback((groupId: string) => {
    const group = nodesRef.current.find((n) => n.id === groupId);
    if (!group || group.data.locked) return;
    dragPausedRef.current = true;
    setGroupResizingId(groupId);
    groupResizeLatestNodesRef.current = null;
    groupResizeSnapshotRef.current = createGroupResizeSnapshot(group, nodesRef.current);
  }, []);

  const onGroupResize = useCallback(
    (groupId: string, params: { x: number; y: number; width: number; height: number }) => {
      const snapshot = groupResizeSnapshotRef.current;
      if (!snapshot || snapshot.groupId !== groupId) return;
      const group = nodesRef.current.find((n) => n.id === groupId);
      setNodes((nds) => {
        const next = applyGroupResizeToNodes(nds, snapshot, {
          x: params.x ?? group?.position.x ?? snapshot.groupX,
          y: params.y ?? group?.position.y ?? snapshot.groupY,
          width: params.width,
          height: params.height,
        });
        groupResizeLatestNodesRef.current = next;
        nodesRef.current = next;
        return next;
      });
    },
    [setNodes],
  );

  const onGroupResizeEnd = useCallback(
    (_groupId: string) => {
      const finalNodes = groupResizeLatestNodesRef.current ?? nodesRef.current;
      groupResizeLatestNodesRef.current = null;
      groupResizeSnapshotRef.current = null;
      nodesRef.current = finalNodes;
      dragPausedRef.current = false;
      setGroupResizingId(null);
      commitNow({ nodes: finalNodes });
      persistCanvas(finalNodes, edgesRef.current);
    },
    [commitNow],
  );

  const hasSelectedGroup = useMemo(
    () =>
      nodes.some(
        (node) => node.selected && node.type === 'groupCard' && !node.data.locked,
      ),
    [nodes],
  );

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 4500);
  }, []);

  useEffect(() => writeBoardName(activeBoardName), [activeBoardName]);

  const localeRef = useRef(locale);
  useEffect(() => {
    if (localeRef.current === locale) return;
    localeRef.current = locale;

    setNodes((nds) => nds.map((node) => ({ ...node, data: materializeNodeLocale(node.data, locale) })));
    setEdges((eds) => {
      const materialized = eds.map((edge) => materializeEdgeLocale(edge, locale));
      return syncEdgesWithSourceColors(nodesRef.current, materialized);
    });
    setActiveBoardName((name) => (name && isDemoBoardName(name) ? getDemoBoardName(locale) : name));
  }, [locale, setEdges, setNodes]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(CANVAS_STORAGE_KEY) || localStorage.getItem(LEGACY_CANVAS_STORAGE_KEY)) {
        return;
      }
      if (localStorage.getItem(DEMO_WELCOME_SEEN_KEY)) return;
    } catch {
      return;
    }
    setDemoSplash(true);
  }, []);

  const closeDemoSplash = useCallback(() => {
    setDemoSplash(false);
    try {
      localStorage.setItem(DEMO_WELCOME_SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const updateNode = useCallback(
    (id: string, patch: Partial<CardNodeData>) => {
      setNodes((nds) => {
        const nextNodes = nds.map((n) => {
          if (n.id !== id) return n;
          const next = { ...n, data: syncNodeI18nOnEdit(n.data, locale, patch) };
          return n.type === 'groupCard' ? applyGroupNodeInteraction(next) : next;
        });
        if ('color' in patch) {
          setEdges((eds) => syncEdgesWithSourceColors(nextNodes, eds));
        }
        return nextNodes;
      });
    },
    [locale, setNodes, setEdges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const oriented = connectionFromDragStart(connection, connectStartNodeRef.current);
      connectStartNodeRef.current = null;
      setEdges((eds) => applyConnection(eds, oriented, nodesRef.current));
    },
    [setEdges],
  );

  const onConnectStart = useCallback(
    (_: MouseEvent | TouchEvent, { nodeId }: { nodeId: string | null }) => {
      connectStartNodeRef.current = nodeId;
      if (!nodeId) {
        setConnectLineStyle(FLOW_EDGE_STYLE);
        return;
      }
      const source = nodesRef.current.find((node) => node.id === nodeId);
      setConnectLineStyle(strokeForNodeColor(source?.data.color));
    },
    [],
  );

  const onConnectEnd = useCallback(() => {
    connectStartNodeRef.current = null;
    setConnectLineStyle(FLOW_EDGE_STYLE);
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((eds) => {
        const next = reconnectEdge(oldEdge, newConnection, eds);
        return syncEdgesWithSourceColors(nodesRef.current, next);
      });
    },
    [setEdges],
  );

  const updateEdgeLabel = useCallback(
    (edgeId: string, label: string) => {
      setEdges((eds) =>
        eds.map((edge) => (edge.id === edgeId ? syncEdgeI18nOnEdit(edge, locale, label) : edge)),
      );
    },
    [locale, setEdges],
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setNodes((nds) => nds.map((node) => ({ ...node, selected: false })));
      setEdges((eds) => eds.map((e) => ({ ...e, selected: e.id === edge.id })));
    },
    [setEdges, setNodes],
  );

  const addTextCard = useCallback(
    (position?: { x: number; y: number }, color = '5') => {
      const center = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      const node: Node<CardNodeData> = {
        id: createId('text'),
        type: 'textCard',
        position: position ?? { x: center.x - 130, y: center.y - 60 },
        style: { width: 260, height: 140 },
        data: {
          canvasType: 'text',
          text: m.card.defaultText,
          label: '',
          i18n: Object.fromEntries(
            LOCALES.map((loc) => [loc, { text: messagesFor(loc).card.defaultText, label: '' }]),
          ) as NodeI18n,
          color: color as CardNodeData['color'],
        },
        zIndex: 1,
      };
      setNodes((nds) => [...nds, node]);
    },
    [m.card.defaultText, screenToFlowPosition, setNodes],
  );

  const addPlainText = useCallback(
    (position?: { x: number; y: number }) => {
      const center = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      const node: Node<CardNodeData> = {
        id: createId('plain'),
        type: 'plainText',
        position: position ?? { x: center.x - 80, y: center.y - 20 },
        style: { width: 200, height: 48 },
        data: {
          canvasType: 'plain',
          text: m.plain.defaultText,
          textFontSize: DEFAULT_PLAIN_FONT_SIZE,
          color: DEFAULT_PLAIN_COLOR,
          i18n: Object.fromEntries(
            LOCALES.map((loc) => [loc, { text: messagesFor(loc).plain.defaultText }]),
          ) as NodeI18n,
        },
        zIndex: 1,
      };
      setNodes((nds) => [...nds, node]);
    },
    [m.plain.defaultText, screenToFlowPosition, setNodes],
  );

  const addGroup = useCallback(() => {
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    const node: Node<CardNodeData> = {
      id: createId('group'),
      type: 'groupCard',
      position: { x: center.x - 200, y: center.y - 120 },
      style: { width: 420, height: 260 },
      data: {
        canvasType: 'group',
        label: m.group.defaultLabel,
        i18n: Object.fromEntries(
          LOCALES.map((loc) => [loc, { label: messagesFor(loc).group.defaultLabel }]),
        ) as NodeI18n,
        color: '5',
      },
      zIndex: -1,
      selectable: true,
      draggable: true,
    };
    setNodes((nds) => [node, ...nds]);
  }, [m.group.defaultLabel, screenToFlowPosition, setNodes]);

  const paneClickRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      setEdges((eds) => eds.map((edge) => ({ ...edge, selected: false })));

      const now = Date.now();
      const prev = paneClickRef.current;

      if (
        prev &&
        now - prev.time < 400 &&
        Math.hypot(event.clientX - prev.x, event.clientY - prev.y) < 12
      ) {
        paneClickRef.current = null;
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        addTextCard({ x: position.x - 130, y: position.y - 60 }, DOUBLE_CLICK_CARD_COLOR);
        return;
      }

      paneClickRef.current = { time: now, x: event.clientX, y: event.clientY };
    },
    [addTextCard, screenToFlowPosition],
  );

  const applyFlow = useCallback(
    (flow: { nodes: Node<CardNodeData>[]; edges: Edge[] }) => {
      const nodes = flow.nodes.map((node) => ({
        ...node,
        data: materializeNodeLocale(node.data, locale),
      }));
      const edges = syncEdgesWithSourceColors(
        nodes,
        flow.edges.map((edge) => materializeEdgeLocale(edge, locale)),
      );
      setNodes(nodes);
      setEdges(edges);
      resetHistory(nodes, edges);
    },
    [locale, resetHistory, setEdges, setNodes],
  );

  const loadCanvas = useCallback(
    (canvas: JsonCanvas, name?: string) => {
      applyFlow(canvasToFlow(canvas));
      setActiveBoardName(name ?? null);
      setLoadError(null);
    },
    [applyFlow],
  );

  const onNewBoard = useCallback(() => {
    const ok = window.confirm(m.confirm.newBoard);
    if (!ok) return;

    commitNow();

    const empty = canvasToFlow(EMPTY_CANVAS);
    const syncedEdges = syncEdgesWithSourceColors(empty.nodes, empty.edges);
    setNodes(empty.nodes);
    setEdges(syncedEdges);

    setActiveBoardName(null);
    setLoadError(null);
    setDemoRevealing(false);
    setDemoSplash(false);
  }, [commitNow, m.confirm.newBoard, setEdges, setNodes]);

  const onReset = useCallback(() => {
    const flow = demoFlowPresentation(locale);
    applyFlow(flow);
    setActiveBoardName(getDemoBoardName(locale));
    setLoadError(null);
    setDemoRevealing(true);
    setDemoSplash(true);

    window.setTimeout(() => {
      void fitView({ padding: 0.1, duration: 1100, maxZoom: 1.05 });
    }, 60);

    window.setTimeout(() => setDemoRevealing(false), 2800);
  }, [applyFlow, fitView, locale]);

  const onSave = useCallback(async () => {
    const title = buildTimestampSaveTitle();
    const canvas = flowToCanvas(nodes, edges);
    const bg = theme === 'light' ? '#eef1f7' : '#0b0d14';

    const runSave = async (pngBlob?: Blob) => {
      const result = await saveBoardToDisk(title, canvas, {
        defaultTitle: m.file.defaultTitle,
        typeDescription: m.file.typeDescription,
        pngTypeDescription: m.file.pngTypeDescription,
        pngBlob,
      });
      const savedTitle = titleFromFilename(result.filename);
      setActiveBoardName(savedTitle);
      showToast(saveSuccessMessage(result, m.file));
    };

    if (canUseSaveFilePicker()) {
      try {
        setIsPrinting(true);
        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => resolve());
        });
        await fitView({ padding: 0.15, duration: 0, maxZoom: 1.25 });
        await new Promise<void>((resolve) => {
          window.setTimeout(() => resolve(), 40);
        });
        const pngBlob = await captureBoardPng({ backgroundColor: bg, pixelRatio: 2 });
        setIsPrinting(false);
        await runSave(pngBlob);
        return;
      } catch (err) {
        setIsPrinting(false);
        if (err instanceof SaveCancelledError) return;
      }
    }

    setSaveModalOpen(true);
  }, [fitView, m.file, nodes, edges, showToast, theme]);

  const onPickFile = useCallback(() => {
    setLoadError(null);

    if (canUseOpenFilePicker()) {
      void (async () => {
        try {
          const opened = await openBoardFromDisk({
            typeDescription: m.file.typeDescription,
          });
          loadCanvas(opened.canvas, opened.title);
          showToast(m.toast.opened(opened.filename));
        } catch (err) {
          if (err instanceof SaveCancelledError) return;
          if (err instanceof Error && err.message === 'OPEN_PICKER_UNAVAILABLE') {
            fileInputRef.current?.click();
            return;
          }
          setLoadError(m.errors.loadFailed);
        }
      })();
      return;
    }

    fileInputRef.current?.click();
  }, [loadCanvas, m.errors.loadFailed, m.file.typeDescription, m.toast, showToast]);

  const onFileSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      try {
        const { title, canvas } = await readBoardFromFile(file);
        loadCanvas(canvas, title);
        showToast(m.toast.opened(file.name));
      } catch {
        setLoadError(m.errors.loadFailed);
      }
    },
    [loadCanvas, m.errors.loadFailed, m.toast, showToast],
  );

  const deleteSelection = useCallback(() => {
    const hasNode = nodesRef.current.some((node) => node.selected);
    const hasEdge = edgesRef.current.some((edge) => edge.selected);
    if (!hasNode && !hasEdge) return;

    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  }, [setEdges, setNodes]);

  const copySelection = useCallback(() => {
    const selected = nodesRef.current.filter((node) => node.selected && isCopyableNode(node));
    if (!selected.length) return;
    nodeClipboardRef.current = structuredClone(selected);
    pasteGenerationRef.current = 0;
  }, []);

  const pasteClipboard = useCallback(() => {
    const sources = nodeClipboardRef.current;
    if (!sources?.length) return;

    pasteGenerationRef.current += 1;
    const generation = pasteGenerationRef.current;
    const offset = {
      x: PASTE_OFFSET.x * generation,
      y: PASTE_OFFSET.y * generation,
    };

    const pasted = sources.map((source) => {
      const prefix = source.type === 'groupCard' ? 'group' : 'text';
      return cloneNodeForPaste(source, createId(prefix), offset);
    });

    setNodes((nds) => mergePastedNodes(nds, pasted.map((n) => (n.type === 'groupCard' ? applyGroupNodeInteraction(n) : n))));
  }, [setNodes]);

  useCanvasShortcuts({
    undo,
    redo,
    onDeleteSelection: deleteSelection,
    onCopySelection: copySelection,
    onPasteClipboard: pasteClipboard,
  });

  const canPrintSelection = useMemo(
    () => hasPrintableSelection(nodes, edges),
    [nodes, edges],
  );

  const restoreAfterPrint = useCallback(() => {
    const snapshot = printRestoreRef.current;
    printRestoreRef.current = null;
    setIsPrinting(false);
    setPrintLight(false);
    if (!snapshot) {
      dragPausedRef.current = false;
      return;
    }
    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
    setViewport(snapshot.viewport, { duration: 0 });
    window.requestAnimationFrame(() => {
      dragPausedRef.current = false;
    });
  }, [setEdges, setNodes, setPrintLight, setViewport]);

  const runPrint = useCallback(
    (scope: PrintScope) => {
      setPrintModalOpen(false);
      setPrintLight(true);
      setIsPrinting(true);

      const sourceNodes = nodesRef.current;
      const sourceEdges = edgesRef.current;
      const viewport = getViewport();
      printRestoreRef.current = {
        nodes: structuredClone(sourceNodes),
        edges: structuredClone(sourceEdges),
        viewport,
      };

      dragPausedRef.current = true;

      const fragment =
        scope === 'selection' ? resolvePrintFragment(sourceNodes, sourceEdges) : null;
      const prepared = applyPrintVisibility(sourceNodes, sourceEdges, fragment);
      setNodes(prepared.nodes);
      setEdges(prepared.edges);

      const visibleNodes = prepared.nodes.filter((node) => !node.hidden);
      const finish = () => {
        const fitted = getViewport();
        const scaled = viewportAtScale(fitted, PRINT_SCALE, {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });
        setViewport(scaled, { duration: 0 });
        window.setTimeout(() => window.print(), 80);
      };

      window.requestAnimationFrame(() => {
        void fitView({
          nodes: visibleNodes.length ? visibleNodes : undefined,
          padding: 0.08,
          duration: 0,
          maxZoom: 1.75,
        }).then(finish);
      });
    },
    [fitView, getViewport, setEdges, setNodes, setPrintLight, setViewport],
  );

  useEffect(() => {
    const onAfterPrint = () => restoreAfterPrint();
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('afterprint', onAfterPrint);
      if (printRestoreRef.current) restoreAfterPrint();
    };
  }, [restoreAfterPrint]);

  const onPrint = useCallback(() => {
    setPrintModalOpen(true);
  }, []);

  const actions = useMemo(
    () => ({
      updateNode,
      onGroupResizeStart,
      onGroupResize,
      onGroupResizeEnd,
    }),
    [updateNode, onGroupResizeStart, onGroupResize, onGroupResizeEnd],
  );

  const dotsColor = theme === 'light' ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.06)';
  const minimapMask = theme === 'light' ? 'rgba(238, 241, 247, 0.62)' : 'rgba(0, 0, 0, 0.65)';

  return (
    <CanvasActionsContext.Provider value={actions}>
      <div
        className="mind-board-shell relative h-dvh w-screen overflow-hidden"
        style={{ background: 'var(--ms-app-bg)' }}
        data-demo-welcome={demoSplash || undefined}
      >
        <div
          className="mind-board-glow pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 20% 0%, var(--ms-grad-a), transparent 50%), radial-gradient(ellipse at 80% 100%, var(--ms-grad-b), transparent 50%)',
          }}
        />

        <Toolbar
          onAddText={() => addTextCard()}
          onAddPlain={() => addPlainText()}
          onAddGroup={addGroup}
          onSave={() => void onSave()}
          onLoad={onPickFile}
          onReset={onReset}
          onNewBoard={onNewBoard}
          onPrint={onPrint}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          nodeCount={nodes.length}
          edgeCount={edges.length}
          activeBoardName={activeBoardName}
        />

        <DemoSplash
          visible={demoSplash}
          onClose={closeDemoSplash}
          nodeCount={demoStatsMemo.nodes}
          edgeCount={demoStatsMemo.edges}
          groupCount={demoStatsMemo.groups}
        />

        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

        {loadError && (
          <Toast message={loadError} variant="error" onClose={() => setLoadError(null)} />
        )}

        {selectedEdge && (
          <EdgeSelectionPanel
            label={typeof selectedEdge.label === 'string' ? selectedEdge.label : ''}
            onLabelChange={(label) => updateEdgeLabel(selectedEdge.id, label)}
            onClear={() => updateEdgeLabel(selectedEdge.id, '')}
            onDelete={() => deleteEdge(selectedEdge.id)}
          />
        )}

        {selectedNode && !selectedEdge && !selectedNode.data.locked && (
          <SelectionPanel
            nodeType={selectedNode.data.canvasType}
            color={selectedNode.data.color}
            label={selectedNode.data.label}
            text={selectedNode.data.text}
            labelFontSize={selectedNode.data.labelFontSize}
            textFontSize={selectedNode.data.textFontSize}
            onColorChange={(color) => updateNode(selectedNode.id, { color })}
            onLabelChange={(label) => updateNode(selectedNode.id, { label })}
            onTextChange={(text) => updateNode(selectedNode.id, { text })}
            onLabelFontSizeChange={(size) => updateNode(selectedNode.id, { labelFontSize: size })}
            onTextFontSizeChange={(size) => updateNode(selectedNode.id, { textFontSize: size })}
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={BOARD_FILE_ACCEPT}
          className="no-print hidden"
          onChange={(e) => void onFileSelected(e)}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onReconnect={onReconnect}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.02}
          maxZoom={2}
          panOnScroll={false}
          zoomOnScroll
          zoomActivationKeyCode={null}
          zoomOnPinch
          zoomOnDoubleClick={false}
          panOnDrag={[0, 1]}
          selectionOnDrag={false}
          multiSelectionKeyCode="Shift"
          elementsSelectable
          edgesFocusable
          edgesReconnectable
          reconnectRadius={16}
          onlyRenderVisibleElements
          deleteKeyCode={['Backspace', 'Delete']}
          zIndexMode="manual"
          elevateNodesOnSelect={false}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            selectable: true,
            focusable: true,
            deletable: true,
            reconnectable: true,
            interactionWidth: 24,
            style: FLOW_EDGE_STYLE,
          }}
          connectionLineStyle={connectLineStyle}
          proOptions={{ hideAttribution: true }}
          className={`mind-canvas${demoRevealing ? ' mind-canvas--demo-reveal' : ''}${canvasDragging ? ' mind-canvas--dragging' : ''}${hasSelectedGroup ? ' mind-canvas--group-selected' : ''}${groupResizingId ? ' mind-canvas--group-resizing' : ''}`}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color={dotsColor} />
          {!isPrinting && (
            <Controls
              showInteractive={false}
              position="bottom-left"
              className="no-print !mb-[calc(3.5rem+env(safe-area-inset-bottom))] !ml-2 !rounded-xl !border !shadow-xl !backdrop-blur-xl [&>button]:!h-8 [&>button]:!w-8 [&>button]:!border-[var(--ms-panel-border)] [&>button]:!bg-transparent [&>button]:!text-[var(--ms-control-text)] [&>button:hover]:!bg-[var(--ms-btn-hover)] sm:!mb-4 sm:!ml-4"
              style={{
                borderColor: 'var(--ms-panel-border)',
                background: 'var(--ms-control-bg)',
              }}
            />
          )}
          {!isPrinting && (
            <MiniMap
              nodeColor={() => 'rgba(99, 102, 241, 0.55)'}
              maskColor={minimapMask}
              className="no-print mind-minimap !mb-[calc(3.5rem+env(safe-area-inset-bottom))] !mr-2 !hidden !rounded-xl !border !backdrop-blur-md sm:!mb-4 sm:!mr-4 sm:!block"
              style={{
                borderColor: 'var(--ms-panel-border)',
                background: 'var(--ms-minimap-bg)',
              }}
            />
          )}
        </ReactFlow>

        <HintBar />

        {saveModalOpen && (
          <SaveBoardModal
            canvas={flowToCanvas(nodes, edges)}
            onClose={() => setSaveModalOpen(false)}
            onSaved={(name, message) => {
              setActiveBoardName(name);
              showToast(message);
            }}
          />
        )}

        {printModalOpen && (
          <PrintBoardModal
            hasSelection={canPrintSelection}
            onClose={() => setPrintModalOpen(false)}
            onConfirm={runPrint}
          />
        )}
      </div>
    </CanvasActionsContext.Provider>
  );
}

export function MindCanvas() {
  return (
    <ReactFlowProvider>
      <MindCanvasInner />
    </ReactFlowProvider>
  );
}
