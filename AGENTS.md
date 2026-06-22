# MindStorm — указания для AI-агентов

**Перед работой прочитайте [CONTEXT.md](./CONTEXT.md)** — там полный контекст проекта.

## Быстрые факты

- Продукт: **MindStorm** (большая **S**).
- Не использовать: MindShtorm, mindshtorm (кроме legacy: `.mindshtorm`, `mindshtorm-board`).
- Ответы пользователю — **на русском**.
- UI приложения: **RU по умолчанию**, есть **EN / ES / ZH** (`src/i18n/messages.ts`, `src/i18n/locales.ts`).
- Коммиты и push — **только по явной просьбе**.

## Критичные файлы

| Задача | Файл |
|--------|------|
| Холст, UX | `src/components/MindCanvas.tsx` |
| Toolbar, панели, RU/EN/ES/ZH | `src/components/Toolbar.tsx` |
| Локализация | `src/i18n/messages.ts`, `src/i18n/locales.ts`, `LocaleProvider.tsx` |
| Точки связи | `src/components/nodes/edgeHandles.tsx` |
| Слои групп/рёбер | `src/index.css` |
| Save/load / storage | `src/lib/localBoardFile.ts`, `src/lib/boardStorage.ts` |
| JSON Canvas | `src/lib/jsonCanvas.ts`, `src/lib/flowEdges.ts` |
| i18n доски | `src/lib/nodeLocale.ts` |
| Resize группы | `src/lib/groupResize.ts` |
| Замок группы | `src/lib/groupLock.ts` |
| Копирование узлов | `src/lib/nodeClipboard.ts` |
| Типографика карточек | `src/lib/cardTypography.ts`, `src/lib/groupLabel.ts` |
| Горячие клавиши | `src/hooks/useCanvasShortcuts.ts`, `useCanvasHistory.ts` |
| Демо-схема (RU/EN/ES/ZH) | `src/lib/demoCanvas.ts`, `src/lib/demoLocaleCopies.ts` |
| Цвета (12) | `src/lib/colors.ts` |
| Undo/redo | `src/hooks/useCanvasHistory.ts` |
| ПКМ-рамка | `src/hooks/useRightClickMarquee.ts` |
| Деплoy | `.github/workflows/deploy.yml`, `scripts/deploy-pages.ps1` |

## Не ломать

- Groups `z-index: -1` — линии связей **всегда** над группами.
- Создание карточки только двойным кликом по **пустому** холсту.
- `zIndexMode="manual"`, `elevateNodesOnSelect={false}` на ReactFlow.
- «Сначала» — **не** вызывает `resetHistory` (нужен Undo).
- Новые UI-строки — **во все 4 языка** в `messages.ts` (`ru`, `en`, `es`, `zh`).
- Resize группы: меняется рамка; масштабируются только **выделенные** карточки и вложенные группы (рекурсивно для выделенной вложенной группы) через `groupResize.ts` / `nodesToResizeWithGroup`.
- **Замок группы** (`locked` в data, `groupLock.ts`): закреплённая группа — только фон; кликабелен замок на метке; `draggable`/`selectable: false`.
- **Ctrl+C / Ctrl+V** — копия узлов (`nodeClipboard.ts`); горячие клавиши по **`event.code`** (RU/EN раскладка).
- Text-карточка: `labelFontSize`, `textFontSize` — панель справа; новая карточка по dblclick — цвет **12** (серый).
- Метка группы: `labelFontSize` до **200 px**; замок на badge в `GroupCardNode` (иконка **1em** — тот же размер, что текст метки).
- Text-карточка: `label` (заголовок) и `text` (тело) — **раздельные** зоны в `CardNodes.tsx`; не смешивать при редактировании.
- Группировка содержимого группы — см. [docs/GROUPING.md](./docs/GROUPING.md) (пока не реализовано).

## Деплoy (Windows)

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
cd "G:\Мой диск\Projects\MindStorm"
git push origin main   # основной способ — CI
```

Подробности — [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md).
