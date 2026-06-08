import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { Stepper } from './components/Stepper';
import { Footer } from './components/Footer';
import { InputStep } from './components/steps/InputStep';
import { ConfigStep } from './components/steps/ConfigStep';
import { ResultStep } from './components/steps/ResultStep';
import { useWizardStore } from './store/wizardStore';
import { useEsSessionCleanup } from './lib/useEsSessionCleanup';

export default function App() {
  const step = useWizardStore((s) => s.step);
  useEsSessionCleanup();

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <OfflineBanner />
      <Stepper />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            {step === 'input' && <InputStep />}
            {step === 'config' && <ConfigStep />}
            {step === 'result' && <ResultStep />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
