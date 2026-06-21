import type { ReactNode } from 'react';
import { useLocale } from '../i18n/LocaleProvider';
import type { Locale } from '../i18n/messages';
import { LogoMark, BoardStatsText } from './LogoMark';
import { AUTHOR_NAME, REPO_URL } from '../lib/siteMeta';
import { COLOR_IDS, swatchFill, swatchTitle } from '../lib/colors';

type ToolbarProps = {
  onAddText: () => void;
  onAddGroup: () => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
  onNewBoard: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  nodeCount: number;
  edgeCount: number;
  activeBoardName?: string | null;
};

export function Toolbar({
  onAddText,
  onAddGroup,
  onSave,
  onLoad,
  onReset,
  onNewBoard,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  nodeCount,
  edgeCount,
  activeBoardName,
}: ToolbarProps) {
  const { m } = useLocale();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:p-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:gap-2 sm:px-3">
        <div className="mr-1 flex shrink-0 items-center gap-2 border-r border-white/10 pr-2 sm:mr-2 sm:pr-3">
          <LogoMark />
          <div className="text-sm font-semibold tracking-tight text-white">MindStorm</div>
        </div>

        <div className="flex shrink-0 items-center gap-1 border-r border-white/10 pr-1.5 sm:pr-2">
          <HistoryButton
            onClick={onUndo}
            disabled={!canUndo}
            title={m.toolbar.undo}
            ariaLabel={m.toolbar.undoAria}
          >
            <UndoIcon />
          </HistoryButton>
          <HistoryButton
            onClick={onRedo}
            disabled={!canRedo}
            title={m.toolbar.redo}
            ariaLabel={m.toolbar.redoAria}
          >
            <RedoIcon />
          </HistoryButton>
        </div>

        <div className="flex max-w-[calc(100vw-8rem)] items-center gap-1 overflow-x-auto sm:max-w-[calc(100vw-10rem)] sm:gap-2">
          <ToolbarButton onClick={onAddText} title={m.toolbar.addCard}>
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">{m.toolbar.addCardShort}</span>
          </ToolbarButton>
          <ToolbarButton onClick={onAddGroup} title={m.toolbar.addGroup}>
            <span className="sm:hidden">◻</span>
            <span className="hidden sm:inline">{m.toolbar.addGroupShort}</span>
          </ToolbarButton>
          <ToolbarButton onClick={onSave} title={m.toolbar.saveTitle}>
            <span className="sm:hidden">💾</span>
            <span className="hidden sm:inline">{m.toolbar.save}</span>
          </ToolbarButton>
          <ToolbarButton onClick={onLoad} title={m.toolbar.loadTitle}>
            <span className="sm:hidden">📂</span>
            <span className="hidden sm:inline">{m.toolbar.load}</span>
          </ToolbarButton>
          <ToolbarButton onClick={onNewBoard} title={m.toolbar.newBoardTitle}>
            <span className="sm:hidden">○</span>
            <span className="hidden sm:inline">{m.toolbar.newBoard}</span>
          </ToolbarButton>
          <ToolbarButton onClick={onReset} title={m.toolbar.demoTitle} accent>
            <span className="sm:hidden">↺</span>
            <span className="hidden sm:inline">{m.toolbar.demo}</span>
          </ToolbarButton>
        </div>

        <LanguageToggle />

        <div
          className="ml-1 hidden border-l border-white/10 pl-2 text-[11px] text-white/35 sm:ml-2 sm:block sm:pl-3"
          title={m.toolbar.statsTitle}
        >
          {activeBoardName ? (
            <span className="text-white/50">{activeBoardName} · </span>
          ) : null}
          <BoardStatsText nodeCount={nodeCount} edgeCount={edgeCount} />
        </div>
      </div>
    </header>
  );
}

function LanguageToggle() {
  const { locale, setLocale, m } = useLocale();

  return (
    <div
      className="flex shrink-0 items-center rounded-lg border border-white/10 bg-black/20 p-0.5"
      role="group"
      aria-label="Language"
    >
      {(['ru', 'en'] as const satisfies Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`min-w-[1.75rem] rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition sm:min-w-[2rem] sm:px-2 sm:text-[11px] ${
            locale === code
              ? 'bg-indigo-500/35 text-white shadow-sm'
              : 'text-white/40 hover:text-white/70'
          }`}
          aria-pressed={locale === code}
          title={code === 'ru' ? m.lang.ariaRu : m.lang.ariaEn}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

function HistoryButton({
  children,
  onClick,
  title,
  disabled = false,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel ?? title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition active:scale-95 sm:h-10 sm:w-10 ${
        disabled
          ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20'
          : 'border-white/12 bg-white/[0.06] text-white/85 hover:border-indigo-400/35 hover:bg-indigo-500/15 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function UndoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 14 4 9l5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m15 14 5-5-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
  accent = false,
  disabled = false,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
  accent?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel ?? title}
      disabled={disabled}
      onClick={onClick}
      className={`shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-medium transition active:scale-95 sm:px-3 ${
        disabled
          ? 'cursor-not-allowed text-white/25'
          : accent
            ? 'border border-cyan-400/25 bg-cyan-400/10 text-cyan-100 hover:border-cyan-400/40 hover:bg-cyan-400/20 hover:text-white'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export function HintBar() {
  const { m } = useLocale();

  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-1 p-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] sm:gap-1 sm:p-2">
      <div className="rounded-full border border-white/5 bg-black/15 px-2.5 py-0.5 text-[8px] text-white/28 backdrop-blur-md sm:px-3 sm:text-[9px]">
        <span className="hidden sm:inline">{m.hints.desktop}</span>
        <span className="sm:hidden">{m.hints.mobile}</span>
      </div>
      <div className="pointer-events-auto rounded-full border border-white/6 bg-white/[0.02] px-2 py-0.5 text-[8px] text-white/25 backdrop-blur-md sm:text-[9px]">
        <span className="text-white/20">by </span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-300/45 transition hover:text-cyan-200/70"
        >
          {AUTHOR_NAME}
        </a>
        <span className="mx-1 text-white/10">·</span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/30 transition hover:text-white/50"
        >
          github.com/{AUTHOR_NAME}/mindstorm
        </a>
      </div>
    </footer>
  );
}

export function EdgeSelectionPanel({
  label,
  onLabelChange,
  onClear,
  onDelete,
}: {
  label: string;
  onLabelChange: (label: string) => void;
  onClear: () => void;
  onDelete: () => void;
}) {
  const { m } = useLocale();

  return (
    <div className="pointer-events-auto absolute right-2 top-20 z-20 flex w-44 flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-2xl sm:right-4 sm:top-24 sm:w-48">
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">{m.edgePanel.title}</span>
      <input
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
        placeholder={m.edgePanel.placeholder}
        className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none ring-indigo-400/40 focus:ring-2"
      />
      <p className="text-[9px] leading-snug text-white/30">{m.edgePanel.hint}</p>
      {label.trim() ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg px-2 py-1.5 text-[10px] text-white/45 transition hover:bg-white/10 hover:text-white/70"
        >
          {m.edgePanel.clearLabel}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg border border-red-400/20 bg-red-400/10 px-2 py-1.5 text-[10px] font-medium text-red-200/90 transition hover:bg-red-400/20"
      >
        {m.edgePanel.delete}
      </button>
    </div>
  );
}

export function SelectionPanel({
  nodeType,
  color,
  label,
  onColorChange,
  onLabelChange,
}: {
  nodeType: 'text' | 'group' | 'link' | 'file';
  color?: string;
  label?: string;
  onColorChange: (color: string) => void;
  onLabelChange: (label: string) => void;
}) {
  const { m } = useLocale();
  const isGroup = nodeType === 'group';

  return (
    <div className="pointer-events-auto absolute right-2 top-20 z-20 flex w-52 flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-2xl sm:right-4 sm:top-24 sm:w-56">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
          {isGroup ? m.selectionPanel.group : m.selectionPanel.card}
        </span>
        <input
          value={label ?? ''}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder={isGroup ? m.selectionPanel.groupNamePlaceholder : m.selectionPanel.cardNamePlaceholder}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none ring-indigo-400/40 focus:ring-2"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">{m.selectionPanel.color}</span>
        <div className="grid grid-cols-6 gap-1.5">
          {COLOR_IDS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onColorChange(c)}
              className={`h-6 w-6 rounded-full border-2 transition hover:scale-110 ${
                color === c ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ background: swatchFill(c) }}
              title={swatchTitle(c, m.colors, m.colorsCustom)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
