import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { call, startServer } from './helpers.ts';
import type { TestServer } from './helpers.ts';

let server: TestServer;

beforeEach(async () => {
  server = await startServer();
});

afterEach(async () => {
  await server.close();
});

const valid = {
  date: '2026-05-18',
  description: 'Printer ink',
  amount: 7_500,
  currency: 'NGN',
  categoryId: 'cat-office',
};

describe('expenses API', () => {
  it('lists the current month newest first', async () => {
    const { status, body } = await call(server.url, 'GET', '/api/expenses?month=2026-05');
    expect(status).toBe(200);
    expect(body.total).toBe(14);
    const dates = body.items.map((e: { date: string }) => e.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('returns a full first page', async () => {
    const { body } = await call(server.url, 'GET', '/api/expenses?month=all&page=1');
    expect(body.items).toHaveLength(20);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(20);
  });

  it('filters by category', async () => {
    const { body } = await call(server.url, 'GET', '/api/expenses?month=all&categoryId=cat-travel');
    expect(body.total).toBeGreaterThan(0);
    expect(body.items.every((e: { categoryId: string }) => e.categoryId === 'cat-travel')).toBe(true);
  });

  it('creates, updates and deletes an expense', async () => {
    const created = await call(server.url, 'POST', '/api/expenses', valid);
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ ...valid, categoryName: 'Office Supplies' });

    const updated = await call(server.url, 'PUT', `/api/expenses/${created.body.id}`, { ...valid, amount: 8_000 });
    expect(updated.status).toBe(200);
    expect(updated.body.amount).toBe(8_000);

    const removed = await call(server.url, 'DELETE', `/api/expenses/${created.body.id}`);
    expect(removed.status).toBe(204);
    const missing = await call(server.url, 'GET', `/api/expenses/${created.body.id}`);
    expect(missing.status).toBe(404);
  });

  it('rejects invalid input with field errors', async () => {
    const { status, body } = await call(server.url, 'POST', '/api/expenses', { ...valid, amount: -5, date: '2026-02-30' });
    expect(status).toBe(400);
    expect(body.fields).toHaveProperty('amount');
    expect(body.fields).toHaveProperty('date');
  });

  it('rejects an unknown category', async () => {
    const { status } = await call(server.url, 'POST', '/api/expenses', { ...valid, categoryId: 'nope' });
    expect(status).toBe(404);
  });
});

describe('categories API', () => {
  it('lists categories alphabetically', async () => {
    const { body } = await call(server.url, 'GET', '/api/categories');
    const names = body.map((c: { name: string }) => c.name);
    expect(names).toEqual([...names].sort((a: string, b: string) => a.localeCompare(b)));
  });

  it('refuses to delete a category that still has expenses', async () => {
    const { status } = await call(server.url, 'DELETE', '/api/categories/cat-rent');
    expect(status).toBe(409);
  });

  it('refuses duplicate names regardless of case', async () => {
    const { status } = await call(server.url, 'POST', '/api/categories', { name: 'groceries', color: '#123456', budget: 0 });
    expect(status).toBe(409);
  });
});
