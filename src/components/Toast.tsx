import { useLocale } from '../i18n/LocaleProvider';

type ToastProps = {
  message: string;
  onClose: () => void;
  variant?: 'success' | 'error';
};

export function Toast({ message, onClose, variant = 'success' }: ToastProps) {
  const { m } = useLocale();
  const isError = variant === 'error';

  return (
    <div
      className={`board-toast no-print pointer-events-auto absolute inset-x-3 z-30 mx-auto max-w-md sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 ${
        isError ? '' : ''
      }`}
    >
      <div
        className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur-xl ${
          isError
            ? 'border-red-400/35 bg-red-950/90 text-red-50'
            : 'border-emerald-400/35 bg-emerald-950/90 text-emerald-50'
        }`}
      >
        <span className={`text-base leading-none ${isError ? 'text-red-300' : 'text-emerald-300'}`}>
          {isError ? '!' : '✓'}
        </span>
        <p className="flex-1 leading-snug">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className={`shrink-0 transition ${
            isError
              ? 'text-red-200/60 hover:text-red-100'
              : 'text-emerald-200/60 hover:text-emerald-100'
          }`}
          aria-label={m.toast.close}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
