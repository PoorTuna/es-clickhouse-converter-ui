import { describe, expect, it } from 'vitest';
import { extractFields } from '@/lib/extractFields';

describe('extractFields', () => {
  it('handles the full ES response shape', () => {
    const raw = {
      'logs-prod': {
        mappings: {
          properties: {
            '@timestamp': { type: 'date' },
            level: { type: 'keyword' },
          },
        },
      },
    };
    const { paths, dateFields } = extractFields(raw);
    expect(paths).toEqual(['@timestamp', 'level']);
    expect(dateFields).toEqual(['@timestamp']);
  });

  it('handles the bare mappings shape', () => {
    const raw = { mappings: { properties: { msg: { type: 'text' } } } };
    expect(extractFields(raw).paths).toEqual(['msg']);
  });

  it('handles the extracted properties shape and nests objects', () => {
    const raw = {
      properties: {
        service: { properties: { name: { type: 'keyword' }, version: { type: 'keyword' } } },
        ts: { type: 'date_nanos' },
      },
    };
    const { paths, dateFields } = extractFields(raw);
    expect(paths).toEqual(['service.name', 'service.version', 'ts']);
    expect(dateFields).toEqual(['ts']);
  });

  it('treats nested type as a leaf, not an object to descend', () => {
    const raw = {
      properties: { tags: { type: 'nested', properties: { key: { type: 'keyword' } } } },
    };
    expect(extractFields(raw).paths).toEqual(['tags']);
  });

  it('returns empty for junk input', () => {
    expect(extractFields(null)).toEqual({ paths: [], dateFields: [] });
    expect(extractFields(42)).toEqual({ paths: [], dateFields: [] });
  });
});
