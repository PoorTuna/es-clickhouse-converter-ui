import { create } from 'zustand';
import {
  esConnect,
  esDatastreams,
  esDisconnect,
  esImport,
  esIndices,
  esTemplates,
  type DataStreamItem,
  type EsConnectRequest,
  type EsItemKind,
  type IndexItem,
  type TemplateItem,
} from '@/api/client';
import { useWizardStore, type WizardConfig } from './wizardStore';

/**
 * Live-Elasticsearch session state. Deliberately NOT persisted: the session id
 * and credentials live only in memory so they vanish on reload or tab close
 * (the orphaned server session is then reaped by its idle TTL).
 */
export type EsStatus = 'disconnected' | 'connecting' | 'ready' | 'loading' | 'error';

interface EsState {
  sessionId: string | null;
  cluster: { name: string; version: string } | null;
  status: EsStatus;
  error: string | null;
  activeTab: EsItemKind;
  templates: TemplateItem[];
  datastreams: DataStreamItem[];
  indices: IndexItem[];
  importing: string | null;
  connect: (form: EsConnectRequest) => Promise<void>;
  setTab: (kind: EsItemKind) => Promise<void>;
  importItem: (kind: EsItemKind, name: string) => Promise<void>;
  disconnect: () => void;
}

const INITIAL = {
  sessionId: null,
  cluster: null,
  status: 'disconnected' as EsStatus,
  error: null,
  activeTab: 'index' as EsItemKind,
  templates: [],
  datastreams: [],
  indices: [],
  importing: null,
};

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useEsStore = create<EsState>((set, get) => ({
  ...INITIAL,

  connect: async (form) => {
    set({ status: 'connecting', error: null });
    try {
      const res = await esConnect(form);
      set({
        sessionId: res.session_id,
        cluster: { name: res.cluster_name, version: res.version },
        status: 'ready',
      });
      await get().setTab('index');
    } catch (error) {
      set({ status: 'error', error: message(error) });
    }
  },

  setTab: async (kind) => {
    const { sessionId } = get();
    set({ activeTab: kind });
    if (!sessionId) return;
    set({ status: 'loading', error: null });
    try {
      if (kind === 'template') set({ templates: await esTemplates(sessionId) });
      else if (kind === 'datastream') set({ datastreams: await esDatastreams(sessionId) });
      else set({ indices: await esIndices(sessionId) });
      set({ status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: message(error) });
    }
  },

  importItem: async (kind, name) => {
    const { sessionId } = get();
    if (!sessionId) return;
    set({ importing: name, error: null });
    try {
      const result = await esImport(sessionId, kind, name);
      const wizard = useWizardStore.getState();
      wizard.setMappingText(JSON.stringify(result.mapping, null, 2));
      wizard.setIndexName(result.index_name);
      wizard.patchConfig(result.config_prefill as Partial<WizardConfig>);
      wizard.setImportNotes(result.suggestions);
      wizard.setStep('config');
    } catch (error) {
      set({ status: 'error', error: message(error) });
    } finally {
      set({ importing: null });
    }
  },

  disconnect: () => {
    const { sessionId } = get();
    if (sessionId) void esDisconnect(sessionId).catch(() => undefined);
    set({ ...INITIAL });
  },
}));
