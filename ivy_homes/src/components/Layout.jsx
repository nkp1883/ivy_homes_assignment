import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/insights', label: 'Insights', mark: '01' },
  { to: '/listings', label: 'Listings', mark: '02' },
  { to: '/rentals', label: 'Rentals', mark: '03' },
  { to: '/projects', label: 'Projects', mark: '04' },
  { to: '/saved', label: 'Saved', mark: '05' },
];

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex items-baseline gap-3 border-b border-(--color-rule) px-5 py-3.5 transition-colors ${
              isActive
                ? 'bg-(--color-ink) text-(--color-paper)'
                : 'text-(--color-ink-soft) hover:bg-(--color-paper-raised) hover:text-(--color-ink)'
            }`
          }
        >
          <span className="font-mono text-xs opacity-60">{item.mark}</span>
          <span className="font-display text-[15px] tracking-tight">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-(--color-paper) text-(--color-ink)">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-(--color-rule) px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-sm bg-(--color-ink)" />
          <span className="font-display text-lg">Ivy Homes</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-sm border border-(--color-rule) px-3 py-1.5 text-sm"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
      </header>

      {mobileOpen && (
        <div className="border-b border-(--color-rule) md:hidden">
          <NavLinks onNavigate={() => setMobileOpen(false)} />
          <div className="border-t border-(--color-rule) px-5 py-3 text-sm text-(--color-ink-soft)">
            {user?.email}
          </div>
          <button
            onClick={logout}
            className="w-full border-t border-(--color-rule) px-5 py-3 text-left font-medium text-(--color-brick)"
          >
            Log out
          </button>
        </div>
      )}

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-(--color-rule) md:flex">
          <div className="border-b border-(--color-rule) px-5 py-6">
            <div className="flex items-center gap-2.5">
              <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
                <rect width="32" height="32" rx="3" fill="#1F2A22" />
                <path d="M6 22 L6 6 L22 6" fill="none" stroke="#C9A24B" strokeWidth="2.5" />
                <circle cx="6" cy="6" r="2" fill="#C9A24B" />
                <path
                  d="M12 26 L26 26 L26 12"
                  fill="none"
                  stroke="#EDE7D8"
                  strokeWidth="2.5"
                  opacity="0.85"
                />
              </svg>
              <div>
                <div className="font-display text-lg leading-tight">Ivy Homes</div>
                <div className="text-[11px] uppercase tracking-wide text-(--color-ink-faint)">
                  Property Register
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            <NavLinks />
          </div>

          <div className="border-t border-(--color-rule) px-5 py-4">
            <div className="mb-2 truncate text-sm text-(--color-ink-soft)" title={user?.email}>
              {user?.email}
            </div>
            <button
              onClick={logout}
              className="w-full rounded-sm border border-(--color-rule) px-3 py-2 text-left text-sm font-medium text-(--color-brick) transition-colors hover:border-(--color-brick) hover:bg-(--color-danger-bg)"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
