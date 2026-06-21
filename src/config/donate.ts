/**
 * Способы доната MindStorm.
 *
 * Крипто — адрес копируется в буфер.
 * Boosty / Ko-fi — открываются в новой вкладке (карта, PayPal, СБП).
 *
 * После регистрации на платформах проверьте URL ниже и сделайте git push.
 * Пустой `url` — способ скрыт в UI.
 */

export type DonateWallet = {
  label: string;
  wallet: string;
  min?: string;
};

export type DonatePlatform = 'boosty' | 'kofi' | 'donationalerts' | 'generic';

export type DonateLink = {
  platform: DonatePlatform;
  label: string;
  url: string;
  hintRu?: string;
  hintEn?: string;
};

const envWallet = import.meta.env.VITE_DONATE_WALLET?.trim() ?? '';
const envLabel = import.meta.env.VITE_DONATE_LABEL?.trim() ?? 'USDT TRC-20';
const envBoosty = import.meta.env.VITE_DONATE_BOOSTY?.trim() ?? '';
const envKofi = import.meta.env.VITE_DONATE_KOFI?.trim() ?? '';

/** USDT — копирование адреса. */
export const DONATE_WALLETS: DonateWallet[] = [
  ...(envWallet
    ? [{ label: envLabel, wallet: envWallet }]
    : [
        {
          label: 'USDT · Tron (TRC20)',
          wallet: 'TJDeM6zHao6jKUVhf2fLcACL3DmwqwP8aX',
          min: '0,01 USDT',
        },
        {
          label: 'USDT · TON',
          wallet: 'UQA1Xz5oPR3BhldHDfgxRQ8GIf3fDjYk-M4iidzdDaOd6Ylj',
          min: '0,001 USDT',
        },
      ]),
];

/**
 * Карта / PayPal — внешние страницы.
 * Замените `m11nic89co` на свой ник после регистрации, если другой.
 */
export const DONATE_LINKS: DonateLink[] = [
  {
    platform: 'boosty',
    label: 'Boosty',
    url: envBoosty || 'https://boosty.to/m11nic89co/donate',
    hintRu: 'Банковская карта, СБП, подписка',
    hintEn: 'Bank card, RU payments, subscription',
  },
  {
    platform: 'kofi',
    label: 'Ko-fi',
    url: envKofi || 'https://ko-fi.com/m11nic89co',
    hintRu: 'Карта, PayPal, разовый донат',
    hintEn: 'Card, PayPal, one-time tip',
  },
].filter((item) => item.url.trim().length > 0);

export function activeDonateLinks(): DonateLink[] {
  return DONATE_LINKS;
}

export function hasDonateOptions(): boolean {
  return (
    DONATE_WALLETS.some((item) => item.wallet.trim().length > 0) ||
    activeDonateLinks().length > 0
  );
}
