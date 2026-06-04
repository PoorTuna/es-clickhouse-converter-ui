import { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Hint, Input, Label } from '../ui';

interface KeyValueEditorProps {
  label: string;
  hint?: string;
  value: Record<string, string>;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  keyOptions?: string[];
  onChange: (value: Record<string, string>) => void;
}

/** Edits a Record<string,string> as an ordered list of rows. */
export function KeyValueEditor({
  label,
  hint,
  value,
  keyPlaceholder = 'field',
  valuePlaceholder = 'value',
  keyOptions = [],
  onChange,
}: KeyValueEditorProps) {
  const listId = useId();
  const rows = Object.entries(value);

  const commit = (next: [string, string][]) => {
    const obj: Record<string, string> = {};
    for (const [k, v] of next) if (k) obj[k] = v;
    onChange(obj);
  };

  const updateKey = (i: number, k: string) => {
    const next = rows.slice();
    next[i] = [k, next[i][1]];
    commit(next);
  };
  const updateVal = (i: number, v: string) => {
    const next = rows.slice();
    next[i] = [next[i][0], v];
    commit(next);
  };
  const removeRow = (i: number) => commit(rows.filter((_, idx) => idx !== i));
  const addRow = () => onChange({ ...value, '': '' });

  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-2">
        {rows.map(([k, v], i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              list={keyOptions.length ? listId : undefined}
              className="font-mono"
              placeholder={keyPlaceholder}
              value={k}
              onChange={(e) => updateKey(i, e.target.value)}
            />
            <span className="text-ch-muted">→</span>
            <Input
              className="font-mono"
              placeholder={valuePlaceholder}
              value={v}
              onChange={(e) => updateVal(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="shrink-0 rounded-md p-2 text-ch-muted hover:bg-ch-panel-2 hover:text-ch-danger"
              aria-label="Remove row"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      {keyOptions.length > 0 && (
        <datalist id={listId}>
          {keyOptions.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      )}
      <Button variant="ghost" className="mt-2 px-2" onClick={addRow}>
        <Plus size={15} /> Add
      </Button>
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
}
