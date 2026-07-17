# Архитектура MindStorm

## Обзор

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  ThemeProvider (light/dark) + LocaleProvider (RU/EN/…)  │
│  ┌─────────────┐    ┌─────────────────────────────────┐ │
│  │ Toolbar     │    │ React Flow (MindCanvas)         │ │
│  │ Undo/Redo   │    │  · TextCardNode (z=1)           │ │
│  │ Демо/Text…  │    │  · PlainTextNode (z=1)         │ │
│  │ 📄+📂💾🖨☀☾ │    │  · GroupCardNode (z=-1)         │ │
│  │ RU|EN|ES|中 │    └─────────────────────────────────┘ │
│  └─────────────┘                                        │
│  SelectionPanel ──► карточка / plain / группа + цвета   │
│  EdgeSelectionPanel ► подпись связи                     │
│  PrintBoardModal ──► вся схема / выделение              │
│         │                                               │
│         ▼                                               │
│  localStorage ◄──────── flowToCanvas / canvasToFlow     │
│  PNG / .mindstorm  ◄── localBoardFile + exportPng       │
│  last folder (IDB) ◄── fileHandleStorage.ts             │
└─────────────────────────────────────────────────────────┘
```

## Поток данных

1. **Старт:** `mindstorm.canvas.v1` → `canvasToFlow` → state; если пусто — `getDemoCanvas(readLocale())`.
2. **Редактирование:** debounce 400 ms → localStorage; history commit на drag stop и на **конец resize группы**.
3. **Сохранить:** `flowToCanvas` → папка saves → **`.mindstorm` + PNG**; `startIn` из IndexedDB.
4. **Загрузить:** `showOpenFilePicker` / File → `parseBoardFile` → state (не PNG).
5. **Сначала:** confirm → `commitNow()` → пустые nodes/edges **без** `resetHistory` → Undo.
6. **Демо:** `demoFlowPresentation(locale)` → анимация появления.
7. **Печать:** `PrintBoardModal` → `printBoard.ts` → `setPrintLight(true)` + `isPrinting` (без MiniMap) → `fitView` → `PRINT_SCALE` 1 (`printLayout.ts`) → `window.print()` (A4 landscape) → `afterprint` restore.

## Тема (light / dark)

| Модуль | Роль |
|--------|------|
| `ThemeProvider.tsx` | Контекст, `data-theme` на `<html>`, meta `theme-color` |
| `themeStorage.ts` | Ключ `mindstorm.theme.v1` |
| `index.css` | Переменные `--ms-*` для chrome UI |
| `colors.ts` | `resolveColor` (карточки), `textInk` (plain) |

Компоненты: `const { theme, toggleTheme, setPrintLight } = useTheme()`. По умолчанию — **dark**. На печати — `setPrintLight(true)`.

## Печать

| Модуль | Роль |
|--------|------|
| `printBoard.ts` | Фрагмент из выделения; `applyPrintVisibility` |
| `printLayout.ts` | `PRINT_SCALE = 1`, `viewportAtScale` |
| `PrintBoardModal` | Диалог: вся схема / только выделенное + layoutHint |
| `MindCanvas.tsx` | Пауза history/persist; `isPrinting` — без MiniMap/Controls; `setPrintLight`; fitView; restore |
| `ThemeProvider` | `setPrintLight` — light-палитра на время печати (читаемый текст) |
| `index.css` | `@page A4 landscape`, тёмный текст карточек, `.ms-edge-label` на печати, скрытие panel/minimap / `.no-print` |
| `MindSmoothStepEdge.tsx` | HTML-подписи рёбер (`EdgeLabelRenderer`) — без обрезки на печати |

Выделение: клик / Shift+клик / ПКМ-рамка. В фрагмент входят выделенные узлы, endpoints выделенных рёбер и все рёбра между узлами фрагмента. **300 DPI** задаётся в диалоге печати ОС (браузер не форсирует DPI).

## Save / load

| Модуль | Роль |
|--------|------|
| `localBoardFile.ts` | В папку: `.mindstorm` + PNG; open picker с `startIn` |
| `exportPng.ts` | Снимок холста через `html-to-image` |
| `fileHandleStorage.ts` | IndexedDB `mindstorm.fs.v1` — папка saves + последний файл |

## Узлы на холсте

| RF type | `canvasType` | Файл | UI |
|---------|--------------|------|-----|
| `textCard` | `text` | `type: "text"` | Карточка: заголовок + тело |
| `plainText` | `plain` | `type: "text"`, `plain: true` | Простой текст, цвет шрифта |
| `groupCard` | `group` | `type: "group"` | Рамка-группа + замок |

## Локализация

| Модуль | Роль |
|--------|------|
| `messages.ts` | Словари `messagesRu` / `messagesEn` / `messagesEs` / `messagesZh` |
| `locales.ts` | `LOCALES`, подписи языка, fallback-порядок `pickFromLocaleMap` |
| `LocaleProvider.tsx` | React-контекст, `document.documentElement.lang` |
| `localeStorage.ts` | Ключ `mindstorm.locale.v1` |

Компоненты: `const { locale, m } = useLocale()` — все видимые строки из `m.*`.

Демо-контент на доске — `getDemoCanvas(locale)` с полем `i18n`; при смене RU/EN/ES/ZH тексты карточек, групп и подписей связей обновляются через `nodeLocale.ts`.

## Группы на холсте

Группа — визуальная рамка (без `parentId` в React Flow). «Внутри группы» = **центр** узла в bbox группы.

### Пропорциональный resize (реализовано)

```
onResizeStart → createGroupResizeSnapshot (выделенные узлы с центром внутри bbox)
onResize      → applyGroupResizeToNodes (position + width/height ∝ группе)
onResizeEnd   → commitNow + persistCanvas
```

Модуль: `src/lib/groupResize.ts`. Callbacks пробрасываются через `CanvasActionsContext` из `MindCanvas.tsx` в `GroupCardNode`.

- Меняется рамка группы всегда; **масштабируются только выделенные** text-карточки и группы (`nodesToResizeWithGroup`).
- Выделенная вложенная группа → масштабируется вместе с содержимым (рекурсивно через `nodesInsideGroupTree`).
- Невыделенные карточки внутри рамки остаются на месте с прежним размером.
- Минимальные размеры: text 160×72, group 220×120.
- Drag группы не группирует содержимое автоматически; это отдельная запланированная фича.

### Замок группы (реализовано)

```
locked: true → draggable/selectable: false, class group-node-locked
toggle     → updateNode({ locked }) в GroupCardNode (кнопка на badge)
```

Модуль: `src/lib/groupLock.ts`. Закреплённая группа не попадает в ПКМ-рамку, не копируется, не показывает SelectionPanel.

### Группировка содержимого (запланировано)

> Спецификация: [GROUPING.md](./GROUPING.md)

Планируется отдельно от resize:

- Кнопки **Группировать** / **Разгруппировать** в панели выделения группы.
- Runtime: React Flow `parentId` + относительные координаты.
- Файл: опциональное поле MindStorm `parentGroupId` (абсолютные `x`/`y` сохраняются для Obsidian).

## React Flow

- Узлы: `textCard`, `plainText`, `groupCard`.
- **Text-карточка:** `data.label` — заголовок (верх), `data.text` — тело (низ); в `CardNodes.tsx` — отдельное редактирование по двойному клику.
- **Plain:** `data.text` + `textFontSize` + `color` → цвет шрифта (`textInk`); без handles.
- Рёбра: `smoothstep`, `animated`, цвет от **source**, стрелка на **target**.
- Handles: `EdgeHandles` — 8 точек (`source-{side}-{a|b}`), `ConnectionMode.Loose` (не у plain).
- `zIndexMode="manual"`, `elevateNodesOnSelect={false}`.

## Слои (z-index)

- `.react-flow__node-groupCard` → `z-index: -1`
- `.react-flow__edges` → `z-index: 0`
- Карточки и plain → `z-index: 1+`

Метка группы — badge на верхней кромке с **замком** справа; масштаб `labelFontSize` до 200 px (иконка замка — `1em`, как текст метки). Заголовок text-карточки — **внутри** узла, над разделителем.

## Панели выделения

| Панель | Когда | Содержимое |
|--------|-------|------------|
| `SelectionPanel` | Выбран узел (не закреплённая группа) | Карточка: название + размеры; plain: текст + размер (10–96) + цвет; группа: метка + размер + цвет |
| `EdgeSelectionPanel` | Выбрана связь | Подпись, удаление |

## Горячие клавиши

| Сочетание | Действие | Примечание |
|-----------|----------|------------|
| Ctrl+Z / Ctrl+Shift+Z | Undo / Redo | `event.code` KeyZ — любая раскладка |
| Ctrl+C / Ctrl+V | Копия / вставка узла | `nodeClipboard.ts`, KeyC/KeyV |
| Delete / Backspace | Удалить выделенное | Не в полях ввода |

## Контекст React

- `CanvasActionsContext` — `updateNode`, `onGroupResizeStart/Resize/End`.
- `useCanvasHistory` — undo/redo; пауза при drag.
- `useRightClickMarquee` — ПКМ-рамка; группы по границе.
- `boardStorage.ts` — черновик и имя доски.

## Toolbar: стили кнопок

| Кнопка | Стиль |
|--------|--------|
| **↺ Демо → T Текст → + Карточка → ◻ Группа** | слева направо после Undo/Redo |
| **📄+ → 📂 → 💾 → 🖨 → ☀☾** | справа: Сначала → Load → Save → Print → Theme; «Сначала» — accent |
| **RU \| EN \| ES \| 中** | компактный переключатель справа |

## PWA

- `public/manifest.webmanifest`, иконки — имя **MindStorm**.
