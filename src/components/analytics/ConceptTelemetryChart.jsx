'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchConceptTelemetry } from '@/lib/supabase/conceptRuns';
import Icon from '@/components/common/Icon';
import styles from './ConceptTelemetryChart.module.css';

export default function ConceptTelemetryChart({ conceptSlug, conceptTitle }) {
  const [telemetry, setTelemetry] = useState(null);
  const [activeTab, setActiveTab] = useState('convergence'); // 'convergence' | 'distribution'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const loadData = useCallback(async () => {
    try {
      const data = await fetchConceptTelemetry(conceptSlug);
      setTelemetry(data);
    } catch (err) {
      console.warn('Failed to load concept telemetry:', err);
    }
  }, [conceptSlug]);

  useEffect(() => {
    loadData();

    // Real-time local subscription: reload whenever an action is triggered in the simulator above
    const handleRunRecorded = (e) => {
      if (e.detail?.conceptSlug === conceptSlug) {
        loadData();
      }
    };

    window.addEventListener('concept_run_recorded', handleRunRecorded);
    return () => window.removeEventListener('concept_run_recorded', handleRunRecorded);
  }, [conceptSlug, loadData]);

  // SVG dimensions
  const svgWidth = 700;
  const svgHeight = 220;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };

  // Calculate SVG Points & Paths
  const chartGeometry = useMemo(() => {
    if (!telemetry || !telemetry.convergencePoints || telemetry.convergencePoints.length === 0) {
      return null;
    }

    const points = telemetry.convergencePoints;
    const values = points.map((p) => p.runningAvg);
    const target = telemetry.theoreticalTarget;

    const minVal = Math.max(0, Math.min(...values, target) * 0.85);
    const maxVal = Math.max(...values, target, 1) * 1.15;
    const range = maxVal - minVal || 1;

    const plotW = svgWidth - padding.left - padding.right;
    const plotH = svgHeight - padding.top - padding.bottom;

    const coords = points.map((p, idx) => {
      const x = padding.left + (idx / Math.max(1, points.length - 1)) * plotW;
      const y = padding.top + plotH - ((p.runningAvg - minVal) / range) * plotH;
      return { x, y, raw: p };
    });

    // SVG line path
    const pathD = coords.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    // SVG area path
    const baselineY = padding.top + plotH;
    const areaD = coords.length > 0
      ? `${pathD} L ${coords[coords.length - 1].x} ${baselineY} L ${coords[0].x} ${baselineY} Z`
      : '';

    // Theoretical target line Y
    const targetY = padding.top + plotH - ((target - minVal) / range) * plotH;

    return { coords, pathD, areaD, targetY, minVal, maxVal };
  }, [telemetry]);

  if (!telemetry) {
    return (
      <div className={styles.telemetryContainer} data-testid="concept-telemetry-chart">
        <div className={styles.statusPill}>
          <div className={styles.pulseDotOffline} />
          <span>Loading Telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.telemetryContainer} data-testid="concept-telemetry-chart">
      {/* Top Header */}
      <div className={styles.topHeader}>
        <div className={styles.titleBox}>
          <div className={styles.statusRow}>
            <div className={`${styles.statusPill} ${telemetry.isLiveCloud ? styles.statusPillLive : ''}`}>
              <div className={telemetry.isLiveCloud ? styles.pulseDot : styles.pulseDotOffline} />
              <span>
                {telemetry.isLiveCloud
                  ? 'Live Supabase Telemetry'
                  : telemetry.isSupabaseConfigured
                  ? 'Supabase Connected'
                  : 'Crowdsourced Telemetry Baseline'}
              </span>
            </div>
          </div>
          <h3 className={styles.chartHeading}>
            {conceptTitle ? `${conceptTitle} Telemetry` : 'Empirical Telemetry & Law of Large Numbers'}
          </h3>
          <p className={styles.chartSubtitle}>
            Aggregating historical community simulation runs and comparing observed outcomes against theoretical limits.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className={styles.tabGroup}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'convergence' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('convergence')}
          >
            <Icon name="trending-up" size={13} />
            <span>Convergence Curve</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'distribution' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('distribution')}
          >
            <Icon name="bar-chart" size={13} />
            <span>Outcome Distribution</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Community Runs</span>
          <span className={styles.statVal} style={{ color: '#f59e0b' }}>
            {telemetry.totalRuns}
          </span>
          <span className={styles.statFootnote}>Recorded simulations</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Observed Average</span>
          <span className={styles.statVal} style={{ color: '#f8fafc' }}>
            {telemetry.empiricalAverage}
            <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '4px' }}>
              {telemetry.unit.includes('%') ? '%' : ''}
            </span>
          </span>
          <span className={styles.statFootnote}>{telemetry.label}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Theoretical Target</span>
          <span className={styles.statVal} style={{ color: '#38bdf8' }}>
            {telemetry.theoreticalTarget}
            <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '4px' }}>
              {telemetry.unit.includes('%') ? '%' : ''}
            </span>
          </span>
          <span className={styles.statFootnote}>Exact mathematical limit</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Convergence Delta (Δ)</span>
          <span
            className={styles.statVal}
            style={{ color: Math.abs(telemetry.divergence) < 5 ? '#10b981' : '#f59e0b' }}
          >
            {telemetry.divergence > 0 ? `+${telemetry.divergence}` : telemetry.divergence}
            <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '4px' }}>
              {telemetry.unit.includes('%') ? '%' : ''}
            </span>
          </span>
          <span className={styles.statFootnote}>Empirical vs Theory gap</span>
        </div>
      </div>

      {/* Main Interactive Chart Viewport */}
      <div className={styles.chartViewport}>
        {activeTab === 'convergence' && chartGeometry && (
          <>
            <svg
              className={styles.svgChart}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line
                x1={padding.left}
                y1={padding.top}
                x2={svgWidth - padding.right}
                y2={padding.top}
                stroke="#1f2937"
                strokeDasharray="3 3"
              />
              <line
                x1={padding.left}
                y1={padding.top + (svgHeight - padding.top - padding.bottom) / 2}
                x2={svgWidth - padding.right}
                y2={padding.top + (svgHeight - padding.top - padding.bottom) / 2}
                stroke="#1f2937"
                strokeDasharray="3 3"
              />
              <line
                x1={padding.left}
                y1={svgHeight - padding.bottom}
                x2={svgWidth - padding.right}
                y2={svgHeight - padding.bottom}
                stroke="#2d3748"
              />

              {/* Theoretical Expected Value Dashed Horizon */}
              <line
                x1={padding.left}
                y1={chartGeometry.targetY}
                x2={svgWidth - padding.right}
                y2={chartGeometry.targetY}
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="6 4"
              />

              {/* Gradient Area Fill */}
              <path d={chartGeometry.areaD} fill="url(#areaGlow)" />

              {/* Running Average Convergence Curve */}
              <path
                d={chartGeometry.pathD}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Points */}
              {chartGeometry.coords.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint?.raw.index === pt.raw.index ? 6 : 3.5}
                  fill={hoveredPoint?.raw.index === pt.raw.index ? '#ffffff' : '#f59e0b'}
                  stroke="#08090c"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredPoint(pt);
                    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className={styles.tooltipBox}
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                }}
              >
                <div className={styles.tooltipTitle}>Run #{hoveredPoint.raw.index}</div>
                <div>Running Avg: <strong>{hoveredPoint.raw.runningAvg}{telemetry.unit.includes('%') ? '%' : ''}</strong></div>
                <div>Theoretical: {telemetry.theoreticalTarget}{telemetry.unit.includes('%') ? '%' : ''}</div>
              </div>
            )}
          </>
        )}

        {/* Distribution Histogram View */}
        {activeTab === 'distribution' && (
          <div className={styles.histogramContainer}>
            {telemetry.distribution.map((bucket, idx) => {
              const maxPct = Math.max(...telemetry.distribution.map((b) => b.pct), 1);
              const barHeightPct = Math.max(8, (bucket.pct / maxPct) * 100);

              return (
                <div key={idx} className={styles.histColumn}>
                  <div className={styles.histBarWrapper}>
                    <span className={styles.histBarCount}>{bucket.count}</span>
                    <div
                      className={styles.histBar}
                      style={{ height: `${barHeightPct}%` }}
                    />
                  </div>
                  <span className={styles.histLabel}>{bucket.bin}</span>
                  <span className={styles.histPct}>{bucket.pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer / Telemetry Legend Banner */}
      <div className={styles.footerBanner}>
        <div className={styles.legendGroup}>
          <div className={styles.legendItem}>
            <div className={styles.legendLineGold} />
            <span>Empirical Running Average (Observations)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendLineCyan} />
            <span>Theoretical Mathematical Expectation</span>
          </div>
        </div>
        <span>Interactive trials from above are recorded live into the community distribution.</span>
      </div>
    </section>
  );
}
