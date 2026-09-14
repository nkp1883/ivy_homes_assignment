export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-(--color-danger-bg) bg-(--color-danger-bg) px-6 py-12 text-center">
      <div className="mb-2 font-display text-lg text-(--color-danger)">Something went wrong</div>
      <p className="mb-5 max-w-md text-sm text-(--color-ink-soft)">
        {message || 'The request to the Ivy Homes API failed. Check your connection and try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-sm border border-(--color-danger) px-4 py-2 text-sm font-medium text-(--color-danger) transition-colors hover:bg-(--color-danger) hover:text-(--color-paper-raised)"
        >
          Retry
        </button>
      )}
    </div>
  );
}
