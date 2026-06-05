import { beforeEach, describe, expect, it } from 'vitest';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Stepper } from '@/components/Stepper';
import { useWizardStore } from '@/store/wizardStore';
import { renderWithProviders, resetStore } from './util';

describe('Stepper', () => {
  beforeEach(resetStore);

  it('gates later steps until the input is valid', () => {
    renderWithProviders(<Stepper />);

    const configButton = screen.getByRole('button', { name: /Configure/ });
    expect(configButton).toBeDisabled();
    expect(configButton).toHaveAttribute('aria-disabled', 'true');
    expect(configButton).toHaveAccessibleName(/valid mapping and table name/);
  });

  it('lets the user jump to a reachable step once the gate passes', async () => {
    act(() => {
      useWizardStore.setState({
        indexName: 'logs',
        mappingText: JSON.stringify({ properties: { level: { type: 'keyword' } } }),
      });
    });
    renderWithProviders(<Stepper />);

    const configButton = screen.getByRole('button', { name: 'Configure' });
    expect(configButton).toBeEnabled();
    await userEvent.click(configButton);
    expect(useWizardStore.getState().step).toBe('config');
  });
});
