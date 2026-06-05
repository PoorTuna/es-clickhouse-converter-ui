import { ConfigSection } from './ConfigSection';
import { StringListInput } from './StringListInput';
import { KeyValueEditor } from './KeyValueEditor';
import type { WizardConfig } from '@/store/wizardStore';

interface ConfigTierTypesProps {
  config: WizardConfig;
  patchConfig: (partial: Partial<WizardConfig>) => void;
  paths: string[];
  rootOptions: string[];
}

export function ConfigTierTypes({ config, patchConfig, paths, rootOptions }: ConfigTierTypesProps) {
  return (
    <ConfigSection title="Types & cardinality" subtitle="Storage and speed wins">
      <StringListInput
        label="LowCardinality columns"
        hint="String columns to dictionary-encode."
        values={config.low_cardinality}
        options={paths}
        onChange={(low_cardinality) => patchConfig({ low_cardinality })}
      />
      <KeyValueEditor
        label="Type overrides"
        hint="Pin a field to a ClickHouse type, e.g. status_code → UInt16."
        value={config.type_overrides}
        keyOptions={rootOptions}
        valuePlaceholder="UInt16"
        onChange={(type_overrides) => patchConfig({ type_overrides })}
      />
      <StringListInput
        label="Counter fields"
        hint="Monotonic counters — get a Delta codec."
        values={config.counter_fields}
        options={paths}
        onChange={(counter_fields) => patchConfig({ counter_fields })}
      />
      <StringListInput
        label="JSON catch-all fields"
        hint="Force these (plus auto-detected dynamic ones) into JSON columns."
        values={config.json_fields}
        options={rootOptions}
        onChange={(json_fields) => patchConfig({ json_fields })}
      />
    </ConfigSection>
  );
}
