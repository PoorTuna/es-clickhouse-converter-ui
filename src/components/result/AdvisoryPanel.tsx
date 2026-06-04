import { AlertTriangle, Lightbulb } from 'lucide-react';
import { Card } from '../ui';

interface AdvisoryPanelProps {
  items: string[];
}

export function WarningsPanel({ items }: AdvisoryPanelProps) {
  if (items.length === 0) return null;
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ch-warning">
        <AlertTriangle size={16} /> Warnings ({items.length})
      </div>
      <ul className="space-y-1.5">
        {items.map((w, i) => (
          <li key={i} className="flex gap-2 text-sm text-ch-text">
            <span className="text-ch-warning">•</span>
            <span>{w}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function SuggestionsPanel({ items }: AdvisoryPanelProps) {
  if (items.length === 0) return null;
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ch-suggestion">
        <Lightbulb size={16} /> Suggestions ({items.length})
      </div>
      <ul className="space-y-1.5">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2 text-sm text-ch-text">
            <span className="text-ch-suggestion">•</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
