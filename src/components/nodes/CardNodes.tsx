import {
  NodeResizer,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import { useEffect, useRef, useState } from 'react';
import { useCanvasActions } from '../../context/canvasActions';
import { resolveColor } from '../../lib/colors';
import type { CardNodeData } from '../../types/jsonCanvas';
import { EdgeHandles } from './edgeHandles';

type TextCardProps = NodeProps<Node<CardNodeData>>;

const resizerHandles =
  '!h-3 !w-3 !rounded-full !border-2 !border-white/50 !bg-indigo-400 !shadow-[0_0_8px_rgba(99,102,241,0.6)]';

const resizerLines = '!border-indigo-400/45';

export function TextCardNode({ id, data, selected }: TextCardProps) {
  const { updateNode } = useCanvasActions();
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const palette = resolveColor(data.color);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={72}
        maxWidth={900}
        maxHeight={800}
        color="#818cf8"
        handleClassName={resizerHandles}
        lineClassName={resizerLines}
      />
      <div
        className={`group relative h-full w-full rounded-2xl border backdrop-blur-xl transition-shadow duration-200 ${
          selected ? 'ring-2 ring-indigo-400/70 shadow-[0_0_40px_-8px_rgba(99,102,241,0.55)]' : ''
        }`}
        style={{
          background: palette.bg,
          borderColor: palette.border,
          boxShadow: selected ? undefined : `0 8px 32px -12px ${palette.glow}`,
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
      >
        <EdgeHandles />

        {data.label?.trim() ? (
          <div
            style={{ background: palette.border }}
            className="pointer-events-none absolute -top-3 left-4 z-[1] max-w-[calc(100%-2rem)] truncate rounded-full px-3 py-0.5 text-xs font-medium text-white/90"
          >
            {data.label}
          </div>
        ) : null}

        <div className={`flex h-full flex-col overflow-auto p-4 ${data.label?.trim() ? 'pt-5' : ''}`}>
          {editing ? (
            <textarea
              ref={textareaRef}
              value={data.text ?? ''}
              onChange={(e) => updateNode(id, { text: e.target.value })}
              onBlur={() => setEditing(false)}
              className="h-full min-h-[3rem] w-full resize-none bg-transparent text-sm leading-relaxed text-white/90 outline-none placeholder:text-white/35"
              placeholder="Markdown-текст..."
            />
          ) : (
            <div className="prose-card whitespace-pre-wrap text-sm leading-relaxed text-white/88">
              {(data.text ?? 'Новая идея').split('\n').map((line: string, i: number) => {
                if (line.startsWith('# ')) {
                  return (
                    <h1 key={i} className="mb-2 text-base font-semibold text-white">
                      {line.slice(2)}
                    </h1>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={i} className="mb-1.5 text-sm font-semibold text-white/95">
                      {line.slice(3)}
                    </h2>
                  );
                }
                return (
                  <p key={i} className="mb-1 text-white/75">
                    {line || '\u00A0'}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function GroupCardNode({ id, data, selected }: TextCardProps) {
  const { updateNode } = useCanvasActions();
  const [editingLabel, setEditingLabel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const palette = resolveColor(data.color);

  useEffect(() => {
    if (editingLabel) inputRef.current?.focus();
  }, [editingLabel]);

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={220}
        minHeight={120}
        maxWidth={1600}
        maxHeight={1200}
        color="#22d3ee"
        handleClassName="!h-3 !w-3 !rounded-full !border-2 !border-white/50 !bg-cyan-400 !shadow-[0_0_8px_rgba(34,211,238,0.55)]"
        lineClassName="!border-cyan-400/45"
      />
      <div className="group relative h-full w-full">
        <div
          className={`h-full w-full rounded-3xl border-2 ${
            selected ? 'ring-2 ring-cyan-400/50' : ''
          }`}
          style={{
            background: palette.bg,
            borderColor: palette.border,
          }}
          onDoubleClick={(e) => e.stopPropagation()}
        />
        <EdgeHandles accentClass="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white/35 !bg-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
        {editingLabel ? (
          <input
            ref={inputRef}
            value={data.label ?? ''}
            onChange={(e) => updateNode(id, { label: e.target.value })}
            onBlur={() => setEditingLabel(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setEditingLabel(false);
            }}
            className="pointer-events-auto absolute -top-3 left-4 z-[1] max-w-48 rounded-full border border-white/20 bg-[#1a1f35] px-3 py-0.5 text-xs font-medium text-white outline-none ring-2 ring-cyan-400/40"
            placeholder="Название группы"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            style={{ background: palette.border }}
            className="pointer-events-auto absolute -top-3 left-4 z-[1] cursor-text rounded-full px-3 py-0.5 text-xs font-medium text-white/80 transition hover:ring-1 hover:ring-white/25"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingLabel(true);
            }}
            title="Двойной клик — переименовать"
          >
            {data.label ?? 'Группа'}
          </div>
        )}
      </div>
    </>
  );
}
