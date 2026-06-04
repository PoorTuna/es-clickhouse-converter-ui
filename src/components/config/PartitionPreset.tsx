import { Hint, Label } from '../ui';
import { cn } from '@/lib/cn';

type Granularity = 'yearly' | 'monthly' | 'daily' | 'hourly' | 'custom';

const PRESETS: { value: Exclude<Granularity, 'custom'>; label: string; fn: string }[] = [
  { value: 'yearly', label: 'Yearly', fn: 'toYear' },
  { value: 'monthly', label: 'Monthly', fn: 'toYYYYMM' },
  { value: 'daily', label: 'Daily', fn: 'toDate' },
  { value: 'hourly', label: 'Hourly', fn: 'toStartOfHour' },
];

const OPTIONS: { value: Granularity; label: string }[] = [
  ...PRESETS.map((p) => ({ value: p.value, label: p.label })),
  { value: 'custom', label: 'Custom' },
];

/** ClickHouse column name = ES path with dots flattened (mirrors backend
 *  `to_column_name`); the timestamp column is back-tick quoted in the expr. */
function partitionExpr(fn: string, timestampField: string): string {
  const column = timestampField.replace(/\./g, '_');
  return `${fn}(\`${column}\`)`;
}

function activeGranularity(partitionBy: string | null, timestampField: string): Granularity {
  if (!partitionBy) return 'custom';
  const match = PRESETS.find((p) => partitionBy === partitionExpr(p.fn, timestampField));
  return match?.value ?? 'custom';
}

interface PartitionPresetProps {
  partitionBy: string | null;
  timestampField: string;
  hint?: string;
  onChange: (partitionBy: string | null) => void;
}

export function PartitionPreset({
  partitionBy,
  timestampField,
  hint,
  onChange,
}: PartitionPresetProps) {
  const active = activeGranularity(partitionBy, timestampField);

  const select = (value: Granularity) => {
    if (value === 'custom') {
      onChange(null);
      return;
    }
    const preset = PRESETS.find((p) => p.value === value)!;
    onChange(partitionExpr(preset.fn, timestampField));
  };

  return (
    <div>
      <Label>Partition granularity</Label>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => select(o.value)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm transition-colors',
              o.value === active
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
