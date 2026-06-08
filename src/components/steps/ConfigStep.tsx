import { useMemo } from 'react';
import { ConfigSection } from '../config/ConfigSection';
import { ConfigTierSorting } from '../config/ConfigTierSorting';
import { ConfigTierTypes } from '../config/ConfigTierTypes';
import { ConfigTierCodecs } from '../config/ConfigTierCodecs';
import { ConfigTierEngine } from '../config/ConfigTierEngine';
import { ObjectStrategyEditor, type RoutableRoot } from '../config/ObjectStrategyEditor';
import { fieldsFromText } from '@/lib/extractFields';
import { useWizardStore } from '@/store/wizardStore';

export function ConfigStep() {
  const { mappingText, config, patchConfig, importNotes } = useWizardStore();
  const { paths, dateFields, objectRoots, jsonRoots, nestedRoots } = useMemo(
    () => fieldsFromText(mappingText),
    [mappingText],
  );
  const timestampField = config.timestamp_field ?? dateFields[0] ?? '@timestamp';
  // Object roots are the real targets of JSON/Map/type routing, but never land
  // in `paths` (only their leaves do) — offer both so `product` autocompletes.
  const rootOptions = [...objectRoots, ...jsonRoots, ...nestedRoots, ...paths];
  // One routable row per object root, pre-set to the strategy ES dictates.
  const routableRoots: RoutableRoot[] = [
    ...objectRoots.map((path) => ({
      path,
      detected: 'flatten' as const,
      source: 'object' as const,
    })),
    ...jsonRoots.map((path) => ({ path, detected: 'json' as const, source: 'object' as const })),
    ...nestedRoots.map((path) => ({ path, detected: 'nested' as const, source: 'array' as const })),
  ];
  const hasObjectRoots = routableRoots.length > 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-ch-muted">
        All knobs are optional — leave them blank to let the converter choose. Field names
        autocomplete from your mapping.
      </p>

      {importNotes.length > 0 && (
        <div className="rounded-md border border-ch-suggestion/40 bg-ch-suggestion/10 p-3">
          <p className="mb-1 text-xs font-medium text-ch-suggestion">
            From the imported ILM policy
          </p>
          <ul className="list-disc space-y-0.5 pl-5 text-xs text-ch-text">
            {importNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      <ConfigTierSorting
        config={config}
        patchConfig={patchConfig}
        paths={paths}
        dateFields={dateFields}
        timestampField={timestampField}
      />

      {hasObjectRoots && (
        <ConfigSection
          title="Object fields"
          subtitle="How nested objects become columns"
          defaultOpen
        >
          <ObjectStrategyEditor
            roots={routableRoots}
            json_fields={config.json_fields}
            map_fields={config.map_fields}
            nested_fields={config.nested_fields}
            flatten_fields={config.flatten_fields}
            hint="ES-detected routing (JSON/Nested) is the default — override it freely. Flatten -> root_child columns. JSON -> one JSON column (typed hints, stays dynamic). Map -> Map(String, …). Nested -> parallel arrays."
            onChange={(patch) => patchConfig(patch)}
          />
        </ConfigSection>
      )}

      <ConfigTierTypes
        config={config}
        patchConfig={patchConfig}
        paths={paths}
        rootOptions={rootOptions}
      />

      <ConfigTierCodecs config={config} patchConfig={patchConfig} paths={paths} />

      <ConfigTierEngine
        config={config}
        patchConfig={patchConfig}
        paths={paths}
        rootOptions={rootOptions}
      />
    </div>
  );
}
