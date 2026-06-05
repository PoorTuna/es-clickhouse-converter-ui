import { useCallback, useEffect, useState } from 'react';
import { checkHealth } from '@/api/client';

export type HealthStatus = 'checking' | 'ok' | 'unreachable';

/** Probes the backend on mount so a dead backend shows a banner up front
 *  instead of only surfacing once the user reaches the Result step. */
export function useHealth() {
  const [status, setStatus] = useState<HealthStatus>('checking');

  const probe = useCallback(async () => {
    setStatus('checking');
    setStatus((await checkHealth()) ? 'ok' : 'unreachable');
  }, []);

  useEffect(() => {
    void probe();
  }, [probe]);

  return { status, recheck: probe };
}
