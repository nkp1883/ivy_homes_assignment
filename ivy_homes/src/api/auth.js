import { api } from './client';

function normalizeAuthPayload(data) {
  return {
    accessToken: data?.access_token ?? null,
    refreshToken: data?.refresh_token ?? null,
    tokenType: data?.token_type ?? 'bearer',
    expiresIn: data?.expires_in ?? 900,
    refreshUrl: data?.refresh_url ?? null,
    user: data?.user ?? null,
  };
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', {
    email,
    password,
  });

  return normalizeAuthPayload(data);
}

export async function refresh(refreshToken) {
  const { data } = await api.post('/auth/refresh', {
    refresh_token: refreshToken,
  });

  return normalizeAuthPayload(data);
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // Clear the client-side session even if the backend logout fails.
  }
}