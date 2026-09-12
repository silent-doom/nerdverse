import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Card from '@/components/ui/Card/Card';

describe('Card', () => {
  it('renders children', () => {
    const { container } = render(<Card>Card content</Card>);
    expect(container).toHaveTextContent('Card content');
  });

  it('applies default variant class', () => {
    const { container } = render(<Card>Default</Card>);
    const card = container.firstChild;
    expect(card.className).toContain('card');
    expect(card.className).toContain('default');
  });

  it('applies interactive variant', () => {
    const { container } = render(<Card variant="interactive">Interactive</Card>);
    const card = container.firstChild;
    expect(card.className).toContain('interactive');
  });

  it('applies elevated variant', () => {
    const { container } = render(<Card variant="elevated">Elevated</Card>);
    const card = container.firstChild;
    expect(card.className).toContain('elevated');
  });

  it('applies padding size', () => {
    const { container } = render(<Card padding="lg">Large pad</Card>);
    const card = container.firstChild;
    expect(card.className).toContain('pad-lg');
  });

  it('applies glow class', () => {
    const { container } = render(<Card glow>Glow</Card>);
    const card = container.firstChild;
    expect(card.className).toContain('glow');
  });

  it('does not apply glow class by default', () => {
    const { container } = render(<Card>No glow</Card>);
    const card = container.firstChild;
    expect(card.className).not.toContain('glow');
  });

  it('renders as custom element', () => {
    const { container } = render(<Card as="section">Section card</Card>);
    expect(container.firstChild.tagName).toBe('SECTION');
  });

  it('merges additional className', () => {
    const { container } = render(<Card className="custom">Custom</Card>);
    const card = container.firstChild;
    expect(card.className).toContain('custom');
  });
});
