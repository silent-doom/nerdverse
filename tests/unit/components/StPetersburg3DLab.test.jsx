import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import StPetersburg3DLab from '@/components/3d/StPetersburg3DLab';

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
      this.maxDistance = 50;
      this.minDistance = 6;
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

describe('StPetersburg3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
    });
  });

  it('renders the St. Petersburg Paradox 3D Lab with initial baseline state', () => {
    render(<StPetersburg3DLab />);

    expect(screen.getByTestId('st-petersburg-3d-lab')).toBeInTheDocument();
    expect(screen.getByText(/St. Petersburg Paradox 3D Lab/i)).toBeInTheDocument();
    expect(screen.getByText('$2')).toBeInTheDocument(); // Initial round payout
    expect(screen.getByText(/Start Game \(Flip Coin\)/i)).toBeInTheDocument();
  });

  it('progresses coin flip action', () => {
    vi.useFakeTimers();
    render(<StPetersburg3DLab />);

    const flipBtn = screen.getByText(/Start Game \(Flip Coin\)/i);
    fireEvent.click(flipBtn);

    expect(screen.getByText(/Flipping.../i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    vi.useRealTimers();
  });

  it('runs Monte Carlo batch simulation of 1,000 trials', () => {
    render(<StPetersburg3DLab />);

    const batchBtn = screen.getByText(/Run 1,000-Trial Monte Carlo/i);
    fireEvent.click(batchBtn);

    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText(/Longest Streak/i)).toBeInTheDocument();
    expect(screen.getByText(/Mean Payout/i)).toBeInTheDocument();
  });

  it('displays mathematical and economic utility comparisons', () => {
    render(<StPetersburg3DLab />);

    expect(screen.getByText(/Theoretical Expected Return E\(X\)/i)).toBeInTheDocument();
    expect(screen.getByText(/\+∞ \(Infinite Dollars\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Daniel Bernoulli's Utility U = ln\(W\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Global Liquid Wealth Cap \(\$100T\)/i)).toBeInTheDocument();
  });
});
