import { useId, useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Hint, Input, Label } from '../ui';

interface StringListInputProps {
  label: string;
  hint?: string;
  values: string[];
  options?: string[];
  placeholder?: string;
  onChange: (values: string[]) => void;
}

export function StringListInput({
  label,
  hint,
  values,
  options = [],
  placeholder,
  onChange,
}: StringListInputProps) {
  const [draft, setDraft] = useState('');
  const listId = useId();

  const add = (raw: string) => {
    const v = raw.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };
  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      remove(values[values.length - 1]);
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      {values.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md border border-ch-yellow/40 bg-ch-yellow/10 px-2 py-0.5 font-mono text-xs text-ch-yellow"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="text-ch-yellow/70 hover:text-ch-yellow"
                aria-label={`Remove ${v}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        list={options.length ? listId : undefined}
        value={draft}
        placeholder={placeholder ?? 'Type a field, Enter to add'}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft && add(draft)}
      />
      {options.length > 0 && (
        <datalist id={listId}>
          {options.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      )}
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
}
