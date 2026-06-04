import Editor from '@monaco-editor/react';
import { useTheme } from '@/lib/useTheme';

interface SqlViewerProps {
  value: string;
  height?: number | string;
}

export function SqlViewer({ value, height = 420 }: SqlViewerProps) {
  const { theme } = useTheme();
  return (
    <div className="overflow-hidden rounded-lg border border-ch-border">
      <Editor
        height={height}
        defaultLanguage="sql"
        theme={theme === 'light' ? 'vs' : 'vs-dark'}
        value={value}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          wordWrap: 'on',
        }}
      />
    </div>
  );
}
