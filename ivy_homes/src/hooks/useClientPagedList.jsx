import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 12;

// The API's own pagination/filtering can't fully be trusted (see README), so
// pages that need reliable filters fetch the full dataset once, then filter
// and paginate on the client. `fetchAll` is the function that retrieves
// every record (e.g. fetchAllListings), and `matchesFilters` decides
// whether a record should be kept for the current filter state.
export function useClientPagedList({ fetchAll, matchesFilters, sortFn, deps = [] }) {
  const [allRecords, setAllRecords] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | error | ready
  const [errorMessage, setErrorMessage] = useState('');
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetchAll()
      .then((records) => {
        if (cancelled) return;
        setAllRecords(records);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err?.response?.data?.detail || err.message || 'Request failed');
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadToken, ...deps]);

  const filtered = useMemo(() => {
    const result = matchesFilters ? allRecords.filter(matchesFilters) : allRecords;
    return sortFn ? [...result].sort(sortFn) : result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRecords, matchesFilters, sortFn]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const retry = () => setReloadToken((t) => t + 1);

  return {
    status,
    errorMessage,
    pageItems,
    totalFiltered: filtered.length,
    totalFetched: allRecords.length,
    page: safePage,
    pageCount,
    setPage,
    retry,
  };
}

export { PAGE_SIZE };
