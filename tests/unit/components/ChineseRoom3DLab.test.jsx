import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChineseRoom3DLab from '@/components/3d/ChineseRoom3DLab';

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
  recordConceptRun: vi.fn().mockResolvedValue({ id: 'test-run-id' }),
}));

describe('ChineseRoom3DLab', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  it('renders Chinese Room 3D Lab with titles and metrics', () => {
    render(<ChineseRoom3DLab />);

    expect(screen.getByTestId('chinese-room-3d-lab')).toBeInTheDocument();
    expect(screen.getByText(/The Chinese Room/i)).toBeInTheDocument();
    expect(screen.getByText(/Internal Understanding/i)).toBeInTheDocument();
    expect(screen.getByText(/0% \(Pure Syntax\)/i)).toBeInTheDocument();
    expect(screen.getByText(/External Comprehension/i)).toBeInTheDocument();
    expect(screen.getByText(/100% \(Passed Turing Test\)/i)).toBeInTheDocument();
  });

  it('advances through the translation pipeline step by step', () => {
    render(<ChineseRoom3DLab />);

    expect(screen.getByText(/Ready: Query Prepared Outside/i)).toBeInTheDocument();

    const advanceBtn = screen.getByRole('button', { name: /Advance Pipeline Step/i });
    fireEvent.click(advanceBtn);
    expect(screen.getByText(/Step 1: Chinese Query Slipped Into Room/i)).toBeInTheDocument();

    fireEvent.click(advanceBtn);
    expect(screen.getByText(/Step 2: Operator Consults English Rulebook/i)).toBeInTheDocument();

    fireEvent.click(advanceBtn);
    expect(screen.getByText(/Step 3: Character Tiles Retrieved From Cabinet/i)).toBeInTheDocument();

    fireEvent.click(advanceBtn);
    expect(screen.getByText(/Step 4: Output Delivered Outside/i)).toBeInTheDocument();
  });

  it('allows selecting different Chinese queries', () => {
    render(<ChineseRoom3DLab />);

    const mindQuery = screen.getByText(/机器能拥有真正的意识吗？/i);
    fireEvent.click(mindQuery);

    expect(screen.getAllByText(/Can machines possess true consciousness\?/i).length).toBeGreaterThanOrEqual(1);
  });

  it('switches between perspectives: inside (syntax), outside (semantics), systems', () => {
    render(<ChineseRoom3DLab />);

    const perspTab = screen.getByRole('tab', { name: /2\. Syntax vs Semantics Perspectives/i });
    fireEvent.click(perspTab);

    const outsideBtn = screen.getByRole('button', { name: /Outside Room \(Evaluator: Semantics\)/i });
    fireEvent.click(outsideBtn);
    expect(screen.getByText(/External Evaluator: Apparent Semantics/i)).toBeInTheDocument();

    const systemsBtn = screen.getByRole('button', { name: /Systems View \(Whole Room as Computer\)/i });
    fireEvent.click(systemsBtn);
    expect(screen.getByText(/The Systems Reply: Integrated Architecture/i)).toBeInTheDocument();
  });

  it('allows casting a vote on whether the Chinese Room understands Chinese', () => {
    render(<ChineseRoom3DLab />);

    const dilemmaTab = screen.getByRole('tab', { name: /3\. The Fatal Question \(Poll\)/i });
    fireEvent.click(dilemmaTab);

    const searleVote = screen.getByText(/No: Syntax ≠ Semantics \(John Searle\)/i);
    fireEvent.click(searleVote);

    expect(screen.getByText(/54% Consensus/i)).toBeInTheDocument();
  });
});
