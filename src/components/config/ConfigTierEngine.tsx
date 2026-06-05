import { ConfigSection } from './ConfigSection';
import { StringListInput } from './StringListInput';
import { KeyValueEditor } from './KeyValueEditor';
import { FieldSelect } from './FieldSelect';
import { NumberSelect } from './NumberSelect';
import type { WizardConfig } from '@/store/wizardStore';

const ENGINES = ['MergeTree', 'ReplacingMergeTree', 'SummingMergeTree', 'AggregatingMergeTree'];

interface ConfigTierEngineProps {
  config: WizardConfig;
  patchConfig: (partial: Partial<WizardConfig>) => void;
  paths: string[];
  rootOptions: string[];
}

export function ConfigTierEngine({
  config,
  patchConfig,
  paths,
  rootOptions,
}: ConfigTierEngineProps) {
  return (
    <ConfigSection title="Engine & misc" subtitle="Rarely changed">
      <FieldSelect
        label="Engine"
        value={config.engine}
        options={ENGINES}
        placeholder="MergeTree"
        onChange={(engine) => patchConfig({ engine: engine ?? 'MergeTree' })}
      />
      <NumberSelect
        label="Date precision (DateTime64)"
        hint="Sub-second precision for date fields."
        value={config.date_precision}
        options={[
          { value: 3, label: '3 — ms' },
          { value: 6, label: '6 — µs' },
          { value: 9, label: '9 — ns' },
        ]}
        onChange={(date_precision) => patchConfig({ date_precision })}
      />
      <KeyValueEditor
        label="Map fields"
        hint="Force a field into a Map column; value is the Map value type."
        value={config.map_fields}
        keyOptions={rootOptions}
        valuePlaceholder="Float64"
        onChange={(map_fields) => patchConfig({ map_fields })}
      />
      <StringListInput
        label="Non-nullable columns"
        hint="Force these columns to be non-Nullable."
        values={config.not_null}
        options={paths}
        onChange={(not_null) => patchConfig({ not_null })}
      />
    </ConfigSection>
  );
}
