import { useState } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useHealth } from '@/lib/useHealth';

export function OfflineBanner() {
  const { status, recheck } = useHealth();
  const [dismissed, setDismissed] = useState(false);

  if (status !== 'unreachable' || dismissed) return null;

  return (
    <div
      role="alert"
      className="flex items-center gap-3 border-b border-ch-danger/40 bg-ch-danger/10 px-6 py-2.5 text-sm text-ch-danger"
    >
      <AlertTriangle size={16} className="shrink-0" />
      <span className="flex-1">Backend unreachable — conversions will fail until it is back.</span>
      <button
        type="button"
        onClick={() => void recheck()}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-ch-danger/15"
      >
        <RefreshCw size={14} /> Retry
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss backend warning"
        className="rounded-md p-1 hover:bg-ch-danger/15"
      >
        <X size={14} />
      </button>
    </div>
  );
}
