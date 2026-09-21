'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './EasterEggManager.module.css';
import Icon from '@/components/common/Icon';

const KONAMI_SEQUENCE = [
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

const FLOATING_ITEMS = [
  { id: 1, symbol: '👾', left: '6%', delay: '0s', duration: '11s', size: '28px' },
  { id: 2, symbol: '42', left: '14%', delay: '2s', duration: '14s', size: '24px' },
  { id: 3, symbol: '★', left: '22%', delay: '1s', duration: '10s', size: '20px' },
  { id: 4, symbol: 'π', left: '30%', delay: '3.5s', duration: '13s', size: '26px' },
  { id: 5, symbol: '∞', left: '38%', delay: '0.5s', duration: '12s', size: '26px' },
  { id: 6, symbol: '🛸', left: '46%', delay: '2.5s', duration: '15s', size: '28px' },
  { id: 7, symbol: '💾', left: '54%', delay: '1.2s', duration: '11s', size: '22px' },
  { id: 8, symbol: '🐱', left: '62%', delay: '4s', duration: '13s', size: '26px' },
  { id: 9, symbol: '⚡', left: '70%', delay: '2s', duration: '10s', size: '22px' },
  { id: 10, symbol: '♥', left: '78%', delay: '0.8s', duration: '14s', size: '22px' },
  { id: 11, symbol: '42', left: '86%', delay: '3s', duration: '12s', size: '26px' },
  { id: 12, symbol: '👾', left: '94%', delay: '1.8s', duration: '13s', size: '24px' },
  { id: 13, symbol: 'ħ', left: '18%', delay: '5.5s', duration: '14s', size: '22px' },
  { id: 14, symbol: 'c', left: '50%', delay: '6s', duration: '12s', size: '22px' },
  { id: 15, symbol: '🍞', left: '82%', delay: '5s', duration: '15s', size: '24px' },
];

const MATRIX_SYMBOLS = [
  'π', 'e', 'ħ', 'c', 'G', 'φ', '∞', '∇', '∫', '∂', '∑', 'λ', 'μ', 'σ', 'Δ', 'ψ', 'α', 'β', 'γ', 'Ω', '42', '0', '1',
];

export default function EasterEggManager() {
  const [toast, setToast] = useState(null);
  const [isRetroActive, setIsRetroActive] = useState(false);
  const [isMurphyActive, setIsMurphyActive] = useState(false);
  const [isQuantumActive, setIsQuantumActive] = useState(false);
  const [quantumState, setQuantumState] = useState(null);

  // New Scientific Easter Eggs State
  const [isWarpActive, setIsWarpActive] = useState(false);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [isBlackHoleActive, setIsBlackHoleActive] = useState(false);
  const [isHeisenbergActive, setIsHeisenbergActive] = useState(false);
  const [isDontPanicActive, setIsDontPanicActive] = useState(false);

  const konamiIndexRef = useRef(0);
  const keyBufferRef = useRef('');
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((badge, title, desc, icon = '🏆') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ badge, title, desc, icon });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 6500);
  }, []);

  const closeToast = useCallback(() => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(null);
  }, []);

  // Master Reset for all Easter Eggs (triggered by ESC or resetAll)
  const resetAllEffects = useCallback(() => {
    setIsRetroActive(false);
    document.body.classList.remove('retro-phosphor-mode');
    setIsMurphyActive(false);
    document.body.classList.remove('murphy-tilted');
    document.body.classList.remove('quantum-flipped');
    document.body.classList.remove('heisenberg-jitter-mode');
    setIsQuantumActive(false);
    setIsWarpActive(false);
    setIsMatrixActive(false);
    setIsBlackHoleActive(false);
    setIsHeisenbergActive(false);
    setIsDontPanicActive(false);
    setToast(null);
  }, []);

  // Reset Retro Mode
  const resetRetroMode = useCallback(() => {
    setIsRetroActive(false);
    document.body.classList.remove('retro-phosphor-mode');
    showToast(
      'Retro Mode Disabled',
      'Normal Reality Restored',
      'Zero-gravity particles dissipated. Standard continuum normalized.',
      '🌟'
    );
  }, [showToast]);

  // Murphy's Law
  const triggerMurphyLaw = useCallback(() => {
    setIsMurphyActive(true);
    document.body.classList.add('murphy-tilted');
  }, []);

  const restoreMurphyLaw = useCallback(() => {
    setIsMurphyActive(false);
    document.body.classList.remove('murphy-tilted');
    showToast(
      'Thermodynamics Restored',
      'Order Re-established',
      'Local entropy temporarily stabilized. Handle cosmic buttons with care.',
      '🛡️'
    );
  }, [showToast]);

  // Schrödinger's Cat
  const collapseSchrodinger = useCallback(() => {
    const isAlive = Math.random() > 0.5;
    const outcome = isAlive
      ? {
          icon: '🐱',
          title: 'Wavefunction Collapsed: Cat is ALIVE!',
          desc: 'Coherence broken by conscious observation. State: |ψ⟩ = 1.00 |Purring Alive⟩. Quality of life: Optimal.',
        }
      : {
          icon: '👻',
          title: 'Wavefunction Collapsed: Quantum Ghost State!',
          desc: 'The radioactive atom decayed during observation. State: |ψ⟩ = 1.00 |Quantum Ghost⟩.',
        };

    setQuantumState(outcome);
    setIsQuantumActive(true);
    setTimeout(() => {
      setIsQuantumActive(false);
    }, 5500);
  }, []);

  // Singularity Warp
  const triggerSingularity = useCallback(() => {
    showToast(
      'Gravitational Singularity',
      'Event Horizon Reached!',
      '"Somewhere, something incredible is waiting to be known." — Carl Sagan',
      '🌌'
    );
  }, [showToast]);

  // 1. Warp Speed Easter Egg (c = 299,792,458 m/s)
  const triggerWarpSpeed = useCallback(() => {
    setIsWarpActive(true);
    showToast(
      'Special Relativity',
      'Warp Factor: Speed of Light c Achieved!',
      'Lorentz factor γ → ∞. Time dilation maximized. Space contracted to zero thickness along trajectory.',
      '⚡'
    );
    setTimeout(() => {
      setIsWarpActive(false);
    }, 6000);
  }, [showToast]);

  // 2. Matrix Rain of Fundamental Constants
  const triggerMatrixRain = useCallback(() => {
    setIsMatrixActive((prev) => {
      const next = !prev;
      if (next) {
        showToast(
          'Universal Constant Matrix',
          'Mathematical Cascade Unleashed',
          'Cascading fundamental invariants: π, e, ħ, c, G, and the fine structure constant α.',
          '🧮'
        );
      }
      return next;
    });
  }, [showToast]);

  // 3. Black Hole Event Horizon
  const triggerBlackHole = useCallback(() => {
    setIsBlackHoleActive(true);
    showToast(
      'General Relativity',
      'Schwarzschild Event Horizon Active',
      'Escape velocity equals c. Inward light cones tilt irrevocably toward central gravitational singularity.',
      '🕳️'
    );
    setTimeout(() => {
      setIsBlackHoleActive(false);
    }, 7000);
  }, [showToast]);

  // 4. Heisenberg Quantum Uncertainty Jitter
  const triggerHeisenberg = useCallback(() => {
    setIsHeisenbergActive((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add('heisenberg-jitter-mode');
        showToast(
          'Copenhagen Interpretation',
          'Heisenberg Uncertainty Principle: Δx · Δp ≥ ħ/2',
          'Position and momentum cannot both be precisely determined. Text wavefunction actively decohering.',
          '🔬'
        );
      } else {
        document.body.classList.remove('heisenberg-jitter-mode');
      }
      return next;
    });
  }, [showToast]);

  // 5. Don't Panic (Hitchhiker's Guide 42)
  const triggerDontPanic = useCallback(() => {
    setIsDontPanicActive(true);
    showToast(
      'The Hitchhiker\'s Guide',
      '42 — DON\'T PANIC!',
      '"A towel is about the most massively useful thing an interstellar hitchhiker can have." — Douglas Adams',
      '🚀'
    );
    setTimeout(() => {
      setIsDontPanicActive(false);
    }, 6500);
  }, [showToast]);

  // Initialize Console Banner & Global nerdverse Commands
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Stylish ASCII banner in DevTools console
    console.log(
      `%c
   _   _               _ _     __             
  | \\ | | ___ _ __  __| | |   / /__ _ __  ___ 
  |  \\| |/ _ \\ '__|/ _\` | |  / / _ \\ '__|/ __|
  | |\\  |  __/ |  | (_| |_| / /  __/ |   \\__ \\
  |_| \\_|\\___|_|   \\__,_(_)/_/ \\___|_|   |___/
  
  Curious developer detected! Welcome to the NerdVerse Easter Egg Engine.
  Try executing these scientific simulation triggers in your console:
  • nerdverse.warpSpeed()          - Accelerate to speed of light c (relativistic time dilation)
  • nerdverse.matrixRain()         - Rains cascading physical & mathematical constants (π, e, ħ, c, G)
  • nerdverse.eventHorizon()       - Swirling Schwarzschild black hole & gravitational lensing
  • nerdverse.quantumFuzz()        - Heisenberg uncertainty jitter (Δx · Δp ≥ ħ/2)
  • nerdverse.dontPanic()          - Summon the Hitchhiker's Guide golden HUD (42)
  • nerdverse.retroMode()          - Toggles 8-bit retro phosphor green zero-gravity matrix
  • nerdverse.quantumFlip()        - Inverts spacetime chromatic frequencies
  • nerdverse.butterToast()        - Validates Murphy's Law kinetics
  • nerdverse.collapseCat()        - Collapses Schrödinger's cat wavefunction
  • nerdverse.meaningOfLife()      - Consults Deep Thought for the Ultimate Question
  • nerdverse.resetAll()           - Restores normal reality immediately
      `,
      'color: #10B981; font-weight: bold; font-family: monospace; font-size: 11px; line-height: 1.2;'
    );

    window.nerdverse = {
      warpSpeed: () => {
        triggerWarpSpeed();
        return '⚡ Accelerating to c = 299,792,458 m/s.';
      },
      matrixRain: () => {
        triggerMatrixRain();
        return '🧮 Matrix cascade toggled.';
      },
      eventHorizon: () => {
        triggerBlackHole();
        return '🕳️ Schwarzschild radius calculated: Rs = 2GM/c².';
      },
      quantumFuzz: () => {
        triggerHeisenberg();
        return '🔬 Heisenberg uncertainty jitter toggled.';
      },
      dontPanic: () => {
        triggerDontPanic();
        return '🚀 DON\'T PANIC! Always know where your towel is.';
      },
      retroMode: () => {
        setIsRetroActive((prev) => {
          const next = !prev;
          if (next) {
            document.body.classList.add('retro-phosphor-mode');
          } else {
            document.body.classList.remove('retro-phosphor-mode');
          }
          return next;
        });
        return '👾 Retro mode toggled.';
      },
      quantumFlip: () => {
        document.body.classList.toggle('quantum-flipped');
        const active = document.body.classList.contains('quantum-flipped');
        console.log(active ? '🌌 Spacetime inverted into Quantum Matrix!' : '🌟 Spacetime normalized.');
        return active ? 'Inverted' : 'Normalized';
      },
      butterToast: () => {
        window.dispatchEvent(new CustomEvent('nerdverse:murphy'));
        return '🍞 Toast dispatched. Check your screen.';
      },
      meaningOfLife: () => {
        return '42. "Don\'t Panic, and always carry a towel." — The Hitchhiker\'s Guide to the Galaxy';
      },
      collapseCat: () => {
        window.dispatchEvent(new CustomEvent('nerdverse:schrodinger'));
        return '📦 Box opened. Wavefunction collapsed.';
      },
      singularity: () => {
        window.dispatchEvent(new CustomEvent('nerdverse:singularity'));
        return '🌌 Singularity initialized.';
      },
      resetAll: () => {
        resetAllEffects();
        return '🌟 Reality normalized. All easter eggs reset.';
      },
    };

    // Custom Event Listeners
    const onMurphy = () => triggerMurphyLaw();
    const onSchrodinger = () => collapseSchrodinger();
    const onSingularity = () => triggerSingularity();
    const onWarp = () => triggerWarpSpeed();
    const onMatrix = () => triggerMatrixRain();
    const onBlackHole = () => triggerBlackHole();
    const onHeisenberg = () => triggerHeisenberg();
    const onDontPanic = () => triggerDontPanic();

    window.addEventListener('nerdverse:murphy', onMurphy);
    window.addEventListener('nerdverse:schrodinger', onSchrodinger);
    window.addEventListener('nerdverse:singularity', onSingularity);
    window.addEventListener('nerdverse:warp', onWarp);
    window.addEventListener('nerdverse:matrix', onMatrix);
    window.addEventListener('nerdverse:blackhole', onBlackHole);
    window.addEventListener('nerdverse:heisenberg', onHeisenberg);
    window.addEventListener('nerdverse:dontpanic', onDontPanic);

    // Keystroke Buffer & Konami Code Listener
    const onKeyDown = (e) => {
      // Escape resets all effects instantly
      if (e.key === 'Escape') {
        resetAllEffects();
        return;
      }

      // Append to rolling key buffer (case-insensitive, max 25 chars)
      if (e.key && e.key.length === 1) {
        keyBufferRef.current = (keyBufferRef.current + e.key.toLowerCase()).slice(-25);
        const buf = keyBufferRef.current;

        if (buf.endsWith('warp') || buf.endsWith('lightspeed')) {
          triggerWarpSpeed();
          keyBufferRef.current = '';
        } else if (buf.endsWith('matrix') || buf.endsWith('rain') || buf.endsWith('314159')) {
          triggerMatrixRain();
          keyBufferRef.current = '';
        } else if (buf.endsWith('blackhole') || buf.endsWith('hawking')) {
          triggerBlackHole();
          keyBufferRef.current = '';
        } else if (buf.endsWith('heisenberg') || buf.endsWith('uncertainty')) {
          triggerHeisenberg();
          keyBufferRef.current = '';
        } else if (buf.endsWith('dontpanic') || buf.endsWith('towel') || buf.endsWith('42')) {
          triggerDontPanic();
          keyBufferRef.current = '';
        }
      }

      // Konami sequence tracker
      const targetKey = KONAMI_SEQUENCE[konamiIndexRef.current];
      if (e.key.toLowerCase() === targetKey.toLowerCase()) {
        konamiIndexRef.current++;
        if (konamiIndexRef.current === KONAMI_SEQUENCE.length) {
          konamiIndexRef.current = 0;
          setIsRetroActive((prev) => {
            const next = !prev;
            if (next) {
              document.body.classList.add('retro-phosphor-mode');
              showToast(
                'Secret Cheat Code',
                'Retro 8-Bit Nerd Mode Enabled!',
                'Zero-gravity particles unleashed! Press ESC or click the top banner to reset.',
                '👾'
              );
            } else {
              document.body.classList.remove('retro-phosphor-mode');
              showToast('Normal Reality', 'Retro Mode Disabled', 'Standard physics restored.', '🌟');
            }
            return next;
          });
        }
      } else {
        konamiIndexRef.current = 0;
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('nerdverse:murphy', onMurphy);
      window.removeEventListener('nerdverse:schrodinger', onSchrodinger);
      window.removeEventListener('nerdverse:singularity', onSingularity);
      window.removeEventListener('nerdverse:warp', onWarp);
      window.removeEventListener('nerdverse:matrix', onMatrix);
      window.removeEventListener('nerdverse:blackhole', onBlackHole);
      window.removeEventListener('nerdverse:heisenberg', onHeisenberg);
      window.removeEventListener('nerdverse:dontpanic', onDontPanic);
      delete window.nerdverse;
    };
  }, [
    triggerMurphyLaw,
    collapseSchrodinger,
    triggerSingularity,
    triggerWarpSpeed,
    triggerMatrixRain,
    triggerBlackHole,
    triggerHeisenberg,
    triggerDontPanic,
    showToast,
    resetAllEffects,
  ]);

  const hasAnyActiveEffect =
    isRetroActive || isWarpActive || isMatrixActive || isBlackHoleActive || isHeisenbergActive || isDontPanicActive;

  return (
    <>
      {/* ── Active HUD Top Bar (allows ESC reset on any effect) ── */}
      {hasAnyActiveEffect && (
        <div className={styles.retroActiveHud}>
          <span className={styles.retroHudBadge}>
            <span>⚡</span>
            <span>
              {isRetroActive
                ? 'RETRO NERD MODE ACTIVE'
                : isWarpActive
                ? 'WARP SPEED: c = 299,792,458 m/s'
                : isMatrixActive
                ? 'CONSTANT MATRIX RAIN ACTIVE'
                : isBlackHoleActive
                ? 'SCHWARZSCHILD EVENT HORIZON'
                : isHeisenbergActive
                ? 'HEISENBERG UNCERTAINTY ACTIVE'
                : 'DON\'T PANIC (42)'}
            </span>
          </span>
          <button
            type="button"
            className={styles.retroResetBtn}
            onClick={resetAllEffects}
            title="Disable active effects (or press ESC)"
          >
            Reset (ESC)
          </button>
        </div>
      )}

      {/* ── 1. Warp Speed Relativistic Streaks ── */}
      {isWarpActive && (
        <div className={styles.warpOverlay} aria-hidden="true">
          <div className={styles.warpStarfield} />
          <div className={styles.warpCenterBadge}>
            <div className={styles.warpTitle}>c = 299,792,458 m/s</div>
            <div className={styles.warpSub}>Lorentz Factor: γ = 1 / √(1 - v²/c²) → ∞</div>
          </div>
        </div>
      )}

      {/* ── 2. Matrix Rain of Fundamental Constants ── */}
      {isMatrixActive && (
        <div className={styles.matrixRainOverlay} aria-hidden="true">
          {Array.from({ length: 18 }).map((_, col) => (
            <div
              key={col}
              className={styles.matrixColumn}
              style={{
                left: `${(col / 18) * 100 + 1}%`,
                animationDelay: `${(col * 0.35) % 3}s`,
                animationDuration: `${3.5 + ((col * 0.4) % 2.5)}s`,
              }}
            >
              {Array.from({ length: 14 }).map((__, row) => (
                <span key={row} className={styles.matrixChar}>
                  {MATRIX_SYMBOLS[(col * 7 + row * 3) % MATRIX_SYMBOLS.length]}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── 3. Gravitational Event Horizon Lensing ── */}
      {isBlackHoleActive && (
        <div className={styles.blackHoleOverlay} aria-hidden="true">
          <div className={styles.blackHoleRing} />
          <div className={styles.blackHoleCenter}>
            <div className={styles.blackHoleHudText}>
              <span>Schwarzschild Radius:</span>
              <strong>Rs = 2GM / c²</strong>
              <small>Photons Orbit at r = 1.5 Rs • Escape Velocity = c</small>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Hitchhiker's Guide Don't Panic Banner ── */}
      {isDontPanicActive && (
        <div className={styles.dontPanicOverlay}>
          <div className={styles.dontPanicCard}>
            <span className={styles.dontPanicNumber}>42</span>
            <h2 className={styles.dontPanicHeading}>DON&apos;T PANIC</h2>
            <p className={styles.dontPanicQuote}>
              &quot;Space is big. You just won&apos;t believe how vastly, hugely, mind-bogglingly big it is.&quot;
            </p>
            <div className={styles.towelHint}>Always know where your towel is.</div>
          </div>
        </div>
      )}

      {/* ── Floating Zero-Gravity Retro Particles (Konami Mode) ── */}
      {isRetroActive && (
        <div className={styles.floatingZeroGravityLayer} aria-hidden="true">
          {FLOATING_ITEMS.map((item) => (
            <span
              key={item.id}
              className={styles.floatingItem}
              style={{
                left: item.left,
                fontSize: item.size,
                animationDelay: item.delay,
                animationDuration: item.duration,
              }}
            >
              {item.symbol}
            </span>
          ))}
        </div>
      )}

      {/* ── Achievement Toast ── */}
      {toast && (
        <div className={styles.achievementToast} role="alert">
          <div className={styles.toastIconWrap}>{toast.icon}</div>
          <div className={styles.toastContent}>
            <span className={styles.toastTitle}>{toast.badge}</span>
            <span className={styles.toastHeading}>{toast.title}</span>
            <span className={styles.toastDesc}>{toast.desc}</span>
          </div>
          <button
            type="button"
            className={styles.toastCloseBtn}
            onClick={closeToast}
            aria-label="Close notification"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      {/* ── Murphy's Law Buttered Toast Drop Animation ── */}
      {isMurphyActive && (
        <>
          <div className={styles.toastOverlay}>
            <div className={styles.butteredToastDrop}>🍞</div>
          </div>
          <div className={styles.murphyModal}>
            <div style={{ fontSize: '2rem' }}>⚠️</div>
            <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#EF4444' }}>
              Murphy&apos;s Law Validated!
            </div>
            <p style={{ fontSize: '0.875rem', color: '#D1D5DB', margin: 0 }}>
              You were explicitly warned! Anything that can go wrong, will go wrong.
              Notice that the falling toast landed <strong>butter-side down</strong> with mathematical certainty.
            </p>
            <button type="button" className={styles.restoreBtn} onClick={restoreMurphyLaw}>
              Restore Normal Gravity
            </button>
          </div>
        </>
      )}

      {/* ── Quantum Superposition Collapse Banner ── */}
      {isQuantumActive && quantumState && (
        <div className={styles.quantumBanner} role="status">
          <div className={styles.quantumIcon}>{quantumState.icon}</div>
          <div className={styles.toastContent}>
            <span className={styles.toastTitle} style={{ color: '#A78BFA' }}>
              Quantum Observation
            </span>
            <span className={styles.toastHeading}>{quantumState.title}</span>
            <span className={styles.toastDesc}>{quantumState.desc}</span>
          </div>
        </div>
      )}
    </>
  );
}
