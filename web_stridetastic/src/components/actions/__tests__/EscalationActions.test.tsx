import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EscalationActions from '@/components/actions/EscalationActions';

describe('EscalationActions', () => {
  it('opens configuration view when action selected', () => {
    render(<EscalationActions />);

    fireEvent.click(screen.getByText(/admin channel exploitation/i));
    expect(screen.getByText(/configure admin channel exploitation/i)).toBeInTheDocument();
  });
});
