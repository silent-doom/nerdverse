import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BayesTheorem2DLab from '@/components/interactive/BayesTheorem2DLab';

describe('BayesTheorem2DLab', () => {
  it('renders BayesTheorem2DLab with Base Rate Fallacy headings', () => {
    render(<BayesTheorem2DLab />);

    expect(screen.getByTestId('bayes-theorem-2d-lab')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Why a 99% Accurate Test Might Only Mean a 9% Chance/i })).toBeInTheDocument();
    expect(screen.getByText(/Rare Medical Screening/i)).toBeInTheDocument();
  });

  it('switches between presets and updates calculations', () => {
    render(<BayesTheorem2DLab />);

    const aiBtn = screen.getByRole('button', { name: /AI Cybersecurity Alert/i });
    fireEvent.click(aiBtn);

    expect(screen.getByText(/33\.1%/i)).toBeInTheDocument();
  });
});
