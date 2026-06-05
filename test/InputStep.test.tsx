import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputStep } from '@/components/steps/InputStep';
import { useWizardStore } from '@/store/wizardStore';
import { renderWithProviders, resetStore } from './util';

const VALID_MAPPING = JSON.stringify({ properties: { level: { type: 'keyword' } } });

describe('InputStep', () => {
  beforeEach(resetStore);

  it('reports valid JSON with a detected field count', () => {
    renderWithProviders(<InputStep />);

    fireEvent.change(screen.getByTestId('monaco'), { target: { value: VALID_MAPPING } });

    expect(screen.getByText(/Valid JSON/)).toBeInTheDocument();
    expect(screen.getByText(/1 field detected/)).toBeInTheDocument();
  });

  it('flags invalid JSON', () => {
    renderWithProviders(<InputStep />);

    fireEvent.change(screen.getByTestId('monaco'), { target: { value: 'not json' } });

    expect(screen.getByText(/Invalid JSON/)).toBeInTheDocument();
  });

  it('loads the bundled sample mapping', async () => {
    renderWithProviders(<InputStep />);
    await userEvent.click(screen.getByRole('button', { name: /Load sample/ }));

    expect(useWizardStore.getState().indexName).not.toBe('');
    expect(useWizardStore.getState().mappingText).toContain('properties');
  });
});
