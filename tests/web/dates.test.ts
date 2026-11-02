import { describe, expect, it } from 'vitest';
import { currentMonth, formatDate, shiftMonth, todayIso } from '../../src/lib/dates.ts';

describe('dates', () => {
  it('formats today and the current month from local time', () => {
    const now = new Date(2026, 0, 5, 23, 30);
    expect(todayIso(now)).toBe('2026-01-05');
    expect(currentMonth(now)).toBe('2026-01');
  });

  it('shifts months across year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2025-12', 1)).toBe('2026-01');
    expect(shiftMonth('2026-05', -17)).toBe('2024-12');
  });

  it('formats a calendar date without shifting the day', () => {
    expect(formatDate('2026-03-01')).toBe('1 Mar 2026');
  });
});
