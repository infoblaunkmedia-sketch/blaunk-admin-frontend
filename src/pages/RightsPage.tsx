import React from 'react';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { EmployeeDropdown } from '../components/EmployeeDropdown';
import { PermissionList, PERMISSIONS } from '../components/PermissionList';
import { PlanCharges } from '../components/PlanCharges';
import { CommissionPage } from './CommissionPage';
import { PaybankPage } from '../components/PaybankPage';
import { VoucherPage } from './VoucherPage';
import { DsaLimitCheckPage } from './DsaLimitCheckPage';
import { CompanyDetailsPage } from './CompanyDetailsPage';
import { MisReports } from '../components/MisReports';

const emptyPermissions = (): Record<string, boolean> =>
  Object.fromEntries(PERMISSIONS.map((p) => [p, false]));

export const RightsPage: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = React.useState<string>('');
  const [employeeType, setEmployeeType] = React.useState<'employee' | '3pc'>('employee');
  const [permissions, setPermissions] = React.useState<Record<string, boolean>>(emptyPermissions);
  const [rightsSaveStatus, setRightsSaveStatus] = React.useState<string | null>(null);
  const [rightsLoading, setRightsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<string>('Rights');

  const typeParam = employeeType === '3pc' ? '3pc' : 'employee';

  React.useEffect(() => {
    if (!selectedEmployee) {
      setPermissions(emptyPermissions());
      return;
    }
    setRightsLoading(true);
    setPermissions(emptyPermissions());
    setRightsLoading(false);
  }, [selectedEmployee, typeParam]);

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setPermissions((prev) => ({ ...prev, [permission]: checked }));
    setRightsSaveStatus(null);
  };

  const handleSaveRights = async () => {
    if (!selectedEmployee) {
      setRightsSaveStatus('Select an employee code first.');
      return;
    }
    setRightsSaveStatus('Rights saved locally (no server).');
  };

  const tabs = [
    'Rights',
    'Plan Charges',
    'Commission',
    'MIS',
    'Paybank',
    'Voucher',
    'DSA Limit Check',
    'Company Details',
  ];

  const renderContent = () => {
    if (activeTab === 'Rights') {
      const isSuccess = rightsSaveStatus?.toLowerCase().includes('success');
      return (
        <div className="w-full max-w-4xl">
          <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            {/* Toolbar */}
            <div className="space-y-4 border-b border-slate-200 bg-slate-50/50 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4">
                <Tabs
                  tabs={[
                    { id: 'employee', label: 'Employee Code' },
                    { id: '3pc', label: '3PC - Empl Code' }
                  ]}
                  activeTab={employeeType}
                  onChange={(id) => {
                    setEmployeeType(id);
                    setSelectedEmployee('');
                  }}
                  className="max-w-md"
                />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <EmployeeDropdown
                      label=""
                      value={selectedEmployee}
                      onChange={setSelectedEmployee}
                      type={employeeType}
                    />
                  </div>
                  <Button
                    onClick={handleSaveRights}
                    disabled={!selectedEmployee || rightsLoading}
                    className="w-full shrink-0 sm:w-auto"
                  >
                    {rightsLoading ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>

            {rightsSaveStatus ? (
              <div
                className={`border-b px-4 py-3 sm:px-5 ${
                  isSuccess
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}
              >
                <p className="text-sm font-medium">{rightsSaveStatus}</p>
              </div>
            ) : null}

            <div className="px-1 py-1 sm:px-2">
              <PermissionList
                insideContainer
                value={permissions}
                onChange={handlePermissionChange}
              />
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === 'Plan Charges') {
      return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
          <PlanCharges />
        </section>
      );
    }

    if (activeTab === 'Commission') {
      return (
        <section className="self-start w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6 md:max-w-[50%]">
          <CommissionPage />
        </section>
      );
    }

    if (activeTab === 'Paybank') {
      return (
        <section className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
          <PaybankPage />
        </section>
      );
    }

    if (activeTab === 'Voucher') {
      return (
        <section className="w-full p-0 sm:p-0">
          <VoucherPage />
        </section>
      );
    }

    if (activeTab === 'DSA Limit Check') {
      return (
        <section className="w-full p-0 sm:p-0">
          <DsaLimitCheckPage />
        </section>
      );
    }

    if (activeTab === 'Company Details') {
      return (
        <section className="w-full p-0 sm:p-0">
          <CompanyDetailsPage />
        </section>
      );
    }

    if (activeTab === 'MIS') {
      return (
        <MisReports />
      );
    }

    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-card">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">
          {activeTab}
        </h2>
        <p className="text-slate-600">
          This section is ready for integration. You can plug in the actual
          {` ${activeTab.toLowerCase()} `}data and forms here.
        </p>
      </section>
    );
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3">
      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={tabs.map(t => ({ id: t, label: t }))}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
        />
      </div>

      {/* Page title */}
      {activeTab === 'Commission' ||
      activeTab === 'Voucher' ||
      activeTab === 'DSA Limit Check' ||
      activeTab === 'Company Details' ? (
        <h1 className="sr-only">
          {activeTab === 'Voucher'
            ? 'Voucher Management'
            : activeTab === 'DSA Limit Check'
              ? 'DSA Limit Check'
              : activeTab === 'Company Details'
                ? 'Company Details'
                : 'Commission'}
        </h1>
      ) : (
        <h1 className="text-2xl font-bold text-slate-800">{activeTab}</h1>
      )}

      {renderContent()}
    </div>
  );
};

