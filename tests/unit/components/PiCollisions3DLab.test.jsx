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

  it('provides exactly 5 mass ratio options including the 1,000 : 1 curiosity case', () => {
    render(<PiCollisions3DLab />);

    expect(screen.getByRole('button', { name: /^1 : 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^100 : 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^10,000 : 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^1,000,000 : 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^1,000 : 1/i })).toBeInTheDocument();

    // Verify there are no higher 5/6/7/8 digit presets (which cause erratic high-loop lag)
    expect(screen.queryByRole('button', { name: /10⁸ : 1/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /10¹⁰ : 1/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /10¹² : 1/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /10¹⁴ : 1/i })).not.toBeInTheDocument();
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

  it('analytically fast-forwards to exact final pi collision count on 100 : 1', () => {
    render(<PiCollisions3DLab />);

    // Fast-forward on default preset (100:1 -> 31 bounces)
    const fastForwardBtn = screen.getByRole('button', { name: /Fast-Forward/i });
    fireEvent.click(fastForwardBtn);

    expect(screen.getAllByText('31').length).toBeGreaterThan(0);
    expect(screen.getByText(/Exact π Target Reached/i)).toBeInTheDocument();
  });

  it('fast-forwards smoothly to 3,141 collisions for 1,000,000 : 1', () => {
    render(<PiCollisions3DLab />);

    const preset1M = screen.getByRole('button', { name: /^1,000,000 : 1/i });
    fireEvent.click(preset1M);

    const fastForwardBtn = screen.getByRole('button', { name: /Fast-Forward/i });
    fireEvent.click(fastForwardBtn);

    expect(screen.getAllByText('3,141').length).toBeGreaterThan(0);
    expect(screen.getByText(/Exact π Target Reached/i)).toBeInTheDocument();
  });

  it('demonstrates the 1,000 : 1 curiosity case yielding exactly 99 collisions rather than pi digits', () => {
    render(<PiCollisions3DLab />);

    const curiosityBtn = screen.getByRole('button', { name: /^1,000 : 1/i });
    fireEvent.click(curiosityBtn);

    const fastForwardBtn = screen.getByRole('button', { name: /Fast-Forward/i });
    fireEvent.click(fastForwardBtn);

    expect(screen.getAllByText('99').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/≠ π/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Done: 99 Collisions Reached/i)).toBeInTheDocument();
  });

  it('allows restarting the simulation after finishing', () => {
    render(<PiCollisions3DLab />);

    const fastForwardBtn = screen.getByRole('button', { name: /Fast-Forward/i });
    fireEvent.click(fastForwardBtn);

    // After finishing, the play button becomes 'Restart'
    const restartBtn = screen.getByRole('button', { name: /Restart/i });
    expect(restartBtn).toBeInTheDocument();

    fireEvent.click(restartBtn);
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();
  });

  it('renders zero emojis across the entire lab component', () => {
    const { container } = render(<PiCollisions3DLab />);

    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(container.textContent)).toBe(false);
  });
});
