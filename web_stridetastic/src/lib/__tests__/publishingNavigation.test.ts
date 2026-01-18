import { describe, expect, it, beforeEach, vi } from 'vitest';
import { clearPublishingReturnFocus, getPublishingReturnFocus, setPublishingReturnFocus, PUBLISHING_RETURN_FOCUS_KEY } from '@/lib/publishingNavigation';

describe('publishingNavigation', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('stores and retrieves focus payload', () => {
    setPublishingReturnFocus({ nodeId: 'node-123', originTab: 'overview' });
    const stored = getPublishingReturnFocus();
    expect(stored).toEqual({ nodeId: 'node-123', originTab: 'overview' });
  });

  it('returns null for invalid payload', () => {
    window.sessionStorage.setItem(PUBLISHING_RETURN_FOCUS_KEY, 'not-json');
    expect(getPublishingReturnFocus()).toBeNull();

    window.sessionStorage.setItem(PUBLISHING_RETURN_FOCUS_KEY, JSON.stringify({ nodeId: 123 }));
    expect(getPublishingReturnFocus()).toBeNull();
  });

  it('clears stored payload', () => {
    setPublishingReturnFocus({ nodeId: 'node-123', originTab: 'overview' });
    clearPublishingReturnFocus();
    expect(window.sessionStorage.getItem(PUBLISHING_RETURN_FOCUS_KEY)).toBeNull();
  });
});
