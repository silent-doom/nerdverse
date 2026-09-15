import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrisonersDilemma3DLab from '@/components/3d/PrisonersDilemma3DLab';

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
  recordConceptRun: vi.fn().mockResolvedValue({ id: 'test-dilemma-run-id' }),
}));

describe('PrisonersDilemma3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Prisoner Dilemma 3D Lab with title and Tucker payoff matrix', () => {
    render(<PrisonersDilemma3DLab />);

    expect(screen.getByTestId('prisoners-dilemma-3d-lab')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Prisoner's Dilemma/i })).toBeInTheDocument();
    expect(screen.getByText(/Player 1 \(Alice\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Player 2 \(Bob\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Tucker 1950 Sentence Matrix/i)).toBeInTheDocument();
  });

  it('toggles decision levers in Tab 1 (Single Interrogation)', () => {
    render(<PrisonersDilemma3DLab />);

    // Default: Cooperate (Alice) vs Defect (Bob) -> Sucker Payoff (3 yrs, 0 yrs)
    expect(screen.getByText(/Exploited \(Sucker Payoff\)/i)).toBeInTheDocument();

    // Click Confess & Betray -> Both Defect -> Nash Trap (2 yrs, 2 yrs)
    const defectBtn = screen.getByRole('button', { name: /Confess and Betray/i });
    fireEvent.click(defectBtn);

    expect(screen.getByText(/Nash Equilibrium Trap \(Mutual Betrayal\)/i)).toBeInTheDocument();

    // Click Remain Silent -> Back to Cooperate
    const silentBtn = screen.getByRole('button', { name: /Remain Silent/i });
    fireEvent.click(silentBtn);
    expect(screen.getByText(/Exploited \(Sucker Payoff\)/i)).toBeInTheDocument();
  });

  it('switches camera perspective presets', () => {
    render(<PrisonersDilemma3DLab />);

    const aliceCamBtn = screen.getByRole('button', { name: /Suspect Alice Room/i });
    fireEvent.click(aliceCamBtn);
    expect(aliceCamBtn).toHaveClass(/camBtnActive/);

    const bobCamBtn = screen.getByRole('button', { name: /Suspect Bob Room/i });
    fireEvent.click(bobCamBtn);
    expect(bobCamBtn).toHaveClass(/camBtnActive/);

    const matrixCamBtn = screen.getByRole('button', { name: /Tucker Matrix Board/i });
    fireEvent.click(matrixCamBtn);
    expect(matrixCamBtn).toHaveClass(/camBtnActive/);
  });

  it('simulates repeated rounds in Tab 2 (Axelrod Tournament)', () => {
    render(<PrisonersDilemma3DLab />);

    const tournamentTab = screen.getByRole('tab', { name: /2\. Axelrod 1980 Iterated Tournament/i });
    fireEvent.click(tournamentTab);

    expect(screen.getByText(/Iterated Dilemma Tournament/i)).toBeInTheDocument();
    expect(screen.getByText(/Axelrod's Four Virtues of Cooperation/i)).toBeInTheDocument();

    // Play round 1: Silent
    const playSilentBtn = screen.getByRole('button', { name: /Play Silent \(Cooperate\)/i });
    fireEvent.click(playSilentBtn);
    expect(screen.getByText(/Rounds: 1 \/ 20/i)).toBeInTheDocument();

    // Play round 2: Betray
    const playBetrayBtn = screen.getByRole('button', { name: /Play Betray \(Defect\)/i });
    fireEvent.click(playBetrayBtn);
    expect(screen.getByText(/Rounds: 2 \/ 20/i)).toBeInTheDocument();

    // Reset tournament
    const resetBtn = screen.getByRole('button', { name: /Reset Tournament/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText(/Rounds: 0 \/ 20/i)).toBeInTheDocument();
  });

  it('switches between real-world dilemma contexts in Tab 3', () => {
    render(<PrisonersDilemma3DLab />);

    const realWorldTab = screen.getByRole('tab', { name: /3\. Real-World Dilemma Scenarios/i });
    fireEvent.click(realWorldTab);

    expect(screen.getByText(/Select Macro Dilemma Context/i)).toBeInTheDocument();
    expect(screen.getByText(/Cold War Nuclear Arms Race/i)).toBeInTheDocument();
    expect(screen.getByText(/Corporate Price Wars/i)).toBeInTheDocument();
    expect(screen.getByText(/Global Carbon Accord/i)).toBeInTheDocument();

    // Select Price Wars
    const priceWarCard = screen.getByText(/Corporate Price Wars/i);
    fireEvent.click(priceWarCard);

    // Record Telemetry
    const recordBtn = screen.getByRole('button', { name: /Record Dilemma Telemetry/i });
    fireEvent.click(recordBtn);
  });
});
