import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import KeyHealthPanel from '@/components/KeyHealthPanel';

const getNodeKeyHealthMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api', () => ({
  apiClient: {
    getNodeKeyHealth: (...args: any[]) => getNodeKeyHealthMock(...args),
  },
}));

describe('KeyHealthPanel', () => {
  beforeEach(() => {
    getNodeKeyHealthMock.mockReset();
  });

  it('renders loading then data', async () => {
    getNodeKeyHealthMock.mockResolvedValueOnce({
      data: [
        {
          node_id: 'node-1',
          node_num: 1,
          mac_address: '00:11:22:33:44:55',
          public_key: 'abc',
          is_virtual: false,
          is_low_entropy_public_key: true,
          duplicate_count: 2,
          duplicate_node_ids: ['node-2'],
          first_seen: '2026-01-01T00:00:00.000Z',
          last_seen: '2026-01-13T11:00:00.000Z',
        },
      ],
    });

    render(<KeyHealthPanel />);

    expect(screen.getByText(/loading key health/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/node-1/i).length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText(/low entropy/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/duplicate \(2\)/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/flagged nodes/i)).toBeInTheDocument();
  });
});
