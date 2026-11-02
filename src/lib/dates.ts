function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Today's date in the user's timezone as YYYY-MM-DD. */
export function todayIso(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** The current month in the user's timezone as YYYY-MM. */
export function currentMonth(now = new Date()): string {
  return todayIso(now).slice(0, 7);
}

/** Moves a YYYY-MM month string by `delta` months. */
export function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number);
  const index = year * 12 + (m - 1) + delta;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

/** "2026-03" becomes "March 2026". */
export function monthLabel(month: string, style: 'long' | 'short' = 'long'): string {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m, 1).toLocaleDateString('en-NG', { month: style, year: 'numeric' });
}

/** "2026-03-07" becomes "7 Mar 2026". */
export function formatDate(iso: string): string {
  const [year, m, d] = iso.split('-').map(Number);
  return new Date(year, m - 1, d).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
