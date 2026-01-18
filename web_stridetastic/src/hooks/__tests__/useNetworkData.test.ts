import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNetworkData } from '@/hooks/useNetworkData';
import type { Node, Edge, ForceGraphNode, ForceGraphLink } from '@/types';
import type { ActivityTimeRange } from '@/lib/activityFilters';

const getNodesMock = vi.fn();
const getEdgesMock = vi.fn();

vi.mock('@/lib/api', () => ({
  apiClient: {
    getNodes: (...args: any[]) => getNodesMock(...args),
    getEdges: (...args: any[]) => getEdgesMock(...args),
  },
}));

const transformMock = vi.fn();

vi.mock('@/lib/networkTransforms', () => ({
  transformNetworkData: (...args: any[]) => transformMock(...args),
}));

const nodes: Node[] = [
  {
    id: 1,
    node_num: 1,
    node_id: 'node-1',
    mac_address: '00:11:22:33:44:55',
    is_licensed: false,
    is_low_entropy_public_key: false,
    has_private_key: false,
    is_virtual: false,
    first_seen: '2026-01-13T11:00:00.000Z',
    last_seen: '2026-01-13T11:59:00.000Z',
  },
];

const edges: Edge[] = [
  {
    source_node_id: 1,
    target_node_id: 1,
    first_seen: '2026-01-13T11:00:00.000Z',
    last_seen: '2026-01-13T11:59:00.000Z',
    last_packet_id: 1,
    last_rx_rssi: -50,
    last_rx_snr: 5,
    last_hops: 0,
    edge_type: 'PHYSICAL',
    interfaces_names: [],
  },
];

describe('useNetworkData', () => {
  beforeEach(() => {
    getNodesMock.mockReset();
    getEdgesMock.mockReset();
    transformMock.mockReset();
  });

  it('fetches data and sets transformed graph', async () => {
    getNodesMock.mockResolvedValueOnce({ data: nodes });
    getEdgesMock.mockResolvedValueOnce({ data: edges });

    const transformed = {
      nodes: [{ id: 'node-1' } as ForceGraphNode],
      links: [{ source: 'node-1', target: 'node-1' } as ForceGraphLink],
      virtualEdgeSet: new Set<string>(),
    };
    transformMock.mockImplementation(() => transformed);

    const { result } = renderHook(() =>
      useNetworkData('graph', false, true, false, false, 'all', 'all')
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getNodesMock).toHaveBeenCalledWith({ last: 'all' });
    expect(getEdgesMock).toHaveBeenCalledWith({ last: 'all' });
    expect(result.current.graphData.nodes).toEqual(transformed.nodes);
    expect(result.current.graphData.links).toEqual(transformed.links);
  });

  it('re-transforms data when filters change', async () => {
    getNodesMock.mockResolvedValue({ data: nodes });
    getEdgesMock.mockResolvedValue({ data: edges });

    const transformed = {
      nodes: [{ id: 'node-1' } as ForceGraphNode],
      links: [] as ForceGraphLink[],
      virtualEdgeSet: new Set<string>(),
    };

    transformMock.mockImplementation(() => transformed);

    const { rerender } = renderHook(
      ({ activityFilter }: { activityFilter: ActivityTimeRange }) =>
        useNetworkData('graph', false, true, false, false, activityFilter, activityFilter),
      { initialProps: { activityFilter: 'all' } }
    );

    await waitFor(() => {
      expect(getNodesMock).toHaveBeenCalled();
    });

    rerender({ activityFilter: '1hour' });

    await waitFor(() => {
      expect(transformMock).toHaveBeenCalled();
    });

    const lastCall = transformMock.mock.calls[transformMock.mock.calls.length - 1];
    expect(lastCall[0]).toBe('graph');
    expect(lastCall[7]).toBe('1hour');
    expect(lastCall[8]).toBe('1hour');
  });

  it('sets error state on fetch failure', async () => {
    getNodesMock.mockRejectedValueOnce(new Error('fail'));
    getEdgesMock.mockResolvedValueOnce({ data: edges });

    const { result } = renderHook(() =>
      useNetworkData('graph', false, true, false, false, 'all', 'all')
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load network data');
  });
});
