import type { Edge, Node } from '@xyflow/react';
import { canvasToFlow } from './jsonCanvas';
import type { CardNodeData, JsonCanvas } from '../types/jsonCanvas';

export const DEMO_BOARD_NAME = 'Демо · Запуск MindStorm';

/** Насыщенная схема «запуск продукта» — показывает группы, связи, цвета и подсказки. */
export const DEMO_CANVAS: JsonCanvas = {
  nodes: [
    {
      id: 'g_scene',
      type: 'group',
      x: 0,
      y: 0,
      width: 1280,
      height: 800,
      color: '6',
      label: 'MindStorm — демо-схема',
    },
    {
      id: 'g_core',
      type: 'group',
      x: 400,
      y: 180,
      width: 420,
      height: 300,
      color: '5',
      label: 'Ядро идеи',
    },
    {
      id: 'hub',
      type: 'text',
      x: 430,
      y: 240,
      width: 340,
      height: 190,
      color: '5',
      label: 'Центр',
      text: '# MindStorm\n\nИнтерактивная доска для брейншторма.\nСвязи, группы, локальные файлы — как в Obsidian Canvas.',
    },
    {
      id: 'g_product',
      type: 'group',
      x: 48,
      y: 160,
      width: 320,
      height: 440,
      color: '11',
      label: 'Продукт',
    },
    {
      id: 'product_features',
      type: 'text',
      x: 78,
      y: 220,
      width: 260,
      height: 180,
      color: '11',
      label: 'Возможности',
      text: '## Возможности\n• 12 цветов карточек и групп\n• 8 точек связи (по 2 на сторону)\n• Подписи на связях · Undo/Redo',
    },
    {
      id: 'product_files',
      type: 'text',
      x: 78,
      y: 420,
      width: 260,
      height: 130,
      color: '11',
      label: 'Файлы',
      text: '## Файлы\n`.mindstorm` · `.canvas`\nАвтосохранение черновика в браузере',
    },
    {
      id: 'g_marketing',
      type: 'group',
      x: 880,
      y: 48,
      width: 340,
      height: 320,
      color: '4',
      label: 'Маркетинг',
    },
    {
      id: 'mkt_audience',
      type: 'text',
      x: 910,
      y: 108,
      width: 280,
      height: 120,
      color: '4',
      text: '## Аудитория\nДизайнеры · PM · студенты\nВизуальное мышление и заметки',
    },
    {
      id: 'mkt_channels',
      type: 'text',
      x: 910,
      y: 260,
      width: 280,
      height: 110,
      color: '4',
      text: '## Каналы\nGitHub Pages · PWA\nДемо — кнопка ↺ · Сначала — пустая доска',
    },
    {
      id: 'g_tech',
      type: 'group',
      x: 880,
      y: 420,
      width: 340,
      height: 320,
      color: '8',
      label: 'Технологии',
    },
    {
      id: 'tech_stack',
      type: 'text',
      x: 910,
      y: 480,
      width: 280,
      height: 110,
      color: '8',
      text: '## Стек\nReact 19 · React Flow\nVite · Tailwind CSS v4',
    },
    {
      id: 'tech_local',
      type: 'text',
      x: 910,
      y: 620,
      width: 280,
      height: 100,
      color: '8',
      text: '## Хранение\nЛокальные файлы на диск\nБез облака и OAuth',
    },
    {
      id: 'g_roadmap',
      type: 'group',
      x: 400,
      y: 530,
      width: 420,
      height: 220,
      color: '3',
      label: 'Следующие шаги',
    },
    {
      id: 'roadmap_mvp',
      type: 'text',
      x: 430,
      y: 590,
      width: 180,
      height: 120,
      color: '3',
      text: '## MVP ✓\nДемо · Save/Load\nJSON Canvas · группы',
    },
    {
      id: 'roadmap_tips',
      type: 'text',
      x: 630,
      y: 580,
      width: 170,
      height: 170,
      color: '3',
      text: '## Управление\nДвойной клик — карточка\nТочка на карточке — связь\nКлик — цвет и название\nПКМ+рамка — выделение',
    },
  ],
  edges: [
    {
      id: 'e_hub_product',
      fromNode: 'hub',
      fromSide: 'left',
      toNode: 'product_features',
      toSide: 'right',
      color: '5',
      label: 'функции',
    },
    {
      id: 'e_hub_mkt',
      fromNode: 'hub',
      fromSide: 'right',
      toNode: 'mkt_audience',
      toSide: 'left',
      color: '4',
      label: 'кому',
    },
    {
      id: 'e_hub_tech',
      fromNode: 'hub',
      fromSide: 'right',
      toNode: 'tech_stack',
      toSide: 'left',
      color: '8',
      label: 'как',
    },
    {
      id: 'e_product_chain',
      fromNode: 'product_features',
      fromSide: 'bottom',
      toNode: 'product_files',
      toSide: 'top',
      color: '11',
    },
    {
      id: 'e_mkt_chain',
      fromNode: 'mkt_audience',
      fromSide: 'bottom',
      toNode: 'mkt_channels',
      toSide: 'top',
      color: '4',
    },
    {
      id: 'e_tech_chain',
      fromNode: 'tech_stack',
      fromSide: 'bottom',
      toNode: 'tech_local',
      toSide: 'top',
      color: '8',
    },
    {
      id: 'e_hub_roadmap',
      fromNode: 'hub',
      fromSide: 'bottom',
      toNode: 'roadmap_mvp',
      toSide: 'top',
      color: '3',
      label: 'план',
    },
    {
      id: 'e_roadmap_tips',
      fromNode: 'roadmap_mvp',
      fromSide: 'right',
      toNode: 'roadmap_tips',
      toSide: 'left',
      color: '3',
    },
    {
      id: 'e_mkt_product',
      fromNode: 'mkt_channels',
      fromSide: 'left',
      toNode: 'product_files',
      toSide: 'right',
      color: '4',
      label: 'распространение',
    },
  ],
};

const REVEAL_STEP_MS = 65;

export function demoFlowPresentation(): {
  nodes: Node<CardNodeData>[];
  edges: Edge[];
} {
  const flow = canvasToFlow(DEMO_CANVAS);

  const nodes = flow.nodes.map((node, index) => ({
    ...node,
    selected: false,
    className: 'demo-reveal',
    style: {
      ...node.style,
      ['--reveal-delay' as string]: `${index * REVEAL_STEP_MS}ms`,
    },
  }));

  const edges = flow.edges.map((edge, index) => ({
    ...edge,
    selected: false,
    className: 'demo-edge-reveal',
    style: {
      ...edge.style,
      ['--reveal-delay' as string]: `${(flow.nodes.length + index) * REVEAL_STEP_MS}ms`,
    },
  }));

  return { nodes, edges };
}

export function demoStats(): { nodes: number; edges: number; groups: number } {
  const nodes = DEMO_CANVAS.nodes ?? [];
  return {
    nodes: nodes.filter((n) => n.type !== 'group').length,
    edges: (DEMO_CANVAS.edges ?? []).length,
    groups: nodes.filter((n) => n.type === 'group').length,
  };
}
