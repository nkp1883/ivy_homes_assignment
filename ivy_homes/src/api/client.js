import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setSession,
  clearSession,
} from '../utils/storage';

const BASE_URL =
  import.meta.env.VITE_IVY_API_URL || 'https://solve.ivy.homes';

const API_KEY = import.meta.env.VITE_IVY_API_KEY || '';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
};

export const api = axios.create({
  baseURL: BASE_URL,
  headers: defaultHeaders,
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
  headers: defaultHeaders,
});

let onAuthFailure = () => {};

export function registerAuthFailureHandler(handler) {
  onAuthFailure = typeof handler === 'function' ? handler : () => {};
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  pendingQueue = [];
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const { data } = await refreshClient.post('/auth/refresh', {
    refresh_token: refreshToken,
  });

  const accessToken = data?.access_token;
  const newRefreshToken = data?.refresh_token;

  if (!accessToken) {
    throw new Error('Refresh response did not include an access token');
  }

  setSession({
    accessToken,
    refreshToken: newRefreshToken || refreshToken,
  });

  return accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';

    const isAuthRequest =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout');

    if (status !== 401 || isAuthRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newAccessToken) => {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();

      processQueue(null, newAccessToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      clearSession();
      onAuthFailure();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { BASE_URL };