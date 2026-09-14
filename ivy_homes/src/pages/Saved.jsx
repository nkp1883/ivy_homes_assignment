import { Link } from 'react-router-dom';
import { useSavedListings } from '../context/SavedListingsContext';
import { LiveBadge } from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import {
  formatPrice,
  formatArea,
  bhkLabel,
  titleCase,
  formatRelativeDate,
} from '../utils/format';

export default function Saved() {
  const {
    savedListings,
    isLoading,
    removeListing,
  } = useSavedListings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-(--color-ink)">
          Saved listings
        </h1>

        <p className="mt-1 text-sm text-(--color-ink-soft)">
          {savedListings.length > 0
            ? `${savedListings.length} listing${
                savedListings.length === 1 ? '' : 's'
              } saved to this account`
            : 'Save a listing from the Listings page to see it here'}
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-(--color-ink-soft)">
          Loading saved listings...
        </div>
      ) : savedListings.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Save a listing from the Listings page and it will show up here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {savedListings.map((listing) => (
            <div
              key={listing.listing_id}
              className="flex flex-col gap-3 rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                to={`/listings/${encodeURIComponent(listing.listing_id)}`}
                className="min-w-0 flex-1"
              >
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="truncate font-display text-base text-(--color-ink)">
                    {listing.apartment_name || 'Unnamed property'}
                  </h3>

                  <LiveBadge isLive={Boolean(listing.is_live)} />
                </div>

                <div className="text-sm text-(--color-ink-soft)">
                  {titleCase(listing.locality)} · {bhkLabel(listing.bedroom)}
                </div>

                <div className="mt-1 flex flex-wrap gap-x-3 font-mono text-sm">
                  <span className="font-semibold text-(--color-brick) tabular">
                    {formatPrice(listing.price)}
                  </span>

                  <span className="text-(--color-ink-faint) tabular">
                    {formatArea(listing.carpet_area)}
                  </span>

                  {listing.saved_at && (
                    <span className="text-(--color-ink-faint)">
                      saved {formatRelativeDate(listing.saved_at)}
                    </span>
                  )}
                </div>
              </Link>

              <button
                type="button"
                onClick={() => removeListing(listing.listing_id)}
                className="shrink-0 rounded-sm border border-(--color-rule) px-3 py-1.5 text-sm text-(--color-ink-soft) transition-colors hover:border-(--color-danger) hover:text-(--color-danger)"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}