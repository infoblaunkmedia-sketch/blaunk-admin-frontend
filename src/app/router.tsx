import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Shell } from './shell/Shell';
import { Login } from '../auth/Login';
import { AdminLogin } from '../auth/AdminLogin';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import {
  WorkspaceContractorGate,
  WorkspaceEmployeeGate,
  WorkspaceIndexRedirect,
} from '../auth/WorkspaceGates';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { MarketingRedirects } from './MarketingRedirects';
import { LegacyModulePathRedirect } from './LegacyModuleRedirects';

// Auth pages
const ForgotPassword = React.lazy(() =>
  import('../pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPassword = React.lazy(() =>
  import('../pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const ProfilePage = React.lazy(() =>
  import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);

// Module layouts (each handles its own sub-routing internally)
const Dashboard = React.lazy(() =>
  import('../modules/dashboard/index').then((m) => ({ default: m.DashboardPage }))
);
const CmsPage = React.lazy(() =>
  import('../modules/cms/index').then((m) => ({ default: m.CmsPage }))
);
const PeoplePage = React.lazy(() =>
  import('../modules/people/index').then((m) => ({ default: m.PeoplePage }))
);
const ChannelPartnersPage = React.lazy(() =>
  import('../modules/channelPartners/index').then((m) => ({ default: m.ChannelPartnersPage }))
);
const FinancePage = React.lazy(() =>
  import('../modules/finance/index').then((m) => ({ default: m.FinancePage }))
);
const ManagementPage = React.lazy(() =>
  import('../modules/platform/index').then((m) => ({ default: m.ManagementPage }))
);
const SalesPage = React.lazy(() =>
  import('../modules/sales/index').then((m) => ({ default: m.SalesPage }))
);
const ItPage = React.lazy(() =>
  import('../modules/it/index').then((m) => ({ default: m.ItPage }))
);
const CustomersPage = React.lazy(() =>
  import('../modules/customers/index').then((m) => ({ default: m.CustomersPage }))
);
const ReportsPage = React.lazy(() =>
  import('../modules/reports/index').then((m) => ({ default: m.ReportsPage }))
);
const CorporatePage = React.lazy(() =>
  import('../modules/corporate/index').then((m) => ({ default: m.CorporatePage }))
);
const RetailManagementPage = React.lazy(() =>
  import('../modules/retailManagement/index').then((m) => ({ default: m.RetailManagementPage }))
);
const AdminPersonnelPage = React.lazy(() =>
  import('../modules/adminPersonnel/index').then((m) => ({ default: m.AdminPersonnelPage }))
);
const EmployeeWorkspacePage = React.lazy(() =>
  import('../modules/dashboard/EmployeeWorkspace').then((m) => ({ default: m.EmployeeWorkspacePage }))
);
const ContractorWorkspacePage = React.lazy(() =>
  import('../modules/dashboard/ContractorWorkspace').then((m) => ({ default: m.ContractorWorkspacePage }))
);
const MyPayslipPage = React.lazy(() =>
  import('../modules/payslip/MyPayslip').then((m) => ({ default: m.MyPayslipPage }))
);

const Suspensed: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <React.Suspense
    fallback={
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }
  >
    {children}
  </React.Suspense>
);

const Forbidden: React.FC = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
    <p className="text-5xl font-bold text-primary">403</p>
    <p className="text-lg font-semibold text-slate-700">Access Denied</p>
    <p className="text-sm text-slate-500">You don't have permission to view this page.</p>
  </div>
);

const NotFound: React.FC = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
    <p className="text-5xl font-bold text-primary">404</p>
    <p className="text-lg font-semibold text-slate-700">Page Not Found</p>
  </div>
);

// Builds a route that matches both /path and /path/* so internal <Routes> work
function moduleRoute(
  path: string,
  Component: React.LazyExoticComponent<React.FC>,
  permission: string,
) {
  const element = (
    <Suspensed>
      <Component />
    </Suspensed>
  );
  return {
    path,
    element: <ProtectedRoute requiredPermission={permission as never} />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element },
      { path: '*', element },
    ],
  };
}

/** Admin-only KPI dashboard at `/dashboard` (not driven by module rights). */
function adminDashboardRoute(path: string, Component: React.LazyExoticComponent<React.FC>) {
  const element = (
    <Suspensed>
      <Component />
    </Suspensed>
  );
  return {
    path,
    element: <ProtectedRoute requireAdmin />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element },
      { path: '*', element },
    ],
  };
}

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <Login /> },
  { path: '/admin-login', element: <AdminLogin /> },
  {
    path: '/forgot-password',
    element: <Suspensed><ForgotPassword /></Suspensed>,
  },
  {
    path: '/reset-password',
    element: <Suspensed><ResetPassword /></Suspensed>,
  },
  { path: '/403', element: <Forbidden /> },

  // Authenticated shell
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <Shell />,
        children: [
          { index: true, element: <WorkspaceIndexRedirect /> },

          adminDashboardRoute('/dashboard', Dashboard),
          moduleRoute('/cms', CmsPage, 'cms'),
          moduleRoute('/people', PeoplePage, 'people'),
          moduleRoute('/channel-partners', ChannelPartnersPage, 'channelPartners'),
          moduleRoute('/finance', FinancePage, 'finance'),
          moduleRoute('/management', ManagementPage, 'platform'),
          { path: '/platform', element: <LegacyModulePathRedirect /> },
          { path: '/platform/*', element: <LegacyModulePathRedirect /> },
          { path: '/settings', element: <LegacyModulePathRedirect /> },
          { path: '/settings/*', element: <LegacyModulePathRedirect /> },
          { path: '/marketing', element: <MarketingRedirects /> },
          { path: '/marketing/*', element: <MarketingRedirects /> },
          moduleRoute('/sales', SalesPage, 'sales'),
          { path: '/payslip', element: <Navigate to="/my-payslip" replace /> },
          {
            path: '/my-payslip',
            element: (
              <Suspensed>
                <MyPayslipPage />
              </Suspensed>
            ),
          },
          moduleRoute('/it', ItPage, 'it'),
          moduleRoute('/customers', CustomersPage, 'customers'),
          moduleRoute('/reports', ReportsPage, 'reports'),
          moduleRoute('/corporate', CorporatePage, 'corporate'),
          moduleRoute('/admin-personnel', AdminPersonnelPage, 'adminPersonnel'),
          moduleRoute('/retail-management', RetailManagementPage, 'retailManagement'),
          {
            path: '/profile',
            element: (
              <Suspensed>
                <ProfilePage />
              </Suspensed>
            ),
          },

          {
            path: 'home',
            element: <Outlet />,
            children: [
              {
                path: 'employee',
                element: (
                  <Suspensed>
                    <WorkspaceEmployeeGate>
                      <EmployeeWorkspacePage />
                    </WorkspaceEmployeeGate>
                  </Suspensed>
                ),
              },
              {
                path: 'contractor',
                element: (
                  <Suspensed>
                    <WorkspaceContractorGate>
                      <ContractorWorkspacePage />
                    </WorkspaceContractorGate>
                  </Suspensed>
                ),
              },
            ],
          },

          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);
