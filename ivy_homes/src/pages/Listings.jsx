import { useCallback, useMemo, useState } from 'react';
import { fetchAllListings } from '../api/listings';
import { useClientPagedList } from '../hooks/useClientPagedList';
import ListingFilters from '../components/ListingFilters';
import ListingGrid from '../components/ListingGrid';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const EMPTY_FILTERS = { locality: '', bhk: '', minPrice: '', maxPrice: '', furnishing: '' };

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'area_asc', label: 'Carpet area: low to high' },
  { value: 'area_desc', label: 'Carpet area: high to low' },
];

function sortComparator(sortBy) {
  switch (sortBy) {
    case 'price_asc':
      return (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0);
    case 'price_desc':
      return (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0);
    case 'area_asc':
      return (a, b) => (Number(a.carpet_area) || 0) - (Number(b.carpet_area) || 0);
    case 'area_desc':
      return (a, b) => (Number(b.carpet_area) || 0) - (Number(a.carpet_area) || 0);
    case 'newest':
    default:
      return (a, b) => new Date(b.posted_at || 0) - new Date(a.posted_at || 0);
  }
}

export default function Listings() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState('newest');

  const fetchAll = useCallback(() => fetchAllListings({}), []);

  // Even though the API accepts filter params server-side, we still enforce
  // them client-side — testing showed server-side filtering/sorting/totals
  // can't be fully trusted (see README).
  const matchesFilters = useCallback(
    (l) => {
      if (filters.locality && !(l.locality || '').toLowerCase().includes(filters.locality.toLowerCase())) {
        return false;
      }
      if (filters.bhk && Number(l.bedroom) !== Number(filters.bhk)) return false;
      if (filters.minPrice && !(Number(l.price) >= Number(filters.minPrice))) return false;
      if (filters.maxPrice && !(Number(l.price) <= Number(filters.maxPrice))) return false;
      if (filters.furnishing && l.furnishing !== filters.furnishing) return false;
      return true;
    },
    [filters]
  );

  const sortFn = useMemo(() => sortComparator(sortBy), [sortBy]);

  const { status, errorMessage, pageItems, totalFiltered, totalFetched, page, pageCount, setPage, retry } =
    useClientPagedList({ fetchAll, matchesFilters, sortFn });

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-(--color-ink)">Listings</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          {status === 'ready'
            ? `${totalFiltered.toLocaleString('en-IN')} of ${totalFetched.toLocaleString('en-IN')} listings match your filters`
            : 'Browse sale listings across the assigned city'}
        </p>
      </div>

      <ListingFilters
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        onReset={() => {
          setFilters(EMPTY_FILTERS);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={SORT_OPTIONS}
      />

      {status === 'loading' && <LoadingSkeleton count={9} />}

      {status === 'error' && <ErrorState message={errorMessage} onRetry={retry} />}

      {status === 'ready' && pageItems.length === 0 && (
        <EmptyState
          title={hasActiveFilters ? 'No listings match these filters' : 'No listings found'}
          description={
            hasActiveFilters
              ? 'Try widening your price range or clearing a filter.'
              : 'The API returned no listings for this city.'
          }
          actionLabel={hasActiveFilters ? 'Reset filters' : undefined}
          onAction={hasActiveFilters ? () => setFilters(EMPTY_FILTERS) : undefined}
        />
      )}

      {status === 'ready' && pageItems.length > 0 && (
        <>
          <ListingGrid listings={pageItems} />
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
