import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import Home from '@/app/page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const useAuthMock = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

describe('Home page', () => {
  beforeEach(() => {
    pushMock.mockReset();
    useAuthMock.mockReset();
  });

  it('redirects to dashboard when authenticated', async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isLoading: false });
    render(<Home />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects to login when unauthenticated', async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, isLoading: false });
    render(<Home />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });
});
