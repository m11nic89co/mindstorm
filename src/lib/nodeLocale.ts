import type { Edge } from '@xyflow/react';
import type { Locale } from '../i18n/locales';
import { pickFromLocaleMap } from '../i18n/locales';
import type {
  CardNodeData,
  EdgeI18n,
  JsonCanvasEdge,
  JsonCanvasNode,
  NodeI18n,
} from '../types/jsonCanvas';
import { setEdgeLabel } from './flowEdges';

function pickLocaleCopy<T extends { label?: string; text?: string }>(
  i18n: Partial<Record<Locale, T>> | undefined,
  locale: Locale,
): T | undefined {
  return pickFromLocaleMap(i18n, locale);
}

function bootstrapNodeI18n(data: CardNodeData): NodeI18n | undefined {
  if (data.i18n) return data.i18n;
  if (!data.text && !data.label) return undefined;
  return { ru: { text: data.text, label: data.label } };
}

export function materializeNodeLocale(data: CardNodeData, locale: Locale): CardNodeData {
  const i18n = bootstrapNodeI18n(data);
  if (!i18n) return data;

  const copy = pickLocaleCopy(i18n, locale);
  const next: CardNodeData = { ...data, i18n };

  if (data.canvasType === 'text' || data.canvasType === 'plain') {
    if (copy?.text !== undefined) next.text = copy.text;
    if (copy?.label !== undefined) next.label = copy.label;
  } else if (data.canvasType === 'group' && copy?.label !== undefined) {
    next.label = copy.label;
  }

  return next;
}

export function syncNodeI18nOnEdit(
  data: CardNodeData,
  locale: Locale,
  patch: Partial<CardNodeData>,
): CardNodeData {
  const merged = { ...data, ...patch };
  const i18n: NodeI18n = { ...(bootstrapNodeI18n(data) ?? {}) };
  const slot = { ...i18n[locale] };

  if ('text' in patch) slot.text = patch.text;
  if ('label' in patch) slot.label = patch.label;

  i18n[locale] = slot;
  return { ...merged, i18n };
}

export function applyJsonNodeLocale(node: JsonCanvasNode, locale: Locale): JsonCanvasNode {
  const i18n = node.i18n;
  if (!i18n) return node;

  const copy = pickLocaleCopy(i18n, locale);
  if (!copy) return node;

  if (node.type === 'text') {
    return {
      ...node,
      text: copy.text ?? node.text,
      label: copy.label !== undefined ? copy.label : node.label,
    };
  }

  if (node.type === 'group') {
    return {
      ...node,
      label: copy.label !== undefined ? copy.label : node.label,
    };
  }

  return node;
}

export function applyJsonEdgeLocale(edge: JsonCanvasEdge, locale: Locale): JsonCanvasEdge {
  const i18n = edge.i18n;
  if (!i18n) return edge;

  const copy = pickLocaleCopy(i18n, locale);
  if (!copy?.label) return { ...edge, label: undefined };

  return { ...edge, label: copy.label };
}

function bootstrapEdgeI18n(edge: Edge): EdgeI18n | undefined {
  const existing = edge.data?.i18n as EdgeI18n | undefined;
  if (existing) return existing;
  const label = typeof edge.label === 'string' ? edge.label.trim() : '';
  if (!label) return undefined;
  return { ru: { label } };
}

export function materializeEdgeLocale(edge: Edge, locale: Locale): Edge {
  const i18n = bootstrapEdgeI18n(edge);
  if (!i18n) return edge;

  const copy = pickLocaleCopy(i18n, locale);
  const label = copy?.label ?? (typeof edge.label === 'string' ? edge.label : undefined);
  const next = setEdgeLabel(edge, label);
  return { ...next, data: { ...next.data, i18n } };
}

export function syncEdgeI18nOnEdit(edge: Edge, locale: Locale, label: string): Edge {
  const i18n: EdgeI18n = { ...(bootstrapEdgeI18n(edge) ?? {}) };
  i18n[locale] = { label: label.trim() || undefined };
  const next = setEdgeLabel(edge, label);
  return { ...next, data: { ...next.data, i18n } };
}
