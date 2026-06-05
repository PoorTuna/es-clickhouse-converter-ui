import { useMutation } from '@tanstack/react-query';
import { convert, ConvertError, type ConvertRequest, type ConvertResponse } from './client';

const MAX_RETRIES = 2;

/** Retry transient failures (network / 5xx) but never client errors (4xx). */
function shouldRetry(failureCount: number, error: Error): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (error instanceof ConvertError && error.status < 500) return false;
  return true;
}

export function useConvert() {
  return useMutation<ConvertResponse, Error, ConvertRequest>({
    mutationFn: convert,
    retry: shouldRetry,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
  });
}
