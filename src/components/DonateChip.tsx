import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '../i18n/LocaleProvider';
import type { DonateLink, DonatePlatform } from '../config/donate';
import { DONATE_WALLETS, activeDonateLinks, hasDonateOptions } from '../config/donate';

const PLATFORM_STYLES: Record<
  DonatePlatform,
  { button: string; badge: string }
> = {
  boosty: {
    button:
      'border-orange-400/30 bg-orange-500/12 text-orange-50 hover:border-orange-400/50 hover:bg-orange-500/22',
    badge: 'bg-orange-500/25 text-orange-100',
  },
  kofi: {
    button:
      'border-sky-400/30 bg-sky-500/12 text-sky-50 hover:border-sky-400/50 hover:bg-sky-500/22',
    badge: 'bg-sky-500/25 text-sky-100',
  },
  donationalerts: {
    button:
      'border-violet-400/30 bg-violet-500/12 text-violet-50 hover:border-violet-400/50 hover:bg-violet-500/22',
    badge: 'bg-violet-500/25 text-violet-100',
  },
  generic: {
    button:
      'border-indigo-400/25 bg-indigo-500/12 text-indigo-50 hover:border-indigo-400/45 hover:bg-indigo-500/22',
    badge: 'bg-indigo-500/25 text-indigo-100',
  },
};

function linkHint(link: DonateLink, locale: 'ru' | 'en'): string | undefined {
  return locale === 'ru' ? link.hintRu : link.hintEn;
}

export function DonateChip() {
  const { locale, m } = useLocale();
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const copyWallet = useCallback(async (id: string, wallet: string) => {
    try {
      await navigator.clipboard.writeText(wallet);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const onPointer = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  if (!hasDonateOptions()) return null;

  const wallets = DONATE_WALLETS.filter((item) => item.wallet.trim());
  const links = activeDonateLinks();

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
          className="pointer-events-auto absolute bottom-full left-1/2 z-30 mb-2 max-h-[min(70vh,24rem)] w-[min(calc(100vw-1.5rem),20rem)] -translate-x-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-[#12182a]/97 p-3 shadow-2xl backdrop-blur-xl"
          role="dialog"
          aria-label={m.footer.donateTitle}
        >
          <p className="mb-1 text-[11px] font-semibold text-white/92">{m.footer.donateTitle}</p>
          <p className="mb-3 text-[9px] leading-relaxed text-white/42">{m.footer.donateHint}</p>

          <div className="flex flex-col gap-3">
            {links.length > 0 ? (
              <section>
                <h3 className="mb-1.5 text-[8px] font-semibold uppercase tracking-widest text-white/28">
                  {m.footer.donateSectionCard}
                </h3>
                <div className="flex flex-col gap-1.5">
                  {links.map((link) => {
                    const styles = PLATFORM_STYLES[link.platform];
                    const hint = linkHint(link, locale);
                    return (
                      <a
                        key={link.platform + link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left transition ${styles.button}`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${styles.badge}`}
                          >
                            {link.label}
                          </span>
                          <span className="text-[10px] font-medium">{m.footer.donateOpen}</span>
                        </span>
                        {hint ? (
                          <span className="text-[9px] opacity-75">{hint}</span>
                        ) : null}
                      </a>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {wallets.length > 0 ? (
              <section>
                <h3 className="mb-1.5 text-[8px] font-semibold uppercase tracking-widest text-white/28">
                  {m.footer.donateSectionCrypto}
                </h3>
                <div className="flex flex-col gap-2">
                  {wallets.map((item) => {
                    const id = `${item.label}-${item.wallet.slice(0, 8)}`;
                    return (
                      <div
                        key={id}
                        className="rounded-xl border border-white/8 bg-black/25 p-2.5"
                      >
                        <div className="mb-1 text-[9px] font-medium uppercase tracking-wide text-white/35">
                          {item.label}
                        </div>
                        {item.min ? (
                          <div className="mb-1.5 text-[9px] text-white/30">
                            {m.footer.donateMin}: {item.min}
                          </div>
                        ) : null}
                        <div className="mb-2 break-all font-mono text-[10px] leading-snug text-cyan-100/90">
                          {item.wallet}
                        </div>
                        <button
                          type="button"
                          onClick={() => void copyWallet(id, item.wallet)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                        >
                          {copiedId === id ? m.footer.donateCopied : m.footer.donateCopy}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
