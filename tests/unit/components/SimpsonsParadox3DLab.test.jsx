import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SimpsonsParadox3DLab from '@/components/3d/SimpsonsParadox3DLab';

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
      this.maxDistance = 70;
      this.minDistance = 8;
    }
    update() {}
    dispose() {}
  },
}));

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  GLTFLoader: class {
    load(url, onLoad) {
      const scene = {
        position: { set: vi.fn() },
        scale: { set: vi.fn() },
      };
      onLoad({ scene });
    }
  },
}));

describe('SimpsonsParadox3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
    });
  });

  it('renders the Simpson Paradox 3D Lab with initial clinical data', () => {
    render(<SimpsonsParadox3DLab />);

    expect(screen.getByTestId('simpsons-paradox-3d-lab')).toBeInTheDocument();
    expect(screen.getByText(/Simpson's Paradox 3D Causal Lab/i)).toBeInTheDocument();
    expect(screen.getByText(/Treatment A \(Open Surgery\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Treatment B \(Percutaneous\)/i)).toBeInTheDocument();
  });

  it('toggles between 3D Stratified View and 2D Flat Collapse', () => {
    render(<SimpsonsParadox3DLab />);

    const flatBtn = screen.getByText('2D Flat Collapse');
    fireEvent.click(flatBtn);
    expect(flatBtn).toHaveClass(/toggleBtnActive/);

    const stratBtn = screen.getByText('3D Stratified View');
    fireEvent.click(stratBtn);
    expect(stratBtn).toHaveClass(/toggleBtnActive/);
  });

  it('switches between Kidney Stone Trial and UC Berkeley Admissions presets', () => {
    render(<SimpsonsParadox3DLab />);

    const berkeleyBtn = screen.getByText(/1973 UC Berkeley Admissions/i);
    fireEvent.click(berkeleyBtn);

    expect(screen.getByText('Men')).toBeInTheDocument();
    expect(screen.getByText('Women')).toBeInTheDocument();
    expect(screen.getAllByText(/High-Capacity Engineering/i)[0]).toBeInTheDocument();
  });
});
