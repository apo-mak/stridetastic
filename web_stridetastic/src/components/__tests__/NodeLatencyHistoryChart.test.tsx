import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import NodeLatencyHistoryChart from '@/components/NodeLatencyHistoryChart';

vi.mock('@/components/SparklineChart', () => ({
  default: () => <div data-testid="sparkline-chart" />,
}));

describe('NodeLatencyHistoryChart', () => {
  it('renders loading state', () => {
    render(
      <NodeLatencyHistoryChart
        data={[]}
        isLoading
        error={null}
        currentLatency={null}
        currentReachable={null}
      />
    );

    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders error state', () => {
    render(
      <NodeLatencyHistoryChart
        data={[]}
        isLoading={false}
        error="fail"
        currentLatency={null}
        currentReachable={null}
      />
    );

    expect(screen.getByText(/fail/i)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(
      <NodeLatencyHistoryChart
        data={[]}
        isLoading={false}
        error={null}
        currentLatency={null}
        currentReachable={null}
      />
    );

    expect(screen.getByText(/no latency probes/i)).toBeInTheDocument();
  });
});
