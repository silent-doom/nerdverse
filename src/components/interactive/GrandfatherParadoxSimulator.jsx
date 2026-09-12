'use client';

import { useState } from 'react';
import styles from './InteractiveSimulation.module.css';
import Icon from '@/components/common/Icon';

const THEORIES = [
  {
    id: 'novikov',
    title: '1. Novikov Self-Consistency',
    principle: 'Causal Closed Loops',
    description: 'The universe is deterministic and self-consistent. Any action you take in the past was ALREADY part of history.',
    outcome: 'You try to stop your grandfather, but your intervention causes the exact sequence of events leading to his meeting with your grandmother. Causality remains unviolated (0 paradox probability).',
    color: '#10b981',
    icon: 'check',
    paradoxRisk: '0% (Self-consistent loop)',
  },
  {
    id: 'many-worlds',
    title: '2. Many-Worlds (Everett Branching)',
    principle: 'Quantum Multiverse Divergence',
    description: 'Arriving in the past bifurcates spacetime into an alternate quantum branch (Timeline B).',
    outcome: 'You prevent your grandfather from meeting your grandmother in Timeline B. You exist because you originated from Timeline A. Two distinct parallel universes now coexist.',
    color: '#6366f1',
    icon: 'network',
    paradoxRisk: '0% (Resolved via parallel branch)',
  },
  {
    id: 'hawking',
    title: '3. Hawking Chronology Protection',
    principle: 'Vacuum Energy Divergence',
    description: 'The laws of quantum gravity actively prohibit closed timelike curves (CTCs).',
    outcome: 'As your time machine attempts to form a wormhole to before your birth, quantum vacuum fluctuations grow exponentially, destroying the wormhole before causality can be breached.',
    color: '#e11d48',
    icon: 'alert',
    paradoxRisk: 'Prevented by physical laws',
  },
];

export default function GrandfatherParadoxSimulator() {
  const [selectedTheory, setSelectedTheory] = useState('novikov');
  const [targetYear, setTargetYear] = useState(1952);

  const activeTheory = THEORIES.find((t) => t.id === selectedTheory);

  return (
    <div className={styles.container}>
      <div className={styles.simHeader}>
        <div className={styles.simBadge}>
          <Icon name="atom" size={13} color="var(--color-category-physics)" />
          <span>Spacetime Causality Lab</span>
        </div>
        <h3 className={styles.simTitle}>Grandfather Paradox: Spacetime Resolution Engine</h3>
        <p className={styles.simSubtitle}>
          Select a theoretical physics framework to test how general relativity and quantum mechanics resolve the retrocausal paradox.
        </p>
      </div>

      <div className={styles.modelTabs}>
        {THEORIES.map((theory) => (
          <button
            key={theory.id}
            onClick={() => setSelectedTheory(theory.id)}
            className={`${styles.modelTab} ${selectedTheory === theory.id ? styles.modelTabActive : ''}`}
          >
            <Icon name={theory.icon} size={14} color={selectedTheory === theory.id ? '#ffffff' : theory.color} />
            <span>{theory.title}</span>
          </button>
        ))}
      </div>

      <div className={styles.timelineContainer}>
        <div className={styles.controlsGrid}>
          <div className={styles.controlGroup}>
            <div className={styles.labelRow}>
              <label>Time Machine Jump Target</label>
              <span className={styles.valueBadge}>Year {targetYear}</span>
            </div>
            <input
              type="range"
              min="1920"
              max="2000"
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              className={styles.rangeInput}
            />
            <span className={styles.hint}>Target coordinates before parental conception</span>
          </div>

          <div className={styles.controlGroup}>
            <div className={styles.labelRow}>
              <label>Causal Resolution Model</label>
              <span className={styles.valueBadge} style={{ color: activeTheory.color }}>
                {activeTheory.principle}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {activeTheory.description}
            </p>
          </div>
        </div>

        <div className={styles.paradoxVisual}>
          <div className={styles.timelineNode}>
            <div className={styles.nodeIcon}>
              <Icon name="clock" size={16} />
            </div>
            <div className={styles.nodeContent}>
              <div className={styles.nodeTitle}>Departure: Year 2026</div>
              <div className={styles.nodeDesc}>You construct a closed timelike curve (CTC) and travel back in time.</div>
            </div>
          </div>

          <div className={styles.timelineNode}>
            <div className={styles.nodeIcon}>
              <Icon name="zap" size={16} color="var(--color-category-philosophy)" />
            </div>
            <div className={styles.nodeContent}>
              <div className={styles.nodeTitle}>Arrival: Year {targetYear}</div>
              <div className={styles.nodeDesc}>Attempted intervention to prevent grandfather meeting grandmother.</div>
            </div>
          </div>

          <div className={styles.timelineNode}>
            <div className={styles.nodeIcon} style={{ backgroundColor: `${activeTheory.color}20`, borderColor: activeTheory.color }}>
              <Icon name={activeTheory.icon} size={16} color={activeTheory.color} />
            </div>
            <div className={styles.nodeContent}>
              <div className={styles.nodeTitle} style={{ color: activeTheory.color }}>
                Spacetime Resolution
              </div>
              <div className={styles.nodeDesc} style={{ color: '#ffffff' }}>
                {activeTheory.outcome}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statsCards}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Paradox Logical Status</div>
            <div className={styles.statValue} style={{ color: activeTheory.color, fontSize: '18px' }}>
              Resolved
            </div>
            <div className={styles.statFormula}>{activeTheory.principle}</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Causal Paradox Risk</div>
            <div className={styles.statValue} style={{ fontSize: '16px', color: 'var(--color-text-primary)' }}>
              {activeTheory.paradoxRisk}
            </div>
            <div className={styles.statFormula}>Theoretical consensus</div>
          </div>
        </div>
      </div>
    </div>
  );
}
