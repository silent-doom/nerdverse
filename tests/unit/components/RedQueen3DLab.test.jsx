import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RedQueen3DLab from '@/components/3d/RedQueen3DLab';

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
  recordConceptRun: vi.fn().mockResolvedValue({ id: 'test-bio-run-id' }),
}));

describe('RedQueen3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Red Queen 3D Lab with title and key telemetry metrics', () => {
    render(<RedQueen3DLab />);

    expect(screen.getByTestId('red-queen-3d-lab')).toBeInTheDocument();
    expect(screen.getByText(/The Red Queen Hypothesis/i)).toBeInTheDocument();
    expect(screen.getByText(/Infection Threat/i)).toBeInTheDocument();
    expect(screen.getByText(/Immune Diversity Index/i)).toBeInTheDocument();
    expect(screen.getByText(/Relative Velocity \(Δv\)/i)).toBeInTheDocument();
  });

  it('switches between experimental tabs', () => {
    render(<RedQueen3DLab />);

    // Default tab 1: Host-Parasite Arms Race
    expect(screen.getByText(/Host Immune Mutation Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Parasite Virulence & Adaptation/i)).toBeInTheDocument();

    // Switch to tab 2: The Mystery of Sex
    const sexTab = screen.getByRole('tab', { name: /2\. The Mystery of Sex/i });
    fireEvent.click(sexTab);
    expect(screen.getByText(/Select Reproduction Strategy/i)).toBeInTheDocument();
    expect(screen.getByText(/Asexual Clones \(2× Reproduction\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Sexual Recombination \(Diversity\)/i)).toBeInTheDocument();

    // Switch to tab 3: Cheetah vs Gazelle Locomotion
    const cheetahTab = screen.getByRole('tab', { name: /3\. Cheetah vs Gazelle Locomotion/i });
    fireEvent.click(cheetahTab);
    expect(screen.getByText(/Cheetah Acceleration/i)).toBeInTheDocument();
    expect(screen.getByText(/Gazelle Evasion Agility/i)).toBeInTheDocument();
  });

  it('adjusts host mutation slider in Tab 1', () => {
    render(<RedQueen3DLab />);

    const slider = screen.getByLabelText(/Host Mutation Rate/i);
    fireEvent.change(slider, { target: { value: '90' } });
    expect(screen.getByText(/90% Speed/i)).toBeInTheDocument();
  });

  it('toggles asexual vs sexual reproduction and updates parasite vulnerability', () => {
    render(<RedQueen3DLab />);

    const sexTab = screen.getByRole('tab', { name: /2\. The Mystery of Sex/i });
    fireEvent.click(sexTab);

    // Switch to Asexual
    const asexualOption = screen.getByText(/Asexual Clones \(2× Reproduction\)/i);
    fireEvent.click(asexualOption);
    expect(screen.getByText(/92% Vulnerable/i)).toBeInTheDocument();
  });

  it('triggers manual generational mutation pulse and records run', async () => {
    render(<RedQueen3DLab />);

    const stepBtn = screen.getByRole('button', { name: /Advance Generation/i });
    fireEvent.click(stepBtn);
    expect(screen.getByText(/Gen #2/i)).toBeInTheDocument();

    const recordBtn = screen.getByRole('button', { name: /Record Evolutionary Telemetry/i });
    fireEvent.click(recordBtn);
  });
});
