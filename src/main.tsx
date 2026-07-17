import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LocaleProvider } from './i18n/LocaleProvider';
import { ThemeProvider } from './theme/ThemeProvider';
import { readTheme } from './theme/themeStorage';
import './index.css';

document.documentElement.dataset.theme = readTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </ThemeProvider>
  </StrictMode>,
);
