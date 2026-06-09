import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthLayout } from '../components/AuthLayout';
import type { AuthUser, ModulePermission } from '../shared/types/auth.types';
import { api } from '../shared/services/apiService';
import { useAuth } from './useAuth';
import { getWorkspaceHomePath } from './homePath';

const ALL_PERMISSIONS: ModulePermission[] = [
  'dashboard',
  'cms',
  'people',
  'channelPartners',
  'finance',
  'platform',
  'sales',
  'it',
  'customers',
  'reports',
  'corporate',
];

const inputClass =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

type LoginResponse = {
  token: string;
  user: { id: string; username: string; role: string };
};

type MeResponse = {
  user: { id: string; username: string; role: string; email?: string | null };
};

export const AdminLogin: React.FC = () => {
  const [username, setUsername] = React.useState('admin');
  const [email, setEmail] = React.useState('');
  const [captcha, setCaptcha] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { login, resetAttempts } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!username.trim()) throw new Error('Username is required.');
      if (!email.trim()) throw new Error('Email is required.');
      if (!captcha.trim()) throw new Error('Password is required.');

      // Per current requirement: treat captcha as the admin password.
      const result = await api.post<LoginResponse>('/api/auth/admin/login', {
        username: email.trim(),
        password: captcha.trim(),
      });

      const me = await api.get<MeResponse>('/api/auth/me', {
        Authorization: `Bearer ${result.token}`,
      });

      const serverEmail = me.user?.email ? String(me.user.email).trim().toLowerCase() : '';
      if (serverEmail && serverEmail !== email.trim().toLowerCase()) {
        throw new Error('Email does not match this admin account.');
      }

      const user: AuthUser = {
        id: me.user.id ?? result.user.id,
        username: me.user.username ?? result.user.username,
        code: (me.user.username ?? result.user.username) || username.trim(),
        name: (me.user.username ?? result.user.username) || 'Admin',
        role: 'admin',
        email: me.user.email ?? undefined,
        permissions: ALL_PERMISSIONS,
        status: 'Active',
      };

      login(result.token, user);
      resetAttempts();
      toast.success('Admin login successful');
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
    <AuthLayout
      title="Admin login"
      subtitle="Sign in as a system administrator"
      footer={(
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to regular login
        </Link>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              placeholder="admin"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="Enter Your Email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              className={inputClass}
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
      </form>
    </AuthLayout>
  );
};

