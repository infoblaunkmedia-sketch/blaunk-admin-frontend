import React from 'react';

interface ScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical' | 'both';
}

export const ScrollContainer: React.FC<ScrollContainerProps> = ({ 
  children, 
  className = '',
  orientation = 'horizontal'
}) => {
  const orientationClasses = {
    horizontal: 'overflow-x-auto overflow-y-hidden',
    vertical: 'overflow-y-auto overflow-x-hidden',
    both: 'overflow-auto'
  };

  return (
    <div className={`${orientationClasses[orientation]} w-full rounded-sm ${className}`}>
      {children}
    </div>
  );
};
