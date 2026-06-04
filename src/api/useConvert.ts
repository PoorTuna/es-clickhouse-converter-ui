import { useMutation } from '@tanstack/react-query';
import { convert, type ConvertRequest, type ConvertResponse } from './client';

export function useConvert() {
  return useMutation<ConvertResponse, Error, ConvertRequest>({
    mutationFn: convert,
  });
}
