import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readTheme, writeTheme } from './themeStorage';
import type { Theme } from './themes';

type ThemeContextValue = {
  /** Тема для UI и палитр (во время печати может быть принудительно light). */
  theme: Theme;
  /** Сохранённая тема пользователя (без print-override). */
  preferredTheme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  /** На время печати — светлая тема, чтобы текст/фоны читались на бумаге. */
  setPrintLight: (active: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDocument(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#eef1f7' : '#0b0d14');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferredTheme, setPreferredTheme] = useState<Theme>(() => {
    const initial = readTheme();
    applyThemeToDocument(initial);
    return initial;
  });
  const [printLight, setPrintLightState] = useState(false);

  const theme: Theme = printLight ? 'light' : preferredTheme;

  const setTheme = useCallback((next: Theme) => {
    setPreferredTheme(next);
    writeTheme(next);
    if (!printLight) applyThemeToDocument(next);
  }, [printLight]);

  const toggleTheme = useCallback(() => {
    setTheme(preferredTheme === 'dark' ? 'light' : 'dark');
  }, [setTheme, preferredTheme]);

  const setPrintLight = useCallback((active: boolean) => {
    setPrintLightState(active);
  }, []);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, preferredTheme, setTheme, toggleTheme, setPrintLight }),
    [theme, preferredTheme, setTheme, toggleTheme, setPrintLight],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
