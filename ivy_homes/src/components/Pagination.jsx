export default function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) return null;

  const pages = [];
  const windowSize = 1;
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= windowSize) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <nav className="mt-6 flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-sm border border-(--color-rule) px-3 py-1.5 text-sm text-(--color-ink-soft) transition-colors hover:border-(--color-ink) hover:text-(--color-ink) disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-(--color-ink-faint)">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`min-w-[2.25rem] rounded-sm border px-2.5 py-1.5 text-sm font-mono transition-colors ${
              p === page
                ? 'border-(--color-ink) bg-(--color-ink) text-(--color-paper)'
                : 'border-(--color-rule) text-(--color-ink-soft) hover:border-(--color-ink) hover:text-(--color-ink)'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        className="rounded-sm border border-(--color-rule) px-3 py-1.5 text-sm text-(--color-ink-soft) transition-colors hover:border-(--color-ink) hover:text-(--color-ink) disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
