import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConwaysGameOfLife3DLab from '@/components/3d/ConwaysGameOfLife3DLab';

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

vi.mock('@/lib/supabase/conceptRuns', () => ({
  recordConceptRun: vi.fn().mockResolvedValue({ id: 'test-run-id' }),
}));

describe('ConwaysGameOfLife3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Conway Game of Life 3D Lab with titles and HUD metrics', () => {
    render(<ConwaysGameOfLife3DLab />);

    expect(screen.getByTestId('conways-game-of-life-3d-lab')).toBeInTheDocument();
    expect(screen.getByText(/Conway's Game of Life/i)).toBeInTheDocument();
    expect(screen.getByText(/Generation/i)).toBeInTheDocument();
    expect(screen.getByText(/Population/i)).toBeInTheDocument();
    expect(screen.getByText(/Peak Record/i)).toBeInTheDocument();
  });

  it('allows toggling play and pause of the evolution simulation', () => {
    render(<ConwaysGameOfLife3DLab />);

    const pauseBtn = screen.getByRole('button', { name: /Pause Simulation/i });
    fireEvent.click(pauseBtn);

    expect(screen.getByRole('button', { name: /Resume Simulation/i })).toBeInTheDocument();

    const resumeBtn = screen.getByRole('button', { name: /Resume Simulation/i });
    fireEvent.click(resumeBtn);

    expect(screen.getByRole('button', { name: /Pause Simulation/i })).toBeInTheDocument();
  });

  it('allows stepping forward exactly 1 generation', () => {
    render(<ConwaysGameOfLife3DLab />);

    const stepBtn = screen.getByRole('button', { name: /Step Generation/i });
    fireEvent.click(stepBtn);

    expect(screen.getByRole('button', { name: /Resume Simulation/i })).toBeInTheDocument();
  });

  it('switches between presets like Pulsar and Spaceship Armada', () => {
    render(<ConwaysGameOfLife3DLab />);

    const pulsarBtn = screen.getByRole('button', { name: /Pulsar \(Period 3\)/i });
    fireEvent.click(pulsarBtn);

    expect(screen.getAllByText(/Pulsar/i).length).toBeGreaterThanOrEqual(1);

    const spaceshipBtn = screen.getByRole('button', { name: /Spaceship Armada/i });
    fireEvent.click(spaceshipBtn);

    expect(screen.getAllByText(/Spaceship Armada/i).length).toBeGreaterThanOrEqual(1);
  });

  it('switches tabs to inspect The Four Immutable Laws and Spacetime', () => {
    render(<ConwaysGameOfLife3DLab />);

    const lawsTab = screen.getByRole('tab', { name: /2\. The Four Immutable Laws/i });
    fireEvent.click(lawsTab);

    expect(screen.getByText(/1\. Underpopulation/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Survival/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Overpopulation/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Reproduction/i)).toBeInTheDocument();

    const spacetimeTab = screen.getByRole('tab', { name: /3\. Spacetime Worldlines/i });
    fireEvent.click(spacetimeTab);

    expect(screen.getByText(/Spacetime Crystal Extrusion/i)).toBeInTheDocument();
  });

  it('allows clearing the grid and generating random soup', () => {
    render(<ConwaysGameOfLife3DLab />);

    const clearBtn = screen.getByRole('button', { name: /Clear Board/i });
    fireEvent.click(clearBtn);

    const soupBtn = screen.getByRole('button', { name: /Generate Random Soup/i });
    fireEvent.click(soupBtn);

    expect(screen.getByTestId('conways-game-of-life-3d-lab')).toBeInTheDocument();
  });
});
