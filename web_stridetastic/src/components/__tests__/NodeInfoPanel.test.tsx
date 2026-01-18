import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NodeInfoPanel } from '@/components/NodeInfoPanel';

vi.mock('@/components/NodeActionButtons', () => ({
  NodeActionButtons: () => <div data-testid="node-action-buttons" />,
}));

const baseNode = {
  id: 1,
  node_num: 1,
  node_id: 'node-1',
  mac_address: '00:11:22:33:44:55',
  is_licensed: false,
  is_low_entropy_public_key: false,
  has_private_key: false,
  is_virtual: false,
  first_seen: '2026-01-01T00:00:00.000Z',
  last_seen: '2026-01-13T11:00:00.000Z',
  latitude: 40.0,
  longitude: -70.0,
};

describe('NodeInfoPanel', () => {
  it('invokes onNavigateToMap when button clicked', () => {
    const onNavigateToMap = vi.fn();

    render(
      <NodeInfoPanel
        node={baseNode as any}
        title="Node"
        borderColor="#000"
        onNavigateToMap={onNavigateToMap}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /view on map/i }));
    expect(onNavigateToMap).toHaveBeenCalledWith('node-1');
  });
});
