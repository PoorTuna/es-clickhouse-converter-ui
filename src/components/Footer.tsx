import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from './ui';
import { parseMapping } from '@/lib/extractFields';
import { useWizardStore } from '@/store/wizardStore';

export function Footer() {
  const { step, next, back, reset, mappingText, indexName } = useWizardStore();

  const mappingValid = parseMapping(mappingText) !== null;
  const canLeaveInput = mappingValid && indexName.trim().length > 0;
  const nextDisabled = step === 'input' && !canLeaveInput;

  return (
    <footer className="border-t border-ch-border bg-ch-panel">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div>
          {step !== 'input' && (
            <Button variant="ghost" onClick={back}>
              <ArrowLeft size={16} /> Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {step === 'result' ? (
            <Button variant="outline" onClick={reset}>
              <RotateCcw size={16} /> Start over
            </Button>
          ) : (
            <Button variant="primary" onClick={next} disabled={nextDisabled}>
              Next <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
