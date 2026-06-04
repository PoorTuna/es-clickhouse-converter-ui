import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, Copy, Download, Loader2 } from 'lucide-react';
import { Button, Card } from '../ui';
import { SqlViewer } from '../editors/SqlViewer';
import { WarningsPanel, SuggestionsPanel } from '../result/AdvisoryPanel';
import { useConvert } from '@/api/useConvert';
import { parseMapping } from '@/lib/extractFields';
import { configToPayload } from '@/lib/configToPayload';
import { useDebounce } from '@/lib/useDebounce';
import { useWizardStore } from '@/store/wizardStore';

export function ResultStep() {
  const { mappingText, indexName, config } = useWizardStore();
  const { mutate, data, error, isPending } = useConvert();
  const [copied, setCopied] = useState(false);

  // Debounce the inputs so editing config re-converts at most ~every 400ms.
  const payloadKey = useDebounce(
    JSON.stringify({ mappingText, indexName, config }),
    400,
  );

  useEffect(() => {
    const mapping = parseMapping(mappingText);
    if (!mapping || !indexName.trim()) return;
    mutate({
      index_name: indexName.trim(),
      mapping: mapping as Record<string, unknown>,
      config: configToPayload(config),
    });
    // payloadKey is the debounced trigger; other deps are read fresh inside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payloadKey, mutate]);

  const ddl = data?.ddl ?? '';
  const fileName = useMemo(
    () => `${(data?.table_name || indexName || 'table').replace(/[^\w]+/g, '_')}.sql`,
    [data?.table_name, indexName],
  );

  const onCopy = async () => {
    await navigator.clipboard.writeText(ddl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onDownload = () => {
    const blob = new Blob([ddl], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const backendError = error?.message ?? data?.error ?? null;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-ch-border px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-ch-text">Generated DDL</span>
            {isPending && <Loader2 size={15} className="animate-spin text-ch-yellow" />}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCopy} disabled={!ddl}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="primary" onClick={onDownload} disabled={!ddl}>
              <Download size={15} /> Download .sql
            </Button>
          </div>
        </div>

        {backendError ? (
          <div className="flex items-start gap-2 px-4 py-4 text-sm text-ch-danger">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{backendError}</span>
          </div>
        ) : (
          <SqlViewer value={ddl} />
        )}
      </Card>

      <WarningsPanel items={data?.warnings ?? []} />
      <SuggestionsPanel items={data?.suggestions ?? []} />
    </div>
  );
}
