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

Расширение редактируемой схемы: **`.mindstorm`**

**PNG:** кнопка «Сохранить» по умолчанию предлагает снимок `.png` (превью). PNG **не** является форматом схемы — открыть его обратно в редактор нельзя. Для повторного редактирования сохраняйте `.mindstorm`.

## JSON Canvas (поле `canvas`)

Спецификация: https://jsoncanvas.org/

### Узлы

| type | Поля | Описание |
|------|------|----------|
| `text` | `text`, `label?`, `plain?` | Карточка (`label` + `text`) или **простой текст** (`plain: true` — только `text`, без рамки) |
| `group` | `label?` | Группа |
| `link` | `url` | Ссылка — тип в коде, UI минимален |
| `file` | `file` | Файл Obsidian — тип в коде, UI минимален |

Общие поля: `id`, `x`, `y`, `width`, `height`, `color` (`"1"`…`"12"`).

### Расширения MindStorm (не Obsidian)

| Поле | Где | Описание |
|------|-----|----------|
| `label` | `text` | Заголовок карточки (верхняя зона в UI) |
| `labelFontSize` | `text` | Размер шрифта заголовка (px, 10–36, default 15) |
| `textFontSize` | `text` | Размер шрифта тела / plain-текста (карточка: 10–36; plain: 10–96) |
| `plain` | `text` | `true` — простой текст на холсте (без карточки), цвет = цвет текста |
| `labelFontSize` | `group` | Размер шрифта метки группы (px, 8–200, default 12) |
| `locked` | `group` | `true` — группа закреплена как фон (см. `groupLock.ts`) |
| `i18n` | `text`, `group`, `edges` | Переводы (`ru`, `en`, `es`, `zh`): `*.text`, `*.label` |
| `parentGroupId` | любой узел *(план)* | ID группы, к которой «прикреплён» узел после **Группировать**. Координаты `x`/`y` в файле остаются **абсолютными** для совместимости с `.canvas`. См. [GROUPING.md](./GROUPING.md). |

Пример text-узла с заголовком и телом:

```json
{
  "id": "card1",
  "type": "text",
  "x": 100,
  "y": 100,
  "width": 260,
  "height": 140,
  "color": "5",
  "label": "Идея",
  "text": "Описание мысли и детали..."
}
```

Пример **простого текста** (без карточки):

```json
{
  "id": "label1",
  "type": "text",
  "plain": true,
  "x": 320,
  "y": 80,
  "width": 200,
  "height": 48,
  "color": "11",
  "text": "Заголовок блока",
  "textFontSize": 24
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
  "height": 140,
  "label": "Идея",
  "text": "Описание на русском",
  "i18n": {
    "ru": { "label": "Идея", "text": "Описание на русском" },
    "en": { "label": "Idea", "text": "Description in English" },
    "es": { "label": "Idea", "text": "Descripción en español" },
    "zh": { "label": "想法", "text": "中文描述" }
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
| `.png` | ✗ (только превью при сохранении) |

## Реализация

- `src/lib/localBoardFile.ts` — serialize / parse / save (PNG + `.mindstorm`) / open
- `src/lib/exportPng.ts` — снимок холста
- `src/lib/fileHandleStorage.ts` — запоминание папки (IndexedDB)
- `src/lib/jsonCanvas.ts` — `canvasToFlow` / `flowToCanvas`

## Демо в коде

`src/lib/demoCanvas.ts` — `DEMO_CANVAS_I18N` (одна схема, переводы в `i18n`), `getDemoCanvas(locale)`.
Доп. копии ES/ZH для демо-узлов и edge-label — `src/lib/demoLocaleCopies.ts`.

## Группировка (в разработке)

Спецификация и риски: [GROUPING.md](./GROUPING.md).
