import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GraphControls } from '@/components/GraphControls';

const baseProps = {
  maxHops: 2,
  onMaxHopsChange: vi.fn(),
  showBidirectionalOnly: false,
  onShowBidirectionalOnlyChange: vi.fn(),
  showMqttInterface: false,
  onShowMqttInterfaceChange: vi.fn(),
  forceBidirectional: false,
  onForceBidirectionalChange: vi.fn(),
  excludeMultiHop: false,
  onExcludeMultiHopChange: vi.fn(),
  activityFilter: 'all' as const,
  onActivityFilterChange: vi.fn(),
  onZoomIn: vi.fn(),
  onZoomOut: vi.fn(),
  onZoomToFit: vi.fn(),
  onRefresh: vi.fn(),
  isLoading: false,
  isRefreshing: false,
  lastUpdate: new Date('2026-01-13T11:00:00.000Z'),
  nodeCount: 3,
  linkCount: 2,
  interfaces: [],
  selectedInterfaceIds: [],
  onSelectedInterfaceIdsChange: vi.fn(),
  showAdvanced: true,
  setShowAdvanced: vi.fn(),
};

describe('GraphControls', () => {
  it('updates max hops input with clamp', () => {
    render(<GraphControls {...baseProps} />);

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    expect(baseProps.onMaxHopsChange).toHaveBeenCalledWith(7);
  });

  it('toggles bidirectional checkbox', () => {
    render(<GraphControls {...baseProps} />);

    fireEvent.click(screen.getByLabelText(/bidirectional only/i));
    expect(baseProps.onShowBidirectionalOnlyChange).toHaveBeenCalledWith(true);
  });
});
