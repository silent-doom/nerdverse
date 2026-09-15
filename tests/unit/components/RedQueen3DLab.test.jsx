import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RedQueen3DLab from '@/components/3d/RedQueen3DLab';

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

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', async () => {
  const THREE = await import('three');
  return {
    GLTFLoader: class {
      load(url, onLoad) {
        if (typeof onLoad === 'function') {
          const mockScene = new THREE.Group();
          onLoad({ scene: mockScene });
        }
      }
    },
  };
});

vi.mock('@/lib/supabase/conceptRuns', () => ({
  recordConceptRun: vi.fn().mockResolvedValue({ id: 'test-bio-run-id' }),
}));

describe('RedQueen3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Red Queen 3D Lab with title, quote, and key telemetry metrics', () => {
    render(<RedQueen3DLab />);

    expect(screen.getByTestId('red-queen-3d-lab')).toBeInTheDocument();
    expect(screen.getByText(/The Red Queen Hypothesis/i)).toBeInTheDocument();
    expect(screen.getByText(/takes all the running you can do/i)).toBeInTheDocument();
    expect(screen.getByText(/Leopard Speed/i)).toBeInTheDocument();
    expect(screen.getByText(/Gazelle Agility/i)).toBeInTheDocument();
    expect(screen.getByText(/Relative Gap \(Δx\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Relative Velocity \(Δv\)/i)).toBeInTheDocument();
  });

  it('switches camera presets and environment themes', () => {
    render(<RedQueen3DLab />);

    // Camera preset buttons
    const predatorPovBtn = screen.getByRole('button', { name: /Leopard POV/i });
    fireEvent.click(predatorPovBtn);
    expect(predatorPovBtn.className).toMatch(/viewBtnActive/);

    const preyPovBtn = screen.getByRole('button', { name: /Gazelle Rearview/i });
    fireEvent.click(preyPovBtn);
    expect(preyPovBtn.className).toMatch(/viewBtnActive/);

    // Environment stage theme buttons
    const chessboardBtn = screen.getByRole('button', { name: /Looking-Glass Chessboard/i });
    fireEvent.click(chessboardBtn);
    expect(chessboardBtn.className).toMatch(/viewBtnActive/);

    const savannahBtn = screen.getByRole('button', { name: /Serengeti Plains/i });
    fireEvent.click(savannahBtn);
    expect(savannahBtn.className).toMatch(/viewBtnActive/);
  });

  it('adjusts predator and prey speed sliders in Tab 1', () => {
    render(<RedQueen3DLab />);

    const predSlider = screen.getByLabelText(/Predator Speed/i);
    fireEvent.change(predSlider, { target: { value: '95' } });
    expect(screen.getByText(/Cheetah Acceleration: 95 km\/h/i)).toBeInTheDocument();

    const preySlider = screen.getByLabelText(/Prey Agility/i);
    fireEvent.change(preySlider, { target: { value: '100' } });
    expect(screen.getByText(/Gazelle Evasion Agility: 100 km\/h/i)).toBeInTheDocument();
  });

  it('switches to Host-Parasite tab and adjusts host mutation rate', () => {
    render(<RedQueen3DLab />);

    const hostTab = screen.getByRole('tab', { name: /Host-Parasite Arms Race/i });
    fireEvent.click(hostTab);

    expect(screen.getByText(/Host Immune Mutation Rate/i)).toBeInTheDocument();
    const slider = screen.getByLabelText(/Host Mutation Rate/i);
    fireEvent.change(slider, { target: { value: '90' } });
    expect(screen.getByText(/90% Speed/i)).toBeInTheDocument();
  });

  it('switches to The Mystery of Sex tab and toggles reproduction strategy', () => {
    render(<RedQueen3DLab />);

    const sexTab = screen.getByRole('tab', { name: /The Mystery of Sex/i });
    fireEvent.click(sexTab);

    expect(screen.getByText(/Select Reproduction Strategy/i)).toBeInTheDocument();
    const asexualOption = screen.getByText(/Asexual Clones \(2× Reproduction\)/i);
    fireEvent.click(asexualOption);
    expect(screen.getByText(/92% Vulnerable/i)).toBeInTheDocument();
  });

  it('triggers mutation surges, extinction test, and records evolutionary telemetry', async () => {
    render(<RedQueen3DLab />);

    // Leopard mutation surge button
    const surgeBtn = screen.getByRole('button', { name: /Leopard Mutation/i });
    fireEvent.click(surgeBtn);

    // Advance generation
    const stepBtn = screen.getByRole('button', { name: /Advance Generation/i });
    fireEvent.click(stepBtn);
    expect(screen.getByText(/Gen #2/i)).toBeInTheDocument();

    // Record Telemetry
    const recordBtn = screen.getByRole('button', { name: /Record Evolutionary Telemetry/i });
    await act(async () => {
      fireEvent.click(recordBtn);
    });
  });
});
