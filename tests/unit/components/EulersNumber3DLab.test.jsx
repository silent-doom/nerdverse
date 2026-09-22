import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EulersNumber3DLab from '@/components/3d/EulersNumber3DLab';

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

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: class {
    constructor() {
      this.target = { set: vi.fn() };
      this.enableDamping = true;
      this.dampingFactor = 0.05;
      this.maxPolarAngle = Math.PI;
      this.minDistance = 2;
      this.maxDistance = 20;
    }
    update() {}
    dispose() {}
  },
}));

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  GLTFLoader: class {
    load(url, onLoad) {
      const THREE = require('three');
      const scene = new THREE.Group();
      if (onLoad) onLoad({ scene });
    }
  },
}));

describe('EulersNumber3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
    });
  });

  it('renders Euler\'s Number 3D Lab with initial Bernoulli thought experiment', () => {
    render(<EulersNumber3DLab />);

    expect(screen.getByTestId('eulers-number-lab')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Jacob Bernoulli \(1683\): The Limit of Infinite Compounding/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Effective Value/i)).toBeInTheDocument();
    expect(screen.getByTestId('euler-live-value')).toBeInTheDocument();
    expect(screen.getByText(/Compounding Periods \(n\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Theoretical Bound/i)).toBeInTheDocument();
  });

  it('allows switching between Bernoulli compounding presets', () => {
    render(<EulersNumber3DLab />);

    // Default annual (n=1) -> $2.000000
    expect(screen.getByTestId('euler-live-value')).toHaveTextContent('$2.000000');

    // Switch to Semi-Annual (n=2) -> $2.250000
    const semiBtn = screen.getByTestId('preset-semi');
    fireEvent.click(semiBtn);
    expect(screen.getByTestId('euler-live-value')).toHaveTextContent('$2.250000');

    // Switch to Monthly (n=12) -> ~$2.613035
    const monthBtn = screen.getByTestId('preset-month');
    fireEvent.click(monthBtn);
    expect(screen.getByTestId('euler-live-value')).toHaveTextContent('$2.613035');

    // Switch to Daily (n=365) -> ~$2.714567
    const dayBtn = screen.getByTestId('preset-day');
    fireEvent.click(dayBtn);
    expect(screen.getByTestId('euler-live-value')).toHaveTextContent('$2.714567');

    // Switch to Continuous limit (n -> infinity) -> ~$2.718282
    const infBtn = screen.getByTestId('preset-infinity');
    fireEvent.click(infBtn);
    expect(screen.getByTestId('euler-live-value')).toHaveTextContent('$2.718282');
  });

  it('supports toggling timeline playback and sound mute', () => {
    render(<EulersNumber3DLab />);

    const playBtn = screen.getByTestId('btn-play-timeline');
    fireEvent.click(playBtn);
    expect(screen.getByText(/Pause Compounding/i)).toBeInTheDocument();

    const soundBtn = screen.getByRole('button', { name: /Toggle Audio/i });
    fireEvent.click(soundBtn);
    expect(screen.getByText(/Muted/i)).toBeInTheDocument();
  });

  it('switches to Calculus Rate Invariance mode (d/dx e^x = e^x)', () => {
    render(<EulersNumber3DLab />);

    const calculusTab = screen.getByTestId('tab-calculus');
    fireEvent.click(calculusTab);

    expect(
      screen.getByRole('heading', { level: 2, name: /Leonhard Euler \(1736\): The Universal Base of Calculus/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Tangent Probe Position/i)).toBeInTheDocument();
    expect(screen.getByText(/Base e Slope Multiplier/i)).toBeInTheDocument();
    expect(screen.getByText(/ln\(e\) = 1\.000000/i)).toBeInTheDocument();
  });

  it('switches to Complex Rotation mode and tests Euler\'s Identity', () => {
    render(<EulersNumber3DLab />);

    const complexTab = screen.getByTestId('tab-complex');
    fireEvent.click(complexTab);

    expect(
      screen.getByRole('heading', { level: 2, name: /The Five Fundamental Constants: e\^\{iπ\} \+ 1 = 0/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Phase Angle \(θ\):/i)).toBeInTheDocument();

    // Lock to theta = pi
    const lockPiBtn = screen.getByRole('button', { name: /Lock to θ = π/i });
    fireEvent.click(lockPiBtn);
    expect(screen.getByText(/e\^\(iπ\) \+ 1 = 0/i)).toBeInTheDocument();
  });

  it('renders VisualizationGuideHUD with zero emojis', () => {
    const { container } = render(<EulersNumber3DLab />);

    // Check that HUD is present
    expect(screen.getByText(/Euler Thought Experiment Controls/i)).toBeInTheDocument();

    // Verify absolutely no emoji characters exist in the rendered DOM
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(container.textContent)).toBe(false);
  });
});
