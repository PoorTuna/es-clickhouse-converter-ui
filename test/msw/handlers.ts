import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  http.get('/health', () => HttpResponse.json({ status: 'ok' })),
  http.post('/convert', async ({ request }) => {
    const body = (await request.json()) as { index_name: string; mapping: unknown };
    if (!body.mapping || typeof body.mapping !== 'object') {
      return HttpResponse.json({ detail: 'Invalid mapping' }, { status: 400 });
    }
    return HttpResponse.json({
      table_name: body.index_name,
      ddl: `CREATE TABLE \`${body.index_name}\` (\n  \`@timestamp\` DateTime64(3)\n) ENGINE = MergeTree ORDER BY (\`@timestamp\`);`,
      warnings: [],
      suggestions: ["'@timestamp' is an ES date field - emitted as DateTime64(3)"],
      error: null,
    });
  }),
  http.post('/es/connect', async ({ request }) => {
    const body = (await request.json()) as { url: string };
    if (body.url.includes('unreachable')) {
      return HttpResponse.json({ detail: 'cannot reach Elasticsearch' }, { status: 502 });
    }
    return HttpResponse.json({ session_id: 'sess-1', cluster_name: 'prod', version: '8.13.0' });
  }),
  http.get('/es/indices', () =>
    HttpResponse.json([
      { name: 'logs-000001', health: 'green', docs: 42, size: '1mb', ilm_policy: null },
    ]),
  ),
  http.get('/es/datastreams', () =>
    HttpResponse.json([
      { name: 'logs', template: 'logs', ilm_policy: 'logs-policy', indices_count: 2 },
    ]),
  ),
  http.get('/es/templates', () =>
    HttpResponse.json([{ name: 'logs', index_patterns: ['logs-*'], has_data_stream: true }]),
  ),
  http.get('/es/import', () =>
    HttpResponse.json({
      index_name: 'logs-000001',
      mapping: { mappings: { properties: { '@timestamp': { type: 'date' } } } },
      config_prefill: { timestamp_field: '@timestamp', order_by: ['@timestamp'] },
      suggestions: [
        'ES ILM deletes after 30d; add `TTL @timestamp + INTERVAL 30 DAY` in ClickHouse.',
      ],
    }),
  ),
  http.post('/es/disconnect', () => new HttpResponse(null, { status: 204 })),
];

export const server = setupServer(...handlers);
