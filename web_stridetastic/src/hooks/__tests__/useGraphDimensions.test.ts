import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGraphDimensions } from '@/hooks/useGraphDimensions';

describe('useGraphDimensions', () => {
  const originalResizeObserver = global.ResizeObserver;

  beforeEach(() => {
    const observeFn = vi.fn();
    const disconnectFn = vi.fn();
    // @ts-expect-error mock
    global.ResizeObserver = class {
      observe = observeFn;
      disconnect = disconnectFn;
      constructor(_cb: ResizeObserverCallback) {}
    } as any;

    document.body.innerHTML = '<div id="graph-container"></div>';
    const container = document.getElementById('graph-container') as HTMLElement;
    Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, configurable: true });
  });

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
    document.body.innerHTML = '';
  });

  it('returns initial dimensions and updates on resize', () => {
    const { result } = renderHook(() => useGraphDimensions());

    expect(result.current.dimensions.width).toBe(500);
    expect(result.current.dimensions.height).toBe(400);

    const container = document.getElementById('graph-container') as HTMLElement;
    Object.defineProperty(container, 'clientWidth', { value: 640, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 480, configurable: true });

    act(() => {
      result.current.updateDimensions();
    });

    expect(result.current.dimensions.width).toBe(640);
    expect(result.current.dimensions.height).toBe(480);
  });
});
