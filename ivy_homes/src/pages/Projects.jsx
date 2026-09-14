import { useCallback, useState } from 'react';
import { fetchAllProjects } from '../api/projects';
import { useClientPagedList } from '../hooks/useClientPagedList';
import ProjectCard from '../components/ProjectCard';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const EMPTY_FILTERS = { locality: '', projectStatus: '' };
const inputClass =
  'rounded-sm border border-(--color-rule) bg-(--color-paper-raised) px-3 py-2 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-ink)';

export default function Projects() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const fetchAll = useCallback(() => fetchAllProjects({}), []);

  const matchesFilters = useCallback(
    (p) => {
      if (filters.locality && !(p.locality || '').toLowerCase().includes(filters.locality.toLowerCase())) {
        return false;
      }
      if (filters.projectStatus && p.project_status !== filters.projectStatus) return false;
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
        <h1 className="font-display text-2xl text-(--color-ink)">Projects</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          {status === 'ready'
            ? `${totalFiltered.toLocaleString('en-IN')} of ${totalFetched.toLocaleString('en-IN')} projects match your filters`
            : 'Browse builder projects across the assigned city'}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-(--color-ink-faint)">Locality</span>
          <input
            type="text"
            value={filters.locality}
            onChange={(e) => { setFilters({ ...filters, locality: e.target.value }); setPage(1); }}
            placeholder="e.g. sarjapur road"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-(--color-ink-faint)">Status</span>
          <select
            value={filters.projectStatus}
            onChange={(e) => { setFilters({ ...filters, projectStatus: e.target.value }); setPage(1); }}
            className={inputClass}
          >
            <option value="">Any</option>
            <option value="under construction">Under construction</option>
            <option value="ready to move">Ready to move</option>
            <option value="new launch">New launch</option>
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
          title={hasActiveFilters ? 'No projects match these filters' : 'No projects found'}
          description={hasActiveFilters ? 'Try clearing a filter.' : 'The API returned no projects for this city.'}
          actionLabel={hasActiveFilters ? 'Reset filters' : undefined}
          onAction={hasActiveFilters ? () => setFilters(EMPTY_FILTERS) : undefined}
        />
      )}

      {status === 'ready' && pageItems.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((p) => (
              <ProjectCard key={p.project_id} project={p} />
            ))}
          </div>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
