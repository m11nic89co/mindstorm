# Разработка MindStorm

## Требования

- **Node.js** 20+ (LTS)
- **npm** 10+
- Windows: добавить `C:\Program Files\nodejs` в PATH при вызове из PowerShell/Cursor

## Установка

```bash
npm install
npm run dev
```

Dev-сервер: http://localhost:5173 (`base: '/'`).

Production build: `base: '/mindstorm/'` (см. `vite.config.ts`).

## Скрипты

| Команда | Действие |
|---------|----------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b && vite build` → `dist/` |
| `npm run preview` | Просмотр production build |
| `npm run deploy:pages` | Build + push `gh-pages` |

## Деплой на GitHub Pages

### Локально (PowerShell)

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
$env:GIT_AUTHOR_NAME = "m11nic89co"
$env:GIT_COMMITTER_NAME = "m11nic89co"
$env:GIT_AUTHOR_EMAIL = "58000724+m11nic89co@users.noreply.github.com"
$env:GIT_COMMITTER_EMAIL = "58000724+m11nic89co@users.noreply.github.com"

cd C:\Projects\MindStorm
npm run deploy:pages
```

Скрипт `scripts/deploy-pages.ps1`:

1. `npm run build`
2. Копирует `dist/` в `_pages/`
3. Force-push в ветку `gh-pages`

### CI

Push в `main` → `.github/workflows/deploy.yml` → GitHub Pages artifact.

## Google Drive vs локальный диск

npm на папке Google Drive (`G:\Мой диск\...`) часто падает. Рекомендация:

```powershell
robocopy "G:\...\MindStorm" "C:\Projects\MindStorm" /MIR /XD node_modules dist _pages .git
cd C:\Projects\MindStorm
npm run build
```

После работы — синхронизировать обратно при необходимости.

## Git

- **main** — исходники
- **gh-pages** — только статика сайта
- Не использовать `git config` для смены user — только env vars в deploy-скрипте
- Коммиты — по запросу пользователя

## Переименование репозитория GitHub

Репозиторий переименован `mindshtorm` → `mindstorm` (июнь 2026). Старый URL редиректит на новый.

## Линтер

TypeScript strict через `tsc -b`. Отдельного ESLint в проекте нет.
