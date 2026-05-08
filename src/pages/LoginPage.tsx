import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = React.useState('admin');
  const [password, setPassword] = React.useState('');
  const [captcha, setCaptcha] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showCaptcha, setShowCaptcha] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!password.trim()) {
        throw new Error('Please enter a password.');
      }
      window.localStorage.setItem('authToken', 'local-session');
      window.localStorage.setItem('loginUsername', username.trim() || 'user');
      navigate('/', { replace: true });
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Unexpected error during login.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Username
          </label>
          <input
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="flex items-stretch rounded-lg border border-slate-300 bg-white text-sm shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              className="flex-1 rounded-l-lg border-0 bg-transparent px-3 py-2 text-slate-900 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="flex items-center justify-center rounded-r-lg border-l border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Captcha <span className="text-slate-400">(optional)</span>
          </label>
          <div className="flex items-stretch rounded-lg border border-slate-300 bg-white text-sm shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
            <input
              type={showCaptcha ? 'text' : 'password'}
              value={captcha}
              onChange={(event) => setCaptcha(event.target.value)}
              placeholder="Enter captcha"
              className="flex-1 rounded-l-lg border-0 bg-transparent px-3 py-2 text-slate-900 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowCaptcha((prev) => !prev)}
              className="flex items-center justify-center rounded-r-lg border-l border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              {showCaptcha ? 'Hide' : 'Show'
              }
            </button>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {submitting ? 'Logging in…' : 'Login'}
        </button>

        <p className="mt-3 text-center text-sm text-slate-600">
          <Link
            to="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
