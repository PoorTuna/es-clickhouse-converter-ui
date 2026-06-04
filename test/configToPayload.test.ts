import { describe, expect, it } from 'vitest';
import { configToPayload } from '@/lib/configToPayload';
import { DEFAULT_CONFIG } from '@/store/wizardStore';

describe('configToPayload', () => {
  it('returns null when nothing is set', () => {
    expect(configToPayload(DEFAULT_CONFIG)).toBeNull();
  });

  it('includes only non-empty knobs', () => {
    const payload = configToPayload({
      ...DEFAULT_CONFIG,
      order_by: ['service.name', '@timestamp'],
      type_overrides: { status_code: 'UInt16' },
      partition_by: 'toYYYYMM(`@timestamp`)',
    });
    expect(payload).toEqual({
      order_by: ['service.name', '@timestamp'],
      type_overrides: { status_code: 'UInt16' },
      partition_by: 'toYYYYMM(`@timestamp`)',
    });
  });

  it('omits engine and date_precision when left at defaults', () => {
    const payload = configToPayload({ ...DEFAULT_CONFIG, not_null: ['id'] });
    expect(payload).toEqual({ not_null: ['id'] });
  });

  it('includes engine and date_precision when changed', () => {
    const payload = configToPayload({
      ...DEFAULT_CONFIG,
      engine: 'ReplacingMergeTree',
      date_precision: 9,
    });
    expect(payload).toEqual({ engine: 'ReplacingMergeTree', date_precision: 9 });
  });
});
