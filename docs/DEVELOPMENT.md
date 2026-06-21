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

### Основной способ (рекомендуется)

Push в `main` из папки проекта → **CI** (`.github/workflows/deploy.yml`) → сайт обновляется автоматически.

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
cd "G:\Мой диск\Projects\MindStorm"

git add .
git commit -m "Описание изменений"
git push origin main
```

Через ~40 с сайт: https://m11nic89co.github.io/mindstorm/

### Запасной способ — скрипт `deploy:pages`

Если CI недоступен, вручную через ветку `gh-pages`:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
$env:GIT_AUTHOR_NAME = "m11nic89co"
$env:GIT_COMMITTER_NAME = "m11nic89co"
$env:GIT_AUTHOR_EMAIL = "58000724+m11nic89co@users.noreply.github.com"
$env:GIT_COMMITTER_EMAIL = "58000724+m11nic89co@users.noreply.github.com"

cd "G:\Мой диск\Projects\MindStorm"
npm run deploy:pages
```

Скрипт `scripts/deploy-pages.ps1`: build → `_pages/` → push `gh-pages`.

## Google Drive и Git

**Git-репозиторий живёт на Google Drive** — одна папка для Cursor и для `git push`. Копировать проект в `C:\Projects\...` перед каждым деплоем **не нужно**.

| Задача | Где |
|--------|-----|
| Код, Cursor, git commit/push | `G:\Мой диск\Projects\MindStorm` |
| `npm install` / `npm run build` (если Drive ломает npm) | копия на `C:\Projects\MindStorm` без `.git` |

```powershell
# Только если npm на Drive падает:
robocopy "G:\Мой диск\Projects\MindStorm" "C:\Projects\MindStorm" /MIR /XD node_modules dist _pages .git
cd C:\Projects\MindStorm
npm install
npm run build
```

## Git

- **main** — исходники (отслеживает `origin/main`)
- **gh-pages** — только статика сайта (legacy deploy-скрипт)
- Remote: `https://github.com/m11nic89co/mindstorm.git`
- Не использовать `git config` для смены user — env vars в deploy-скрипте
- Коммиты — по запросу пользователя

## Переименование репозитория GitHub

Репозиторий переименован `mindshtorm` → `mindstorm` (июнь 2026). Старый URL редиректит на новый.

## Линтер

TypeScript strict через `tsc -b`. Отдельного ESLint в проекте нет.
