# MindStorm

Интерактивная доска для брейншторма в стиле [Obsidian Canvas](https://obsidian.md/canvas). Формат данных — [JSON Canvas](https://jsoncanvas.org/).

**Онлайн:** https://m11nic89co.github.io/mindstorm/

**Репозиторий:** https://github.com/m11nic89co/mindstorm

> Для разработчиков и AI: обязательный контекст — **[CONTEXT.md](./CONTEXT.md)**

---

## Возможности

- Текстовые **карточки** и **группы** с изменением размера
- **12 цветов** и **название** — панель справа при выборе узла
- **Связи** — 8 точек на узел (2 на сторону), подписи, цвет от исходной карточки, анимация к стрелке
- **Undo / Redo** (Ctrl+Z / Ctrl+Shift+Z)
- Pan / zoom; **ПКМ + рамка** — выделение нескольких узлов
- **RU / EN** — переключатель языка в toolbar
- **Автосохранение** черновика в браузере
- **Сохранить / Загрузить** — файл `.mindstorm` на диск
- **Сначала** — пустая доска (с подтверждением и отменой через Undo)
- **↺ Демо** — пример схемы на текущем языке
- Совместимость с `.canvas` (Obsidian)

---

## Быстрый старт

1. Откройте [сайт](https://m11nic89co.github.io/mindstorm/) или `npm run dev`
2. **Двойной клик** по пустому месту — новая карточка
3. **Двойной клик** по карточке — редактирование текста
4. **Точки на карточке** (при наведении) — потяните для связи
5. **Клик по карточке или группе** — название и цвет справа
6. **Сохранить** / **Загрузить** — файл на компьютер
7. **Сначала** — новая пустая схема; **↺ Демо** — пример
8. **RU | EN** — язык интерфейса
9. **Delete** — удалить выделенное

---

## Поделиться и установить

**Ссылка для всех:** https://m11nic89co.github.io/mindstorm/

- **Windows / Android:** Chrome или Edge → меню → «Установить MindStorm» (PWA, бесплатно).
- **Донат автору:** кнопка **☕ Донат** внизу экрана (настраивается в `src/config/donate.ts`).

Подробнее: [docs/PUBLISHING.md](./docs/PUBLISHING.md)

---

## Локальная разработка

```bash
npm install
npm run dev
```

→ http://localhost:5173

Подробнее: [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)

---

## Деплой

Push в `main` → GitHub Actions → https://m11nic89co.github.io/mindstorm/

Запасной вариант: `npm run deploy:pages` (ветка `gh-pages`).

---

## Документация

| Файл | Содержание |
|------|------------|
| [CONTEXT.md](./CONTEXT.md) | **Главный контекст** (архитектура, UX, решения) |
| [AGENTS.md](./AGENTS.md) | Указания для AI-агентов |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Архитектура и слои UI |
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Сборка, деплой, Windows |
| [docs/FILE_FORMAT.md](./docs/FILE_FORMAT.md) | Формат `.mindstorm` |
| [docs/PUBLISHING.md](./docs/PUBLISHING.md) | Бесплатная публикация, PWA, донат |
| [docs/DONATE_SETUP.md](./docs/DONATE_SETUP.md) | Boosty, Ko-fi, USDT — настройка донатов |
| [docs/GROUPING.md](./docs/GROUPING.md) | План: Группировать / Разгруппировать (отложено) |
| [canvases/README.md](./canvases/README.md) | Референсные `.canvas` |

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

MIT © [m11nic89co](https://github.com/m11nic89co)
