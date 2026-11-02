import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Expense, ExpenseInput } from '../../shared/types';
import { api, ApiError, paths } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseTable } from '../components/ExpenseTable';
import { Modal } from '../components/Modal';
import { MonthPicker } from '../components/MonthPicker';
import { Pagination } from '../components/Pagination';
import { useApi } from '../hooks/useApi';
import { currentMonth } from '../lib/dates';

type Editing = { mode: 'create' } | { mode: 'edit'; expense: Expense } | null;

export function Expenses() {
  const [params, setParams] = useSearchParams();
  const allMonths = params.get('month') === 'all';
  const month = allMonths ? undefined : (params.get('month') ?? currentMonth());
  const categoryId = params.get('category') ?? '';
  const q = params.get('q') ?? '';
  const page = Number(params.get('page') ?? '1') || 1;

  const query = { month, categoryId: categoryId || undefined, q: q || undefined, page };
  const listKey = paths.expenses(query);
  const expenses = useApi(listKey, () => api.expenses(query));
  const categories = useApi('categories', api.categories);

  const [search, setSearch] = useState(q);
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [deleteError, setDeleteError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const setFilter = (key: string, value: string | undefined) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
  };

  useEffect(() => {
    if (search === q) return;
    const timer = setTimeout(() => setFilter('q', search.trim() || undefined), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function save(input: ExpenseInput) {
    if (editing?.mode === 'edit') await api.updateExpense(editing.expense.id, input);
    else await api.createExpense(input);
    setEditing(null);
    expenses.reload();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    setDeleteError(undefined);
    try {
      await api.deleteExpense(deleting.id);
      setDeleting(null);
      expenses.reload();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Could not delete the expense');
    } finally {
      setBusy(false);
    }
  }

  const exportHref = paths.exportCsv({ month, categoryId: categoryId || undefined, q: q || undefined });

  return (
    <div className="page">
      <header className="page-header">
        <h1>Expenses</h1>
        <button type="button" className="button primary" onClick={() => setEditing({ mode: 'create' })} disabled={!categories.data}>
          Add expense
        </button>
      </header>

      <div className="toolbar">
        {month ? (
          <MonthPicker month={month} onChange={(m) => setFilter('month', m)} />
        ) : (
          <button type="button" className="button secondary" onClick={() => setFilter('month', undefined)}>
            This month
          </button>
        )}
        <label className="checkbox">
          <input type="checkbox" checked={allMonths} onChange={(e) => setFilter('month', e.target.checked ? 'all' : undefined)} />
          All months
        </label>
        <select aria-label="Category" value={categoryId} onChange={(e) => setFilter('category', e.target.value || undefined)}>
          <option value="">All categories</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="search"
          aria-label="Search expenses"
          placeholder="Search descriptions and notes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <a className="button secondary" href={exportHref} download>
          Export CSV
        </a>
      </div>

      <section className="card">
        {expenses.error && <p className="form-error">Could not load expenses: {expenses.error.message}</p>}
        {expenses.loading && !expenses.data && <p className="muted">Loading…</p>}
        {expenses.data && categories.data && (
          <>
            <ExpenseTable
              expenses={expenses.data.items}
              categories={categories.data}
              onEdit={(expense) => setEditing({ mode: 'edit', expense })}
              onDelete={(expense) => {
                setDeleteError(undefined);
                setDeleting(expense);
              }}
            />
            <Pagination
              page={expenses.data.page}
              totalPages={expenses.data.totalPages}
              total={expenses.data.total}
              onChange={(p) => setFilter('page', String(p))}
            />
          </>
        )}
      </section>

      {editing && categories.data && (
        <Modal title={editing.mode === 'edit' ? 'Edit expense' : 'Add expense'} onClose={() => setEditing(null)}>
          <ExpenseForm
            categories={categories.data}
            initial={editing.mode === 'edit' ? editing.expense : undefined}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete expense"
          message={`Delete "${deleting.description}"? This cannot be undone.`}
          busy={busy}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
