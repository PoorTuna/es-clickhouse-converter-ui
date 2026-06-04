import Editor from '@monaco-editor/react';
import { useTheme } from '@/lib/useTheme';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number | string;
}

export function JsonEditor({ value, onChange, height = 360 }: JsonEditorProps) {
  const { theme } = useTheme();
  return (
    <div className="overflow-hidden rounded-lg border border-ch-border">
      <Editor
        height={height}
        defaultLanguage="json"
        theme={theme === 'light' ? 'vs' : 'vs-dark'}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          scrollBeyondLastLine: false,
          tabSize: 2,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
