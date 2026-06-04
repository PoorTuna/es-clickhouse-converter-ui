import { Hint, Label } from '../ui';
import { cn } from '@/lib/cn';

export type ObjectStrategy = 'flatten' | 'json' | 'map' | 'nested';

const STRATEGIES: { value: ObjectStrategy; label: string }[] = [
  { value: 'flatten', label: 'Flatten' },
  { value: 'json', label: 'JSON' },
  { value: 'map', label: 'Map' },
  { value: 'nested', label: 'Nested' },
];

interface ObjectBuckets {
  json_fields: string[];
  map_fields: Record<string, string>;
  nested_fields: string[];
}

interface ObjectStrategyEditorProps extends ObjectBuckets {
  objectRoots: string[];
  hint?: string;
  onChange: (patch: Partial<ObjectBuckets>) => void;
}

function strategyOf(root: string, buckets: ObjectBuckets): ObjectStrategy {
  if (buckets.json_fields.includes(root)) return 'json';
  if (root in buckets.map_fields) return 'map';
  if (buckets.nested_fields.includes(root)) return 'nested';
  return 'flatten';
}

/** A per-object router: each plain object becomes one column shaped by the
 *  chosen strategy. Flatten (default) keeps the legacy `root_child` columns. */
export function ObjectStrategyEditor({
  objectRoots,
  json_fields,
  map_fields,
  nested_fields,
  hint,
  onChange,
}: ObjectStrategyEditorProps) {
  const buckets: ObjectBuckets = { json_fields, map_fields, nested_fields };

  const setStrategy = (root: string, strategy: ObjectStrategy) => {
    const json = json_fields.filter((p) => p !== root);
    const nested = nested_fields.filter((p) => p !== root);
    const map = { ...map_fields };
    const priorMapValue = map[root];
    delete map[root];

    if (strategy === 'json') json.push(root);
    if (strategy === 'nested') nested.push(root);
    if (strategy === 'map') map[root] = priorMapValue ?? 'String';

    onChange({ json_fields: json, map_fields: map, nested_fields: nested });
  };

  return (
    <div>
      <Label>Object fields</Label>
      <div className="space-y-2">
        {objectRoots.map((root) => {
          const current = strategyOf(root, buckets);
          return (
            <div key={root} className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm text-ch-text">{root}</span>
              <div className="flex flex-wrap gap-1.5">
                {STRATEGIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStrategy(root, s.value)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs transition-colors',
                      s.value === current
                        ? 'border-ch-yellow bg-ch-yellow/15 text-ch-yellow'
                        : 'border-ch-border text-ch-muted hover:bg-ch-panel-2',
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
}
