import { NavLink, Outlet } from 'react-router';
import { CURRENCIES } from '../../shared/types';
import type { Currency } from '../../shared/types';
import { useCurrency } from '../context/CurrencyContext';

export function Layout() {
  const { displayCurrency, setDisplayCurrency } = useCurrency();

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">L</span>
          Ledgerly
        </div>
        <nav className="nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/expenses">Expenses</NavLink>
          <NavLink to="/categories">Categories &amp; budgets</NavLink>
        </nav>
        <label className="currency-select">
          <span>Show amounts in</span>
          <select
            aria-label="Display currency"
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value as Currency)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
