import { useMemo } from 'react';
import { ConfigSection } from '../config/ConfigSection';
import { StringListInput } from '../config/StringListInput';
import { KeyValueEditor } from '../config/KeyValueEditor';
import { IndexSpecEditor } from '../config/IndexSpecEditor';
import { FieldSelect } from '../config/FieldSelect';
import { NumberSelect } from '../config/NumberSelect';
import { ObjectStrategyEditor, type RoutableRoot } from '../config/ObjectStrategyEditor';
import { PartitionPreset } from '../config/PartitionPreset';
import { fieldsFromText } from '@/lib/extractFields';
import { useWizardStore } from '@/store/wizardStore';

const ENGINES = ['MergeTree', 'ReplacingMergeTree', 'SummingMergeTree', 'AggregatingMergeTree'];

export function ConfigStep() {
  const { mappingText, config, patchConfig } = useWizardStore();
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
    ...objectRoots.map((path) => ({ path, detected: 'flatten' as const, source: 'object' as const })),
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
    </div>
  );
}
