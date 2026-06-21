import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '../i18n/LocaleProvider';
import type { Locale } from '../i18n/locales';
import { pickFromLocaleMap } from '../i18n/locales';
import type { DonateMethod, DonatePlatform } from '../config/donate';
import { DONATE_METHODS, hasDonateOptions } from '../config/donate';

const COPY_FLASH_MS = 700;
const COPY_LABEL_MS = 2600;

const PLATFORM_STYLES: Record<DonatePlatform, { button: string; badge: string }> = {
  paypal: {
    button:
      'border-blue-400/35 bg-[#0070ba]/18 text-blue-50 hover:border-blue-300/50 hover:bg-[#0070ba]/28',
    badge: 'bg-[#0070ba]/35 text-blue-50',
  },
  kofi: {
    button:
      'border-sky-400/30 bg-sky-500/12 text-sky-50 hover:border-sky-400/50 hover:bg-sky-500/22',
    badge: 'bg-sky-500/25 text-sky-100',
  },
  buymeacoffee: {
    button:
      'border-amber-400/35 bg-amber-500/14 text-amber-50 hover:border-amber-400/55 hover:bg-amber-500/24',
    badge: 'bg-amber-500/30 text-amber-50',
  },
  boosty: {
    button:
      'border-orange-400/30 bg-orange-500/12 text-orange-50 hover:border-orange-400/50 hover:bg-orange-500/22',
    badge: 'bg-orange-500/25 text-orange-100',
  },
  crypto: {
    button:
      'border-emerald-400/30 bg-emerald-500/10 text-emerald-50 hover:border-emerald-400/45 hover:bg-emerald-500/18',
    badge: 'bg-emerald-500/25 text-emerald-100',
  },
};

function methodHint(method: DonateMethod, locale: Locale): string {
  return pickFromLocaleMap(
    {
      ru: method.hintRu,
      en: method.hintEn,
      es: method.hintEs,
      zh: method.hintZh,
    },
    locale,
  ) ?? method.hintEn;
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DonateChip() {
  const { locale, m } = useLocale();
  const [open, setOpen] = useState(false);
  const [cryptoOpen, setCryptoOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const copyTimersRef = useRef<{ label?: number; flash?: number }>({});

  const closePanel = useCallback(() => setOpen(false), []);

  const copyWallet = useCallback(async (id: string, wallet: string) => {
    try {
      await navigator.clipboard.writeText(wallet);
      window.clearTimeout(copyTimersRef.current.label);
      window.clearTimeout(copyTimersRef.current.flash);

      setCopiedId(id);
      setFlashId(id);

      copyTimersRef.current.flash = window.setTimeout(() => setFlashId(null), COPY_FLASH_MS);
      copyTimersRef.current.label = window.setTimeout(() => setCopiedId(null), COPY_LABEL_MS);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setCryptoOpen(true);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel();
    };

    const onPointer = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        closePanel();
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [open, closePanel]);

  useEffect(() => {
    return () => {
      window.clearTimeout(copyTimersRef.current.label);
      window.clearTimeout(copyTimersRef.current.flash);
    };
  }, []);

  if (!hasDonateOptions()) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[8px] font-medium text-amber-100/85 transition hover:border-amber-400/35 hover:bg-amber-400/20 hover:text-amber-50 sm:text-[9px]"
        title={m.footer.donateTitle}
        aria-expanded={open}
      >
        {m.footer.donate}
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="pointer-events-auto absolute bottom-full left-1/2 z-30 mb-2 max-h-[min(75vh,26rem)] w-[min(calc(100vw-1.5rem),21rem)] -translate-x-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-[#12182a]/97 p-3 shadow-2xl backdrop-blur-xl"
          role="dialog"
          aria-label={m.footer.donateTitle}
          aria-modal="true"
        >
          <div className="mb-2.5 flex items-start justify-between gap-2">
            <div className="min-w-0 pr-1">
              <p className="text-[11px] font-semibold text-white/92">{m.footer.donateTitle}</p>
              <p className="mt-0.5 text-[9px] leading-relaxed text-white/42">{m.footer.donateHint}</p>
            </div>
            <button
              type="button"
              onClick={closePanel}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/45 transition hover:border-white/20 hover:bg-white/10 hover:text-white/80"
              aria-label={m.footer.donateClose}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {DONATE_METHODS.map((method) => {
              const styles = PLATFORM_STYLES[method.platform];
              const hint = methodHint(method, locale);

              if (method.kind === 'link') {
                return (
                  <a
                    key={method.id}
                    href={method.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99] ${styles.button}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${styles.badge}`}
                      >
                        {method.label}
                      </span>
                      <span className="text-[10px] font-medium opacity-90">{m.footer.donateOpen}</span>
                    </span>
                    {hint ? <span className="text-[9px] leading-snug opacity-80">{hint}</span> : null}
                  </a>
                );
              }

              return (
                <div key={method.id} className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setCryptoOpen((value) => !value)}
                    className={`flex w-full flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99] ${styles.button}`}
                    aria-expanded={cryptoOpen}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${styles.badge}`}
                      >
                        {method.label}
                      </span>
                      <span className="text-[10px] font-medium opacity-90">
                        {cryptoOpen ? m.footer.donateCryptoHide : m.footer.donateCryptoShow}
                      </span>
                    </span>
                    {hint ? <span className="text-[9px] leading-snug opacity-80">{hint}</span> : null}
                  </button>

                  {cryptoOpen ? (
                    <div className="flex flex-col gap-1.5 pl-1">
                      {method.wallets.map((item) => {
                        const id = `${item.label}-${item.wallet.slice(0, 8)}`;
                        const isCopied = copiedId === id;
                        const isFlashing = flashId === id;

                        return (
                          <div
                            key={id}
                            className={`rounded-xl border bg-black/30 p-2.5 transition-colors ${
                              isFlashing ? 'donate-wallet-flash border-emerald-400/55' : 'border-white/8'
                            } ${isCopied ? 'border-emerald-400/35' : ''}`}
                          >
                            <div className="mb-1 text-[9px] font-medium text-white/40">
                              USDT · {item.label}
                            </div>
                            {item.min ? (
                              <div className="mb-1 text-[9px] text-white/28">
                                {m.footer.donateMin}: {item.min}
                              </div>
                            ) : null}
                            <div
                              className={`mb-2 break-all font-mono text-[10px] leading-snug transition-colors ${
                                isCopied ? 'text-emerald-200' : 'text-cyan-100/90'
                              }`}
                            >
                              {item.wallet}
                            </div>
                            <button
                              type="button"
                              onClick={() => void copyWallet(id, item.wallet)}
                              className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-medium transition ${
                                isCopied
                                  ? 'donate-copy-pulse border-emerald-400/45 bg-emerald-500/25 text-emerald-100'
                                  : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <CheckIcon />
                                  {m.footer.donateCopied}
                                </>
                              ) : (
                                m.footer.donateCopy
                              )}
                            </button>
                            {isCopied ? (
                              <p className="mt-1.5 text-center text-[9px] font-medium text-emerald-300/85">
                                {m.footer.donateCopiedHint}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}
