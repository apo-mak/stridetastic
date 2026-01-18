import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PortDetailsModal from '@/components/PortDetailsModal';

const getPortNodeActivityMock = vi.fn();

vi.mock('@/lib/api', () => ({
  apiClient: {
    getPortNodeActivity: (...args: any[]) => getPortNodeActivityMock(...args),
  },
}));

describe('PortDetailsModal', () => {
  beforeEach(() => {
    getPortNodeActivityMock.mockReset();
  });

  it('loads node activity and renders totals', async () => {
    getPortNodeActivityMock.mockResolvedValueOnce({
      data: [
        {
          node_id: 'node-1',
          node_num: 1,
          sent_count: 10,
          received_count: 5,
          total_packets: 15,
          last_sent: '2026-01-13T11:00:00.000Z',
          last_activity: '2026-01-13T11:00:00.000Z',
        },
      ],
    });

    render(
      <PortDetailsModal
        port={{ port: 'TEXT_MESSAGE_APP', display_name: 'Text', total_packets: 15, last_seen: '2026-01-13T11:00:00.000Z' }}
        isOpen
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      expect(getPortNodeActivityMock).toHaveBeenCalledWith('TEXT_MESSAGE_APP');
    });

    expect(await screen.findByText(/sending nodes/i)).toBeInTheDocument();
    expect(screen.getAllByText('15').length).toBeGreaterThan(0);
  });
});
