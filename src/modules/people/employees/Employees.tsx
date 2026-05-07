import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { EmployeeForm } from './EmployeeForm';
import type { Employee } from '../people.types';
import { fetchEmployees, deleteEmployee, generateEmployeeCode } from '../people.service';

function IconEye({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEdit({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export const Employees: React.FC = () => {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [view, setView] = React.useState<'list' | 'form'>('list');
  const [editing, setEditing] = React.useState<Partial<Employee> | null>(null);
  const [newCode, setNewCode] = React.useState('');
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  const load = React.useCallback(async () => {
    setLoading(true);
    const data = await fetchEmployees();
    setEmployees(data);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleNew = async () => {
    const code = await generateEmployeeCode(employees);
    setNewCode(code);
    setEditing(null);
    setView('form');
  };

  const handleEdit = (emp: Employee) => {
    setEditing(emp);
    setNewCode(emp.employeeCode);
    setView('form');
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    const pan = employees.find((e) => e.employeeCode === confirmDel)?.panNumber;
    if (!pan) return;
    await deleteEmployee(pan);
    setConfirmDel(null);
    load();
  };

  const columns: TableColumn<Employee>[] = [
    { name: 'Code', selector: (r) => r.employeeCode, sortable: true, width: '100px' },
    { name: 'Name', selector: (r) => r.fullName, sortable: true, grow: 2 },
    { name: 'Department', selector: (r) => r.department, sortable: true },
    { name: 'Designation', selector: (r) => r.designation, sortable: true },
    { name: 'DOJ', selector: (r) => r.dateOfJoining, sortable: true, width: '110px' },
    {
      name: 'Status',
      cell: (r) => <StatusBadge status={r.status} />,
      width: '100px',
    },
    {
      name: 'Monthly CTC',
      selector: (r) => r.monthlyCtc,
      sortable: true,
      format: (r) => `₹${r.monthlyCtc.toLocaleString()}`,
      width: '130px',
    },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/people/employees/${encodeURIComponent(r.panNumber)}`)}
            className="rounded border border-slate-200 p-1.5 text-slate-700 transition hover:bg-slate-50"
            title="View"
            aria-label="View employee"
          >
            <IconEye />
          </button>
          <button
            type="button"
            onClick={() => handleEdit(r)}
            className="rounded border border-slate-200 p-1.5 text-primary transition hover:bg-slate-50"
            title="Edit"
            aria-label="Edit employee"
          >
            <IconEdit />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDel(r.employeeCode)}
            className="rounded border border-slate-200 p-1.5 text-red-600 transition hover:bg-red-50"
            title="Delete"
            aria-label="Delete employee"
          >
            <IconTrash />
          </button>
        </div>
      ),
      width: '140px',
      ignoreRowClick: true,
    },
  ];

  if (view === 'form') {
    return (
      <ErrorBoundary>
        <EmployeeForm
          initial={editing ?? {}}
          employeeCode={newCode}
          onSaved={() => { setView('list'); load(); }}
          onCancel={() => setView('list')}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <PageHeader
        title="Employees"
        subtitle="Manage employee records, salary, and documents."
        actions={[{ label: '+ New Employee', onClick: handleNew }]}
      />
      <DataTableWrapper
        columns={columns}
        data={employees}
        loading={loading}
        searchable
      />
      {confirmDel && (
        <ConfirmDialog
          title="Delete Employee"
          message={`Delete employee ${confirmDel}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </ErrorBoundary>
  );
};
