import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button/Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies primary variant by default', () => {
    const { container } = render(<Button>Primary</Button>);
    const button = container.firstChild;
    expect(button.className).toContain('primary');
  });

  it('applies custom variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    const button = container.firstChild;
    expect(button.className).toContain('ghost');
  });

  it('applies size class', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    const button = container.firstChild;
    expect(button.className).toContain('lg');
  });

  it('handles click events', () => {
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(clicked).toBe(true);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when loading', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows spinner when loading', () => {
    const { container } = render(<Button isLoading>Loading</Button>);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Button fullWidth>Full</Button>);
    const button = container.firstChild;
    expect(button.className).toContain('fullWidth');
  });

  it('renders left icon', () => {
    render(<Button leftIcon={<span data-testid="left-icon">★</span>}>Star</Button>);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders right icon', () => {
    render(<Button rightIcon={<span data-testid="right-icon">→</span>}>Go</Button>);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('does not call onClick when disabled', () => {
    let clicked = false;
    render(<Button disabled onClick={() => { clicked = true; }}>No click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(clicked).toBe(false);
  });
});
