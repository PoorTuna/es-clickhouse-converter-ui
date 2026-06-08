import { useMemo, useState } from 'react';
import { AlertCircle, Download, Loader2 } from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { Tabs } from './Tabs';
import { useEsStore } from '@/store/esStore';
import type { EsItemKind } from '@/api/client';

interface Row {
  name: string;
  meta: string;
}

export function EsBrowser() {
  const {
    activeTab,
    status,
    error,
    templates,
    datastreams,
    indices,
    importing,
    setTab,
    importItem,
  } = useEsStore();
  const [filter, setFilter] = useState('');

  const rows = useMemo(
    () => toRows(activeTab, { templates, datastreams, indices }),
    [activeTab, templates, datastreams, indices],
  );
  const visible = rows.filter((row) => row.name.toLowerCase().includes(filter.toLowerCase()));
  const loading = status === 'loading';

  return (
    <Card className="space-y-3 p-5">
      <Tabs active={activeTab} onSelect={(kind) => void setTab(kind)} />

      <Input
        placeholder="Filter by name…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-ch-danger">
          <AlertCircle size={15} /> {error}
        </p>
      )}

      <ul className="divide-y divide-ch-border">
        {loading && <li className="py-6 text-center text-sm text-ch-muted">Loading…</li>}
        {!loading && visible.length === 0 && (
          <li className="py-6 text-center text-sm text-ch-muted">Nothing to show.</li>
        )}
        {!loading &&
          visible.map((row) => (
            <li key={row.name} className="flex items-center justify-between gap-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-ch-text">{row.name}</p>
                <p className="truncate text-xs text-ch-muted">{row.meta}</p>
              </div>
              <Button
                variant="outline"
                disabled={importing !== null}
                onClick={() => void importItem(activeTab, row.name)}
              >
                {importing === row.name ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Download size={15} />
                )}
                Import
              </Button>
            </li>
          ))}
      </ul>
    </Card>
  );
}

function toRows(
  kind: EsItemKind,
  data: Pick<ReturnType<typeof useEsStore.getState>, 'templates' | 'datastreams' | 'indices'>,
): Row[] {
  if (kind === 'template') {
    return data.templates.map((t) => ({
      name: t.name,
      meta: `patterns: ${t.index_patterns.join(', ') || '—'}${t.has_data_stream ? ' · data stream' : ''}`,
    }));
  }
  if (kind === 'datastream') {
    return data.datastreams.map((d) => ({
      name: d.name,
      meta: `${d.indices_count} backing · ILM: ${d.ilm_policy ?? 'none'}`,
    }));
  }
  return data.indices.map((i) => ({
    name: i.name,
    meta: `${i.health ?? '—'} · ${i.docs ?? '?'} docs · ${i.size ?? '?'}`,
  }));
}
