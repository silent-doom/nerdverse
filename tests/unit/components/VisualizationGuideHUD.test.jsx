import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import VisualizationGuideHUD from '@/components/interactive/VisualizationGuideHUD';

describe('VisualizationGuideHUD', () => {
  it('renders 3D mode with standard navigation instructions and experiment steps', () => {
    const steps = [
      { step: 1, title: 'Step One', badge: 'Key 1', text: 'First instruction.' },
      { step: 2, title: 'Step Two', badge: 'Key 2', text: 'Second instruction.' },
    ];
    const hotkeys = [{ key: 'Space', action: 'Toggle Play' }];

    render(
      <VisualizationGuideHUD
        mode="3d"
        title="Custom 3D Guide"
        steps={steps}
        hotkeys={hotkeys}
      />
    );

    expect(screen.getByText(/Custom 3D Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Left-Click \+ Drag:/i)).toBeInTheDocument();
    expect(screen.getByText(/Orbit View/i)).toBeInTheDocument();
    expect(screen.getByText(/Step One/i)).toBeInTheDocument();
    expect(screen.getByText(/Key 1/i)).toBeInTheDocument();
    expect(screen.getByText(/First instruction./i)).toBeInTheDocument();
    expect(screen.getByText(/Toggle Play/i)).toBeInTheDocument();

    // Toggle guide visibility
    const toggleBtn = screen.getByRole('button', { name: /Hide Guide/i });
    fireEvent.click(toggleBtn);
    expect(screen.queryByText(/First instruction./i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Show Guide/i })).toBeInTheDocument();
  });

  it('renders 2D mode with interactive slider cues', () => {
    const steps = [
      { step: 1, title: 'Probability Slider', badge: 'P(X)', text: 'Adjust prior probability.' },
    ];

    render(
      <VisualizationGuideHUD
        mode="2d"
        steps={steps}
      />
    );

    expect(screen.getByText(/2D Interactive Guide & Logic/i)).toBeInTheDocument();
    expect(screen.getByText(/Sliders & Toggles:/i)).toBeInTheDocument();
    expect(screen.getByText(/Probability Slider/i)).toBeInTheDocument();
    expect(screen.getByText(/P\(X\)/i)).toBeInTheDocument();
  });
});
