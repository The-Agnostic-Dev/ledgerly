import type { Currency, Rates } from '../shared/types.ts';

// Rates are reviewed by finance and updated with each release.
export const RATES: Rates = {
  base: 'NGN',
  rates: { NGN: 1, USD: 1550, GBP: 1960, EUR: 1690 },
  updatedAt: '2026-10-28',
};

export function toNaira(amount: number, currency: Currency): number {
  return amount * RATES.rates[currency];
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
