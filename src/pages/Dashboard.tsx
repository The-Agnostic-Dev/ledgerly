import { Link, useSearchParams } from 'react-router';
import { api } from '../api/client';
import { MonthPicker } from '../components/MonthPicker';
import { StatCard } from '../components/StatCard';
import { useCurrency } from '../context/CurrencyContext';
import { useApi } from '../hooks/useApi';
import { currentMonth, monthLabel } from '../lib/dates';

export function Dashboard() {
  const [params, setParams] = useSearchParams();
  const month = params.get('month') ?? currentMonth();
  const { data: summary, error, loading } = useApi(`summary:${month}`, () => api.summary(month));
  const { format } = useCurrency();
  const ngn = (amount: number) => format(amount, 'NGN');

  const setMonth = (next: string) => setParams(next === currentMonth() ? {} : { month: next });

  if (error) return <p className="form-error">Could not load the dashboard: {error.message}</p>;
  if (loading || !summary) return <p className="muted">Loading…</p>;

  const remaining = summary.totalBudget - summary.totalSpent;
  const peak = Math.max(1, ...summary.trend.map((t) => t.total));

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <MonthPicker month={month} onChange={setMonth} />
      </header>

      <div className="stats">
        <StatCard label="Total spent" value={ngn(summary.totalSpent)} hint={`${summary.count} expenses`} />
        <StatCard label="Budget" value={ngn(summary.totalBudget)} hint="Across all categories" />
        <StatCard
          label="Remaining"
          value={ngn(Math.abs(remaining))}
          hint={remaining >= 0 ? 'Left to spend this month' : 'Over your total budget'}
          tone={remaining >= 0 ? 'good' : 'bad'}
        />
      </div>

      <section className="card">
        <header className="card-header">
          <h2>Spending by category</h2>
          <Link to={`/expenses?month=${month}`}>View expenses</Link>
        </header>
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th className="numeric">Spent</th>
              <th className="numeric">Budget</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {summary.categories.map((c) => {
              const pct = c.budget > 0 ? Math.min(100, (c.spent / c.budget) * 100) : 0;
              return (
                <tr key={c.id} data-testid="category-summary" data-category={c.name}>
                  <td>
                    <span className="dot" style={{ background: c.color }} /> {c.name}
                  </td>
                  <td className="numeric">{ngn(c.spent)}</td>
                  <td className="numeric">{c.budget > 0 ? ngn(c.budget) : <span className="muted">No budget</span>}</td>
                  <td>
                    <div className="progress" aria-hidden="true">
                      <div className={`progress-bar${c.overBudget ? ' over' : ''}`} style={{ width: `${pct}%` }} />
                    </div>
                    {c.overBudget ? (
                      <span className="badge bad">Over by {ngn(-c.remaining)}</span>
                    ) : c.budget > 0 ? (
                      <span className="badge good">{ngn(c.remaining)} left</span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card">
        <header className="card-header">
          <h2>Last 6 months</h2>
        </header>
        <div className="trend">
          {summary.trend.map((t) => (
            <div key={t.month} className="trend-col" title={`${monthLabel(t.month)}: ${ngn(t.total)}`}>
              <div className="trend-bar" style={{ height: `${(t.total / peak) * 100}%` }} />
              <span className="trend-label">{monthLabel(t.month, 'short')}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
