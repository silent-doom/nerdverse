import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SolarSystemHeroCanvas from '@/components/3d/SolarSystemHeroCanvas';

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    WebGLRenderer: class {
      constructor() {
        this.domElement = document.createElement('canvas');
        this.toneMapping = 0;
        this.toneMappingExposure = 1;
      }
      setSize() {}
      setPixelRatio() {}
      render() {}
      dispose() {}
    },
  };
});

describe('SolarSystemHeroCanvas', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock 2D Canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    });
  });

  it('renders orrery controls and drag hint', () => {
    render(<SolarSystemHeroCanvas />);
    expect(screen.getByText(/3D Orrery: Drag to rotate/i)).toBeInTheDocument();
    expect(screen.getByText('⏸ Pause')).toBeInTheDocument();
    expect(screen.getByText('0.5×')).toBeInTheDocument();
    expect(screen.getByText('1×')).toBeInTheDocument();
    expect(screen.getByText('2×')).toBeInTheDocument();
    expect(screen.getByText('5×')).toBeInTheDocument();
    expect(screen.getByText('Orbits')).toBeInTheDocument();
    expect(screen.getByText('↺ Reset View')).toBeInTheDocument();
  });
});
