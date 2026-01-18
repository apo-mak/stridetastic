import { describe, expect, it } from 'vitest';
import { formatLocationSourceLabel } from '@/lib/position';

describe('formatLocationSourceLabel', () => {
  it('returns Unknown for empty values', () => {
    expect(formatLocationSourceLabel()).toBe('Unknown');
    expect(formatLocationSourceLabel(null)).toBe('Unknown');
    expect(formatLocationSourceLabel('   ')).toBe('Unknown');
  });

  it('maps known LOC_ labels', () => {
    expect(formatLocationSourceLabel('LOC_INTERNAL')).toBe('Internal GPS');
    expect(formatLocationSourceLabel('LOC_EXTERNAL')).toBe('External GPS');
    expect(formatLocationSourceLabel('LOC_REMOTE')).toBe('Remote Device');
  });

  it('accepts raw values without LOC_ prefix', () => {
    expect(formatLocationSourceLabel('internal')).toBe('Internal GPS');
    expect(formatLocationSourceLabel('external')).toBe('External GPS');
    expect(formatLocationSourceLabel('manual')).toBe('Manual Entry');
  });

  it('formats unknown values into title case', () => {
    expect(formatLocationSourceLabel('CUSTOM_SOURCE')).toBe('Custom Source');
    expect(formatLocationSourceLabel('loc_custom_label')).toBe('Custom Label');
  });
});
