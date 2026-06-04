import { Database } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-ch-border bg-ch-panel">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ch-yellow text-black">
          <Database size={18} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-ch-text">
            ES <span className="text-ch-yellow">→</span> ClickHouse Converter
          </span>
          <span className="text-xs text-ch-muted">
            Elasticsearch _mapping to ClickHouse DDL
          </span>
        </div>
        <div className="ml-auto h-1.5 w-24 rounded-full bg-ch-yellow/80" aria-hidden />
      </div>
    </header>
  );
}
