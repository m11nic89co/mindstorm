import { isTheme, type Theme } from './themes';

const THEME_KEY = 'mindstorm.theme.v1';

export function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && isTheme(stored)) return stored;
  } catch {
    /* ignore */
  }
  return 'dark';
}

export function writeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}
