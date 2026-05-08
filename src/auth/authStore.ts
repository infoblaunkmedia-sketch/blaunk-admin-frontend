import { create } from 'zustand';
import type { AuthUser, ModulePermission } from '../shared/types/auth.types';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';
const MAX_ATTEMPTS = 5;

function loadFromSession(): { token: string | null; user: AuthUser | null } {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const raw = sessionStorage.getItem(USER_KEY);
    const user: AuthUser | null = raw ? (JSON.parse(raw) as AuthUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

type AuthStore = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loginAttempts: number;
  isLocked: boolean;

  login: (token: string, user: AuthUser) => void;
  updatePermissions: (permissions: ModulePermission[]) => void;
  /** Keeps identifier / routing fields aligned with `/api/auth/me` (no permissions). */
  patchUserFields: (patch: Partial<Pick<AuthUser, 'employeeType' | 'email' | 'code'>>) => void;
  logout: () => void;
  incrementAttempts: () => void;
  resetAttempts: () => void;
  hasPermission: (module: ModulePermission) => boolean;
};

const { token: initialToken, user: initialUser } = loadFromSession();

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken && !!initialUser,
  loginAttempts: 0,
  isLocked: false,

  login(token, user) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user, isAuthenticated: true, loginAttempts: 0, isLocked: false });
  },

  updatePermissions(permissions) {
    const { user } = get();
    if (!user) return;
    const nextUser = { ...user, permissions };
    sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    set({ user: nextUser });
  },

  patchUserFields(patch) {
    const { user } = get();
    if (!user) return;
    const nextUser: AuthUser = { ...user };
    if (patch.email !== undefined) nextUser.email = patch.email;
    if (patch.code !== undefined) nextUser.code = patch.code;
    if (patch.employeeType !== undefined) nextUser.employeeType = patch.employeeType;
    sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    set({ user: nextUser });
  },

  logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  incrementAttempts() {
    const next = get().loginAttempts + 1;
    set({ loginAttempts: next, isLocked: next >= MAX_ATTEMPTS });
  },

  resetAttempts() {
    set({ loginAttempts: 0, isLocked: false });
  },

  hasPermission(module) {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(module);
  },
}));
