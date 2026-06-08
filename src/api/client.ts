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

async function readError(res: Response): Promise<string> {
  let detail = `Request failed (${res.status})`;
  try {
    const data = await res.json();
    if (data?.detail) detail = String(data.detail);
  } catch {
    /* non-JSON error body */
  }
  return detail;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new ConvertError(await readError(res), res.status);
  return (await res.json()) as T;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new ConvertError(await readError(res), res.status);
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

/* ---- Live Elasticsearch: connect, browse, import (session-only) ---- */

export type EsItemKind = 'template' | 'datastream' | 'index';

export interface EsConnectRequest {
  url: string;
  username: string;
  password: string;
  tls_enabled: boolean;
  ca_cert: string | null;
}

export interface EsConnectResponse {
  session_id: string;
  cluster_name: string;
  version: string;
}

export interface TemplateItem {
  name: string;
  index_patterns: string[];
  has_data_stream: boolean;
}

export interface DataStreamItem {
  name: string;
  template: string | null;
  ilm_policy: string | null;
  indices_count: number;
}

export interface IndexItem {
  name: string;
  health: string | null;
  docs: number | null;
  size: string | null;
  ilm_policy: string | null;
}

export interface EsImportResponse {
  index_name: string;
  mapping: Record<string, unknown>;
  config_prefill: Record<string, unknown>;
  suggestions: string[];
}

export function esConnect(req: EsConnectRequest): Promise<EsConnectResponse> {
  return post<EsConnectResponse>('/es/connect', req);
}

export function esTemplates(sessionId: string): Promise<TemplateItem[]> {
  return get<TemplateItem[]>(`/es/templates?session_id=${encodeURIComponent(sessionId)}`);
}

export function esDatastreams(sessionId: string): Promise<DataStreamItem[]> {
  return get<DataStreamItem[]>(`/es/datastreams?session_id=${encodeURIComponent(sessionId)}`);
}

export function esIndices(sessionId: string, includeSystem = false): Promise<IndexItem[]> {
  const qs = `session_id=${encodeURIComponent(sessionId)}&include_system=${includeSystem}`;
  return get<IndexItem[]>(`/es/indices?${qs}`);
}

export function esImport(
  sessionId: string,
  kind: EsItemKind,
  name: string,
): Promise<EsImportResponse> {
  const qs = `session_id=${encodeURIComponent(sessionId)}&kind=${kind}&name=${encodeURIComponent(name)}`;
  return get<EsImportResponse>(`/es/import?${qs}`);
}

export function esDisconnect(sessionId: string): Promise<unknown> {
  return post('/es/disconnect', { session_id: sessionId });
}
