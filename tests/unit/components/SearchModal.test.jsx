import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchModal from '@/components/search/SearchModal';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, onClick, ...props }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

describe('SearchModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<SearchModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders search modal when isOpen is true', () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId('search-modal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search all 19 concepts/i)).toBeInTheDocument();
  });

  it('filters concepts when search text is typed', () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText(/Search all 19 concepts/i);
    
    // Type "demon"
    fireEvent.change(input, { target: { value: 'demon' } });
    expect(screen.getByText("Maxwell's Demon")).toBeInTheDocument();
    expect(screen.getByText("Laplace's Demon")).toBeInTheDocument();
  });

  it('filters concepts by category when category filter chip is clicked', () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    
    // Click Computer Science
    const csButton = screen.getByRole('button', { name: /Computer Science/i });
    fireEvent.click(csButton);

    expect(screen.getByText("Turing Halting Problem")).toBeInTheDocument();
    expect(screen.getByText("Conway's Game of Life")).toBeInTheDocument();
  });

  it('calls onClose when close/esc button is clicked', () => {
    const onCloseMock = vi.fn();
    render(<SearchModal isOpen={true} onClose={onCloseMock} />);
    const escBtn = screen.getByTitle('Close modal');
    fireEvent.click(escBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('navigates when clicking a search result', () => {
    const onCloseMock = vi.fn();
    render(<SearchModal isOpen={true} onClose={onCloseMock} />);
    const input = screen.getByPlaceholderText(/Search all 19 concepts/i);
    fireEvent.change(input, { target: { value: 'Theseus' } });

    const item = screen.getByText('Ship of Theseus');
    fireEvent.click(item);

    expect(onCloseMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/concepts/ship-of-theseus');
  });

  it('shows empty state when no concept matches query', () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText(/Search all 19 concepts/i);
    fireEvent.change(input, { target: { value: 'xyzrandomnotfound999' } });

    expect(screen.getByText('No concepts found')).toBeInTheDocument();
  });
});
