import React from 'react';
import ReportFilters from './ReportFilters';
import { Input } from './Input';
import { Select } from './Select';
import { GenerateButton } from './GenerateButton';

export const MisReports: React.FC = () => {
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [department, setDepartment] = React.useState('DSA');
  const [dataScope, setDataScope] = React.useState('All');
  const [reportType, setReportType] = React.useState('');
  const [format] = React.useState('Excel');

  const handleGenerate = () => {
    // TODO: hook to real MIS report API
    console.log({ fromDate, toDate, department, dataScope, reportType, format });
  };

  return (
    <div className="w-full">
      <h2 className="mb-4 text-3xl font-bold text-primary">MIS Reports</h2>
      <ReportFilters
        columns={['From Date', 'To Date', 'Department', 'Data', 'Report Type', 'Output Format', 'Actions']}
        gridTemplate="1fr 1fr 1fr 0.9fr 1fr 1fr 0.9fr"
        paddingY="py-4"
        gap="gap-x-2"
      >
        <div className="px-1">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="px-1">
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="px-1">
          <Select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            isReadOnly
            options={[
              { value: 'DSA', label: 'DSA' },
              { value: 'Sales', label: 'Sales' },
              { value: 'HR', label: 'HR' }
            ]}
          />
        </div>
        <div className="px-1">
          <Select
            value={dataScope}
            onChange={(e) => setDataScope(e.target.value)}
            isReadOnly
            options={[
              { value: 'All', label: 'All' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' }
            ]}
          />
        </div>
        <div className="px-1">
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: '', label: 'Select Report' },
              { value: 'mis-dsa-pay', label: 'MIS - DSA Pay' },
              { value: 'mis-dsa-sales', label: 'MIS - DSA Sales' },
              { value: 'mis-dsa-ads', label: 'MIS - DSA Ads' }
            ]}
          />
        </div>
        <div className="px-1">
          <Input isReadOnly value={format} />
        </div>
        <div className="px-1">
          <GenerateButton onClick={handleGenerate} isFullWidth size="md" />
        </div>
      </ReportFilters>
    </div>
  );
};

