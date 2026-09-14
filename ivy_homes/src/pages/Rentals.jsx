import { useCallback, useState } from 'react';
import { fetchAllRentals } from '../api/rentals';
import { useClientPagedList } from '../hooks/useClientPagedList';
import RentalCard from '../components/RentalCard';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const EMPTY_FILTERS = { locality: '', bhk: '', furnishing: '' };
const inputClass =
  'rounded-sm border border-(--color-rule) bg-(--color-paper-raised) px-3 py-2 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-ink)';

export default function Rentals() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const fetchAll = useCallback(() => fetchAllRentals({}), []);

  const matchesFilters = useCallback(
    (r) => {
      if (filters.locality && !(r.locality || '').toLowerCase().includes(filters.locality.toLowerCase())) {
        return false;
      }
      if (filters.bhk && Number(r.bedroom) !== Number(filters.bhk)) return false;
      if (filters.furnishing && r.furnishing !== filters.furnishing) return false;
      return true;
    },
    [filters]
  );

  const { status, errorMessage, pageItems, totalFiltered, totalFetched, page, pageCount, setPage, retry } =
    useClientPagedList({ fetchAll, matchesFilters });

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-(--color-ink)">Rentals</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          {status === 'ready'
            ? `${totalFiltered.toLocaleString('en-IN')} of ${totalFetched.toLocaleString('en-IN')} rentals match your filters`
            : 'Browse rental listings across the assigned city'}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-(--color-ink-faint)">Locality</span>
          <input
            type="text"
            value={filters.locality}
            onChange={(e) => { setFilters({ ...filters, locality: e.target.value }); setPage(1); }}
            placeholder="e.g. koramangala"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-(--color-ink-faint)">BHK</span>
          <select
            value={filters.bhk}
            onChange={(e) => { setFilters({ ...filters, bhk: e.target.value }); setPage(1); }}
            className={inputClass}
          >
            <option value="">Any</option>
            {['1', '2', '3', '4', '5'].map((b) => (
              <option key={b} value={b}>{b} BHK</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-(--color-ink-faint)">Furnishing</span>
          <select
            value={filters.furnishing}
            onChange={(e) => { setFilters({ ...filters, furnishing: e.target.value }); setPage(1); }}
            className={inputClass}
          >
            <option value="">Any</option>
            {['unfurnished', 'semi-furnished', 'fully-furnished'].map((f) => (
              <option key={f} value={f}>{f.replace('-', ' ')}</option>
            ))}
          </select>
        </label>
        <button
          onClick={() => { setFilters(EMPTY_FILTERS); setPage(1); }}
          className="rounded-sm border border-(--color-rule) px-3 py-2 text-sm text-(--color-ink-soft) transition-colors hover:border-(--color-brick) hover:text-(--color-brick)"
        >
          Reset filters
        </button>
      </div>

      {status === 'loading' && <LoadingSkeleton count={9} />}
      {status === 'error' && <ErrorState message={errorMessage} onRetry={retry} />}

      {status === 'ready' && pageItems.length === 0 && (
        <EmptyState
          title={hasActiveFilters ? 'No rentals match these filters' : 'No rentals found'}
          description={hasActiveFilters ? 'Try clearing a filter.' : 'The API returned no rentals for this city.'}
          actionLabel={hasActiveFilters ? 'Reset filters' : undefined}
          onAction={hasActiveFilters ? () => setFilters(EMPTY_FILTERS) : undefined}
        />
      )}

      {status === 'ready' && pageItems.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((r) => (
              <RentalCard key={r.listing_id} rental={r} />
            ))}
          </div>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
