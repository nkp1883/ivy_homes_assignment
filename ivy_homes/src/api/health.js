import { api } from './client';

// Fetches the API health status.
// This endpoint does not require authentication.
export async function fetchHealth() {
  const { data } = await api.get('/health');
  return data;
}