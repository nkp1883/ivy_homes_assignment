import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/insights';
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(location.state?.from?.pathname || '/insights', {
        replace: true,
      });
    } catch (err) {
      const detail = err?.response?.data?.detail;

      if (err?.response?.status === 401) {
        setError('Incorrect email or password.');
      } else if (err?.response?.status === 403) {
        setError('Unable to sign in with these credentials.');
      } else {
        setError(detail || 'Could not sign in. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-paper) px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="mb-4"
          >
            <rect width="32" height="32" rx="4" fill="#1F2A22" />
            <path
              d="M6 22 L6 6 L22 6"
              fill="none"
              stroke="#C9A24B"
              strokeWidth="2.5"
            />
            <circle cx="6" cy="6" r="2" fill="#C9A24B" />
            <path
              d="M12 26 L26 26 L26 12"
              fill="none"
              stroke="#EDE7D8"
              strokeWidth="2.5"
              opacity="0.85"
            />
          </svg>

          <h1 className="font-display text-2xl text-(--color-ink)">
            Ivy Homes
          </h1>

          <p className="mt-1 text-sm text-(--color-ink-soft)">
            Sign in to your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-sm border border-(--color-rule) bg-(--color-paper-raised) p-6"
        >
          <div className="mb-4 flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wide text-(--color-ink-faint)"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="rounded-sm border border-(--color-rule) bg-(--color-paper) px-3 py-2.5 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-ink)"
            />
          </div>

          <div className="mb-5 flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-wide text-(--color-ink-faint)"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="rounded-sm border border-(--color-rule) bg-(--color-paper) px-3 py-2.5 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-ink)"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-sm bg-(--color-danger-bg) px-3 py-2 text-sm text-(--color-danger)"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-sm bg-(--color-ink) py-2.5 text-sm font-medium text-(--color-paper) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}