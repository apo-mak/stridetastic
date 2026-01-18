import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TamperingActions from '@/components/actions/TamperingActions';

describe('TamperingActions', () => {
  it('opens configuration view when action selected', () => {
    render(<TamperingActions />);

    fireEvent.click(screen.getByText(/tamper service/i));
    expect(screen.getByText(/configure tamper service/i)).toBeInTheDocument();
  });
});
