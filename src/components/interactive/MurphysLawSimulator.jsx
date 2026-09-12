'use client';

import { useState } from 'react';
import styles from './InteractiveSimulation.module.css';
import Icon from '@/components/common/Icon';

export default function MurphysLawSimulator() {
  const [componentCount, setComponentCount] = useState(5);
  const [singleFailureRate, setSingleFailureRate] = useState(0.05); // 5%
  const [trials, setTrials] = useState(50);
  const [history, setHistory] = useState({
    total: 50,
    failed: 47,
    empiricalRate: 94.0,
    results: [
      { trial: 46, hasFailed: true, failedComponents: [2] },
      { trial: 47, hasFailed: false, failedComponents: [] },
      { trial: 48, hasFailed: true, failedComponents: [4] },
      { trial: 49, hasFailed: true, failedComponents: [1, 3] },
      { trial: 50, hasFailed: true, failedComponents: [5] },
    ],
  });
  const [isSimulating, setIsSimulating] = useState(false);

  // P(at least 1 fail in single run) = 1 - (1 - p)^n
  const systemFailureProb = 1 - Math.pow(1 - singleFailureRate, componentCount);

  // Over N trials, probability of failure occurring at least once
  const trialFailureProb = 1 - Math.pow(1 - systemFailureProb, trials);

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      let failedRuns = 0;
      const results = [];

      for (let i = 1; i <= trials; i++) {
        let hasFailed = false;
        const componentFailures = [];
        for (let c = 1; c <= componentCount; c++) {
          const failed = Math.random() < singleFailureRate;
          if (failed) {
            hasFailed = true;
            componentFailures.push(c);
          }
        }
        if (hasFailed) failedRuns++;
        results.push({
          trial: i,
          hasFailed,
          failedComponents: componentFailures,
        });
      }

      setHistory({
        total: trials,
        failed: failedRuns,
        empiricalRate: (failedRuns / trials) * 100,
        results: results.slice(-10),
      });
      setIsSimulating(false);
    }, 250);
  };

  return (
    <div className={styles.container}>
      <div className={styles.simHeader}>
        <div className={styles.simBadge}>
          <Icon name="zap" size={13} color="var(--color-brand-primary)" />
          <span>Interactive Monte Carlo Lab</span>
        </div>
        <h3 className={styles.simTitle}>Murphy's Law Probability Engine</h3>
        <p className={styles.simSubtitle}>
          Mathematical verification: Why complex systems with microscopic failure rates make catastrophic failure statistically inevitable over operational cycles.
        </p>
      </div>

      <div className={styles.controlsGrid}>
        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Subsystems / Components</label>
            <span className={styles.valueBadge}>{componentCount} units</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={componentCount}
            onChange={(e) => setComponentCount(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Independent system failure surfaces</span>
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Failure Rate per Component</label>
            <span className={styles.valueBadge}>{(singleFailureRate * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.20"
            step="0.005"
            value={singleFailureRate}
            onChange={(e) => setSingleFailureRate(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Individual component probability of fault</span>
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Operational Cycles (Trials)</label>
            <span className={styles.valueBadge}>{trials} cycles</span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={trials}
            onChange={(e) => setTrials(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Number of operational iterations</span>
        </div>
      </div>

      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Single Run Failure Risk</div>
          <div className={styles.statValue}>{(systemFailureProb * 100).toFixed(1)}%</div>
          <div className={styles.statFormula}>P = 1 - (1 - p)ⁿ</div>
        </div>

        <div className={`${styles.statCard} ${styles.highlightCard}`}>
          <div className={styles.statLabel}>Cumulative Risk ({trials} Runs)</div>
          <div className={styles.statValueHighlight}>{(trialFailureProb * 100).toFixed(1)}%</div>
          <div className={styles.statFormula}>Murphy's Law threshold</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Empirical Observed Rate</div>
          <div className={styles.statValue}>
            {history.empiricalRate !== undefined ? `${history.empiricalRate.toFixed(1)}%` : 'Run test'}
          </div>
          <div className={styles.statFormula}>
            {history.failed !== undefined ? `${history.failed} / ${history.total} failures` : 'Awaiting trial'}
          </div>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className={styles.runButton}
        >
          <Icon name="zap" size={16} />
          <span>{isSimulating ? 'Executing Trials...' : 'Run Monte Carlo Trials'}</span>
        </button>
      </div>

      {history.results && (
        <div className={styles.resultsSection}>
          <h4 className={styles.resultsTitle}>Telemetry Event Log</h4>
          <div className={styles.telemetryGrid}>
            {history.results.map((r) => (
              <div
                key={r.trial}
                className={`${styles.telemetryItem} ${r.hasFailed ? styles.telemetryFailed : styles.telemetrySuccess}`}
              >
                <div className={styles.telemetryCycle}>Cycle #{r.trial}</div>
                <div className={styles.telemetryStatus}>
                  {r.hasFailed ? `Fault in C[${r.failedComponents.join(',')}]` : 'Nominal'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
