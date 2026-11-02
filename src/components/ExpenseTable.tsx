import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { Category, Expense } from '../../shared/types';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../lib/dates';

type SortKey = 'date' | 'description' | 'category' | 'amount';

interface ExpenseTableProps {
  expenses: Expense[];
  categories: Category[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount', numeric: true },
];

export function ExpenseTable({ expenses, categories, onEdit, onDelete }: ExpenseTableProps) {
  const { toDisplay, format } = useCurrency();
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'date', dir: -1 });
  const byId = new Map(categories.map((c) => [c.id, c]));

  const valueFor = (e: Expense, key: SortKey): string | number => {
    switch (key) {
      case 'date':
        return e.date;
      case 'description':
        return e.description;
      case 'category':
        return byId.get(e.categoryId)?.name ?? '';
      case 'amount':
        return toDisplay(e.amount, e.currency);
    }
  };

  const rows = [...expenses].sort(
    (a, b) => String(valueFor(a, sort.key)).localeCompare(String(valueFor(b, sort.key))) * sort.dir,
  );

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === 'amount' ? -1 : 1 }));

  if (expenses.length === 0) {
    return <p className="empty">No expenses match these filters.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          {COLUMNS.map((col) => (
            <th
              key={col.key}
              className={col.numeric ? 'numeric' : undefined}
              aria-sort={sort.key === col.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
            >
              <button type="button" className="sort-button" onClick={() => toggleSort(col.key)}>
                {col.label}
                {sort.key === col.key && <span aria-hidden="true">{sort.dir === 1 ? ' ▲' : ' ▼'}</span>}
              </button>
            </th>
          ))}
          <th>
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((e) => {
          const category = byId.get(e.categoryId);
          return (
            <tr key={e.id} data-testid="expense-row">
              <td>{formatDate(e.date)}</td>
              <td>
                <div className="description">{e.description}</div>
                {e.notes && <div className="muted small">{e.notes}</div>}
              </td>
              <td>
                <span className="chip" style={{ '--chip': category?.color ?? '#94a3b8' } as CSSProperties}>
                  {category?.name ?? 'Unknown'}
                </span>
              </td>
              <td className="numeric amount">{format(e.amount, e.currency)}</td>
              <td className="row-actions">
                <button type="button" className="link-button" onClick={() => onEdit(e)}>
                  Edit
                </button>
                <button type="button" className="link-button danger" onClick={() => onDelete(e)}>
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
