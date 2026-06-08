/**
 * Employee department dropdown values — derived from admin sidebar navigation labels.
 * Keep in sync with `NAV_ITEMS` in `app/shell/Sidebar.tsx` (excluding Dashboard / CMS).
 */
type SidebarDeptNode = {
  label: string;
  department?: string;
  children?: { label: string; department?: string }[];
};

const SIDEBAR_DEPT_NAV: SidebarDeptNode[] = [
  { label: 'People', department: 'HR' },
  {
    label: 'Channel Partners',
    children: [
      { label: 'DSA', department: 'DSA' },
      { label: 'Verifiers', department: 'Verifier' },
    ],
  },
  { label: 'Finance', department: 'Finance' },
  { label: 'Management', department: 'Management' },
  { label: 'Sales', department: 'Sales' },
  { label: 'Customers & Care', department: 'Customer Care' },
  { label: 'Reports (MIS)', department: 'M & A' },
  { label: 'Company Secretary', department: 'Company Secretary' },
  { label: 'Admin & Personnel', department: 'Admin & Personnel' },
  { label: 'IT', department: 'IT Dept' },
  { label: 'Retail Management', department: 'RETAIL MANAGEMENT' },
];

/** Sidebar-linked items shown on employee forms but not top-level nav modules. */
const EXTRA_EMPLOYEE_DEPARTMENTS = ['Payslip', 'Retail Shop'] as const;

export function getSidebarDepartmentOptions(): string[] {
  const out: string[] = [];
  for (const item of SIDEBAR_DEPT_NAV) {
    if (item.children?.length) {
      for (const child of item.children) {
        out.push(child.department ?? child.label);
      }
    } else {
      out.push(item.department ?? item.label);
    }
  }
  for (const extra of EXTRA_EMPLOYEE_DEPARTMENTS) {
    if (!out.includes(extra)) out.push(extra);
  }
  return out;
}
