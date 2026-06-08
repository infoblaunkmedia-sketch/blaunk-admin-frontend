import React from 'react';
import { getSidebarDepartmentOptions } from '../constants/sidebarDepartments';

type Props = {
  placeholder?: string;
};

/** Renders `<option>` elements for employee department dropdowns (sidebar-aligned). */
export const DepartmentSelectOptions: React.FC<Props> = ({ placeholder = 'Select' }) => (
  <>
    <option value="">{placeholder}</option>
    {getSidebarDepartmentOptions().map((dept) => (
      <option key={dept} value={dept}>
        {dept}
      </option>
    ))}
  </>
);
