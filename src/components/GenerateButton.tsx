import React from 'react';
import { Button } from './Button';

interface GenerateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  isFullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({ 
  label = 'Generate Report', 
  isFullWidth = false,
  size = 'md',
  variant = 'primary',
  ...props 
}) => {
  return (
    <Button 
      variant={variant}
      size={size}
      isFullWidth={isFullWidth}
      {...props}
    >
      {label}
    </Button>
  );
};
