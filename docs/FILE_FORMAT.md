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

Расширение файла: **`.mindstorm`**

## JSON Canvas (поле `canvas`)

Спецификация: https://jsoncanvas.org/

### Узлы

| type | Описание |
|------|----------|
| `text` | Текстовая карточка (`text`) |
| `group` | Группа (`label`) |
| `link` | Ссылка (`url`) — тип поддержан, UI минимален |
| `file` | Файл Obsidian — тип поддержан, UI минимален |

Общие поля: `id`, `x`, `y`, `width`, `height`, `color` (`"1"`…`"6"`).

### Связи

```json
{
  "id": "e1",
  "fromNode": "idea",
  "fromSide": "right",
  "toNode": "branch",
  "toSide": "left",
  "fromEnd": "none",
  "toEnd": "arrow"
}
```

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

## Пример в репозитории

`canvases/demo.canvas` — чистый JSON Canvas (без обёртки), используется как `DEMO_CANVAS`.
