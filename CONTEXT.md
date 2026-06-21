# MindStorm — контекст проекта

> **Обязательный файл для AI и разработчиков.** Читайте перед любой работой над репозиторием, особенно после переноса в новую папку.

## Идентификация

| Поле | Значение |
|------|----------|
| **Название продукта** | **MindStorm** (с большой **S**, не MindShtorm, не Mindstorm) |
| **npm-пакет** | `mindstorm` |
| **Формат файла** | `.mindstorm` (`format: "mindstorm-board"`) |
| **Репозиторий GitHub** | https://github.com/m11nic89co/mindstorm |
| **GitHub Pages (live)** | https://m11nic89co.github.io/mindstorm/ |
| **Владелец** | `m11nic89co` |

### Важно про старые имена

- Раньше проект ошибочно назывался **MindShtorm** — в коде и UI это исправлено.
- Slug репозитория GitHub: **`mindstorm`**. Production build: `vite.config.ts` → `base: '/mindstorm/'`.
- Старый slug **`mindshtorm`** и URL Pages с ним — legacy; GitHub редиректит на новый адрес.

### Рекомендуемая локальная папка

```
G:\Мой диск\Projects\MindStorm
```

Папка **привязана к GitHub** (`origin` → `https://github.com/m11nic89co/mindstorm.git`, ветка `main`).

**Рабочий процесс на Windows:**

1. Редактируете код в `G:\Мой диск\Projects\MindStorm` (Cursor).
2. `git add` / `git commit` / `git push origin main` — из **той же папки**.
3. GitHub Actions автоматически деплоит сайт после push в `main`.

Если `npm install` на Drive падает — сборку делайте в копии на `C:\Projects\MindStorm` (без `.git`, только `npm run build`). **Git и push — всегда с G:\.**

---

## Назначение

Интерактивная доска для брейншторма в духе **Obsidian Canvas**. Формат данных — **JSON Canvas**. Хранение схем — **локально** (файл на диске + черновик в `localStorage`). GitHub OAuth / PAT **удалены** (июнь 2026).

---

## Стек

- **Vite 6** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **@xyflow/react** v12 (React Flow) — холст, карточки, связи, pan/zoom
- Деплой: **GitHub Pages** (ветка `gh-pages`, скрипт `scripts/deploy-pages.ps1`)

---

## Структура репозитория

```
MindStorm/
├── CONTEXT.md              ← этот файл
├── README.md               ← краткая документация для пользователей
├── AGENTS.md               ← указания для AI-агентов
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   └── FILE_FORMAT.md
├── canvases/
│   └── README.md           ← референсные .canvas (опционально)
├── public/                 ← PWA, иконки, manifest
├── scripts/
│   └── deploy-pages.ps1
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── MindCanvas.tsx  ← главный экран
│   │   ├── Toolbar.tsx
│   │   ├── FileModals.tsx  ← сохранение (модалка fallback)
│   │   ├── LogoMark.tsx
│   │   └── nodes/
│   │       └── CardNodes.tsx
│   ├── context/
│   │   └── canvasActions.ts
│   ├── lib/
│   │   ├── jsonCanvas.ts   ← JSON Canvas ↔ React Flow
│   │   ├── localBoardFile.ts ← .mindstorm save/load
│   │   └── colors.ts
│   └── types/
│       └── jsonCanvas.ts
├── index.html
├── vite.config.ts
└── package.json
```

---

## Ключевые модули

### `MindCanvas.tsx`

- Точка входа UI: React Flow, toolbar, localStorage, save/load.
- **Двойной клик по пустому холсту** — новая карточка (`onPaneClick` + debounce, не `onDoubleClick` на ReactFlow — иначе карточки создаются поверх узлов).
- **Delete / Backspace** — удалить выделенное (не в input/textarea).
- **Колёсико** — только zoom (`panOnScroll={false}`, `zoomOnScroll`).

### `jsonCanvas.ts`

- `canvasToFlow` / `flowToCanvas` — конвертация JSON Canvas ↔ React Flow.
- Группы: `type: 'group'` → node `groupCard`, `zIndex: -1`.
- Карточки: `zIndex: 1`.
- `DEMO_CANVAS` — начальная демо-схема.

### `localBoardFile.ts`

- Сохранение: `saveBoardToDisk()` — `showSaveFilePicker` (Chrome/Edge) или download в «Загрузки».
- Загрузка: `readBoardFromFile()` — `.mindstorm`, legacy `.mindshtorm`, `.canvas`.
- Legacy format id: `mindshtorm-board` — только при чтении.

### `CardNodes.tsx`

- `TextCardNode` — текст, handles, NodeResizer.
- `GroupCardNode` — фон группы; метка и рамка выделения через **ViewportPortal** (группа всегда `z-index: -1`).

### `index.css` — порядок слоёв (критично!)

```
группы (-1) → рёбра (0) → карточки (1+) → selected card (2)
```

Группа **никогда** не поднимается над рёбрами при выборе. Не ломать без проверки в UI.

---

## localStorage

| Ключ | Назначение |
|------|------------|
| `mindstorm.canvas.v1` | Черновик схемы (JSON Canvas) |
| `mindstorm.boardName` | Имя текущей схемы в UI |

Legacy (миграция при чтении): `mindshtorm.canvas.v1`, `mindshtorm.boardName`.

---

## UX: сохранение и загрузка

| Действие | Поведение |
|----------|-----------|
| **Сохранить** | Chrome/Edge: системный «Сохранить как»; иначе модалка с именем → файл в «Загрузки». Toast об успехе. |
| **Загрузить** | Системный выбор файла. Toast «Открыто: …». |
| **↺ Демо** | Сброс к `DEMO_CANVAS`. |

---

## Сборка и деплой

```powershell
# PATH должен содержать Node.js, например:
$env:Path = "C:\Program Files\nodejs;" + $env:Path

npm install
npm run dev          # http://localhost:5173
npm run build
npm run deploy:pages # push в gh-pages
```

Git author для deploy-скрипта задаётся через **env vars** (не `git config`):

- `GIT_AUTHOR_NAME=m11nic89co`
- `GIT_AUTHOR_EMAIL=58000724+m11nic89co@users.noreply.github.com`

После деплоя: жёсткое обновление сайта **Ctrl+Shift+R**.

CI: `.github/workflows/deploy.yml` — build + GitHub Pages при push в `main`.

---

## Соглашения для разработки

1. **Язык UI** — русский.
2. **Название продукта** — всегда **MindStorm**.
3. **Минимальный diff** — не рефакторить без запроса.
4. **Коммиты** — только по явной просьбе пользователя.
5. **Не обновлять** `git config` глобально/локально.
6. SolID/KISS, стиль как в соседних файлах.

---

## История решений (кратко)

| Дата | Решение |
|------|---------|
| 2026-06 | JSON Canvas, React Flow, localStorage |
| 2026-06 | GitHub save/load → **отменено**, только локальные файлы |
| 2026-06 | z-index: группы под рёбрами, labels групп в ViewportPortal |
| 2026-06 | Переименование MindShtorm → **MindStorm**, `.mindstorm` |

---

## Что делать после переноса в новую папку

1. Открыть проект в Cursor из **`MindStorm/`**.
2. Убедиться, что прочитан **CONTEXT.md** (этот файл).
3. `npm install && npm run dev`.
4. При деплое — проверить путь и Node в PATH.
5. Обновить закладки/пути в своих скриптах, если ссылались на `MindShtorm`.

---

## Контакты / ссылки

- Repo: https://github.com/m11nic89co/mindstorm
- Live: https://m11nic89co.github.io/mindstorm/
- JSON Canvas spec: https://jsoncanvas.org/
