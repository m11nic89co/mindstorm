import { useCallback, useEffect, useRef, useState } from 'react';

type DemoSplashProps = {
  visible: boolean;
  onClose: () => void;
  nodeCount: number;
  edgeCount: number;
  groupCount: number;
};

const AUTO_CLOSE_MS = 6000;
const EXIT_MS = 280;

export function DemoSplash({
  visible,
  onClose,
  nodeCount,
  edgeCount,
  groupCount,
}: DemoSplashProps) {
  const [exiting, setExiting] = useState(false);
  const autoCloseTimer = useRef<number | undefined>(undefined);
  const exitTimer = useRef<number | undefined>(undefined);

  const dismiss = useCallback(() => {
    window.clearTimeout(autoCloseTimer.current);
    window.clearTimeout(exitTimer.current);
    setExiting(true);
    exitTimer.current = window.setTimeout(onClose, EXIT_MS);
  }, [onClose]);

  useEffect(() => {
    if (!visible) {
      setExiting(false);
      return;
    }

    autoCloseTimer.current = window.setTimeout(dismiss, AUTO_CLOSE_MS);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(autoCloseTimer.current);
      window.clearTimeout(exitTimer.current);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="demo-welcome-host pointer-events-none absolute inset-x-0 z-[21] flex justify-center px-3 sm:px-4"
      data-exiting={exiting || undefined}
    >
      <div className="demo-welcome pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-2xl border border-cyan-400/20 bg-[#12162a]/94 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:gap-4 sm:p-4">
        <div
          className="demo-welcome-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/15 to-indigo-500/10 text-lg text-cyan-200 sm:h-12 sm:w-12 sm:text-xl"
          aria-hidden
        >
          ✦
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-cyan-300/70 sm:text-[11px]">
                Добро пожаловать
              </p>
              <h2 className="truncate text-sm font-semibold tracking-tight text-white sm:text-base">
                Демо MindStorm
              </h2>
              <p className="mt-0.5 text-xs leading-snug text-white/50 sm:text-[13px]">
                Исследуйте схему запуска продукта на холсте ниже
              </p>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="demo-welcome-close -mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 text-sm text-white/45 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3">
            <StatChip label={`${nodeCount} карточек`} />
            <StatChip label={`${groupCount} группы`} />
            <StatChip label={`${edgeCount} связи`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/45 sm:px-2.5 sm:py-1 sm:text-[11px]">
      {label}
    </span>
  );
}

export const DEMO_WELCOME_SEEN_KEY = 'mindstorm.demoWelcomeSeen.v1';
