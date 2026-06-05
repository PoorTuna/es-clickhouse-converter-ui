import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DEFAULT_CONFIG, useWizardStore } from '@/store/wizardStore';

/** Reset the persisted singleton store to a clean slate between tests. */
export function resetStore() {
  localStorage.clear();
  useWizardStore.setState({
    step: 'input',
    indexName: '',
    mappingText: '',
    config: DEFAULT_CONFIG,
  });
}

function Providers({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: Providers });
}
