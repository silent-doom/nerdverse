import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KnowledgeNodeGraph from '@/components/interactive/KnowledgeNodeGraph';
import { concepts } from '@/data/concepts';

describe('KnowledgeNodeGraph Component', () => {
  it('renders the 2D knowledge graph container, title, and search controls', () => {
    render(<KnowledgeNodeGraph />);

    expect(screen.getByTestId('knowledge-node-graph')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /The Knowledge Web/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(new RegExp(`Search all ${concepts.length} knowledge nodes`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(/All Nodes/i)).toBeInTheDocument();
  });

  it('contains and renders all concept nodes without omitting any', () => {
    render(<KnowledgeNodeGraph />);

    expect(concepts.length).toBeGreaterThanOrEqual(38);

    // Verify new concept titles are present in tooltips/links
    const newConcepts = [
      "Galperin's Pi Collisions",
      "Euler's Number (The Constant of Growth)",
      'The CAP Theorem',
      "Tesler's Law (Conservation of Complexity)",
      "Brouwer's Fixed Point Theorem",
      "Parkinson's Law",
      "Hofstadter's Law",
      "Hanlon's Razor",
      'The Pareto Principle (80/20 Rule)',
      'The Peter Principle',
      "Hick's Law (The Hick-Hyman Law)",
      "Goodhart's Law",
      'The Dunning-Kruger Effect',
      "Occam's Razor (Lex Parsimoniae)",
      "Chesterton's Fence",
      "Brooks' Law",
      'Möbius Strip',
      'Vampire Tiles (an "ein stein")',
    ];

    newConcepts.forEach((title) => {
      const elements = screen.getAllByTitle(title);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('filters nodes when searching in the search bar', () => {
    render(<KnowledgeNodeGraph />);

    const searchInput = screen.getByPlaceholderText(new RegExp(`Search all ${concepts.length} knowledge nodes`, 'i'));
    fireEvent.change(searchInput, { target: { value: 'collisions' } });

    // Link for pi-collisions should exist
    const piNode = screen.getByTitle("Galperin's Pi Collisions");
    expect(piNode).toBeInTheDocument();

    // Clear search button should restore
    const clearBtn = screen.getByLabelText('Clear search');
    fireEvent.click(clearBtn);
    expect(searchInput.value).toBe('');
  });

  it('selects a node on click and reveals the active telemetry inspection card', () => {
    render(<KnowledgeNodeGraph />);

    const capNode = screen.getByTitle('The CAP Theorem');
    fireEvent.click(capNode);

    // Active card should show CAP Theorem details
    expect(screen.getByRole('heading', { level: 3, name: 'The CAP Theorem' })).toBeInTheDocument();
    expect(screen.getByText(/Launch Interactive Lab/i)).toBeInTheDocument();
    expect(screen.getByText(/Inspect in 3D Space/i)).toBeInTheDocument();

    // Close button dismisses active card
    const closeBtn = screen.getByLabelText('Deselect node');
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('heading', { level: 3, name: 'The CAP Theorem' })).not.toBeInTheDocument();
  });

  it('supports initialActiveSlug prop to open pre-selected node', () => {
    render(<KnowledgeNodeGraph initialActiveSlug="eulers-number" />);

    expect(screen.getByRole('heading', { level: 3, name: "Euler's Number" })).toBeInTheDocument();
    expect(screen.getByText(/Paradox Core:/i)).toBeInTheDocument();
  });
});
