import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

describe('useAutoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs on mount when configured', async () => {
    const callback = vi.fn();
    renderHook(() => useAutoRefresh(callback, { runOnMount: true }));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not schedule when disabled', () => {
    const callback = vi.fn();
    renderHook(() => useAutoRefresh(callback, { enabled: false, intervalMs: 1000 }));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('invokes callback at interval and uses latest reference', () => {
    const callbackA = vi.fn();
    const callbackB = vi.fn();

    const { rerender } = renderHook(({ cb }) => useAutoRefresh(cb, { intervalMs: 1000 }), {
      initialProps: { cb: callbackA },
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callbackA).toHaveBeenCalledTimes(1);

    rerender({ cb: callbackB });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callbackA).toHaveBeenCalledTimes(1);
    expect(callbackB).toHaveBeenCalledTimes(1);
  });

  it('cleans up interval on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAutoRefresh(callback, { intervalMs: 1000 }));

    unmount();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
