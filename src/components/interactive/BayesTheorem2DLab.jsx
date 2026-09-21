'use client';

import React, { useState, useMemo } from 'react';
import Icon from '@/components/common/Icon';
import styles from './BayesTheorem2DLab.module.css';

const PRESETS = [
  {
    id: 'rareDisease',
    name: 'Rare Medical Screening',
    prevalence: 0.1, // 1 in 1000
    sensitivity: 99.0, // 99% accuracy if sick
    falsePositiveRate: 1.0, // 1% false alarm
  },
  {
    id: 'aiMalware',
    name: 'AI Cybersecurity Alert',
    prevalence: 1.0, // 1% of files malicious
    sensitivity: 98.0, // 98% detection
    falsePositiveRate: 2.0, // 2% false flag
  },
  {
    id: 'commonFlu',
    name: 'Seasonal Winter Flu',
    prevalence: 15.0, // 15% population infected
    sensitivity: 92.0,
    falsePositiveRate: 5.0,
  },
];

export default function BayesTheorem2DLab() {
  const [prevalence, setPrevalence] = useState(0.1); // % (0.01% - 20%)
  const [sensitivity, setSensitivity] = useState(99.0); // % (80% - 99.9%)
  const [falsePositiveRate, setFalsePositiveRate] = useState(1.0); // % (0.1% - 10%)
  const [activePreset, setActivePreset] = useState('rareDisease');

  const population = 100000;

  const calculations = useMemo(() => {
    const sickCount = Math.round(population * (prevalence / 100));
    const healthyCount = population - sickCount;

    const truePositives = Math.round(sickCount * (sensitivity / 100));
    const falseNegatives = sickCount - truePositives;

    const falsePositives = Math.round(healthyCount * (falsePositiveRate / 100));
    const trueNegatives = healthyCount - falsePositives;

    const totalPositives = truePositives + falsePositives;
    const posterior = totalPositives > 0 ? ((truePositives / totalPositives) * 100).toFixed(1) : '0.0';

    return {
      sickCount,
      healthyCount,
      truePositives,
      falseNegatives,
      falsePositives,
      trueNegatives,
      totalPositives,
      posterior,
    };
  }, [prevalence, sensitivity, falsePositiveRate]);

  const handleApplyPreset = (p) => {
    setActivePreset(p.id);
    setPrevalence(p.prevalence);
    setSensitivity(p.sensitivity);
    setFalsePositiveRate(p.falsePositiveRate);
  };

  return (
    <div className={styles.labContainer} data-testid="bayes-theorem-2d-lab">
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <div className={styles.titleBadge}>
            <Icon name="math" size={13} />
            <span>Bayesian Updating & The Base Rate Fallacy</span>
          </div>
          <h2 className={styles.mainTitle}>Why a 99% Accurate Test Might Only Mean a 9% Chance</h2>
        </div>

        <div className={styles.presetGroup}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.presetBtn} ${activePreset === p.id ? styles.presetBtnActive : ''}`}
              onClick={() => handleApplyPreset(p)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Control Sliders Deck */}
      <div className={styles.controlGrid}>
        {/* Slider 1: Base Rate (Prevalence) */}
        <div className={styles.sliderCard}>
          <div className={styles.sliderHeader}>
            <span>1. Prior Prevalence (Base Rate)</span>
            <span className={styles.sliderValue}>{prevalence}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="15"
            step="0.05"
            value={prevalence}
            onChange={(e) => {
              setPrevalence(parseFloat(e.target.value));
              setActivePreset('');
            }}
            className={styles.rangeInput}
          />
          <p className={styles.sliderSub}>
            Out of 100,000 people, only <strong>{calculations.sickCount}</strong> actually have the condition.
          </p>
        </div>

        {/* Slider 2: Test Sensitivity (True Positive Rate) */}
        <div className={styles.sliderCard}>
          <div className={styles.sliderHeader}>
            <span>2. Test Sensitivity (True Positive)</span>
            <span className={styles.sliderValue}>{sensitivity}%</span>
          </div>
          <input
            type="range"
            min="80"
            max="99.9"
            step="0.1"
            value={sensitivity}
            onChange={(e) => {
              setSensitivity(parseFloat(e.target.value));
              setActivePreset('');
            }}
            className={styles.rangeInput}
          />
          <p className={styles.sliderSub}>
            If someone is sick, the test catches them <strong>{sensitivity}%</strong> of the time.
          </p>
        </div>

        {/* Slider 3: False Positive Rate */}
        <div className={styles.sliderCard}>
          <div className={styles.sliderHeader}>
            <span>3. False Positive Rate (False Alarm)</span>
            <span className={styles.sliderValue}>{falsePositiveRate}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={falsePositiveRate}
            onChange={(e) => {
              setFalsePositiveRate(parseFloat(e.target.value));
              setActivePreset('');
            }}
            className={styles.rangeInput}
          />
          <p className={styles.sliderSub}>
            Among healthy people, <strong>{falsePositiveRate}%</strong> receive a terrifying false alarm.
          </p>
        </div>
      </div>

      {/* Population & Probability Breakdown */}
      <div className={styles.resultsGrid}>
        {/* The Final Posterior Probability */}
        <div className={`${styles.resultCard} ${styles.resultCardHighlight}`}>
          <div className={styles.resultHeader}>
            <span>P(Condition | Positive Test)</span>
            <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 700 }}>THE POSTERIOR</span>
          </div>
          <div className={`${styles.bigPercent} ${styles.bigPercentCyan}`}>{calculations.posterior}%</div>
          <span className={styles.countSub}>
            Only <strong>{calculations.truePositives}</strong> true positives among <strong>{calculations.totalPositives}</strong> total positive tests!
          </span>
        </div>

        {/* True Positives vs False Alarms */}
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <span>Positive Test Breakdown (100k Population)</span>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>SAMPLE</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#34d399' }}>True Positives (Sick & Tested +):</span>
              <strong>{calculations.truePositives}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#f87171' }}>False Positives (Healthy & Tested +):</span>
              <strong>{calculations.falsePositives}</strong>
            </div>
            <div style={{ borderTop: '1px solid #23283c', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>Total Positive Flags:</span>
              <strong>{calculations.totalPositives}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Core Insight Callout */}
      <div className={styles.insightBox}>
        <div className={styles.insightHeader}>
          <Icon name="zap" size={15} color="#7dd3fc" />
          <span>The Core Takeaway: Never Evaluate Evidence in a Vacuum</span>
        </div>
        <p className={styles.insightText}>
          Even though the test is {sensitivity}% accurate, the healthy population ({calculations.healthyCount.toLocaleString()}) vastly outnumbers the sick population ({calculations.sickCount.toLocaleString()}). A tiny {falsePositiveRate}% false-positive rate on healthy people generates {calculations.falsePositives} false alarms, which completely overwhelms the {calculations.truePositives} true cases! To get an accurate diagnosis on a rare condition, you always need a second independent test.
        </p>
      </div>
    </div>
  );
}
