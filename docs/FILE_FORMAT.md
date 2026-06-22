# Формат файла MindStorm (`.mindstorm`)

## Обёртка MindStorm

Файлы, созданные кнопкой **Сохранить**, используют обёртку:

```json
{
  "format": "mindstorm-board",
  "version": 1,
  "title": "название-схемы",
  "savedAt": "2026-06-21T12:00:00.000Z",
  "canvas": {
    "nodes": [],
    "edges": []
  }
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| `format` | `"mindstorm-board"` | Идентификатор формата |
| `version` | `1` | Версия обёртки |
| `title` | string | Отображаемое имя схемы |
| `savedAt` | ISO 8601 | Время сохранения |
| `canvas` | object | JSON Canvas |

Расширение: **`.mindstorm`**

## JSON Canvas (поле `canvas`)

Спецификация: https://jsoncanvas.org/

### Узлы

| type | Поля | Описание |
|------|------|----------|
| `text` | `text`, `label?` | Карточка; `label` — расширение MindStorm (badge в UI) |
| `group` | `label?` | Группа |
| `link` | `url` | Ссылка — тип в коде, UI минимален |
| `file` | `file` | Файл Obsidian — тип в коде, UI минимален |

Общие поля: `id`, `x`, `y`, `width`, `height`, `color` (`"1"`…`"12"`).

### Расширения MindStorm (не Obsidian)

| Поле | Где | Описание |
|------|-----|----------|
| `label` | `text` | Badge над карточкой |
| `i18n` | `text`, `group`, `edges` | Переводы (`ru`, `en`, `es`, `zh`): `*.text`, `*.label` |
| `parentGroupId` | любой узел *(план)* | ID группы, к которой «прикреплён» узел после **Группировать**. Координаты `x`/`y` в файле остаются **абсолютными** для совместимости с `.canvas`. См. [GROUPING.md](./GROUPING.md). |

Пример text-узла с названием:

```json
{
  "id": "card1",
  "type": "text",
  "x": 100,
  "y": 100,
  "width": 260,
  "height": 120,
  "color": "5",
  "label": "Идея",
  "text": "## Заголовок\nТекст карточки"
}
```

Пример `i18n` у text-узла:

```json
{
  "id": "card1",
  "type": "text",
  "x": 100,
  "y": 100,
  "width": 260,
  "height": 120,
  "text": "## Новая идея",
  "i18n": {
    "ru": { "text": "## Новая идея", "label": "Идея" },
    "en": { "text": "## New idea", "label": "Idea" },
    "es": { "text": "## Nueva idea", "label": "Idea" },
    "zh": { "text": "## 新想法", "label": "想法" }
  }
}
```

### Связи

```json
{
  "id": "e1",
  "fromNode": "idea",
  "fromSide": "right",
  "toNode": "branch",
  "toSide": "left",
  "fromEnd": "none",
  "toEnd": "arrow",
  "label": "связь"
}
```

В runtime MindStorm использует 8 handles на узел; при сохранении достаточно `fromSide` / `toSide`.

## Совместимость

| Формат | Загрузка |
|--------|----------|
| `.mindstorm` (`mindstorm-board`) | ✓ |
| `.mindshtorm` (`mindshtorm-board`) | ✓ legacy |
| `.canvas` (чистый JSON Canvas) | ✓ |
| Obsidian `.canvas` | ✓ |

## Реализация

- `src/lib/localBoardFile.ts` — serialize / parse / download / FileReader
- `src/lib/jsonCanvas.ts` — `canvasToFlow` / `flowToCanvas`

## Демо в коде

`src/lib/demoCanvas.ts` — `DEMO_CANVAS_I18N` (одна схема, переводы в `i18n`), `getDemoCanvas(locale)`.
Доп. копии ES/ZH для демо-узлов и edge-label — `src/lib/demoLocaleCopies.ts`.

## Группировка (в разработке)

Спецификация и риски: [GROUPING.md](./GROUPING.md).
