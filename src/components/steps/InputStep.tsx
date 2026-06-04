import { useMemo } from 'react';
import { AlertCircle, CheckCircle2, FileJson, Upload } from 'lucide-react';
import { Card, Hint, Input, Label, Button } from '../ui';
import { JsonEditor } from '../editors/JsonEditor';
import { fieldsFromText, parseMapping } from '@/lib/extractFields';
import { useWizardStore } from '@/store/wizardStore';

export function InputStep() {
  const { mappingText, indexName, setMappingText, setIndexName, loadSample } =
    useWizardStore();

  const parsed = useMemo(() => parseMapping(mappingText), [mappingText]);
  const fields = useMemo(() => fieldsFromText(mappingText), [mappingText]);
  const isEmpty = mappingText.trim().length === 0;
  const valid = parsed !== null;

  const onUpload = async (file: File) => {
    setMappingText(await file.text());
  };

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <Label htmlFor="index-name">ClickHouse table name</Label>
        <Input
          id="index-name"
          placeholder="e.g. logs_prod"
          value={indexName}
          onChange={(e) => setIndexName(e.target.value)}
        />
        <Hint>The CREATE TABLE name the converter will emit.</Hint>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <Label>Elasticsearch _mapping JSON</Label>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={loadSample}>
              <FileJson size={15} /> Load sample
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-ch-text hover:bg-ch-panel-2">
              <Upload size={15} /> Upload
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onUpload(f);
                }}
              />
            </label>
          </div>
        </div>

        <JsonEditor value={mappingText} onChange={setMappingText} />

        <div className="mt-3 flex items-center gap-2 text-sm">
          {isEmpty ? (
            <span className="text-ch-muted">
              Paste a mapping, load the sample, or upload a file to continue.
            </span>
          ) : valid ? (
            <span className="flex items-center gap-1.5 text-ch-suggestion">
              <CheckCircle2 size={15} /> Valid JSON — {fields.paths.length} field
              {fields.paths.length === 1 ? '' : 's'} detected
              {fields.dateFields.length > 0 &&
                `, ${fields.dateFields.length} date field${fields.dateFields.length === 1 ? '' : 's'}`}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-ch-danger">
              <AlertCircle size={15} /> Invalid JSON — fix before continuing
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
