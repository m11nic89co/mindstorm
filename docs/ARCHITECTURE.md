# Архитектура MindStorm

## Обзор

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  LocaleProvider (RU/EN/ES/ZH)                           │
│  ┌─────────────┐    ┌─────────────────────────────────┐ │
│  │ Toolbar     │    │ React Flow (MindCanvas)         │ │
│  │ Undo/Redo   │    │  · TextCardNode (z=1)           │ │
│  │ Save/Open   │    │  · GroupCardNode (z=-1)         │ │
│  │ Сначала/Демо│    │  · Edges (z=0, animated)        │ │
│  │ RU|EN|ES|中 │    └─────────────────────────────────┘ │
│  └─────────────┘                                        │
│  SelectionPanel ──► название + 12 цветов                │
│  EdgeSelectionPanel ► подпись связи                     │
│         │                                               │
│         ▼                                               │
│  localStorage ◄──────── flowToCanvas / canvasToFlow     │
│  .mindstorm file ◄────── localBoardFile.ts              │
└─────────────────────────────────────────────────────────┘
```

## Поток данных

1. **Старт:** `mindstorm.canvas.v1` → `canvasToFlow` → state; если пусто — `getDemoCanvas(readLocale())`.
2. **Редактирование:** debounce 400 ms → localStorage; history commit на drag stop и на **конец resize группы**.
3. **Сохранить:** `flowToCanvas` → `MindStormBoardFile` → диск.
4. **Загрузить:** File → `parseBoardFile` → state.
5. **Сначала:** confirm → `commitNow()` → пустые nodes/edges **без** `resetHistory` → Undo.
6. **Демо:** `demoFlowPresentation(locale)` → анимация появления.

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

- Узлы: `textCard`, `groupCard`.
- **Text-карточка:** `data.label` — заголовок (верх), `data.text` — тело (низ); в `CardNodes.tsx` — отдельное редактирование по двойному клику.
- Рёбра: `smoothstep`, `animated`, цвет от **source**, стрелка на **target**.
- Handles: `EdgeHandles` — 8 точек (`source-{side}-{a|b}`), `ConnectionMode.Loose`.
- `zIndexMode="manual"`, `elevateNodesOnSelect={false}`.

## Слои (z-index)

- `.react-flow__node-groupCard` → `z-index: -1`
- `.react-flow__edges` → `z-index: 0`
- Карточки → `z-index: 1+`

Метка группы — badge на верхней кромке с **замком** справа; масштаб `labelFontSize` до 200 px (иконка замка — `1em`, как текст метки). Заголовок text-карточки — **внутри** узла, над разделителем.

## Панели выделения

| Панель | Когда | Содержимое |
|--------|-------|------------|
| `SelectionPanel` | Выбран узел (не закреплённая группа) | Название; карточка: размер заголовка и текста; группа: размер метки; 12 цветов |
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
| **Сначала** / **New** | `accent` (бирюзовая рамка) |
| **↺ Демо** / **↺ Demo** | обычная |
| **RU \| EN \| ES \| 中** | компактный переключатель справа |

## PWA

- `public/manifest.webmanifest`, иконки — имя **MindStorm**.
