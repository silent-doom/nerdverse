import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import EasterEggManager from '@/components/common/EasterEggManager';

describe('EasterEggManager', () => {
  beforeEach(() => {
    document.body.className = '';
  });

  afterEach(() => {
    document.body.className = '';
    delete window.nerdverse;
  });

  it('initializes window.nerdverse hacker console tools on mount', () => {
    render(<EasterEggManager />);

    expect(window.nerdverse).toBeDefined();
    expect(typeof window.nerdverse.quantumFlip).toBe('function');
    expect(typeof window.nerdverse.butterToast).toBe('function');
    expect(typeof window.nerdverse.meaningOfLife).toBe('function');
    expect(typeof window.nerdverse.collapseCat).toBe('function');

    expect(window.nerdverse.meaningOfLife()).toContain('42');
  });

  it('toggles quantum flipped mode when calling window.nerdverse.quantumFlip()', () => {
    render(<EasterEggManager />);

    act(() => {
      window.nerdverse.quantumFlip();
    });
    expect(document.body.classList.contains('quantum-flipped')).toBe(true);

    act(() => {
      window.nerdverse.quantumFlip();
    });
    expect(document.body.classList.contains('quantum-flipped')).toBe(false);
  });

  it('triggers Konami code and unlocks Retro Nerd Mode', () => {
    render(<EasterEggManager />);

    const keys = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];

    act(() => {
      keys.forEach((key) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key }));
      });
    });

    expect(document.body.classList.contains('retro-phosphor-mode')).toBe(true);
    expect(screen.getByText(/Retro 8-Bit Nerd Mode Enabled/i)).toBeInTheDocument();
    expect(screen.getByText(/RETRO NERD MODE ACTIVE/i)).toBeInTheDocument();

    // Reset via the on-screen reset button
    const resetBtn = screen.getByText(/Reset \(ESC\)/i);
    fireEvent.click(resetBtn);
    expect(document.body.classList.contains('retro-phosphor-mode')).toBe(false);
  });

  it('resets retro mode when pressing the Escape key', () => {
    render(<EasterEggManager />);

    // Enable retro mode via console helper
    act(() => {
      window.nerdverse.retroMode();
    });
    expect(document.body.classList.contains('retro-phosphor-mode')).toBe(true);

    // Press Escape
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(document.body.classList.contains('retro-phosphor-mode')).toBe(false);
  });

  it('handles nerdverse:murphy event and allows restoring normal reality', () => {
    render(<EasterEggManager />);

    act(() => {
      window.dispatchEvent(new CustomEvent('nerdverse:murphy'));
    });

    expect(document.body.classList.contains('murphy-tilted')).toBe(true);
    expect(screen.getByText(/Murphy's Law Validated/i)).toBeInTheDocument();

    const restoreBtn = screen.getByText(/Restore Normal Gravity/i);
    fireEvent.click(restoreBtn);

    expect(document.body.classList.contains('murphy-tilted')).toBe(false);
    expect(screen.getByText(/Thermodynamics Restored/i)).toBeInTheDocument();
  });

  it('handles nerdverse:schrodinger event and reveals wavefunction state', () => {
    render(<EasterEggManager />);

    act(() => {
      window.dispatchEvent(new CustomEvent('nerdverse:schrodinger'));
    });

    expect(screen.getByText(/Quantum Observation/i)).toBeInTheDocument();
    expect(screen.getByText(/Wavefunction Collapsed/i)).toBeInTheDocument();
  });

  it('handles nerdverse:singularity event and shows Carl Sagan quote toast', () => {
    render(<EasterEggManager />);

    act(() => {
      window.dispatchEvent(new CustomEvent('nerdverse:singularity'));
    });

    expect(screen.getByText(/Gravitational Singularity/i)).toBeInTheDocument();
    expect(screen.getByText(/Somewhere, something incredible is waiting to be known/i)).toBeInTheDocument();
  });

  it('handles warp speed easter egg via console and custom event', () => {
    render(<EasterEggManager />);

    act(() => {
      window.nerdverse.warpSpeed();
    });

    expect(screen.getAllByText(/WARP SPEED/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Lorentz Factor: γ = 1 \/ √\(1 - v²\/c²\) → ∞/i)).toBeInTheDocument();
    expect(screen.getByText(/Special Relativity/i)).toBeInTheDocument();
  });

  it('handles matrix constant rain easter egg', () => {
    render(<EasterEggManager />);

    act(() => {
      window.nerdverse.matrixRain();
    });

    expect(screen.getByText(/CONSTANT MATRIX RAIN ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/Universal Constant Matrix/i)).toBeInTheDocument();
  });

  it('handles black hole event horizon easter egg', () => {
    render(<EasterEggManager />);

    act(() => {
      window.nerdverse.eventHorizon();
    });

    expect(screen.getAllByText(/SCHWARZSCHILD EVENT HORIZON/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Rs = 2GM \/ c²/i)).toBeInTheDocument();
  });

  it('handles Heisenberg uncertainty jitter easter egg', () => {
    render(<EasterEggManager />);

    act(() => {
      window.nerdverse.quantumFuzz();
    });

    expect(document.body.classList.contains('heisenberg-jitter-mode')).toBe(true);
    expect(screen.getByText(/HEISENBERG UNCERTAINTY ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/Heisenberg Uncertainty Principle: Δx · Δp ≥ ħ\/2/i)).toBeInTheDocument();

    // Toggle off
    act(() => {
      window.nerdverse.quantumFuzz();
    });
    expect(document.body.classList.contains('heisenberg-jitter-mode')).toBe(false);
  });

  it('handles Hitchhiker\'s Guide Don\'t Panic easter egg', () => {
    render(<EasterEggManager />);

    act(() => {
      window.nerdverse.dontPanic();
    });

    expect(screen.getAllByText(/DON'T PANIC/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/42/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/The Hitchhiker's Guide/i)).toBeInTheDocument();
  });

  it('triggers easter eggs when secret keywords are typed', () => {
    render(<EasterEggManager />);

    // Type 'warp'
    act(() => {
      ['w', 'a', 'r', 'p'].forEach((char) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: char }));
      });
    });

    expect(screen.getAllByText(/WARP SPEED/i).length).toBeGreaterThanOrEqual(1);

    // Press Escape to reset all
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(screen.queryByText(/WARP SPEED/i)).toBeNull();
  });
});
