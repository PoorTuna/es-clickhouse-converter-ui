import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useConvert } from '@/api/useConvert';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useConvert', () => {
  it('returns DDL on success', async () => {
    const { result } = renderHook(() => useConvert(), { wrapper });
    result.current.mutate({
      index_name: 'logs_prod',
      mapping: { properties: { '@timestamp': { type: 'date' } } },
      config: null,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.table_name).toBe('logs_prod');
    expect(result.current.data?.ddl).toContain('CREATE TABLE');
  });

  it('surfaces a 400 error detail', async () => {
    const { result } = renderHook(() => useConvert(), { wrapper });
    result.current.mutate({
      index_name: 'bad',
      mapping: null as unknown as Record<string, unknown>,
      config: null,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Invalid mapping');
  });
});
