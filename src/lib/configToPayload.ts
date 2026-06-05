import { DEFAULT_CONFIG, type WizardConfig } from '@/store/wizardStore';

/**
 * Prune knobs left at their default/empty value so the backend receives a
 * minimal config dict (and so DEFAULT_CONFIG round-trips to `null`).
 */
export function configToPayload(config: WizardConfig): Record<string, unknown> | null {
  const out: Record<string, unknown> = {};

  const addArray = (key: keyof WizardConfig, value: string[]) => {
    if (value.length > 0) out[key] = value;
  };
  const addDict = (key: keyof WizardConfig, value: Record<string, string>) => {
    if (Object.keys(value).length > 0) out[key] = value;
  };

  addArray('order_by', config.order_by);
  addArray('low_cardinality', config.low_cardinality);
  addArray('counter_fields', config.counter_fields);
  addArray('json_fields', config.json_fields);
  addArray('nested_fields', config.nested_fields);
  addArray('flatten_fields', config.flatten_fields);
  addArray('not_null', config.not_null);

  addDict('type_overrides', config.type_overrides);
  addDict('codec_overrides', config.codec_overrides);
  addDict('materialized', config.materialized);
  addDict('map_fields', config.map_fields);

  if (config.timestamp_field) out.timestamp_field = config.timestamp_field;
  if (config.partition_by) out.partition_by = config.partition_by;
  if (config.indexes.length > 0) out.indexes = config.indexes;
  if (config.engine && config.engine !== DEFAULT_CONFIG.engine) out.engine = config.engine;
  if (config.date_precision !== DEFAULT_CONFIG.date_precision)
    out.date_precision = config.date_precision;

  return Object.keys(out).length > 0 ? out : null;
}
