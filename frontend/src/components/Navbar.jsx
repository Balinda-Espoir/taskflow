import { Link, NavLink } from 'react-router-dom';
import { CheckSquare, LogOut, Moon, Sun, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-100' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const toast = useToast();

  const onLogout = async () => {
    try { await logout(); } catch { toast.error('Logout failed'); }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-white"><CheckSquare className="h-4 w-4" /></span>
          <span className="hidden sm:inline">TaskFlow</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin" className={linkClass}><span className="inline-flex items-center gap-1"><Shield className="h-3.5 w-3.5" />Admin</span></NavLink>}
        </nav>
        <div className="flex items-center gap-1">
          <button onClick={toggle} className="btn-ghost !p-2" aria-label="Toggle theme">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <span className="hidden text-sm text-slate-500 md:inline">{user?.name}</span>
          <button onClick={onLogout} className="btn-ghost !p-2" aria-label="Log out"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </header>
  );
}
