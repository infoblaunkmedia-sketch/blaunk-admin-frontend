import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/useAuth';
import Blaunk_Logo from '../../../public/blaunk_logo.png';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out.');
    navigate('/login', { replace: true });
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate('/profile', { replace: false });
  };

  return (
    <header
      style={{ height: 'var(--topbar-height)', backgroundColor: 'var(--brand-primary)' }}
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 shadow-navbar"
    >
      <div className="flex items-center">
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition bg-white/10 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center">
          <img
            src={Blaunk_Logo}
            alt="Blaunk"
            className="h-8.5 w-auto max-w-[145px] object-contain sm:h-9 sm:max-w-[170px]"
          />
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((p) => !p)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-extrabold text-primary">
            {user?.name?.charAt(0) ?? 'A'}
          </div>
          <span className="hidden font-semibold sm:block">{user?.name ?? 'Admin'}</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={handleProfile}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20a8 8 0 0116 0" />
              </svg>
              Profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
