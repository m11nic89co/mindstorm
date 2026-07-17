import type { Edge, Node } from '@xyflow/react';
import type { Locale } from '../i18n/locales';
import { LOCALES } from '../i18n/locales';
import { messagesFor } from '../i18n/messages';
import { applyJsonEdgeLocale, applyJsonNodeLocale } from './nodeLocale';
import { enrichDemoCanvasI18n } from './demoLocaleCopies';
import { canvasToFlow } from './jsonCanvas';
import type { CardNodeData, EdgeI18n, JsonCanvas, JsonCanvasEdge, JsonCanvasNode, NodeI18n } from '../types/jsonCanvas';

const DEMO_CANVAS_RU: JsonCanvas = {
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
      text: '## Возможности\n• 12 цветов карточек и групп\n• 16 точек связи (по 4 на сторону)\n• Подписи на связях · Undo/Redo · RU/EN',
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
      text: '## Каналы\nGitHub Pages · PWA\n↺ Сначала — пустая доска · Демо — пример',
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

const DEMO_CANVAS_EN: JsonCanvas = {
  nodes: [
    {
      id: 'g_scene',
      type: 'group',
      x: 0,
      y: 0,
      width: 1280,
      height: 800,
      color: '6',
      label: 'MindStorm — demo board',
    },
    {
      id: 'g_core',
      type: 'group',
      x: 400,
      y: 180,
      width: 420,
      height: 300,
      color: '5',
      label: 'Core idea',
    },
    {
      id: 'hub',
      type: 'text',
      x: 430,
      y: 240,
      width: 340,
      height: 190,
      color: '5',
      label: 'Hub',
      text: '# MindStorm\n\nAn interactive board for brainstorming.\nConnections, groups, and local files — like Obsidian Canvas.',
    },
    {
      id: 'g_product',
      type: 'group',
      x: 48,
      y: 160,
      width: 320,
      height: 440,
      color: '11',
      label: 'Product',
    },
    {
      id: 'product_features',
      type: 'text',
      x: 78,
      y: 220,
      width: 260,
      height: 180,
      color: '11',
      label: 'Features',
      text: '## Features\n• 12 colors for cards & groups\n• 16 connection points (4 per side)\n• Edge labels · Undo/Redo · RU/EN',
    },
    {
      id: 'product_files',
      type: 'text',
      x: 78,
      y: 420,
      width: 260,
      height: 130,
      color: '11',
      label: 'Files',
      text: '## Files\n`.mindstorm` · `.canvas`\nDraft auto-save in the browser',
    },
    {
      id: 'g_marketing',
      type: 'group',
      x: 880,
      y: 48,
      width: 340,
      height: 320,
      color: '4',
      label: 'Marketing',
    },
    {
      id: 'mkt_audience',
      type: 'text',
      x: 910,
      y: 108,
      width: 280,
      height: 120,
      color: '4',
      text: '## Audience\nDesigners · PMs · students\nVisual thinking and notes',
    },
    {
      id: 'mkt_channels',
      type: 'text',
      x: 910,
      y: 260,
      width: 280,
      height: 110,
      color: '4',
      text: '## Channels\nGitHub Pages · PWA\n↺ New — blank board · Demo — sample',
    },
    {
      id: 'g_tech',
      type: 'group',
      x: 880,
      y: 420,
      width: 340,
      height: 320,
      color: '8',
      label: 'Technology',
    },
    {
      id: 'tech_stack',
      type: 'text',
      x: 910,
      y: 480,
      width: 280,
      height: 110,
      color: '8',
      text: '## Stack\nReact 19 · React Flow\nVite · Tailwind CSS v4',
    },
    {
      id: 'tech_local',
      type: 'text',
      x: 910,
      y: 620,
      width: 280,
      height: 100,
      color: '8',
      text: '## Storage\nLocal files on disk\nNo cloud or OAuth',
    },
    {
      id: 'g_roadmap',
      type: 'group',
      x: 400,
      y: 530,
      width: 420,
      height: 220,
      color: '3',
      label: 'Next steps',
    },
    {
      id: 'roadmap_mvp',
      type: 'text',
      x: 430,
      y: 590,
      width: 180,
      height: 120,
      color: '3',
      text: '## MVP ✓\nDemo · Save/Open\nJSON Canvas · groups',
    },
    {
      id: 'roadmap_tips',
      type: 'text',
      x: 630,
      y: 580,
      width: 170,
      height: 170,
      color: '3',
      text: '## Controls\nDouble-click — card\nDrag a handle — connect\nClick — name & color\nRight-drag — marquee select',
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
      label: 'features',
    },
    {
      id: 'e_hub_mkt',
      fromNode: 'hub',
      fromSide: 'right',
      toNode: 'mkt_audience',
      toSide: 'left',
      color: '4',
      label: 'audience',
    },
    {
      id: 'e_hub_tech',
      fromNode: 'hub',
      fromSide: 'right',
      toNode: 'tech_stack',
      toSide: 'left',
      color: '8',
      label: 'stack',
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
      label: 'plan',
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
      label: 'distribution',
    },
  ],
};

function mergeDemoNodes(ruNodes: JsonCanvasNode[], enNodes: JsonCanvasNode[]): JsonCanvasNode[] {
  const enById = new Map(enNodes.map((node) => [node.id, node]));

  return ruNodes.map((ruNode) => {
    const enNode = enById.get(ruNode.id);
    if (!enNode || ruNode.type !== enNode.type) return ruNode;

    const i18n: NodeI18n = {};

    if (ruNode.type === 'text' && enNode.type === 'text') {
      i18n.ru = { text: ruNode.text, label: ruNode.label };
      i18n.en = { text: enNode.text, label: enNode.label };
      return { ...ruNode, i18n };
    }

    if (ruNode.type === 'group' && enNode.type === 'group') {
      i18n.ru = { label: ruNode.label };
      i18n.en = { label: enNode.label };
      return { ...ruNode, i18n };
    }

    return ruNode;
  });
}

function mergeDemoEdges(ruEdges: JsonCanvasEdge[], enEdges: JsonCanvasEdge[]): JsonCanvasEdge[] {
  const enById = new Map(enEdges.map((edge) => [edge.id, edge]));

  return ruEdges.map((ruEdge) => {
    const enEdge = enById.get(ruEdge.id);
    if (!enEdge) return ruEdge;

    const i18n: EdgeI18n = {};
    if (ruEdge.label) i18n.ru = { label: ruEdge.label };
    if (enEdge.label) i18n.en = { label: enEdge.label };
    if (!i18n.ru && !i18n.en) return ruEdge;

    return { ...ruEdge, i18n };
  });
}

const DEMO_CANVAS_I18N: JsonCanvas = enrichDemoCanvasI18n({
  nodes: mergeDemoNodes(DEMO_CANVAS_RU.nodes ?? [], DEMO_CANVAS_EN.nodes ?? []),
  edges: mergeDemoEdges(DEMO_CANVAS_RU.edges ?? [], DEMO_CANVAS_EN.edges ?? []),
});

function applyCanvasLocale(canvas: JsonCanvas, locale: Locale): JsonCanvas {
  return {
    nodes: canvas.nodes?.map((node) => applyJsonNodeLocale(node, locale)),
    edges: canvas.edges?.map((edge) => applyJsonEdgeLocale(edge, locale)),
  };
}

export function getDemoCanvas(locale: Locale): JsonCanvas {
  return applyCanvasLocale(DEMO_CANVAS_I18N, locale);
}

export function isDemoBoardName(name: string): boolean {
  return LOCALES.some((locale) => name === getDemoBoardName(locale));
}

/** @deprecated use getDemoCanvas(locale) */
export const DEMO_CANVAS = DEMO_CANVAS_RU;

export function getDemoBoardName(locale: Locale): string {
  return messagesFor(locale).demoBoardName;
}

/** @deprecated use getDemoBoardName(locale) */
export const DEMO_BOARD_NAME = getDemoBoardName('ru');

const REVEAL_STEP_MS = 65;

export function demoFlowPresentation(locale: Locale = 'ru'): {
  nodes: Node<CardNodeData>[];
  edges: Edge[];
} {
  const flow = canvasToFlow(getDemoCanvas(locale));

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

export function demoStats(locale: Locale = 'ru'): { nodes: number; edges: number; groups: number } {
  const nodes = getDemoCanvas(locale).nodes ?? [];
  return {
    nodes: nodes.filter((n) => n.type !== 'group').length,
    edges: (getDemoCanvas(locale).edges ?? []).length,
    groups: nodes.filter((n) => n.type === 'group').length,
  };
}
