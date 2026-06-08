import { beforeEach, describe, expect, it } from 'vitest';
import { useEsStore } from '@/store/esStore';
import { useWizardStore } from '@/store/wizardStore';
import { resetStore } from './util';

const FORM = {
  url: 'https://es.example:9200',
  username: 'u',
  password: 'p',
  tls_enabled: true,
  ca_cert: null,
};

describe('esStore', () => {
  beforeEach(() => {
    resetStore();
    useEsStore.getState().disconnect();
  });

  it('connects, stores cluster meta, and loads the default tab', async () => {
    await useEsStore.getState().connect(FORM);

    const state = useEsStore.getState();
    expect(state.sessionId).toBe('sess-1');
    expect(state.cluster).toEqual({ name: 'prod', version: '8.13.0' });
    expect(state.status).toBe('ready');
    expect(state.indices).toHaveLength(1);
  });

  it('surfaces a connection failure as error status', async () => {
    await useEsStore.getState().connect({ ...FORM, url: 'https://unreachable:9200' });

    const state = useEsStore.getState();
    expect(state.status).toBe('error');
    expect(state.sessionId).toBeNull();
    expect(state.error).toContain('cannot reach Elasticsearch');
  });

  it('import drops the mapping, prefill and ILM notes into the wizard and advances', async () => {
    await useEsStore.getState().connect(FORM);
    await useEsStore.getState().importItem('index', 'logs-000001');

    const wizard = useWizardStore.getState();
    expect(wizard.indexName).toBe('logs-000001');
    expect(wizard.mappingText).toContain('@timestamp');
    expect(wizard.config.timestamp_field).toBe('@timestamp');
    expect(wizard.importNotes[0]).toContain('INTERVAL 30 DAY');
    expect(wizard.step).toBe('config');
  });

  it('disconnect clears all session state', async () => {
    await useEsStore.getState().connect(FORM);
    useEsStore.getState().disconnect();

    const state = useEsStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.status).toBe('disconnected');
    expect(state.indices).toHaveLength(0);
  });
});
