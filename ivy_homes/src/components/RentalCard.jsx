import { Link } from 'react-router-dom';
import { formatRawPrice, formatArea, bhkLabel, titleCase } from '../utils/format';

export default function RentalCard({ rental }) {
  const {
    listing_id, apartment_name, title, locality, bedroom,
    property_type, price, carpet_area, furnishing,
  } = rental;

  return (
    <Link
      to={`/rentals/${encodeURIComponent(listing_id)}`}
      className="group flex flex-col rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4 transition-colors hover:border-(--color-ink)"
    >
      <h3 className="mb-2 font-display text-base leading-snug text-(--color-ink)">
        {title || apartment_name || 'Rental listing'}
      </h3>

      <div className="mb-3 text-sm text-(--color-ink-soft)">
        {titleCase(locality) || 'Locality unknown'} · {bhkLabel(bedroom)}
        {property_type ? ` · ${titleCase(property_type)}` : ''}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm">
        <span className="font-semibold text-(--color-brick) tabular">
          {formatRawPrice(price)}<span className="text-xs font-normal text-(--color-ink-faint)">/mo</span>
        </span>
        <span className="text-(--color-ink-faint) tabular">{formatArea(carpet_area)}</span>
      </div>

      {furnishing && (
        <div className="mt-auto">
          <span className="rounded-sm bg-(--color-paper) px-2 py-0.5 text-xs text-(--color-ink-soft)">
            {titleCase(furnishing)}
          </span>
        </div>
      )}
    </Link>
  );
}
