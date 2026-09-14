import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FermiParadox3DLab from '@/components/3d/FermiParadox3DLab';

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

describe('FermiParadox3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Fermi Paradox lab with title and Drake Equation output', () => {
    render(<FermiParadox3DLab />);

    expect(screen.getByTestId('fermi-paradox-lab')).toBeInTheDocument();
    expect(screen.getByText(/The Fermi Paradox 3D Galactic Orrery/i)).toBeInTheDocument();
    expect(screen.getByText(/Drake Communicative Civilizations \(N\)/i)).toBeInTheDocument();
  });

  it('allows switching Great Filter scenarios and updates parameters', () => {
    render(<FermiParadox3DLab />);

    const rareEarthBtn = screen.getByRole('button', { name: /The Great Filter Behind/i });
    fireEvent.click(rareEarthBtn);

    expect(screen.getAllByText(/The Great Filter Behind \(Rare Earth\)/i).length).toBeGreaterThan(0);

    const doomsdayBtn = screen.getByRole('button', { name: /The Great Filter Ahead/i });
    fireEvent.click(doomsdayBtn);

    expect(screen.getAllByText(/The Great Filter Ahead \(Doomsday\)/i).length).toBeGreaterThan(0);
  });

  it('provides colonization epoch simulation controls', () => {
    render(<FermiParadox3DLab />);

    expect(screen.getByRole('button', { name: /Simulate Colonization/i })).toBeInTheDocument();
    expect(screen.getByText(/Cosmic Epoch:/i)).toBeInTheDocument();
    expect(screen.getByText(/Colonized Systems:/i)).toBeInTheDocument();
  });
});
