import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import NodeDetailsModal from '@/components/NodeDetailsModal';

const pushMock = vi.fn();
const searchParamsGetMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: searchParamsGetMock }),
}));

const apiMocks = vi.hoisted(() => ({
  getNodePositionHistory: vi.fn(),
  getNodeTelemetryHistory: vi.fn(),
  getNodeLatencyHistory: vi.fn(),
  getNodePortActivity: vi.fn(),
  getNodePortPackets: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  apiClient: apiMocks,
}));

vi.mock('@/components/NodePositionHistoryMap', () => ({
  default: () => <div data-testid="position-map" />,
}));
vi.mock('@/components/NodeTelemetryCharts', () => ({
  default: () => <div data-testid="telemetry-charts" />,
}));
vi.mock('@/components/NodeLatencyHistoryChart', () => ({
  default: () => <div data-testid="latency-chart" />,
}));

const node = {
  id: 1,
  node_num: 1,
  node_id: 'node-1',
  mac_address: '00:11:22:33:44:55',
  is_licensed: false,
  is_low_entropy_public_key: false,
  has_private_key: false,
  is_virtual: false,
  first_seen: '2026-01-01T00:00:00.000Z',
  last_seen: '2026-01-13T11:00:00.000Z',
};

describe('NodeDetailsModal', () => {
  beforeEach(() => {
    Object.values(apiMocks).forEach((mock) => mock.mockReset());
    pushMock.mockReset();
    searchParamsGetMock.mockReset();
  });

  it('fetches history when opened', async () => {
    apiMocks.getNodePositionHistory.mockResolvedValue({
      data: [
        {
          id: 1,
          node_id: 'node-1',
          latitude: 45.0,
          longitude: -93.0,
          altitude: 10,
          created_at: '2026-01-13T10:00:00.000Z',
        },
      ],
    });
    apiMocks.getNodeTelemetryHistory.mockResolvedValue({ data: [] });
    apiMocks.getNodeLatencyHistory.mockResolvedValue({ data: [] });
    apiMocks.getNodePortActivity.mockResolvedValue({ data: [] });

    render(<NodeDetailsModal node={node as any} isOpen onClose={() => {}} />);

    await waitFor(() => {
      expect(apiMocks.getNodePositionHistory).toHaveBeenCalledWith('node-1', { limit: 150 });
      expect(apiMocks.getNodeTelemetryHistory).toHaveBeenCalled();
      expect(apiMocks.getNodeLatencyHistory).toHaveBeenCalled();
      expect(apiMocks.getNodePortActivity).toHaveBeenCalledWith('node-1');
    });

    await waitFor(() => {
      expect(screen.getByTestId('position-map')).toBeInTheDocument();
      expect(screen.getByTestId('telemetry-charts')).toBeInTheDocument();
      expect(screen.getByTestId('latency-chart')).toBeInTheDocument();
    });
  });
});
