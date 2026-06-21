import type { Locale } from '../i18n/locales';
import type { EdgeI18n, JsonCanvasEdge, JsonCanvasNode, LocaleCopy, NodeI18n } from '../types/jsonCanvas';

type NodeCopyMap = Record<string, LocaleCopy>;

const DEMO_NODE_ES: NodeCopyMap = {
  g_scene: { label: 'MindStorm — tablero demo' },
  g_core: { label: 'Idea central' },
  hub: {
    label: 'Centro',
    text: '# MindStorm\n\nTablero interactivo para brainstorming.\nConexiones, grupos y archivos locales — como Obsidian Canvas.',
  },
  g_product: { label: 'Producto' },
  product_features: {
    label: 'Funciones',
    text: '## Funciones\n• 12 colores para cartas y grupos\n• 8 puntos de conexión (2 por lado)\n• Etiquetas en conexiones · Undo/Redo · RU/EN/ES/中',
  },
  product_files: {
    label: 'Archivos',
    text: '## Archivos\n`.mindstorm` · `.canvas`\nBorrador automático en el navegador',
  },
  g_marketing: { label: 'Marketing' },
  mkt_audience: {
    text: '## Audiencia\nDiseñadores · PM · estudiantes\nPensamiento visual y notas',
  },
  mkt_channels: {
    text: '## Canales\nGitHub Pages · PWA\n↺ Nuevo — tablero vacío · Demo — ejemplo',
  },
  g_tech: { label: 'Tecnología' },
  tech_stack: {
    text: '## Stack\nReact 19 · React Flow\nVite · Tailwind CSS v4',
  },
  tech_local: {
    text: '## Almacenamiento\nArchivos locales en disco\nSin nube ni OAuth',
  },
  g_roadmap: { label: 'Próximos pasos' },
  roadmap_mvp: {
    text: '## MVP ✓\nDemo · Guardar/Abrir\nJSON Canvas · grupos',
  },
  roadmap_tips: {
    text: '## Controles\nDoble clic — carta\nArrastra un punto — conectar\nClic — nombre y color\nArrastre derecho — selección',
  },
};

const DEMO_NODE_ZH: NodeCopyMap = {
  g_scene: { label: 'MindStorm — 演示画布' },
  g_core: { label: '核心想法' },
  hub: {
    label: '中心',
    text: '# MindStorm\n\n用于头脑风暴的交互式画布。\n连接、分组和本地文件 — 类似 Obsidian Canvas。',
  },
  g_product: { label: '产品' },
  product_features: {
    label: '功能',
    text: '## 功能\n• 卡片和分组 12 种颜色\n• 每边 2 个连接点（共 8 个）\n• 连线标签 · 撤销/重做 · RU/EN/ES/中',
  },
  product_files: {
    label: '文件',
    text: '## 文件\n`.mindstorm` · `.canvas`\n浏览器内自动保存草稿',
  },
  g_marketing: { label: '营销' },
  mkt_audience: {
    text: '## 受众\n设计师 · 产品经理 · 学生\n视觉化思考与笔记',
  },
  mkt_channels: {
    text: '## 渠道\nGitHub Pages · PWA\n↺ 新建 — 空白画布 · 演示 — 示例',
  },
  g_tech: { label: '技术' },
  tech_stack: {
    text: '## 技术栈\nReact 19 · React Flow\nVite · Tailwind CSS v4',
  },
  tech_local: {
    text: '## 存储\n本地磁盘文件\n无云端或 OAuth',
  },
  g_roadmap: { label: '下一步' },
  roadmap_mvp: {
    text: '## MVP ✓\n演示 · 保存/打开\nJSON Canvas · 分组',
  },
  roadmap_tips: {
    text: '## 操作\n双击 — 卡片\n拖动连接点 — 连线\n单击 — 名称和颜色\n右键拖动 — 框选',
  },
};

const DEMO_EDGE_ES: Record<string, string> = {
  e_hub_product: 'funciones',
  e_hub_mkt: 'audiencia',
  e_hub_tech: 'stack',
  e_hub_roadmap: 'plan',
  e_mkt_product: 'distribución',
};

const DEMO_EDGE_ZH: Record<string, string> = {
  e_hub_product: '功能',
  e_hub_mkt: '受众',
  e_hub_tech: '技术栈',
  e_hub_roadmap: '计划',
  e_mkt_product: '分发',
};

const EXTRA_NODE_COPIES: Partial<Record<Locale, NodeCopyMap>> = {
  es: DEMO_NODE_ES,
  zh: DEMO_NODE_ZH,
};

const EXTRA_EDGE_COPIES: Partial<Record<Locale, Record<string, string>>> = {
  es: DEMO_EDGE_ES,
  zh: DEMO_EDGE_ZH,
};

export function enrichDemoCanvasI18n(canvas: { nodes?: JsonCanvasNode[]; edges?: JsonCanvasEdge[] }) {
  const nodes = canvas.nodes?.map((node) => {
    const i18n: NodeI18n = { ...(node.i18n ?? {}) };
    for (const locale of ['es', 'zh'] as const) {
      const copy = EXTRA_NODE_COPIES[locale]?.[node.id];
      if (copy) i18n[locale] = copy;
    }
    return { ...node, i18n };
  });

  const edges = canvas.edges?.map((edge) => {
    const i18n: EdgeI18n = { ...(edge.i18n ?? {}) };
    for (const locale of ['es', 'zh'] as const) {
      const label = EXTRA_EDGE_COPIES[locale]?.[edge.id];
      if (label) i18n[locale] = { label };
    }
    return { ...edge, i18n };
  });

  return { ...canvas, nodes, edges };
}
