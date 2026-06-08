import React from 'react';

const BlaunkLogo = '/blaunk_logo.png';

type Props = {
  title: string;
};

/** Logo left, title centered on same row; single rule below both. */
export const AnnualReportHeader: React.FC<Props> = ({ title }) => (
  <div className="mb-4">
    <div className="relative flex min-h-[2.75rem] items-center justify-center pb-3">
      <img
        src={BlaunkLogo}
        alt="Blaunk"
        className="absolute left-0 top-1/2 h-9 w-auto -translate-y-1/2 object-contain sm:h-10"
        crossOrigin="anonymous"
      />
      <h2 className="px-20 text-center text-[11px] font-bold uppercase leading-tight tracking-wide text-black sm:text-xs">
        {title}
      </h2>
    </div>
    <div className="border-b border-[#9a9a9a]" />
  </div>
);
