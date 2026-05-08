import React from 'react';
import { PermissionRow } from './PermissionRow';

export const PERMISSIONS = [
  'Management',
  'Finance',
  'M & A',
  'Sales',
  'Company Secretary',
  'HR',
  'Payslip',
  'IT Dept',
  'Admin & Personnel',
  'Customer Care',
  'Retail Shop',
  'DSA',
  'Verifier',
  'RETAIL MANAGEMENT',
];

interface PermissionListProps {
  insideContainer?: boolean;
  /** Controlled: permissions state from parent (for load/save) */
  value?: Record<string, boolean>;
  /** Controlled: called when user toggles a permission */
  onChange?: (permission: string, checked: boolean) => void;
}

export const PermissionList: React.FC<PermissionListProps> = ({
  insideContainer = false,
  value,
  onChange,
}) => {
  const [internalState, setInternalState] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(PERMISSIONS.map((p) => [p, false])),
  );

  const state = value ?? internalState;
  const handleToggle = (permission: string, checked: boolean) => {
    if (onChange) {
      onChange(permission, checked);
    } else {
      setInternalState((prev) => ({ ...prev, [permission]: checked }));
    }
  };

  return (
    <div className={['flex flex-col', insideContainer ? '' : 'rounded-xl'].join(' ')}>
      {insideContainer && (
        <div className="px-3 py-2 sm:px-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Department rights
          </h3>
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        {PERMISSIONS.map((permission, index) => (
          <PermissionRow
            key={permission}
            label={permission}
            checked={state[permission] ?? false}
            onChange={(checked) => handleToggle(permission, checked)}
            isStriped={index % 2 === 1}
          />
        ))}
      </div>
    </div>
  );
};

