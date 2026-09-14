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
});
