import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { CanvasActionsContext } from '../context/canvasActions';
import {
  canvasToFlow,
  createId,
  DEMO_CANVAS,
  downloadCanvas,
  flowToCanvas,
  parseCanvasFile,
} from '../lib/jsonCanvas';
import type { CardNodeData } from '../types/jsonCanvas';
import { ColorPicker, HintBar, SelectionPanel, Toolbar } from './Toolbar';
import { GroupCardNode, TextCardNode } from './nodes/CardNodes';

const STORAGE_KEY = 'mindshtorm.canvas.v1';

const nodeTypes: NodeTypes = {
  textCard: TextCardNode,
  groupCard: GroupCardNode,
};

function loadInitialState(): { nodes: Node<CardNodeData>[]; edges: Edge[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return canvasToFlow(JSON.parse(raw));
  } catch {
    /* use demo */
  }
  return canvasToFlow(DEMO_CANVAS);
}

function MindCanvasInner() {
  const initial = useMemo(() => loadInitialState(), []);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CardNodeData>>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const { screenToFlowPosition } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  const selectedNode = nodes.find((n) => n.selected);

  const persist = useCallback(
    (nextNodes: Node<CardNodeData>[], nextEdges: Edge[]) => {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(flowToCanvas(nextNodes, nextEdges)));
      }, 400);
    },
    [],
  );

  useEffect(() => {
    persist(nodes, edges);
  }, [nodes, edges, persist]);

  const updateNode = useCallback(
    (id: string, patch: Partial<CardNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      );
    },
    [setNodes],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: createId('edge'),
            type: 'smoothstep',
            style: { stroke: 'rgba(165, 180, 252, 0.65)', strokeWidth: 2 },
          },
          eds,
        ),
      );
    },
    [setEdges],
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
      zIndex: 0,
      selectable: true,
      draggable: true,
    };
    setNodes((nds) => [node, ...nds]);
  }, [screenToFlowPosition, setNodes]);

  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addTextCard({ x: position.x - 130, y: position.y - 60 });
    },
    [addTextCard, screenToFlowPosition],
  );

  const onExport = useCallback(() => {
    downloadCanvas(flowToCanvas(nodes, edges));
  }, [nodes, edges]);

  const onImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const canvas = parseCanvasFile(String(reader.result));
          const flow = canvasToFlow(canvas);
          setNodes(flow.nodes);
          setEdges(flow.edges);
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Ошибка импорта');
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [setEdges, setNodes],
  );

  const onReset = useCallback(() => {
    const flow = canvasToFlow(DEMO_CANVAS);
    setNodes(flow.nodes);
    setEdges(flow.edges);
  }, [setEdges, setNodes]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const active = document.activeElement?.tagName;
        if (active === 'TEXTAREA' || active === 'INPUT') return;
        setNodes((nds) => nds.filter((n) => !n.selected));
        setEdges((eds) => eds.filter((e) => !e.selected));
      }
    },
    [setEdges, setNodes],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const actions = useMemo(() => ({ updateNode }), [updateNode]);

  return (
    <CanvasActionsContext.Provider value={actions}>
      <div className="relative h-screen w-screen overflow-hidden bg-[#0b0d14]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(99,102,241,0.18),transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(168,85,247,0.12),transparent_50%)]" />

        <Toolbar
          onAddText={() => addTextCard()}
          onAddGroup={addGroup}
          onImport={onImportClick}
          onExport={onExport}
          onReset={onReset}
          nodeCount={nodes.length}
          edgeCount={edges.length}
        />

        {selectedNode && (
          <SelectionPanel
            nodeType={selectedNode.data.canvasType}
            color={selectedNode.data.color}
            label={selectedNode.data.label}
            onColorChange={(color) => updateNode(selectedNode.id, { color })}
            onLabelChange={(label) => updateNode(selectedNode.id, { label })}
          />
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDoubleClick={onPaneDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
          maxZoom={2}
          panOnScroll
          zoomOnPinch
          zoomOnDoubleClick={false}
          selectionOnDrag={false}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: 'rgba(165, 180, 252, 0.55)', strokeWidth: 2 },
          }}
          proOptions={{ hideAttribution: true }}
          className="mind-canvas"
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

        <input
          ref={fileInputRef}
          type="file"
          accept=".canvas,application/json"
          className="hidden"
          onChange={onFileChange}
        />
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
