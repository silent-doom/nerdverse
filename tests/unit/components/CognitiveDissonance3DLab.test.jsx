import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CognitiveDissonance3DLab from '@/components/3d/CognitiveDissonance3DLab';

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
  recordConceptRun: vi.fn().mockResolvedValue({ id: 'test-run-id' }),
}));

describe('CognitiveDissonance3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Cognitive Dissonance 3D Lab with titles and metric pills', () => {
    render(<CognitiveDissonance3DLab />);

    expect(screen.getByTestId('cognitive-dissonance-3d-lab')).toBeInTheDocument();
    expect(screen.getByText(/Cognitive Dissonance — The Self-Justification Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Psychological Tension \(ΔΨ\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Subconscious Enjoyment Rating/i)).toBeInTheDocument();
  });

  it('switches between experimental conditions in Mode 1 (Festinger 1959)', () => {
    render(<CognitiveDissonance3DLab />);

    // Default is $1 (Insufficient Justification -> 92% dissonance)
    expect(screen.getByText(/92% Critical/i)).toBeInTheDocument();
    expect(screen.getByText(/\+7.8 \/ 10/i)).toBeInTheDocument();

    // Switch to $20 Payment (Sufficient Justification -> low dissonance)
    const bribe20Btn = screen.getByRole('button', { name: /\$20 Payment/i });
    fireEvent.click(bribe20Btn);
    expect(screen.getByText(/12% Equilibrium/i)).toBeInTheDocument();
    expect(screen.getByText(/-4.5 \/ 10/i)).toBeInTheDocument();

    // Switch to Control ($0)
    const controlBtn = screen.getByRole('button', { name: /\$0 Control/i });
    fireEvent.click(controlBtn);
    expect(screen.getByText(/0% Equilibrium/i)).toBeInTheDocument();
    expect(screen.getByText(/-5.0 \/ 10/i)).toBeInTheDocument();
  });

  it('allows turning pegs manually in the Festinger bored task', () => {
    render(<CognitiveDissonance3DLab />);

    const turnPegBtn = screen.getByRole('button', { name: /Rotate 48 Wooden Pegs 90°/i });
    fireEvent.click(turnPegBtn);
    expect(screen.getAllByText(/18 Turns/i).length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to Mode 2: When Prophecy Fails (1954)', () => {
    render(<CognitiveDissonance3DLab />);

    const prophecyTab = screen.getByRole('button', { name: /When Prophecy Fails \(1954\)/i });
    fireEvent.click(prophecyTab);

    expect(screen.getByText(/Cultist Irreversible Commitment \(Sunk Cost\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Prophecy Timeline Hour/i)).toBeInTheDocument();
  });

  it('navigates to Mode 3: Tension Equilibrium Engine and switches resolution strategies', () => {
    render(<CognitiveDissonance3DLab />);

    const gyroTab = screen.getByRole('button', { name: /Tension Equilibrium Engine/i });
    fireEvent.click(gyroTab);

    expect(screen.getByText(/Cognitive Resolution Mechanism/i)).toBeInTheDocument();
    expect(screen.getByText(/Contradiction Magnitude/i)).toBeInTheDocument();

    // Click on Acknowledge Error
    const admitBtn = screen.getByRole('button', { name: /3\. Acknowledge Error/i });
    fireEvent.click(admitBtn);
    expect(screen.getByText(/Ego Shock \/ Growth/i)).toBeInTheDocument();
  });

  it('records psychological telemetry and displays confirmation', async () => {
    render(<CognitiveDissonance3DLab />);

    const recordBtn = screen.getByRole('button', { name: /Record Psychological Telemetry/i });
    fireEvent.click(recordBtn);

    expect(await screen.findByText(/Cognitive State Recorded to Cloud Database/i)).toBeInTheDocument();
  });
});
