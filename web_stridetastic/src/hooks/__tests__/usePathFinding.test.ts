import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePathFinding } from '@/hooks/usePathFinding';
import type { ForceGraphLink } from '@/types';

const links: ForceGraphLink[] = [
  { source: 'A', target: 'B', rssi: -50, snr: 5, hops: 0, last_seen: '2026-01-13T11:00:00.000Z' },
  { source: 'B', target: 'C', rssi: -50, snr: 5, hops: 0, last_seen: '2026-01-13T11:00:00.000Z' },
];

describe('usePathFinding', () => {
  it('returns paths between two selected nodes', () => {
    const { result } = renderHook(() =>
      usePathFinding('A', 'C', links, 3, new Set(), 10)
    );

    expect(result.current.pathsBetweenNodes).toEqual([['A', 'B', 'C']]);
    expect(result.current.pathNodeSet.has('A')).toBe(true);
    expect(result.current.pathNodeSet.has('C')).toBe(true);
  });

  it('returns reachable nodes and links for single selection', () => {
    const { result } = renderHook(() => usePathFinding('A', null, links, 2));

    expect(result.current.pathsBetweenNodes).toEqual([]);
    expect(result.current.reachableNodesFromSelected.has('A')).toBe(true);
    expect(result.current.reachableNodesFromSelected.has('B')).toBe(true);
    expect(result.current.reachableLinksFromSelected.has('A-B')).toBe(true);
    expect(result.current.reachableLinksFromSelected.has('B-C')).toBe(true);
  });

  it('returns empty sets when two nodes are selected', () => {
    const { result } = renderHook(() => usePathFinding('A', 'B', links, 2));

    expect(result.current.reachableNodesFromSelected.size).toBe(0);
    expect(result.current.reachableLinksFromSelected.size).toBe(0);
  });
});
