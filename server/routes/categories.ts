import { Router } from 'express';
import type { Store } from '../store.ts';
import { validateCategory } from '../validation.ts';

export function categoriesRouter(store: Store): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(store.listCategories());
  });

  router.post('/', (req, res) => {
    const result = validateCategory(req.body);
    if (!result.ok) {
      res.status(400).json({ error: 'Please check the highlighted fields', fields: result.errors });
      return;
    }
    res.status(201).json(store.createCategory(result.value));
  });

  router.put('/:id', (req, res) => {
    const result = validateCategory(req.body);
    if (!result.ok) {
      res.status(400).json({ error: 'Please check the highlighted fields', fields: result.errors });
      return;
    }
    res.json(store.updateCategory(req.params.id, result.value));
  });

  router.delete('/:id', (req, res) => {
    store.deleteCategory(req.params.id);
    res.status(204).end();
  });

  return router;
}
