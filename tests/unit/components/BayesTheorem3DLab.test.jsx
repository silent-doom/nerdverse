import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BayesTheorem3DLab from '@/components/3d/BayesTheorem3DLab';

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

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: class {
    constructor() {
      this.target = { set: vi.fn(), lerp: vi.fn() };
      this.enableDamping = true;
      this.dampingFactor = 0.05;
      this.maxDistance = 80;
      this.minDistance = 10;
    }
    update() {}
    dispose() {}
  },
}));

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  GLTFLoader: class {
    load(url, onLoad) {
      // Mock successful model load
      const scene = {
        position: { set: vi.fn() },
        scale: { set: vi.fn() },
      };
      onLoad({ scene });
    }
  },
}));

describe('BayesTheorem3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
    });
  });

  it('renders the Bayes Theorem 3D Lab with initial posterior calculation', () => {
    render(<BayesTheorem3DLab />);

    expect(screen.getByTestId('bayes-theorem-3d-lab')).toBeInTheDocument();
    expect(screen.getByText(/Bayes' Theorem 3D Diagnostic Lab/i)).toBeInTheDocument();
    expect(screen.getByText('1.94%')).toBeInTheDocument(); // Default 0.1% base rate, 99% sens, 5% FP
  });

  it('updates posterior probability when changing the base rate slider', () => {
    render(<BayesTheorem3DLab />);

    const baseRateSlider = screen.getByLabelText(/Base Rate/i, { selector: 'input' }) ||
      screen.getAllByRole('slider')[0];

    fireEvent.change(baseRateSlider, { target: { value: '5.0' } });

    // With 5% base rate, 99% sens, 5% FPR, posterior surges
    expect(screen.queryByText('1.94%')).not.toBeInTheDocument();
  });

  it('applies clinical diagnostic presets', () => {
    render(<BayesTheorem3DLab />);

    const mammogramBtn = screen.getByText(/Mammogram/i);
    fireEvent.click(mammogramBtn);

    expect(screen.getByText('10.20%')).toBeInTheDocument();
  });

  it('triggers laser scan and toggles levitation triage floor', () => {
    render(<BayesTheorem3DLab />);

    const scanBtn = screen.getByText(/Run Laser Scan/i);
    fireEvent.click(scanBtn);
    expect(screen.getByText(/Laser Scanning Cohort/i)).toBeInTheDocument();

    const levitateBtn = screen.getByText(/Flatten Grid/i);
    fireEvent.click(levitateBtn);
    expect(screen.getByText(/Levitate Triage Floor/i)).toBeInTheDocument();
  });
});
