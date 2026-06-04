import { Hint, Label } from '../ui';
import { cn } from '@/lib/cn';

interface NumberSelectProps<T extends number> {
  label: string;
  hint?: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function NumberSelect<T extends number>({
  label,
  hint,
  value,
  options,
  onChange,
}: NumberSelectProps<T>) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm transition-colors',
              o.value === value
                ? 'border-ch-yellow bg-ch-yellow/15 text-ch-yellow'
                : 'border-ch-border text-ch-muted hover:bg-ch-panel-2',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
}
