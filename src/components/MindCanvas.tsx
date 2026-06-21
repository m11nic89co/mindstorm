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
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CanvasActionsContext } from '../context/canvasActions';
import { SaveBoardModal } from './FileModals';
import { DemoSplash, DEMO_WELCOME_SEEN_KEY } from './DemoSplash';
import { Toast } from './Toast';
import { canvasToFlow, flowToCanvas, EMPTY_CANVAS } from '../lib/jsonCanvas';
import { applyConnection, connectionFromDragStart, FLOW_EDGE_STYLE, setEdgeLabel, strokeForNodeColor, syncEdgesWithSourceColors } from '../lib/flowEdges';
import { DEMO_BOARD_NAME, demoFlowPresentation, demoStats } from '../lib/demoCanvas';
import { createId } from '../lib/id';
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
  canUseSaveFilePicker,
  readBoardFromFile,
  saveBoardToDisk,
  saveSuccessMessage,
  titleFromFilename,
} from '../lib/localBoardFile';
import type { CardNodeData, JsonCanvas } from '../types/jsonCanvas';
import { HintBar, EdgeSelectionPanel, SelectionPanel, Toolbar } from './Toolbar';
import { GroupCardNode, TextCardNode } from './nodes/CardNodes';
import { useCanvasHistory } from '../hooks/useCanvasHistory';
import { useCanvasShortcuts } from '../hooks/useCanvasShortcuts';
import { useDebouncedPersist } from '../hooks/useDebouncedPersist';
import { useRightClickMarquee } from '../hooks/useRightClickMarquee';

const nodeTypes: NodeTypes = {
  textCard: TextCardNode,
  groupCard: GroupCardNode,
};

function MindCanvasInner() {
  const initialFlow = useMemo(() => canvasToFlow(loadStoredCanvas()), []);
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
  const { screenToFlowPosition, fitView } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const connectStartNodeRef = useRef<string | null>(null);
  nodesRef.current = nodes;
  edgesRef.current = edges;
  const toastTimer = useRef<number | undefined>(undefined);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [connectLineStyle, setConnectLineStyle] = useState(FLOW_EDGE_STYLE);
  const [canvasDragging, setCanvasDragging] = useState(false);
  const [demoRevealing, setDemoRevealing] = useState(false);
  const [demoSplash, setDemoSplash] = useState(false);
  const demoStatsMemo = useMemo(() => demoStats(), []);
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

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 4500);
  }, []);

  useEffect(() => writeBoardName(activeBoardName), [activeBoardName]);

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
        const nextNodes = nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
        if ('color' in patch) {
          setEdges((eds) => syncEdgesWithSourceColors(nextNodes, eds));
        }
        return nextNodes;
      });
    },
    [setNodes, setEdges],
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
      setEdges((eds) => eds.map((edge) => (edge.id === edgeId ? setEdgeLabel(edge, label) : edge)));
    },
    [setEdges],
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
    (position?: { x: number; y: number }) => {
      const center = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      const node: Node<CardNodeData> = {
        id: createId('text'),
        type: 'textCard',
        position: position ?? { x: center.x - 130, y: center.y - 60 },
        style: { width: 260, height: 120 },
        data: {
          canvasType: 'text',
          text: '## Новая идея\nОпишите мысль...',
          color: '5',
        },
        zIndex: 1,
      };
      setNodes((nds) => [...nds, node]);
    },
    [screenToFlowPosition, setNodes],
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
      data: { canvasType: 'group', label: 'Группа', color: '5' },
      zIndex: -1,
      selectable: true,
      draggable: true,
    };
    setNodes((nds) => [node, ...nds]);
  }, [screenToFlowPosition, setNodes]);

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
        addTextCard({ x: position.x - 130, y: position.y - 60 });
        return;
      }

      paneClickRef.current = { time: now, x: event.clientX, y: event.clientY };
    },
    [addTextCard, screenToFlowPosition],
  );

  const applyFlow = useCallback(
    (flow: { nodes: Node<CardNodeData>[]; edges: Edge[] }) => {
      const syncedEdges = syncEdgesWithSourceColors(flow.nodes, flow.edges);
      setNodes(flow.nodes);
      setEdges(syncedEdges);
      resetHistory(flow.nodes, syncedEdges);
    },
    [resetHistory, setEdges, setNodes],
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
    const ok = window.confirm(
      'Создать пустую схему?\n\nТекущую доску можно вернуть кнопкой «Отменить» (Ctrl+Z).',
    );
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
  }, [commitNow, setEdges, setNodes]);

  const onReset = useCallback(() => {
    const flow = demoFlowPresentation();
    applyFlow(flow);
    setActiveBoardName(DEMO_BOARD_NAME);
    setLoadError(null);
    setDemoRevealing(true);
    setDemoSplash(true);

    window.setTimeout(() => {
      void fitView({ padding: 0.1, duration: 1100, maxZoom: 1.05 });
    }, 60);

    window.setTimeout(() => setDemoRevealing(false), 2800);
  }, [applyFlow, fitView]);

  const onSave = useCallback(async () => {
    const title = activeBoardName?.trim() || 'моя-схема';

    if (canUseSaveFilePicker()) {
      try {
        const result = await saveBoardToDisk(title, flowToCanvas(nodes, edges));
        const savedTitle = titleFromFilename(result.filename);
        setActiveBoardName(savedTitle);
        showToast(saveSuccessMessage(result));
        return;
      } catch (err) {
        if (err instanceof SaveCancelledError) return;
      }
    }

    setSaveModalOpen(true);
  }, [activeBoardName, nodes, edges, showToast]);

  const onPickFile = useCallback(() => {
    setLoadError(null);
    fileInputRef.current?.click();
  }, []);

  const onFileSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      try {
        const { title, canvas } = await readBoardFromFile(file);
        loadCanvas(canvas, title);
        showToast(`Открыто: ${file.name}`);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Не удалось загрузить файл');
      }
    },
    [loadCanvas, showToast],
  );

  const deleteSelection = useCallback(() => {
    const hasNode = nodesRef.current.some((node) => node.selected);
    const hasEdge = edgesRef.current.some((edge) => edge.selected);
    if (!hasNode && !hasEdge) return;

    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  }, [setEdges, setNodes]);

  useCanvasShortcuts({ undo, redo, onDeleteSelection: deleteSelection });

  const actions = useMemo(() => ({ updateNode }), [updateNode]);

  return (
    <CanvasActionsContext.Provider value={actions}>
      <div
        className="relative h-dvh w-screen overflow-hidden bg-[#0b0d14]"
        data-demo-welcome={demoSplash || undefined}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(99,102,241,0.18),transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(168,85,247,0.12),transparent_50%)]" />

        <Toolbar
          onAddText={() => addTextCard()}
          onAddGroup={addGroup}
          onSave={() => void onSave()}
          onLoad={onPickFile}
          onReset={onReset}
          onNewBoard={onNewBoard}
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

        {selectedNode && !selectedEdge && (
          <SelectionPanel
            nodeType={selectedNode.data.canvasType}
            color={selectedNode.data.color}
            label={selectedNode.data.label}
            onColorChange={(color) => updateNode(selectedNode.id, { color })}
            onLabelChange={(label) => updateNode(selectedNode.id, { label })}
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={BOARD_FILE_ACCEPT}
          className="hidden"
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
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
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
          className={`mind-canvas${demoRevealing ? ' mind-canvas--demo-reveal' : ''}${canvasDragging ? ' mind-canvas--dragging' : ''}`}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(255,255,255,0.06)" />
          <Controls
            showInteractive={false}
            position="bottom-left"
            className="!mb-[calc(3.5rem+env(safe-area-inset-bottom))] !ml-2 !rounded-xl !border !border-white/10 !bg-white/5 !shadow-xl !backdrop-blur-xl [&>button]:!h-8 [&>button]:!w-8 [&>button]:!border-white/10 [&>button]:!bg-transparent [&>button]:!text-white/70 [&>button:hover]:!bg-white/10 sm:!mb-4 sm:!ml-4"
          />
          <MiniMap
            nodeColor={() => 'rgba(99, 102, 241, 0.55)'}
            maskColor="rgba(0,0,0,0.65)"
            className="!mb-[calc(3.5rem+env(safe-area-inset-bottom))] !mr-2 !hidden !rounded-xl !border !border-white/10 !bg-black/40 !backdrop-blur-md sm:!mb-4 sm:!mr-4 sm:!block"
          />
        </ReactFlow>

        <HintBar />

        {saveModalOpen && (
          <SaveBoardModal
            canvas={flowToCanvas(nodes, edges)}
            defaultName={activeBoardName ?? undefined}
            onClose={() => setSaveModalOpen(false)}
            onSaved={(name, message) => {
              setActiveBoardName(name);
              showToast(message);
            }}
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
