import type { Currency, Rates } from '../../shared/types';

const formatters = new Map<Currency, Intl.NumberFormat>();

export function formatMoney(amount: number, currency: Currency): string {
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatters.set(currency, formatter);
  }
  return formatter.format(amount);
}

/** Converts between currencies using naira as the pivot. */
export function convert(amount: number, from: Currency, to: Currency, rates: Rates): number {
  if (from === to) return amount;
  const naira = amount * rates.rates[from];
  return Math.round(naira / rates.rates[to]);
}
