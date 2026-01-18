import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Overview from '@/components/Overview';

const apiMocks = vi.hoisted(() => ({
  getOverviewMetrics: vi.fn(),
  getNodes: vi.fn(),
  getChannelStatistics: vi.fn(),
  getInterfaces: vi.fn(),
  getPortActivity: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  apiClient: apiMocks,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn(), toString: () => '' }),
}));

vi.mock('@/hooks/useAutoRefresh', () => ({
  useAutoRefresh: () => {},
}));

vi.mock('@/components/NodeDetailsModal', () => ({
  default: () => <div data-testid="node-details-modal" />,
}));

vi.mock('@/components/ChannelDetailsModal', () => ({
  default: () => <div data-testid="channel-details-modal" />,
}));

vi.mock('@/components/InterfaceDetailsModal', () => ({
  default: () => <div data-testid="interface-details-modal" />,
}));

vi.mock('@/components/PortDetailsModal', () => ({
  default: () => <div data-testid="port-details-modal" />,
}));

vi.mock('@/components/OverviewMetricHistoryModal', () => ({
  default: () => <div data-testid="metric-history-modal" />,
}));

describe('Overview', () => {
  beforeEach(() => {
    Object.values(apiMocks).forEach((mock) => mock.mockReset());
  });

  it('renders overview after data load', async () => {
    apiMocks.getOverviewMetrics.mockResolvedValueOnce({
      data: {
        current: {
          total_nodes: 2,
          active_nodes: 1,
          reachable_nodes: 1,
          active_connections: 1,
          channels: 1,
          avg_battery: 50,
          avg_rssi: -60,
          avg_snr: 5,
        },
        history: [],
      },
    });
    apiMocks.getNodes.mockResolvedValueOnce({ data: [] });
    apiMocks.getChannelStatistics.mockResolvedValueOnce({ data: { channels: [] } });
    apiMocks.getInterfaces.mockResolvedValueOnce({ data: [] });
    apiMocks.getPortActivity.mockResolvedValueOnce({ data: [] });

    render(<Overview />);

    await waitFor(() => {
      expect(screen.getByText(/network overview/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/total nodes/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
