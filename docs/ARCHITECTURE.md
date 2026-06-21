# Архитектура MindStorm

## Обзор

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  ┌─────────────┐    ┌─────────────────────────────────┐ │
│  │ Toolbar     │    │ React Flow (MindCanvas)         │ │
│  │ Undo/Redo   │    │  · TextCardNode (z=1)           │ │
│  │ Save/Load   │    │  · GroupCardNode (z=-1)         │ │
│  │ Сначала/Демо│    │  · Edges (z=0, animated)        │ │
│  └─────────────┘    └─────────────────────────────────┘ │
│  SelectionPanel ──► цвет + название выбранного узла     │
│  EdgeSelectionPanel ► подпись выбранной связи           │
│         │                                               │
│         ▼                                               │
│  localStorage ◄──────── flowToCanvas / canvasToFlow     │
│  .mindstorm file ◄────── localBoardFile.ts              │
└─────────────────────────────────────────────────────────┘
```

## Поток данных

1. **Старт:** `localStorage` (`mindstorm.canvas.v1`) → `canvasToFlow` → React Flow state.
2. **Редактирование:** nodes/edges в памяти; debounce 400 ms → `localStorage`; history commit на drag stop.
3. **Сохранить:** `flowToCanvas` → `MindStormBoardFile` → файл на диск.
4. **Загрузить:** File → `parseBoardFile` → `canvasToFlow` → state.
5. **Сначала:** `EMPTY_CANVAS` → пустое состояние.
6. **Демо:** `demoCanvas.ts` → `DEMO_CANVAS` → анимация появления.

## React Flow

- Кастомные типы узлов: `textCard`, `groupCard`.
- Рёбра: `smoothstep`, `animated: true`, цвет от **source**-узла, стрелка на **target**.
- Handles: компонент `EdgeHandles` — 8 точек (`source-{top|right|bottom|left}-{a|b}`), `ConnectionMode.Loose`.
- `zIndexMode="manual"`, `elevateNodesOnSelect={false}`.

## Слои (z-index)

React Flow рисует **все узлы поверх SVG рёбер**. Решение:

- CSS `z-index: -1` для `.react-flow__node-groupCard`.
- Рёбра `.react-flow__edges { z-index: 0 }`.
- Карточки `z-index: 1+`.

Метка группы и badge карточки — **внутри узла** (absolute, `-top-3`), не ViewportPortal.

## Панели выделения

| Панель | Когда | Содержимое |
|--------|-------|------------|
| `SelectionPanel` | Выбран узел (не связь) | Название, 12 цветов (6×2) |
| `EdgeSelectionPanel` | Выбрана связь | Подпись, удаление |

## Контекст React

- `CanvasActionsContext` — `updateNode(id, patch)` для карточек/групп.
- `useCanvasHistory` — undo/redo (Ctrl+Z / Ctrl+Shift+Z); пауза при drag.
- `useRightClickMarquee` — ПКМ-рамка; группы выбираются по границе.
- `boardStorage.ts` — localStorage черновика и имени доски.
- Отдельного глобального store нет.

## Цвета

`colors.ts` — 12 пресетов (`PRESET_COLORS`, id `1`–`12`). Используются в узлах и для stroke рёбер (через `flowEdges.ts`).

## PWA

- `public/manifest.webmanifest`, иконки, `index.html` meta — имя **MindStorm**.
