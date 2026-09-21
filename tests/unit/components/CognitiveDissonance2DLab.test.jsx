import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CognitiveDissonance2DLab from '@/components/interactive/CognitiveDissonance2DLab';

describe('CognitiveDissonance2DLab', () => {
  it('renders CognitiveDissonance2DLab with Festinger experiment titles', () => {
    render(<CognitiveDissonance2DLab />);

    expect(screen.getByTestId('cognitive-dissonance-2d-lab')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /The Insufficient Justification Paradox/i })).toBeInTheDocument();
    expect(screen.getByText(/\$1 Payment Condition/i)).toBeInTheDocument();
    expect(screen.getByText(/\$20 Payment Condition/i)).toBeInTheDocument();
  });

  it('switches between experimental payment conditions and updates meters', () => {
    render(<CognitiveDissonance2DLab />);

    // Default: $1 Condition -> High Dissonance (92%)
    expect(screen.getByText(/92% Conflict/i)).toBeInTheDocument();

    // Click $20 Condition -> Low Dissonance (15%)
    const bribe20Btn = screen.getByRole('button', { name: /\$20 Payment Condition/i });
    fireEvent.click(bribe20Btn);

    expect(screen.getByText(/15% Conflict/i)).toBeInTheDocument();
    expect(screen.getByText(/-4\.5 \(Task was dull & boring\)/i)).toBeInTheDocument();
  });
});
