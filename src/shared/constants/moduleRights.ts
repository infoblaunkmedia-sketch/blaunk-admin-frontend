import type { ModulePermission } from '../types/auth.types';

export type ModuleChildRight = {
  key: string;
  label: string;
};

export type ModuleRightNode = {
  key: ModulePermission;
  label: string;
  children?: ModuleChildRight[];
};

export const MODULE_RIGHTS_TREE: ModuleRightNode[] = [
  { key: 'dashboard', label: 'Dashboard' },
  {
    key: 'cms',
    label: 'CMS',
    children: [
      { key: 'banners', label: 'Upload' },
      { key: 'giff', label: 'GIFF' },
      { key: 'local-stores', label: 'B-Store Shops' },
      { key: 'store-categories', label: 'B-Store Categories' },
    ],
  },
  {
    key: 'people',
    label: 'People',
    children: [
      { key: 'employees', label: 'Employees' },
      { key: '3p-credentials', label: '3P Credentials' },
      { key: 'payroll', label: 'Payroll' },
      { key: 'vacancies', label: 'Vacancies' },
    ],
  },
  {
    key: 'channelPartners',
    label: 'Channel Partners',
    children: [
      { key: 'dsa', label: 'DSA' },
      { key: 'verifiers', label: 'Verifiers' },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    children: [
      { key: 'b2b', label: 'B2B Payments' },
      { key: 'dsa-payouts', label: 'DSA Limit' },
      { key: 'bank-accounts', label: 'BGT Bank Accounts' },
    ],
  },
  {
    key: 'platform',
    label: 'Management',
    children: [
      { key: 'plan-charges', label: 'Plan Charges' },
      { key: 'commission', label: 'Commission' },
      { key: 'vouchers', label: 'Vouchers' },
      { key: 'products', label: 'Products' },
      { key: 'categories', label: 'Categories' },
      { key: 'rights', label: 'User Rights' },
      { key: 'match-code', label: 'Match Code' },
    ],
  },
  { key: 'sales', label: 'Sales' },
  {
    key: 'it',
    label: 'IT',
    children: [{ key: 'ip-management', label: 'IP Management' }],
  },
  {
    key: 'customers',
    label: 'Customers & Care',
    children: [
      { key: 'individuals', label: 'Individuals' },
      { key: 'vendors', label: 'Vendors' },
      { key: 'issues', label: 'Issues' },
      { key: 'reviews', label: 'Reviews' },
      { key: 'orders', label: 'Orders' },
    ],
  },
  { key: 'reports', label: 'Reports (MIS)' },
  {
    key: 'corporate',
    label: 'Corporate',
    children: [
      { key: 'shareholding', label: 'Shareholding' },
      { key: 'profile', label: 'Company Profile' },
    ],
  },
  { key: 'retailManagement', label: 'Retail Management' },
  {
    key: 'adminPersonnel',
    label: 'Admin & Personnel',
    children: [{ key: 'media', label: 'Media' }],
  },
];

export const TOP_LEVEL_MODULES = MODULE_RIGHTS_TREE.map((m) => m.key);

export function sectionPermissionKey(module: ModulePermission, childKey: string): string {
  return `${module}:${childKey}`;
}

export function isSectionPermission(value: string): boolean {
  return value.includes(':');
}

export function parseSectionPermission(value: string): { module: string; child: string } | null {
  const i = value.indexOf(':');
  if (i <= 0) return null;
  return { module: value.slice(0, i), child: value.slice(i + 1) };
}

const MANAGEMENT_LEGACY_SECTIONS = new Set([
  'rights',
  'match-code',
]);

export function hasModuleAccess(permissions: string[], module: ModulePermission): boolean {
  if (permissions.includes(module)) return true;
  if (permissions.some((p) => p.startsWith(`${module}:`))) return true;
  // Legacy: Settings module merged into Management (platform)
  if (module === 'platform') {
    if (permissions.includes('settings')) return true;
    if (permissions.some((p) => p.startsWith('settings:'))) return true;
  }
  // Legacy: grant IT module when only old Settings IP right exists
  if (module === 'it' && permissions.includes('settings:ip-management')) return true;
  // Legacy: top-level payslip grant maps to People module
  if (module === 'people' && permissions.includes('payslip')) return true;
  return false;
}

export function hasSectionAccess(
  permissions: string[],
  module: ModulePermission,
  childKey: string,
): boolean {
  if (permissions.includes(module)) return true;
  if (permissions.includes(sectionPermissionKey(module, childKey))) return true;
  // Legacy: IP Management moved from Settings → IT
  if (module === 'it' && childKey === 'ip-management' && permissions.includes('settings:ip-management')) {
    return true;
  }
  if (module === 'platform' && MANAGEMENT_LEGACY_SECTIONS.has(childKey)) {
    if (permissions.includes(`settings:${childKey}`)) return true;
    if (permissions.includes('settings')) return true;
  }
  if (
    module === 'platform' &&
    childKey === 'match-code' &&
    (permissions.includes('marketing:match-doe') || permissions.includes('marketing:match-code'))
  ) {
    return true;
  }
  // Legacy: standalone Payslip module → People → Payroll
  if (module === 'people' && childKey === 'payroll' && permissions.includes('payslip')) {
    return true;
  }
  return false;
}

export function normalizeSectionList(sections: string[]): string[] {
  const out = new Set<string>();
  for (const raw of sections) {
    const s = String(raw || '').trim();
    if (!s) continue;
    out.add(s);
  }
  return [...out];
}

export function childKeysForModule(module: ModulePermission): string[] {
  const node = MODULE_RIGHTS_TREE.find((m) => m.key === module);
  return node?.children?.map((c) => c.key) ?? [];
}

export function isKnownSection(value: string): boolean {
  if (value === 'payslip') return true; // legacy top-level grant (maps to People → Payroll)
  if (TOP_LEVEL_MODULES.includes(value as ModulePermission)) return true;
  const parsed = parseSectionPermission(value);
  if (!parsed) return false;
  return childKeysForModule(parsed.module as ModulePermission).includes(parsed.child);
}
