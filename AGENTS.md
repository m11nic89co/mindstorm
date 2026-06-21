# MindStorm — указания для AI-агентов

**Перед работой прочитайте [CONTEXT.md](./CONTEXT.md)** — там полный контекст проекта.

## Быстрые факты

- Продукт: **MindStorm** (большая **S**).
- Не использовать: MindShtorm, mindshtorm (кроме legacy совместимости файлов: `.mindshtorm`, `mindshtorm-board`).
- Ответы пользователю — **на русском**.
- Коммиты и push — **только по явной просьбе**.

## Критичные файлы

| Задача | Файл |
|--------|------|
| Холст, UX | `src/components/MindCanvas.tsx` |
| Toolbar, панели | `src/components/Toolbar.tsx` |
| Точки связи | `src/components/nodes/edgeHandles.tsx` |
| Слои групп/рёбер | `src/index.css` |
| Save/load / storage | `src/lib/localBoardFile.ts`, `src/lib/boardStorage.ts` |
| Формат JSON Canvas | `src/lib/jsonCanvas.ts`, `src/lib/flowEdges.ts` |
| Демо-схема | `src/lib/demoCanvas.ts` |
| Цвета (12) | `src/lib/colors.ts` |
| Undo/redo | `src/hooks/useCanvasHistory.ts` |
| ПКМ-рамка | `src/hooks/useRightClickMarquee.ts` |
| Деплoy | `scripts/deploy-pages.ps1` |

## Не ломать

- Гroups `z-index: -1` — линии связей **всегда** над группами.
- Создание карточки только двойным кликом по **пустому** холсту.
- `zIndexMode="manual"`, `elevateNodesOnSelect={false}` на ReactFlow.

## Деплой (Windows)

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
cd "G:\Мой диск\Projects\MindStorm"   # git + Cursor; push → CI деплой
npm run deploy:pages
```

Подробности — [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md).
