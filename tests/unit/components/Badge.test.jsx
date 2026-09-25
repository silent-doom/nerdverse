import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Physics</Badge>);
    expect(screen.getByText('Physics')).toBeInTheDocument();
  });

  it('applies the default variant class', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild;
    expect(badge.className).toContain('badge');
    expect(badge.className).toContain('default');
  });

  it('applies custom variant class', () => {
    const { container } = render(<Badge variant="category">Cat</Badge>);
    const badge = container.firstChild;
    expect(badge.className).toContain('category');
  });

  it('applies the new variant class', () => {
    const { container } = render(<Badge variant="new">New!</Badge>);
    const badge = container.firstChild;
    expect(badge.className).toContain('new');
    expect(screen.getByText('New!')).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(<Badge size="md">Big Badge</Badge>);
    const badge = container.firstChild;
    expect(badge.className).toContain('md');
  });

  it('applies custom color via CSS variable', () => {
    const { container } = render(<Badge color="#ff0000">Red</Badge>);
    const badge = container.firstChild;
    expect(badge.style.getPropertyValue('--badge-color')).toBe('#ff0000');
  });

  it('renders without color prop — no inline style', () => {
    const { container } = render(<Badge>No color</Badge>);
    const badge = container.firstChild;
    expect(badge.style.length).toBe(0);
  });

  it('merges additional className', () => {
    const { container } = render(<Badge className="extra">Custom</Badge>);
    const badge = container.firstChild;
    expect(badge.className).toContain('extra');
  });
});
