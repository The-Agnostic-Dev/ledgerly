export const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR'] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface Category {
  id: string;
  name: string;
  color: string;
  /** Monthly budget in NGN. 0 means no budget is set. */
  budget: number;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  currency: Currency;
  categoryId: string;
  categoryName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  date: string;
  description: string;
  amount: number;
  currency: Currency;
  categoryId: string;
  notes?: string;
}

export interface CategoryInput {
  name: string;
  color: string;
  budget: number;
}

export interface ExpensePage {
  items: Expense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CategorySummary {
  id: string;
  name: string;
  color: string;
  budget: number;
  spent: number;
  remaining: number;
  overBudget: boolean;
  count: number;
}

export interface MonthSummary {
  month: string;
  currency: 'NGN';
  totalSpent: number;
  totalBudget: number;
  count: number;
  categories: CategorySummary[];
  trend: { month: string; total: number }[];
}

export interface Rates {
  base: 'NGN';
  /** How many naira one unit of each currency is worth. */
  rates: Record<Currency, number>;
  updatedAt: string;
}
