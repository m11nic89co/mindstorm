# Настройка донатов (Boosty, Ko-fi, USDT)

> Регистрацию на Boosty и Ko-fi **может пройти только владелец аккаунта** (вы) — нужны email, телефон и привязка карты для **вывода** денег, не для приёма.

После регистрации ссылки уже прописаны в `src/config/donate.ts` под ник **`m11nic89co`**. Если выберете другой URL — замените там и сделайте `git push`.

---

## Что видит пользователь

Кнопка **☕ Донат** внизу сайта → панель:

1. **Картой и PayPal** — Boosty, Ko-fi (один клик, новая вкладка)
2. **Криптовалюта USDT** — Tron TRC20 и TON (копирование адреса)

Карточные способы **сверху** — так удобнее большинству.

---

## Boosty (Россия / СНГ, карта, СБП)

1. Откройте https://boosty.to и **Зарегистрироваться**.
2. Ник страницы: **`m11nic89co`** (или свой — тогда обновите URL в `donate.ts`).
3. Профиль → **Настройки** → **Платежи** → привязать карту для **вывода** средств.
4. Включите **разовые донаты** (Donate) на странице автора.
5. Проверьте ссылку: https://boosty.to/m11nic89co/donate

**Комиссия:** Boosty удерживает процент с платежа (смотрите актуальные условия на сайте).  
**Стоимость регистрации:** бесплатно.

---

## Ko-fi (мир, карта, PayPal)

1. Откройте https://ko-fi.com и **Create your Ko-fi page**.
2. Username: **`m11nic89co`** (или свой → обновите `donate.ts`).
3. **Settings** → **Payments** → подключить **Stripe** и/или **PayPal** для получения донатов.
4. Страница доната: https://ko-fi.com/m11nic89co

**Комиссия:** бесплатный план Ko-fi берёт небольшой % (см. ko-fi.com/pricing).  
**Стоимость регистрации:** $0.

---

## USDT (уже настроено)

| Сеть | Адрес | Минимум |
|------|--------|---------|
| Tron TRC20 | `TJDeM6zHao6jKUVhf2fLcACL3DmwqwP8aX` | 0,01 USDT |
| TON | `UQA1Xz5oPR3BhldHDfgxRQ8GIf3fDjYk-M4iidzdDaOd6Ylj` | 0,001 USDT |

Менять в `src/config/donate.ts` → `DONATE_WALLETS`.

---

## Файл конфигурации

`src/config/donate.ts`:

```typescript
export const DONATE_LINKS = [
  { platform: 'boosty', url: 'https://boosty.to/m11nic89co/donate', ... },
  { platform: 'kofi', url: 'https://ko-fi.com/m11nic89co', ... },
];
```

Чтобы **скрыть** способ — очистите `url: ''`.

### Через `.env` (опционально)

```env
VITE_DONATE_BOOSTY=https://boosty.to/m11nic89co/donate
VITE_DONATE_KOFI=https://ko-fi.com/m11nic89co
```

---

## Почему этот набор — оптимальный

| Способ | Кому удобно | Комиссия посредника |
|--------|-------------|---------------------|
| **Boosty** | Россия, СБП, карта МИР/Visa/MC | есть |
| **Ko-fi** | Зарубеж, PayPal, карта | небольшая |
| **USDT** | Крипто, без посредника | только сеть |

Три канала покрывают почти всех; лишние платформы (Patreon, DonationAlerts) только путают.

---

## Деплой

```powershell
git push origin main
```

Сайт: https://m11nic89co.github.io/mindstorm/
