import { beforeEach, describe, expect, it } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ResultStep } from '@/components/steps/ResultStep';
import { useWizardStore } from '@/store/wizardStore';
import { server } from './msw/handlers';
import { renderWithProviders, resetStore } from './util';

function seedValidInput() {
  act(() =>
    useWizardStore.setState({
      indexName: 'logs',
      mappingText: JSON.stringify({ properties: { '@timestamp': { type: 'date' } } }),
    }),
  );
}

describe('ResultStep', () => {
  beforeEach(resetStore);

  it('renders generated DDL from the backend', async () => {
    seedValidInput();
    renderWithProviders(<ResultStep />);

    await waitFor(() =>
      expect((screen.getByTestId('monaco') as HTMLTextAreaElement).value).toContain('CREATE TABLE'),
    );
  });

  it('shows an error with a working Retry control on failure', async () => {
    server.use(http.post('/convert', () => HttpResponse.json({ detail: 'boom' }, { status: 400 })));
    seedValidInput();
    renderWithProviders(<ResultStep />);

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('boom'));
    const retry = screen.getByRole('button', { name: /Retry/ });
    expect(retry).toBeEnabled();
    await userEvent.click(retry);
    expect(await screen.findByRole('alert')).toHaveTextContent('boom');
  });
});
