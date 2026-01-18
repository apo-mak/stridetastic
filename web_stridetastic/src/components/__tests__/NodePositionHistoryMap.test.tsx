import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import NodePositionHistoryMap from '@/components/NodePositionHistoryMap';

vi.mock('next/dynamic', () => ({
  default: () => (props: any) => <div data-testid="dynamic-component" {...props} />,
}));

describe('NodePositionHistoryMap', () => {
  it('renders empty state when no positions', () => {
    render(<NodePositionHistoryMap positions={[]} />);

    expect(screen.getByText(/no positional data/i)).toBeInTheDocument();
  });
});
