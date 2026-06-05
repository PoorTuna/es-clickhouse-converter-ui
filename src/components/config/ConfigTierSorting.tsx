import { ConfigSection } from './ConfigSection';
import { StringListInput } from './StringListInput';
import { FieldSelect } from './FieldSelect';
import { PartitionPreset } from './PartitionPreset';
import type { WizardConfig } from '@/store/wizardStore';

interface ConfigTierSortingProps {
  config: WizardConfig;
  patchConfig: (partial: Partial<WizardConfig>) => void;
  paths: string[];
  dateFields: string[];
  timestampField: string;
}

export function ConfigTierSorting({
  config,
  patchConfig,
  paths,
  dateFields,
  timestampField,
}: ConfigTierSortingProps) {
  return (
    <ConfigSection title="Sorting & partitioning" subtitle="Most impactful" defaultOpen>
      <StringListInput
        label="ORDER BY"
        hint="Sort key columns, in filter-frequency order. Falls back to the timestamp field."
        values={config.order_by}
        options={paths}
        onChange={(order_by) => patchConfig({ order_by })}
      />
      <FieldSelect
        label="Timestamp field"
        hint="Event time column. Auto-detected from the first date field if left blank."
        value={config.timestamp_field}
        options={dateFields.length ? dateFields : paths}
        placeholder={dateFields[0] ?? '@timestamp'}
        onChange={(timestamp_field) => patchConfig({ timestamp_field })}
      />
      <PartitionPreset
        partitionBy={config.partition_by}
        timestampField={timestampField}
        hint={`Presets build the expression from '${timestampField}'. Pick Custom to write raw SQL below.`}
        onChange={(partition_by) => patchConfig({ partition_by })}
      />
      <FieldSelect
        label="PARTITION BY (raw SQL)"
        hint="e.g. toYYYYMM(`@timestamp`). Enables cheap drop of old partitions."
        value={config.partition_by}
        options={[]}
        placeholder="toYYYYMM(`@timestamp`)"
        onChange={(partition_by) => patchConfig({ partition_by })}
      />
    </ConfigSection>
  );
}
