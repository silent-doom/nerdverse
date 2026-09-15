import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BraessParadox3DLab from '@/components/3d/BraessParadox3DLab';

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

vi.mock('@/lib/supabase/conceptRuns', () => ({
  recordConceptRun: vi.fn().mockResolvedValue({ id: 'test-braess-run-id' }),
}));

describe('BraessParadox3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Braess Paradox 3D Lab with title and key network metrics', () => {
    render(<BraessParadox3DLab />);

    expect(screen.getByTestId('braess-paradox-3d-lab')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Braess's Paradox/i })).toBeInTheDocument();
    expect(screen.getByText(/Average Commute Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Price of Anarchy \(PoA\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Bypass Highway Status/i)).toBeInTheDocument();
    expect(screen.getByText(/65 Minutes/i)).toBeInTheDocument();
  });

  it('toggles the super-bypass highway and reveals the congestion paradox', () => {
    render(<BraessParadox3DLab />);

    // Initial state: Bypass closed, 65 min commute
    expect(screen.getByText(/65 Minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/CLOSED \(Smooth Flow\)/i)).toBeInTheDocument();

    // Click to Open the Bypass Highway
    const openBtn = screen.getByRole('button', { name: /Open Bypass Highway/i });
    fireEvent.click(openBtn);

    // Commute time unexpectedly increases to 80 minutes
    expect(screen.getByText(/80 Minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/OPEN \(Gridlock\)/i)).toBeInTheDocument();
    expect(screen.getByText(/1\.23× \(Inefficient\)/i)).toBeInTheDocument();

    // Click to Close / Demolish the Bypass
    const closeBtn = screen.getByRole('button', { name: /Close Bypass Highway/i });
    fireEvent.click(closeBtn);

    // Commute drops back to 65 minutes
    expect(screen.getByText(/65 Minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/CLOSED \(Smooth Flow\)/i)).toBeInTheDocument();
  });

  it('adjusts commuter volume via slider in Tab 1', () => {
    render(<BraessParadox3DLab />);

    const slider = screen.getByLabelText(/Commuter Volume Slider/i);
    fireEvent.change(slider, { target: { value: '5000' } });

    // With 5000 cars and bypass closed: (5000/200) + 45 = 25 + 45 = 70 min
    expect(screen.getByText(/70 Minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Commuters: 5000 Cars/i)).toBeInTheDocument();
  });

  it('switches between real-world case studies in Tab 2', () => {
    render(<BraessParadox3DLab />);

    const caseTab = screen.getByRole('tab', { name: /2\. Real-World Road Demolitions/i });
    fireEvent.click(caseTab);

    expect(screen.getByText(/Documented Historical Paradoxes/i)).toBeInTheDocument();
    expect(screen.getByText(/Seoul, South Korea/i)).toBeInTheDocument();
    expect(screen.getByText(/New York City/i)).toBeInTheDocument();
    expect(screen.getByText(/Stuttgart, Germany/i)).toBeInTheDocument();

    // Select NYC
    const nycCard = screen.getByText(/New York City/i);
    fireEvent.click(nycCard);
    expect(screen.getByText(/Closing Manhattan's congested 42nd Street/i)).toBeInTheDocument();
  });

  it('explores cross-domain network invariance in Tab 3', () => {
    render(<BraessParadox3DLab />);

    const techTab = screen.getByRole('tab', { name: /3\. Internet Packets & Power Grids/i });
    fireEvent.click(techTab);

    expect(screen.getByText(/Cross-Domain Network Invariance/i)).toBeInTheDocument();
    expect(screen.getByText(/Internet Packet Routing \(OSPF \/ BGP\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Electric AC Power Grids/i)).toBeInTheDocument();

    // Record Telemetry
    const recordBtn = screen.getByRole('button', { name: /Record Routing Telemetry/i });
    fireEvent.click(recordBtn);
  });
});
