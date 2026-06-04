import { create } from 'zustand';
import { SAMPLE_INDEX_NAME, SAMPLE_MAPPING_TEXT } from '@/lib/sampleMapping';

export type Step = 'input' | 'config' | 'result';

export interface IndexSpec {
  name: string;
  expr: string;
  type: string;
  granularity: number;
}

/** Mirrors the backend IndexConfig; every knob optional with a UI-friendly default. */
export interface WizardConfig {
  order_by: string[];
  timestamp_field: string | null;
  partition_by: string | null;
  low_cardinality: string[];
  type_overrides: Record<string, string>;
  counter_fields: string[];
  json_fields: string[];
  codec_overrides: Record<string, string>;
  indexes: IndexSpec[];
  materialized: Record<string, string>;
  map_fields: Record<string, string>;
  nested_fields: string[];
  not_null: string[];
  engine: string;
  date_precision: 3 | 6 | 9;
}

export const DEFAULT_CONFIG: WizardConfig = {
  order_by: [],
  timestamp_field: null,
  partition_by: null,
  low_cardinality: [],
  type_overrides: {},
  counter_fields: [],
  json_fields: [],
  codec_overrides: {},
  indexes: [],
  materialized: {},
  map_fields: {},
  nested_fields: [],
  not_null: [],
  engine: 'MergeTree',
  date_precision: 3,
};

export const STEP_ORDER: Step[] = ['input', 'config', 'result'];

interface WizardState {
  step: Step;
  indexName: string;
  mappingText: string;
  config: WizardConfig;
  setStep: (step: Step) => void;
  next: () => void;
  back: () => void;
  setMappingText: (text: string) => void;
  setIndexName: (name: string) => void;
  patchConfig: (partial: Partial<WizardConfig>) => void;
  loadSample: () => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  step: 'input',
  indexName: '',
  mappingText: '',
  config: DEFAULT_CONFIG,
  setStep: (step) => set({ step }),
  next: () => {
    const i = STEP_ORDER.indexOf(get().step);
    if (i < STEP_ORDER.length - 1) set({ step: STEP_ORDER[i + 1] });
  },
  back: () => {
    const i = STEP_ORDER.indexOf(get().step);
    if (i > 0) set({ step: STEP_ORDER[i - 1] });
  },
  setMappingText: (mappingText) => set({ mappingText }),
  setIndexName: (indexName) => set({ indexName }),
  patchConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
  loadSample: () =>
    set({ mappingText: SAMPLE_MAPPING_TEXT, indexName: SAMPLE_INDEX_NAME }),
  reset: () =>
    set({ step: 'input', indexName: '', mappingText: '', config: DEFAULT_CONFIG }),
}));
