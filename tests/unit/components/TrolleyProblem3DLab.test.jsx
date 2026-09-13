import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TrolleyProblem3DLab from '@/components/3d/TrolleyProblem3DLab';

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    WebGLRenderer: class {
      constructor() {
        this.domElement = document.createElement('canvas');
        this.toneMapping = 0;
        this.toneMappingExposure = 1;
        this.shadowMap = { enabled: true, type: 0 };
      }
      setSize() {}
      setPixelRatio() {}
      render() {}
      dispose() {}
    },
  };
});

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  GLTFLoader: class {
    load(url, onLoad, onProgress, onError) {
      // Trigger error fallback to verify procedural mesh resilience
      if (onError) onError(new Error('Mock GLTF load error for fallback testing'));
    }
  },
}));

describe('TrolleyProblem3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders the Conscience Lab header, scenario tabs, and fMRI monitor', () => {
    render(<TrolleyProblem3DLab />);

    expect(screen.getByText(/The Trolley Problem: Conscience & Arithmetic/i)).toBeInTheDocument();
    expect(screen.getByText('The Classic Switch')).toBeInTheDocument();
    expect(screen.getByText('The Footbridge Dilemma')).toBeInTheDocument();
    expect(screen.getByText('The Loop Dilemma')).toBeInTheDocument();
    expect(screen.getByText('Autonomous Vehicle AI')).toBeInTheDocument();
    expect(screen.getByText(/fMRI NEURAL TELEMETRY/i)).toBeInTheDocument();
  });

  it('toggles the lever switch between Main Line and Diverted', () => {
    render(<TrolleyProblem3DLab />);

    const toggleBtn = screen.getByText(/Main Line \(Default\)/i);
    expect(toggleBtn).toBeInTheDocument();

    // Default balance is -4 lives lost if no action taken
    expect(screen.getByText('-4 Lives')).toBeInTheDocument();

    // Pull the switch
    fireEvent.click(toggleBtn);

    // After pulling lever, active intervention saves 5 workers, net +4 lives preserved
    expect(screen.getByText(/Diverted \(Active\)/i)).toBeInTheDocument();
    expect(screen.getByText('+4 Lives')).toBeInTheDocument();
  });

  it('switches to Footbridge Dilemma and updates psychological & physical mechanism', () => {
    render(<TrolleyProblem3DLab />);

    const footbridgeTab = screen.getByText('The Footbridge Dilemma');
    fireEvent.click(footbridgeTab);

    // Initial state is inaction
    expect(screen.getByText(/Refrain From Pushing/i)).toBeInTheDocument();
    expect(screen.getByText(/Judith Jarvis Thomson/i)).toBeInTheDocument();

    // Toggle to push
    const toggleBtn = screen.getByText(/Main Line \(Default\)/i);
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/Push Heavy Bystander/i)).toBeInTheDocument();
  });

  it('opens and closes the Conscience & Calculus Guide modal', () => {
    render(<TrolleyProblem3DLab />);

    const guideBtn = screen.getByText(/Explore The Conscience & Calculus Guide/i);
    fireEvent.click(guideBtn);

    expect(screen.getByText(/Conscience & Calculus: A Moral Examination/i)).toBeInTheDocument();
    expect(screen.getByText(/1. The Supremacy of Outcomes/i)).toBeInTheDocument();

    const closeBtn = screen.getByText('✕');
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Conscience & Calculus: A Moral Examination/i)).not.toBeInTheDocument();
  });
});
