import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders cards and allows simulation', async () => {
    render(<App />);
    expect(screen.getByText(/Poker Solver/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Simuler/i }));
    expect(screen.getByText(/Win .* Loss/i)).toBeInTheDocument();
  });
});
