import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import { getWorkspaceHomePath } from './homePath';
import type { AuthUser, ModulePermission } from '../shared/types/auth.types';
import { api } from '../shared/services/apiService';
import Blaunk_Logo from '../../public/blaunk_logo.png';

type LoginTab = 'employee' | 'admin';

const ALL_PERMISSIONS: ModulePermission[] = [
  'dashboard', 'cms', 'people', 'channelPartners', 'finance',
  'platform', 'marketing', 'customers', 'reports', 'corporate', 'settings',
];

const inputClass =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

type LoginResponse = {
  token: string;
  user: { id: string; username: string; role: string };
};

type MeResponse = {
  user: {
    id: string;
    username: string;
    role: string;
    email?: string | null;
    employeeCode?: string | null;
    employeeType?: string | null;
    department?: string | null;
  };
};

export const Login: React.FC = () => {
  const [tab, setTab] = React.useState<LoginTab>('employee');
  const [code, setCode] = React.useState('');
  const [captcha, setCaptcha] = React.useState('');
  const [showCaptcha, setShowCaptcha] = React.useState(false);
  const [adminEmail, setAdminEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { login, resetAttempts } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (next: LoginTab) => {
    setTab(next);
    setCode('');
    setCaptcha('');
    setAdminEmail('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (tab === 'admin') {
        if (!adminEmail.trim()) throw new Error('Please enter admin email.');
        if (!captcha.trim()) throw new Error('Please enter captcha.');

        // Requirement: backend password is entered via captcha field.
        const result = await api.post<LoginResponse>('/api/auth/admin/login', {
          username: adminEmail.trim(),
          password: captcha.trim(),
        });

        const me = await api.get<MeResponse>('/api/auth/me', {
          Authorization: `Bearer ${result.token}`,
        });

        const serverEmail = me.user?.email ? String(me.user.email).trim().toLowerCase() : '';
        if (serverEmail && serverEmail !== adminEmail.trim().toLowerCase()) {
          throw new Error('Email does not match this admin account.');
        }

        const user: AuthUser = {
          id: me.user.id ?? result.user.id,
          username: me.user.username ?? result.user.username,
          code: (me.user.username ?? result.user.username) || 'admin',
          name: (me.user.username ?? result.user.username) || 'Admin',
          role: 'admin',
          email: me.user.email ?? undefined,
          permissions: ALL_PERMISSIONS,
          status: 'Active',
        };

        login(result.token, user);
        resetAttempts();
        toast.success('Login successful');
        navigate(getWorkspaceHomePath(user), { replace: true });
        return;
      }

      if (!code.trim()) throw new Error('Please enter your username.');
      if (!captcha.trim()) throw new Error('Please enter captcha.');

      const result = await api.post<LoginResponse>('/api/auth/login', {
        username: code.trim(),
        password: captcha.trim(), // captcha acts as password
        captcha: captcha.trim(),
      });

      const me = await api.get<MeResponse>('/api/auth/me', {
        Authorization: `Bearer ${result.token}`,
      });

      const myRights = await api.get<{ sections: string[] }>('/api/rights/me', {
        Authorization: `Bearer ${result.token}`,
      });

      const granted = myRights.sections || [];

      const username = me.user.username ?? result.user.username ?? code.trim();
      const empCode = String(me.user.employeeCode || username).trim();

      const etRaw = String(me.user.employeeType ?? '').trim().toLowerCase();
      const employeeType = etRaw === '3pc' ? '3pc' : etRaw === 'employee' ? 'employee' : 'employee';

      const user: AuthUser = {
        id: me.user.id ?? result.user.id,
        username,
        code: empCode,
        name: username,
        role: 'employee',
        employeeType,
        email: me.user.email ?? undefined,
        permissions: granted,
        status: 'Active',
      };

      login(result.token, user);
      resetAttempts();
      toast.success('Login successful');
      navigate(getWorkspaceHomePath(user), { replace: true });
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Login failed. Please try again.';
      try {
        const parsed = JSON.parse(raw) as { message?: string };
        setError(parsed?.message || raw);
      } catch {
        setError(raw);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src={Blaunk_Logo}
            alt="Blaunk"
            className="mx-auto h-8.5 sm:h-9 sm:max-w-[170px]"
          />
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
        </div>

        <div className="rounded-card bg-white p-8 shadow-card">
          {/* Login type tabs */}
          <div className="mb-6 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {(['employee', 'admin'] as LoginTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTabChange(t)}
                className={[
                  'flex-1 rounded-md py-2 text-sm font-semibold transition',
                  tab === t
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900',
                ].join(' ')}
              >
                {t === 'employee' ? 'Employee Login' : 'Admin Login'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab !== 'admin' ? (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Employee Code</label>
                <input
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Enter your code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={inputClass}
                />
              </div>
            ) : null}

            {tab === 'admin' ? (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter Your Email"
                  className={inputClass}
                />
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Captcha
              </label>
              <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                <input
                  type={showCaptcha ? 'text' : 'password'}
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  placeholder={tab === 'admin' ? 'Enter captcha (used as password)' : 'Enter captcha'}
                  required
                  className="flex-1 border-0 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCaptcha((p) => !p)}
                  className="border-l border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  {showCaptcha ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>

            {/* <p className="mt-3 text-center text-sm text-slate-500">
                <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
                  Forgot password?
                </Link>
              </p> */}
          </form>
        </div>
      </div>
    </div>
  );
};
