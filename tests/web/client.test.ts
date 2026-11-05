import { describe, it, expect, vi, afterEach } from 'vitest';
import { api } from '../../src/api/client';

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response;
}

describe('api.deleteExpense cache invalidation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('invalidates /api/summary cache so subsequent summary fetch is fresh', async () => {
    let summaryCalls = 0;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = input as string;
      if (url === '/api/expenses') {
        return jsonResponse([]);
      }
      if (url.startsWith('/api/summary')) {
        summaryCalls += 1;
        return jsonResponse({ total: summaryCalls * 100 });
      }
      if (url.startsWith('/api/expenses/') && init?.method === 'DELETE') {
        return jsonResponse(null, 204);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await api.expenses({});
    const firstSummary = await api.summary('2026-05');
    expect(firstSummary).toEqual({ total: 100 });
    expect(summaryCalls).toBe(1);

    await api.deleteExpense('exp-1');

    const secondSummary = await api.summary('2026-05');
    expect(secondSummary).toEqual({ total: 200 });
    expect(summaryCalls).toBe(2);

    fetchSpy.mockRestore();
  });
});
