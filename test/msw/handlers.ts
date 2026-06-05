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
];

export const server = setupServer(...handlers);
