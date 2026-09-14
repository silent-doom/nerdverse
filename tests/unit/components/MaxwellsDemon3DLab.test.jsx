import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MaxwellsDemon3DLab from '@/components/3d/MaxwellsDemon3DLab';

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    WebGLRenderer: class {
      constructor() {
        this.domElement = document.createElement('canvas');
        this.shadowMap = { enabled: true };
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
    load(url, onLoad) {
      const scene = {
        position: { set: vi.fn() },
        scale: { set: vi.fn() },
        rotation: { set: vi.fn() },
        traverse: vi.fn(),
      };
      if (typeof onLoad === 'function') {
        onLoad({ scene });
      }
    }
  },
}));

describe('MaxwellsDemon3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Maxwells Demon lab with title and chamber badges', () => {
    render(<MaxwellsDemon3DLab />);

    expect(screen.getByTestId('maxwells-demon-lab')).toBeInTheDocument();
    expect(screen.getByText(/Maxwell's Demon Thermodynamic Chamber/i)).toBeInTheDocument();
    expect(screen.getByText(/Chamber A \(Cold Source\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Chamber B \(Hot Target\)/i)).toBeInTheDocument();
  });

  it('allows toggling between Automated Demon and Manual Shutter modes', () => {
    render(<MaxwellsDemon3DLab />);

    const manualBtn = screen.getByRole('button', { name: /Manual Shutter/i });
    fireEvent.click(manualBtn);

    expect(screen.getByText(/Hold to Open Trapdoor/i)).toBeInTheDocument();

    const autoBtn = screen.getByRole('button', { name: /Automated Demon/i });
    fireEvent.click(autoBtn);

    expect(screen.getByText(/Demon Scanning Trajectories/i)).toBeInTheDocument();
  });

  it('displays Landauer principle memory register and Erase Memory button', () => {
    render(<MaxwellsDemon3DLab />);

    expect(screen.getByText(/Landauer Memory Register/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Erase Memory/i })).toBeInTheDocument();
  });
});
