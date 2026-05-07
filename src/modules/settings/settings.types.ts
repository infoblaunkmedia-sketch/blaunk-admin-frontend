import type { ModulePermission } from '../../shared/types/auth.types';

export type PermissionsMap = Record<string, ModulePermission[]>;

export type PresetRole = 'superAdmin' | 'hrManager' | 'financeManager' | 'operations';

export const PRESET_ROLES: Record<PresetRole, ModulePermission[]> = {
  superAdmin: [
    'dashboard', 'cms', 'people', 'channelPartners', 'finance',
    'platform', 'marketing', 'customers', 'reports', 'corporate', 'settings',
  ],
  hrManager: ['dashboard', 'people', 'reports'],
  financeManager: ['dashboard', 'finance', 'reports', 'platform'],
  operations: ['dashboard', 'marketing', 'customers', 'reports'],
};

export interface CaptchaEntry {
  module: string;
  code: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PasscodeEntry {
  operation: string;
  code: string;
  updatedAt: string;
}

export interface IpEntry {
  id: string;
  ip: string;
  label: string;
  addedBy: string;
  addedAt: string;
  status: 'Active' | 'Inactive';
}
