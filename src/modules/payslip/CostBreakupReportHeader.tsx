import React from 'react';

const BlaunkLogo = '/blaunk_logo.png';

/** Header for all-employee cost break-up only (not individual monthly/yearly payslips). */
export const CostBreakupReportHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="mb-4">
    <div className="flex items-center gap-3 border-b border-[#9a9a9a] pb-3">
      <img
        src={BlaunkLogo}
        alt="Blaunk"
        className="h-7 w-auto max-w-[5.5rem] shrink-0 object-contain object-left sm:h-8 sm:max-w-[6rem]"
        crossOrigin="anonymous"
      />
      <h2 className="min-w-0 flex-1 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-black sm:text-[11px]">
        {title}
      </h2>
      <div className="hidden w-[5.5rem] shrink-0 sm:block sm:w-[6rem]" aria-hidden />
    </div>
  </div>
);
