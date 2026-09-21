'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/common/Icon';
import styles from './VisualizationGuideHUD.module.css';

/**
 * Standardized Visualization Guide HUD
 * Ensures consistent showcase format across all 3D and 2D concepts,
 * modeled after the Schrödinger's Cat experiment guide.
 */
export default function VisualizationGuideHUD({
  mode = '3d', // '3d' | '2d'
  title,
  steps = [],
  hotkeys = [],
  initialExpanded = true,
  extraControls = null,
}) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const defaultTitle = mode === '3d' ? '3D Experiment Guide & Controls' : '2D Interactive Guide & Logic';

  return (
    <div className={`${styles.guideWrapper} ${mode === '3d' ? styles.guide3D : styles.guide2D}`} data-testid="visualization-guide-hud">
      {/* ── Standardized Viewport Navigation Bar ── */}
      <div className={styles.navBar}>
        <div className={styles.navDesktop}>
          {mode === '3d' ? (
            <>
              <span className={styles.navIcon}>🖱️</span>
              <span><strong>Left-Click + Drag:</strong> Orbit View</span>
              <span className={styles.navSep}>•</span>
              <span className={styles.navIcon}>🔍</span>
              <span><strong>Scroll Wheel:</strong> Zoom</span>
              <span className={styles.navSep}>•</span>
              <span className={styles.navIcon}>↔️</span>
              <span><strong>Right-Click + Drag:</strong> Pan</span>
            </>
          ) : (
            <>
              <span className={styles.navIcon}>🎛️</span>
              <span><strong>Sliders & Toggles:</strong> Drag to adjust continuous mathematical inputs</span>
              <span className={styles.navSep}>•</span>
              <span className={styles.navIcon}>⚡</span>
              <span><strong>Real-Time Recalculation:</strong> Analytical metrics update live</span>
            </>
          )}
        </div>

        <div className={styles.navTouch}>
          {mode === '3d' ? (
            <span>📱 <strong>Touch:</strong> 1-Finger Drag to Rotate • Pinch to Zoom</span>
          ) : (
            <span>📱 <strong>Touch:</strong> Tap & slide controls to explore boundary conditions</span>
          )}
        </div>
      </div>

      {/* ── Collapsible Experiment Guide HUD (Schrödinger's Cat Pattern) ── */}
      <div className={styles.instructionCard}>
        <div className={styles.instructionHeader}>
          <div className={styles.instructionTitle}>
            <Icon name={mode === '3d' ? 'compass' : 'math'} size={14} />
            <span>{title || defaultTitle}</span>
          </div>

          <button
            type="button"
            className={styles.instructionToggle}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Minimize guide' : 'Expand guide'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Hide Guide' : 'Show Guide'}
          </button>
        </div>

        {isExpanded && (
          <div className={styles.instructionBody}>
            {steps.length > 0 && (
              <ul className={styles.instructionList}>
                {steps.map((item, idx) => (
                  <li key={idx} className={styles.instructionItem}>
                    <span className={styles.stepNum}>{item.step || idx + 1}.</span>
                    <div className={styles.stepContent}>
                      {item.title && <strong>{item.title}: </strong>}
                      {item.badge && <span className={styles.keyBadge}>{item.badge}</span>}
                      <span> {item.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {hotkeys.length > 0 && (
              <div className={styles.hotkeysRow}>
                <span className={styles.hotkeysLabel}>Quick Hotkeys:</span>
                <div className={styles.hotkeysList}>
                  {hotkeys.map((h, i) => (
                    <span key={i} className={styles.hotkeyTag}>
                      <kbd className={styles.kbd}>{h.key}</kbd>
                      <span className={styles.hotkeyAction}>{h.action}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {extraControls && <div className={styles.extraControls}>{extraControls}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

VisualizationGuideHUD.propTypes = {
  mode: PropTypes.oneOf(['3d', '2d']),
  title: PropTypes.string,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      step: PropTypes.number,
      title: PropTypes.string,
      badge: PropTypes.string,
      text: PropTypes.string.isRequired,
    })
  ),
  hotkeys: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      action: PropTypes.string.isRequired,
    })
  ),
  initialExpanded: PropTypes.bool,
  extraControls: PropTypes.node,
};
