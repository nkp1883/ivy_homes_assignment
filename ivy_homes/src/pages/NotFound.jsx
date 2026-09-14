import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--color-paper) px-4 text-center">
      <div className="mb-2 font-mono text-sm uppercase tracking-wide text-(--color-ink-faint)">Error 404</div>
      <h1 className="mb-3 font-display text-3xl text-(--color-ink)">This page isn't in the register</h1>
      <p className="mb-6 max-w-sm text-sm text-(--color-ink-soft)">
        The page you're looking for doesn't exist, or the URL is incomplete.
      </p>
      <Link
        to="/insights"
        className="rounded-sm bg-(--color-ink) px-4 py-2 text-sm font-medium text-(--color-paper) transition-opacity hover:opacity-90"
      >
        Back to Insights
      </Link>
    </div>
  );
}
