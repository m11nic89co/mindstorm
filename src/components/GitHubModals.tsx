import { useCallback, useEffect, useRef, useState } from 'react';
import type { JsonCanvas } from '../types/jsonCanvas';
import { useGitHubAuth } from '../context/GitHubAuthContext';
import {
  completeDeviceLogin,
  startDeviceFlow,
  type DeviceFlowStart,
} from '../lib/githubAuth';
import {
  formatBoardTimestamp,
  getActiveBoard,
  listGitHubBoards,
  loadGitHubBoard,
  saveGitHubBoard,
  sharedRepoLabel,
  type GitHubBoardMeta,
} from '../lib/githubStorage';

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

export function GitHubLoginModal({
  onClose,
  onLoggedIn,
  reason,
}: {
  onClose: () => void;
  onLoggedIn?: () => void;
  reason?: string;
}) {
  const { oauthConfigured, setSession } = useGitHubAuth();
  const [flow, setFlow] = useState<DeviceFlowStart | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const begin = useCallback(async () => {
    setBusy(true);
    setError(null);
    setStatus(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const started = await startDeviceFlow();
      setFlow(started);
      setStatus('Ожидаем подтверждение на GitHub…');
      const session = await completeDeviceLogin(
        started.deviceCode,
        started.interval,
        abortRef.current.signal,
      );
      setSession(session);
      onLoggedIn?.();
      onClose();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Ошибка входа');
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }, [onClose, onLoggedIn, setSession]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <ModalShell title="Вход через GitHub" onClose={onClose}>
      {reason && (
        <p className="mb-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-100/90">
          {reason}
        </p>
      )}

      <p className="mb-3 text-xs leading-relaxed text-white/55">
        Общее хранилище схем — репозиторий{' '}
        <code className="text-indigo-300">{sharedRepoLabel()}</code>. Войдите своим GitHub-аккаунтом,
        чтобы сохранять и редактировать доски вместе с командой.
      </p>

      {!oauthConfigured ? (
        <div className="rounded-xl border border-dashed border-white/15 px-4 py-4 text-xs leading-relaxed text-white/50">
          OAuth-приложение ещё не настроено. Владельцу нужно создать GitHub OAuth App и указать{' '}
          <code className="text-cyan-300">VITE_GITHUB_CLIENT_ID</code> при сборке. Подробности — в README.
        </div>
      ) : flow ? (
        <div className="mb-4 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/55">1. Откройте страницу GitHub и введите код:</p>
          <a
            href={flow.verificationUri}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl bg-[#24292f] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#32383f]"
          >
            github.com/login/device
          </a>
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 py-3 text-center">
            <span className="text-[10px] uppercase tracking-wider text-white/40">Код</span>
            <div className="mt-1 font-mono text-2xl font-bold tracking-[0.25em] text-cyan-200">
              {flow.userCode}
            </div>
          </div>
          {status && <p className="text-center text-xs text-white/45">{status}</p>}
        </div>
      ) : (
        <p className="mb-4 text-xs text-white/45">
          Нажмите «Войти» — откроется код для подтверждения на GitHub. Токены вручную вводить не нужно.
        </p>
      )}

      {error && <p className="mb-3 text-xs text-red-300">{error}</p>}

      <div className="flex gap-2">
        {oauthConfigured && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void begin()}
            className="flex-1 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50"
          >
            {busy ? 'Подключаю…' : flow ? 'Повторить' : 'Войти через GitHub'}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5"
        >
          Отмена
        </button>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-white/35">
        Доступ к записи: владелец добавляет сотрудников в{' '}
        <strong className="text-white/50">Settings → Collaborators</strong> репозитория. Чтение схем доступно всем.
      </p>
    </ModalShell>
  );
}

export function GitHubAccountModal({ onClose }: { onClose: () => void }) {
  const { session, isAuthenticated, logout } = useGitHubAuth();

  if (!isAuthenticated || !session) {
    return null;
  }

  return (
    <ModalShell title="Аккаунт GitHub" onClose={onClose}>
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <img
          src={session.user.avatar_url}
          alt=""
          className="h-12 w-12 rounded-full border border-white/10"
        />
        <div>
          <div className="text-sm font-medium text-white">
            {session.user.name ?? session.user.login}
          </div>
          <div className="text-xs text-white/45">@{session.user.login}</div>
        </div>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-white/50">
        Вы можете сохранять схемы в общее хранилище{' '}
        <code className="text-cyan-300">{sharedRepoLabel()}/canvases/</code>.
      </p>
      <button
        type="button"
        onClick={() => {
          logout();
          onClose();
        }}
        className="w-full rounded-xl border border-red-400/30 px-4 py-2.5 text-sm text-red-200 transition hover:bg-red-400/10"
      >
        Выйти
      </button>
    </ModalShell>
  );
}

export function SaveToGitHubModal({
  defaultName,
  canvas,
  onClose,
  onSaved,
  onNeedLogin,
}: {
  defaultName?: string;
  canvas: JsonCanvas;
  onClose: () => void;
  onSaved: (name: string) => void;
  onNeedLogin: () => void;
}) {
  const { isAuthenticated, session } = useGitHubAuth();
  const active = getActiveBoard();
  const [name, setName] = useState(defaultName ?? active?.name ?? 'моя-схема');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) onNeedLogin();
  }, [isAuthenticated, onNeedLogin]);

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    try {
      const saved = await saveGitHubBoard(name, canvas);
      onSaved(saved.name);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка сохранения';
      if (message === 'AUTH_REQUIRED') {
        onNeedLogin();
        return;
      }
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <ModalShell title="↑ Сохранить в GitHub" onClose={onClose}>
      <p className="mb-3 text-xs text-white/55">
        Схема попадёт в общую папку <code className="text-cyan-300">canvases/</code> — её увидят все участники
        команды.
      </p>
      {session && (
        <p className="mb-3 text-[11px] text-white/40">
          Сохраняете как <strong className="text-white/60">@{session.user.login}</strong>
        </p>
      )}
      <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/40">Название</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-indigo-400/40 focus:ring-2"
        placeholder="брейншторм-2026"
      />
      {error && <p className="mb-3 text-xs text-red-300">{error}</p>}
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleSave()}
        className="w-full rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50"
      >
        {busy ? 'Сохраняю…' : 'Сохранить в GitHub'}
      </button>
    </ModalShell>
  );
}

export function LoadFromGitHubModal({
  onClose,
  onLoad,
}: {
  onClose: () => void;
  onLoad: (canvas: JsonCanvas, name: string) => void;
}) {
  const { isAuthenticated } = useGitHubAuth();
  const [boards, setBoards] = useState<GitHubBoardMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBoards(await listGitHubBoards());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить список');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openBoard = async (meta: GitHubBoardMeta) => {
    setBusyPath(meta.path);
    setError(null);
    try {
      const canvas = await loadGitHubBoard(meta);
      onLoad(canvas, meta.name);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка открытия');
    } finally {
      setBusyPath(null);
    }
  };

  return (
    <ModalShell title="↓ Открыть из GitHub" onClose={onClose}>
      <p className="mb-3 text-xs text-white/55">
        Общее хранилище команды — <code className="text-cyan-300">{sharedRepoLabel()}/canvases/</code>.
        {!isAuthenticated && ' Для сохранения изменений понадобится вход через GitHub.'}
      </p>

      {loading && <p className="text-sm text-white/45">Загружаю список…</p>}
      {error && <p className="mb-3 text-xs text-red-300">{error}</p>}

      {!loading && boards.length === 0 && (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/40">
          Пока нет сохранённых схем. Войдите через GitHub и сохраните первую.
        </p>
      )}

      <ul className="space-y-2">
        {boards.map((board) => (
          <li key={board.path}>
            <button
              type="button"
              disabled={busyPath === board.path}
              onClick={() => void openBoard(board)}
              className="flex w-full flex-col gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-indigo-400/40 hover:bg-white/8 disabled:opacity-50"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-white">{board.name}</span>
                <span className="shrink-0 text-[11px] text-white/35">
                  {busyPath === board.path ? 'Открываю…' : `${Math.round(board.size / 1024) || 1} KB`}
                </span>
              </span>
              {board.updatedBy && (
                <span className="text-[11px] text-white/35">
                  {board.updatedByName ?? `@${board.updatedBy}`}
                  {board.updatedAt ? ` · ${formatBoardTimestamp(board.updatedAt)}` : ''}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => void refresh()}
        className="mt-4 w-full rounded-xl border border-white/10 py-2 text-xs text-white/50 transition hover:bg-white/5"
      >
        Обновить список
      </button>
    </ModalShell>
  );
}
