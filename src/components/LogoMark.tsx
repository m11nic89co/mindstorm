import { useLocale } from '../i18n/LocaleProvider';

export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#141829] via-[#1a1540] to-[#231454] shadow-[0_4px_24px_-4px_rgba(99,102,241,0.55)] ring-1 ring-white/20 ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(129,140,248,0.35),transparent_55%)]" />
      <svg viewBox="0 0 36 36" className="relative h-full w-full p-[7px]" fill="none">
        <circle cx="11" cy="18" r="4.5" fill="#a5b4fc" />
        <circle cx="11" cy="18" r="4.5" fill="url(#logoCore)" />
        <circle cx="25" cy="10" r="3.8" fill="#6366f1" />
        <circle cx="25" cy="26" r="3.8" fill="#8b5cf6" />
        <path
          d="M15.5 18 H19.5 M19.5 18 L25 10 M19.5 18 L25 26"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <radialGradient id="logoCore" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(11 18) rotate(90) scale(4.5)">
            <stop stopColor="#c7d2fe" />
            <stop offset="1" stopColor="#818cf8" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

export function BoardStatsText({ nodeCount, edgeCount }: { nodeCount: number; edgeCount: number }) {
  const { m } = useLocale();
  return `${m.boardStats.cards(nodeCount)} · ${m.boardStats.links(edgeCount)}`;
}
