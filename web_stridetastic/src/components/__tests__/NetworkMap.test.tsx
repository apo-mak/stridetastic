import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NetworkMap from '@/components/NetworkMap';

vi.mock('next/dynamic', () => ({
  default: () => (props: any) => <div data-testid="leaflet" {...props} />,
}));

vi.mock('@/hooks/useNetworkData', () => ({
  useNetworkData: () => ({
    graphData: { nodes: [], links: [] },
    isLoading: false,
    error: 'Failed to load network data',
    refetch: vi.fn(),
    lastUpdate: new Date('2026-01-13T11:00:00.000Z'),
  }),
}));

vi.mock('@/contexts/MapFocusContext', () => ({
  useMapFocus: () => ({
    focusedNodeId: null,
    shouldFocusOnLoad: false,
    setFocusedNodeId: vi.fn(),
    setShouldFocusOnLoad: vi.fn(),
  }),
}));

describe('NetworkMap', () => {
  it('renders error message when network data fails', () => {
    render(<NetworkMap />);

    expect(screen.getByText(/failed to load network data/i)).toBeInTheDocument();
  });
});
