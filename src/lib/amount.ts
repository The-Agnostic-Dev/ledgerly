/** Parses what the user typed in an amount field. Returns NaN for anything unusable. */
export function parseAmount(input: string): number {
  const value = Number.parseFloat(input.trim());
  return Number.isFinite(value) ? value : Number.NaN;
}

/** Formats a stored amount for an editable input, e.g. 2500 becomes "2500.00". */
export function amountToInput(amount: number): string {
  return amount.toFixed(2);
}
