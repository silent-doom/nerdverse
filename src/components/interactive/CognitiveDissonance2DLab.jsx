'use client';

import React, { useState } from 'react';
import Icon from '@/components/common/Icon';
import styles from './CognitiveDissonance2DLab.module.css';

const CONDITIONS = [
  {
    id: 'bribe1',
    name: '$1 Payment Condition',
    bribe: '$1 (Minimal Reward)',
    sub: 'Told next person the task was fun for just one dollar.',
    externalJustification: 10,
    dissonanceLevel: 92,
    attitudeRating: '+7.8 (Task was enjoyable!)',
    attitudeValue: 88,
    explanation:
      'Because $1 was an insultingly tiny payment to lie, the participant had zero external excuse. To resolve the contradiction of "I am an honest person, but I lied for pennies," the subconscious brain warped its own memory: "Actually, turning those pegs was quite relaxing and fun!"',
  },
  {
    id: 'bribe20',
    name: '$20 Payment Condition',
    bribe: '$20 (Substantial Reward)',
    sub: 'Told next person the task was fun for twenty dollars ($200+ in today\'s money).',
    externalJustification: 90,
    dissonanceLevel: 15,
    attitudeRating: '-4.5 (Task was dull & boring)',
    attitudeValue: 20,
    explanation:
      'Because $20 was a huge sum (two days of manual wages in 1959), the participant had an airtight external excuse: "I only said it was fun because they paid me twenty bucks." Zero internal dissonance -> Memory was untouched: "The pegs were boring."',
  },
  {
    id: 'control0',
    name: '$0 Control Condition',
    bribe: '$0 (No Lie Asked)',
    sub: 'Performed the peg task and interviewed immediately without lying.',
    externalJustification: 0,
    dissonanceLevel: 0,
    attitudeRating: '-5.0 (Boring baseline)',
    attitudeValue: 15,
    explanation:
      'Control participants were never asked to mislead anyone. With no conflicting behavior to justify, their honest evaluation reflected reality: turning pegs for an hour is undeniably tedious.',
  },
];

export default function CognitiveDissonance2DLab() {
  const [activeConditionId, setActiveConditionId] = useState('bribe1');

  const active = CONDITIONS.find((c) => c.id === activeConditionId) || CONDITIONS[0];

  return (
    <div className={styles.labContainer} data-testid="cognitive-dissonance-2d-lab">
      {/* Top Header */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <div className={styles.titleBadge}>
            <Icon name="brain" size={13} />
            <span>Festinger & Carlsmith (1959) Experiment</span>
          </div>
          <h2 className={styles.mainTitle}>The Insufficient Justification Paradox</h2>
        </div>
      </div>

      {/* Experimental Condition Selector */}
      <div className={styles.conditionSelector}>
        {CONDITIONS.map((cond) => {
          const isSelected = cond.id === activeConditionId;
          return (
            <button
              key={cond.id}
              type="button"
              className={`${styles.conditionBtn} ${isSelected ? styles.conditionBtnActive : ''}`}
              onClick={() => setActiveConditionId(cond.id)}
            >
              <div className={styles.conditionHeader}>
                <span className={styles.conditionName}>{cond.name}</span>
                {isSelected && <Icon name="check" size={14} color="#f59e0b" />}
              </div>
              <span className={styles.conditionSub}>{cond.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Psychological Meters */}
      <div className={styles.gaugeGrid}>
        {/* Gauge 1: External Justification */}
        <div className={styles.gaugeCard}>
          <div className={styles.gaugeHeader}>
            <span>External Justification (Bribe)</span>
            <span className={styles.gaugeValue} style={{ color: active.externalJustification > 50 ? '#38bdf8' : '#94a3b8' }}>
              {active.externalJustification}%
            </span>
          </div>
          <div className={styles.gaugeTrack}>
            <div
              className={styles.gaugeFill}
              style={{
                width: `${active.externalJustification}%`,
                backgroundColor: active.externalJustification > 50 ? '#38bdf8' : '#64748b',
              }}
            />
          </div>
          <p className={styles.gaugeExplain}>
            {active.externalJustification > 50
              ? 'High financial compensation provides an airtight external alibi for lying.'
              : 'Negligible or zero external reward. No external excuse exists to explain the lie.'}
          </p>
        </div>

        {/* Gauge 2: Internal Dissonance */}
        <div className={styles.gaugeCard}>
          <div className={styles.gaugeHeader}>
            <span>Internal Cognitive Dissonance</span>
            <span className={styles.gaugeValue} style={{ color: active.dissonanceLevel > 50 ? '#ef4444' : '#22c55e' }}>
              {active.dissonanceLevel}% Conflict
            </span>
          </div>
          <div className={styles.gaugeTrack}>
            <div
              className={styles.gaugeFill}
              style={{
                width: `${active.dissonanceLevel}%`,
                backgroundColor: active.dissonanceLevel > 50 ? '#ef4444' : '#22c55e',
              }}
            />
          </div>
          <p className={styles.gaugeExplain}>
            {active.dissonanceLevel > 50
              ? 'Severe psychological distress: action contradicted self-concept without sufficient justification.'
              : 'Low or zero psychological tension. The ego requires no distortion to remain intact.'}
          </p>
        </div>

        {/* Gauge 3: Final Internal Belief / Attitude */}
        <div className={styles.gaugeCard}>
          <div className={styles.gaugeHeader}>
            <span>Belief Shift: "Was the task fun?"</span>
            <span className={styles.gaugeValue} style={{ color: active.attitudeValue > 50 ? '#f59e0b' : '#94a3b8' }}>
              {active.attitudeRating}
            </span>
          </div>
          <div className={styles.gaugeTrack}>
            <div
              className={styles.gaugeFill}
              style={{
                width: `${active.attitudeValue}%`,
                backgroundColor: active.attitudeValue > 50 ? '#f59e0b' : '#64748b',
              }}
            />
          </div>
          <p className={styles.gaugeExplain}>
            {active.attitudeValue > 50
              ? 'The brain warped its own authentic memory to convince itself the boring task was genuinely enjoyable!'
              : 'Honest evaluation retained: the participant accurately reports the boring peg-turning task as dull.'}
          </p>
        </div>
      </div>

      {/* Core Insight Callout */}
      <div className={styles.insightBox}>
        <div className={styles.insightHeader}>
          <Icon name="zap" size={15} color="#facc15" />
          <span>The Counter-Intuitive Psychological Law</span>
        </div>
        <p className={styles.insightText}>{active.explanation}</p>
      </div>
    </div>
  );
}
