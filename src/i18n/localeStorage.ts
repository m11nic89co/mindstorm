import type { Locale } from './locales';
import { isLocale } from './locales';

const LOCALE_KEY = 'mindstorm.locale.v1';

export function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored && isLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return 'ru';
}

export function writeLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    /* ignore */
  }
}
