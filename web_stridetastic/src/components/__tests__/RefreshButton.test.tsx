import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RefreshButton from '@/components/RefreshButton';

describe('RefreshButton', () => {
  it('invokes onRefresh and shows label', async () => {
    const onRefresh = vi.fn(async () => {});
    render(<RefreshButton onRefresh={onRefresh} label="Reload" />);

    fireEvent.click(screen.getByRole('button', { name: /reload/i }));

    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('respects disabled prop', () => {
    const onRefresh = vi.fn();
    render(<RefreshButton onRefresh={onRefresh} disabled label="Refresh" />);

    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('prevents double submit while internal refreshing', async () => {
    let resolveFn: () => void;
    const onRefresh = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveFn = resolve;
        })
    );

    render(<RefreshButton onRefresh={onRefresh} label="Refresh" />);

    const button = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onRefresh).toHaveBeenCalledTimes(1);

    resolveFn!();
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
