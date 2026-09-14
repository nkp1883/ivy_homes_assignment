import { useSavedListings } from '../context/SavedListingsContext';

export default function SaveButton({ listing, className = '' }) {
  const { isSaved, toggle } = useSavedListings();
  const saved = isSaved(listing.listing_id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(listing);
      }}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved listings' : 'Save this listing'}
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        saved
          ? 'border-(--color-brick) bg-(--color-brick) text-(--color-paper)'
          : 'border-(--color-rule) bg-(--color-paper-raised) text-(--color-ink-soft) hover:border-(--color-brick) hover:text-(--color-brick)'
      } ${className}`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
      </svg>
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
