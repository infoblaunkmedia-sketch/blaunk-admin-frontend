import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { useAuth } from '../../auth/useAuth';
import { DsaSection } from './dsa/DsaSection';
import { Verifiers } from './verifiers/Verifiers';

const NO_ACCESS = (
  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
    You do not have access to this section.
  </div>
);

function SectionGuard({
  section,
  children,
}: {
  section: string;
  children: React.ReactNode;
}) {
  const { hasSection, user } = useAuth();
  if (user?.role === 'admin' || hasSection('channelPartners', section)) {
    return <>{children}</>;
  }
  return NO_ACCESS;
}

function ChannelPartnersIndexRedirect() {
  const { hasSection, user } = useAuth();
  if (user?.role === 'admin' || hasSection('channelPartners', 'dsa')) {
    return <Navigate to="dsa" replace />;
  }
  if (hasSection('channelPartners', 'verifiers')) {
    return <Navigate to="verifiers" replace />;
  }
  return NO_ACCESS;
}

export const ChannelPartnersPage: React.FC = () => (
  <ErrorBoundary>
    <Routes>
      <Route index element={<ChannelPartnersIndexRedirect />} />
      <Route
        path="dsa"
        element={
          <SectionGuard section="dsa">
            <DsaSection />
          </SectionGuard>
        }
      />
      <Route
        path="verifiers"
        element={
          <SectionGuard section="verifiers">
            <Verifiers />
          </SectionGuard>
        }
      />
    </Routes>
  </ErrorBoundary>
);
