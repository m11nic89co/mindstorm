# MindShtorm

Интерактивная доска для брейншторма в стиле Obsidian Canvas. Формат **JSON Canvas** — доски открываются в Obsidian.

**Онлайн:** https://m11nic89co.github.io/mindshtorm/

**Репозиторий:** https://github.com/m11nic89co/mindshtorm

## Как пользоваться (онлайн)

1. Откройте https://m11nic89co.github.io/mindshtorm/
2. **Двойной клик** по холсту — новая карточка
3. **Перетащите от точки** на карточке — связь с другой
4. **Двойной клик по карточке** — редактировать текст
5. **↓ Из GitHub** — открыть общую схему команды
6. **↑ В GitHub** — сохранить в общее хранилище (нужен вход через GitHub)

Доска автоматически сохраняется в браузере (localStorage). Общие схемы лежат в репозитории в папке `canvases/`.

## Общее хранилище (команда)

Все схемы команды хранятся в одном месте: `m11nic89co/mindshtorm/canvases/`.

| Действие | Вход нужен? |
|----------|-------------|
| Открыть список и загрузить схему | Нет |
| Сохранить или обновить схему | Да — «Войти через GitHub» |

**Как подключить сотрудника:**

1. GitHub → репозиторий `mindshtorm` → **Settings → Collaborators → Add people**
2. Сотрудник открывает MindShtorm → **Войти** → подтверждает код на github.com/login/device
3. Готово — сохраняет под своим аккаунтом, все видят общий список схем

В списке схем отображается, **кто и когда** последний раз сохранял (`boards-manifest.json`).

## Настройка OAuth (один раз, для владельца)

Чтобы кнопка «Войти через GitHub» работала на сайте:

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
2. **Application name:** MindShtorm  
   **Homepage URL:** `https://m11nic89co.github.io/mindshtorm/`  
   **Authorization callback URL:** `https://m11nic89co.github.io/mindshtorm/` (для Device Flow не используется, но поле обязательно)
3. Скопируйте **Client ID**
4. Создайте `.env` из `.env.example` и укажите `VITE_GITHUB_CLIENT_ID=...`
5. Соберите и задеплойте: `npm run deploy:pages`

Client ID — публичный, в коде фронтенда это нормально.

## Локальный запуск

```bash
cp .env.example .env
# укажите VITE_GITHUB_CLIENT_ID
npm install
npm run dev
```

Откройте http://localhost:5173

## Обновить сайт в облаке

```bash
npm run deploy:pages
```

## Сборка

```bash
npm run build
npm run preview
```

## Лицензия

MIT
