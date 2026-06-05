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
    const { paths, dateFields, objectRoots } = extractFields(raw);
    expect(paths).toEqual(['service.name', 'service.version', 'ts']);
    expect(dateFields).toEqual(['ts']);
    expect(objectRoots).toEqual(['service']);
  });

  it('routes a nested type to a Nested root with dotted sub-column paths', () => {
    const raw = {
      properties: { tags: { type: 'nested', properties: { key: { type: 'keyword' } } } },
    };
    const { paths, nestedRoots, objectRoots } = extractFields(raw);
    expect(nestedRoots).toEqual(['tags']);
    expect(paths).toEqual(['tags.key']);
    expect(objectRoots).toEqual([]);
  });

  it('routes a dynamic object to a JSON root without leaking its leaves', () => {
    const raw = {
      properties: {
        product: { type: 'object', dynamic: 'true', properties: { sku: { type: 'keyword' } } },
        blob: { type: 'object', enabled: false },
      },
    };
    const { paths, jsonRoots, objectRoots } = extractFields(raw);
    expect(jsonRoots).toEqual(['product', 'blob']);
    expect(paths).toEqual([]);
    expect(objectRoots).toEqual([]);
  });

  it('lists nested object roots at every depth', () => {
    const raw = {
      properties: {
        product: {
          properties: {
            logs: { type: 'keyword' },
            meta: { properties: { sku: { type: 'keyword' } } },
          },
        },
      },
    };
    expect(extractFields(raw).objectRoots).toEqual(['product', 'product.meta']);
  });

  it('returns empty for junk input', () => {
    const empty = { paths: [], dateFields: [], objectRoots: [], jsonRoots: [], nestedRoots: [] };
    expect(extractFields(null)).toEqual(empty);
    expect(extractFields(42)).toEqual(empty);
  });
});
