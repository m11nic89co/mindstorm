import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../i18n/LocaleProvider';
import { captureBoardPng } from '../lib/exportPng';
import type { PrintScope } from '../lib/printBoard';
import type { JsonCanvas } from '../types/jsonCanvas';
import {
  SaveCancelledError,
  buildFilename,
  buildPngRelativePath,
  saveBoardToDisk,
  saveSuccessMessage,
  suggestSaveTitle,
} from '../lib/localBoardFile';

type ModalShellProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

function ModalShell({ title, onClose, children }: ModalShellProps) {
  return (
    <div className="no-print pointer-events-auto fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{
          borderColor: 'var(--ms-panel-border)',
          background: 'var(--ms-modal-bg)',
          color: 'var(--ms-text)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: 'var(--ms-panel-border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--ms-text)' }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 transition hover:opacity-80"
            style={{ color: 'var(--ms-text-muted)' }}
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export function SaveBoardModal({
  defaultName,
  canvas,
  capturePng,
  onClose,
  onSaved,
}: {
  defaultName?: string;
  canvas: JsonCanvas;
  /** Опциональный снимок холста (например с fitView); иначе — встроенный capture. */
  capturePng?: () => Promise<Blob | undefined>;
  onClose: () => void;
  onSaved: (name: string, message: string) => void;
}) {
  const { m } = useLocale();
  const [name, setName] = useState(defaultName ?? suggestSaveTitle(null));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const previewFilename = useMemo(() => buildPngRelativePath(name), [name]);
  const boardFilename = useMemo(() => buildFilename(name), [name]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(m.saveModal.enterName);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      let pngBlob: Blob | undefined;
      if (capturePng) {
        pngBlob = await capturePng();
      } else {
        try {
          pngBlob = await captureBoardPng({ backgroundColor: '#0b0d14', pixelRatio: 2 });
        } catch {
          pngBlob = undefined;
        }
      }
      const result = await saveBoardToDisk(trimmed, canvas, {
        defaultTitle: m.file.defaultTitle,
        typeDescription: m.file.typeDescription,
        pngTypeDescription: m.file.pngTypeDescription,
        pngBlob,
        skipNativePicker: true,
      });
      const message = saveSuccessMessage(result, m.file);
      setDone(message);
      onSaved(trimmed, message);
      window.setTimeout(() => onClose(), 1200);
    } catch (err) {
      if (err instanceof SaveCancelledError) return;
      setError(err instanceof Error ? err.message : m.saveModal.saveFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title={m.saveModal.title} onClose={onClose}>
      <p className="mb-3 text-xs leading-relaxed" style={{ color: 'var(--ms-text-muted)' }}>
        {m.saveModal.description}
      </p>
      <label
        className="mb-1 block text-[10px] uppercase tracking-wider"
        style={{ color: 'var(--ms-text-muted)' }}
      >
        {m.saveModal.nameLabel}
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !busy) void handleSave();
        }}
        disabled={busy || Boolean(done)}
        className="mb-2 w-full rounded-xl border px-3 py-2 text-sm outline-none ring-indigo-400/40 focus:ring-2 disabled:opacity-60"
        style={{
          borderColor: 'var(--ms-panel-border)',
          background: 'var(--ms-input-bg)',
          color: 'var(--ms-text)',
        }}
        placeholder={m.saveModal.namePlaceholder}
        autoFocus
      />
      <p className="mb-4 text-[11px]" style={{ color: 'var(--ms-text-muted)' }}>
        {m.saveModal.filenamePrefix}{' '}
        <code style={{ color: 'var(--ms-accent-text)' }}>{boardFilename}</code>
        <span className="mx-1 opacity-40">+</span>
        <code style={{ color: 'var(--ms-accent-text)' }}>{previewFilename}</code>
      </p>
      {error && <p className="mb-3 text-xs text-red-300">{error}</p>}
      {done && (
        <p className="mb-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100">
          {done}
        </p>
      )}
      <button
        type="button"
        disabled={busy || Boolean(done)}
        onClick={() => void handleSave()}
        className="w-full rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50"
      >
        {busy ? m.saveModal.saving : done ? m.saveModal.done : m.saveModal.saveButton}
      </button>
    </ModalShell>
  );
}

export function PrintBoardModal({
  hasSelection,
  onClose,
  onConfirm,
}: {
  hasSelection: boolean;
  onClose: () => void;
  onConfirm: (scope: PrintScope) => void;
}) {
  const { m } = useLocale();
  const [scope, setScope] = useState<PrintScope>(hasSelection ? 'selection' : 'all');

  useEffect(() => {
    setScope(hasSelection ? 'selection' : 'all');
  }, [hasSelection]);

  return (
    <ModalShell title={m.printModal.title} onClose={onClose}>
      <p className="mb-3 text-xs leading-relaxed" style={{ color: 'var(--ms-text-muted)' }}>
        {m.printModal.description}
      </p>

      <div className="flex flex-col gap-2">
        <PrintScopeOption
          active={scope === 'all'}
          title={m.printModal.all}
          hint={m.printModal.allHint}
          onClick={() => setScope('all')}
        />
        <PrintScopeOption
          active={scope === 'selection'}
          disabled={!hasSelection}
          title={m.printModal.selection}
          hint={hasSelection ? m.printModal.selectionHint : m.printModal.selectionEmpty}
          onClick={() => setScope('selection')}
        />
      </div>

      <p className="mt-3 text-[11px] leading-snug" style={{ color: 'var(--ms-text-faint)' }}>
        {m.printModal.layoutHint}
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-80"
          style={{
            borderColor: 'var(--ms-panel-border)',
            color: 'var(--ms-text-soft)',
            background: 'var(--ms-btn-bg)',
          }}
        >
          {m.printModal.cancel}
        </button>
        <button
          type="button"
          onClick={() => onConfirm(scope)}
          disabled={scope === 'selection' && !hasSelection}
          className="flex-1 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {m.printModal.confirm}
        </button>
      </div>
    </ModalShell>
  );
}

function PrintScopeOption({
  active,
  disabled = false,
  title,
  hint,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
        active ? 'ring-2 ring-indigo-400/45' : 'hover:opacity-90'
      }`}
      style={{
        borderColor: active ? 'rgba(99, 102, 241, 0.45)' : 'var(--ms-panel-border)',
        background: active ? 'var(--ms-lang-active)' : 'var(--ms-input-bg)',
      }}
    >
      <div className="text-sm font-medium" style={{ color: 'var(--ms-text)' }}>
        {title}
      </div>
      <div className="mt-0.5 text-[11px] leading-snug" style={{ color: 'var(--ms-text-muted)' }}>
        {hint}
      </div>
    </button>
  );
}
