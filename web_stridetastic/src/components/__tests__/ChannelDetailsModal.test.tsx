import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ChannelDetailsModal from '@/components/ChannelDetailsModal';

const getChannelMock = vi.fn();

vi.mock('@/lib/api', () => ({
  apiClient: {
    getChannel: (...args: any[]) => getChannelMock(...args),
  },
}));

vi.mock('@/components/NodeDetailsModal', () => ({
  default: () => <div data-testid="node-details-modal" />,
}));

describe('ChannelDetailsModal', () => {
  beforeEach(() => {
    getChannelMock.mockReset();
  });

  it('loads channel details and renders AES info', async () => {
    getChannelMock.mockResolvedValueOnce({
      data: {
        channel_id: 'chan-1',
        channel_num: 1,
        total_messages: 5,
        first_seen: '2026-01-01T00:00:00.000Z',
        last_seen: '2026-01-13T11:00:00.000Z',
        psk: 'AQ==',
        members: [
          { node_id: 'node-1', last_seen: '2026-01-13T11:00:00.000Z' },
          { node_id: '!ffffffff', last_seen: '2026-01-13T11:00:00.000Z' },
        ],
      },
    });

    render(
      <ChannelDetailsModal
        channel={{
          channel_id: 'chan-1',
          channel_num: 1,
          total_messages: 5,
          members_count: 1,
          first_seen: '2026-01-01T00:00:00.000Z',
          last_seen: '2026-01-13T11:00:00.000Z',
          members: [],
        }}
        isOpen
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      expect(getChannelMock).toHaveBeenCalledWith('chan-1', 1);
    });

    expect(await screen.findByText(/default key/i)).toBeInTheDocument();
    expect(screen.getByText(/channel: chan-1/i)).toBeInTheDocument();
  });
});
