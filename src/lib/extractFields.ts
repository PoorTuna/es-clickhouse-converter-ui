/**
 * Client-side ES _mapping walker. Mirrors the backend parser (`_dynamic.py`,
 * `_parser.py`) enough to drive field-name autocomplete and show the routing
 * the backend will actually apply. The backend stays the source of truth on
 * convert; this is UX-only.
 */
export interface ExtractedFields {
  /** Leaf paths that become real top-level columns (flatten leaves + nested
   *  sub-columns addressable as `group.child`). Excludes JSON-subtree leaves,
   *  which collapse into one JSON column the DDL never breaks back out. */
  paths: string[];
  dateFields: string[];
  /** Plain-object roots that flatten to `root_child` columns — the only roots
   *  the user can re-route (JSON/Map/Nested) via config. */
  objectRoots: string[];
  /** `dynamic: true`/`runtime` or `enabled: false` objects the backend forces
   *  into a single JSON column. */
  jsonRoots: string[];
  /** `type: nested` objects the backend forces into a `Nested(...)` column. */
  nestedRoots: string[];
}

type EsNode = Record<string, unknown>;

interface Accumulator {
  paths: string[];
  dateFields: string[];
  objectRoots: string[];
  jsonRoots: string[];
  nestedRoots: string[];
}

const DYNAMIC_JSON_VALUES = new Set(['true', 'runtime']);

/** Mirror of backend `routes_to_json`: an open-ended subtree → JSON column. */
function routesToJson(node: EsNode): boolean {
  const dynamic = node.dynamic;
  if (typeof dynamic === 'boolean') return dynamic;
  if (typeof dynamic === 'string') return DYNAMIC_JSON_VALUES.has(dynamic.toLowerCase());
  return node.enabled === false;
}

/** Mirror of backend `is_nested`: a fixed-schema array of sub-documents. */
function isNested(node: EsNode): boolean {
  return node.type === 'nested';
}

function hasProperties(node: EsNode): node is EsNode & { properties: EsNode } {
  return typeof node.properties === 'object' && node.properties !== null;
}

/**
 * Accepts the three shapes the backend accepts:
 *   full ES response  { idx: { mappings: { properties } } }
 *   bare mappings      { mappings: { properties } }
 *   extracted block    { properties }
 */
function locateProperties(raw: unknown): EsNode {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as EsNode;
  if (obj.properties) return obj.properties as EsNode;
  const mappings = obj.mappings as EsNode | undefined;
  if (mappings?.properties) return mappings.properties as EsNode;
  const first = Object.values(obj)[0] as EsNode | undefined;
  const firstMappings = first?.mappings as EsNode | undefined;
  if (firstMappings?.properties) return firstMappings.properties as EsNode;
  return {};
}

/** Scalar leaves under a `type: nested` subtree, addressable as `group.child`
 *  (the backend flattens inner objects into the same Nested group). */
function collectNestedLeaves(props: EsNode, prefix: string, acc: Accumulator): void {
  for (const [name, raw] of Object.entries(props ?? {})) {
    const node = (raw ?? {}) as EsNode;
    const path = `${prefix}.${name}`;
    if (routesToJson(node)) {
      acc.jsonRoots.push(path);
      continue;
    }
    if (hasProperties(node)) {
      collectNestedLeaves(node.properties, path, acc);
      continue;
    }
    acc.paths.push(path);
  }
}

function walk(props: EsNode, prefix: string, acc: Accumulator): void {
  for (const [name, raw] of Object.entries(props ?? {})) {
    const node = (raw ?? {}) as EsNode;
    const path = prefix ? `${prefix}.${name}` : name;

    if (routesToJson(node)) {
      acc.jsonRoots.push(path);
      continue;
    }
    if (isNested(node)) {
      acc.nestedRoots.push(path);
      if (hasProperties(node)) collectNestedLeaves(node.properties, path, acc);
      continue;
    }
    if (hasProperties(node)) {
      acc.objectRoots.push(path);
      walk(node.properties, path, acc);
      continue;
    }
    acc.paths.push(path);
    if (node.type === 'date' || node.type === 'date_nanos') acc.dateFields.push(path);
  }
}

function emptyFields(): ExtractedFields {
  return { paths: [], dateFields: [], objectRoots: [], jsonRoots: [], nestedRoots: [] };
}

export function extractFields(raw: unknown): ExtractedFields {
  const acc: Accumulator = emptyFields();
  walk(locateProperties(raw), '', acc);
  return acc;
}

/** Parse mapping text safely; returns null on invalid JSON. */
export function parseMapping(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Convenience: extract field paths straight from raw mapping text. */
export function fieldsFromText(text: string): ExtractedFields {
  const parsed = parseMapping(text);
  return parsed ? extractFields(parsed) : emptyFields();
}
