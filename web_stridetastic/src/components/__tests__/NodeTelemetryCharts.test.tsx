import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NodeTelemetryCharts from '@/components/NodeTelemetryCharts';

vi.mock('@/components/SparklineChart', () => ({
  default: () => <div data-testid="sparkline-chart" />,
}));

describe('NodeTelemetryCharts', () => {
  it('renders loading state', () => {
    render(
      <NodeTelemetryCharts
        data={[]}
        isLoading
        error={null}
        selectedRange="all"
        onRangeChange={() => {}}
      />
    );

    expect(screen.getByText(/loading telemetry history/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <NodeTelemetryCharts
        data={[]}
        isLoading={false}
        error="fail"
        selectedRange="all"
        onRangeChange={() => {}}
      />
    );

    expect(screen.getByText(/fail/i)).toBeInTheDocument();
  });

  it('renders no data state', () => {
    render(
      <NodeTelemetryCharts
        data={[]}
        isLoading={false}
        error={null}
        selectedRange="all"
        onRangeChange={() => {}}
      />
    );

    expect(screen.getByText(/no telemetry data/i)).toBeInTheDocument();
  });
});
