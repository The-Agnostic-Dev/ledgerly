import type {
  Category,
  CategoryInput,
  Expense,
  ExpenseInput,
  ExpensePage,
  MonthSummary,
  Rates,
} from '../../shared/types';

export class ApiError extends Error {
  readonly status: number;
  readonly fields: Record<string, string>;

  constructor(status: number, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

const cache = new Map<string, unknown>();

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`, data.fields);
  }
  return data as T;
}

/** GET with an in-memory cache so navigating between pages feels instant. */
export async function getCached<T>(path: string): Promise<T> {
  if (cache.has(path)) return cache.get(path) as T;
  const data = await request<T>('GET', path);
  cache.set(path, data);
  return data;
}

export function invalidate(...prefixes: string[]): void {
  for (const key of [...cache.keys()]) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) cache.delete(key);
  }
}

export interface ExpenseQuery {
  month?: string;
  categoryId?: string;
  q?: string;
  page?: number;
}

export function toQueryString(query: object): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '' && value !== null) params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : '';
}

export const paths = {
  categories: () => '/api/categories',
  expenses: (query: ExpenseQuery) => `/api/expenses${toQueryString(query)}`,
  summary: (month: string) => `/api/summary${toQueryString({ month })}`,
  rates: () => '/api/rates',
  exportCsv: (query: Omit<ExpenseQuery, 'page'>) => `/api/export/expenses.csv${toQueryString(query)}`,
};

export const api = {
  categories: () => getCached<Category[]>(paths.categories()),
  expenses: (query: ExpenseQuery) => getCached<ExpensePage>(paths.expenses(query)),
  summary: (month: string) => getCached<MonthSummary>(paths.summary(month)),
  rates: () => getCached<Rates>(paths.rates()),

  async createExpense(input: ExpenseInput): Promise<Expense> {
    const expense = await request<Expense>('POST', '/api/expenses', input);
    invalidate('/api/expenses');
    return expense;
  },

  async updateExpense(id: string, input: ExpenseInput): Promise<Expense> {
    const expense = await request<Expense>('PUT', `/api/expenses/${id}`, input);
    invalidate('/api/expenses');
    return expense;
  },

  async deleteExpense(id: string): Promise<void> {
    await request<void>('DELETE', `/api/expenses/${id}`);
    invalidate('/api/expenses');
  },

  async createCategory(input: CategoryInput): Promise<Category> {
    const category = await request<Category>('POST', '/api/categories', input);
    invalidate('/api/categories', '/api/summary');
    return category;
  },

  async updateCategory(id: string, input: CategoryInput): Promise<Category> {
    const category = await request<Category>('PUT', `/api/categories/${id}`, input);
    invalidate('/api/categories', '/api/summary');
    return category;
  },

  async deleteCategory(id: string): Promise<void> {
    await request<void>('DELETE', `/api/categories/${id}`);
    invalidate('/api/categories', '/api/summary');
  },
};
