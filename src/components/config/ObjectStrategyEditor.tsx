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
  flatten_fields: string[];
}

/** One routable object root. `detected` is the strategy ES dictates by default
 *  (plain object → flatten); `source: 'array'` (ES nested) can't become a Map. */
export interface RoutableRoot {
  path: string;
  detected: 'flatten' | 'json' | 'nested';
  source: 'object' | 'array';
}

interface ObjectStrategyEditorProps extends ObjectBuckets {
  roots: RoutableRoot[];
  hint?: string;
  onChange: (patch: Partial<ObjectBuckets>) => void;
}

function strategyOf(path: string, detected: ObjectStrategy, buckets: ObjectBuckets): ObjectStrategy {
  if (buckets.json_fields.includes(path)) return 'json';
  if (path in buckets.map_fields) return 'map';
  if (buckets.nested_fields.includes(path)) return 'nested';
  if (buckets.flatten_fields.includes(path)) return 'flatten';
  return detected;
}

/** A per-object router: each object becomes one column shaped by the chosen
 *  strategy. The ES-detected strategy is the default (no config entry); an
 *  explicit pick is stored in the matching bucket, so overriding a detected
 *  JSON/Nested root is a real, honored choice. */
export function ObjectStrategyEditor({
  roots,
  json_fields,
  map_fields,
  nested_fields,
  flatten_fields,
  hint,
  onChange,
}: ObjectStrategyEditorProps) {
  const buckets: ObjectBuckets = { json_fields, map_fields, nested_fields, flatten_fields };

  const setStrategy = (root: RoutableRoot, strategy: ObjectStrategy) => {
    const json = json_fields.filter((p) => p !== root.path);
    const nested = nested_fields.filter((p) => p !== root.path);
    const flatten = flatten_fields.filter((p) => p !== root.path);
    const map = { ...map_fields };
    const priorMapValue = map[root.path];
    delete map[root.path];

    // The detected strategy is the default — only a divergent pick is recorded.
    if (strategy !== root.detected) {
      if (strategy === 'json') json.push(root.path);
      else if (strategy === 'nested') nested.push(root.path);
      else if (strategy === 'map') map[root.path] = priorMapValue ?? 'String';
      else if (strategy === 'flatten') flatten.push(root.path);
    }

    onChange({
      json_fields: json,
      map_fields: map,
      nested_fields: nested,
      flatten_fields: flatten,
    });
  };

  return (
    <div>
      <Label>Object fields</Label>
      <div className="space-y-2">
        {roots.map((root) => {
          const current = strategyOf(root.path, root.detected, buckets);
          const options =
            root.source === 'array' ? STRATEGIES.filter((s) => s.value !== 'map') : STRATEGIES;
          return (
            <div key={root.path} className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm text-ch-text">
                {root.path}
                {root.detected !== 'flatten' && (
                  <span className="ml-2 text-xs text-ch-muted">ES: {root.detected}</span>
                )}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {options.map((s) => (
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
