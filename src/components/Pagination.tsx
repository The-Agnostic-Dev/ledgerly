interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onChange }: PaginationProps) {
  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="muted">
        {total} {total === 1 ? 'expense' : 'expenses'}
      </span>
      <button type="button" className="button secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button type="button" className="button secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
