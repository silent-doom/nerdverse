import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KnowledgeGraph3D from '@/components/3d/KnowledgeGraph3D';

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

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: class {
    constructor() {
      this.target = { set: vi.fn(), lerp: vi.fn() };
      this.enableDamping = true;
      this.dampingFactor = 0.05;
      this.maxDistance = 140;
      this.minDistance = 6;
      this.autoRotate = false;
      this.autoRotateSpeed = 0.6;
    }
    update() {}
    dispose() {}
  },
}));

describe('KnowledgeGraph3D Component', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      roundRect: vi.fn(),
    });
  });

  it('renders the 3D graph container and controls dock', () => {
    render(<KnowledgeGraph3D />);

    expect(screen.getByTestId('knowledge-graph-3d')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search ideas, paradoxes, or domains/i)).toBeInTheDocument();
    expect(screen.getByText('All Domains')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('2D Top-Down')).toBeInTheDocument();
    expect(screen.getByText('Spin')).toBeInTheDocument();
    expect(screen.getByText('Auras')).toBeInTheDocument();
    expect(screen.getByText('Labels')).toBeInTheDocument();
  });

  it('filters by domain when clicking domain chips', () => {
    render(<KnowledgeGraph3D />);

    const physicsChip = screen.getByText('Physics');
    fireEvent.click(physicsChip);

    expect(physicsChip.closest('button')).toHaveClass(/domainChipActive/);
  });

  it('filters search queries and selects a concept to open Connected Papers inspector', () => {
    render(<KnowledgeGraph3D />);

    const searchInput = screen.getByPlaceholderText(/Search ideas, paradoxes, or domains/i);
    fireEvent.change(searchInput, { target: { value: 'Monty' } });

    const searchResult = screen.getByText('Monty Hall Problem');
    expect(searchResult).toBeInTheDocument();

    fireEvent.click(searchResult);

    // Inspector drawer should open
    const inspector = screen.getByTestId('inspector-drawer');
    expect(inspector).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Monty Hall Problem' })).toBeInTheDocument();
    expect(screen.getByText(/Launch 3D Interactive Lab/i)).toBeInTheDocument();
    expect(screen.getByText(/Direct Intellectual Kinship/i)).toBeInTheDocument();
  });

  it('toggles 2D Top-Down and 3D Perspective view', () => {
    render(<KnowledgeGraph3D />);

    const toggleBtn = screen.getByText('2D Top-Down');
    fireEvent.click(toggleBtn);

    expect(screen.getByText('3D Orbit')).toBeInTheDocument();

    fireEvent.click(screen.getByText('3D Orbit'));
    expect(screen.getByText('2D Top-Down')).toBeInTheDocument();
  });

  it('closes the inspector drawer when clicking close button', () => {
    render(<KnowledgeGraph3D />);

    const searchInput = screen.getByPlaceholderText(/Search ideas, paradoxes, or domains/i);
    fireEvent.change(searchInput, { target: { value: 'Trolley' } });

    fireEvent.click(screen.getByText('The Trolley Problem'));
    expect(screen.getByTestId('inspector-drawer')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close Inspector');
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId('inspector-drawer')).not.toBeInTheDocument();
  });
});
