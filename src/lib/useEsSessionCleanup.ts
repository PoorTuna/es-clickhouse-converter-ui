import { useEffect } from 'react';
import { useEsStore } from '@/store/esStore';

/**
 * Best-effort release of the live ES session when the tab is closed or hidden.
 * sendBeacon can only POST, so the disconnect endpoint is POST; anything this
 * misses (crash, hard reload) is reaped server-side by the session idle TTL.
 */
export function useEsSessionCleanup(): void {
  useEffect(() => {
    const release = () => {
      const { sessionId } = useEsStore.getState();
      if (!sessionId) return;
      const body = new Blob([JSON.stringify({ session_id: sessionId })], {
        type: 'application/json',
      });
      navigator.sendBeacon('/es/disconnect', body);
    };
    window.addEventListener('pagehide', release);
    return () => window.removeEventListener('pagehide', release);
  }, []);
}
