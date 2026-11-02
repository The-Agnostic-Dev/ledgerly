import { describe, expect, it } from 'vitest';
import type { Rates } from '../../shared/types.ts';
import { convert, formatMoney } from '../../src/lib/money.ts';

const rates: Rates = { base: 'NGN', rates: { NGN: 1, USD: 1500, GBP: 2000, EUR: 1600 }, updatedAt: '2026-01-01' };

describe('formatMoney', () => {
  it('formats naira with two decimals', () => {
    expect(formatMoney(25_000, 'NGN')).toBe('₦25,000.00');
    expect(formatMoney(0.5, 'NGN')).toBe('₦0.50');
  });
});

describe('convert', () => {
  it('returns the same amount for the same currency', () => {
    expect(convert(1234.56, 'USD', 'USD', rates)).toBe(1234.56);
  });

  it('converts foreign currency into naira', () => {
    expect(convert(20, 'USD', 'NGN', rates)).toBe(30_000);
    expect(convert(10, 'GBP', 'NGN', rates)).toBe(20_000);
  });

  it('converts between two foreign currencies through naira', () => {
    expect(convert(3, 'GBP', 'USD', rates)).toBe(4);
  });
});
