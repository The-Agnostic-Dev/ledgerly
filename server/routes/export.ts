import { Router } from 'express';
import { toCsv } from '../csv.ts';
import { roundMoney, toNaira } from '../money.ts';
import type { Store } from '../store.ts';
import { filterExpenses, readFilters } from './expenses.ts';

const HEADER = ['Date', 'Description', 'Category', 'Amount', 'Currency', 'Amount (NGN)', 'Notes'];

export function exportRouter(store: Store): Router {
  const router = Router();

  router.get('/expenses.csv', (req, res) => {
    const filters = readFilters(req.query);
    const items = filterExpenses(store.listExpenses(), filters);
    const rows = items.map((e) => [
      e.date,
      e.description,
      e.categoryName,
      e.amount.toFixed(2),
      e.currency,
      roundMoney(toNaira(e.amount, e.currency)).toFixed(2),
      e.notes,
    ]);
    const filename = `ledgerly-${filters.month ?? 'all'}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(toCsv(HEADER, rows));
  });

  return router;
}
