# MindStorm

Интерактивная доска для брейншторма в стиле [Obsidian Canvas](https://obsidian.md/canvas). Формат данных — [JSON Canvas](https://jsoncanvas.org/).

**Онлайн:** https://m11nic89co.github.io/mindstorm/

**Репозиторий:** https://github.com/m11nic89co/mindstorm

> Для разработчиков и AI: обязательный контекст — **[CONTEXT.md](./CONTEXT.md)**

---

## Возможности

- Текстовые **карточки** и **группы** с изменением размера
- **12 цветов** для карточек и групп; **название** в панели при выборе
- **Связи** между карточками — 8 точек на узел (2 на каждую сторону), подписи, цвет от исходной карточки
- **Undo / Redo** (Ctrl+Z / Ctrl+Shift+Z)
- Pan / zoom (колёсико мыши); **ПКМ + рамка** — выделение
- **Автосохранение** черновика в браузере
- **Сохранить / Загрузить** — файл `.mindstorm` на диск
- **Сначала** — пустая доска; **↺ Демо** — пример схемы
- Совместимость с `.canvas` (Obsidian)

---

## Быстрый старт (пользователь)

1. Откройте [сайт](https://m11nic89co.github.io/mindstorm/) или запустите локально (`npm run dev`)
2. **Двойной клик** по пустому месту — новая карточка
3. **Двойной клик** по карточке — редактирование текста
4. **Точки на карточке** (при наведении) — потяните для связи
5. **Клик по карточке или группе** — название и цвет справа
6. **Сохранить** — файл на компьютер; **Загрузить** — открыть файл
7. **Сначала** — пустая схема; **↺ Демо** — пример
8. **Delete** — удалить выделенное

---

## Локальная разработка

```bash
npm install
npm run dev
```

→ http://localhost:5173

Подробнее: [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)

---

## Деплой (GitHub Pages)

```bash
npm run deploy:pages
```

---

## Документация

| Файл | Содержание |
|------|------------|
| [CONTEXT.md](./CONTEXT.md) | **Главный контекст проекта** (перенос, AI, решения) |
| [AGENTS.md](./AGENTS.md) | Краткие указания для AI-агентов |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Архитектура и слои UI |
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Сборка, деплой, Windows |
| [docs/FILE_FORMAT.md](./docs/FILE_FORMAT.md) | Формат `.mindstorm` |
| [canvases/README.md](./canvases/README.md) | Демо-схемы в репо |

---

## Формат `.mindstorm` (кратко)

```json
{
  "format": "mindstorm-board",
  "version": 1,
  "title": "моя-схема",
  "savedAt": "2026-06-21T12:00:00.000Z",
  "canvas": { "nodes": [], "edges": [] }
}
```

Старые `.mindshtorm` и Obsidian `.canvas` тоже открываются.

---

## Стек

Vite · React 19 · TypeScript · Tailwind CSS v4 · @xyflow/react

---

## Лицензия

MIT
