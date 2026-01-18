import { describe, expect, it } from 'vitest';
import { cn, formatBatteryLevel, formatDate, formatUptime, getBatteryColor, getRSSIColor, getSNRColor } from '@/lib/utils';

describe('utils', () => {
  it('cn merges tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', 'text-sm')).toBe('text-sm');
  });

  it('formatDate returns a string', () => {
    const value = formatDate('2026-01-13T12:34:56.000Z');
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThan(0);
  });

  it('formatDate returns Invalid Date for bad input', () => {
    expect(formatDate('not-a-date')).toBe('Invalid Date');
  });

  it('formatUptime handles unknown and boundaries', () => {
    expect(formatUptime()).toBe('Unknown');
    expect(formatUptime(0)).toBe('Unknown');
    expect(formatUptime(59)).toBe('0m');
    expect(formatUptime(60)).toBe('1m');
    expect(formatUptime(3600)).toBe('1h 0m');
    expect(formatUptime(25 * 3600)).toBe('1d 1h');
  });

  it('formatBatteryLevel handles undefined and values', () => {
    expect(formatBatteryLevel()).toBe('Unknown');
    expect(formatBatteryLevel(null as any)).toBe('Unknown');
    expect(formatBatteryLevel(0)).toBe('0%');
    expect(formatBatteryLevel(42)).toBe('42%');
  });

  it('getRSSIColor returns expected thresholds', () => {
    expect(getRSSIColor(-50)).toBe('#10b981');
    expect(getRSSIColor(-69)).toBe('#f59e0b');
    expect(getRSSIColor(-90)).toBe('#ef4444');
    expect(getRSSIColor(-91)).toBe('#6b7280');
  });

  it('getSNRColor returns expected thresholds', () => {
    expect(getSNRColor(10)).toBe('#10b981');
    expect(getSNRColor(5)).toBe('#84cc16');
    expect(getSNRColor(0)).toBe('#f59e0b');
    expect(getSNRColor(-5)).toBe('#f97316');
    expect(getSNRColor(-6)).toBe('#ef4444');
  });

  it('getBatteryColor returns expected thresholds', () => {
    expect(getBatteryColor()).toBe('#6b7280');
    expect(getBatteryColor(60)).toBe('#10b981');
    expect(getBatteryColor(30)).toBe('#f59e0b');
    expect(getBatteryColor(10)).toBe('#ef4444');
  });
});
