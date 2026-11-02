import { CURRENCIES } from '../shared/types.ts';
import type { CategoryInput, Currency, ExpenseInput } from '../shared/types.ts';

export type Result<T> = { ok: true; value: T } | { ok: false; errors: Record<string, string> };

const MAX_AMOUNT = 100_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function validateExpense(body: unknown): Result<ExpenseInput> {
  const input = (body ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const description = typeof input.description === 'string' ? input.description.trim() : '';
  if (!description) errors.description = 'Description is required';
  else if (description.length > 120) errors.description = 'Description must be 120 characters or fewer';

  const amount = typeof input.amount === 'number' ? input.amount : Number.NaN;
  if (!Number.isFinite(amount) || amount <= 0) errors.amount = 'Amount must be greater than zero';
  else if (amount > MAX_AMOUNT) errors.amount = 'Amount is too large';

  const currency = input.currency as Currency;
  if (!CURRENCIES.includes(currency)) errors.currency = 'Unsupported currency';

  if (!isValidDate(input.date)) errors.date = 'Date must be a valid YYYY-MM-DD date';

  const categoryId = typeof input.categoryId === 'string' ? input.categoryId : '';
  if (!categoryId) errors.categoryId = 'Category is required';

  const notes = typeof input.notes === 'string' ? input.notes.trim() : undefined;
  if (notes && notes.length > 500) errors.notes = 'Notes must be 500 characters or fewer';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      description,
      amount: Math.round(amount * 100) / 100,
      currency,
      date: input.date as string,
      categoryId,
      notes: notes || undefined,
    },
  };
}

export function validateCategory(body: unknown): Result<CategoryInput> {
  const input = (body ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name) errors.name = 'Name is required';
  else if (name.length > 40) errors.name = 'Name must be 40 characters or fewer';

  const color = typeof input.color === 'string' && COLOR_RE.test(input.color) ? input.color : '';
  if (!color) errors.color = 'Colour must be a hex value like #4f46e5';

  const budget = typeof input.budget === 'number' ? input.budget : Number.NaN;
  if (!Number.isFinite(budget) || budget < 0) errors.budget = 'Budget must be zero or more';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name, color, budget: Math.round(budget * 100) / 100 } };
}
