export type CanvasSide = 'top' | 'right' | 'bottom' | 'left';
export type HandleSlot = 'a' | 'b';
export type CanvasColor = '1' | '2' | '3' | '4' | '5' | '6' | string;

export type LocaleCopy = {
  text?: string;
  label?: string;
};

export type NodeI18n = {
  ru?: LocaleCopy;
  en?: LocaleCopy;
  es?: LocaleCopy;
  zh?: LocaleCopy;
};

export type EdgeI18n = {
  ru?: { label?: string };
  en?: { label?: string };
  es?: { label?: string };
  zh?: { label?: string };
};

export interface JsonCanvasNodeBase {
  id: string;
  type: 'text' | 'file' | 'link' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  color?: CanvasColor;
  /** MindStorm: переводы текста/названия (ru, en, es, zh) */
  i18n?: NodeI18n;
}

export interface JsonCanvasTextNode extends JsonCanvasNodeBase {
  type: 'text';
  text: string;
  /** Расширение MindStorm — название карточки в UI */
  label?: string;
}

export interface JsonCanvasLinkNode extends JsonCanvasNodeBase {
  type: 'link';
  url: string;
}

export interface JsonCanvasGroupNode extends JsonCanvasNodeBase {
  type: 'group';
  label?: string;
  background?: string;
  backgroundStyle?: 'cover' | 'ratio' | 'repeat';
}

export interface JsonCanvasFileNode extends JsonCanvasNodeBase {
  type: 'file';
  file: string;
  subpath?: string;
}

export type JsonCanvasNode =
  | JsonCanvasTextNode
  | JsonCanvasLinkNode
  | JsonCanvasGroupNode
  | JsonCanvasFileNode;

export interface JsonCanvasEdge {
  id: string;
  fromNode: string;
  fromSide?: CanvasSide;
  /** MindStorm: точка на стороне (25% = a, 75% = b) */
  fromSlot?: HandleSlot;
  fromEnd?: 'none' | 'arrow';
  toNode: string;
  toSide?: CanvasSide;
  toSlot?: HandleSlot;
  toEnd?: 'none' | 'arrow';
  color?: CanvasColor;
  label?: string;
  /** MindStorm: переводы подписи (ru, en, es, zh) */
  i18n?: EdgeI18n;
}

export interface JsonCanvas {
  nodes?: JsonCanvasNode[];
  edges?: JsonCanvasEdge[];
}

export type CardNodeData = {
  canvasType: 'text' | 'link' | 'group' | 'file';
  text?: string;
  url?: string;
  label?: string;
  file?: string;
  color?: CanvasColor;
  i18n?: NodeI18n;
};
