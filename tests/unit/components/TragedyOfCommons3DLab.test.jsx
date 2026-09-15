import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TragedyOfCommons3DLab from '@/components/3d/TragedyOfCommons3DLab';

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
  recordConceptRun: vi.fn().mockResolvedValue({ id: 'test-commons-run-id' }),
}));

describe('TragedyOfCommons3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Tragedy of Commons 3D Lab with title and key ecological metrics', () => {
    render(<TragedyOfCommons3DLab />);

    expect(screen.getByTestId('tragedy-of-commons-3d-lab')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Tragedy of the Commons/i })).toBeInTheDocument();
    expect(screen.getByText(/Village Herd Size/i)).toBeInTheDocument();
    expect(screen.getByText(/Pasture Biomass/i)).toBeInTheDocument();
    expect(screen.getByText(/Pasture Ecological Health/i)).toBeInTheDocument();
  });

  it('adjusts herd size in Tab 1 (Hardin Unmanaged Commons)', () => {
    render(<TragedyOfCommons3DLab />);

    // Default herd is 40
    expect(screen.getAllByText(/40 Cattle/i).length).toBeGreaterThan(0);

    // Click Add Another Cow (+5)
    const addBtn = screen.getByRole('button', { name: /Add Another Cow \(\+1 Utility\)/i });
    fireEvent.click(addBtn);
    expect(screen.getAllByText(/45 Cattle/i).length).toBeGreaterThan(0);

    // Click Reduce Herd
    const reduceBtn = screen.getByRole('button', { name: /Remove Cattle/i });
    fireEvent.click(reduceBtn);
    expect(screen.getAllByText(/40 Cattle/i).length).toBeGreaterThan(0);

    // Move slider to 80 (Over capacity)
    const slider = screen.getByLabelText(/Village Herd Size Slider/i);
    fireEvent.change(slider, { target: { value: '80' } });
    expect(screen.getAllByText(/80 Cattle/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/OVER CAPACITY/i)).toBeInTheDocument();
  });

  it('toggles Elinor Ostrom governance principles in Tab 2', () => {
    render(<TragedyOfCommons3DLab />);

    const ostromTab = screen.getByRole('tab', { name: /2\. Ostrom's 1990 Polycentric Governance/i });
    fireEvent.click(ostromTab);

    expect(screen.getByText(/Community Self-Governance Rules/i)).toBeInTheDocument();
    expect(screen.getByText(/Disproving the False Dichotomy/i)).toBeInTheDocument();

    // Toggle Quota
    const quotaItem = screen.getByText(/1\. Community Grazing Quota/i);
    fireEvent.click(quotaItem);

    // Toggle Pasture Rotation
    const rotationItem = screen.getByText(/2\. Pasture Sector Rotation/i);
    fireEvent.click(rotationItem);

    // Toggle Monitoring
    const monitorItem = screen.getByText(/3\. Peer Inspection & Graduated Fines/i);
    fireEvent.click(monitorItem);
  });

  it('switches between global commons domains in Tab 3', () => {
    render(<TragedyOfCommons3DLab />);

    const modernTab = screen.getByRole('tab', { name: /3\. Global Commons: Fisheries & Carbon Sinks/i });
    fireEvent.click(modernTab);

    expect(screen.getByText(/Select Depletable Global Commons/i)).toBeInTheDocument();
    expect(screen.getByText(/Ocean Fisheries/i)).toBeInTheDocument();
    expect(screen.getByText(/Atmosphere Sink/i)).toBeInTheDocument();
    expect(screen.getByText(/Groundwater Aquifer/i)).toBeInTheDocument();

    // Click Atmosphere Sink
    const carbonOption = screen.getByText(/Atmosphere Sink/i);
    fireEvent.click(carbonOption);
    expect(screen.getByText(/Emitting carbon yields private industrial profit/i)).toBeInTheDocument();
  });

  it('resets the commons and records telemetry', () => {
    render(<TragedyOfCommons3DLab />);

    const resetBtn = screen.getByRole('button', { name: /Reset Commons/i });
    fireEvent.click(resetBtn);
    expect(screen.getAllByText(/30 Cattle/i).length).toBeGreaterThan(0);

    const recordBtn = screen.getByRole('button', { name: /Record Commons Telemetry/i });
    fireEvent.click(recordBtn);
  });
});
