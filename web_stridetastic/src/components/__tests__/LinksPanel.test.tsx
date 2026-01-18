import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import LinksPanel from '@/components/LinksPanel';

const apiMocks = vi.hoisted(() => ({
  getLinks: vi.fn(),
  getLink: vi.fn(),
  getLinkPackets: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  apiClient: apiMocks,
}));

describe('LinksPanel', () => {
  beforeEach(() => {
    Object.values(apiMocks).forEach((mock) => mock.mockReset());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads links and selects first link by default', async () => {
    apiMocks.getLinks.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          node_a: { id: 1, node_id: 'node-a', node_num: 1, short_name: 'A' },
          node_b: { id: 2, node_id: 'node-b', node_num: 2, short_name: 'B' },
          node_a_to_node_b_packets: 5,
          node_b_to_node_a_packets: 1,
          total_packets: 6,
          is_bidirectional: true,
          first_seen: '2026-01-01T00:00:00.000Z',
          last_activity: '2026-01-13T11:00:00.000Z',
          channels: [],
        },
      ],
    });
    apiMocks.getLink.mockResolvedValueOnce({
      data: {
        id: 1,
        node_a: { id: 1, node_id: 'node-a', node_num: 1, short_name: 'A' },
        node_b: { id: 2, node_id: 'node-b', node_num: 2, short_name: 'B' },
        node_a_to_node_b_packets: 5,
        node_b_to_node_a_packets: 1,
        total_packets: 6,
        is_bidirectional: true,
        first_seen: '2026-01-01T00:00:00.000Z',
        last_activity: '2026-01-13T11:00:00.000Z',
        channels: [],
      },
    });
    apiMocks.getLinkPackets.mockResolvedValueOnce({ data: [] });

    render(<LinksPanel />);

    await waitFor(() => {
      expect(apiMocks.getLinks).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(apiMocks.getLink).toHaveBeenCalledWith(1);
      expect(apiMocks.getLinkPackets).toHaveBeenCalled();
    });

    expect(screen.getByText(/logical links/i)).toBeInTheDocument();
    expect(screen.getAllByText('A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('B').length).toBeGreaterThan(0);
  });

  it('debounces search before fetching links', async () => {
    vi.useFakeTimers();
    apiMocks.getLinks.mockResolvedValue({ data: [] });
    apiMocks.getLink.mockResolvedValue({ data: null });
    apiMocks.getLinkPackets.mockResolvedValue({ data: [] });

    render(<LinksPanel />);

    expect(apiMocks.getLinks).toHaveBeenCalledTimes(1);

    const searchInput = screen.getByPlaceholderText(/search by node/i);

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'node-a' } });
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(apiMocks.getLinks).toHaveBeenCalledTimes(2);
  });
});
