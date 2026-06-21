import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { messagesFor, type Messages } from './messages';
import type { Locale } from './locales';
import { LOCALE_HTML_LANG } from './locales';
import { readLocale, writeLocale } from './localeStorage';

type LocaleContextValue = {
  locale: Locale;
  m: Messages;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeLocale(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'ru' ? 'en' : 'ru');
  }, [locale, setLocale]);

  const m = useMemo(() => messagesFor(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = LOCALE_HTML_LANG[locale];
  }, [locale]);

  const value = useMemo(
    () => ({ locale, m, setLocale, toggleLocale }),
    [locale, m, setLocale, toggleLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
