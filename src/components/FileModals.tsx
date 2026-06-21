import { useState } from 'react';
import type { JsonCanvas } from '../types/jsonCanvas';
import { downloadBoardFile } from '../lib/localBoardFile';

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
  onSaved: (name: string) => void;
}) {
  const [name, setName] = useState(defaultName ?? 'моя-схема');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    downloadBoardFile(trimmed, canvas);
    onSaved(trimmed);
    onClose();
  };

  return (
    <ModalShell title="Сохранить на компьютер" onClose={onClose}>
      <p className="mb-3 text-xs text-white/55">
        Файл <code className="text-cyan-300">.mindshtorm</code> — JSON с карточками, связями и группами.
        Можно хранить где угодно и открыть снова через «Загрузить».
      </p>
      <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/40">Название</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
        }}
        className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-indigo-400/40 focus:ring-2"
        placeholder="брейншторм-2026"
        autoFocus
      />
      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
      >
        Скачать файл
      </button>
    </ModalShell>
  );
}
