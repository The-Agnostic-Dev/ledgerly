import { useState } from 'react';
import type { FormEvent } from 'react';
import { CURRENCIES } from '../../shared/types';
import type { Category, Currency, Expense, ExpenseInput } from '../../shared/types';
import { ApiError } from '../api/client';
import { amountToInput, parseAmount } from '../lib/amount';
import { todayIso } from '../lib/dates';

interface ExpenseFormProps {
  categories: Category[];
  initial?: Expense;
  onSave: (input: ExpenseInput) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  date: string;
  description: string;
  amount: string;
  currency: Currency;
  categoryId: string;
  notes: string;
}

function initialState(categories: Category[], initial?: Expense): FormState {
  return {
    date: initial?.date ?? todayIso(),
    description: initial?.description ?? '',
    amount: initial ? amountToInput(initial.amount) : '',
    currency: initial?.currency ?? 'NGN',
    categoryId: initial?.categoryId ?? categories[0]?.id ?? '',
    notes: initial?.notes ?? '',
  };
}

export function ExpenseForm({ categories, initial, onSave, onCancel }: ExpenseFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(categories, initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = parseAmount(form.amount);
    const nextErrors: Record<string, string> = {};
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    if (!Number.isFinite(amount) || amount <= 0) nextErrors.amount = 'Enter an amount greater than zero';
    if (!form.date) nextErrors.date = 'Pick a date';
    setErrors(nextErrors);
    setFormError(undefined);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await onSave({
        date: form.date,
        description: form.description.trim(),
        amount,
        currency: form.currency,
        categoryId: form.categoryId,
        notes: form.notes.trim() || undefined,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields);
        setFormError(err.message);
      } else {
        setFormError('Could not save the expense. Check your connection and try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <label className="field">
        <span>Description</span>
        <input
          name="description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          maxLength={120}
          autoFocus
        />
        {errors.description && <small className="field-error">{errors.description}</small>}
      </label>
      <div className="field-row">
        <label className="field">
          <span>Amount</span>
          <input
            name="amount"
            inputMode="decimal"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
          />
          {errors.amount && <small className="field-error">{errors.amount}</small>}
        </label>
        <label className="field narrow">
          <span>Currency</span>
          <select name="currency" value={form.currency} onChange={(e) => update('currency', e.target.value as Currency)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span>Date</span>
          <input name="date" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
          {errors.date && <small className="field-error">{errors.date}</small>}
        </label>
        <label className="field">
          <span>Category</span>
          <select name="categoryId" value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <small className="field-error">{errors.categoryId}</small>}
        </label>
      </div>
      <label className="field">
        <span>Notes (optional)</span>
        <textarea name="notes" rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
      </label>
      <div className="modal-actions">
        <button type="button" className="button secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button primary">
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add expense'}
        </button>
      </div>
    </form>
  );
}
