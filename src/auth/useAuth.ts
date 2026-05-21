import { useAuthStore } from './authStore';
import type { ModulePermission } from '../shared/types/auth.types';

export function useAuth() {
  const store = useAuthStore();
  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    loginAttempts: store.loginAttempts,
    isLocked: store.isLocked,
    login: store.login,
    updatePermissions: store.updatePermissions,
    patchUserFields: store.patchUserFields,
    logout: store.logout,
    incrementAttempts: store.incrementAttempts,
    resetAttempts: store.resetAttempts,
    hasPermission: (module: ModulePermission) => store.hasPermission(module),
    hasSection: (module: ModulePermission, sectionKey: string) => store.hasSection(module, sectionKey),
  };
}
