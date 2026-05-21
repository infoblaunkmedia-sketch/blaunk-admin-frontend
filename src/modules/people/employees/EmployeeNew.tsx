import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { EmployeeForm } from './EmployeeForm';
import { generateEmployeeCode } from '../people.service';

export const EmployeeNew: React.FC = () => {
  const navigate = useNavigate();
  const [employeeCode, setEmployeeCode] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const code = await generateEmployeeCode();
        if (mounted) setEmployeeCode(code);
      } catch (e) {
        if (mounted) {
          toast.error(e instanceof Error ? e.message : 'Failed to generate employee code.');
          navigate('/people/employees', { replace: true });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading || !employeeCode) {
    return (
      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <p className="text-sm font-semibold text-slate-600">Preparing new employee form…</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <EmployeeForm
        initial={{}}
        employeeCode={employeeCode}
        onSaved={() => navigate('/people/employees')}
        onCancel={() => navigate('/people/employees')}
      />
    </ErrorBoundary>
  );
};
