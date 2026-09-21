'use client';

import React, { useState } from 'react';
import styles from './ConceptLabPlaceholder.module.css';
import Icon from '@/components/common/Icon';

const LAB_CONFIGS = {
  PiCollisions: {
    title: 'Galperin Elastic Collisions Engine',
    subtitle: 'Kinetic momentum circle mapping calculating digits of π via mass ratio bounces.',
    paramName: 'Mass Ratio (M : 1)',
    min: 1,
    max: 4,
    step: 1,
    defaultVal: 2,
    renderVal: (v) => `${Math.pow(100, v - 1)} : 1`,
    calculate: (v) => {
      const exp = v - 1;
      const digits = ['3', '31', '314', '3141'][exp] || '31';
      const bounces = ['3 bounces (M=1)', '31 bounces (M=100)', '314 bounces (M=10,000)', '3,141 bounces (M=1,000,000)'][exp];
      return {
        metric1: digits,
        metric1Label: 'Extracted Digits of π',
        metric2: bounces,
        metric2Label: 'Calculated Collision Sequence',
      };
    },
  },
  EulersNumber: {
    title: 'Bernoulli Continuous Compounding Engine',
    subtitle: 'Demonstrating (1 + 1/n)ⁿ approaching Euler constant e as frequency approaches infinity.',
    paramName: 'Compounding Intervals (n)',
    min: 1,
    max: 6,
    step: 1,
    defaultVal: 4,
    renderVal: (v) => ['Annual (n=1)', 'Monthly (n=12)', 'Daily (n=365)', 'Hourly (n=8760)', 'Per Second (n=3.15e7)', 'Continuous (n→∞)'][v - 1],
    calculate: (v) => {
      const vals = ['2.00000', '2.61303', '2.71457', '2.71813', '2.71828', '2.7182818...'];
      return {
        metric1: vals[v - 1],
        metric1Label: 'Effective Value (e)',
        metric2: `${(100 * (1 - Math.abs(2.71828 - parseFloat(vals[v - 1])) / 2.71828)).toFixed(2)}%`,
        metric2Label: 'Convergence Precision to e',
      };
    },
  },
  CapTheorem: {
    title: 'Distributed Network Partition Matrix',
    subtitle: 'Brewer trilemma simulator exploring latency and split-brain trade-offs under network failure.',
    paramName: 'Network Partition Severity',
    min: 0,
    max: 2,
    step: 1,
    defaultVal: 1,
    renderVal: (v) => ['Zero Partitions (CA Guaranteed)', 'Intermittent Packet Loss (CP Preferred)', 'Total Split-Brain (AP vs CP Forced)'][v],
    calculate: (v) => {
      const modes = ['Full Consistency & Availability', 'CP Mode: Write rejected for safety', 'AP Mode: Stale reads allowed for uptime'];
      return {
        metric1: ['CA', 'CP (Linearizable)', 'AP (Eventual)'][v],
        metric1Label: 'Optimal System Architecture',
        metric2: modes[v],
        metric2Label: 'Consistency Guarantee Status',
      };
    },
  },
  TeslersLaw: {
    title: 'Complexity Displacement Balance',
    subtitle: 'Conservation of inherent complexity across user interface vs architectural engineering.',
    paramName: 'User Friction Reduction Target',
    min: 10,
    max: 90,
    step: 10,
    defaultVal: 70,
    renderVal: (v) => `${v}% Simpler UI`,
    calculate: (v) => ({
      metric1: `${100 - v}%`,
      metric1Label: 'Remaining User Effort',
      metric2: `${Math.round(v * 2.8)} LOC/Edge Cases`,
      metric2Label: 'Underlying Engineering Burden',
    }),
  },
  BrouwersFixedPoint: {
    title: 'Continuous Topology Deformation Grid',
    subtitle: 'Tracking invariant stationary points across continuous fluid stirring and surface crumpling.',
    paramName: 'Stir Turbulence Velocity',
    min: 1,
    max: 5,
    step: 1,
    defaultVal: 3,
    renderVal: (v) => `${v * 25} RPM`,
    calculate: (v) => ({
      metric1: '≥ 1 Point',
      metric1Label: 'Stationary Invariant Coordinates',
      metric2: `(x₀, y₀) = ${(0.32 * v).toFixed(2)}, ${(0.48 / v).toFixed(2)}`,
      metric2Label: 'Fixed Point Anchor Coordinates',
    }),
  },
  ParkinsonsLaw: {
    title: 'Bureaucracy & Deadline Expansion Model',
    subtitle: 'Simulating task dilation and administrative proliferation as allocated schedule expands.',
    paramName: 'Allocated Project Horizon',
    min: 1,
    max: 12,
    step: 1,
    defaultVal: 6,
    renderVal: (v) => `${v} Weeks`,
    calculate: (v) => ({
      metric1: `${v} Weeks`,
      metric1Label: 'Actual Time Expended',
      metric2: `${Math.round(v * 16.5)}% Scope Creep`,
      metric2Label: 'Gold-Plating & Meetings Overhead',
    }),
  },
  HofstadtersLaw: {
    title: 'Recursive Estimation Expansion Model',
    subtitle: 'Simulating fractal unexpected dependencies across complex software architectures.',
    paramName: 'Initial Optimistic Estimate',
    min: 5,
    max: 50,
    step: 5,
    defaultVal: 15,
    renderVal: (v) => `${v} Days`,
    calculate: (v) => ({
      metric1: `${Math.round(v * 2.3)} Days`,
      metric1Label: 'Realistic Convergence Time',
      metric2: `${Math.round(v * 0.8)} Unknowns`,
      metric2Label: 'Discovered Dependency Branch Points',
    }),
  },
  HanlonsRazor: {
    title: 'Intent vs Cognitive Noise Filter',
    subtitle: 'Bayesian likelihood evaluation of malice vs system complexity and fatigue.',
    paramName: 'Observed Error Severity',
    min: 1,
    max: 5,
    step: 1,
    defaultVal: 3,
    renderVal: (v) => `Severity Level ${v}`,
    calculate: (v) => ({
      metric1: `${99.4 - v * 2.2}%`,
      metric1Label: 'Likelihood: Cognitive Fatigue / Noise',
      metric2: `${(0.6 + v * 2.2).toFixed(1)}%`,
      metric2Label: 'Likelihood: Intentional Malice',
    }),
  },
  ParetoPrinciple: {
    title: 'Power-Law Distribution Simulator',
    subtitle: 'Evaluating 80/20 asymmetry across codebase crash triggers, query loads, and wealth curves.',
    paramName: 'Core Driver Fraction (%)',
    min: 5,
    max: 40,
    step: 5,
    defaultVal: 20,
    renderVal: (v) => `${v}% of Inputs`,
    calculate: (v) => ({
      metric1: `${Math.round(100 - (100 - 80) * (v / 20))}%`,
      metric1Label: 'Cumulative Impact / Consequence',
      metric2: `α = ${(1.16 + (20 - v) * 0.02).toFixed(2)}`,
      metric2Label: 'Power-Law Pareto Shape Index',
    }),
  },
  PeterPrinciple: {
    title: 'Hierarchical Incompetence Transition Matrix',
    subtitle: 'Markov chain modeling of promotions until performance matches terminal incompetence ceiling.',
    paramName: 'Organization Hierarchy Tiers',
    min: 3,
    max: 8,
    step: 1,
    defaultVal: 5,
    renderVal: (v) => `${v} Management Levels`,
    calculate: (v) => ({
      metric1: `${Math.round(45 + v * 6)}%`,
      metric1Label: 'Estimated Incompetence Ceiling Rate',
      metric2: `${(v * 1.8).toFixed(1)} Years`,
      metric2Label: 'Mean Time to Terminal Promotion',
    }),
  },
  HicksLaw: {
    title: 'Logarithmic Decision Friction Gauge',
    subtitle: 'Hick-Hyman equation T = b · log₂(n + 1) measuring latency penalty of choice proliferation.',
    paramName: 'Number of Interface Choices (n)',
    min: 2,
    max: 32,
    step: 2,
    defaultVal: 8,
    renderVal: (v) => `${v} Options`,
    calculate: (v) => ({
      metric1: `${(150 * Math.log2(v + 1)).toFixed(0)} ms`,
      metric1Label: 'Cognitive Reaction Latency',
      metric2: `${Math.log2(v + 1).toFixed(2)} bits`,
      metric2Label: 'Information Entropy Processed',
    }),
  },
  GoodhartsLaw: {
    title: 'Target Degradation & Metric Distortion Lab',
    subtitle: 'Simulating proxy metric collapse when optimization pressure corrupts genuine quality.',
    paramName: 'Optimization Pressure on Metric',
    min: 1,
    max: 5,
    step: 1,
    defaultVal: 4,
    renderVal: (v) => ['Low Staking', 'Moderate Goals', 'Strict Quota', 'Severe Penalty', 'Hyper-Optimized Proxy'][v - 1],
    calculate: (v) => ({
      metric1: `${Math.max(10, 100 - v * 19)}%`,
      metric1Label: 'Genuine Underlying Quality',
      metric2: `${Math.min(100, 60 + v * 9)}%`,
      metric2Label: 'Measured Proxy Metric Score',
    }),
  },
  DunningKrugerEffect: {
    title: 'Metacognitive Calibration Curve',
    subtitle: 'Tracking self-assessed competence vs actual performance from Mount Foolish to Mastery.',
    paramName: 'Actual Domain Knowledge',
    min: 1,
    max: 5,
    step: 1,
    defaultVal: 1,
    renderVal: (v) => ['Novice (Peak of Mount Stupid)', 'Beginner (Valley of Despair)', 'Competent (Slope of Enlightenment)', 'Proficient (Plateau of Sustainability)', 'Expert (Mastery)'][v - 1],
    calculate: (v) => {
      const perceived = ['92%', '34%', '58%', '78%', '95%'][v - 1];
      const actual = ['14%', '36%', '62%', '84%', '98%'][v - 1];
      return {
        metric1: perceived,
        metric1Label: 'Self-Assessed Perceived Ability',
        metric2: actual,
        metric2Label: 'Actual Objective Benchmark',
      };
    },
  },
  OccamsRazor: {
    title: 'Parsimony & Model Parameter Penalizer',
    subtitle: 'Bayesian Occam factor and Minimum Description Length penalizing epistemic overfitting.',
    paramName: 'Hypothesis Complexity (Free Parameters)',
    min: 1,
    max: 10,
    step: 1,
    defaultVal: 3,
    renderVal: (v) => `${v} Parameters`,
    calculate: (v) => ({
      metric1: `1 / ${(Math.pow(2.4, v - 1)).toFixed(1)}`,
      metric1Label: 'Relative Prior Epistemic Credence',
      metric2: v > 4 ? 'Overfitting Risk' : 'Parsimonious (Preferred)',
      metric2Label: 'Model Generalization Status',
    }),
  },
  ChestertonsFence: {
    title: 'Refactoring & Legacy Architecture Inspector',
    subtitle: 'Quantifying hidden second-order failure modes when removing un-investigated code constraints.',
    paramName: 'Inspection Depth Before Removal',
    min: 1,
    max: 5,
    step: 1,
    defaultVal: 2,
    renderVal: (v) => ['Zero Context (Blind Deletion)', 'Surface Read', 'Git Blame Investigation', 'Author Interview', 'Comprehensive Second-Order Audit'][v - 1],
    calculate: (v) => ({
      metric1: `${Math.max(2, 94 - (v - 1) * 23)}%`,
      metric1Label: 'Catastrophic Regressive Failure Risk',
      metric2: ['Critical Bug', 'Warning', 'Managed Risk', 'Low Risk', 'Safe Refactor'][v - 1],
      metric2Label: 'System Stability Forecast',
    }),
  },
  BrooksLaw: {
    title: 'Pairwise Communication Scaler',
    subtitle: 'Fred Brooks n(n-1)/2 channel equation and ramp-up drag when adding engineers to late projects.',
    paramName: 'Team Headcount (n)',
    min: 2,
    max: 16,
    step: 1,
    defaultVal: 6,
    renderVal: (v) => `${v} Engineers`,
    calculate: (v) => {
      const channels = (v * (v - 1)) / 2;
      return {
        metric1: `${channels} Channels`,
        metric1Label: 'Pairwise Communication Links (n(n-1)/2)',
        metric2: `${Math.max(15, 100 - (channels * 0.9)).toFixed(0)}%`,
        metric2Label: 'Effective Net Coding Throughput',
      };
    },
  },
};

export default function ConceptLabPlaceholder({ conceptType }) {
  const config = LAB_CONFIGS[conceptType] || {
    title: `${conceptType || 'Interactive'} Simulation Lab`,
    subtitle: 'Dynamic computational laboratory for real-time mathematical parameter testing.',
    paramName: 'System Parameter Scale',
    min: 1,
    max: 5,
    step: 1,
    defaultVal: 3,
    renderVal: (v) => `Level ${v}`,
    calculate: (v) => ({
      metric1: `Level ${v}`,
      metric1Label: 'Calculated Output Metric',
      metric2: `${v * 20}%`,
      metric2Label: 'Theoretical Upper Bound',
    }),
  };

  const [paramVal, setParamVal] = useState(config.defaultVal);
  const telemetry = config.calculate(paramVal);

  return (
    <div className={styles.placeholderCard}>
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <span className={styles.stagingBadge}>
            <Icon name="sparkles" size={13} />
            <span>Interactive Sandbox Preview</span>
          </span>
          <h3 className={styles.labTitle}>{config.title}</h3>
          <p className={styles.labSubtitle}>{config.subtitle}</p>
        </div>
        <div className={styles.statusIndicator}>
          <span className={styles.pulseDot} />
          <span>Interactive Model Active</span>
        </div>
      </div>

      <div className={styles.sandboxDeck}>
        <div className={styles.sandboxHeader}>
          <div className={styles.sandboxTitle}>
            <Icon name="math" size={16} color="#38bdf8" />
            <span>Live Mathematical Parameter Scrubber</span>
          </div>
        </div>

        <div className={styles.sandboxControls}>
          <div className={styles.controlItem}>
            <div className={styles.controlLabelRow}>
              <span>{config.paramName}</span>
              <span className={styles.controlValue}>{config.renderVal(paramVal)}</span>
            </div>
            <input
              type="range"
              className={styles.rangeInput}
              min={config.min}
              max={config.max}
              step={config.step}
              value={paramVal}
              onChange={(e) => setParamVal(Number(e.target.value))}
            />
            <p className={styles.controlHelp}>
              Slide to test mathematical boundary behaviors and dynamic consequence scaling.
            </p>
          </div>
        </div>

        <div className={styles.telemetryRow}>
          <div className={styles.telemetryCard}>
            <span className={styles.telemetryKey}>{telemetry.metric1Label}</span>
            <span className={`${styles.telemetryVal} ${styles.telemetryValCyan}`}>{telemetry.metric1}</span>
          </div>
          <div className={styles.telemetryCard}>
            <span className={styles.telemetryKey}>{telemetry.metric2Label}</span>
            <span className={`${styles.telemetryVal} ${styles.telemetryValGold}`}>{telemetry.metric2}</span>
          </div>
        </div>
      </div>

      <div className={styles.calloutNote}>
        <Icon name="lightbulb" size={18} color="#38bdf8" />
        <div className={styles.calloutText}>
          <strong>Guided Experiment Active:</strong> Use the <strong>Guided Lab Scenarios</strong> in the challenge bar above to test specific edge cases, or explore the <strong>Formal Math & Logic</strong> tab below for rigorous mathematical derivations!
        </div>
      </div>
    </div>
  );
}
