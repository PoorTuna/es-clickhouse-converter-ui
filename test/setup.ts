import '@testing-library/jest-dom/vitest';
import { createElement } from 'react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './msw/handlers';

// Monaco never mounts in jsdom; swap it for a plain textarea so editor-backed
// components are renderable and their value/onChange are testable.
vi.mock('@monaco-editor/react', () => ({
  default: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange?: (value: string | undefined) => void;
  }) =>
    createElement('textarea', {
      'data-testid': 'monaco',
      value: value ?? '',
      onChange: (event: { target: { value: string } }) => onChange?.(event.target.value),
    }),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
