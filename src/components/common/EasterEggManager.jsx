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

export default function EasterEggManager() {
  const [toast, setToast] = useState(null);
  const [isRetroActive, setIsRetroActive] = useState(false);
  const [isMurphyActive, setIsMurphyActive] = useState(false);
  const [isQuantumActive, setIsQuantumActive] = useState(false);
  const [quantumState, setQuantumState] = useState(null);
  const konamiIndexRef = useRef(0);
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

  // Master Reset for all Easter Eggs (triggered by ESC or resetAll)
  const resetAllEffects = useCallback(() => {
    setIsRetroActive(false);
    document.body.classList.remove('retro-phosphor-mode');
    setIsMurphyActive(false);
    document.body.classList.remove('murphy-tilted');
    document.body.classList.remove('quantum-flipped');
    setToast(null);
    setIsQuantumActive(false);
  }, []);

  // Trigger Murphy's Law Reality Tilt & Buttered Toast Drop
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

  // Collapse Schrödinger's Cat Wavefunction
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

  // Trigger Logo Singularity Warp
  const triggerSingularity = useCallback(() => {
    showToast(
      'Gravitational Singularity',
      'Event Horizon Reached!',
      '"Somewhere, something incredible is waiting to be known." — Carl Sagan',
      '🌌'
    );
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
  Try executing these in your console:
  • nerdverse.retroMode()          - Toggles 8-bit retro matrix & zero-gravity floating effects
  • nerdverse.quantumFlip()        - Inverts spacetime color frequencies
  • nerdverse.butterToast()        - Tests Murphy's Law kinetics
  • nerdverse.meaningOfLife()      - Consults Deep Thought
  • nerdverse.collapseCat()        - Collapses Schrödinger's superposition
  • nerdverse.resetAll()           - Restores normal reality immediately
      `,
      'color: #10B981; font-weight: bold; font-family: monospace; font-size: 11px; line-height: 1.2;'
    );

    window.nerdverse = {
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

    window.addEventListener('nerdverse:murphy', onMurphy);
    window.addEventListener('nerdverse:schrodinger', onSchrodinger);
    window.addEventListener('nerdverse:singularity', onSingularity);

    // Konami Key & ESC Listener
    const onKeyDown = (e) => {
      // Escape resets all effects instantly
      if (e.key === 'Escape') {
        resetAllEffects();
        return;
      }

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
      delete window.nerdverse;
    };
  }, [triggerMurphyLaw, collapseSchrodinger, triggerSingularity, showToast, resetAllEffects]);

  return (
    <>
      {/* Floating Zero-Gravity Retro Particles when Konami / Retro Mode is Active */}
      {isRetroActive && (
        <>
          {/* Top Reset Banner */}
          <div className={styles.retroActiveHud}>
            <span className={styles.retroHudBadge}>
              <span>👾</span>
              <span>RETRO NERD MODE ACTIVE</span>
            </span>
            <button
              type="button"
              className={styles.retroResetBtn}
              onClick={resetRetroMode}
              title="Disable retro mode (or press ESC)"
            >
              Reset (ESC)
            </button>
          </div>

          {/* Floating Zero-Gravity Glyph Particles */}
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
        </>
      )}

      {/* Achievement Toast */}
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

      {/* Murphy's Law Buttered Toast Drop Animation & Modal */}
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

      {/* Quantum Superposition Collapse Banner */}
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
