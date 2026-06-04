/**
 * Airgap-safe Monaco: bundle the editor + its web workers locally via Vite so
 * @monaco-editor/react never fetches from a CDN. Import this once, before any
 * <Editor> renders (see main.tsx).
 */
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === 'json') return new jsonWorker();
    return new editorWorker();
  },
} satisfies monaco.Environment;

// Point the loader at the locally bundled monaco instead of the jsdelivr CDN.
loader.config({ monaco });
