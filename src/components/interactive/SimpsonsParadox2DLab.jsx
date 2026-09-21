'use client';

import React, { useState } from 'react';
import Icon from '@/components/common/Icon';
import styles from './SimpsonsParadox2DLab.module.css';

const PRESETS = {
  kidney: {
    id: 'kidney',
    title: 'Kidney Stone Treatment Trial (Charig et al. 1986)',
    confounder: 'Stone Size / Severity',
    subgroup1Name: 'Small Stones (Mild)',
    subgroup2Name: 'Large Stones (Severe)',
    groupA: {
      name: 'Treatment A (Open Surgery)',
      sub1: { success: 81, total: 87, rate: 93.1 },
      sub2: { success: 192, total: 263, rate: 73.0 },
      total: { success: 273, total: 350, rate: 78.0 },
    },
    groupB: {
      name: 'Treatment B (Percutaneous)',
      sub1: { success: 234, total: 270, rate: 86.7 },
      sub2: { success: 55, total: 80, rate: 68.8 },
      total: { success: 289, total: 350, rate: 82.6 },
    },
  },
  berkeley: {
    id: 'berkeley',
    title: '1973 UC Berkeley Admissions Investigation',
    confounder: 'Department Selectivity',
    subgroup1Name: 'Engineering & STEM (High Capacity)',
    subgroup2Name: 'Humanities & Arts (Low Capacity)',
    groupA: {
      name: 'Women Applicants',
      sub1: { success: 89, total: 108, rate: 82.4 },
      sub2: { success: 147, total: 593, rate: 24.8 },
      total: { success: 236, total: 701, rate: 33.7 },
    },
    groupB: {
      name: 'Men Applicants',
      sub1: { success: 512, total: 825, rate: 62.1 },
      sub2: { success: 89, total: 373, rate: 23.9 },
      total: { success: 601, total: 1198, rate: 50.2 },
    },
  },
};

export default function SimpsonsParadox2DLab() {
  const [presetKey, setPresetKey] = useState('kidney');
  const [viewMode, setViewMode] = useState('stratified'); // 'aggregate' | 'stratified'

  const data = PRESETS[presetKey];

  return (
    <div className={styles.labContainer} data-testid="simpsons-paradox-2d-lab">
      {/* Top Header & Presets */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <div className={styles.titleBadge}>
            <Icon name="chart" size={13} />
            <span>Confounding Variable Explainer</span>
          </div>
          <h2 className={styles.mainTitle}>{data.title}</h2>
        </div>

        <div className={styles.presetGroup}>
          <button
            type="button"
            className={`${styles.presetBtn} ${presetKey === 'kidney' ? styles.presetBtnActive : ''}`}
            onClick={() => setPresetKey('kidney')}
          >
            Kidney Stone Trial
          </button>
          <button
            type="button"
            className={`${styles.presetBtn} ${presetKey === 'berkeley' ? styles.presetBtnActive : ''}`}
            onClick={() => setPresetKey('berkeley')}
          >
            UC Berkeley Admissions
          </button>
        </div>
      </div>

      {/* The Crucial View Toggle Bar */}
      <div className={styles.viewToggleBar}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${viewMode === 'aggregate' ? styles.toggleBtnActiveAggregate : ''}`}
          onClick={() => setViewMode('aggregate')}
        >
          <Icon name="alert" size={16} />
          <span>1. Combined Aggregate View (The Illusion)</span>
        </button>

        <button
          type="button"
          className={`${styles.toggleBtn} ${viewMode === 'stratified' ? styles.toggleBtnActiveStratified : ''}`}
          onClick={() => setViewMode('stratified')}
        >
          <Icon name="check" size={16} />
          <span>2. Disaggregated by {data.confounder} (The Reality)</span>
        </button>
      </div>

      {/* Data Visualizer Grid */}
      <div className={styles.displayGrid}>
        {/* Cohort A */}
        <div
          className={`${styles.cohortCard} ${
            viewMode === 'stratified' || (viewMode === 'aggregate' && data.groupA.total.rate > data.groupB.total.rate)
              ? styles.cohortCardWinner
              : ''
          }`}
        >
          <div className={styles.cohortHeader}>
            <span className={styles.cohortName}>{data.groupA.name}</span>
            {viewMode === 'stratified' ? (
              <span className={styles.winnerBadge}>
                <Icon name="check" size={12} /> Superior in Both Groups
              </span>
            ) : data.groupA.total.rate > data.groupB.total.rate ? (
              <span className={styles.winnerBadge}>Apparent Winner</span>
            ) : null}
          </div>

          {viewMode === 'aggregate' ? (
            <div className={styles.statRow}>
              <div className={styles.statRowHeader}>
                <span>Overall Success Rate</span>
                <strong>{data.groupA.total.rate}%</strong>
              </div>
              <div className={styles.barTrack}>
                <div className={`${styles.barFill} ${styles.barFillA}`} style={{ width: `${data.groupA.total.rate}%` }} />
              </div>
              <span className={styles.ratioSub}>
                {data.groupA.total.success} / {data.groupA.total.total} total cases
              </span>
            </div>
          ) : (
            <>
              <div className={styles.statRow}>
                <div className={styles.statRowHeader}>
                  <span>Subgroup 1: {data.subgroup1Name}</span>
                  <strong>{data.groupA.sub1.rate}%</strong>
                </div>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles.barFillA}`} style={{ width: `${data.groupA.sub1.rate}%` }} />
                </div>
                <span className={styles.ratioSub}>
                  {data.groupA.sub1.success} / {data.groupA.sub1.total} cases (Wins!)
                </span>
              </div>

              <div className={styles.statRow}>
                <div className={styles.statRowHeader}>
                  <span>Subgroup 2: {data.subgroup2Name}</span>
                  <strong>{data.groupA.sub2.rate}%</strong>
                </div>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles.barFillA}`} style={{ width: `${data.groupA.sub2.rate}%` }} />
                </div>
                <span className={styles.ratioSub}>
                  {data.groupA.sub2.success} / {data.groupA.sub2.total} cases (Wins!)
                </span>
              </div>
            </>
          )}
        </div>

        {/* Cohort B */}
        <div
          className={`${styles.cohortCard} ${
            viewMode === 'aggregate' && data.groupB.total.rate > data.groupA.total.rate ? styles.cohortCardWinner : ''
          }`}
        >
          <div className={styles.cohortHeader}>
            <span className={styles.cohortName}>{data.groupB.name}</span>
            {viewMode === 'aggregate' && data.groupB.total.rate > data.groupA.total.rate ? (
              <span className={styles.winnerBadge}>
                <Icon name="check" size={12} /> Apparent Winner Overall
              </span>
            ) : null}
          </div>

          {viewMode === 'aggregate' ? (
            <div className={styles.statRow}>
              <div className={styles.statRowHeader}>
                <span>Overall Success Rate</span>
                <strong>{data.groupB.total.rate}%</strong>
              </div>
              <div className={styles.barTrack}>
                <div className={`${styles.barFill} ${styles.barFillB}`} style={{ width: `${data.groupB.total.rate}%` }} />
              </div>
              <span className={styles.ratioSub}>
                {data.groupB.total.success} / {data.groupB.total.total} total cases
              </span>
            </div>
          ) : (
            <>
              <div className={styles.statRow}>
                <div className={styles.statRowHeader}>
                  <span>Subgroup 1: {data.subgroup1Name}</span>
                  <strong>{data.groupB.sub1.rate}%</strong>
                </div>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles.barFillB}`} style={{ width: `${data.groupB.sub1.rate}%` }} />
                </div>
                <span className={styles.ratioSub}>
                  {data.groupB.sub1.success} / {data.groupB.sub1.total} cases
                </span>
              </div>

              <div className={styles.statRow}>
                <div className={styles.statRowHeader}>
                  <span>Subgroup 2: {data.subgroup2Name}</span>
                  <strong>{data.groupB.sub2.rate}%</strong>
                </div>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles.barFillB}`} style={{ width: `${data.groupB.sub2.rate}%` }} />
                </div>
                <span className={styles.ratioSub}>
                  {data.groupB.sub2.success} / {data.groupB.sub2.total} cases
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Explanatory Reversal Callout */}
      <div className={styles.reversalBanner}>
        <div className={styles.reversalBannerTitle}>
          <Icon name="zap" size={15} color="#facc15" />
          <span>Why the Winner Flips (The Confounder Effect)</span>
        </div>
        <p className={styles.reversalText}>
          {presetKey === 'kidney' ? (
            viewMode === 'aggregate' ? (
              <>
                In the combined view, <strong>Treatment B</strong> appears superior ({data.groupB.total.rate}% vs {data.groupA.total.rate}%). But this is a statistical illusion! Click <em>&quot;Disaggregated by Severity&quot;</em> above to see what happens when you control for stone size.
              </>
            ) : (
              <>
                <strong>Treatment A wins in every single subgroup!</strong> It cures small stones at {data.groupA.sub1.rate}% vs {data.groupB.sub1.rate}%, and large stones at {data.groupA.sub2.rate}% vs {data.groupB.sub2.rate}%. Treatment B only appeared to win overall because doctors reserved Treatment A for the severe, high-risk cases ({data.groupA.sub2.total} of {data.groupA.total.total} patients had large stones), while Treatment B was given mostly to easy mild stones ({data.groupB.sub1.total} of {data.groupB.total.total}).
              </>
            )
          ) : (
            viewMode === 'aggregate' ? (
              <>
                Overall, <strong>Men</strong> appeared to have higher admission rates ({data.groupB.total.rate}% vs {data.groupA.total.rate}%). But click <em>&quot;Disaggregated&quot;</em> to reveal the hidden departmental choice variable!
              </>
            ) : (
              <>
                <strong>Women had higher admission rates in both departments!</strong> In Engineering: {data.groupA.sub1.rate}% vs {data.groupB.sub1.rate}%. In Humanities: {data.groupA.sub2.rate}% vs {data.groupB.sub2.rate}%. Men had a higher aggregate rate only because women applied in disproportionate numbers to low-capacity humanities departments with single-digit acceptance rates.
              </>
            )
          )}
        </p>
      </div>
    </div>
  );
}
