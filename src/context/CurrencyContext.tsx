import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CURRENCIES } from '../../shared/types';
import type { Currency, Rates } from '../../shared/types';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { convert, formatMoney } from '../lib/money';

const STORAGE_KEY = 'ledgerly.displayCurrency';

interface CurrencyContextValue {
  displayCurrency: Currency;
  setDisplayCurrency: (currency: Currency) => void;
  rates: Rates | undefined;
  /** Converts an amount to the display currency. */
  toDisplay: (amount: number, from: Currency) => number;
  /** Converts and formats an amount in the display currency. */
  format: (amount: number, from: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStoredCurrency(): Currency {
  const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
  return stored && CURRENCIES.includes(stored) ? stored : 'NGN';
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setCurrency] = useState<Currency>(readStoredCurrency);
  const { data: rates } = useApi('rates', api.rates);

  const setDisplayCurrency = useCallback((currency: Currency) => {
    localStorage.setItem(STORAGE_KEY, currency);
    setCurrency(currency);
  }, []);

  const value = useMemo<CurrencyContextValue>(() => {
    const toDisplay = (amount: number, from: Currency) =>
      rates ? convert(amount, from, displayCurrency, rates) : amount;
    return {
      displayCurrency,
      setDisplayCurrency,
      rates,
      toDisplay,
      format: (amount, from) => formatMoney(toDisplay(amount, from), rates ? displayCurrency : from),
    };
  }, [displayCurrency, rates, setDisplayCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error('useCurrency must be used inside <CurrencyProvider>');
  return value;
}
