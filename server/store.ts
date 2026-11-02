import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Category, CategoryInput, Expense, ExpenseInput } from '../shared/types.ts';

export interface Snapshot {
  categories: Category[];
  expenses: Expense[];
}

export class NotFoundError extends Error {}
export class ConflictError extends Error {}

/**
 * In-memory data store. When a file path is given, every change is written
 * through to that JSON file so data survives restarts.
 */
export class Store {
  private categories: Category[];
  private expenses: Expense[];
  private readonly file?: string;

  constructor(initial: Snapshot, file?: string) {
    this.file = file;
    const data = file && existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as Snapshot) : initial;
    this.categories = structuredClone(data.categories);
    this.expenses = structuredClone(data.expenses);
  }

  listCategories(): Category[] {
    return [...this.categories].sort((a, b) => a.name.localeCompare(b.name));
  }

  getCategory(id: string): Category | undefined {
    return this.categories.find((c) => c.id === id);
  }

  createCategory(input: CategoryInput): Category {
    this.assertUniqueName(input.name);
    const category: Category = { id: randomUUID(), ...input };
    this.categories.push(category);
    this.persist();
    return category;
  }

  updateCategory(id: string, input: CategoryInput): Category {
    const category = this.getCategory(id);
    if (!category) throw new NotFoundError('Category not found');
    this.assertUniqueName(input.name, id);
    Object.assign(category, input);
    this.persist();
    return category;
  }

  deleteCategory(id: string): void {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundError('Category not found');
    if (this.expenses.some((e) => e.categoryId === id)) {
      throw new ConflictError('Move or delete the expenses in this category first');
    }
    this.categories.splice(index, 1);
    this.persist();
  }

  /** All expenses, newest first. */
  listExpenses(): Expense[] {
    return [...this.expenses].sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    );
  }

  getExpense(id: string): Expense | undefined {
    return this.expenses.find((e) => e.id === id);
  }

  createExpense(input: ExpenseInput): Expense {
    const category = this.requireCategory(input.categoryId);
    const now = new Date().toISOString();
    const expense: Expense = {
      id: randomUUID(),
      ...input,
      categoryName: category.name,
      createdAt: now,
      updatedAt: now,
    };
    this.expenses.push(expense);
    this.persist();
    return expense;
  }

  updateExpense(id: string, input: ExpenseInput): Expense {
    const expense = this.getExpense(id);
    if (!expense) throw new NotFoundError('Expense not found');
    const category = this.requireCategory(input.categoryId);
    Object.assign(expense, input, { categoryName: category.name, updatedAt: new Date().toISOString() });
    if (!input.notes) delete expense.notes;
    this.persist();
    return expense;
  }

  deleteExpense(id: string): void {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) throw new NotFoundError('Expense not found');
    this.expenses.splice(index, 1);
    this.persist();
  }

  private requireCategory(id: string): Category {
    const category = this.getCategory(id);
    if (!category) throw new NotFoundError('Category not found');
    return category;
  }

  private assertUniqueName(name: string, exceptId?: string): void {
    const taken = this.categories.some(
      (c) => c.id !== exceptId && c.name.toLowerCase() === name.toLowerCase(),
    );
    if (taken) throw new ConflictError('A category with that name already exists');
  }

  private persist(): void {
    if (!this.file) return;
    mkdirSync(dirname(this.file), { recursive: true });
    const snapshot: Snapshot = { categories: this.categories, expenses: this.expenses };
    writeFileSync(this.file, JSON.stringify(snapshot, null, 2));
  }
}
