import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { STEP_ORDER, useWizardStore, type Step } from '@/store/wizardStore';

const LABELS: Record<Step, string> = {
  input: 'Input',
  config: 'Configure',
  result: 'Result',
};

export function Stepper() {
  const step = useWizardStore((s) => s.step);
  const current = STEP_ORDER.indexOf(step);

  return (
    <nav className="mx-auto flex max-w-5xl items-center justify-center gap-2 px-6 py-5">
      {STEP_ORDER.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  active && 'border-ch-yellow bg-ch-yellow text-black',
                  done && 'border-ch-yellow/60 bg-ch-yellow/20 text-ch-yellow',
                  !active && !done && 'border-ch-border text-ch-muted',
                )}
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cn(
                  'text-sm',
                  active ? 'font-medium text-ch-text' : 'text-ch-muted',
                )}
              >
                {LABELS[s]}
              </span>
            </div>
            {i < STEP_ORDER.length - 1 && (
              <span
                className={cn(
                  'mx-2 h-px w-10 transition-colors',
                  i < current ? 'bg-ch-yellow/60' : 'bg-ch-border',
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
