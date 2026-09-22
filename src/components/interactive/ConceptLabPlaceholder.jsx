'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './ConceptLabPlaceholder.module.css';
import Icon from '@/components/common/Icon';

const LAB_CONFIGS = {
  PiCollisions: {
    title: 'Galperin Elastic Collisions Engine',
    subtitle: 'Kinetic momentum circle mapping calculating digits of π via mass ratio bounces.',
    plannedEngine: '3D WebGL Elastic Kinetic Arena',
    plannedFeatures: [
      'Precision physics simulation with analytical collision fast-forwarding',
      'Phase space momentum vector radar with invariant circular radius mapping',
      'Harmonic acoustic synthesizer generating real-time collision click tones',
    ],
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
    plannedEngine: '3D Logarithmic Growth Spiral & Compounding Matrix (WebGL)',
    plannedFeatures: [
      'Interactive continuous compounding timeline scaling from annual to infinitesimal seconds',
      'Dynamic 3D spiral manifold showing exponential divergence vs steady-state convergence',
      'Euler limit derivation visualizer comparing discrete interest steps to e^x curve',
    ],
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
    plannedEngine: '3D Distributed Multi-Datacenter Cluster Mesh',
    plannedFeatures: [
      'Simulated cross-ocean packet drops and network bridge severing in real-time',
      'Visualized linearizable consensus vs eventual consistency read/write routing',
      'Dynamic partition inject test: watch CP nodes reject writes while AP nodes return stale reads',
    ],
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
    plannedEngine: '2D Hydraulic Conservation Reservoir Simulator',
    plannedFeatures: [
      'Interactive hydraulic volume balance showing irreducible system complexity',
      'UI simplicity slider demonstrating displacement into backend state machine logic',
      'Real-world product archetypes (Search bar vs complex filter panel trade-offs)',
    ],
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
    plannedEngine: '3D Continuous Rubber Sheet & Fluid Vortex Topology Lab',
    plannedFeatures: [
      'Interactive crumpling and flattening of a 2D manifold without tearing or holes',
      'Coffee cup vortex simulation isolating the invariant stationary center particle',
      'Coordinate vector field overlay verifying Brouwer existence proof (f(x) = x)',
    ],
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
    plannedEngine: '2D/3D Gantt Sprawl & Bureaucracy Proliferation Engine',
    plannedFeatures: [
      'Visual timeline dilation demonstrating task expansion to fill available project window',
      'Administrative overhead meeting proliferation curves based on Cyril Parkinson historical data',
      'Deadline compression simulator demonstrating efficiency thresholds',
    ],
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
    plannedEngine: 'Recursive Fractal Project Dependency DAG',
    plannedFeatures: [
      'Branching tree of recursive unknowns expanding even when taking the law into account',
      'Monte Carlo estimation bounds demonstrating heavy-tailed project distribution curves',
      'Software release delay simulation comparing planned milestones to actual delivery',
    ],
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
    plannedEngine: '2D Bayesian Cognitive Fatigue vs Malice Scatterplot',
    plannedFeatures: [
      'Interactive likelihood distribution separating intentional harm from operational error',
      'Cognitive load slider illustrating how fatigue mimics malicious sabotage',
      'Incident post-mortem simulator evaluating blameless culture trade-offs',
    ],
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
    plannedEngine: '3D Power-Law Lorenz Surface & Asymmetric Heavy Tail',
    plannedFeatures: [
      'Lorenz curve visualizer with interactive Gini coefficient and alpha shape index',
      'Crash telemetry simulator showing 20% of bugs producing 80% of total system failures',
      'Fractal 80/20 recursion: observing the 4% of causes that drive 64% of consequences',
    ],
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
    plannedEngine: '3D Organizational Lattice & Markov Promotion Chain',
    plannedFeatures: [
      'Agent-based organizational hierarchy tracking skill match across managerial tiers',
      'Markov transition matrix tracking promotion velocity vs performance plateau',
      'Comparative organizational models: competence-based ladders vs dual-track IC systems',
    ],
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
    plannedEngine: 'Interactive Cognitive Latency Matrix & Reaction Stopwatch',
    plannedFeatures: [
      'Real-time decision stopwatch testing human cognitive reaction times against n choices',
      'Hick-Hyman logarithmic curve fit comparing theoretical bits to observed reaction',
      'UX design optimizer comparing mega-menus to hierarchical categorized taxonomies',
    ],
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
    plannedEngine: '2D Metric Gaming & Perverse Incentive Agent Simulator',
    plannedFeatures: [
      'Simulated KPI optimization pressure demonstrating the erosion of underlying quality',
      'Historical scenario presets (British Cobra Effect, Soviet Nail Factory Quotas, Lines of Code KPI)',
      'Counter-measure visualizer modeling balanced scorecard and adversarial metric auditing',
    ],
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
    plannedEngine: '2D Metacognitive Calibration Manifold & Quiz Arena',
    plannedFeatures: [
      'Self-assessment slider versus objective difficulty benchmark tracking confidence gap',
      'Dynamic path tracing from Peak of Mount Stupid down into the Valley of Despair to Mastery',
      'Metacognitive calibration metrics evaluating epistemic humility across domains',
    ],
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
    plannedEngine: '3D Epistemic Bayesian Parameter Mesh & Overfitting Curve',
    plannedFeatures: [
      'Interactive polynomial curve fitting demonstrating generalization error vs parameter explosion',
      'Bayesian Occam factor penalty quantifying why simpler models receive higher posterior probability',
      'Minimum Description Length (MDL) data compressor balancing model complexity against residual error',
    ],
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
    plannedEngine: '2D Architectural Dependency Inspector & Failure Simulator',
    plannedFeatures: [
      'Legacy codebase refactoring sandbox with hidden second-order failure traps',
      'Context investigation slider demonstrating bug hazard reduction before removing legacy barriers',
      'Simulated production incident post-mortem demonstrating why the constraint was placed originally',
    ],
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
    plannedEngine: '3D Mesh of Pairwise Channels & Ramp-Up Drag Model',
    plannedFeatures: [
      'Interactive graph network illustrating exponential n(n-1)/2 channel growth as headcount scales',
      'Ramp-up training burden calculator showing veteran engineer diversion from active tasks',
      'Mythical Man-Month threshold detector demonstrating when adding people delays delivery further',
    ],
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
  MobiusStrip: {
    title: 'Non-Orientable Topology & Manifold Lab',
    subtitle: 'Simulating 180° half-twist topological invariants, centerline traversal length (2L), and boundary cutting.',
    plannedEngine: '3D Continuous Non-Orientable Manifold & Traversal Lab (Three.js WebGL)',
    plannedFeatures: [
      'Interactive 3D parametric Möbius strip manifold with dynamic width and half-twist slider',
      'Ant particle traversal simulation demonstrating continuous 4π single-sided loop traversal',
      'Virtual scissors cutting simulator: midline bisecting (4 half-twists) vs 1/3 offset interlocking loops',
    ],
    paramName: 'Half-Twist Multiplier (n × 180°)',
    min: 1,
    max: 5,
    step: 1,
    defaultVal: 1,
    renderVal: (v) => ['Single Half-Twist (Möbius)', 'Double Half-Twist (Cylinder Loop)', 'Triple Half-Twist (Trefoil Knot Edge)', 'Quadruple Half-Twist', 'Quintuple Half-Twist'][v - 1],
    calculate: (v) => ({
      metric1: v % 2 === 1 ? '1 Surface (Non-Orientable)' : '2 Surfaces (Orientable)',
      metric1Label: 'Global Surface Topology',
      metric2: v % 2 === 1 ? '1 Boundary Component' : '2 Boundary Components',
      metric2Label: 'Manifold Boundary Edges',
    }),
  },
  VampireTiles: {
    title: 'Spectre Aperiodic Monotile Matrix',
    subtitle: 'Simulating chiral aperiodic plane tiling without reflections ("ein stein" Vampire tile).',
    plannedEngine: '2D/3D Chiral Quasicrystal Tessellation & Inflation Engine',
    plannedFeatures: [
      'Interactive Spectre polykite tessellation canvas generating hundreds of non-repeating tiles',
      'Chirality enforcement toggle verifying zero mirror reflections are needed (Vampire condition)',
      'Hierarchical super-tile inflation/deflation visualizer revealing fractal quasicrystalline order',
    ],
    paramName: 'Hierarchical Inflation Depth (k)',
    min: 1,
    max: 5,
    step: 1,
    defaultVal: 2,
    renderVal: (v) => ['Level 1: 1 Monotile', 'Level 2: 8 Super-Tiles', 'Level 3: 64 Cluster Tiles', 'Level 4: 512 Macro-Tiles', 'Level 5: 4,096 Quasicrystal Tiles'][v - 1],
    calculate: (v) => ({
      metric1: `${Math.pow(8, v - 1).toLocaleString()} Monotiles`,
      metric1Label: 'Active Monotile Count',
      metric2: 'Zero Reflections (Chiral Pure)',
      metric2Label: 'Mirror Reflection Usage',
    }),
  },
};

export default function ConceptLabPlaceholder({ conceptType, concept }) {
  const config = LAB_CONFIGS[conceptType] || {
    title: `${concept?.title || conceptType || 'Interactive'} Simulation Lab`,
    subtitle: 'Dynamic computational laboratory for real-time mathematical parameter testing.',
    plannedEngine: '3D/2D WebGL Physics Simulation Engine',
    plannedFeatures: [
      'Full real-time parameter controls with dynamic physics feedback',
      'Telemetry graphs and invariant conservation monitoring',
      'Interactive guided exploration scenarios and challenges',
    ],
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
  const [isNotified, setIsNotified] = useState(false);
  const telemetry = config.calculate(paramVal);

  const conceptSlug = concept?.slug || (conceptType ? conceptType.toLowerCase() : 'concept');
  const issueDeskUrl = `/community?category=feature&page=/concepts/${conceptSlug}`;

  return (
    <div className={styles.placeholderCard} data-testid="concept-lab-placeholder">
      {/* ── COMING SOON OVERLAY / SIMULATION SCREEN ── */}
      <div className={styles.comingSoonScreen}>
        <div className={styles.screenGlow} />
        
        <div className={styles.screenHeader}>
          <div className={styles.engineBadgeGroup}>
            <span className={styles.comingSoonBadge}>
              <span className={styles.pulseDotAmber} />
              <span>Coming Soon: Interactive Simulation</span>
            </span>
            <span className={styles.phaseBadge}>
              <span>Engineering Pipeline • Phase 2</span>
            </span>
          </div>

          <button
            type="button"
            className={`${styles.notifyBtn} ${isNotified ? styles.notifyBtnActive : ''}`}
            onClick={() => setIsNotified(!isNotified)}
            title="Get notified when this interactive simulation goes live"
          >
            <Icon name={isNotified ? 'check' : 'bell'} size={14} />
            <span>{isNotified ? 'Subscribed for Release' : 'Notify on Release'}</span>
          </button>
        </div>

        <div className={styles.enginePlannedContent}>
          <div className={styles.engineIconBox}>
            <Icon name="portal" size={32} color="#38bdf8" />
          </div>

          <div className={styles.engineMeta}>
            <span className={styles.plannedEngineLabel}>Planned Simulation Architecture:</span>
            <h4 className={styles.plannedEngineTitle}>{config.plannedEngine}</h4>
            <p className={styles.plannedEngineDesc}>
              A full high-fidelity canvas simulation is being engineered for this concept. You can request priority implementation or submit architecture designs below:
            </p>

            <ul className={styles.plannedFeaturesList}>
              {config.plannedFeatures.map((feat, i) => (
                <li key={i} className={styles.plannedFeatureItem}>
                  <Icon name="check" size={13} color="#10b981" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className={styles.screenActions}>
              <Link href={issueDeskUrl} className={styles.requestPriorityLink}>
                <Icon name="git-pull-request" size={14} />
                <span>Request Priority / Propose Simulation Design</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIVE LIVE MATHEMATICAL PARAMETER SCRUBBER ── */}
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <span className={styles.stagingBadge}>
            <Icon name="sparkles" size={13} />
            <span>Active Live Mathematical Sandbox</span>
          </span>
          <h3 className={styles.labTitle}>{config.title}</h3>
          <p className={styles.labSubtitle}>{config.subtitle}</p>
        </div>
        <div className={styles.statusIndicator}>
          <span className={styles.pulseDot} />
          <span>Calculations Active</span>
        </div>
      </div>

      <div className={styles.sandboxDeck}>
        <div className={styles.sandboxHeader}>
          <div className={styles.sandboxTitle}>
            <Icon name="math" size={16} color="#38bdf8" />
            <span>Live Mathematical Parameter Scrubber</span>
          </div>
          <span className={styles.sandboxHint}>
            Slide parameter below to evaluate real-time theoretical metrics
          </span>
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
              aria-label={config.paramName}
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
          <strong>Guided Scenarios Active:</strong> Use the <strong>Guided Lab Scenarios</strong> in the challenge bar above to test specific edge cases, or explore the <strong>Formal Math & Logic</strong> tab below for rigorous mathematical derivations!
        </div>
      </div>
    </div>
  );
}
