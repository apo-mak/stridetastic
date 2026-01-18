import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SparklineChart from '@/components/SparklineChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  Tooltip: () => <div data-testid="tooltip" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}));

const series = {
  width: 100,
  height: 40,
  path: 'M0 0',
  areaPath: 'M0 0 Z',
  points: [{ timestamp: 1, value: 1, x: 0, y: 0 }],
  minValue: 1,
  maxValue: 1,
  latestValue: 1,
  firstTimestamp: 1,
  lastTimestamp: 1,
  baselineY: 0,
  topY: 0,
  leftX: 0,
  rightX: 0,
};

describe('SparklineChart', () => {
  it('renders no data state', () => {
    render(<SparklineChart seriesList={[]} width={100} height={40} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('renders chart container when series provided', () => {
    render(
      <SparklineChart
        seriesList={[{ id: 's1', series, color: '#000' }]}
        width={100}
        height={40}
        ariaLabel="Sparkline"
      />
    );

    expect(screen.getByRole('img', { name: /sparkline/i })).toBeInTheDocument();
  });
});
