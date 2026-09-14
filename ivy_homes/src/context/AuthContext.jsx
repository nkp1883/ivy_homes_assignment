import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as authApi from '../api/auth';
import { registerAuthFailureHandler } from '../api/client';
import {
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setSession,
  clearSession,
} from '../utils/storage';

const AuthContext = createContext(null);

const DEFAULT_EXPIRES_IN_SECONDS = 900;
const PROACTIVE_REFRESH_MARGIN_MS = 60 * 1000;
const MIN_REFRESH_DELAY_MS = 5000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getAccessToken())
  );
  const [isInitializing, setIsInitializing] = useState(true);

  const refreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const handleAuthFailure = useCallback(() => {
    clearRefreshTimer();
    clearSession();
    setUser(null);
    setIsAuthenticated(false);
  }, [clearRefreshTimer]);

  const performRefresh = useCallback(async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken || isRefreshingRef.current) {
      return false;
    }

    isRefreshingRef.current = true;

    try {
      const result = await authApi.refresh(refreshToken);

      if (!result?.accessToken) {
        throw new Error('Refresh response did not include an access token');
      }

      const currentUser = result.user ?? getStoredUser();

      setSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken ?? refreshToken,
        user: currentUser,
      });

      setUser(currentUser);
      setIsAuthenticated(true);

      return result.expiresIn ?? DEFAULT_EXPIRES_IN_SECONDS;
    } catch {
      handleAuthFailure();
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [handleAuthFailure]);

  const scheduleRefresh = useCallback(
    (expiresInSeconds = DEFAULT_EXPIRES_IN_SECONDS) => {
      clearRefreshTimer();

      const expiresInMs = Number(expiresInSeconds) * 1000;
      const delay = Math.max(
        expiresInMs - PROACTIVE_REFRESH_MARGIN_MS,
        MIN_REFRESH_DELAY_MS
      );

      refreshTimerRef.current = setTimeout(async () => {
        const nextExpiresIn = await performRefresh();

        if (nextExpiresIn) {
          scheduleRefresh(nextExpiresIn);
        }
      }, delay);
    },
    [clearRefreshTimer, performRefresh]
  );

  const login = useCallback(
    async (email, password) => {
      const result = await authApi.login(email, password);

      if (!result?.accessToken) {
        throw new Error('Login response did not include an access token');
      }

      const loggedInUser = result.user ?? { email };

      setSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: loggedInUser,
      });

      setUser(loggedInUser);
      setIsAuthenticated(true);

      scheduleRefresh(result.expiresIn ?? DEFAULT_EXPIRES_IN_SECONDS);

      return loggedInUser;
    },
    [scheduleRefresh]
  );

  const logout = useCallback(async () => {
    clearRefreshTimer();
    clearSession();
    setUser(null);
    setIsAuthenticated(false);

    await authApi.logout();
  }, [clearRefreshTimer]);

  useEffect(() => {
    registerAuthFailureHandler(handleAuthFailure);

    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (accessToken) {
      setUser(getStoredUser());
      setIsAuthenticated(true);
      scheduleRefresh(DEFAULT_EXPIRES_IN_SECONDS);
      setIsInitializing(false);

      return clearRefreshTimer;
    }

    if (refreshToken) {
      setUser(getStoredUser());
      setIsAuthenticated(true);

      const timer = setTimeout(async () => {
        const nextExpiresIn = await performRefresh();

        if (nextExpiresIn) {
          scheduleRefresh(nextExpiresIn);
        }

        setIsInitializing(false);
      }, 100);

      return () => {
        clearTimeout(timer);
        clearRefreshTimer();
      };
    }

    setUser(null);
    setIsAuthenticated(false);
    setIsInitializing(false);

    return clearRefreshTimer;
  }, [
    clearRefreshTimer,
    handleAuthFailure,
    performRefresh,
    scheduleRefresh,
  ]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}