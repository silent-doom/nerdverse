import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MontyHall3DLab from '@/components/3d/MontyHall3DLab';

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    WebGLRenderer: class {
      constructor() {
        this.domElement = document.createElement('canvas');
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
    load(url, onLoad) {
      const scene = {
        position: { set: vi.fn() },
        scale: { set: vi.fn() },
        rotation: { set: vi.fn() },
        clone: function() {
          return {
            position: { set: vi.fn() },
            scale: { set: vi.fn() },
            rotation: { set: vi.fn() },
            traverse: vi.fn(),
          };
        },
        traverse: vi.fn(),
      };
      onLoad({ scene });
    }
  },
}));

describe('MontyHall3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders the Monty Hall Lab with simple, clear pretext', () => {
    render(<MontyHall3DLab />);

    expect(screen.getByRole('heading', { level: 2, name: /The Monty Hall Problem/i })).toBeInTheDocument();
    expect(screen.getByText(/Behind one door is a brand-new sports car; behind the other two are goats/i)).toBeInTheDocument();
  });

  it('progresses through door choice and reveals host actions', () => {
    render(<MontyHall3DLab />);

    const door1Btn = screen.getByText('DOOR 01');
    fireEvent.click(door1Btn);

    // Host reveals one of the doors
    expect(screen.getByText(/The Million-Dollar Question: Switch or Stay/i)).toBeInTheDocument();
    expect(screen.getByText(/Switch to Other Door/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay with Door 01/i)).toBeInTheDocument();
  });

  it('allows switching and shows outcome', () => {
    render(<MontyHall3DLab />);

    fireEvent.click(screen.getByText('DOOR 01'));
    const switchBtn = screen.getByText(/Switch to Other Door/i);
    fireEvent.click(switchBtn);

    expect(screen.getByText(/Play Again/i)).toBeInTheDocument();
  });

  it('displays real-world practical context applications', () => {
    render(<MontyHall3DLab />);

    expect(screen.getByText('Venture Capital Portfolio Strategy')).toBeInTheDocument();
    expect(screen.getByText('Clinical Diagnostic Triage')).toBeInTheDocument();
    expect(screen.getByText('Distributed Systems & Incident Response')).toBeInTheDocument();
  });

  it('runs automated batch simulation directly from the dashboard', () => {
    render(<MontyHall3DLab />);

    const runBatchBtn = screen.getByText(/Run 1,000 Quick Trials/i);
    expect(runBatchBtn).toBeInTheDocument();
    fireEvent.click(runBatchBtn);
  });

  it('toggles the 100-door intuition shortcut', () => {
    render(<MontyHall3DLab />);

    const toggleBtn = screen.getByText(/Expand the 100-Door Shortcut/i);
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Pick a Random Door/i)).toBeInTheDocument();
  });
});
