import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card } from '../ui';

interface ConfigSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function ConfigSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: ConfigSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-ch-panel-2"
      >
        <span>
          <span className="block text-sm font-semibold text-ch-text">{title}</span>
          {subtitle && <span className="block text-xs text-ch-muted">{subtitle}</span>}
        </span>
        <ChevronDown
          size={18}
          className={cn('text-ch-muted transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && <div className="space-y-5 border-t border-ch-border px-5 py-5">{children}</div>}
    </Card>
  );
}
