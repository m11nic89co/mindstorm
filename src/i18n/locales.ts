export const LOCALES = ['ru', 'en', 'es', 'zh'] as const;
export type Locale = typeof LOCALES[number];

export const LOCALE_LABEL: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  es: 'ES',
  zh: '中',
};

export const LOCALE_ARIA: Record<Locale, string> = {
  ru: 'Русский язык',
  en: 'English language',
  es: 'Español',
  zh: '简体中文',
};

/** Атрибут lang для <html> */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  ru: 'ru',
  en: 'en',
  es: 'es',
  zh: 'zh-CN',
};

const FALLBACK_ORDER: Record<Locale, readonly Locale[]> = {
  ru: ['ru', 'en', 'es', 'zh'],
  en: ['en', 'ru', 'es', 'zh'],
  es: ['es', 'en', 'ru', 'zh'],
  zh: ['zh', 'en', 'ru', 'es'],
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function pickFromLocaleMap<T>(
  map: Partial<Record<Locale, T>> | undefined,
  locale: Locale,
): T | undefined {
  if (!map) return undefined;
  for (const key of FALLBACK_ORDER[locale]) {
    const value = map[key];
    if (value !== undefined) return value;
  }
  return undefined;
}
