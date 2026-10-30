import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/my-tasks', label: 'My Tasks' },
  { to: '/tasks', label: 'All Tasks' },
  { to: '/projects', label: 'Projects' },
  { to: '/team-progress', label: 'Team Progress' },
];

function Navigation({ onNavigate }) {
  return (
    <nav aria-label="Main" className="space-y-1">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `block rounded-md px-3 py-2 text-sm font-medium ${
              isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function Account() {
  const { user, logout } = useAuth();
  const toast = useToast();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="border-t border-slate-200 pt-3">
      <p className="truncate px-3 text-sm font-medium text-slate-900">{user.name}</p>
      <p className="truncate px-3 text-xs text-slate-500">{user.email}</p>
      <button type="button" className="mt-1 w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}

const Brand = () => <img src="/logo.webp" alt="Vision Wave Tech" width="817" height="203" className="h-10 w-auto" />;

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen lg:pl-56">
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col justify-between border-r border-slate-200 bg-white p-3 lg:flex">
        <div>
          <div className="px-3 py-3">
            <Brand />
          </div>
          <Navigation />
        </div>
        <Account />
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Brand />
          <button
            type="button"
            className="btn-secondary"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        {menuOpen && (
          <div id="mobile-menu" className="space-y-3 border-t border-slate-200 p-3">
            <Navigation onNavigate={() => setMenuOpen(false)} />
            <Account />
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
