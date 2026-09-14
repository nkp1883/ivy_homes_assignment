import { api } from './client';

export async function fetchSavedListings() {
  const response = await api.get('/v1/saved');
  console.log('GET /v1/saved:', response.data);
  return response.data;
}

export async function saveListing(listingId) {
  const response = await api.post('/v1/saved', {
    listing_id: listingId,
  });

  console.log('POST /v1/saved:', response.data);
  return response.data;
}

export async function removeSavedListing(listingId) {
  console.log('Removing listing:', listingId);

  const response = await api.delete(
    `/v1/saved/${encodeURIComponent(listingId)}`
  );

  console.log('DELETE /v1/saved:', response.data);

  return response.data;
}