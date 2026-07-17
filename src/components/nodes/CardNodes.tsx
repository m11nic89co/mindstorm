import {
  NodeResizer,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { useCanvasActions } from '../../context/canvasActions';
import { useLocale } from '../../i18n/LocaleProvider';
import { resolveColor } from '../../lib/colors';
import { groupLabelBadgeStyle } from '../../lib/groupLabel';
import { resolveLabelFontSize, resolveTextFontSize } from '../../lib/cardTypography';
import { useTheme } from '../../theme/ThemeProvider';
import type { CardNodeData } from '../../types/jsonCanvas';
import { EdgeHandles } from './edgeHandles';

type TextCardProps = NodeProps<Node<CardNodeData>>;

const resizerHandles =
  '!h-3 !w-3 !rounded-full !border-2 !border-white/50 !bg-indigo-400 !shadow-[0_0_8px_rgba(99,102,241,0.6)]';

const resizerLines = '!border-indigo-400/45';

const cardTitleTypography =
  'w-full truncate font-semibold leading-snug tracking-tight text-[var(--ms-card-text)]';

const cardTitlePlaceholderClass = 'font-medium text-[var(--ms-card-text-muted)]';

const cardBodyTypography =
  'min-h-[2.5rem] w-full flex-1 leading-relaxed text-[var(--ms-card-text-body)] whitespace-pre-wrap';

function LockOpenIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="block shrink-0"
      style={{ width: '1em', height: '1em' }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path strokeLinecap="round" d="M5.5 9V6.25a4.25 4.25 0 118.5 0V9" />
      <rect x="4.25" y="9" width="11.5" height="7.75" rx="2" />
    </svg>
  );
}

function LockClosedIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="block shrink-0"
      style={{ width: '1em', height: '1em' }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <rect x="4.25" y="9" width="11.5" height="7.75" rx="2" />
      <path strokeLinecap="round" d="M7 9V6.5a3 3 0 116 0V9" />
    </svg>
  );
}

function CardBodyText({
  text,
  placeholder,
  style,
}: {
  text: string;
  placeholder: string;
  style?: CSSProperties;
}) {
  if (!text) {
    return <span className={`${cardBodyTypography} text-[var(--ms-card-text-muted)]`} style={style}>{placeholder}</span>;
  }
  return <div className={cardBodyTypography} style={style}>{text}</div>;
}

export function TextCardNode({ id, data, selected }: TextCardProps) {
  const { updateNode } = useCanvasActions();
  const { m } = useLocale();
  const { theme } = useTheme();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleEditSession, setTitleEditSession] = useState(0);
  const [optimisticTitle, setOptimisticTitle] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [editingBody, setEditingBody] = useState(false);
  const [bodyEditSession, setBodyEditSession] = useState(0);
  const [optimisticBody, setOptimisticBody] = useState<string | null>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const palette = resolveColor(data.color, theme);
  const titleFontSize = resolveLabelFontSize(data.labelFontSize);
  const titleStyle = { fontSize: titleFontSize };
  const bodyFontSize = resolveTextFontSize(data.textFontSize);
  const bodyStyle = { fontSize: bodyFontSize };

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
          <div className="shrink-0 border-b border-[var(--ms-card-divider)] px-4 pb-2.5 pt-3">
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
                className={`${cardTitleTypography} nodrag nopan rounded-md bg-transparent outline-none ring-2 ring-indigo-400/35 placeholder:text-[var(--ms-card-text-muted)]`}
                style={titleStyle}
                placeholder={m.card.titlePlaceholder}
                spellCheck
              />
            ) : (
              <div
                className={`${cardTitleTypography} min-h-[1.35rem] cursor-text`}
                style={titleStyle}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  beginTitleEdit();
                }}
                title={m.card.titleEditHint}
              >
                {visibleTitle ? (
                  visibleTitle
                ) : (
                  <span className={cardTitlePlaceholderClass}>{m.card.titlePlaceholder}</span>
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
                className={`${cardBodyTypography} nodrag nopan h-full resize-none bg-transparent outline-none placeholder:text-[var(--ms-card-text-muted)]`}
                style={bodyStyle}
                placeholder={m.card.placeholder}
                spellCheck
              />
            ) : (
              <CardBodyText text={visibleBody} placeholder={m.card.placeholder} style={bodyStyle} />
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
  const { theme } = useTheme();
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelEditSession, setLabelEditSession] = useState(0);
  const [optimisticLabel, setOptimisticLabel] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const palette = resolveColor(data.color, theme);
  const badgeStyle = groupLabelBadgeStyle(data.labelFontSize);
  const badgePositionStyle = {
    top: badgeStyle.top,
    maxWidth: badgeStyle.maxWidth,
    fontSize: badgeStyle.fontSize,
    paddingLeft: badgeStyle.paddingLeft,
    paddingRight: badgeStyle.paddingRight,
    paddingTop: badgeStyle.paddingTop,
    paddingBottom: badgeStyle.paddingBottom,
    gap: `${Math.max(4, Math.round(badgeStyle.fontSize * 0.2))}px`,
  };

  const lockButtonStyle: CSSProperties = {
    padding: `${Math.max(2, Math.round(badgeStyle.fontSize * 0.08))}px`,
    lineHeight: 0,
  };

  const storedLabel = data.label ?? '';
  const visibleLabel = optimisticLabel ?? storedLabel;
  const locked = data.locked === true;

  useEffect(() => {
    if (optimisticLabel !== null && storedLabel === optimisticLabel) {
      setOptimisticLabel(null);
    }
  }, [storedLabel, optimisticLabel]);

  const beginLabelEdit = () => {
    if (locked) return;
    setLabelEditSession((session) => session + 1);
    setEditingLabel(true);
  };

  const toggleLock = (event: MouseEvent) => {
    event.stopPropagation();
    if (editingLabel) setEditingLabel(false);
    updateNode(id, { locked: !locked });
  };

  const badgeShellClass =
    'group-label-badge pointer-events-auto absolute left-4 z-[1] flex max-w-[200px] items-center rounded-full font-medium text-[var(--ms-card-text)]';

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
        isVisible={selected && !locked}
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
            selected && !locked ? 'ring-2 ring-cyan-400/50' : ''
          }${locked ? ' opacity-90' : ''}`}
          style={{
            background: palette.bg,
            borderColor: palette.border,
          }}
          onDoubleClick={(e) => e.stopPropagation()}
        />
        {!locked && (
          <EdgeHandles accentClass="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white/35 !bg-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
        {editingLabel && !locked ? (
          <div
            className={`${badgeShellClass} border border-[var(--ms-badge-border)] bg-[var(--ms-badge-bg)] outline-none ring-2 ring-cyan-400/40`}
            style={badgePositionStyle}
          >
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
              className="nodrag nopan min-w-0 flex-1 truncate bg-transparent text-inherit outline-none placeholder:text-[var(--ms-card-text-muted)]"
              placeholder={m.group.namePlaceholder}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              className="group-lock-btn nodrag nopan shrink-0 rounded-full text-[var(--ms-card-text-body)] transition hover:bg-black/5 hover:opacity-100"
              style={lockButtonStyle}
              onClick={toggleLock}
              title={m.group.lockTitle}
              aria-label={m.group.lockAria}
            >
              <LockOpenIcon />
            </button>
          </div>
        ) : (
          <div
            style={{ background: palette.border, ...badgePositionStyle }}
            className={`${badgeShellClass} text-white transition hover:ring-1 hover:ring-white/40`}
          >
            <span
              className={`group-label-text min-w-0 flex-1 truncate ${locked ? '' : 'cursor-text'}`}
              onDoubleClick={(e) => {
                e.stopPropagation();
                beginLabelEdit();
              }}
              title={locked ? undefined : m.group.renameTitle}
            >
              {visibleLabel || m.group.defaultLabel}
            </span>
            <button
              type="button"
              className="group-lock-btn nodrag nopan shrink-0 rounded-full text-white/90 transition hover:bg-white/15 hover:text-white"
              style={lockButtonStyle}
              onClick={toggleLock}
              title={locked ? m.group.unlockTitle : m.group.lockTitle}
              aria-label={locked ? m.group.unlockAria : m.group.lockAria}
            >
              {locked ? <LockClosedIcon /> : <LockOpenIcon />}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
