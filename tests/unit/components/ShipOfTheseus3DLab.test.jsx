import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShipOfTheseus3DLab from '@/components/3d/ShipOfTheseus3DLab';

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    WebGLRenderer: class {
      constructor() {
        this.domElement = document.createElement('canvas');
      }
      setSize() {}
      setPixelRatio() {}
      render() {}
      dispose() {}
    },
  };
});

describe('ShipOfTheseus3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Ship of Theseus 3D Lab with titles and dual ship status', () => {
    render(<ShipOfTheseus3DLab />);

    expect(screen.getByTestId('ship-of-theseus-3d-lab')).toBeInTheDocument();
    expect(screen.getByText(/Ship of Theseus — The Athenian Harbor/i)).toBeInTheDocument();
    expect(screen.getByText(/Ship A \(Harbor\) Original Wood/i)).toBeInTheDocument();
    expect(screen.getByText(/Ship B \(Dock\) Rebuilt Wood/i)).toBeInTheDocument();
  });

  it('switches between Aristotles four causes lenses', () => {
    render(<ShipOfTheseus3DLab />);

    // Formal Cause
    const formalTab = screen.getByRole('button', { name: /Formal Cause/i });
    fireEvent.click(formalTab);
    expect(screen.getByText(/Aristotle's Formal Cause:/i)).toBeInTheDocument();

    // Efficient Cause
    const efficientTab = screen.getByRole('button', { name: /Efficient Cause/i });
    fireEvent.click(efficientTab);
    expect(screen.getByText(/Aristotle's Efficient Cause:/i)).toBeInTheDocument();

    // Final Cause
    const finalTab = screen.getByRole('button', { name: /Final Cause/i });
    fireEvent.click(finalTab);
    expect(screen.getByText(/Aristotle's Final Cause \(Telos\):/i)).toBeInTheDocument();
  });

  it('allows voting on the Hobbes dilemma and registers verdict', () => {
    render(<ShipOfTheseus3DLab />);

    const shipBBtn = screen.getByRole('button', { name: /Ship B/i });
    fireEvent.click(shipBBtn);

    const submitBtn = screen.getByRole('button', { name: /Submit Metaphysical Verdict/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Verdict Registered to Cloud Telemetry/i)).toBeInTheDocument();
  });
});
