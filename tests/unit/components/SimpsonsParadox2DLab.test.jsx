import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SimpsonsParadox2DLab from '@/components/interactive/SimpsonsParadox2DLab';

describe('SimpsonsParadox2DLab', () => {
  it('renders SimpsonsParadox2DLab with initial title and stratified view', () => {
    render(<SimpsonsParadox2DLab />);

    expect(screen.getByTestId('simpsons-paradox-2d-lab')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Kidney Stone Treatment Trial/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Treatment A \(Open Surgery\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Treatment B \(Percutaneous\)/i).length).toBeGreaterThan(0);
  });

  it('toggles between aggregate view and disaggregated view', () => {
    render(<SimpsonsParadox2DLab />);

    const aggregateBtn = screen.getByRole('button', { name: /Combined Aggregate View/i });
    fireEvent.click(aggregateBtn);

    expect(screen.getByText(/Apparent Winner Overall/i)).toBeInTheDocument();

    const stratifiedBtn = screen.getByRole('button', { name: /Disaggregated by/i });
    fireEvent.click(stratifiedBtn);

    expect(screen.getByText(/Superior in Both Groups/i)).toBeInTheDocument();
  });

  it('switches between presets (Kidney Stone vs UC Berkeley)', () => {
    render(<SimpsonsParadox2DLab />);

    const berkeleyBtn = screen.getByRole('button', { name: /UC Berkeley Admissions/i });
    fireEvent.click(berkeleyBtn);

    expect(screen.getByRole('heading', { level: 2, name: /UC Berkeley Admissions Investigation/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Women Applicants/i).length).toBeGreaterThan(0);
  });
});
