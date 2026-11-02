import { describe, expect, it } from 'vitest';
import { isValidDate, validateCategory, validateExpense } from '../../server/validation.ts';

const base = { date: '2026-05-01', description: 'Lunch', amount: 4_500, currency: 'NGN', categoryId: 'cat-meals' };

describe('validateExpense', () => {
  it('accepts a normal expense and trims text', () => {
    const result = validateExpense({ ...base, description: '  Lunch  ', notes: '  ' });
    expect(result).toEqual({ ok: true, value: { ...base, notes: undefined } });
  });

  it('rounds amounts to the nearest kobo or cent', () => {
    const result = validateExpense({ ...base, amount: 10.005 });
    expect(result.ok && result.value.amount).toBe(10.01);
  });

  it.each([0, -1, Number.NaN, '100'])('rejects amount %s', (amount) => {
    const result = validateExpense({ ...base, amount });
    expect(result.ok).toBe(false);
  });

  it('rejects unsupported currencies and missing descriptions', () => {
    const result = validateExpense({ ...base, currency: 'JPY', description: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['currency', 'description']);
  });
});

describe('isValidDate', () => {
  it('accepts real dates only', () => {
    expect(isValidDate('2024-02-29')).toBe(true);
    expect(isValidDate('2026-02-29')).toBe(false);
    expect(isValidDate('2026-13-01')).toBe(false);
    expect(isValidDate('1/5/2026')).toBe(false);
  });
});

describe('validateCategory', () => {
  it('requires a name and a hex colour', () => {
    expect(validateCategory({ name: '', color: 'blue', budget: 10 }).ok).toBe(false);
    expect(validateCategory({ name: 'Fuel', color: '#ff8800', budget: 0 })).toEqual({
      ok: true,
      value: { name: 'Fuel', color: '#ff8800', budget: 0 },
    });
  });
});
