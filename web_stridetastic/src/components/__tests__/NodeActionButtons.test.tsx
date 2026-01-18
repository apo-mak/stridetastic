import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NodeActionButtons } from '@/components/NodeActionButtons';

const pushMock = vi.fn();
const searchParamsGetMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: searchParamsGetMock }),
}));

const setFocusMock = vi.fn();
const clearFocusMock = vi.fn();

vi.mock('@/lib/publishingNavigation', () => ({
  setPublishingReturnFocus: (...args: any[]) => setFocusMock(...args),
  clearPublishingReturnFocus: (...args: any[]) => clearFocusMock(...args),
}));

describe('NodeActionButtons', () => {
  beforeEach(() => {
    pushMock.mockReset();
    setFocusMock.mockReset();
    clearFocusMock.mockReset();
    searchParamsGetMock.mockReset();
  });

  it('disables buttons when nodeId is missing', () => {
    render(<NodeActionButtons nodeId={null} />);
    expect(screen.getByRole('button', { name: /test reachability/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /send traceroute/i })).toBeDisabled();
  });

  it('navigates with query params and stores focus for overview tab', async () => {
    searchParamsGetMock.mockImplementation((key: string) => (key === 'tab' ? 'overview' : null));

    render(<NodeActionButtons nodeId="node-1" />);

    await userEvent.click(screen.getByRole('button', { name: /test reachability/i }));

    expect(setFocusMock).toHaveBeenCalledWith({ nodeId: 'node-1', originTab: 'overview' });
    expect(clearFocusMock).not.toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith(
      '/dashboard?tab=actions&action=reachability-test&targetNode=node-1&focusNode=node-1&returnTab=overview',
      { scroll: false }
    );
  });

  it('clears focus when origin tab is actions', async () => {
    searchParamsGetMock.mockImplementation((key: string) => (key === 'tab' ? 'actions' : null));

    render(<NodeActionButtons nodeId="node-1" />);

    await userEvent.click(screen.getByRole('button', { name: /send traceroute/i }));

    expect(setFocusMock).not.toHaveBeenCalled();
    expect(clearFocusMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith(
      '/dashboard?tab=actions&action=traceroute&targetNode=node-1',
      { scroll: false }
    );
  });
});
