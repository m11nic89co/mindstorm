import type { ReactNode } from 'react';
import { LogoMark, boardStats } from './LogoMark';
import { AUTHOR_NAME, REPO_URL } from '../lib/siteMeta';

type ToolbarProps = {
  onAddText: () => void;
  onAddGroup: () => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
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
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  nodeCount,
  edgeCount,
  activeBoardName,
}: ToolbarProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:p-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:gap-2 sm:px-3">
        <div className="mr-1 flex shrink-0 items-center gap-2 border-r border-white/10 pr-2 sm:mr-2 sm:pr-3">
          <LogoMark />
          <div className="text-sm font-semibold tracking-tight text-white">MindStorm</div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 border-r border-white/10 pr-1 sm:gap-1 sm:pr-2">
          <ToolbarButton
            onClick={onUndo}
            disabled={!canUndo}
            title="Отменить (Ctrl+Z)"
            ariaLabel="Отменить"
          >
            ←
          </ToolbarButton>
          <ToolbarButton
            onClick={onRedo}
            disabled={!canRedo}
            title="Вернуть (Ctrl+Shift+Z)"
            ariaLabel="Вернуть"
          >
            →
          </ToolbarButton>
        </div>

        <div className="flex max-w-[calc(100vw-6rem)] items-center gap-1 overflow-x-auto sm:gap-2">
          <ToolbarButton onClick={onAddText} title="Добавить карточку">
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ Карточка</span>
          </ToolbarButton>
          <ToolbarButton onClick={onAddGroup} title="Добавить группу">
            <span className="sm:hidden">◻</span>
            <span className="hidden sm:inline">◻ Группа</span>
          </ToolbarButton>
          <ToolbarButton onClick={onSave} title="Сохранить схему в файл на компьютер">
            <span className="sm:hidden">💾</span>
            <span className="hidden sm:inline">Сохранить</span>
          </ToolbarButton>
          <ToolbarButton onClick={onLoad} title="Загрузить схему с компьютера">
            <span className="sm:hidden">📂</span>
            <span className="hidden sm:inline">Загрузить</span>
          </ToolbarButton>
          <ToolbarButton onClick={onReset} title="Загрузить демо-схему запуска MindStorm" accent>
            <span className="sm:hidden">↺</span>
            <span className="hidden sm:inline">↺ Демо</span>
          </ToolbarButton>
        </div>

        <div
          className="ml-2 hidden border-l border-white/10 pl-3 text-[11px] text-white/35 sm:block"
          title="Сколько карточек и линий на доске"
        >
          {activeBoardName ? (
            <span className="text-white/50">{activeBoardName} · </span>
          ) : null}
          {boardStats(nodeCount, edgeCount)}
        </div>
      </div>
    </header>
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
  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-1.5 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:gap-2 sm:p-4">
      <div className="rounded-full border border-white/8 bg-black/25 px-3 py-1.5 text-[10px] text-white/45 backdrop-blur-xl sm:px-4 sm:py-2 sm:text-[11px]">
        <span className="hidden sm:inline">
          Двойной клик — карточка · Ctrl+Z / Ctrl+Shift+Z — отмена / вернуть · Delete — удалить · Колёсико — масштаб
        </span>
        <span className="sm:hidden">Тап×2 — карточка · ⌘Z — отмена · Щипок — масштаб</span>
      </div>
      <div className="pointer-events-auto rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] text-white/40 backdrop-blur-xl sm:px-4 sm:text-[11px]">
        <span className="text-white/30">by </span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-cyan-300/80 transition hover:text-cyan-200"
        >
          {AUTHOR_NAME}
        </a>
        <span className="mx-1.5 text-white/15">·</span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/45 transition hover:text-white/70"
        >
          github.com/{AUTHOR_NAME}/mindstorm
        </a>
      </div>
    </footer>
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
  const colors = ['1', '2', '3', '4', '5', '6'] as const;
  const swatches: Record<string, string> = {
    '1': '#f87171',
    '2': '#fb923c',
    '3': '#facc15',
    '4': '#4ade80',
    '5': '#22d3ee',
    '6': '#c084fc',
  };

  return (
    <div className="pointer-events-auto absolute right-2 top-20 z-20 flex w-44 flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-2xl sm:right-4 sm:top-24 sm:w-48">
      {nodeType === 'group' && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">Группа</span>
          <input
            value={label ?? ''}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder="Название..."
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none ring-indigo-400/40 focus:ring-2"
          />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">Цвет</span>
        <div className="flex flex-wrap gap-1.5">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onColorChange(c)}
              className={`h-6 w-6 rounded-full border-2 transition hover:scale-110 ${
                color === c ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ background: swatches[c] }}
              title={`Цвет ${c}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
