import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [loginLabel, setLoginLabel] = React.useState<string>('');

  React.useEffect(() => {
    const name = window.localStorage.getItem('loginUsername')?.trim();
    setLoginLabel(name ? `Login: ${name}` : 'Session');
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('loginUsername');
    navigate('/login', { replace: true });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between bg-primary px-4 shadow-navbar sm:px-6 lg:px-10">
      <div className="flex items-center gap-2">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10 sm:hidden"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        ) : null}
        <span className="select-none text-xl font-extrabold tracking-[0.12em] text-[#e8c547] drop-shadow-sm shrink-0">
          BLAUNK
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 text-sm text-white/90">
        <div className="flex flex-col items-end leading-tight sm:block sm:leading-normal">
          <span className="hidden text-[10px] opacity-70 sm:inline sm:text-xs">Login: </span>
          <span className="font-bold sm:font-normal">{loginLabel.replace('Login: ', '')}</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-white/10 sm:px-4 sm:text-xs"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
