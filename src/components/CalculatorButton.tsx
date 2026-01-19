import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'number' | 'operator' | 'function';

interface CalculatorButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  children: ReactNode;
  active?: boolean;
}

export const CalculatorButton = ({ 
  variant, 
  children, 
  active = false,
  className,
  ...props 
}: CalculatorButtonProps) => {
  const baseStyles = "calc-btn w-full aspect-square rounded-2xl text-xl font-semibold flex items-center justify-center select-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";
  
  const variantStyles = {
    number: "calc-btn-number",
    operator: cn(
      "calc-btn-operator",
      active && "ring-2 ring-white/30 bg-white text-primary"
    ),
    function: "calc-btn-function"
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};
