import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { AxiosRequestConfig } from 'axios';

const requestInterceptors: Array<(config: AxiosRequestConfig & { _skipAuth?: boolean }) => any> = [];
const responseInterceptors: Array<(response: any) => any> = [];
const responseErrorInterceptors: Array<(error: any) => any> = [];

const createMockAxiosInstance = () => {
  const instance = vi.fn(async (config?: any) => ({ data: config })) as any;
  instance.get = vi.fn(async () => ({ data: {} }));
  instance.post = vi.fn(async () => ({ data: {} }));
  instance.put = vi.fn(async () => ({ data: {} }));
  instance.delete = vi.fn(async () => ({ data: {} }));
  instance.interceptors = {
    request: {
      use: vi.fn((onFulfilled: any) => {
        requestInterceptors.push(onFulfilled);
      }),
    },
    response: {
      use: vi.fn((onFulfilled: any, onRejected: any) => {
        responseInterceptors.push(onFulfilled);
        responseErrorInterceptors.push(onRejected);
      }),
    },
  };
  return instance;
};

vi.mock('axios', async () => {
  const create = vi.fn(() => createMockAxiosInstance());
  return {
    default: { create },
    create,
    __resetInterceptors: () => {
      requestInterceptors.length = 0;
      responseInterceptors.length = 0;
      responseErrorInterceptors.length = 0;
    },
  };
});

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

describe('ApiClient', () => {
  beforeEach(async () => {
    cookieStore.clear();
    const axios = await import('axios');
    (axios as any).__resetInterceptors();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds Authorization header when token exists', async () => {
    cookieStore.set('access_token', 'access-token');
    await import('@/lib/api');

    expect(requestInterceptors.length).toBeGreaterThan(0);
    const config = requestInterceptors[0]({ headers: {} });
    expect(config.headers?.Authorization).toBe('Bearer access-token');
  });

  it('does not add Authorization header when _skipAuth is set', async () => {
    cookieStore.set('access_token', 'access-token');
    await import('@/lib/api');

    const config = requestInterceptors[0]({ headers: {}, _skipAuth: true });
    expect(config.headers?.Authorization).toBeUndefined();
  });

  it('retries request after refreshing token on 401', async () => {
    const axios = await import('axios');
    const apiModule = await import('@/lib/api');
    const apiClient = apiModule.apiClient;

    cookieStore.set('refresh_token', 'refresh-token');

    const clientInstance = (axios as any).default.create.mock.results[0].value;
    clientInstance.post.mockResolvedValueOnce({ data: { access: 'new-access', refresh: 'new-refresh' } });

    const originalRequest = { _retry: false, headers: {} as Record<string, string> };
    const error = { config: originalRequest, response: { status: 401 } };

    const result = await responseErrorInterceptors[0](error);

    expect(clientInstance.post).toHaveBeenCalledWith('/auth/refresh-token', { refresh: 'refresh-token' });
    expect(cookieStore.get('access_token')).toBe('new-access');
    expect(cookieStore.get('refresh_token')).toBe('new-refresh');
    expect(originalRequest._retry).toBe(true);
    expect(originalRequest.headers.Authorization).toBe('Bearer new-access');
    expect(clientInstance).toHaveBeenCalledWith(originalRequest);
    expect(result.data).toEqual(originalRequest);
  });

  it('clears cookies and redirects on refresh failure', async () => {
    const axios = await import('axios');
    await import('@/lib/api');

    cookieStore.set('refresh_token', 'refresh-token');
    cookieStore.set('access_token', 'access-token');

    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/' },
      writable: true,
    });

    const clientInstance = (axios as any).default.create.mock.results[0].value;
    clientInstance.post.mockRejectedValueOnce(new Error('refresh failed'));

    const originalRequest = { _retry: false, headers: {} as Record<string, string> };
    const error = { config: originalRequest, response: { status: 401 } };

    await expect(responseErrorInterceptors[0](error)).rejects.toBe(error);
    expect(cookieStore.has('access_token')).toBe(false);
    expect(cookieStore.has('refresh_token')).toBe(false);
    expect(window.location.href).toBe('/login');
  });

  it('does not retry without refresh token', async () => {
    await import('@/lib/api');

    const originalRequest = { _retry: false, headers: {} as Record<string, string> };
    const error = { config: originalRequest, response: { status: 401 } };

    await expect(responseErrorInterceptors[0](error)).rejects.toBe(error);
  });
});
