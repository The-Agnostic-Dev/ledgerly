import { Router } from 'express';
import type { CategorySummary, Expense, MonthSummary } from '../../shared/types.ts';
import { roundMoney, toNaira } from '../money.ts';
import type { Store } from '../store.ts';

const MONTH_RE = /^\d{4}-\d{2}$/;

function currentMonth(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function previousMonths(month: string, count: number): string[] {
  const [year, m] = month.split('-').map(Number);
  const result: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(year, m - 1 - i, 1);
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

function totalInNaira(expenses: Expense[]): number {
  return roundMoney(expenses.reduce((sum, e) => sum + toNaira(e.amount, e.currency), 0));
}

export function buildSummary(expenses: Expense[], store: Store, month: string): MonthSummary {
  const monthly = expenses.filter((e) => e.date.startsWith(`${month}-`));

  const categories: CategorySummary[] = store.listCategories().map((category) => {
    const items = monthly.filter((e) => e.categoryId === category.id);
    let spent = 0;
    for (const e of items) spent += toNaira(e.amount, e.currency);
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      budget: category.budget,
      spent,
      remaining: category.budget - spent,
      overBudget: category.budget > 0 && spent > category.budget,
      count: items.length,
    };
  });

  return {
    month,
    currency: 'NGN',
    totalSpent: totalInNaira(expenses),
    totalBudget: categories.reduce((sum, c) => sum + c.budget, 0),
    count: monthly.length,
    categories,
    trend: previousMonths(month, 6).map((m) => ({
      month: m,
      total: totalInNaira(expenses.filter((e) => e.date.startsWith(`${m}-`))),
    })),
  };
}

export function summaryRouter(store: Store): Router {
  const router = Router();

  router.get('/', (req, res) => {
    const month = typeof req.query.month === 'string' && MONTH_RE.test(req.query.month)
      ? req.query.month
      : currentMonth();
    res.json(buildSummary(store.listExpenses(), store, month));
  });

  return router;
}
