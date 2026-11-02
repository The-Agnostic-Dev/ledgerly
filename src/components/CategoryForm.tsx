import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Category, CategoryInput } from '../../shared/types';
import { ApiError } from '../api/client';
import { parseAmount } from '../lib/amount';

interface CategoryFormProps {
  initial?: Category;
  onSave: (input: CategoryInput) => Promise<void>;
  onCancel: () => void;
}

const PALETTE = ['#4f46e5', '#16a34a', '#f59e0b', '#0ea5e9', '#db2777', '#64748b', '#0d9488', '#dc2626'];

export function CategoryForm({ initial, onSave, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? PALETTE[0]);
  const [budget, setBudget] = useState(initial ? String(initial.budget) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsedBudget = budget.trim() === '' ? 0 : parseAmount(budget);
    if (!name.trim()) return setErrors({ name: 'Name is required' });
    if (!Number.isFinite(parsedBudget) || parsedBudget < 0) return setErrors({ budget: 'Enter a budget of zero or more' });

    setSaving(true);
    setErrors({});
    try {
      await onSave({ name: name.trim(), color, budget: parsedBudget });
    } catch (err) {
      setErrors(err instanceof ApiError ? { form: err.message, ...err.fields } : { form: 'Could not save the category' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
      <label className="field">
        <span>Name</span>
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus />
        {errors.name && <small className="field-error">{errors.name}</small>}
      </label>
      <label className="field">
        <span>Monthly budget (NGN)</span>
        <input name="budget" inputMode="decimal" placeholder="0" value={budget} onChange={(e) => setBudget(e.target.value)} />
        {errors.budget && <small className="field-error">{errors.budget}</small>}
      </label>
      <fieldset className="field swatches">
        <legend>Colour</legend>
        {PALETTE.map((swatch) => (
          <label key={swatch} className="swatch" style={{ background: swatch }}>
            <input type="radio" name="color" value={swatch} checked={color === swatch} onChange={() => setColor(swatch)} />
            <span className="sr-only">{swatch}</span>
          </label>
        ))}
      </fieldset>
      <div className="modal-actions">
        <button type="button" className="button secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save category'}
        </button>
      </div>
    </form>
  );
}
