import { Router } from 'express';
import type { Expense, ExpensePage } from '../../shared/types.ts';
import type { Store } from '../store.ts';
import { validateExpense } from '../validation.ts';

export interface ExpenseFilters {
  month?: string;
  categoryId?: string;
  q?: string;
}

const MONTH_RE = /^\d{4}-\d{2}$/;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function readFilters(query: Record<string, unknown>): ExpenseFilters {
  const month = typeof query.month === 'string' && MONTH_RE.test(query.month) ? query.month : undefined;
  const categoryId = typeof query.categoryId === 'string' && query.categoryId ? query.categoryId : undefined;
  const q = typeof query.q === 'string' && query.q.trim() ? query.q.trim() : undefined;
  return { month, categoryId, q };
}

export function filterExpenses(expenses: Expense[], { month, categoryId, q }: ExpenseFilters): Expense[] {
  let items = expenses;
  if (month) items = items.filter((e) => e.date.startsWith(`${month}-`));
  if (categoryId) items = items.filter((e) => e.categoryId === categoryId);
  if (q) items = items.filter((e) => e.description.includes(q) || (e.notes ?? '').includes(q));
  return items;
}

function positiveInt(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

export function expensesRouter(store: Store): Router {
  const router = Router();

  router.get('/', (req, res) => {
    const filters = readFilters(req.query);
    const items = filterExpenses(store.listExpenses(), filters);
    const page = positiveInt(req.query.page, 1);
    const pageSize = Math.min(positiveInt(req.query.pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
    const total = items.length;
    const body: ExpensePage = {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.floor(total / pageSize)),
    };
    res.json(body);
  });

  router.get('/:id', (req, res) => {
    const expense = store.getExpense(req.params.id);
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    res.json(expense);
  });

  router.post('/', (req, res) => {
    const result = validateExpense(req.body);
    if (!result.ok) {
      res.status(400).json({ error: 'Please check the highlighted fields', fields: result.errors });
      return;
    }
    res.status(201).json(store.createExpense(result.value));
  });

  router.put('/:id', (req, res) => {
    const result = validateExpense(req.body);
    if (!result.ok) {
      res.status(400).json({ error: 'Please check the highlighted fields', fields: result.errors });
      return;
    }
    res.json(store.updateExpense(req.params.id, result.value));
  });

  router.delete('/:id', (req, res) => {
    store.deleteExpense(req.params.id);
    res.status(204).end();
  });

  return router;
}
