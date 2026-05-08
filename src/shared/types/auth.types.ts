export type UserRole = 'admin' | 'employee' | 'dsa' | 'user';

export type ModulePermission =
  | 'dashboard'
  | 'cms'
  | 'people'
  | 'channelPartners'
  | 'finance'
  | 'platform'
  | 'marketing'
  | 'customers'
  | 'reports'
  | 'corporate'
  | 'settings';

export type EmployeeKind = 'employee' | '3pc';

export interface AuthUser {
  id: string;
  /** Frontend display identifier (kept for existing UI). */
  code: string;
  /** Frontend display name (kept for existing UI). */
  name: string;
  role: UserRole;
  /** From backend User record; drives workspace landing, not replaceable by rights alone. */
  employeeType?: EmployeeKind | null;
  /** Backend username (login identifier). */
  username?: string;
  /** Email returned from /api/auth/me (if available). */
  email?: string;
  permissions: ModulePermission[];
  status: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loginAttempts: number;
  isLocked: boolean;
}
