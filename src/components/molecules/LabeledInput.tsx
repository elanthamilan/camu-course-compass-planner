// src/components/molecules/LabeledInput.tsx
import React from 'react';
import { Input, type InputProps } from '@/components/atoms/input'; // Adjusted path
import { Label } from '@/components/atoms/label'; // Adjusted path
import { cn } from '@/lib/utils';

interface LabeledInputProps {
  id: string;
  label: string;
  inputProps?: InputProps;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  containerClassName?: string;
  error?: string;
}

const LabeledInput = React.forwardRef<HTMLInputElement, LabeledInputProps>(
  ({ id, label, inputProps, labelProps, containerClassName, error }, ref) => {
    return (
      <div className={cn('grid w-full max-w-sm items-center gap-1.5', containerClassName)}>
        <Label htmlFor={id} {...labelProps}>
          {label}
        </Label>
        <Input ref={ref} id={id} {...inputProps} />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);

LabeledInput.displayName = 'LabeledInput';
export { LabeledInput };
