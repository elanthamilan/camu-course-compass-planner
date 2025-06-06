// src/components/molecules/IconButton.tsx
import React from 'react';
import { Button, type ButtonProps } from '@/components/atoms/button';
import { cn } from '../../lib/utils';

interface IconButtonProps extends Omit<ButtonProps, 'children' | 'aria-label'> {
  icon: React.ElementType;
  label: string; // for aria-label
  iconClassName?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, label, variant = 'ghost', size = 'icon', className, iconClassName, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size} // This should be 'icon' for the typical use case to get correct padding from Button atom
        className={className} // Pass through className
        aria-label={label}
        {...props}
      >
        <Icon className={cn('h-4 w-4', iconClassName)} /> {/* Default icon size, can be overridden */}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
export { IconButton };
