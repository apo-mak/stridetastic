import React, { useImperativeHandle } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const mockedNetworkData = vi.hoisted(() => ({
  graphData: {
    nodes: [
      {
        id: 'node-a',
        node_id: 'node-a',
        node_num: 1,
        color: '#22c55e',
        size: 8,
        last_seen: '2026-01-13T11:00:00.000Z',
      },
    ],
    links: [],
  },
  rawData: {
    nodes: [
      {
        id: 1,
        node_id: 'node-a',
        node_num: 1,
        last_seen: '2026-01-13T11:00:00.000Z',
        interfaces: [],
      },
    ],
    edges: [],
  },
  virtualEdgeSet: new Set<string>(),
  isLoading: false,
  error: null,
  lastUpdate: new Date('2026-01-13T11:00:00.000Z'),
  refetch: vi.fn(),
}));

const mockGetInterfaces = vi.hoisted(() => vi.fn().mockResolvedValue({ data: [] }));

let NetworkGraph: typeof import('@/components/NetworkGraph').default;

vi.mock('@/hooks/useNetworkData', () => ({
  useNetworkData: () => mockedNetworkData,
}));

vi.mock('@/hooks/useNodeSelection', () => ({
  useNodeSelection: () => ({
    selectedNode: null,
    selectedNodeId: null,
    secondSelectedNode: null,
    secondSelectedNodeId: null,
    handleNodeClick: vi.fn(),
    clearSelection: vi.fn(),
    swapNodes: vi.fn(),
    selectNodeById: vi.fn(),
  }),
}));

vi.mock('@/hooks/useGraphDimensions', () => ({
  useGraphDimensions: () => ({ dimensions: { width: 800, height: 600 }, updateDimensions: vi.fn() }),
}));

vi.mock('@/hooks/usePathFinding', () => ({
  usePathFinding: () => ({
    pathsBetweenNodes: [],
    pathNodeSet: new Set<string>(),
    reachableNodesFromSelected: new Set<string>(),
    reachableLinksFromSelected: new Set<string>(),
  }),
}));

vi.mock('@/hooks/useAutoRefresh', () => ({
  useAutoRefresh: () => {},
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn(), toString: () => '' }),
}));

vi.mock('@/lib/api', () => ({
  apiClient: {
    getInterfaces: mockGetInterfaces,
  },
}));

vi.mock('@/components/GraphCanvas', () => {
  const GraphCanvas = React.forwardRef((props: any, ref: any) => {
    useImperativeHandle(ref, () => ({
      zoom: vi.fn(),
      zoomToFit: vi.fn(),
      getZoom: () => 1,
    }));
    return <div data-testid="graph-canvas" />;
  });
  GraphCanvas.displayName = 'GraphCanvas';
  return { GraphCanvas };
});

describe('NetworkGraph', () => {
  beforeEach(async () => {
    mockedNetworkData.refetch.mockReset();
    mockGetInterfaces.mockResolvedValue({ data: [] });
    vi.resetModules();
    NetworkGraph = (await import('@/components/NetworkGraph')).default;
  });

  it('renders graph controls and canvas', async () => {
    render(<NetworkGraph />);

    await waitFor(() => {
      expect(screen.getByText(/network topology/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('graph-canvas')).toBeInTheDocument();
    });
  });
});
