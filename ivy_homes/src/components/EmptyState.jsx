export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-(--color-rule) px-6 py-16 text-center">
      <div className="mb-3 font-display text-xl text-(--color-ink)">{title}</div>
      {description && (
        <p className="mb-5 max-w-sm text-sm text-(--color-ink-soft)">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-sm bg-(--color-ink) px-4 py-2 text-sm font-medium text-(--color-paper) transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
