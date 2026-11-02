import { describe, expect, it } from 'vitest';
import { amountToInput, parseAmount } from '../../src/lib/amount.ts';

describe('parseAmount', () => {
  it('parses plain and decimal amounts', () => {
    expect(parseAmount('1500')).toBe(1500);
    expect(parseAmount(' 99.95 ')).toBe(99.95);
  });

  it('returns NaN for empty or non-numeric input', () => {
    expect(parseAmount('')).toBeNaN();
    expect(parseAmount('abc')).toBeNaN();
  });
});

describe('amountToInput', () => {
  it('always shows two decimals', () => {
    expect(amountToInput(2500)).toBe('2500.00');
    expect(amountToInput(8.5)).toBe('8.50');
  });
});
