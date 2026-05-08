import React from 'react';

const MENU_ITEMS = [
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
] as const;

export type MenuItem = (typeof MENU_ITEMS)[number];

interface SidebarProps {
  activeMenu: MenuItem | string;
  onChangeActive: (item: MenuItem) => void;
  /** If provided and non-empty, only these sections are shown. Otherwise all. */
  allowedSections?: string[] | null;
  /** On mobile: when true, sidebar is visible. Ignored on sm+. */
  open?: boolean;
  /** Called when user taps backdrop (mobile) or to close after selection. */
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  onChangeActive,
  allowedSections,
  open = false,
  onClose,
}) => {
  const items =
    allowedSections == null
      ? [...MENU_ITEMS]
      : MENU_ITEMS.filter((item) => allowedSections.includes(item));

  const handleItemClick = (item: MenuItem) => {
    onChangeActive(item);
    onClose?.();
  };

  return (
    <>
      {open && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-10 bg-black/40 sm:hidden"
          aria-label="Close menu"
        />
      )}
      <aside
        className={[
          'fixed left-0 top-0 z-20 flex h-full w-60 flex-col overflow-y-auto border-r border-slate-200 bg-[#eceff3] shadow-xl transition-transform duration-200 ease-out',
          'sm:inset-y-16 sm:h-[calc(100vh-4rem)] sm:shadow-lg',
          open ? 'translate-x-0' : '-translate-x-full sm:translate-x-0',
        ].join(' ')}
      >
        <nav className="module-uppercase flex flex-1 flex-col gap-1.5 px-3 py-5 sm:py-4">
          {items.map((item) => {
            const isActive = item === activeMenu;
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleItemClick(item)}
                className={[
                  'flex w-full items-center rounded-sm border px-3 py-2.5 text-left text-sm font-semibold leading-snug transition sm:py-2 sm:text-[15px]',
                  isActive
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-slate-200/80 bg-white text-slate-700 shadow-sm hover:border-primary/40 hover:bg-white',
                ].join(' ')}
              >
                {item}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

