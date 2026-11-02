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

describe('summary API', () => {
  it('totals each category for the month in naira', async () => {
    const { body } = await call(server.url, 'GET', '/api/summary?month=2026-05');
    const groceries = body.categories.find((c: { id: string }) => c.id === 'cat-groceries');
    expect(groceries).toMatchObject({ spent: 77_950.5, budget: 120_000, count: 2, overBudget: false });

    const software = body.categories.find((c: { id: string }) => c.id === 'cat-software');
    expect(software.count).toBe(3);
  });

  it('flags a category that is over budget', async () => {
    await call(server.url, 'POST', '/api/expenses', {
      date: '2026-05-19', description: 'Big team dinner', amount: 30_000, currency: 'NGN', categoryId: 'cat-meals',
    });
    const { body } = await call(server.url, 'GET', '/api/summary?month=2026-05');
    const meals = body.categories.find((c: { id: string }) => c.id === 'cat-meals');
    expect(meals.spent).toBe(72_000);
    expect(meals.overBudget).toBe(true);
    expect(meals.remaining).toBe(-22_000);
  });

  it('returns six months of trend ending with the requested month', async () => {
    const { body } = await call(server.url, 'GET', '/api/summary?month=2026-05');
    expect(body.trend.map((t: { month: string }) => t.month)).toEqual([
      '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05',
    ]);
    expect(body.trend[0].total).toBe(0);
  });
});
