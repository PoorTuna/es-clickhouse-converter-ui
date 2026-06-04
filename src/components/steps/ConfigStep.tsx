import { useMemo } from 'react';
import { ConfigSection } from '../config/ConfigSection';
import { StringListInput } from '../config/StringListInput';
import { KeyValueEditor } from '../config/KeyValueEditor';
import { IndexSpecEditor } from '../config/IndexSpecEditor';
import { FieldSelect } from '../config/FieldSelect';
import { NumberSelect } from '../config/NumberSelect';
import { fieldsFromText } from '@/lib/extractFields';
import { useWizardStore } from '@/store/wizardStore';

const ENGINES = ['MergeTree', 'ReplacingMergeTree', 'SummingMergeTree', 'AggregatingMergeTree'];

export function ConfigStep() {
  const { mappingText, config, patchConfig } = useWizardStore();
  const { paths, dateFields } = useMemo(() => fieldsFromText(mappingText), [mappingText]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-ch-muted">
        All knobs are optional — leave them blank to let the converter choose. Field names
        autocomplete from your mapping.
      </p>

      {/* Tier 1 — essential */}
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
        <FieldSelect
          label="PARTITION BY (raw SQL)"
          hint="e.g. toYYYYMM(`@timestamp`). Enables cheap drop of old partitions."
          value={config.partition_by}
          options={[]}
          placeholder="toYYYYMM(`@timestamp`)"
          onChange={(partition_by) => patchConfig({ partition_by })}
        />
      </ConfigSection>

      {/* Tier 2 — high value */}
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
          keyOptions={paths}
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
          options={paths}
          onChange={(json_fields) => patchConfig({ json_fields })}
        />
      </ConfigSection>

      {/* Tier 3 — situational */}
      <ConfigSection title="Codecs, indexes & computed columns" subtitle="Advanced tuning">
        <KeyValueEditor
          label="Codec overrides"
          hint="Raw ClickHouse codec, e.g. bytes_total → Delta, ZSTD(3)."
          value={config.codec_overrides}
          keyOptions={paths}
          valuePlaceholder="Delta, ZSTD(3)"
          onChange={(codec_overrides) => patchConfig({ codec_overrides })}
        />
        <IndexSpecEditor
          value={config.indexes}
          hint="Skip indexes for frequent non-sort-key filters."
          onChange={(indexes) => patchConfig({ indexes })}
        />
        <KeyValueEditor
          label="Materialized columns"
          hint="Computed columns: new name → expression, e.g. status_class → intDiv(status_code, 100)."
          value={config.materialized}
          valuePlaceholder="intDiv(status_code, 100)"
          onChange={(materialized) => patchConfig({ materialized })}
        />
      </ConfigSection>

      {/* Tier 4 — rarely needed */}
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
          keyOptions={paths}
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
    </div>
  );
}
