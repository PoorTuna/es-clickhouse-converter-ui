import { beforeEach, describe, expect, it } from 'vitest';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigStep } from '@/components/steps/ConfigStep';
import { useWizardStore } from '@/store/wizardStore';
import { renderWithProviders, resetStore } from './util';

function setMapping(mapping: unknown) {
  act(() => useWizardStore.setState({ mappingText: JSON.stringify(mapping) }));
}

describe('ConfigStep', () => {
  beforeEach(resetStore);

  it('renders every tier section', () => {
    setMapping({ properties: { level: { type: 'keyword' } } });
    renderWithProviders(<ConfigStep />);

    expect(screen.getByText('Sorting & partitioning')).toBeInTheDocument();
    expect(screen.getByText('Types & cardinality')).toBeInTheDocument();
    expect(screen.getByText('Codecs, indexes & computed columns')).toBeInTheDocument();
    expect(screen.getByText('Engine & misc')).toBeInTheDocument();
  });

  it('hides the Object fields tier without object roots', () => {
    setMapping({ properties: { level: { type: 'keyword' } } });
    renderWithProviders(<ConfigStep />);

    expect(screen.queryByText('Object fields')).not.toBeInTheDocument();
  });

  it('shows the Object fields tier when the mapping has object roots', () => {
    setMapping({ properties: { svc: { properties: { name: { type: 'keyword' } } } } });
    renderWithProviders(<ConfigStep />);

    expect(screen.getByText('How nested objects become columns')).toBeInTheDocument();
  });

  it('round-trips an ORDER BY entry into the store', async () => {
    setMapping({ properties: { level: { type: 'keyword' } } });
    renderWithProviders(<ConfigStep />);

    await userEvent.type(screen.getByLabelText('ORDER BY'), 'level{Enter}');

    expect(useWizardStore.getState().config.order_by).toContain('level');
  });
});
