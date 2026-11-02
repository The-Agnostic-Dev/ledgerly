import { describe, expect, it } from 'vitest';
import { csvCell, toCsv } from '../../server/csv.ts';
import { call, startServer } from './helpers.ts';

describe('csv helpers', () => {
  it('quotes cells containing commas, quotes or newlines', () => {
    expect(csvCell('plain')).toBe('plain');
    expect(csvCell('a, b')).toBe('"a, b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell(undefined)).toBe('');
  });

  it('joins rows with CRLF', () => {
    expect(toCsv(['A', 'B'], [[1, 'x']])).toBe('A,B\r\n1,x\r\n');
  });
});

describe('CSV export', () => {
  it('exports the filtered month with a header row', async () => {
    const server = await startServer();
    try {
      const { status, body, headers } = await call(server.url, 'GET', '/api/export/expenses.csv?month=2026-04');
      expect(status).toBe(200);
      expect(headers.get('content-disposition')).toContain('ledgerly-2026-04.csv');
      const lines = (body as string).trim().split('\r\n');
      expect(lines[0]).toBe('Date,Description,Category,Amount,Currency,Amount (NGN),Notes');
      expect(lines).toHaveLength(16);
      expect(lines).toContain('2026-04-11,Hotel in Abuja (2 nights),Travel,120.00,GBP,235200.00,');
    } finally {
      await server.close();
    }
  });
});
