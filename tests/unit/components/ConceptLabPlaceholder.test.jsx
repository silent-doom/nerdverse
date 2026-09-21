import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ConceptLabPlaceholder from '@/components/interactive/ConceptLabPlaceholder';
import { concepts } from '@/data/concepts';
import { GRAPH_NODES, GRAPH_LINKS } from '@/data/knowledgeGraphData';

describe('New Concepts Integration & Placeholder Engine', () => {
  const newSlugs = [
    'pi-collisions',
    'eulers-number',
    'cap-theorem',
    'teslers-law',
    'brouwers-fixed-point-theorem',
    'parkinsons-law',
    'hofstadters-law',
    'hanlons-razor',
    'pareto-principle',
    'peter-principle',
    'hicks-law',
    'goodharts-law',
    'dunning-kruger-effect',
    'occams-razor',
    'chestertons-fence',
    'brooks-law',
  ];

  it('all 16 new concepts exist in concepts data layer', () => {
    expect(concepts.length).toBeGreaterThanOrEqual(36);
    const existingSlugs = new Set(concepts.map((c) => c.slug));
    newSlugs.forEach((slug) => {
      expect(existingSlugs.has(slug)).toBe(true);
    });
  });

  it('all 16 new concepts possess 30-second hooks and guided challenges', () => {
    newSlugs.forEach((slug) => {
      const c = concepts.find((item) => item.slug === slug);
      expect(c).toBeDefined();
      expect(c.hook).toBeDefined();
      expect(c.hook.premise).toBeTruthy();
      expect(c.hook.intuition).toBeTruthy();
      expect(c.hook.twist).toBeTruthy();
      expect(c.takeaway).toBeTruthy();
      expect(c.challenges).toBeInstanceOf(Array);
      expect(c.challenges.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('all 16 new concepts are mapped as nodes in 3D Knowledge Graph', () => {
    const graphSlugs = new Set(GRAPH_NODES.map((n) => n.slug));
    newSlugs.forEach((slug) => {
      expect(graphSlugs.has(slug)).toBe(true);
    });
  });

  it('GRAPH_LINKS contains semantic connections involving new concepts', () => {
    const newLinks = GRAPH_LINKS.filter((l) => newSlugs.includes(l.source) || newSlugs.includes(l.target));
    expect(newLinks.length).toBeGreaterThanOrEqual(16);
  });

  it('ConceptLabPlaceholder renders and updates parameters interactively', () => {
    render(<ConceptLabPlaceholder conceptType="PiCollisions" />);
    expect(screen.getByText(/Galperin Elastic Collisions Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Mathematical Parameter Scrubber/i)).toBeInTheDocument();

    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: 3 } });
    expect(screen.getByText('314')).toBeInTheDocument();
  });

  it('displays Coming Soon overlay with planned engine and community issue desk priority link', () => {
    const testConcept = { slug: 'eulers-number', title: "Euler's Number" };
    render(<ConceptLabPlaceholder conceptType="EulersNumber" concept={testConcept} />);

    expect(screen.getByText(/Coming Soon: Interactive Simulation/i)).toBeInTheDocument();
    expect(screen.getByText(/Engineering Pipeline • Phase 2/i)).toBeInTheDocument();
    expect(screen.getByText(/3D Logarithmic Growth Spiral/i)).toBeInTheDocument();

    // Verify community issue desk link
    const priorityLink = screen.getByRole('link', { name: /Request Priority \/ Propose Simulation Design/i });
    expect(priorityLink).toBeInTheDocument();
    expect(priorityLink.getAttribute('href')).toBe('/community?category=feature&page=/concepts/eulers-number');

    // Verify notification toggle
    const notifyBtn = screen.getByRole('button', { name: /Notify on Release/i });
    expect(notifyBtn).toBeInTheDocument();
    fireEvent.click(notifyBtn);
    expect(screen.getByText(/Subscribed for Release/i)).toBeInTheDocument();
  });
});
