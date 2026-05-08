import React from 'react';
import { toast } from 'react-toastify';
import { api } from '../shared/services/apiService';
import { useAuth } from '../auth/useAuth';

type UpdateProfileResponse = {
  message?: string;
  user?: {
    email?: string;
  };
};

function getErrorMessage(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : '';
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as { message?: string };
    return parsed.message || fallback;
  } catch {
    return raw;
  }
}

export const ProfilePage: React.FC = () => {
  const { user, patchUserFields } = useAuth();
  const [email, setEmail] = React.useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setEmail(user?.email || '');
  }, [user?.email]);

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;

    const trimmedEmail = email.trim();
    const wantsPasswordChange = newPassword.trim().length > 0 || currentPassword.trim().length > 0;

    if (wantsPasswordChange && newPassword.trim() !== confirmPassword.trim()) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (trimmedEmail) payload.email = trimmedEmail;
      if (currentPassword.trim()) payload.currentPassword = currentPassword.trim();
      if (newPassword.trim()) payload.newPassword = newPassword.trim();

      const res = await api.patch<UpdateProfileResponse>('/api/auth/profile', payload);
      patchUserFields({ email: res?.user?.email ?? trimmedEmail });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(res?.message || 'Profile updated successfully.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">Manage your account details from here.</p>
      </div>

      <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Update Account</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2"
              placeholder="Enter email"
            />
          </label>
          <div className="hidden md:block" />
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Current Password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2"
              placeholder="Required only for password change"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">New Password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2"
              placeholder="Minimum 6 characters"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Confirm New Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-primary/30 focus:border-primary focus:ring-2"
              placeholder="Re-enter new password"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

