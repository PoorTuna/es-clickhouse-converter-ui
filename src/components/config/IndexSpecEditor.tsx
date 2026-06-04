import { Plus, Trash2 } from 'lucide-react';
import { Button, Hint, Input, Label } from '../ui';
import type { IndexSpec } from '@/store/wizardStore';

interface IndexSpecEditorProps {
  value: IndexSpec[];
  hint?: string;
  onChange: (value: IndexSpec[]) => void;
}

const EMPTY: IndexSpec = { name: '', expr: '', type: 'bloom_filter', granularity: 1 };

export function IndexSpecEditor({ value, hint, onChange }: IndexSpecEditorProps) {
  const update = (i: number, patch: Partial<IndexSpec>) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, { ...EMPTY }]);

  return (
    <div>
      <Label>Skip indexes</Label>
      <div className="space-y-3">
        {value.map((row, i) => (
          <div key={i} className="rounded-lg border border-ch-border bg-ch-bg p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-ch-muted">Index #{i + 1}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded-md p-1.5 text-ch-muted hover:bg-ch-panel-2 hover:text-ch-danger"
                aria-label="Remove index"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="name"
                value={row.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              <Input
                placeholder="type e.g. tokenbf_v1(30720, 3, 0)"
                className="font-mono"
                value={row.type}
                onChange={(e) => update(i, { type: e.target.value })}
              />
              <Input
                placeholder="expr e.g. message"
                className="font-mono"
                value={row.expr}
                onChange={(e) => update(i, { expr: e.target.value })}
              />
              <Input
                type="number"
                min={1}
                placeholder="granularity"
                value={row.granularity}
                onChange={(e) =>
                  update(i, { granularity: Math.max(1, Number(e.target.value) || 1) })
                }
              />
            </div>
          </div>
        ))}
      </div>
      <Button variant="ghost" className="mt-2 px-2" onClick={add}>
        <Plus size={15} /> Add index
      </Button>
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
}
