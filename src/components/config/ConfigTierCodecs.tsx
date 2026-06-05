import { ConfigSection } from './ConfigSection';
import { KeyValueEditor } from './KeyValueEditor';
import { IndexSpecEditor } from './IndexSpecEditor';
import type { WizardConfig } from '@/store/wizardStore';

interface ConfigTierCodecsProps {
  config: WizardConfig;
  patchConfig: (partial: Partial<WizardConfig>) => void;
  paths: string[];
}

export function ConfigTierCodecs({ config, patchConfig, paths }: ConfigTierCodecsProps) {
  return (
    <ConfigSection title="Codecs, indexes & computed columns" subtitle="Advanced tuning">
      <KeyValueEditor
        label="Codec overrides"
        hint="Raw ClickHouse codec, e.g. bytes_total → Delta, ZSTD(3)."
        value={config.codec_overrides}
        keyOptions={paths}
        valuePlaceholder="Delta, ZSTD(3)"
        onChange={(codec_overrides) => patchConfig({ codec_overrides })}
      />
      <IndexSpecEditor
        value={config.indexes}
        hint="Skip indexes for frequent non-sort-key filters."
        onChange={(indexes) => patchConfig({ indexes })}
      />
      <KeyValueEditor
        label="Materialized columns"
        hint="Computed columns: new name → expression, e.g. status_class → intDiv(status_code, 100)."
        value={config.materialized}
        valuePlaceholder="intDiv(status_code, 100)"
        onChange={(materialized) => patchConfig({ materialized })}
      />
    </ConfigSection>
  );
}
