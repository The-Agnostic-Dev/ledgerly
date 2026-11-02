import type { Category, Currency, Expense } from '../shared/types.ts';
import type { Snapshot } from './store.ts';

const categories: Category[] = [
  { id: 'cat-rent', name: 'Rent & Utilities', color: '#4f46e5', budget: 450_000 },
  { id: 'cat-groceries', name: 'Groceries', color: '#16a34a', budget: 120_000 },
  { id: 'cat-transport', name: 'Transport', color: '#f59e0b', budget: 60_000 },
  { id: 'cat-software', name: 'Software & Subscriptions', color: '#0ea5e9', budget: 80_000 },
  { id: 'cat-meals', name: 'Meals & Entertainment', color: '#db2777', budget: 50_000 },
  { id: 'cat-office', name: 'Office Supplies', color: '#64748b', budget: 40_000 },
  { id: 'cat-travel', name: 'Travel', color: '#0d9488', budget: 200_000 },
];

type Row = [day: number, description: string, amount: number, currency: Currency, categoryId: string, notes?: string];

// Rows per month, relative to the current month (0 = this month, 1 = last month, ...).
const months: Row[][] = [
  [
    [1, 'Office rent', 350_000, 'NGN', 'cat-rent'],
    [2, 'Ikeja Electric prepaid units', 25_000, 'NGN', 'cat-rent', 'Token sent to office meter'],
    [2, 'Uber to Lekki office', 8_500, 'NGN', 'cat-transport'],
    [3, 'Shoprite weekly shop', 46_750.5, 'NGN', 'cat-groceries'],
    [4, 'Figma Professional', 15, 'USD', 'cat-software'],
    [5, 'Printer paper and toner', 18_900, 'NGN', 'cat-office'],
    [6, 'Team lunch at Yellow Chilli', 42_000, 'NGN', 'cat-meals'],
    [7, 'Bolt rides', 4_300, 'NGN', 'cat-transport'],
    [8, 'Spectranet internet', 22_500, 'NGN', 'cat-rent'],
    [9, 'Notion Plus', 10, 'USD', 'cat-software'],
    [10, 'Market run (Mile 12)', 31_200, 'NGN', 'cat-groceries'],
    [11, 'Fuel for generator', 60_000, 'NGN', 'cat-rent'],
    [12, 'Danfo and keke', 950, 'NGN', 'cat-transport'],
    [13, 'AWS hosting', 42.37, 'USD', 'cat-software', 'Staging and production'],
  ],
  [
    [1, 'Office rent', 350_000, 'NGN', 'cat-rent'],
    [3, 'Ikeja Electric prepaid units', 25_000, 'NGN', 'cat-rent'],
    [4, 'Uber to client meeting', 12_400, 'NGN', 'cat-transport'],
    [5, 'Shoprite weekly shop', 52_300, 'NGN', 'cat-groceries'],
    [6, 'Figma Professional', 15, 'USD', 'cat-software'],
    [8, 'Dinner with investors', 68_000, 'NGN', 'cat-meals'],
    [10, 'Flight Lagos to Abuja', 145_000, 'NGN', 'cat-travel'],
    [11, 'Hotel in Abuja (2 nights)', 120, 'GBP', 'cat-travel'],
    [13, 'Spectranet internet', 22_500, 'NGN', 'cat-rent'],
    [15, 'Notebooks and pens', 7_800, 'NGN', 'cat-office'],
    [18, 'Notion Plus', 10, 'USD', 'cat-software'],
    [20, 'Fuel for generator', 55_000, 'NGN', 'cat-rent'],
    [22, 'Bolt rides', 6_150, 'NGN', 'cat-transport'],
    [25, 'Market run (Mile 12)', 28_900, 'NGN', 'cat-groceries'],
    [27, 'AWS hosting', 39.8, 'USD', 'cat-software'],
  ],
  [
    [1, 'Office rent', 350_000, 'NGN', 'cat-rent'],
    [2, 'Ikeja Electric prepaid units', 20_000, 'NGN', 'cat-rent'],
    [4, 'Shoprite weekly shop', 44_100, 'NGN', 'cat-groceries'],
    [6, 'Figma Professional', 15, 'USD', 'cat-software'],
    [9, 'Conference tickets', 250, 'EUR', 'cat-travel'],
    [12, 'Uber rides', 9_800, 'NGN', 'cat-transport'],
    [14, 'Spectranet internet', 22_500, 'NGN', 'cat-rent'],
    [16, 'Client lunch', 35_500, 'NGN', 'cat-meals'],
    [19, 'Desk lamp', 14_999.99, 'NGN', 'cat-office'],
    [21, 'Notion Plus', 10, 'USD', 'cat-software'],
    [24, 'Fuel for generator', 48_000, 'NGN', 'cat-rent'],
    [26, 'AWS hosting', 36.1, 'USD', 'cat-software'],
    [28, 'Market run (Mile 12)', 26_400, 'NGN', 'cat-groceries'],
    [28, 'Airport taxi', 15_000, 'NGN', 'cat-transport'],
  ],
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Builds demo data whose dates are relative to `today`, so the app always has a current month. */
export function buildSeed(today: Date = new Date()): Snapshot {
  const expenses: Expense[] = [];
  months.forEach((rows, monthsAgo) => {
    const first = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const lastDay = monthsAgo === 0 ? today.getDate() : daysInMonth;
    rows.forEach(([day, description, amount, currency, categoryId, notes], index) => {
      const d = Math.min(day, lastDay);
      const date = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(d)}`;
      const createdAt = new Date(first.getFullYear(), first.getMonth(), d, 9, index).toISOString();
      const category = categories.find((c) => c.id === categoryId)!;
      expenses.push({
        id: `exp-${monthsAgo}-${pad(index + 1)}`,
        date,
        description,
        amount,
        currency,
        categoryId,
        categoryName: category.name,
        ...(notes ? { notes } : {}),
        createdAt,
        updatedAt: createdAt,
      });
    });
  });
  return { categories: structuredClone(categories), expenses };
}
