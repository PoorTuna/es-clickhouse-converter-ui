/**
 * Client-side ES _mapping walker. Mirrors the backend parser enough to drive
 * field-name autocomplete in the config form. The backend stays the source of
 * truth on convert; this is UX-only.
 */
export interface ExtractedFields {
  paths: string[];
  dateFields: string[];
  /** Plain-object roots (no `type`, or `type: object`) that otherwise flatten
   *  to `root_child` columns — candidates for a JSON/Map/Nested route. */
  objectRoots: string[];
}

type EsNode = Record<string, unknown>;

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

function walk(
  props: EsNode,
  prefix: string,
  paths: string[],
  dateFields: string[],
  objectRoots: string[],
): void {
  for (const [name, raw] of Object.entries(props ?? {})) {
    const node = (raw ?? {}) as EsNode;
    const path = prefix ? `${prefix}.${name}` : name;
    // Plain objects (no `type`) recurse into their sub-properties.
    if (node.properties && node.type !== 'nested') {
      objectRoots.push(path);
      walk(node.properties as EsNode, path, paths, dateFields, objectRoots);
      continue;
    }
    paths.push(path);
    if (node.type === 'date' || node.type === 'date_nanos') dateFields.push(path);
  }
}

export function extractFields(raw: unknown): ExtractedFields {
  const props = locateProperties(raw);
  const paths: string[] = [];
  const dateFields: string[] = [];
  const objectRoots: string[] = [];
  walk(props, '', paths, dateFields, objectRoots);
  return { paths, dateFields, objectRoots };
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
  return parsed ? extractFields(parsed) : { paths: [], dateFields: [], objectRoots: [] };
}
