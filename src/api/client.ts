/**
 * Typed client for the ch_converter backend.
 *
 * Types mirror ch_converter/_schemas.py (ConvertRequest / ConvertResponse).
 * Run `npm run gen:api` against a live backend to regenerate src/api/schema.d.ts
 * if the contract changes; these hand-written types keep the build self-contained.
 */
export interface ConvertRequest {
  index_name: string;
  mapping: Record<string, unknown>;
  config: Record<string, unknown> | null;
}

export interface ConvertResponse {
  table_name: string;
  ddl: string;
  warnings: string[];
  suggestions: string[];
  error: string | null;
}

export class ConvertError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ConvertError';
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) detail = String(data.detail);
    } catch {
      /* non-JSON error body */
    }
    throw new ConvertError(detail, res.status);
  }
  return (await res.json()) as T;
}

export function convert(req: ConvertRequest): Promise<ConvertResponse> {
  return post<ConvertResponse>('/convert', req);
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch('/health');
    return res.ok;
  } catch {
    return false;
  }
}
