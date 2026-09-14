import { Link } from 'react-router-dom';
import SaveButton from './SaveButton';
import { LiveBadge, VerifiedBadge } from './StatusBadge';
import { formatPrice, formatArea, bhkLabel, titleCase } from '../utils/format';

export default function ListingCard({ listing }) {
  const {
    listing_id, apartment_name, locality, bedroom, property_type,
    price, carpet_area, furnishing, project_id, is_verified, is_live,
  } = listing;

  return (
    <Link
      to={`/listings/${encodeURIComponent(listing_id)}`}
      className="group flex flex-col rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4 transition-colors hover:border-(--color-ink)"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-display text-base leading-snug text-(--color-ink)">
          {apartment_name || 'Unnamed property'}
        </h3>
        <LiveBadge isLive={Boolean(is_live)} />
      </div>

      <div className="mb-3 text-sm text-(--color-ink-soft)">
        {titleCase(locality) || 'Locality unknown'} · {bhkLabel(bedroom)}
        {property_type ? ` · ${titleCase(property_type)}` : ''}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm">
        <span className="text-(--color-brick) font-semibold tabular">{formatPrice(price)}</span>
        <span className="text-(--color-ink-faint) tabular">{formatArea(carpet_area)}</span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {furnishing && (
            <span className="rounded-sm bg-(--color-paper) px-2 py-0.5 text-xs text-(--color-ink-soft)">
              {titleCase(furnishing)}
            </span>
          )}
          <VerifiedBadge isVerified={is_verified} />
          {project_id && (
            <span className="font-mono text-[11px] text-(--color-ink-faint)">{project_id}</span>
          )}
        </div>
        <SaveButton listing={listing} />
      </div>
    </Link>
  );
}
