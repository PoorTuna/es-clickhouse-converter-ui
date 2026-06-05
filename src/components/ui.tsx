import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'ghost' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-ch-yellow text-black font-semibold hover:bg-ch-yellow-dim disabled:opacity-40 disabled:cursor-not-allowed',
  ghost: 'text-ch-text hover:bg-ch-panel-2 disabled:opacity-40',
  outline:
    'border border-ch-border text-ch-text hover:bg-ch-panel-2 disabled:opacity-40 disabled:cursor-not-allowed',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'outline', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ch-yellow/60',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-xl border border-ch-border bg-ch-panel shadow-panel', className)}>
      {children}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-md border border-ch-border bg-ch-bg px-3 py-2 text-sm text-ch-text placeholder:text-ch-muted',
        'focus:outline-none focus:ring-2 focus:ring-ch-yellow/50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ch-text">
      {children}
    </label>
  );
}

export function Hint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1 text-xs text-ch-muted">
      {children}
    </p>
  );
}
