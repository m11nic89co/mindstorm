/**
 * Способы доната MindStorm.
 *
 * Активны сейчас: PayPal + USDT.
 * Ko-fi, Buy Me a Coffee, Boosty — в PLANNED_METHODS (добавить в DONATE_METHODS позже).
 */

export type DonateWallet = {
  label: string;
  wallet: string;
  min?: string;
};

export type DonatePlatform =
  | 'paypal'
  | 'kofi'
  | 'buymeacoffee'
  | 'boosty'
  | 'crypto';

export type DonateLinkMethod = {
  id: string;
  kind: 'link';
  platform: Exclude<DonatePlatform, 'crypto'>;
  label: string;
  url: string;
  hintRu: string;
  hintEn: string;
  hintEs?: string;
  hintZh?: string;
};

export type DonateCryptoMethod = {
  id: string;
  kind: 'crypto';
  platform: 'crypto';
  label: string;
  hintRu: string;
  hintEn: string;
  hintEs?: string;
  hintZh?: string;
  wallets: DonateWallet[];
};

export type DonateMethod = DonateLinkMethod | DonateCryptoMethod;

const HANDLE = 'm11nic89co';

const envPaypal = import.meta.env.VITE_PAYPAL_ME?.trim() ?? '';
const envKofi = import.meta.env.VITE_DONATE_KOFI?.trim() ?? '';
const envBmc = import.meta.env.VITE_DONATE_BMC?.trim() ?? '';
const envBoosty = import.meta.env.VITE_DONATE_BOOSTY?.trim() ?? '';

const USDT_WALLETS: DonateWallet[] = [
  {
    label: 'Tron (TRC20)',
    wallet: 'TJDeM6zHao6jKUVhf2fLcACL3DmwqwP8aX',
    min: '0,01 USDT',
  },
  {
    label: 'TON',
    wallet: 'UQA1Xz5oPR3BhldHDfgxRQ8GIf3fDjYk-M4iidzdDaOd6Ylj',
    min: '0,001 USDT',
  },
];

/** Сейчас в UI — только готовые способы. */
const ACTIVE_METHODS: DonateMethod[] = [
  {
    id: 'paypal',
    kind: 'link',
    platform: 'paypal',
    label: 'PayPal',
    url: envPaypal || `https://paypal.me/${HANDLE}`,
    hintRu: 'PayPal или карта — 1–2 клика',
    hintEn: 'PayPal or card — 1–2 taps',
    hintEs: 'PayPal o tarjeta — 1–2 clics',
    hintZh: 'PayPal 或银行卡 — 1–2 步',
  },
  {
    id: 'usdt',
    kind: 'crypto',
    platform: 'crypto',
    label: 'USDT',
    hintRu: 'Tron (TRC20) или TON — скопировать адрес',
    hintEn: 'Tron (TRC20) or TON — copy address',
    hintEs: 'Tron (TRC20) o TON — copiar dirección',
    hintZh: 'Tron (TRC20) 或 TON — 复制地址',
    wallets: USDT_WALLETS,
  },
];

/**
 * Отложено — раскомментировать и добавить в ACTIVE_METHODS после регистрации.
 * См. docs/DONATE_SETUP.md
 */
export const PLANNED_METHODS: DonateLinkMethod[] = [
  {
    id: 'kofi',
    kind: 'link',
    platform: 'kofi',
    label: 'Ko-fi',
    url: envKofi || `https://ko-fi.com/${HANDLE}`,
    hintRu: 'Карта, PayPal, Apple Pay',
    hintEn: 'Card, PayPal, Apple Pay',
  },
  {
    id: 'buymeacoffee',
    kind: 'link',
    platform: 'buymeacoffee',
    label: 'Buy Me a Coffee',
    url: envBmc || `https://buymeacoffee.com/${HANDLE}`,
    hintRu: 'Карта, Apple/Google Pay',
    hintEn: 'Card, Apple/Google Pay',
  },
  {
    id: 'boosty',
    kind: 'link',
    platform: 'boosty',
    label: 'Boosty',
    url: envBoosty || `https://boosty.to/${HANDLE}/donate`,
    hintRu: 'Россия и СНГ: карта, СБП',
    hintEn: 'Russia & CIS: card, SBP',
  },
];

export const DONATE_METHODS: DonateMethod[] = ACTIVE_METHODS.filter((method) => {
  if (method.kind === 'link') return method.url.trim().length > 0;
  return method.wallets.some((w) => w.wallet.trim().length > 0);
});

export function hasDonateOptions(): boolean {
  return DONATE_METHODS.length > 0;
}
