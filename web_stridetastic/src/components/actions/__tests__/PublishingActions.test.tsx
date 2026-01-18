import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PublishingActions from '@/components/actions/PublishingActions';

const apiMocks = vi.hoisted(() => ({
  getSelectablePublishNodes: vi.fn(),
  getNodes: vi.fn(),
  getChannelStatistics: vi.fn(),
  getInterfaces: vi.fn(),
  getPublisherReactiveStatus: vi.fn(),
  getPublisherPeriodicJobs: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  apiClient: apiMocks,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn() }),
}));

describe('PublishingActions', () => {
  beforeEach(() => {
    Object.values(apiMocks).forEach((mock) => mock.mockReset());
  });

  it('renders publication actions after loading', async () => {
    apiMocks.getSelectablePublishNodes.mockResolvedValueOnce({ data: [] });
    apiMocks.getNodes.mockResolvedValueOnce({ data: [] });
    apiMocks.getChannelStatistics.mockResolvedValueOnce({ data: { channels: [] } });
    apiMocks.getInterfaces.mockResolvedValueOnce({ data: [] });
    apiMocks.getPublisherReactiveStatus.mockResolvedValueOnce({ data: { enabled: false } });
    apiMocks.getPublisherPeriodicJobs.mockResolvedValueOnce({ data: [] });

    render(<PublishingActions />);

    await waitFor(() => {
      expect(screen.getByText(/publication actions/i)).toBeInTheDocument();
    });
  });
});
