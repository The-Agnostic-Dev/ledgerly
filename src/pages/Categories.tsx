import { useState } from 'react';
import type { Category, CategoryInput } from '../../shared/types';
import { api, ApiError } from '../api/client';
import { CategoryForm } from '../components/CategoryForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Modal } from '../components/Modal';
import { useCurrency } from '../context/CurrencyContext';
import { useApi } from '../hooks/useApi';

type Editing = { mode: 'create' } | { mode: 'edit'; category: Category } | null;

export function Categories() {
  const categories = useApi('categories', api.categories);
  const { format } = useCurrency();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string>();

  async function save(input: CategoryInput) {
    if (editing?.mode === 'edit') await api.updateCategory(editing.category.id, input);
    else await api.createCategory(input);
    setEditing(null);
    categories.reload();
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await api.deleteCategory(deleting.id);
      setDeleting(null);
      categories.reload();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Could not delete the category');
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Categories &amp; budgets</h1>
        <button type="button" className="button primary" onClick={() => setEditing({ mode: 'create' })}>
          Add category
        </button>
      </header>

      <section className="card">
        {categories.error && <p className="form-error">Could not load categories: {categories.error.message}</p>}
        {categories.data && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="numeric">Monthly budget</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.data.map((c) => (
                <tr key={c.id} data-testid="category-row">
                  <td>
                    <span className="dot" style={{ background: c.color }} /> {c.name}
                  </td>
                  <td className="numeric">{c.budget > 0 ? format(c.budget, 'NGN') : <span className="muted">No budget</span>}</td>
                  <td className="row-actions">
                    <button type="button" className="link-button" onClick={() => setEditing({ mode: 'edit', category: c })}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="link-button danger"
                      onClick={() => {
                        setDeleteError(undefined);
                        setDeleting(c);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {editing && (
        <Modal title={editing.mode === 'edit' ? 'Edit category' : 'Add category'} onClose={() => setEditing(null)}>
          <CategoryForm
            initial={editing.mode === 'edit' ? editing.category : undefined}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete category"
          message={`Delete the "${deleting.name}" category?`}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
