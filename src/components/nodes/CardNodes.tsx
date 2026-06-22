import {
  NodeResizer,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import { useEffect, useRef, useState } from 'react';
import { useCanvasActions } from '../../context/canvasActions';
import { useLocale } from '../../i18n/LocaleProvider';
import { resolveColor } from '../../lib/colors';
import type { CardNodeData } from '../../types/jsonCanvas';
import { EdgeHandles } from './edgeHandles';

type TextCardProps = NodeProps<Node<CardNodeData>>;

const resizerHandles =
  '!h-3 !w-3 !rounded-full !border-2 !border-white/50 !bg-indigo-400 !shadow-[0_0_8px_rgba(99,102,241,0.6)]';

const resizerLines = '!border-indigo-400/45';

const cardTitleTypography =
  'w-full truncate text-[15px] font-semibold leading-snug tracking-tight text-white/95';

const cardBodyTypography =
  'min-h-[2.5rem] w-full flex-1 text-sm leading-relaxed text-white/88 whitespace-pre-wrap';

function CardBodyText({ text, placeholder }: { text: string; placeholder: string }) {
  if (!text) {
    return <span className={`${cardBodyTypography} text-white/35`}>{placeholder}</span>;
  }
  return <div className={cardBodyTypography}>{text}</div>;
}

export function TextCardNode({ id, data, selected }: TextCardProps) {
  const { updateNode } = useCanvasActions();
  const { m } = useLocale();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleEditSession, setTitleEditSession] = useState(0);
  const [optimisticTitle, setOptimisticTitle] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [editingBody, setEditingBody] = useState(false);
  const [bodyEditSession, setBodyEditSession] = useState(0);
  const [optimisticBody, setOptimisticBody] = useState<string | null>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const palette = resolveColor(data.color);

  const storedTitle = data.label ?? '';
  const storedBody = data.text ?? '';
  const visibleTitle = optimisticTitle ?? storedTitle;
  const visibleBody = optimisticBody ?? storedBody;

  useEffect(() => {
    if (optimisticTitle !== null && storedTitle === optimisticTitle) {
      setOptimisticTitle(null);
    }
  }, [storedTitle, optimisticTitle]);

  useEffect(() => {
    if (optimisticBody !== null && storedBody === optimisticBody) {
      setOptimisticBody(null);
    }
  }, [storedBody, optimisticBody]);

  const beginTitleEdit = () => {
    setTitleEditSession((session) => session + 1);
    setEditingTitle(true);
  };

  const commitTitleEdit = () => {
    const next = titleInputRef.current?.value ?? '';
    setEditingTitle(false);
    if (next !== storedTitle) {
      setOptimisticTitle(next);
      updateNode(id, { label: next });
    }
  };

  const cancelTitleEdit = () => {
    setEditingTitle(false);
    setOptimisticTitle(null);
  };

  const beginBodyEdit = () => {
    setBodyEditSession((session) => session + 1);
    setEditingBody(true);
  };

  const commitBodyEdit = () => {
    const next = bodyTextareaRef.current?.value ?? '';
    setEditingBody(false);
    if (next !== storedBody) {
      setOptimisticBody(next);
      updateNode(id, { text: next });
    }
  };

  const cancelBodyEdit = () => {
    setEditingBody(false);
    setOptimisticBody(null);
  };

  useEffect(() => {
    if (!editingTitle) return;
    const el = titleInputRef.current;
    if (!el) return;
    el.focus();
    const end = el.value.length;
    el.setSelectionRange(end, end);
  }, [editingTitle, titleEditSession]);

  useEffect(() => {
    if (!editingBody) return;
    const el = bodyTextareaRef.current;
    if (!el) return;
    el.focus();
    const end = el.value.length;
    el.setSelectionRange(end, end);
  }, [editingBody, bodyEditSession]);

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={100}
        maxWidth={900}
        maxHeight={800}
        color="#818cf8"
        handleClassName={resizerHandles}
        lineClassName={resizerLines}
      />
      <div
        className={`card-face group relative h-full w-full rounded-2xl border transition-shadow duration-200 ${
          selected ? 'ring-2 ring-indigo-400/70 shadow-[0_0_40px_-8px_rgba(99,102,241,0.55)]' : ''
        }`}
        style={{
          background: palette.bg,
          borderColor: palette.border,
          boxShadow: selected ? undefined : `0 8px 32px -12px ${palette.glow}`,
        }}
      >
        <EdgeHandles />

        <div className="flex h-full min-h-0 flex-col">
          <div
            className="shrink-0 border-b px-4 pb-2.5 pt-3"
            style={{ borderColor: `${palette.border}` }}
          >
            {editingTitle ? (
              <input
                key={titleEditSession}
                ref={titleInputRef}
                defaultValue={storedTitle}
                onBlur={commitTitleEdit}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    titleInputRef.current?.blur();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    if (titleInputRef.current) titleInputRef.current.value = storedTitle;
                    cancelTitleEdit();
                  }
                }}
                className={`${cardTitleTypography} nodrag nopan rounded-md bg-transparent outline-none ring-2 ring-indigo-400/35 placeholder:text-white/35`}
                placeholder={m.card.titlePlaceholder}
                spellCheck
              />
            ) : (
              <div
                className={`${cardTitleTypography} min-h-[1.35rem] cursor-text`}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  beginTitleEdit();
                }}
                title={m.card.titleEditHint}
              >
                {visibleTitle ? (
                  visibleTitle
                ) : (
                  <span className="font-medium text-white/35">{m.card.titlePlaceholder}</span>
                )}
              </div>
            )}
          </div>

          <div
            className="flex min-h-0 flex-1 flex-col overflow-auto px-4 py-3"
            onDoubleClick={(e) => {
              e.stopPropagation();
              beginBodyEdit();
            }}
          >
            {editingBody ? (
              <textarea
                key={bodyEditSession}
                ref={bodyTextareaRef}
                defaultValue={storedBody}
                onBlur={commitBodyEdit}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    if (bodyTextareaRef.current) bodyTextareaRef.current.value = storedBody;
                    cancelBodyEdit();
                  }
                }}
                className={`${cardBodyTypography} nodrag nopan h-full resize-none bg-transparent outline-none placeholder:text-white/35`}
                placeholder={m.card.placeholder}
                spellCheck
              />
            ) : (
              <CardBodyText text={visibleBody} placeholder={m.card.placeholder} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function GroupCardNode({ id, data, selected }: TextCardProps) {
  const { updateNode, onGroupResizeStart, onGroupResize, onGroupResizeEnd } = useCanvasActions();
  const { m } = useLocale();
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelEditSession, setLabelEditSession] = useState(0);
  const [optimisticLabel, setOptimisticLabel] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const palette = resolveColor(data.color);

  const storedLabel = data.label ?? '';
  const visibleLabel = optimisticLabel ?? storedLabel;

  useEffect(() => {
    if (optimisticLabel !== null && storedLabel === optimisticLabel) {
      setOptimisticLabel(null);
    }
  }, [storedLabel, optimisticLabel]);

  const beginLabelEdit = () => {
    setLabelEditSession((session) => session + 1);
    setEditingLabel(true);
  };

  const commitLabelEdit = () => {
    const next = inputRef.current?.value ?? '';
    setEditingLabel(false);
    if (next !== storedLabel) {
      setOptimisticLabel(next);
      updateNode(id, { label: next });
    }
  };

  const cancelLabelEdit = () => {
    setEditingLabel(false);
    setOptimisticLabel(null);
  };

  useEffect(() => {
    if (!editingLabel) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    const end = el.value.length;
    el.setSelectionRange(end, end);
  }, [editingLabel, labelEditSession]);

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={220}
        minHeight={120}
        color="#22d3ee"
        handleClassName="!h-3 !w-3 !rounded-full !border-2 !border-white/50 !bg-cyan-400 !shadow-[0_0_8px_rgba(34,211,238,0.55)]"
        lineClassName="!border-cyan-400/45"
        onResizeStart={() => onGroupResizeStart?.(id)}
        onResize={(_, params) => onGroupResize?.(id, params)}
        onResizeEnd={() => onGroupResizeEnd?.(id)}
      />
      <div className="group relative h-full w-full">
        <div
          className={`card-face h-full w-full rounded-3xl border-2 ${
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
            key={labelEditSession}
            ref={inputRef}
            defaultValue={storedLabel}
            onBlur={commitLabelEdit}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                e.preventDefault();
                inputRef.current?.blur();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                if (inputRef.current) inputRef.current.value = storedLabel;
                cancelLabelEdit();
              }
            }}
            className="nodrag nopan pointer-events-auto absolute -top-3 left-4 z-[1] max-w-48 rounded-full border border-white/20 bg-[#1a1f35] px-3 py-0.5 text-xs font-medium text-white outline-none ring-2 ring-cyan-400/40"
            placeholder={m.group.namePlaceholder}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            style={{ background: palette.border }}
            className="pointer-events-auto absolute -top-3 left-4 z-[1] cursor-text rounded-full px-3 py-0.5 text-xs font-medium text-white/80 transition hover:ring-1 hover:ring-white/25"
            onDoubleClick={(e) => {
              e.stopPropagation();
              beginLabelEdit();
            }}
            title={m.group.renameTitle}
          >
            {visibleLabel || m.group.defaultLabel}
          </div>
        )}
      </div>
    </>
  );
}
