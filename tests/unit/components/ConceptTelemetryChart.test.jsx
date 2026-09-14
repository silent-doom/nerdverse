import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ConceptTelemetryChart from '@/components/analytics/ConceptTelemetryChart';

describe('ConceptTelemetryChart', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders concept telemetry chart with empirical metrics and convergence data', async () => {
    await act(async () => {
      render(<ConceptTelemetryChart conceptSlug="monty-hall" conceptTitle="Monty Hall Problem" />);
    });

    expect(screen.getByTestId('concept-telemetry-chart')).toBeInTheDocument();
    expect(screen.getByText(/Monty Hall Problem Telemetry/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Community Runs/i)).toBeInTheDocument();
    expect(screen.getByText(/Theoretical Target/i)).toBeInTheDocument();
    expect(screen.getByText(/66.67/i)).toBeInTheDocument();
  });

  it('switches between Convergence Curve and Outcome Distribution tabs', async () => {
    await act(async () => {
      render(<ConceptTelemetryChart conceptSlug="st-petersburg-paradox" conceptTitle="St. Petersburg Paradox" />);
    });

    const distTab = screen.getByText(/Outcome Distribution/i);
    await act(async () => {
      fireEvent.click(distTab);
    });

    expect(distTab.closest('button')).toHaveClass(/tabBtnActive/);

    const convTab = screen.getByText(/Convergence Curve/i);
    await act(async () => {
      fireEvent.click(convTab);
    });

    expect(convTab.closest('button')).toHaveClass(/tabBtnActive/);
  });

  it('reacts dynamically to custom concept_run_recorded event', async () => {
    await act(async () => {
      render(<ConceptTelemetryChart conceptSlug="bayes-theorem" conceptTitle="Bayes' Theorem" />);
    });

    const initialTotal = screen.getByText(/Total Community Runs/i).parentElement;
    const initialText = initialTotal.textContent;

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent('concept_run_recorded', {
          detail: {
            conceptSlug: 'bayes-theorem',
            run: { id: 'test-1', metrics: { posteriorPct: 15.0 }, value: 15.0 },
          },
        })
      );
    });

    expect(screen.getByTestId('concept-telemetry-chart')).toBeInTheDocument();
  });
});
