import type { ReactNode } from 'react';
import { useLocale } from '../i18n/LocaleProvider';
import { LOCALE_ARIA, LOCALE_LABEL, LOCALES } from '../i18n/locales';
import { useTheme } from '../theme/ThemeProvider';
import { LogoMark, BoardStatsText } from './LogoMark';
import { DonateChip } from './DonateChip';
import { AUTHOR_NAME, LIVE_URL, REPO_URL } from '../lib/siteMeta';
import { COLOR_IDS, swatchFill, swatchTitle } from '../lib/colors';
import {
  clampCardFontSize,
  clampPlainFontSize,
  DEFAULT_LABEL_FONT_SIZE,
  DEFAULT_PLAIN_FONT_SIZE,
  DEFAULT_TEXT_FONT_SIZE,
  MAX_CARD_FONT_SIZE,
  MAX_PLAIN_FONT_SIZE,
  MIN_CARD_FONT_SIZE,
  MIN_PLAIN_FONT_SIZE,
} from '../lib/cardTypography';
import {
  clampGroupLabelFontSize,
  DEFAULT_GROUP_LABEL_FONT_SIZE,
  MAX_GROUP_LABEL_FONT_SIZE,
  MIN_GROUP_LABEL_FONT_SIZE,
} from '../lib/groupLabel';

type ToolbarProps = {
  onAddText: () => void;
  onAddPlain: () => void;
  onAddGroup: () => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
  onNewBoard: () => void;
  onPrint: () => void;
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
  onAddPlain,
  onAddGroup,
  onSave,
  onLoad,
  onReset,
  onNewBoard,
  onPrint,
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
    <header className="no-print pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:p-4">
      <div
        className="pointer-events-auto flex max-w-full items-center gap-1 rounded-2xl border px-2 py-2 backdrop-blur-2xl sm:gap-2 sm:px-3"
        style={{
          borderColor: 'var(--ms-panel-border)',
          background: 'var(--ms-panel-bg)',
          boxShadow: 'var(--ms-panel-shadow)',
        }}
      >
        <div
          className="mr-1 flex shrink-0 items-center gap-1.5 border-r pr-2 sm:mr-2 sm:gap-2 sm:pr-3"
          style={{ borderColor: 'var(--ms-panel-border)' }}
        >
          <LogoMark />
          <div className="text-sm font-semibold tracking-tight" style={{ color: 'var(--ms-text)' }}>
            MindStorm
          </div>
          <SaveButton onClick={onSave} />
          <LoadButton onClick={onLoad} />
        </div>

        <div
          className="flex shrink-0 items-center gap-1 border-r pr-1.5 sm:pr-2"
          style={{ borderColor: 'var(--ms-panel-border)' }}
        >
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
          <ToolbarButton onClick={onAddPlain} title={m.toolbar.addPlain}>
            <span className="sm:hidden">T</span>
            <span className="hidden sm:inline">{m.toolbar.addPlainShort}</span>
          </ToolbarButton>
          <ToolbarButton onClick={onAddText} title={m.toolbar.addCard}>
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">{m.toolbar.addCardShort}</span>
          </ToolbarButton>
          <ToolbarButton onClick={onAddGroup} title={m.toolbar.addGroup}>
            <span className="sm:hidden">◻</span>
            <span className="hidden sm:inline">{m.toolbar.addGroupShort}</span>
          </ToolbarButton>
          <ToolbarButton onClick={onNewBoard} title={m.toolbar.newBoardTitle} accent>
            <span className="sm:hidden">↺</span>
            <span className="hidden sm:inline">{m.toolbar.newBoard}</span>
          </ToolbarButton>
          <ToolbarButton onClick={onReset} title={m.toolbar.demoTitle}>
            <span className="sm:hidden">✦</span>
            <span className="hidden sm:inline">{m.toolbar.demo}</span>
          </ToolbarButton>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <PrintButton onClick={onPrint} />
          <ThemeToggle />
        </div>
        <LanguageToggle />

        <div
          className="ml-1 hidden border-l pl-2 text-[11px] sm:ml-2 sm:block sm:pl-3"
          style={{ borderColor: 'var(--ms-panel-border)', color: 'var(--ms-text-muted)' }}
          title={m.toolbar.statsTitle}
        >
          {activeBoardName ? (
            <span style={{ color: 'var(--ms-text-soft)' }}>{activeBoardName} · </span>
          ) : null}
          <BoardStatsText nodeCount={nodeCount} edgeCount={edgeCount} />
        </div>
      </div>
    </header>
  );
}

function IconToolbarButton({
  onClick,
  title,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  title: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition active:scale-95 sm:h-10 sm:w-10"
      style={{
        borderColor: 'var(--ms-btn-border)',
        background: 'var(--ms-btn-bg)',
        color: 'var(--ms-text-soft)',
      }}
    >
      {children}
    </button>
  );
}

function PrintButton({ onClick }: { onClick: () => void }) {
  const { m } = useLocale();
  return (
    <IconToolbarButton onClick={onClick} title={m.toolbar.printTitle} ariaLabel={m.toolbar.print}>
      <PrinterIcon />
    </IconToolbarButton>
  );
}

function SaveButton({ onClick }: { onClick: () => void }) {
  const { m } = useLocale();
  return (
    <IconToolbarButton onClick={onClick} title={m.toolbar.saveTitle} ariaLabel={m.toolbar.save}>
      <SaveIcon />
    </IconToolbarButton>
  );
}

function LoadButton({ onClick }: { onClick: () => void }) {
  const { m } = useLocale();
  return (
    <IconToolbarButton onClick={onClick} title={m.toolbar.loadTitle} ariaLabel={m.toolbar.load}>
      <LoadIcon />
    </IconToolbarButton>
  );
}

function ThemeToggle() {
  const { m } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const toLight = theme === 'dark';

  return (
    <IconToolbarButton
      onClick={toggleTheme}
      title={toLight ? m.toolbar.themeToLight : m.toolbar.themeToDark}
      ariaLabel={m.toolbar.themeAria}
    >
      {toLight ? <SunIcon /> : <MoonIcon />}
    </IconToolbarButton>
  );
}

function LanguageToggle() {
  const { locale, m, setLocale } = useLocale();

  return (
    <div
      className="flex shrink-0 items-center rounded-lg border p-0.5"
      style={{ borderColor: 'var(--ms-panel-border)', background: 'var(--ms-chip-bg)' }}
      role="group"
      aria-label={m.toolbar.languageAria}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className="min-w-[1.75rem] rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition sm:min-w-[2rem] sm:px-2 sm:text-[11px]"
          style={
            locale === code
              ? { background: 'var(--ms-lang-active)', color: 'var(--ms-text)', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }
              : { color: 'var(--ms-text-muted)' }
          }
          aria-pressed={locale === code}
          title={LOCALE_ARIA[code]}
        >
          {LOCALE_LABEL[code]}
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
        disabled ? 'cursor-not-allowed opacity-35' : 'hover:border-indigo-400/40 hover:bg-indigo-500/15'
      }`}
      style={{
        borderColor: 'var(--ms-btn-border)',
        background: 'var(--ms-btn-bg)',
        color: 'var(--ms-text-soft)',
      }}
    >
      {children}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PrinterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 8V4h10v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 13h10v7H7v-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Дискета — сохранить. */
function SaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 3h11l3 3v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 3v6h8V3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 21v-7h8v7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Открытая папка — загрузить. */
function LoadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11v6M9.5 14.5 12 17l2.5-2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
        disabled ? 'cursor-not-allowed opacity-35' : ''
      }`}
      style={
        accent
          ? {
              border: '1px solid var(--ms-accent-border)',
              background: 'var(--ms-accent-bg)',
              color: 'var(--ms-accent-text)',
            }
          : { color: 'var(--ms-text-soft)' }
      }
      onMouseEnter={(e) => {
        if (disabled || accent) return;
        e.currentTarget.style.background = 'var(--ms-btn-hover)';
      }}
      onMouseLeave={(e) => {
        if (disabled || accent) return;
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

export function HintBar() {
  const { m } = useLocale();

  return (
    <footer className="no-print pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-1 p-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] sm:gap-1 sm:p-2">
      <div
        className="rounded-full border px-2.5 py-0.5 text-[8px] backdrop-blur-md sm:px-3 sm:text-[9px]"
        style={{
          borderColor: 'var(--ms-hint-border)',
          background: 'var(--ms-hint-bg)',
          color: 'var(--ms-text-faint)',
        }}
      >
        <span className="hidden sm:inline">{m.hints.desktop}</span>
        <span className="sm:hidden">{m.hints.mobile}</span>
      </div>
      <div
        className="pointer-events-auto relative rounded-full border px-2 py-0.5 text-[8px] backdrop-blur-md sm:text-[9px]"
        style={{
          borderColor: 'var(--ms-hint-border)',
          background: 'var(--ms-panel-bg)',
          color: 'var(--ms-text-faint)',
        }}
      >
        <span style={{ color: 'var(--ms-text-faint)' }}>by </span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-600/70 transition hover:text-cyan-500 dark:text-cyan-300/45"
          style={{ color: 'var(--ms-accent-text)' }}
        >
          {AUTHOR_NAME}
        </a>
        <span className="mx-1" style={{ color: 'var(--ms-text-faint)' }}>
          ·
        </span>
        <DonateChip />
        <span className="mx-1" style={{ color: 'var(--ms-text-faint)' }}>
          ·
        </span>
        <a
          href={LIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:opacity-80"
          style={{ color: 'var(--ms-text-muted)' }}
          title={LIVE_URL}
        >
          mindstorm
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
    <div
      className="no-print pointer-events-auto absolute right-2 top-20 z-20 flex w-44 flex-col gap-2 rounded-2xl border p-3 backdrop-blur-2xl sm:right-4 sm:top-24 sm:w-48"
      style={{
        borderColor: 'var(--ms-panel-border)',
        background: 'var(--ms-panel-bg)',
        boxShadow: 'var(--ms-panel-shadow)',
      }}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--ms-text-muted)' }}>
        {m.edgePanel.title}
      </span>
      <input
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
        placeholder={m.edgePanel.placeholder}
        className="rounded-xl border px-3 py-2 text-xs outline-none ring-indigo-400/40 focus:ring-2"
        style={{
          borderColor: 'var(--ms-panel-border)',
          background: 'var(--ms-input-bg)',
          color: 'var(--ms-text)',
        }}
      />
      <p className="text-[9px] leading-snug" style={{ color: 'var(--ms-text-faint)' }}>
        {m.edgePanel.hint}
      </p>
      {label.trim() ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg px-2 py-1.5 text-[10px] transition hover:opacity-80"
          style={{ color: 'var(--ms-text-muted)' }}
        >
          {m.edgePanel.clearLabel}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg border border-red-400/20 bg-red-400/10 px-2 py-1.5 text-[10px] font-medium text-red-600 transition hover:bg-red-400/20"
      >
        {m.edgePanel.delete}
      </button>
    </div>
  );
}

function FontSizeControl({
  label,
  value,
  onChange,
  decreaseAria,
  increaseAria,
  unit,
  min,
  max,
  clamp,
}: {
  label: string;
  value: number;
  onChange: (size: number) => void;
  decreaseAria: string;
  increaseAria: string;
  unit: string;
  min: number;
  max: number;
  clamp: (size: number) => number;
}) {
  const step = (delta: number) => onChange(clamp(value + delta));

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--ms-text-muted)' }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={value <= min}
          aria-label={decreaseAria}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-35"
          style={{
            borderColor: 'var(--ms-panel-border)',
            background: 'var(--ms-input-bg)',
            color: 'var(--ms-text-soft)',
          }}
        >
          −
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) onChange(clamp(next));
          }}
          aria-label={label}
          className="min-w-0 flex-1 rounded-xl border px-2 py-1.5 text-center text-xs outline-none ring-indigo-400/40 focus:ring-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          style={{
            borderColor: 'var(--ms-panel-border)',
            background: 'var(--ms-input-bg)',
            color: 'var(--ms-text)',
          }}
        />
        <span className="shrink-0 text-[10px]" style={{ color: 'var(--ms-text-muted)' }}>
          {unit}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={value >= max}
          aria-label={increaseAria}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-35"
          style={{
            borderColor: 'var(--ms-panel-border)',
            background: 'var(--ms-input-bg)',
            color: 'var(--ms-text-soft)',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function SelectionPanel({
  nodeType,
  color,
  label,
  text,
  labelFontSize,
  textFontSize,
  onColorChange,
  onLabelChange,
  onTextChange,
  onLabelFontSizeChange,
  onTextFontSizeChange,
}: {
  nodeType: 'text' | 'plain' | 'group' | 'link' | 'file';
  color?: string;
  label?: string;
  text?: string;
  labelFontSize?: number;
  textFontSize?: number;
  onColorChange: (color: string) => void;
  onLabelChange: (label: string) => void;
  onTextChange?: (text: string) => void;
  onLabelFontSizeChange?: (size: number) => void;
  onTextFontSizeChange?: (size: number) => void;
}) {
  const { m } = useLocale();
  const isGroup = nodeType === 'group';
  const isTextCard = nodeType === 'text';
  const isPlain = nodeType === 'plain';
  const resolvedTitleSize = labelFontSize ?? DEFAULT_LABEL_FONT_SIZE;
  const resolvedBodySize = textFontSize ?? DEFAULT_TEXT_FONT_SIZE;
  const resolvedPlainSize = textFontSize ?? DEFAULT_PLAIN_FONT_SIZE;
  const resolvedGroupLabelSize = labelFontSize ?? DEFAULT_GROUP_LABEL_FONT_SIZE;

  const panelTitle = isGroup
    ? m.selectionPanel.group
    : isPlain
      ? m.selectionPanel.plain
      : m.selectionPanel.card;

  return (
    <div
      className="no-print pointer-events-auto absolute right-2 top-20 z-20 flex w-52 flex-col gap-3 rounded-2xl border p-3 backdrop-blur-2xl sm:right-4 sm:top-24 sm:w-56"
      style={{
        borderColor: 'var(--ms-panel-border)',
        background: 'var(--ms-panel-bg)',
        boxShadow: 'var(--ms-panel-shadow)',
      }}
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--ms-text-muted)' }}>
          {panelTitle}
        </span>
        {isPlain ? (
          <textarea
            value={text ?? ''}
            onChange={(e) => onTextChange?.(e.target.value)}
            placeholder={m.selectionPanel.plainPlaceholder}
            rows={3}
            className="rounded-xl border px-3 py-2 text-xs outline-none ring-indigo-400/40 focus:ring-2"
            style={{
              borderColor: 'var(--ms-panel-border)',
              background: 'var(--ms-input-bg)',
              color: 'var(--ms-text)',
            }}
          />
        ) : (
          <input
            value={label ?? ''}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder={isGroup ? m.selectionPanel.groupNamePlaceholder : m.selectionPanel.cardNamePlaceholder}
            className="rounded-xl border px-3 py-2 text-xs outline-none ring-indigo-400/40 focus:ring-2"
            style={{
              borderColor: 'var(--ms-panel-border)',
              background: 'var(--ms-input-bg)',
              color: 'var(--ms-text)',
            }}
          />
        )}
      </div>
      {isGroup && onLabelFontSizeChange && (
        <FontSizeControl
          label={m.selectionPanel.groupLabelFontSize}
          value={resolvedGroupLabelSize}
          onChange={onLabelFontSizeChange}
          decreaseAria={m.selectionPanel.groupLabelFontSizeDecrease}
          increaseAria={m.selectionPanel.groupLabelFontSizeIncrease}
          unit={m.selectionPanel.fontSizeUnit}
          min={MIN_GROUP_LABEL_FONT_SIZE}
          max={MAX_GROUP_LABEL_FONT_SIZE}
          clamp={clampGroupLabelFontSize}
        />
      )}
      {isTextCard && onLabelFontSizeChange && (
        <FontSizeControl
          label={m.selectionPanel.titleFontSize}
          value={resolvedTitleSize}
          onChange={onLabelFontSizeChange}
          decreaseAria={m.selectionPanel.titleFontSizeDecrease}
          increaseAria={m.selectionPanel.titleFontSizeIncrease}
          unit={m.selectionPanel.fontSizeUnit}
          min={MIN_CARD_FONT_SIZE}
          max={MAX_CARD_FONT_SIZE}
          clamp={clampCardFontSize}
        />
      )}
      {isTextCard && onTextFontSizeChange && (
        <FontSizeControl
          label={m.selectionPanel.bodyFontSize}
          value={resolvedBodySize}
          onChange={onTextFontSizeChange}
          decreaseAria={m.selectionPanel.bodyFontSizeDecrease}
          increaseAria={m.selectionPanel.bodyFontSizeIncrease}
          unit={m.selectionPanel.fontSizeUnit}
          min={MIN_CARD_FONT_SIZE}
          max={MAX_CARD_FONT_SIZE}
          clamp={clampCardFontSize}
        />
      )}
      {isPlain && onTextFontSizeChange && (
        <FontSizeControl
          label={m.selectionPanel.plainFontSize}
          value={resolvedPlainSize}
          onChange={onTextFontSizeChange}
          decreaseAria={m.selectionPanel.plainFontSizeDecrease}
          increaseAria={m.selectionPanel.plainFontSizeIncrease}
          unit={m.selectionPanel.fontSizeUnit}
          min={MIN_PLAIN_FONT_SIZE}
          max={MAX_PLAIN_FONT_SIZE}
          clamp={clampPlainFontSize}
        />
      )}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--ms-text-muted)' }}>
          {m.selectionPanel.color}
        </span>
        <div className="grid grid-cols-6 gap-1.5">
          {COLOR_IDS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onColorChange(c)}
              className={`h-6 w-6 rounded-full border-2 transition hover:scale-110 ${
                color === c ? 'scale-110 border-indigo-500' : 'border-transparent'
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
