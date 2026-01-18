import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DosActions from '@/components/actions/DosActions';

describe('DosActions', () => {
  it('opens configuration view when action selected', () => {
    render(<DosActions />);

    fireEvent.click(screen.getByText(/network flooding/i));
    expect(screen.getByText(/configure network flooding/i)).toBeInTheDocument();
  });
});
