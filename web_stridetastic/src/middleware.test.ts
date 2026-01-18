import { describe, expect, it, vi } from 'vitest';
import { middleware } from './middleware';

const redirectMock = vi.hoisted(() => vi.fn((url: URL) => ({ type: 'redirect', location: url.toString() })));
const nextMock = vi.hoisted(() => vi.fn(() => ({ type: 'next' })));

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: redirectMock,
    next: nextMock,
  },
}));

type MockRequest = {
  nextUrl: { pathname: string };
  cookies: { get: (key: string) => { value?: string } | undefined };
  url: string;
};

const makeRequest = (pathname: string, token?: string): MockRequest => ({
  nextUrl: { pathname },
  cookies: {
    get: () => (token ? { value: token } : undefined),
  },
  url: `http://localhost${pathname}`,
});

describe('middleware', () => {
  it('redirects to login when accessing protected route without token', () => {
    const response = middleware(makeRequest('/dashboard')) as any;
    expect(redirectMock).toHaveBeenCalled();
    expect(response.location).toBe('http://localhost/login');
  });

  it('redirects to dashboard when accessing login with token', () => {
    const response = middleware(makeRequest('/login', 'token')) as any;
    expect(redirectMock).toHaveBeenCalled();
    expect(response.location).toBe('http://localhost/dashboard');
  });

  it('allows access to protected route when token exists', () => {
    const response = middleware(makeRequest('/dashboard', 'token')) as any;
    expect(response.type).toBe('next');
  });

  it('allows access to public routes', () => {
    const response = middleware(makeRequest('/')) as any;
    expect(response.type).toBe('next');
  });
});
