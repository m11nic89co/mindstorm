# Архитектура MindStorm

## Обзор

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  ┌─────────────┐    ┌─────────────────────────────────┐ │
│  │ Toolbar     │    │ React Flow (MindCanvas)         │ │
│  │ Save/Load   │    │  · TextCardNode (z=1)           │ │
│  └─────────────┘    │  · GroupCardNode (z=-1)         │ │
│         │           │  · Edges (z=0)                  │ │
│         ▼           └─────────────────────────────────┘ │
│  localStorage ◄──────── flowToCanvas / canvasToFlow   │
│  .mindstorm file ◄────── localBoardFile.ts            │
└─────────────────────────────────────────────────────────┘
```

## Поток данных

1. **Старт:** `localStorage` (`mindstorm.canvas.v1`) → `canvasToFlow` → React Flow state.
2. **Редактирование:** nodes/edges в памяти; debounce 400 ms → `localStorage`.
3. **Сохранить:** `flowToCanvas` → `MindStormBoardFile` → файл на диск.
4. **Загрузить:** File → `parseBoardFile` → `canvasToFlow` → state.

## React Flow

- Кастомные типы узлов: `textCard`, `groupCard`.
- Рёбра: `smoothstep`, цвет `rgba(165, 180, 252, …)`.
- Группы визуально — фон; handles связей на текстовых карточках.

## Слои (z-index)

React Flow рисует **все узлы поверх SVG рёбер**. Решение:

- CSS `z-index: -1` для `.react-flow__node-groupCard`.
- Рёбра `.react-flow__edges { z-index: 0 }`.
- Карточки `z-index: 1+`.

Метка и рамка выделения группы — **ViewportPortal** (не часть слоя группы).

## Контекст React

- `CanvasActionsContext` — `updateNode(id, patch)` для карточек/групп.
- Отдельного глобального store нет.

## PWA

- `public/manifest.webmanifest`, иконки, `index.html` meta — имя **MindStorm**.
