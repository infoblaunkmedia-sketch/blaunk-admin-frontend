import React from 'react';
import { Link } from 'react-router-dom';
import type { ModulePermission } from '../../shared/types/auth.types';
import {
  MODULE_RIGHTS_TREE,
  hasModuleAccess,
  hasSectionAccess,
  sectionPermissionKey,
} from '../../shared/constants/moduleRights';
import { formatInrAmount } from '../../shared/utils/dsaCurrencyFormat';

const SECTION_PATHS: Record<string, string> = {
  'cms:banners': '/cms/banners',
  'cms:giff': '/cms/giff',
  'cms:local-stores': '/cms/local-stores',
  'cms:store-categories': '/cms/store-categories',
  'people:employees': '/people/employees',
  'people:3p-credentials': '/people/3p-credentials',
  'people:payroll': '/people/payroll',
  'people:vacancies': '/people/vacancies',
  'channelPartners:dsa': '/channel-partners/dsa',
  'channelPartners:verifiers': '/channel-partners/verifiers',
  'finance:b2b': '/finance/b2b',
  'finance:dsa-payouts': '/finance/dsa-limit',
  'finance:bank-accounts': '/finance/bank-accounts',
  'platform:plan-charges': '/management/plan-charges',
  'platform:commission': '/management/commission',
  'platform:vouchers': '/management/vouchers',
  'platform:products': '/management/products',
  'platform:categories': '/management/categories',
  'platform:rights': '/management/rights',
  'platform:match-code': '/management/match-code',
  'it:ip-management': '/it',
  'it:rights': '/it/rights',
  'customers:individuals': '/customers/individuals',
  'customers:vendors': '/customers/vendors',
  'customers:issues': '/customers/issues',
  'customers:reviews': '/customers/reviews',
  'customers:orders': '/customers/orders',
  'corporate:shareholding': '/corporate/shareholding',
  'corporate:profile': '/corporate/profile',
  'adminPersonnel:media': '/admin-personnel/media',
};

const MODULE_PATHS: Partial<Record<ModulePermission, string>> = {
  sales: '/sales',
  reports: '/reports',
  retailManagement: '/retail-management',
};

export type WorkspaceQuickLink = {
  key: string;
  label: string;
  path: string;
  moduleLabel: string;
};

export function buildWorkspaceQuickLinks(permissions: string[], max = 8): WorkspaceQuickLink[] {
  const links: WorkspaceQuickLink[] = [];
  const seen = new Set<string>();

  for (const node of MODULE_RIGHTS_TREE) {
    if (node.key === 'dashboard') continue;
    if (!hasModuleAccess(permissions, node.key)) continue;

    if (node.children?.length) {
      for (const child of node.children) {
        const permKey = sectionPermissionKey(node.key, child.key);
        if (!hasSectionAccess(permissions, node.key, child.key)) continue;
        const path = SECTION_PATHS[permKey];
        if (!path || seen.has(path)) continue;
        seen.add(path);
        links.push({
          key: permKey,
          label: child.label,
          path,
          moduleLabel: node.label,
        });
        if (links.length >= max) return links;
      }
    } else {
      const path = MODULE_PATHS[node.key];
      if (!path || seen.has(path)) continue;
      seen.add(path);
      links.push({
        key: node.key,
        label: node.label,
        path,
        moduleLabel: node.label,
      });
      if (links.length >= max) return links;
    }
  }

  return links;
}

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

type WelcomeHeroProps = {
  title: string;
  subtitle: string;
  code?: string | null;
  department?: string | null;
};

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ title, subtitle, code, department }) => {
  const greeting = greetingForHour(new Date().getHours());
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark px-6 py-8 text-white shadow-lg">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-white/5" />
      <p className="text-sm font-medium text-white/80">{greeting}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-xl text-sm text-white/90">{subtitle}</p>
      {(code || department) ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {code ? (
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {code}
            </span>
          ) : null}
          {department ? (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {department}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

type QuickLinksGridProps = {
  links: WorkspaceQuickLink[];
  emptyMessage: string;
};

export const QuickLinksGrid: React.FC<QuickLinksGridProps> = ({ links, emptyMessage }) => {
  if (links.length === 0) {
    return (
      <p className="text-sm text-slate-600">{emptyMessage}</p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {links.map((link) => (
        <Link
          key={link.key}
          to={link.path}
          className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-slate-900 group-hover:text-primary">{link.label}</span>
            <span className="block text-xs text-slate-500">{link.moduleLabel}</span>
          </span>
        </Link>
      ))}
    </div>
  );
};

type DsaBalanceSummary = {
  totalMargin: number;
  marginUsed: number;
  availableMargin: number;
};

type DsaBalanceCardsProps = {
  summary: DsaBalanceSummary | null;
  loading: boolean;
  error: string | null;
};

export const DsaBalanceCards: React.FC<DsaBalanceCardsProps> = ({ summary, loading, error }) => {
  if (loading) {
    return <p className="text-sm text-slate-500">Loading your DSA balance…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }
  if (!summary) return null;

  const cards = [
    {
      label: 'Available balance',
      value: formatInrAmount(summary.availableMargin),
      hint: 'Approved limit minus margin used',
      accent: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    },
    {
      label: 'Margin used',
      value: formatInrAmount(summary.marginUsed),
      hint: 'Total across all placements',
      accent: 'border-amber-200 bg-amber-50 text-amber-800',
    },
    {
      label: 'Approved limit',
      value: formatInrAmount(summary.totalMargin),
      hint: 'Latest approved DSA limit',
      accent: 'border-sky-200 bg-sky-50 text-sky-800',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl border p-4 ${card.accent}`}>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{card.label}</p>
          <p className="mt-1 text-xl font-bold">{card.value}</p>
          <p className="mt-1 text-xs opacity-75">{card.hint}</p>
        </div>
      ))}
    </div>
  );
};

export const PartnerTipsCard: React.FC = () => (
  <ul className="space-y-3 text-sm text-slate-700">
    <li className="flex gap-2">
      <span className="mt-0.5 text-primary">●</span>
      <span>Submit pay-in requests from <strong>DSA → Limit</strong> and track approval status in real time.</span>
    </li>
    <li className="flex gap-2">
      <span className="mt-0.5 text-primary">●</span>
      <span>Upload creatives in <strong>21:9</strong> format under <strong>DSA → Media Upload</strong> — margin is shared across all slots.</span>
    </li>
    <li className="flex gap-2">
      <span className="mt-0.5 text-primary">●</span>
      <span>Need help? Contact your Blaunk relationship manager with your partner code.</span>
    </li>
  </ul>
);

export const EmployeeTipsCard: React.FC = () => (
  <ul className="space-y-3 text-sm text-slate-700">
    <li className="flex gap-2">
      <span className="mt-0.5 text-primary">●</span>
      <span>Use the sidebar to jump into your assigned modules, quick links above mirror what you can access.</span>
    </li>
    <li className="flex gap-2">
      <span className="mt-0.5 text-primary">●</span>
      <span>Update your profile and password from the account menu in the top bar.</span>
    </li>
    <li className="flex gap-2">
      <span className="mt-0.5 text-primary">●</span>
      <span>If a module is missing, ask your administrator to review your user rights.</span>
    </li>
  </ul>
);
