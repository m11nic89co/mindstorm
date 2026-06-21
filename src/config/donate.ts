/**
 * Донаты — бесплатно, без посредников.
 *
 * 1. Вставьте адрес кошелька в `wallet` (или ссылку Boosty/Ko-fi в `linkUrl`).
 * 2. git push → кнопка «Донат» появится внизу сайта.
 *
 * Можно задать через .env (не коммитить секреты не нужно — это публичный адрес):
 *   VITE_DONATE_WALLET=...
 *   VITE_DONATE_LABEL=USDT TRC-20
 *   VITE_DONATE_LINK=https://boosty.to/...
 */

export type DonateWallet = {
  label: string;
  wallet: string;
};

const envWallet = import.meta.env.VITE_DONATE_WALLET?.trim() ?? '';
const envLabel = import.meta.env.VITE_DONATE_LABEL?.trim() ?? 'USDT TRC-20';
const envLink = import.meta.env.VITE_DONATE_LINK?.trim() ?? '';

/** Крипто-кошельки — адрес копируется по кнопке «Скопировать». */
export const DONATE_WALLETS: DonateWallet[] = [
  ...(envWallet
    ? [{ label: envLabel, wallet: envWallet }]
    : [{ label: 'USDT · Tron (TRC20)', wallet: 'TJDeM6zHao6jKUVhf2fLcACL3DmwqwP8aX' }]),
];

/** Опциональная ссылка (Boosty, Ko-fi, DonationAlerts) — откроется в новой вкладке. */
export const DONATE_LINK = envLink || '';

export function hasDonateOptions(): boolean {
  return DONATE_WALLETS.some((item) => item.wallet.trim().length > 0) || DONATE_LINK.length > 0;
}
