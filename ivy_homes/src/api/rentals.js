import { api } from './client';

const MAX_LIMIT = 50;
const DEFAULT_MAX_RECORDS = 4000;

function normalizeCollection(data) {
  const results = data?.results ?? data?.data ?? [];

  return {
    results,
    offset: data?.offset ?? 0,
    limit: data?.limit ?? results.length,
    count: data?.count ?? results.length,
    total: data?.total ?? null,
    hasMore: data?.has_more ?? data?.hasMore ?? false,
  };
}

export async function fetchRentalsPage({
  offset = 0,
  limit = MAX_LIMIT,
  filters = {},
} = {}) {
  const params = {
    offset,
    limit: Math.min(limit, MAX_LIMIT),
  };

  if (filters.locality) params.locality = filters.locality;
  if (filters.bhk) params.bhk = filters.bhk;
  if (filters.furnishing) params.furnishing = filters.furnishing;

  const { data } = await api.get('/v1/rentals', { params });

  return normalizeCollection(data);
}

export async function fetchAllRentals({
  maxRecords = DEFAULT_MAX_RECORDS,
  filters = {},
} = {}) {
  const rentals = [];
  let offset = 0;

  while (rentals.length < maxRecords) {
    const page = await fetchRentalsPage({
      offset,
      limit: MAX_LIMIT,
      filters,
    });

    rentals.push(...page.results);

    if (!page.hasMore || page.results.length === 0) {
      break;
    }

    offset += page.results.length;
  }

  return rentals.slice(0, maxRecords);
}

export async function fetchRentalById(listingId) {
  const { data } = await api.get(
    `/v1/rentals/${encodeURIComponent(listingId)}`
  );

  return data;
}

export { MAX_LIMIT };