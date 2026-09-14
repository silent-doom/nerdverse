import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LaplacesDemon3DLab from '@/components/3d/LaplacesDemon3DLab';

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

describe('LaplacesDemon3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Laplaces Demon 3D Lab with header, score, and initial mode', () => {
    render(<LaplacesDemon3DLab />);

    expect(screen.getByTestId('laplaces-demon-3d-lab')).toBeInTheDocument();
    expect(screen.getByText(/Laplace's Demon — The All-Seeing Intellect/i)).toBeInTheDocument();
    expect(screen.getByText(/Demon Predictability/i)).toBeInTheDocument();
    expect(screen.getByText(/100%/i)).toBeInTheDocument();
  });

  it('switches between Classical Clockwork, Chaos, and Quantum modes', () => {
    render(<LaplacesDemon3DLab />);

    // Click Deterministic Chaos
    const chaosTab = screen.getByRole('button', { name: /Deterministic Chaos/i });
    fireEvent.click(chaosTab);
    expect(screen.getByText(/Initial Perturbation \(Δ₀\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase-Space Trajectory Separation/i)).toBeInTheDocument();

    // Click Quantum Uncertainty
    const quantumTab = screen.getByRole('button', { name: /Quantum Uncertainty/i });
    fireEvent.click(quantumTab);
    expect(screen.getByText(/Demon Position Measurement Slit/i)).toBeInTheDocument();
    expect(screen.getByText(/Heisenberg Constant Product/i)).toBeInTheDocument();

    // Click Classical Clockwork back
    const clockworkTab = screen.getByRole('button', { name: /Classical Clockwork/i });
    fireEvent.click(clockworkTab);
    expect(screen.getByText(/Time Direction Scrub \(Reversibility\)/i)).toBeInTheDocument();
  });

  it('allows recording intellect telemetry and shows confirmation', () => {
    render(<LaplacesDemon3DLab />);

    const recordBtn = screen.getByRole('button', { name: /Record Intellect Telemetry/i });
    fireEvent.click(recordBtn);

    expect(screen.getByText(/State Run Recorded to Cloud Database/i)).toBeInTheDocument();
  });
});
