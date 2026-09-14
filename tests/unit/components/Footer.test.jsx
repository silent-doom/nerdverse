import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer/Footer';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Footer Component', () => {
  it('renders all footer navigation links without broken or dead links', () => {
    const { container } = render(<Footer />);
    
    // Check brand and description
    expect(screen.getByText('NERD')).toBeInTheDocument();
    expect(screen.getByText('VERSE')).toBeInTheDocument();
    expect(screen.getByText(/Explore the universe, one concept at a time/i)).toBeInTheDocument();

    // Find all links in footer
    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(6);

    // Verify none of the links have href="#" or are empty
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    });

    // Check specific navigation targets
    expect(screen.getByRole('link', { name: /All Concepts/i })).toHaveAttribute('href', '/concepts');
    expect(screen.getByRole('link', { name: /Knowledge Graph/i })).toHaveAttribute('href', '/explore');
    expect(screen.getByRole('link', { name: /Disciplines/i })).toHaveAttribute('href', '/concepts#disciplines');
    expect(screen.getByRole('link', { name: /Discussions/i })).toHaveAttribute('href', '/community#discussions');
    expect(screen.getByRole('link', { name: /Contributors/i })).toHaveAttribute('href', '/community#contributors');
    expect(screen.getByRole('link', { name: /Guidelines/i })).toHaveAttribute('href', '/community#guidelines');
    expect(screen.getByRole('link', { name: /Our Mission/i })).toHaveAttribute('href', '/about#mission');
    expect(screen.getByRole('link', { name: /Open Source/i })).toHaveAttribute('href', 'https://github.com/silent-doom/nerdverse');
    expect(screen.getByRole('link', { name: /Contact/i })).toHaveAttribute('href', '/about#contact');
  });
});
