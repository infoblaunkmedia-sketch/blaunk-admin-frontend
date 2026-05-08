import React from 'react';
import { ScrollContainer } from './ScrollContainer';

interface ReportFiltersProps {
  columns: string[];
  children: React.ReactNode;
  gridTemplate?: string;
  minWidth?: string;
  paddingY?: string;
  gap?: string;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({ 
  columns, 
  children,
  gridTemplate,
  minWidth,
  paddingY = 'py-10',
  gap = 'gap-x-4'
}) => {
  // Use a default grid if none provided
  const defaultGrid = `repeat(${columns.length}, 1fr)`;
  const finalGrid = gridTemplate || defaultGrid;

  return (
    <ScrollContainer className="border border-slate-200 bg-white shadow-sm overflow-x-auto">
      <div className="w-fit min-w-full">
        {/* Header Row */}
        <div 
          className={`grid bg-primary px-6 py-4 text-base font-bold text-white ${gap}`}
          style={{ 
            gridTemplateColumns: finalGrid.includes('minmax') ? finalGrid : finalGrid.replace(/(\d*\.?\d+)fr/g, 'minmax(150px, $1fr)') 
          }}
        >
          {columns.map((col, idx) => (
            <div key={idx} className="flex items-center whitespace-nowrap">
              {col}
            </div>
          ))}
        </div>

        {/* Input/Action Row */}
        <div 
          className={`grid items-center bg-white px-6 ${gap} ${paddingY}`}
          style={{ 
            gridTemplateColumns: finalGrid.includes('minmax') ? finalGrid : finalGrid.replace(/(\d*\.?\d+)fr/g, 'minmax(150px, $1fr)')
          }}
        >
          {React.Children.map(children, (child, idx) => (
            <div className="w-full">
              {child}
            </div>
          ))}
        </div>
      </div>
    </ScrollContainer>
  );
};
export default ReportFilters;
