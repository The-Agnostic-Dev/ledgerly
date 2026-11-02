import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { RATES } from './money.ts';
import { categoriesRouter } from './routes/categories.ts';
import { expensesRouter } from './routes/expenses.ts';
import { exportRouter } from './routes/export.ts';
import { summaryRouter } from './routes/summary.ts';
import { ConflictError, NotFoundError } from './store.ts';
import type { Store } from './store.ts';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
  } else if (err instanceof ConflictError) {
    res.status(409).json({ error: err.message });
  } else if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Request body is not valid JSON' });
  } else {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export function createApi(store: Store): express.Router {
  const api = express.Router();
  api.use(express.json({ limit: '100kb' }));
  api.get('/health', (_req, res) => {
    res.json({ ok: true });
  });
  api.get('/rates', (_req, res) => {
    res.json(RATES);
  });
  api.use('/categories', categoriesRouter(store));
  api.use('/expenses', expensesRouter(store));
  api.use('/summary', summaryRouter(store));
  api.use('/export', exportRouter(store));
  api.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
  api.use(errorHandler);
  return api;
}

export function createApp(store: Store): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', createApi(store));
  return app;
}
