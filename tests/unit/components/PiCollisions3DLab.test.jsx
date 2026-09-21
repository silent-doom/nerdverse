import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PiCollisions3DLab from '@/components/3d/PiCollisions3DLab';

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    WebGLRenderer: class {
      constructor() {
        this.domElement = document.createElement('canvas');
        this.shadowMap = { enabled: false };
      }
      setSize() {}
      setPixelRatio() {}
      render() {}
      dispose() {}
    },
  };
});

describe('PiCollisions3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
    });
  });

  it('renders Pi Collisions 3D Lab with title and key telemetry readouts', () => {
    render(<PiCollisions3DLab />);

    expect(screen.getByTestId('pi-collisions-3d-lab')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Elastic Pi Collisions Simulator/i })).toBeInTheDocument();
    expect(screen.getByText(/Extracted π Value:/i)).toBeInTheDocument();
    expect(screen.getByText(/Mass Ratio \(M \/ m\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Collisions/i)).toBeInTheDocument();
    expect(screen.getByText(/Energy Conserved/i)).toBeInTheDocument();
  });

  it('allows switching between mass ratio presets', () => {
    render(<PiCollisions3DLab />);

    // Default preset is 100 : 1
    expect(screen.getAllByText(/100 : 1/i).length).toBeGreaterThan(0);

    // Switch to 1 : 1 preset
    const preset1to1 = screen.getByRole('button', { name: /1 : 1/i });
    fireEvent.click(preset1to1);

    expect(screen.getAllByText(/1 : 1/i).length).toBeGreaterThan(0);

    // Switch to 10,000 : 1 preset
    const preset10k = screen.getByRole('button', { name: /10,000 : 1/i });
    fireEvent.click(preset10k);

    expect(screen.getAllByText(/10,000 : 1/i).length).toBeGreaterThan(0);
  });

  it('supports toggling play and sound', () => {
    render(<PiCollisions3DLab />);

    const playBtn = screen.getByRole('button', { name: /Play Collisions/i });
    fireEvent.click(playBtn);
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();

    const soundBtn = screen.getByRole('button', { name: /Sound On/i });
    fireEvent.click(soundBtn);
    expect(screen.getByRole('button', { name: /Muted/i })).toBeInTheDocument();
  });

  it('analytically fast-forwards to exact final pi collision count', () => {
    render(<PiCollisions3DLab />);

    // Fast-forward on default preset (100:1 -> 31 bounces)
    const fastForwardBtn = screen.getByRole('button', { name: /Fast-Forward/i });
    fireEvent.click(fastForwardBtn);

    expect(screen.getAllByText('31').length).toBeGreaterThan(0);
    expect(screen.getByText(/Exact π Target Reached/i)).toBeInTheDocument();
  });

  it('supports extreme mass ratios computing 5 and 7 digits of pi', () => {
    render(<PiCollisions3DLab />);

    // Select 10^8 : 1 (5 digits of pi -> 31,415)
    const preset5Digits = screen.getByRole('button', { name: /10⁸ : 1/i });
    fireEvent.click(preset5Digits);

    const fastForwardBtn = screen.getByRole('button', { name: /Fast-Forward/i });
    fireEvent.click(fastForwardBtn);

    expect(screen.getAllByText('31,415').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3\.1415/i).length).toBeGreaterThan(0);

    // Select 10^12 : 1 (7 digits of pi -> 3,141,592)
    const preset7Digits = screen.getByRole('button', { name: /10¹² : 1/i });
    fireEvent.click(preset7Digits);
    fireEvent.click(fastForwardBtn);

    expect(screen.getAllByText('3,141,592').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3\.141592/i).length).toBeGreaterThan(0);
  });

  it('demonstrates the 1,000 : 1 curiosity case yielding 99 collisions rather than pi digits', () => {
    render(<PiCollisions3DLab />);

    const curiosityBtn = screen.getByRole('button', { name: /^1,000 : 1/i });
    fireEvent.click(curiosityBtn);

    const fastForwardBtn = screen.getByRole('button', { name: /Fast-Forward/i });
    fireEvent.click(fastForwardBtn);

    expect(screen.getAllByText('99').length).toBeGreaterThan(0);
    expect(screen.getByText(/≠ π/i)).toBeInTheDocument();
    expect(screen.getByText(/Done: 99 Collisions Reached/i)).toBeInTheDocument();
  });
});

