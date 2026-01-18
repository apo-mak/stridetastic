import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const loginMock = vi.fn();
const logoutMock = vi.fn();

vi.mock('@/lib/api', () => ({
  apiClient: {
    login: (...args: any[]) => loginMock(...args),
    logout: (...args: any[]) => logoutMock(...args),
  },
}));

const cookieStore = new Map<string, string>();

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn((key: string) => cookieStore.get(key)),
    set: vi.fn((key: string, value: string) => {
      cookieStore.set(key, value);
    }),
    remove: vi.fn((key: string) => {
      cookieStore.delete(key);
    }),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    cookieStore.clear();
    loginMock.mockReset();
    logoutMock.mockReset();
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useAuth())).toThrowError(/AuthProvider/);
  });

  it('initializes unauthenticated when no token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('initializes authenticated when token is present', async () => {
    cookieStore.set('access_token', 'token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('user');
  });

  it('login sets cookies and user on success', async () => {
    loginMock.mockResolvedValue({ data: { access: 'access', refresh: 'refresh' } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.login('alice', 'secret');
    });

    expect(success).toBe(true);
    expect(cookieStore.get('access_token')).toBe('access');
    expect(cookieStore.get('refresh_token')).toBe('refresh');
    expect(result.current.user?.username).toBe('alice');
  });

  it('login returns false on failure', async () => {
    loginMock.mockRejectedValue(new Error('bad login'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let success = true;
    await act(async () => {
      success = await result.current.login('alice', 'wrong');
    });

    expect(success).toBe(false);
  });

  it('logout clears user and calls api logout', async () => {
    cookieStore.set('access_token', 'token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(logoutMock).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
