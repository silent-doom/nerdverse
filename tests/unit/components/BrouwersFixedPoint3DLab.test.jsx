import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BrouwersFixedPoint3DLab from '@/components/3d/BrouwersFixedPoint3DLab';

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

describe('BrouwersFixedPoint3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      fillText: vi.fn(),
    });
  });

  it('renders 3D lab container and invariant HUD telemetry', () => {
    render(<BrouwersFixedPoint3DLab />);

    expect(screen.getByTestId('brouwers-fixed-point-3d-lab')).toBeInTheDocument();
    expect(screen.getByText('Invariant Fixed Point')).toBeInTheDocument();
    expect(screen.getByText('Guaranteed Exists')).toBeInTheDocument();
    expect(screen.getByText(/Fixed Coord/i)).toBeInTheDocument();
    expect(screen.getByText(/Residual/i)).toBeInTheDocument();
  });

  it('provides Coffee Cup Stir and Crumpled Map Paradox mode tabs', () => {
    render(<BrouwersFixedPoint3DLab />);

    const coffeeTab = screen.getByRole('tab', { name: /1\. The Coffee Cup Stir/i });
    const mapTab = screen.getByRole('tab', { name: /2\. The Crumpled Map Paradox/i });

    expect(coffeeTab).toBeInTheDocument();
    expect(mapTab).toBeInTheDocument();
    expect(coffeeTab).toHaveAttribute('aria-selected', 'true');
    expect(mapTab).toHaveAttribute('aria-selected', 'false');

    // Switch to Crumpled Map mode
    fireEvent.click(mapTab);
    expect(mapTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: /Crumple Coordinate Map/i })).toBeInTheDocument();
  });

  it('supports Stir Fluid Grid challenge action in coffee mode', () => {
    render(<BrouwersFixedPoint3DLab />);

    const stirBtn = screen.getByRole('button', { name: /Stir Fluid Grid/i });
    expect(stirBtn).toBeInTheDocument();

    fireEvent.click(stirBtn);
    expect(screen.getByText(/RPM/i)).toBeInTheDocument();
  });

  it('toggles audio mute and vector field visibility', () => {
    render(<BrouwersFixedPoint3DLab />);

    const muteBtn = screen.getByTitle('Mute Audio');
    fireEvent.click(muteBtn);
    expect(screen.getByTitle('Unmute Audio')).toBeInTheDocument();

    const vectorBtn = screen.getByRole('button', { name: /Vector Field/i });
    fireEvent.click(vectorBtn);
  });
});
