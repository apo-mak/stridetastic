import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OverviewMetricHistoryModal from '@/components/OverviewMetricHistoryModal';

vi.mock('@/components/SparklineChart', () => ({
  default: () => <div data-testid="sparkline-chart" />,
}));

describe('OverviewMetricHistoryModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <OverviewMetricHistoryModal
        metricKey={null}
        isOpen={false}
        onClose={() => {}}
        history={[]}
        currentMetrics={{
          totalNodes: 0,
          activeNodes: 0,
          reachableNodes: 0,
          activeConnections: 0,
          channels: 0,
          avgBattery: null,
          avgRSSI: null,
          avgSNR: null,
        }}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders metric history and delta', () => {
    render(
      <OverviewMetricHistoryModal
        metricKey="totalNodes"
        isOpen
        onClose={() => {}}
        history={[
          {
            timestamp: '2026-01-13T10:00:00.000Z',
            total_nodes: 10,
            active_nodes: 5,
            reachable_nodes: 4,
            active_connections: 2,
            channels: 1,
            avg_battery: null,
            avg_rssi: null,
            avg_snr: null,
          },
          {
            timestamp: '2026-01-13T11:00:00.000Z',
            total_nodes: 12,
            active_nodes: 6,
            reachable_nodes: 5,
            active_connections: 3,
            channels: 1,
            avg_battery: null,
            avg_rssi: null,
            avg_snr: null,
          },
        ]}
        currentMetrics={{
          totalNodes: 13,
          activeNodes: 6,
          reachableNodes: 5,
          activeConnections: 3,
          channels: 1,
          avgBattery: null,
          avgRSSI: null,
          avgSNR: null,
        }}
      />
    );

    expect(screen.getByText(/total nodes history/i)).toBeInTheDocument();
    expect(screen.getByTestId('sparkline-chart')).toBeInTheDocument();
    expect(screen.getByText(/current value/i)).toBeInTheDocument();
  });
});
