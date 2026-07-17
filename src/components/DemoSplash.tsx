import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '../i18n/LocaleProvider';

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
  const { m } = useLocale();
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
      className="demo-welcome-host no-print pointer-events-none absolute inset-x-0 z-[21] flex justify-center px-3 sm:px-4"
      data-exiting={exiting || undefined}
    >
      <div
        className="demo-welcome pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-2xl border border-cyan-400/25 p-3 shadow-[var(--ms-panel-shadow)] backdrop-blur-2xl sm:gap-4 sm:p-4"
        style={{ background: 'var(--ms-modal-bg)', color: 'var(--ms-text)' }}
      >
        <div
          className="demo-welcome-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/15 to-indigo-500/10 text-lg sm:h-12 sm:w-12 sm:text-xl"
          style={{ color: 'var(--ms-accent-text)' }}
          aria-hidden
        >
          ✦
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className="text-[10px] font-medium uppercase tracking-[0.14em] sm:text-[11px]"
                style={{ color: 'var(--ms-accent-text)' }}
              >
                {m.demoSplash.welcome}
              </p>
              <h2
                className="truncate text-sm font-semibold tracking-tight sm:text-base"
                style={{ color: 'var(--ms-text)' }}
              >
                {m.demoSplash.title}
              </h2>
              <p
                className="mt-0.5 text-xs leading-snug sm:text-[13px]"
                style={{ color: 'var(--ms-text-muted)' }}
              >
                {m.demoSplash.subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="demo-welcome-close -mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-sm transition hover:opacity-80"
              style={{
                borderColor: 'var(--ms-panel-border)',
                color: 'var(--ms-text-muted)',
              }}
              aria-label={m.demoSplash.close}
            >
              ✕
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3">
            <StatChip label={m.demoSplash.cards(nodeCount)} />
            <StatChip label={m.demoSplash.groups(groupCount)} />
            <StatChip label={m.demoSplash.links(edgeCount)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label }: { label: string }) {
  return (
    <span
      className="rounded-full border px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]"
      style={{
        borderColor: 'var(--ms-panel-border)',
        background: 'var(--ms-chip-bg)',
        color: 'var(--ms-text-muted)',
      }}
    >
      {label}
    </span>
  );
}

export const DEMO_WELCOME_SEEN_KEY = 'mindstorm.demoWelcomeSeen.v1';
