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

export async function fetchListingsPage({
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
  if (filters.propertyType) params.property_type = filters.propertyType;
  if (filters.minPrice != null) params.min_price = filters.minPrice;
  if (filters.maxPrice != null) params.max_price = filters.maxPrice;
  if (filters.furnishing) params.furnishing = filters.furnishing;

  const { data } = await api.get('/v1/listings', { params });

  return normalizeCollection(data);
}

export async function fetchAllListings({
  maxRecords = DEFAULT_MAX_RECORDS,
  filters = {},
} = {}) {
  const listings = [];
  let offset = 0;

  while (listings.length < maxRecords) {
    const page = await fetchListingsPage({
      offset,
      limit: MAX_LIMIT,
      filters,
    });

    listings.push(...page.results);

    if (!page.hasMore || page.results.length === 0) {
      break;
    }

    offset += page.results.length;
  }

  return listings.slice(0, maxRecords);
}

export async function fetchListingById(listingId) {
  const { data } = await api.get(
    `/v1/listings/${encodeURIComponent(listingId)}`
  );

  return data;
}

export { MAX_LIMIT };