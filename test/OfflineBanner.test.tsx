import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { OfflineBanner } from '@/components/OfflineBanner';
import { server } from './msw/handlers';
import { renderWithProviders } from './util';

describe('OfflineBanner', () => {
  it('stays hidden while the backend is healthy', async () => {
    renderWithProviders(<OfflineBanner />);
    await waitFor(() => undefined);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('warns when the backend is unreachable', async () => {
    server.use(http.get('/health', () => HttpResponse.error()));
    renderWithProviders(<OfflineBanner />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/unreachable/);
  });
});
