import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EsConnectForm } from '@/components/es/EsConnectForm';
import { useEsStore } from '@/store/esStore';
import { renderWithProviders } from './util';

describe('EsConnectForm', () => {
  beforeEach(() => useEsStore.getState().disconnect());

  it('shows the CA textarea only while TLS verification is on', async () => {
    renderWithProviders(<EsConnectForm />);

    expect(screen.getByLabelText(/CA certificate/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('checkbox', { name: /Verify TLS certificate/ }));
    expect(screen.queryByLabelText(/CA certificate/)).not.toBeInTheDocument();
  });

  it('disables Connect until a URL is entered', async () => {
    renderWithProviders(<EsConnectForm />);

    const connect = screen.getByRole('button', { name: /Connect/ });
    expect(connect).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/Cluster URL/), 'https://es:9200');
    expect(connect).toBeEnabled();
  });

  it('renders the connected state with cluster meta', async () => {
    await useEsStore.getState().connect({
      url: 'https://es:9200',
      username: 'u',
      password: 'p',
      tls_enabled: true,
      ca_cert: null,
    });

    renderWithProviders(<EsConnectForm />);
    expect(screen.getByText(/Connected to/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Disconnect/ })).toBeInTheDocument();
  });
});
