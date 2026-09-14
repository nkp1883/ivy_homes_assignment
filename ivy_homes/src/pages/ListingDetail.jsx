import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchListingById } from '../api/listings';
import { LiveBadge, VerifiedBadge } from '../components/StatusBadge';
import SaveButton from '../components/SaveButton';
import ErrorState from '../components/ErrorState';
import { formatRawPrice, formatArea, formatDate, bhkLabel, titleCase } from '../utils/format';

function Field({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="border-b border-(--color-rule) py-2.5 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-(--color-ink-faint)">{label}</div>
      <div className="mt-0.5 font-mono text-sm text-(--color-ink) tabular">{value}</div>
    </div>
  );
}

export default function ListingDetail() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(() => {
    setStatus('loading');
    fetchListingById(listingId)
      .then((data) => {
        setListing(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setStatus('not-found');
        } else {
          setErrorMessage(err?.response?.data?.detail || err.message || 'Request failed');
          setStatus('error');
        }
      });
  }, [listingId]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return <div className="animate-pulse text-(--color-ink-faint)">Loading listing…</div>;
  }

  if (status === 'not-found') {
    return (
      <div className="rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-8 text-center">
        <div className="mb-2 font-display text-xl">Listing not found</div>
        <p className="mb-5 text-sm text-(--color-ink-soft)">
          "{listingId}" doesn't match any listing in the register.
        </p>
        <Link
          to="/listings"
          className="rounded-sm bg-(--color-ink) px-4 py-2 text-sm font-medium text-(--color-paper)"
        >
          Back to listings
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return <ErrorState message={errorMessage} onRetry={load} />;
  }

  const {
    listing_id, apartment_name, locality, property_type, bedroom, bathroom, balcony,
    floor, total_floors, carpet_area, super_built_up_area, furnishing, facing_direction,
    covered_parking, price, project_id, description, posted_by, posted_by_name,
    posted_by_contact, posted_at, is_verified, is_live, listing_url, website,
  } = listing;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-(--color-ink-soft) hover:text-(--color-ink)"
      >
        ← Back
      </button>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-(--color-ink)">{apartment_name || 'Unnamed property'}</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            {titleCase(locality)} {property_type ? `· ${titleCase(property_type)}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LiveBadge isLive={Boolean(is_live)} />
          <VerifiedBadge isVerified={is_verified} />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4">
        <div>
          <div className="font-mono text-2xl font-semibold text-(--color-brick) tabular">
            {formatRawPrice(price)}
          </div>
          <div className="text-xs text-(--color-ink-faint)">Listing ID: {listing_id}</div>
        </div>
        <SaveButton listing={listing} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-x-6 rounded-sm border border-(--color-rule) bg-(--color-paper-raised) px-4 sm:grid-cols-2">
        <div>
          <Field label="BHK" value={bhkLabel(bedroom)} />
          <Field label="Bathrooms" value={bathroom} />
          <Field label="Balcony" value={balcony} />
          <Field label="Floor" value={floor !== undefined && floor !== null ? `${floor} of ${total_floors ?? '—'}` : null} />
          <Field label="Carpet area" value={formatArea(carpet_area)} />
          <Field label="Super built-up area" value={formatArea(super_built_up_area)} />
        </div>
        <div>
          <Field label="Furnishing" value={furnishing ? titleCase(furnishing) : null} />
          <Field label="Facing" value={facing_direction ? titleCase(facing_direction) : null} />
          <Field label="Parking" value={covered_parking !== undefined ? covered_parking : null} />
          <Field label="Project" value={project_id} />
          <Field label="Posted" value={formatDate(posted_at)} />
          <Field label="Source" value={website ? titleCase(website) : null} />
        </div>
      </div>

      {description && (
        <div className="mb-6 rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-(--color-ink-faint)">Description</div>
          <p className="text-sm leading-relaxed text-(--color-ink)">{description}</p>
        </div>
      )}

      {(posted_by_name || posted_by_contact) && (
        <div className="mb-6 rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-(--color-ink-faint)">Contact</div>
          <div className="text-sm text-(--color-ink)">
            {posted_by_name} {posted_by ? `(${titleCase(posted_by)})` : ''}
          </div>
          {posted_by_contact && (
            <div className="mt-0.5 font-mono text-sm text-(--color-ink-soft)">{posted_by_contact}</div>
          )}
        </div>
      )}

      {listing_url && (
        <a
          href={listing_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-(--color-brick) underline underline-offset-2"
        >
          View original listing ↗
        </a>
      )}
    </div>
  );
}
