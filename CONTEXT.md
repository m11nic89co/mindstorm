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

Интерфейс: **русский по умолчанию**, переключатель **RU / EN / ES / 中** в toolbar; тема **dark/light**; **печать** всей схемы или выделения.

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
│   ├── main.tsx            ← ThemeProvider + LocaleProvider
│   ├── theme/
│   │   ├── ThemeProvider.tsx ← light/dark, data-theme
│   │   ├── themeStorage.ts ← mindstorm.theme.v1
│   │   └── themes.ts
│   ├── i18n/
│   │   ├── messages.ts     ← строки RU / EN / ES / ZH
│   │   ├── locales.ts      ← список локалей + fallback-порядок
│   │   ├── LocaleProvider.tsx
│   │   └── localeStorage.ts
│   ├── components/
│   │   ├── MindCanvas.tsx  ← главный экран
│   │   ├── Toolbar.tsx     ← Демо→Текст… ; Сначала→📂💾🖨☀☾ справа
│   │   ├── FileModals.tsx  ← Save + PrintBoardModal
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
│   │   ├── groupResize.ts  ← resize группы; масштабирование только выделенных карточек
│   │   ├── groupLock.ts    ← замок группы (locked → фон)
│   │   ├── nodeClipboard.ts ← Ctrl+C/V копия узлов
│   │   ├── printBoard.ts   ← фрагмент печати (выделение)
│   │   ├── printLayout.ts  ← PRINT_SCALE=1, центр viewport при печати
│   │   ├── exportPng.ts    ← PNG-превью холста
│   │   ├── fileHandleStorage.ts ← IndexedDB: последняя папка save/open
│   │   ├── cardTypography.ts, groupLabel.ts ← размеры шрифтов (карточка / plain / группа)
│   │   ├── localBoardFile.ts
│   │   ├── boardStorage.ts
│   │   └── colors.ts       ← палитры dark/light
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
- **Двойной клик по пустому холсту** — новая карточка **серого** цвета (`12`, `DOUBLE_CLICK_CARD_COLOR`).
- **Delete / Backspace** — удалить выделенное (не в input/textarea).
- **Ctrl+C / Ctrl+V** — копия выделенных карточек/групп со смещением (`nodeClipboard.ts`); **Ctrl+Z / Ctrl+Y** — Undo/Redo.
- Горячие клавиши по **`event.code`** — работают при **RU и EN** раскладке (`useCanvasShortcuts.ts`, `useCanvasHistory.ts`).
- **Колёсико** — только zoom (`panOnScroll={false}`, `zoomOnScroll`).
- **ПКМ + рамка** — выделение (`useRightClickMarquee`); группа — по **границе**; **закреплённые** группы не выделяются.
- **Resize группы** — меняется рамка; **выделенные** text-карточки, plain-текст и группы масштабируются; невыделенные не трогаются. Закреплённую группу нельзя resize.
- **Сначала** — подтверждение → пустая схема; **история не сбрасывается** → можно **Undo**.
- **↺ Демо** — `getDemoCanvas(locale)` с анимацией появления.
- **Печать** — диалог `PrintBoardModal`: вся схема или выделенный фрагмент (`printBoard.ts`); `setPrintLight(true)` + `fitView` → `PRINT_SCALE` **1** (`printLayout.ts`); `@page` A4 landscape; **MiniMap/Controls не рендерятся** (`isPrinting`); history/persist на паузе; после `afterprint` — восстановление. DPI 300 — в диалоге принтера ОС. Print CSS: тёмный текст карточек; **серый фон подписей связей** (`.react-flow__edge-textbg`).

### `Toolbar.tsx`

- **Undo/Redo** — крупные SVG-кнопки слева.
- **↺ Демо** → **T Текст** → **+ Карточка** → **◻ Группа** — слева направо после Undo/Redo.
- Справа: **Сначала (лист+) → 📂 Загрузить → 💾 Сохранить → 🖨 Печать → ☀/☾ Тема** — `IconToolbarButton`; при наведении — подсказка (portal).
- Подсказки toolbar: `useHoverTip` + portal **под курсором** мыши.
- **RU | EN | ES | 中** — переключатель языка (сохраняется в localStorage).
- **SelectionPanel** — карточка: заголовок + размеры; **plain**: текст + размер шрифта (10–96) + цвет; группа: метка (до 200 px) + цвет.
- **EdgeSelectionPanel** — подпись связи, удаление, перенаправление.
- Chrome UI опирается на CSS-переменные `--ms-*` (см. `index.css`).

### `theme/`

- `ThemeProvider` — контекст `{ theme, preferredTheme, setTheme, toggleTheme, setPrintLight }`; `document.documentElement.dataset.theme`.
- `setPrintLight(true)` на время печати — light-палитра без записи в storage.
- `themeStorage.ts` — ключ `mindstorm.theme.v1` (`light` | `dark`, по умолчанию `dark`).
- Стили: переменные `--ms-*` в `index.css`; карточки — `resolveColor(color, theme)`; plain — `textInk(color, theme)`.

### `printBoard.ts` / `printLayout.ts`

- `resolvePrintFragment` — выделенные узлы + endpoints выделенных рёбер; рёбра между узлами фрагмента.
- `applyPrintVisibility` — `hidden` / сброс `selected` для чистой печати.
- `PRINT_SCALE = 1`, `viewportAtScale` — fitView на всю страницу без ужимания.
- `PrintBoardModal` — выбор scope + подсказка layout (A4 / весь холст / 300 DPI).
- `setPrintLight` в `ThemeProvider` — light-палитра на время печати.
- Print CSS: подписи рёбер — серый фон (`#94a3b8` на `.react-flow__edge-textbg`), не почти чёрный `labelBgStyle` с экрана.

### `PlainTextNode` (`CardNodes.tsx`)

- React Flow type `plainText`, `canvasType: 'plain'`.
- Без рамки карточки и без handles; цвет текста из палитры (`textInk`); размер `textFontSize` (default 18).
- В файле: `type: "text"`, `plain: true`.

### `i18n/`

- `messages.ts` — все UI-строки (`messagesRu`, `messagesEn`, `messagesEs`, `messagesZh`).
- `locales.ts` — `LOCALES`, подписи кнопок языка, `pickFromLocaleMap` и fallback-порядок.
- `LocaleProvider` — контекст `{ locale, m, setLocale }`; хук `useLocale()`.
- Новые строки UI добавлять **во все 4 языка** в `messages.ts`.

### `jsonCanvas.ts`

- `canvasToFlow` / `flowToCanvas` — JSON Canvas ↔ React Flow.
- Handles в runtime: `source-{side}-a|b`; в файле — `fromSide` / `toSide`.
- Группы: `groupCard`, `zIndex: -1`. Карточки и plain: `zIndex: 1`.
- Text-карточка: `label` — заголовок (верх), `text` — тело (низ).
- Plain: `canvasType: 'plain'` → в файле `type: "text"` + `plain: true`.

### `demoCanvas.ts`

- `DEMO_CANVAS_I18N` — одна схема с переводами в поле `i18n` (`ru`, `en`, `es`, `zh`).
- База RU/EN + доп. копии ES/ZH в `demoLocaleCopies.ts`.
- `getDemoCanvas(locale)`, `getDemoBoardName(locale)`, `demoFlowPresentation(locale)`, `demoStats(locale)`.

### `nodeLocale.ts`

- `materializeNodeLocale` / `materializeEdgeLocale` — подстановка текста при смене языка.
- `syncNodeI18nOnEdit` / `syncEdgeI18nOnEdit` — правки пишутся в `i18n[locale]`.

### `localBoardFile.ts` / `boardStorage.ts` / `exportPng.ts` / `fileHandleStorage.ts`

- Save: в выбранную **папку saves** сразу два файла — `.mindstorm` (JSON) и PNG-превью с тем же именем.
- Папка: `showDirectoryPicker` + IndexedDB `mindstorm.fs.v1` (`savesDir`).
- Open: `.mindstorm` / `.canvas` из той же папки (`startIn`).
- Черновик: `mindstorm.canvas.v1`; имя доски: `mindstorm.boardName`.
- Если черновика нет — старт с демо на языке из `mindstorm.locale.v1`.
- PNG **нельзя** открыть как редактируемую схему.

### `CardNodes.tsx` + `edgeHandles.tsx`

- **8 точек связи** (2 на сторону, 25% и 75%), `ConnectionMode.Loose` — только у карточек и групп.
- **Text-карточка:** сверху заголовок (`label`), снизу текст (`text`); разделитель; двойной клик по зоне — редактирование только этой части.
- **Plain-текст:** `PlainTextNode` — один блок текста без рамки; цвет = цвет шрифта; без handles.
- Редактирование: uncontrolled `input` / `textarea`, commit при blur, Escape — отмена; `nodrag` / `nopan` на полях ввода.
- **Группы:** сплошная рамка, метка на верхней кромке с **замком** справа; `NodeResizer` → resize; **замок закрыт** (`locked`) → группа фон, активен только замок; **иконка замка** — `1em` от `labelFontSize` метки (масштабируется вместе с текстом).

### `groupLock.ts`

- Поле `locked` у группы: `draggable: false`, `selectable: false`, класс `group-node-locked`.
- Закреплённая группа — фон (клики проходят к карточкам); метка и замок остаются интерактивными.
- Сохраняется в `.mindstorm` как `locked: true` на узле `type: "group"`.

### `nodeClipboard.ts`

- **Ctrl+C** — snapshot выделенных `textCard` / `plainText` / `groupCard`.
- **Ctrl+V** — дубликат со смещением 28 px (каждая следующая вставка +28 px).
- Копируются все свойства узла (цвет, размер, шрифты, i18n, `locked`).

### `cardTypography.ts` / `groupLabel.ts`

- Карточка: `labelFontSize` (10–36 px, default 15), `textFontSize` (10–36 px, default 14).
- Plain: `textFontSize` (10–**96** px, default 18), цвет через `textInk`.
- Группа: `labelFontSize` метки (8–**200** px, default 12); badge и **иконка замка** масштабируются (`groupLabelBadgeStyle`, SVG `1em` в `GroupCardNode`).

### `groupResize.ts`

- На старте resize группы — снимок **выделенных** узлов внутри root-группы (`nodesToResizeWithGroup`).
- Критерий «внутри группы» — **центр** узла в bbox (`nodesInsideGroupTree`).
- Выделенная вложенная группа → в snapshot попадает она и всё её содержимое (рекурсивно).
- Во время resize — пропорциональное изменение `position`, `width`, `height` только для узлов из snapshot.
- Минимумы: text 160×72, group 220×120.
- На `onResizeEnd` — `commitNow()` + `persistCanvas` (история и черновик).

### `flowEdges.ts`

- Цвет ребра = цвет **source**-узла; стрелка на **target**; анимация к стрелке.
- `connectionFromDragStart()` — направление от узла, откуда потянули.

### `colors.ts`

- **12 пресетов** (`1`–`12`); отдельные палитры **dark** / **light** в `resolveColor(color, theme)`.
- Названия цветов — из `messages.ts` (`m.colors`); свотчи в панели — из dark-borders.

### `index.css` — порядок слоёв (критично!)

```
группы (-1) → рёбра (0) → карточки (1+) → selected card (2)
```

Группа **никогда** не поднимается над рёбрами. Не ломать без проверки в UI.

Тема: `[data-theme="dark"|"light"]` + переменные `--ms-*` (фон, панели, текст, точки холста).  
Печать: `@page { size: A4 landscape }`, тёмный текст карточек, серый фон подписей рёбер, скрытие `.no-print` / minimap / background / controls.

---

## localStorage

| Ключ | Назначение |
|------|------------|
| `mindstorm.canvas.v1` | Черновик схемы (JSON Canvas) |
| `mindstorm.boardName` | Имя текущей схемы в UI |
| `mindstorm.locale.v1` | Язык UI: `ru` / `en` / `es` / `zh` |
| `mindstorm.theme.v1` | Тема UI: `light` / `dark` |
| `mindstorm.demoWelcomeSeen.v1` | Splash демо уже показывали |

Legacy (миграция при чтении): `mindshtorm.canvas.v1`, `mindshtorm.boardName`.

---

## UX: toolbar и файлы

| Действие | Поведение |
|----------|-----------|
| **Сначала** (лист +) | Первая справа в группе иконок (accent). Подтверждение → пустая доска; **Undo** вернёт прежнее. |
| **Сохранить** (💾) | Папка saves: сразу **`.mindstorm` + PNG**. Папка запоминается. Toast. |
| **Загрузить** (📂) | `.mindstorm` / `.canvas` из папки сохранений. PNG не открывается. |
| **Печать** (🖨) | Диалог: **Вся схема** / **Только выделенное**. Layout: A4 альбом, весь холст, читаемый текст, серые подписи связей; 300 DPI — в диалоге ОС. |
| **☀ / ☾** | Переключение светлой/тёмной темы (`mindstorm.theme.v1`). |
| **↺ Демо** → **Текст** → **Карточка** → **Группа** | Порядок после Undo/Redo: демо первая, затем узлы. |
| **RU / EN / ES / 中** | Смена языка UI **и** содержимого доски (карточки, группы, подписи связей), если есть `i18n`. |
| **Клик по узлу** | Панель: название, размер шрифта (карточка/группа), цвет. Закреплённая группа — панель не показывается. |
| **Ctrl+C / Ctrl+V** | Копия выделенной карточки или группы рядом (любая раскладка). |
| **Замок на группе** | Закрыт — фон; открыт — move/resize/редактирование. |
| **Двойной клик по холсту** | Новая **серая** карточка. |
| **Двойной клик по карточке** | Верх — заголовок; низ — текст (независимо). |
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
| 2026-06 | **Resize группы + selection** — масштабируются только **выделенные** карточки; невыделенные остаются на месте (`nodesToResizeWithGroup`) |
| 2026-06 | Добавлены локали **ES** и **ZH** в UI, демо и i18n узлов/рёбер |
| 2026-06 | **План:** кнопки «Группировать» / «Разгруппировать» → [docs/GROUPING.md](./docs/GROUPING.md) |
| 2026-06 | Закрытие техдолга: resize race fix, Vitest, CI test gate, Node 22, i18n aria |
| 2026-06 | Карточка: заголовок (`label`) и текст (`text`) — отдельные зоны и редактирование; `minZoom` 0.02 |
| 2026-06 | Карточка: `labelFontSize` / `textFontSize`; dblclick — серая карточка; **Ctrl+C/V**; горячие клавиши по `event.code` (RU/EN) |
| 2026-06 | **Замок группы** (`groupLock.ts`, `locked`) — закрепление как фон; размер метки до 200 px |
| 2026-06 | Иконка замка на метке группы — **1em** от `labelFontSize` (масштаб с текстом метки) |
| 2026-07 | **Светлая/тёмная тема** (`ThemeProvider`, `--ms-*`, `mindstorm.theme.v1`) |
| 2026-07 | **Печать** — диалог вся схема / выделение (`printBoard.ts`, A+D) |
| 2026-07 | Печать: A4 landscape, `fitView` + `PRINT_SCALE` 1, `setPrintLight` + print CSS (читаемый текст); MiniMap/Controls снимаются с DOM (`isPrinting`) |
| 2026-07 | **Простой текст** на холсте (`plainText` / `plain: true`): цвет и размер шрифта |
| 2026-07 | Save: папка saves → **`.mindstorm` + PNG**; подсказки под курсором |

---

## Контакты / ссылки

- Repo: https://github.com/m11nic89co/mindstorm
- Live: https://m11nic89co.github.io/mindstorm/
- JSON Canvas spec: https://jsoncanvas.org/
