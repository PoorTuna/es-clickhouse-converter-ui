# es-clickhouse-converter-ui

Web interface for [`ch_converter`](../ch_converter), the deterministic Elasticsearch
`_mapping` → ClickHouse DDL converter. Paste a mapping, adjust the conversion settings in a
guided form, and get a ready-to-run `CREATE TABLE` statement with inline warnings and
tuning suggestions.

The UI is a thin client: all conversion happens in the backend. The frontend parses the
mapping locally only to populate field-name autocomplete.

## Stack

React 18, TypeScript, Vite, Tailwind CSS, Monaco editor, TanStack Query, Zustand.

## Requirements

- Node.js 20+
- A running `ch_converter` backend (defaults to `http://localhost:8000`)

## Development

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/convert` and `/health` to the
backend. Point it at a different backend with `CONVERTER_BACKEND_URL`:

```bash
CONVERTER_BACKEND_URL=http://localhost:8000 npm run dev
```

Because requests are proxied through Vite, the browser sees a single origin and the backend
needs no CORS configuration.

## Scripts

| Script            | Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| `npm run dev`     | Dev server with hot reload and backend proxy                  |
| `npm run build`   | Type-check and build the production bundle to `dist/`         |
| `npm run preview` | Serve the production build locally                            |
| `npm run test`    | Run the test suite (Vitest)                                   |
| `npm run gen:api` | Regenerate API types from a running backend's `/openapi.json` |

## Workflow

1. **Input** — paste or upload the Elasticsearch `_mapping`, set the target table name.
2. **Configure** — sort key, partitioning, `LowCardinality`, type and codec overrides, skip
   indexes, and materialized columns. Field names autocomplete from the mapping.
3. **Result** — the generated DDL, re-rendered as settings change, with copy and download
   actions alongside the backend's warnings and suggestions.

## Offline use

The application loads no third-party assets at runtime. The Monaco editor and its web
workers are bundled by Vite, and the Inter and JetBrains Mono fonts are served from the
package via `@fontsource`. The build is suitable for air-gapped environments.

## Docker

Build a static image served by nginx:

```bash
docker build -t es-clickhouse-converter-ui .
docker run --rm -p 8080:80 -e CONVERTER_BACKEND_URL=http://host.docker.internal:8000 es-clickhouse-converter-ui
```

nginx serves the built bundle and reverse-proxies `/convert` and `/health` to the backend.
The backend address is set by `CONVERTER_BACKEND_URL` (default `http://converter:8000`) and
substituted into the nginx config at container start, so the same image targets any backend
without rebuilding.

### Connecting the UI to the backend

The browser never calls the backend directly. nginx inside the UI container forwards API
requests to a service named `converter`, resolved over the Docker network:

```
browser ──▶ es-clickhouse-converter-ui (nginx :80) ──▶ converter (:8000)
              static bundle + /convert,/health proxy
```

This keeps everything on one origin (no CORS) and means the backend port does not need to
be published to the host. The hostname is resolved lazily through Docker's embedded DNS, so
the UI container also starts on its own — API calls simply return 502 until a `converter`
service is reachable.

Run both with the bundled Compose file (builds the backend from the sibling
`../ch_converter` directory):

```bash
docker compose up --build
# UI on http://localhost:8080
```

To attach the UI to an existing backend stack instead, add the service to that stack's
`docker-compose.yml`:

```yaml
ui:
  build: ../ch_converter_ui
  ports:
    - '8080:80'
  depends_on:
    - converter
```

Any backend reachable from the container satisfies the proxy; point at it with
`CONVERTER_BACKEND_URL` (a Compose service name, `host.docker.internal`, or an external URL).

## License

MIT
