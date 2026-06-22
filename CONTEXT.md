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

Интерфейс: **русский по умолчанию**, переключатель **RU / EN / ES / 中** в toolbar.

---

## Стек

- **Vite 6** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **@xyflow/react** v12 (React Flow) — холст, карточки, связи, pan/zoom
- Деплой: **GitHub Pages** (CI на `main`, запасной скрипт `scripts/deploy-pages.ps1` → ветка `gh-pages`)

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
│   ├── FILE_FORMAT.md
│   ├── GROUPING.md         ← план: Группировать / Разгруппировать
│   └── PROJECT_INSPECTION_2026-06-22.md ← аудит состояния проекта
├── canvases/
│   └── README.md           ← референсные .canvas (опционально)
├── public/                 ← PWA, иконки, manifest
├── scripts/
│   └── deploy-pages.ps1
├── src/
│   ├── App.tsx
│   ├── main.tsx            ← LocaleProvider
│   ├── i18n/
│   │   ├── messages.ts     ← строки RU / EN / ES / ZH
│   │   ├── locales.ts      ← список локалей + fallback-порядок
│   │   ├── LocaleProvider.tsx
│   │   └── localeStorage.ts
│   ├── components/
│   │   ├── MindCanvas.tsx  ← главный экран
│   │   ├── Toolbar.tsx     ← toolbar, RU/EN/ES/中, панели выделения
│   │   ├── FileModals.tsx
│   │   ├── DemoSplash.tsx
│   │   ├── Toast.tsx
│   │   └── nodes/
│   │       ├── CardNodes.tsx
│   │       └── edgeHandles.tsx
│   ├── context/
│   │   └── canvasActions.ts
│   ├── hooks/
│   │   ├── useCanvasHistory.ts
│   │   ├── useRightClickMarquee.ts
│   │   ├── useCanvasShortcuts.ts
│   │   └── useDebouncedPersist.ts
│   ├── lib/
│   │   ├── jsonCanvas.ts
│   │   ├── demoCanvas.ts   ← демо-схема с i18n
│   │   ├── demoLocaleCopies.ts ← ES/ZH-копии демо-узлов и связей
│   │   ├── nodeLocale.ts   ← i18n содержимого карточек/групп/рёбер
│   │   ├── flowEdges.ts
│   │   ├── groupResize.ts  ← пропорциональный resize карточек внутри группы
│   │   ├── localBoardFile.ts
│   │   ├── boardStorage.ts
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
- **Двойной клик по пустому холсту** — новая карточка (`onPaneClick` + debounce).
- **Delete / Backspace** — удалить выделенное (не в input/textarea).
- **Колёсико** — только zoom (`panOnScroll={false}`, `zoomOnScroll`).
- **Undo/Redo** — `useCanvasHistory` (Ctrl+Z / Ctrl+Shift+Z).
- **ПКМ + рамка** — выделение (`useRightClickMarquee`); группа — только при касании **границы**.
- **Resize группы** — текстовые карточки с центром внутри рамки масштабируются пропорционально (`groupResize.ts`, `NodeResizer` в `GroupCardNode`).
- **Сначала** — подтверждение → пустая схема; **история не сбрасывается** → можно **Undo**.
- **↺ Демо** — `getDemoCanvas(locale)` с анимацией появления.

### `Toolbar.tsx`

- **Undo/Redo** — крупные SVG-кнопки слева.
- **Сначала** — акцентная кнопка (бирюзовая); **↺ Демо** — обычная.
- **RU | EN | ES | 中** — переключатель языка (сохраняется в localStorage).
- **SelectionPanel** — название + 12 цветов (6×2) для карточки или группы.
- **EdgeSelectionPanel** — подпись связи, удаление, перенаправление.

### `i18n/`

- `messages.ts` — все UI-строки (`messagesRu`, `messagesEn`, `messagesEs`, `messagesZh`).
- `locales.ts` — `LOCALES`, подписи кнопок языка, `pickFromLocaleMap` и fallback-порядок.
- `LocaleProvider` — контекст `{ locale, m, setLocale }`; хук `useLocale()`.
- Новые строки UI добавлять **во все 4 языка** в `messages.ts`.

### `jsonCanvas.ts`

- `canvasToFlow` / `flowToCanvas` — JSON Canvas ↔ React Flow.
- Handles в runtime: `source-{side}-a|b`; в файле — `fromSide` / `toSide`.
- Группы: `groupCard`, `zIndex: -1`. Карточки: `zIndex: 1`.
- Расширение MindStorm: поле `label` у text-узлов (badge над карточкой).

### `demoCanvas.ts`

- `DEMO_CANVAS_I18N` — одна схема с переводами в поле `i18n` (`ru`, `en`, `es`, `zh`).
- База RU/EN + доп. копии ES/ZH в `demoLocaleCopies.ts`.
- `getDemoCanvas(locale)`, `getDemoBoardName(locale)`, `demoFlowPresentation(locale)`, `demoStats(locale)`.

### `nodeLocale.ts`

- `materializeNodeLocale` / `materializeEdgeLocale` — подстановка текста при смене языка.
- `syncNodeI18nOnEdit` / `syncEdgeI18nOnEdit` — правки пишутся в `i18n[locale]`.

### `localBoardFile.ts` / `boardStorage.ts`

- Save/load `.mindstorm`, legacy `.mindshtorm`, `.canvas`.
- Черновик: `mindstorm.canvas.v1`; имя доски: `mindstorm.boardName`.
- Если черновика нет — старт с демо на языке из `mindstorm.locale.v1`.

### `CardNodes.tsx` + `edgeHandles.tsx`

- **8 точек связи** (2 на сторону, 25% и 75%), `ConnectionMode.Loose`.
- Группы: сплошная рамка, метка на верхней кромке; `NodeResizer` вызывает `onGroupResizeStart/Resize/End` из контекста.

### `groupResize.ts`

- На старте resize группы — снимок узлов внутри root-группы по критерию центра.
- Во время resize — пропорциональное изменение `position`, `width`, `height`.
- Масштабируются **текстовые карточки и вложенные группы** (рекурсивно через `nodesInsideGroupTree`).
- Минимумы: text 160×72, group 220×120.
- На `onResizeEnd` — `commitNow()` + `persistCanvas` (история и черновик).

### `flowEdges.ts`

- Цвет ребра = цвет **source**-узла; стрелка на **target**; анимация к стрелке.
- `connectionFromDragStart()` — направление от узла, откуда потянули.

### `colors.ts`

- **12 пресетов** (`1`–`12`); названия цветов — из `messages.ts` (`m.colors`).

### `index.css` — порядок слоёв (критично!)

```
группы (-1) → рёбра (0) → карточки (1+) → selected card (2)
```

Группа **никогда** не поднимается над рёбрами. Не ломать без проверки в UI.

---

## localStorage

| Ключ | Назначение |
|------|------------|
| `mindstorm.canvas.v1` | Черновик схемы (JSON Canvas) |
| `mindstorm.boardName` | Имя текущей схемы в UI |
| `mindstorm.locale.v1` | Язык UI: `ru` / `en` / `es` / `zh` |
| `mindstorm.demoWelcomeSeen.v1` | Splash демо уже показывали |

Legacy (миграция при чтении): `mindshtorm.canvas.v1`, `mindshtorm.boardName`.

---

## UX: toolbar и файлы

| Действие | Поведение |
|----------|-----------|
| **Сохранить** | Chrome/Edge: «Сохранить как»; иначе модалка → «Загрузки». Toast. |
| **Загрузить** | Выбор файла. Toast «Открыто: …» / «Opened: …». |
| **Сначала** (акцент) | Подтверждение → пустая доска; **Undo** вернёт прежнее. |
| **↺ Демо** | Демо-схема на текущем языке + splash. |
| **RU / EN / ES / 中** | Смена языка UI **и** содержимого доски (карточки, группы, подписи связей), если есть `i18n`. |
| **Клик по узлу** | Панель: название + цвет. |
| **Клик по связи** | Панель: подпись, удаление. |

---

## Сборка и деплой

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
cd "G:\Мой диск\Projects\MindStorm"

npm install
npm run dev          # http://localhost:5173 (или 5174)
npm run build

# Основной деплой — push в main (CI):
git push origin main
```

Рекомендуемая версия Node.js для локальной разработки и CI: **22 LTS** (минимум 20+).

Git author для deploy-скрипта — через **env vars** (не `git config`):

- `GIT_AUTHOR_NAME=m11nic89co`
- `GIT_AUTHOR_EMAIL=58000724+m11nic89co@users.noreply.github.com`

После деплоя: **Ctrl+Shift+R** на https://m11nic89co.github.io/mindstorm/

CI: `.github/workflows/deploy.yml` — `npm run test` + build + GitHub Pages при push в `main`.

---

## Соглашения для разработки

1. **Язык UI** — русский по умолчанию; все новые строки — в `src/i18n/messages.ts` (RU + EN + ES + ZH).
2. **Название продукта** — всегда **MindStorm**.
3. **Минимальный diff** — не рефакторить без запроса.
4. **Коммиты** — только по явной просьбе пользователя.
5. **Не обновлять** `git config` глобально/локально.
6. SOLID/KISS, стиль как в соседних файлах.

---

## История решений (кратко)

| Дата | Решение |
|------|---------|
| 2026-06 | JSON Canvas, React Flow, localStorage |
| 2026-06 | GitHub save/load → **отменено**, только локальные файлы |
| 2026-06 | z-index: группы под рёбрами |
| 2026-06 | Переименование MindShtorm → **MindStorm**, `.mindstorm` |
| 2026-06 | 12 цветов, 8 handles, панель выделения, Undo/Redo, «Сначала» + confirm |
| 2026-06 | Локализация **RU/EN/ES/ZH**, одна демо-схема `DEMO_CANVAS_I18N`; «Сначала» — accent-кнопка |
| 2026-06 | i18n **содержимого доски** (`nodeLocale.ts`, `i18n` в JSON); разведение параллельных связей |
| 2026-06 | **Resize группы** — пропорциональное масштабирование карточек внутри (`groupResize.ts`) |
| 2026-06 | **Nested resize** — рекурсивное масштабирование вложенных групп и карточек |
| 2026-06 | Добавлены локали **ES** и **ZH** в UI, демо и i18n узлов/рёбер |
| 2026-06 | **План:** кнопки «Группировать» / «Разгруппировать» → [docs/GROUPING.md](./docs/GROUPING.md) |
| 2026-06 | Закрытие техдолга: resize race fix, Vitest, CI test gate, Node 22, i18n aria |

---

## Контакты / ссылки

- Repo: https://github.com/m11nic89co/mindstorm
- Live: https://m11nic89co.github.io/mindstorm/
- JSON Canvas spec: https://jsoncanvas.org/
