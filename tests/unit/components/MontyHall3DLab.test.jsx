import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MontyHall3DLab from '@/components/3d/MontyHall3DLab';

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    WebGLRenderer: class {
      constructor() {
        this.domElement = document.createElement('canvas');
        this.shadowMap = { enabled: true, type: 0 };
      }
      setSize() {}
      setPixelRatio() {}
      render() {}
      dispose() {}
    },
  };
});

describe('MontyHall3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders the 3D Monty Hall Lab header and all 4 practical domains', () => {
    render(<MontyHall3DLab />);

    expect(screen.getByText(/The Monty Hall Problem & Practical Information Asymmetry/i)).toBeInTheDocument();
    expect(screen.getByText('Classic TV Stage (1975)')).toBeInTheDocument();
    expect(screen.getByText('Venture Capital Allocation')).toBeInTheDocument();
    expect(screen.getByText('Clinical Diagnostic Triage')).toBeInTheDocument();
    expect(screen.getByText('Distributed Fault Isolation')).toBeInTheDocument();
  });

  it('allows switching domains and updates contextual assets', () => {
    render(<MontyHall3DLab />);

    const vcTab = screen.getByText('Venture Capital Allocation');
    fireEvent.click(vcTab);

    expect(screen.getAllByText(/Decacorn Outlier/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Zombie Startup/i).length).toBeGreaterThan(0);
  });

  it('switches between interactive modes: Stage, Monte Carlo, 100-Door Grid, and Bayes Proof', () => {
    render(<MontyHall3DLab />);

    const monteCarloBtn = screen.getByText(/Monte Carlo Batch Engine/i);
    fireEvent.click(monteCarloBtn);
    expect(screen.getByText(/Paul Erdős Monte Carlo Batch Verifier/i)).toBeInTheDocument();

    const grid100Btn = screen.getByText(/100-Door Extreme Intuition/i);
    fireEvent.click(grid100Btn);
    expect(screen.getByText(/The 100-Door Extreme Intuition Clarifier/i)).toBeInTheDocument();

    const bayesBtn = screen.getByText(/Bayesian Waterfall & Math Proof/i);
    fireEvent.click(bayesBtn);
    expect(screen.getByText(/Bayesian Formulation of Information Concentration/i)).toBeInTheDocument();
  });

  it('progresses through stage door choice and reveals host actions', () => {
    render(<MontyHall3DLab />);

    const door1Btn = screen.getByText('DOOR 01');
    fireEvent.click(door1Btn);

    // Host reveals one of the doors
    expect(screen.getByText(/Strategic Dilemma: Preserve Original Pick or Switch/i)).toBeInTheDocument();
    expect(screen.getByText(/Switch to Other Door/i)).toBeInTheDocument();
  });
});
