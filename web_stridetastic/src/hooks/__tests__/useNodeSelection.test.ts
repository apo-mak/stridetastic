import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNodeSelection } from '@/hooks/useNodeSelection';
import type { Node } from '@/types';

const getNodeMock = vi.fn();

vi.mock('@/lib/api', () => ({
  apiClient: {
    getNode: (...args: any[]) => getNodeMock(...args),
  },
}));

const makeApiNode = (nodeId: string): Node => ({
  id: 1,
  node_num: 1,
  node_id: nodeId,
  mac_address: '00:11:22:33:44:55',
  is_licensed: false,
  is_low_entropy_public_key: false,
  has_private_key: false,
  is_virtual: false,
  first_seen: '2026-01-13T11:00:00.000Z',
  last_seen: '2026-01-13T11:59:00.000Z',
});

describe('useNodeSelection', () => {
  beforeEach(() => {
    getNodeMock.mockReset();
  });

  it('ignores hidden nodes', async () => {
    const { result } = renderHook(() => useNodeSelection());

    await act(async () => {
      await result.current.handleNodeClick({ id: 'hidden', isHidden: true });
    });

    expect(getNodeMock).not.toHaveBeenCalled();
    expect(result.current.selectedNodeId).toBeNull();
  });

  it('selects MQTT broker without API call', async () => {
    const { result } = renderHook(() => useNodeSelection());

    await act(async () => {
      await result.current.handleNodeClick({ id: 'mqtt_broker', node_id: 'mqtt_broker', isMqttBroker: true });
    });

    expect(getNodeMock).not.toHaveBeenCalled();
    expect(result.current.selectedNodeId).toBe('mqtt_broker');
    expect(result.current.selectedNode?.node_id).toBe('mqtt_broker');
  });

  it('selects first and second node, then clears on reselect', async () => {
    getNodeMock.mockResolvedValueOnce({ data: makeApiNode('node-1') });
    getNodeMock.mockResolvedValueOnce({ data: makeApiNode('node-2') });
    getNodeMock.mockResolvedValueOnce({ data: makeApiNode('node-1') });

    const { result } = renderHook(() => useNodeSelection());

    await act(async () => {
      await result.current.handleNodeClick({ id: 'node-1', node_id: 'node-1' });
    });

    expect(result.current.selectedNodeId).toBe('node-1');

    await act(async () => {
      await result.current.handleNodeClick({ id: 'node-2', node_id: 'node-2' });
    });

    expect(result.current.secondSelectedNodeId).toBe('node-2');

    await act(async () => {
      await result.current.handleNodeClick({ id: 'node-1', node_id: 'node-1' });
    });

    expect(result.current.selectedNodeId).toBeNull();
    expect(result.current.secondSelectedNodeId).toBeNull();
  });

  it('replaces second node when a third is selected', async () => {
    getNodeMock.mockResolvedValueOnce({ data: makeApiNode('node-1') });
    getNodeMock.mockResolvedValueOnce({ data: makeApiNode('node-2') });
    getNodeMock.mockResolvedValueOnce({ data: makeApiNode('node-3') });

    const { result } = renderHook(() => useNodeSelection());

    await act(async () => {
      await result.current.handleNodeClick({ id: 'node-1', node_id: 'node-1' });
      await result.current.handleNodeClick({ id: 'node-2', node_id: 'node-2' });
      await result.current.handleNodeClick({ id: 'node-3', node_id: 'node-3' });
    });

    expect(result.current.selectedNodeId).toBe('node-1');
    expect(result.current.secondSelectedNodeId).toBe('node-3');
  });

  it('selectNodeById returns false on failure', async () => {
    getNodeMock.mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() => useNodeSelection());

    let ok = true;
    await act(async () => {
      ok = await result.current.selectNodeById('node-1');
    });

    expect(ok).toBe(false);
  });

  it('selectNodeById sets selection on success', async () => {
    getNodeMock.mockResolvedValueOnce({ data: makeApiNode('node-1') });

    const { result } = renderHook(() => useNodeSelection());

    let ok = false;
    await act(async () => {
      ok = await result.current.selectNodeById('node-1');
    });

    expect(ok).toBe(true);
    expect(result.current.selectedNodeId).toBe('node-1');
  });

  it('swapNodes exchanges selected nodes', async () => {
    getNodeMock.mockResolvedValueOnce({ data: makeApiNode('node-1') });
    getNodeMock.mockResolvedValueOnce({ data: makeApiNode('node-2') });

    const { result } = renderHook(() => useNodeSelection());

    await act(async () => {
      await result.current.handleNodeClick({ id: 'node-1', node_id: 'node-1' });
      await result.current.handleNodeClick({ id: 'node-2', node_id: 'node-2' });
    });

    act(() => {
      result.current.swapNodes();
    });

    expect(result.current.selectedNodeId).toBe('node-2');
    expect(result.current.secondSelectedNodeId).toBe('node-1');
  });
});
