import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import VirtualNodesPanel from '@/components/VirtualNodesPanel';

const apiMocks = vi.hoisted(() => ({
  getVirtualNodes: vi.fn(),
  getVirtualNodeOptions: vi.fn(),
  getVirtualNodePrefill: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  apiClient: apiMocks,
}));

describe('VirtualNodesPanel', () => {
  beforeEach(() => {
    Object.values(apiMocks).forEach((mock) => mock.mockReset());
  });

  it('renders empty state when no virtual nodes', async () => {
    apiMocks.getVirtualNodes.mockResolvedValueOnce({ data: [] });
    apiMocks.getVirtualNodeOptions.mockResolvedValueOnce({
      data: {
        default_role: 'CLIENT',
        default_hardware_model: 'UNSET',
        hardware_models: [],
        roles: [],
      },
    });

    render(<VirtualNodesPanel />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /virtual nodes/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/no virtual nodes created yet/i)).toBeInTheDocument();
  });
});
