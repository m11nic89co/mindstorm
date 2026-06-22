import { useMemo, useState } from 'react';
import { useLocale } from '../i18n/LocaleProvider';
import type { JsonCanvas } from '../types/jsonCanvas';
import {
  SaveCancelledError,
  buildFilename,
  buildTimestampSaveTitle,
  saveBoardToDisk,
  saveSuccessMessage,
} from '../lib/localBoardFile';

type ModalShellProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

function ModalShell({ title, onClose, children }: ModalShellProps) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12162a]/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-white/50 transition hover:bg-white/10 hover:text-white"
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
  onClose,
  onSaved,
}: {
  defaultName?: string;
  canvas: JsonCanvas;
  onClose: () => void;
  onSaved: (name: string, message: string) => void;
}) {
  const { m } = useLocale();
  const [name, setName] = useState(defaultName ?? buildTimestampSaveTitle());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const previewFilename = useMemo(() => buildFilename(name), [name]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(m.saveModal.enterName);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await saveBoardToDisk(trimmed, canvas, {
        defaultTitle: m.file.defaultTitle,
        typeDescription: m.file.typeDescription,
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
      <p className="mb-3 text-xs leading-relaxed text-white/55">{m.saveModal.description}</p>
      <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/40">{m.saveModal.nameLabel}</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !busy) void handleSave();
        }}
        disabled={busy || Boolean(done)}
        className="mb-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-indigo-400/40 focus:ring-2 disabled:opacity-60"
        placeholder={m.saveModal.namePlaceholder}
        autoFocus
      />
      <p className="mb-4 text-[11px] text-white/40">
        {m.saveModal.filenamePrefix} <code className="text-cyan-300">{previewFilename}</code>
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
