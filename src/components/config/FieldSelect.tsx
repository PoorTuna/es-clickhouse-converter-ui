import { useId } from 'react';
import { Hint, Input, Label } from '../ui';

interface FieldSelectProps {
  label: string;
  hint?: string;
  value: string | null;
  options: string[];
  placeholder?: string;
  onChange: (value: string | null) => void;
}

export function FieldSelect({
  label,
  hint,
  value,
  options,
  placeholder,
  onChange,
}: FieldSelectProps) {
  const listId = useId();
  return (
    <div>
      <Label>{label}</Label>
      <Input
        list={listId}
        className="font-mono"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
}
