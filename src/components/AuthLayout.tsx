import React from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-16 items-center justify-between bg-primary px-4 shadow-navbar sm:px-6 lg:px-10">
        <span className="text-xl font-extrabold tracking-wide text-white">
          BLAUNK
        </span>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          {children}
          {footer ? (
            <div className="mt-4 text-center text-sm text-slate-600">
              {footer}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

