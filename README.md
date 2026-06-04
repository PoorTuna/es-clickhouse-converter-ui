# ES → ClickHouse Converter UI

A ClickHouse-branded web wizard for the [`ch_converter`](../ch_converter) backend. Paste an
Elasticsearch `_mapping`, tune the conversion config in a guided form, and watch the
generated ClickHouse `CREATE TABLE` DDL update live.

## Stack

Vite · React 18 · TypeScript · Tailwind · Monaco · TanStack Query · Zustand · Framer Motion.

## Develop

```bash
# 1. start the backend (in ../ch_converter)
python -m ch_converter.main            # serves http://localhost:8000

# 2. start the UI
npm install
npm run dev                            # http://localhost:5173
```

The Vite dev server proxies `/convert` and `/health` to the backend (default
`http://localhost:8000`; override with `VITE_BACKEND_URL`). No CORS config needed in dev.

## Scripts

| Script            | Purpose                                                  |
| ----------------- | -------------------------------------------------------- |
| `npm run dev`     | Dev server with HMR + backend proxy                      |
| `npm run build`   | Type-check and produce a static bundle in `dist/`        |
| `npm run preview` | Serve the production build locally                       |
| `npm run test`    | Run vitest (jsdom + msw)                                  |
| `npm run gen:api` | Regenerate `src/api/schema.d.ts` from a live `/openapi.json` |

## Wizard

1. **Input** — paste / upload the `_mapping`, set the table name. Load the bundled sample.
2. **Configure** — sorting, partitioning, types, codecs, indexes, materialized columns.
   Field names autocomplete from the pasted mapping.
3. **Result** — live DDL preview with copy / download, plus warnings and suggestions.

## Production / Docker

`docker build -t ch-converter-ui .` builds a static bundle served by nginx on port 80, with
nginx proxying `/convert` and `/health` to the backend. To run alongside the backend, add a
`ui` service to `../ch_converter/docker-compose.yml` (see the converter repo). For a
non-proxied deploy, add CORS to the backend (`CORSMiddleware` in `ch_converter/main.py`).
