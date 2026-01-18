import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';

const logoutMock = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { username: 'alice' }, logout: logoutMock }),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    logoutMock.mockReset();
  });

  it('calls onTabChange when menu item clicked', () => {
    const onTabChange = vi.fn();
    render(<Sidebar activeTab="overview" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole('button', { name: /network topology/i }));

    expect(onTabChange).toHaveBeenCalledWith('network');
  });

  it('calls logout when sign out clicked', () => {
    render(<Sidebar activeTab="overview" onTabChange={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(logoutMock).toHaveBeenCalled();
  });
});
