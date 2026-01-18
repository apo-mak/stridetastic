import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PathAnalysisPanel } from '@/components/PathAnalysisPanel';

const nodeA = {
  id: 1,
  node_num: 1,
  node_id: 'node-a',
  mac_address: '00:11:22:33:44:55',
  is_licensed: false,
  is_low_entropy_public_key: false,
  has_private_key: false,
  is_virtual: false,
  first_seen: '2026-01-01T00:00:00.000Z',
  last_seen: '2026-01-13T11:00:00.000Z',
  short_name: 'A',
} as any;

const nodeB = {
  id: 2,
  node_num: 2,
  node_id: 'node-b',
  mac_address: '00:11:22:33:44:66',
  is_licensed: false,
  is_low_entropy_public_key: false,
  has_private_key: false,
  is_virtual: false,
  first_seen: '2026-01-01T00:00:00.000Z',
  last_seen: '2026-01-13T11:00:00.000Z',
  short_name: 'B',
} as any;

describe('PathAnalysisPanel', () => {
  it('renders stats and handles actions', () => {
    const onSwapNodes = vi.fn();
    const onClose = vi.fn();

    render(
      <PathAnalysisPanel
        selectedNode={nodeA}
        secondSelectedNode={nodeB}
        validPaths={[['node-a', 'node-b']]}
        maxHops={3}
        onSwapNodes={onSwapNodes}
        onClose={onClose}
      />
    );

    expect(screen.getByText(/path analysis/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /swap/i }));
    expect(onSwapNodes).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle(/close/i));
    expect(onClose).toHaveBeenCalled();
  });
});
