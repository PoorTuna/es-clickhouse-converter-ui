import { cn } from '@/lib/cn';
import type { EsItemKind } from '@/api/client';

const TABS: { kind: EsItemKind; label: string }[] = [
  { kind: 'index', label: 'Indices' },
  { kind: 'datastream', label: 'Data Streams' },
  { kind: 'template', label: 'Index Templates' },
];

export function Tabs({
  active,
  onSelect,
}: {
  active: EsItemKind;
  onSelect: (kind: EsItemKind) => void;
}) {
  return (
    <nav className="flex gap-1 border-b border-ch-border" role="tablist">
      {TABS.map(({ kind, label }) => (
        <button
          key={kind}
          type="button"
          role="tab"
          aria-selected={active === kind}
          onClick={() => onSelect(kind)}
          className={cn(
            '-mb-px border-b-2 px-4 py-2 text-sm transition-colors',
            active === kind
              ? 'border-ch-yellow font-medium text-ch-text'
              : 'border-transparent text-ch-muted hover:text-ch-text',
          )}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
