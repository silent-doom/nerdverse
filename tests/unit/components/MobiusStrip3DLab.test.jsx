import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MobiusStrip3DLab from '@/components/3d/MobiusStrip3DLab';

// Mock Three.js WebGLRenderer and OrbitControls for Vitest jsdom environment
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

describe('MobiusStrip3DLab Component', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      setLineDash: vi.fn(),
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

  it('renders Mobius Strip 3D Lab with title and key telemetry readouts', () => {
    render(<MobiusStrip3DLab />);

    expect(screen.getByTestId('mobius-strip-3d-lab')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Möbius Strip Interactive Laboratory/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Traversal Arc Length/i)).toBeInTheDocument();
    expect(screen.getByText(/Normal Vector \(n̂\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Twist Angle \(u\/2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Loop Circuit/i)).toBeInTheDocument();
    expect(screen.getByText(/Side A \(Apparent Exterior\)/i)).toBeInTheDocument();
  });

  it('provides all 3 interactive thought experiment modes', () => {
    render(<MobiusStrip3DLab />);

    expect(screen.getByRole('button', { name: /The Ant's 720° Journey/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /The Scissors Paradox/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Topological Manifold Sandbox/i })).toBeInTheDocument();
  });

  it('renders Mode 1 (The Ant) controls including crawl playback and 720° scrubber', () => {
    render(<MobiusStrip3DLab />);

    expect(screen.getByRole('button', { name: /Start Ant Crawl/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Origin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hide Normal Vector/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Follow Ant/i })).toBeInTheDocument();
    expect(screen.getByText(/Manual Circuit Scrubber/i)).toBeInTheDocument();
    expect(screen.getByText(/The 720° Topological Return Paradox/i)).toBeInTheDocument();
  });

  it('toggles into Mode 2 (The Scissors Paradox) and provides Midline and 1/3 Cut controls', () => {
    render(<MobiusStrip3DLab />);

    const scissorsTab = screen.getByRole('button', { name: /The Scissors Paradox/i });
    fireEvent.click(scissorsTab);

    expect(screen.getByRole('button', { name: /Midline Cut \(Center 1\/2\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /One-Third Offset Cut \(1\/3 Edge\)/i })).toBeInTheDocument();
    expect(screen.getByText(/Scissors Cut Completion/i)).toBeInTheDocument();
    expect(screen.getByText(/Unfold \/ Separation Displacement/i)).toBeInTheDocument();
    expect(screen.getByText(/Center Cut Result: ONE Single Double-Length Ribbon/i)).toBeInTheDocument();

    // Toggle to 1/3 offset cut
    const offsetBtn = screen.getByRole('button', { name: /One-Third Offset Cut \(1\/3 Edge\)/i });
    fireEvent.click(offsetBtn);
    expect(screen.getByText(/1\/3 Cut Result: TWO Interlocked Rings/i)).toBeInTheDocument();
  });

  it('toggles into Mode 3 (Topology Sandbox) and provides half-twists, radius, and width sliders', () => {
    render(<MobiusStrip3DLab />);

    const topologyTab = screen.getByRole('button', { name: /Topological Manifold Sandbox/i });
    fireEvent.click(topologyTab);

    expect(screen.getByText(/Half-Twists \(k\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Major Radius \(R\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Ribbon Width \(w\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Wireframe/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Normal Grid/i })).toBeInTheDocument();
    expect(screen.getByText(/Topological Invariant: χ = 0/i)).toBeInTheDocument();
  });

  it('can open and close the Guided Walkthrough HUD', () => {
    render(<MobiusStrip3DLab />);

    const guideBtn = screen.getByTitle(/Interactive Lab Guide/i);
    fireEvent.click(guideBtn);

    expect(screen.getByText(/Möbius Strip Laboratory Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/1. The Ant & The Ink Trail/i)).toBeInTheDocument();
    expect(screen.getByText(/3. The Scissors Midline Cut/i)).toBeInTheDocument();
  });
});
