# Разработка MindStorm

## Требования

- **Node.js** 22 LTS (минимум 20+)
- **npm** 10+
- Windows: `C:\Program Files\nodejs` в PATH для PowerShell/Cursor

## Установка

```bash
npm install
npm run dev
```

Dev-сервер: http://localhost:5173 (`base: '/'`).

Production: `base: '/mindstorm/'` (`vite.config.ts`).

Если порт 5173 занят: `npm run dev -- --port 5174`

## Скрипты

| Команда | Действие |
|---------|----------|
| `npm run dev` | Vite dev server |
| `npm run test` | Unit-тесты (Vitest) |
| `npm run build` | `tsc -b && vite build` → `dist/` |
| `npm run preview` | Просмотр production build |
| `npm run deploy:pages` | Build + push `gh-pages` (запасной) |

## Деплой на GitHub Pages

### Основной способ (рекомендуется)

Push в `main` → **CI** (`.github/workflows/deploy.yml`) → `npm run test` → `npm run build` → сайт обновляется автоматически.

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
cd "G:\Мой диск\Projects\MindStorm"

git add .
git commit -m "Описание изменений"
git push origin main
```

Через ~30–60 с: https://m11nic89co.github.io/mindstorm/  
Обновление в браузере: **Ctrl+Shift+R**.

Git author при commit без настроенного `git config`:

```powershell
$env:GIT_AUTHOR_NAME = "m11nic89co"
$env:GIT_COMMITTER_NAME = "m11nic89co"
$env:GIT_AUTHOR_EMAIL = "58000724+m11nic89co@users.noreply.github.com"
$env:GIT_COMMITTER_EMAIL = "58000724+m11nic89co@users.noreply.github.com"
```

### Запасной способ — `deploy:pages`

```powershell
cd "G:\Мой диск\Projects\MindStorm"
npm run deploy:pages
```

Скрипт `scripts/deploy-pages.ps1`: build → `_pages/` → push `gh-pages`.

## Google Drive и Git

| Задача | Где |
|--------|-----|
| Код, Cursor, git commit/push | `G:\Мой диск\Projects\MindStorm` |
| `npm install` / `npm run test` / `npm run build` (если Drive ломает npm) | `C:\Projects\MindStorm` без `.git` |

```powershell
robocopy "G:\Мой диск\Projects\MindStorm\src" "C:\Projects\MindStorm\src" /MIR /NFL /NDL /NJH /NJS /nc /ns /np
cd C:\Projects\MindStorm
npm.cmd run test
npm.cmd run build
```

## Локализация (i18n)

1. Строки UI — в `src/i18n/messages.ts` (`messagesRu`, `messagesEn`, `messagesEs`, `messagesZh`).
2. В компонентах: `const { m } = useLocale()` → `m.toolbar.save` и т.д.
3. Демо-схема — `src/lib/demoCanvas.ts` (`DEMO_CANVAS_I18N`) + `src/lib/demoLocaleCopies.ts` (ES/ZH).
4. Ключ localStorage: `mindstorm.locale.v1`.
5. План группировки содержимого группы — [GROUPING.md](./GROUPING.md).
6. Новые строки темы/печати — `m.toolbar.theme*`, `m.toolbar.print*`, `m.printModal.*` (все 4 языка).

## Тема и печать

1. Тема: `src/theme/ThemeProvider.tsx`, стили `--ms-*` в `src/index.css`, ключ `mindstorm.theme.v1`.
2. Цвета карточек зависят от темы: `resolveColor(color, theme)`; цвет plain-текста — `textInk(color, theme)`.
3. Печать: фрагмент — `src/lib/printBoard.ts`; layout — `PRINT_SCALE = 1` в `src/lib/printLayout.ts`; UI — `PrintBoardModal`.
4. На время печати: `setPrintLight(true)` + MiniMap/Controls **не монтируются** (`isPrinting`) — иначе Tailwind `sm:!block` пробивает `@media print`.
5. Print CSS: A4 landscape; тёмный текст карточек (иначе white-on-white в dark); подписи рёбер — серый `.react-flow__edge-textbg`; chrome — `.no-print`.
6. Plain-текст: RF `plainText`, файл `plain: true` на `type: "text"`.
7. Save/Load: иконки справа **Загрузить → Сохранить → Печать → Тема** (`IconToolbarButton`); PNG по умолчанию (`exportPng.ts`); папка — `fileHandleStorage.ts` (IndexedDB).

## Git

- **main** — исходники (`origin/main`)
- **gh-pages** — статика (legacy deploy-скрипт)
- Remote: `https://github.com/m11nic89co/mindstorm.git`
- Не менять `git config` для user — env vars
- Коммиты — по запросу пользователя

## TypeScript

Strict через `tsc -b`. Автотесты — Vitest (`npm run test`).
ESLint пока осознанно отложен: текущий quality gate — TypeScript strict + unit-тесты + build в CI.

## CI notes

- GitHub Pages deploy: `.github/workflows/deploy.yml` (build + publish).
- В CI используется Node setup; держите версию в актуальном LTS (22+), чтобы избежать deprecated-warning на раннерах.
