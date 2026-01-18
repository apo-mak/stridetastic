import { describe, expect, it } from 'vitest';
import { computeSparklineSeries } from '@/lib/charts/sparkline';

describe('computeSparklineSeries', () => {
  it('returns null for non-positive dimensions', () => {
    expect(computeSparklineSeries([], { width: 0, height: 10 })).toBeNull();
    expect(computeSparklineSeries([], { width: 10, height: 0 })).toBeNull();
  });

  it('returns null when drawable area is zero or negative', () => {
    const result = computeSparklineSeries([{ timestamp: 0, value: 1 }], {
      width: 10,
      height: 10,
      leftPadding: 10,
      rightPadding: 0,
      topPadding: 5,
      bottomPadding: 5,
    });
    expect(result).toBeNull();
  });

  it('filters out invalid points and computes series', () => {
    const series = computeSparklineSeries(
      [
        { timestamp: '2026-01-01T00:00:00.000Z', value: 10 },
        { timestamp: 'invalid', value: 20 },
        { timestamp: '2026-01-02T00:00:00.000Z', value: 30 },
        { timestamp: 123, value: Number.NaN },
      ],
      { width: 100, height: 50 }
    );

    expect(series).not.toBeNull();
    expect(series?.points.length).toBe(2);
    expect(series?.minValue).toBe(10);
    expect(series?.maxValue).toBe(30);
    expect(series?.path.startsWith('M')).toBe(true);
    expect(series?.areaPath.includes('Z')).toBe(true);
  });

  it('handles flat series with identical values', () => {
    const series = computeSparklineSeries(
      [
        { timestamp: 0, value: 5 },
        { timestamp: 1, value: 5 },
      ],
      { width: 100, height: 50 }
    );

    expect(series).not.toBeNull();
    expect(series?.minValue).toBe(5);
    expect(series?.maxValue).toBe(5);
    expect(series?.latestValue).toBe(5);
  });
});
