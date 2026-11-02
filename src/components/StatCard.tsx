interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'good' | 'bad';
}

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <section className={`stat-card tone-${tone}`} aria-label={label}>
      <h3>{label}</h3>
      <p className="stat-value" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
      {hint && <p className="muted">{hint}</p>}
    </section>
  );
}
