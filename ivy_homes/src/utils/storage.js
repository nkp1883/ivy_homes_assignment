// Centralized localStorage helpers.
// Keeping key names in one place avoids typo-drift across the app.

const KEYS = {
  ACCESS_TOKEN: 'ivy_access_token',
  REFRESH_TOKEN: 'ivy_refresh_token',
  USER: 'ivy_user',
};

export function getAccessToken() {
  return localStorage.getItem(KEYS.ACCESS_TOKEN);
}

export function getRefreshToken() {
  return localStorage.getItem(KEYS.REFRESH_TOKEN);
}

export function getStoredUser() {
  const raw = localStorage.getItem(KEYS.USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession({ accessToken, refreshToken, user }) {
  if (accessToken) {
    localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
  }

  if (user) {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  }
}

export function clearSession() {
  localStorage.removeItem(KEYS.ACCESS_TOKEN);
  localStorage.removeItem(KEYS.REFRESH_TOKEN);
  localStorage.removeItem(KEYS.USER);
}