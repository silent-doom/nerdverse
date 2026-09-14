import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HaltingProblem3DLab from '@/components/3d/HaltingProblem3DLab';

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

vi.mock('@/lib/supabase/conceptRuns', () => ({
  recordConceptRun: vi.fn().mockResolvedValue({ id: 'test-turing-run-id' }),
}));

describe('HaltingProblem3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Turing Halting Problem 3D Lab with title and machine status', () => {
    render(<HaltingProblem3DLab />);

    expect(screen.getByTestId('halting-problem-3d-lab')).toBeInTheDocument();
    expect(screen.getByText(/Turing Halting Problem — The Incomputable Horizon/i)).toBeInTheDocument();
    expect(screen.getByText(/Machine Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Internal State \/ Clock Steps/i)).toBeInTheDocument();
  });

  it('steps through the tape execution in Mode 1', () => {
    render(<HaltingProblem3DLab />);

    // Step cycle
    const stepBtn = screen.getByRole('button', { name: /Step Cycle \(1 Step\)/i });
    fireEvent.click(stepBtn);

    // Initial was 0 Steps, now 1 Steps
    expect(screen.getByText(/1 Steps/i)).toBeInTheDocument();
  });

  it('switches between program presets', () => {
    render(<HaltingProblem3DLab />);

    // Switch to Busy Beaver
    const bbBtn = screen.getByRole('button', { name: /2\. Busy Beaver \(3-State\)/i });
    fireEvent.click(bbBtn);

    expect(screen.getByText(/Runs for exactly 14 steps on an empty tape/i)).toBeInTheDocument();

    // Switch to Infinite Ping-Pong
    const loopBtn = screen.getByRole('button', { name: /3\. Infinite Ping-Pong Loop/i });
    fireEvent.click(loopBtn);

    expect(screen.getByText(/Oscillates between two cells endlessly/i)).toBeInTheDocument();
  });

  it('navigates to Mode 2: The Opposite(Opposite) Paradox', () => {
    render(<HaltingProblem3DLab />);

    const paradoxTab = screen.getByRole('button', { name: /2\. The Opposite\(Opposite\) Paradox/i });
    fireEvent.click(paradoxTab);

    expect(screen.getByText(/Alan Turing's 1936 Diagonalization Proof/i)).toBeInTheDocument();
    expect(screen.getByText(/Contradiction Absolute/i)).toBeInTheDocument();

    // Toggle Hypothesis B
    const hypoB = screen.getByRole('button', { name: /Hypothesis B: Halt says Opposite will LOOP/i });
    fireEvent.click(hypoB);
    expect(screen.getByText(/If Halt returns FALSE, Opposite immediately returns 0 and halts/i)).toBeInTheDocument();
  });

  it('navigates to Mode 3: Busy Beaver & Rices Theorem and updates state slider', () => {
    render(<HaltingProblem3DLab />);

    const bbTab = screen.getByRole('button', { name: /3\. Busy Beaver & Rice's Theorem/i });
    fireEvent.click(bbTab);

    expect(screen.getByText(/Busy Beaver State Count \(n\)/i)).toBeInTheDocument();
    expect(screen.getByText(/n = 3 States/i)).toBeInTheDocument();
  });

  it('records undecidability telemetry and displays confirmation', async () => {
    render(<HaltingProblem3DLab />);

    const recordBtn = screen.getByRole('button', { name: /Record Undecidability Telemetry/i });
    fireEvent.click(recordBtn);

    expect(await screen.findByText(/Turing State Synchronized to Cloud Database/i)).toBeInTheDocument();
  });
});
