import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RightsPage } from './pages/RightsPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ShareholdingPage } from './pages/ShareholdingPage';
import { EmployeeCredentialsPage } from './pages/EmployeeCredentialsPage';
import { CaptchaPage } from './pages/CaptchaPage';
import { AdminPersonnelPage } from './pages/AdminPersonnelPage';
import { FinancePage } from './pages/FinancePage';
import { MAUploadPage } from './pages/MAUploadPage';
import { SalesPage } from './pages/SalesPage';
import { PayslipDashboardPage } from './pages/PayslipDashboardPage';
import { CustomerCarePage } from './pages/CustomerCarePage';
import { RetailShopPage } from './pages/RetailShopPage';
import { DsaPage } from './pages/DsaPage';
import { VerifierPage } from './pages/VerifierPage';
import { RetailManagementPage } from './pages/RetailManagementPage';

const AppShell: React.FC = () => {
  const [activeMenu, setActiveMenu] = React.useState<string>('Management');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const renderContent = () => {
    if (activeMenu === 'Company Secretary') {
      return <ShareholdingPage />;
    }
    if (activeMenu === 'HR') {
      return <EmployeeCredentialsPage />;
    }
    if (activeMenu === 'IT Dept') {
      return <CaptchaPage />;
    }
    if (activeMenu === 'Admin & Personnel') {
      return <AdminPersonnelPage />;
    }
    if (activeMenu === 'Finance') {
      return <FinancePage />;
    }
    if (activeMenu === 'M & A') {
      return <MAUploadPage />;
    }
    if (activeMenu === 'Sales') {
      return <SalesPage />;
    }
    if (activeMenu === 'Payslip') {
      return <PayslipDashboardPage />;
    }
    if (activeMenu === 'Customer Care') {
      return <CustomerCarePage />;
    }
    if (activeMenu === 'Retail Shop') {
      return <RetailShopPage />;
    }
    if (activeMenu === 'DSA') {
      return <DsaPage />;
    }
    if (activeMenu === 'Verifier') {
      return <VerifierPage />;
    }
    if (activeMenu === 'RETAIL MANAGEMENT') {
      return <RetailManagementPage />;
    }
    return <RightsPage />;
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex flex-1 pt-16">
        <Sidebar
          activeMenu={activeMenu}
          onChangeActive={setActiveMenu}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="ml-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:ml-60 sm:px-6 lg:px-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function ProtectedShell() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <AppShell />;
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/" element={<ProtectedShell />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
