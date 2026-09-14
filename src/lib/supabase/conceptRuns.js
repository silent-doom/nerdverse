import { getSupabaseClient, isSupabaseConfigured } from './client';

// ── Curated Baseline Seed Telemetry ──
// Ensures instant, realistic statistical charts for every concept on first load
const SEED_TELEMETRY = {
  'monty-hall': {
    theoreticalTarget: 66.67,
    unit: '% Switch Win Rate',
    label: 'Switch Strategy Win Rate',
    runs: [
      { id: 'seed-1', metrics: { switched: true, won: false }, value: 0 },
      { id: 'seed-2', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-3', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-4', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-5', metrics: { switched: false, won: true }, value: 100 },
      { id: 'seed-6', metrics: { switched: true, won: false }, value: 0 },
      { id: 'seed-7', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-8', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-9', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-10', metrics: { switched: true, won: false }, value: 0 },
      { id: 'seed-11', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-12', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-13', metrics: { switched: true, won: false }, value: 0 },
      { id: 'seed-14', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-15', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-16', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-17', metrics: { switched: true, won: false }, value: 0 },
      { id: 'seed-18', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-19', metrics: { switched: true, won: true }, value: 100 },
      { id: 'seed-20', metrics: { switched: true, won: true }, value: 100 },
    ],
  },
  'st-petersburg-paradox': {
    theoreticalTarget: 100, // Conceptually infinite, capped by practical utility
    unit: '$ Mean Payout',
    label: 'Casino Round Payout ($)',
    runs: [
      { id: 'seed-1', metrics: { streak: 0, payout: 2 }, value: 2 },
      { id: 'seed-2', metrics: { streak: 1, payout: 4 }, value: 4 },
      { id: 'seed-3', metrics: { streak: 0, payout: 2 }, value: 2 },
      { id: 'seed-4', metrics: { streak: 2, payout: 8 }, value: 8 },
      { id: 'seed-5', metrics: { streak: 0, payout: 2 }, value: 2 },
      { id: 'seed-6', metrics: { streak: 3, payout: 16 }, value: 16 },
      { id: 'seed-7', metrics: { streak: 1, payout: 4 }, value: 4 },
      { id: 'seed-8', metrics: { streak: 0, payout: 2 }, value: 2 },
      { id: 'seed-9', metrics: { streak: 4, payout: 32 }, value: 32 },
      { id: 'seed-10', metrics: { streak: 0, payout: 2 }, value: 2 },
      { id: 'seed-11', metrics: { streak: 1, payout: 4 }, value: 4 },
      { id: 'seed-12', metrics: { streak: 5, payout: 64 }, value: 64 },
      { id: 'seed-13', metrics: { streak: 0, payout: 2 }, value: 2 },
      { id: 'seed-14', metrics: { streak: 2, payout: 8 }, value: 8 },
      { id: 'seed-15', metrics: { streak: 6, payout: 128 }, value: 128 },
      { id: 'seed-16', metrics: { streak: 0, payout: 2 }, value: 2 },
      { id: 'seed-17', metrics: { streak: 1, payout: 4 }, value: 4 },
      { id: 'seed-18', metrics: { streak: 7, payout: 256 }, value: 256 },
    ],
  },
  'bayes-theorem': {
    theoreticalTarget: 1.94,
    unit: '% Posterior Prob',
    label: 'Posterior P(Disease | Positive)',
    runs: [
      { id: 'seed-1', metrics: { baseRate: 0.1, sensitivity: 99, falsePositiveRate: 5, posteriorPct: 1.94 }, value: 1.94 },
      { id: 'seed-2', metrics: { baseRate: 0.2, sensitivity: 99, falsePositiveRate: 5, posteriorPct: 3.82 }, value: 3.82 },
      { id: 'seed-3', metrics: { baseRate: 0.5, sensitivity: 95, falsePositiveRate: 4, posteriorPct: 10.67 }, value: 10.67 },
      { id: 'seed-4', metrics: { baseRate: 1.0, sensitivity: 90, falsePositiveRate: 8, posteriorPct: 10.20 }, value: 10.20 },
      { id: 'seed-5', metrics: { baseRate: 0.1, sensitivity: 99, falsePositiveRate: 5, posteriorPct: 1.94 }, value: 1.94 },
      { id: 'seed-6', metrics: { baseRate: 2.0, sensitivity: 98, falsePositiveRate: 5, posteriorPct: 28.57 }, value: 28.57 },
      { id: 'seed-7', metrics: { baseRate: 0.1, sensitivity: 99, falsePositiveRate: 5, posteriorPct: 1.94 }, value: 1.94 },
      { id: 'seed-8', metrics: { baseRate: 5.0, sensitivity: 98, falsePositiveRate: 2, posteriorPct: 72.06 }, value: 72.06 },
      { id: 'seed-9', metrics: { baseRate: 1.0, sensitivity: 90, falsePositiveRate: 8, posteriorPct: 10.20 }, value: 10.20 },
      { id: 'seed-10', metrics: { baseRate: 0.1, sensitivity: 99, falsePositiveRate: 5, posteriorPct: 1.94 }, value: 1.94 },
      { id: 'seed-11', metrics: { baseRate: 0.1, sensitivity: 99, falsePositiveRate: 5, posteriorPct: 1.94 }, value: 1.94 },
      { id: 'seed-12', metrics: { baseRate: 15.0, sensitivity: 95, falsePositiveRate: 3, posteriorPct: 84.82 }, value: 84.82 },
    ],
  },
  'trolley-problem': {
    theoreticalTarget: 89.0, // Classical Foot utilitarian divert consensus
    unit: '% Divert Lever Ratio',
    label: 'Moral Choice (% Choosing Divert)',
    runs: [
      { id: 'seed-1', metrics: { choice: 'divert', livesSaved: 5 }, value: 100 },
      { id: 'seed-2', metrics: { choice: 'divert', livesSaved: 5 }, value: 100 },
      { id: 'seed-3', metrics: { choice: 'divert', livesSaved: 5 }, value: 100 },
      { id: 'seed-4', metrics: { choice: 'inaction', livesSaved: 1 }, value: 0 },
      { id: 'seed-5', metrics: { choice: 'divert', livesSaved: 5 }, value: 100 },
      { id: 'seed-6', metrics: { choice: 'divert', livesSaved: 5 }, value: 100 },
      { id: 'seed-7', metrics: { choice: 'divert', livesSaved: 5 }, value: 100 },
      { id: 'seed-8', metrics: { choice: 'divert', livesSaved: 5 }, value: 100 },
      { id: 'seed-9', metrics: { choice: 'inaction', livesSaved: 1 }, value: 0 },
      { id: 'seed-10', metrics: { choice: 'divert', livesSaved: 5 }, value: 100 },
      { id: 'seed-11', metrics: { choice: 'divert', livesSaved: 5 }, value: 100 },
      { id: 'seed-12', metrics: { choice: 'divert', livesSaved: 5 }, value: 100 },
    ],
  },
  'murphys-law': {
    theoreticalTarget: 78.0, // Matthews gravitational toast proof (~78% butter side)
    unit: '% Butter Down',
    label: 'Physical Toast Rotation (% Butter Down)',
    runs: [
      { id: 'seed-1', metrics: { landedButterDown: true }, value: 100 },
      { id: 'seed-2', metrics: { landedButterDown: true }, value: 100 },
      { id: 'seed-3', metrics: { landedButterDown: false }, value: 0 },
      { id: 'seed-4', metrics: { landedButterDown: true }, value: 100 },
      { id: 'seed-5', metrics: { landedButterDown: true }, value: 100 },
      { id: 'seed-6', metrics: { landedButterDown: true }, value: 100 },
      { id: 'seed-7', metrics: { landedButterDown: false }, value: 0 },
      { id: 'seed-8', metrics: { landedButterDown: true }, value: 100 },
      { id: 'seed-9', metrics: { landedButterDown: true }, value: 100 },
      { id: 'seed-10', metrics: { landedButterDown: true }, value: 100 },
    ],
  },
  'schrodingers-cat': {
    theoreticalTarget: 50.0,
    unit: '% Superposition Intact',
    label: 'Quantum State Collapse (% Alive/Intact)',
    runs: [
      { id: 'seed-1', metrics: { state: 'alive' }, value: 100 },
      { id: 'seed-2', metrics: { state: 'decayed' }, value: 0 },
      { id: 'seed-3', metrics: { state: 'alive' }, value: 100 },
      { id: 'seed-4', metrics: { state: 'decayed' }, value: 0 },
      { id: 'seed-5', metrics: { state: 'alive' }, value: 100 },
      { id: 'seed-6', metrics: { state: 'decayed' }, value: 0 },
      { id: 'seed-7', metrics: { state: 'alive' }, value: 100 },
      { id: 'seed-8', metrics: { state: 'alive' }, value: 100 },
      { id: 'seed-9', metrics: { state: 'decayed' }, value: 0 },
      { id: 'seed-10', metrics: { state: 'decayed' }, value: 0 },
    ],
  },
  'maxwells-demon': {
    theoreticalTarget: 2.3, // Landauer dissipation threshold for 1 TB equivalent erasure
    unit: 'nJ Heat',
    label: 'Landauer Heat Dissipation (nJ)',
    runs: [
      { id: 'seed-1', metrics: { bitsErased: 120, heatNanoJoules: 0.345 }, value: 0.35 },
      { id: 'seed-2', metrics: { bitsErased: 240, heatNanoJoules: 0.690 }, value: 0.69 },
      { id: 'seed-3', metrics: { bitsErased: 360, heatNanoJoules: 1.035 }, value: 1.04 },
      { id: 'seed-4', metrics: { bitsErased: 480, heatNanoJoules: 1.380 }, value: 1.38 },
      { id: 'seed-5', metrics: { bitsErased: 600, heatNanoJoules: 1.725 }, value: 1.73 },
      { id: 'seed-6', metrics: { bitsErased: 720, heatNanoJoules: 2.070 }, value: 2.07 },
      { id: 'seed-7', metrics: { bitsErased: 840, heatNanoJoules: 2.415 }, value: 2.42 },
      { id: 'seed-8', metrics: { bitsErased: 960, heatNanoJoules: 2.760 }, value: 2.76 },
      { id: 'seed-9', metrics: { bitsErased: 1024, heatNanoJoules: 2.944 }, value: 2.94 },
    ],
  },
  'fermi-paradox': {
    theoreticalTarget: 52, // Standard Sagan-Drake cosmological parameter solution
    unit: 'N Civs',
    label: 'Drake Communicative Civilizations (N)',
    runs: [
      { id: 'seed-1', metrics: { scenario: 'rare-earth', calculatedN: 0.01 }, value: 0 },
      { id: 'seed-2', metrics: { scenario: 'filter-ahead', calculatedN: 0.05 }, value: 0 },
      { id: 'seed-3', metrics: { scenario: 'standard', calculatedN: 18 }, value: 18 },
      { id: 'seed-4', metrics: { scenario: 'standard', calculatedN: 35 }, value: 35 },
      { id: 'seed-5', metrics: { scenario: 'standard', calculatedN: 52 }, value: 52 },
      { id: 'seed-6', metrics: { scenario: 'standard', calculatedN: 74 }, value: 74 },
      { id: 'seed-7', metrics: { scenario: 'standard', calculatedN: 120 }, value: 120 },
      { id: 'seed-8', metrics: { scenario: 'sagan-optimist', calculatedN: 450 }, value: 450 },
    ],
  },
  'laplaces-demon': {
    theoreticalTarget: 100.0, // Classical Laplace clockwork premise
    unit: '% Predictability',
    label: 'Demon Predictability Index (%)',
    runs: [
      { id: 'seed-1', metrics: { mode: 'clockwork', determinismScore: 100 }, value: 100 },
      { id: 'seed-2', metrics: { mode: 'clockwork', determinismScore: 100 }, value: 100 },
      { id: 'seed-3', metrics: { mode: 'chaos', determinismScore: 42 }, value: 42 },
      { id: 'seed-4', metrics: { mode: 'clockwork', determinismScore: 100 }, value: 100 },
      { id: 'seed-5', metrics: { mode: 'quantum', determinismScore: 0 }, value: 0 },
      { id: 'seed-6', metrics: { mode: 'chaos', determinismScore: 38 }, value: 38 },
      { id: 'seed-7', metrics: { mode: 'clockwork', determinismScore: 100 }, value: 100 },
      { id: 'seed-8', metrics: { mode: 'quantum', determinismScore: 0 }, value: 0 },
    ],
  },
  'ship-of-theseus': {
    theoreticalTarget: 68.0, // Historical philosophical preference for continuous form (Ship A)
    unit: '% Continuous Form',
    label: 'Metaphysical Identity Consensus (% Ship A)',
    runs: [
      { id: 'seed-1', metrics: { choice: 'shipA', replacementPct: 100 }, value: 100 },
      { id: 'seed-2', metrics: { choice: 'shipA', replacementPct: 80 }, value: 100 },
      { id: 'seed-3', metrics: { choice: 'shipB', replacementPct: 100 }, value: 0 },
      { id: 'seed-4', metrics: { choice: 'shipA', replacementPct: 50 }, value: 100 },
      { id: 'seed-5', metrics: { choice: 'both', replacementPct: 100 }, value: 50 },
      { id: 'seed-6', metrics: { choice: 'shipA', replacementPct: 100 }, value: 100 },
      { id: 'seed-7', metrics: { choice: 'neither', replacementPct: 100 }, value: 0 },
      { id: 'seed-8', metrics: { choice: 'shipA', replacementPct: 90 }, value: 100 },
    ],
  },
  'cognitive-dissonance': {
    theoreticalTarget: 7.8, // Festinger 1959 $1 insufficient justification subjective rating
    unit: 'Rating (-5 to +10)',
    label: 'Subconscious Task Enjoyment Rating',
    runs: [
      { id: 'seed-1', metrics: { condition: '$1-bribe', dissonanceScore: 92, taskRating: 7.8 }, value: 7.8 },
      { id: 'seed-2', metrics: { condition: '$20-bribe', dissonanceScore: 12, taskRating: -4.5 }, value: -4.5 },
      { id: 'seed-3', metrics: { condition: '$1-bribe', dissonanceScore: 88, taskRating: 7.2 }, value: 7.2 },
      { id: 'seed-4', metrics: { condition: 'control-$0', dissonanceScore: 0, taskRating: -5.0 }, value: -5.0 },
      { id: 'seed-5', metrics: { condition: '$1-bribe', dissonanceScore: 95, taskRating: 8.4 }, value: 8.4 },
      { id: 'seed-6', metrics: { condition: '$20-bribe', dissonanceScore: 15, taskRating: -4.2 }, value: -4.2 },
      { id: 'seed-7', metrics: { condition: '$1-bribe', dissonanceScore: 90, taskRating: 7.6 }, value: 7.6 },
      { id: 'seed-8', metrics: { condition: 'cult-prophecy', dissonanceScore: 98, taskRating: 9.5 }, value: 9.5 },
    ],
  },
  'halting-problem': {
    theoreticalTarget: 100.0, // 100% mathematical undecidability of the halting problem
    unit: '% Undecidable',
    label: 'Halting Undecidability Proof Index',
    runs: [
      { id: 'seed-1', metrics: { program: 'binary-increment', steps: 12, halts: true, paradox: false }, value: 100 },
      { id: 'seed-2', metrics: { program: 'opposite-paradox', steps: 999, halts: false, paradox: true }, value: 100 },
      { id: 'seed-3', metrics: { program: 'busy-beaver-3', steps: 14, halts: true, paradox: false }, value: 100 },
      { id: 'seed-4', metrics: { program: 'collatz-27', steps: 111, halts: true, paradox: false }, value: 100 },
      { id: 'seed-5', metrics: { program: 'opposite-paradox', steps: 999, halts: false, paradox: true }, value: 100 },
      { id: 'seed-6', metrics: { program: 'ping-pong-loop', steps: 500, halts: false, paradox: false }, value: 100 },
      { id: 'seed-7', metrics: { program: 'opposite-paradox', steps: 999, halts: false, paradox: true }, value: 100 },
      { id: 'seed-8', metrics: { program: 'busy-beaver-4', steps: 107, halts: true, paradox: false }, value: 100 },
    ],
  },
};

// Generic fallback for any other concept
const DEFAULT_CONFIG = {
  theoreticalTarget: 50.0,
  unit: '% Empirical Index',
  label: 'Observed Empirical Parameter',
  runs: [
    { id: 'seed-1', metrics: { success: true }, value: 100 },
    { id: 'seed-2', metrics: { success: false }, value: 0 },
    { id: 'seed-3', metrics: { success: true }, value: 100 },
    { id: 'seed-4', metrics: { success: true }, value: 100 },
    { id: 'seed-5', metrics: { success: false }, value: 0 },
    { id: 'seed-6', metrics: { success: true }, value: 100 },
  ],
};

// ── In-Memory / Local Storage Cache for Current Session ──
function getSessionRuns(conceptSlug) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(`nerdverse_runs_${conceptSlug}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessionRun(conceptSlug, run) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSessionRuns(conceptSlug);
    existing.push(run);
    sessionStorage.setItem(`nerdverse_runs_${conceptSlug}`, JSON.stringify(existing));
  } catch {
    // Ignore storage errors
  }
}

// ── Record Concept Run ──
export async function recordConceptRun(conceptSlug, runType = 'single', metrics = {}) {
  const timestamp = new Date().toISOString();
  let numericValue = 0;

  // Derive standardized primary metric value based on concept semantics
  if (conceptSlug === 'monty-hall') {
    numericValue = metrics.won ? 100 : 0;
  } else if (conceptSlug === 'st-petersburg-paradox') {
    numericValue = Number(metrics.payout || 2);
  } else if (conceptSlug === 'bayes-theorem') {
    numericValue = Number(metrics.posteriorPct || 1.94);
  } else if (conceptSlug === 'trolley-problem') {
    numericValue = metrics.choice === 'divert' ? 100 : 0;
  } else if (conceptSlug === 'murphys-law') {
    numericValue = metrics.landedButterDown ? 100 : 0;
  } else if (conceptSlug === 'schrodingers-cat') {
    numericValue = metrics.state === 'alive' ? 100 : 0;
  } else if (conceptSlug === 'maxwells-demon') {
    numericValue = Number(metrics.heatNanoJoules || 2.3);
  } else if (conceptSlug === 'fermi-paradox') {
    numericValue = Number(metrics.calculatedN || 52);
  } else if (conceptSlug === 'laplaces-demon') {
    numericValue = typeof metrics.determinismScore === 'number' ? metrics.determinismScore : 100;
  } else if (conceptSlug === 'ship-of-theseus') {
    numericValue = metrics.choice === 'shipA' ? 100 : metrics.choice === 'both' ? 50 : 0;
  } else {
    numericValue = typeof metrics.value === 'number' ? metrics.value : 50;
  }

  const localRun = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    concept_slug: conceptSlug,
    run_type: runType,
    metrics,
    value: numericValue,
    created_at: timestamp,
  };

  // 1. Save locally for immediate synchronous UI feedback
  saveSessionRun(conceptSlug, localRun);

  // 2. Dispatch custom event so any listening chart can update in real-time
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('concept_run_recorded', {
        detail: { conceptSlug, run: localRun },
      })
    );
  }

  // 3. Persist to Supabase if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('concept_runs').insert({
        concept_slug: conceptSlug,
        run_type: runType,
        metrics,
      });
      if (error) {
        console.warn('Supabase recordConceptRun error:', error.message);
      }
    } catch (err) {
      console.warn('Failed to insert concept run to Supabase:', err);
    }
  }

  return localRun;
}

// ── Fetch Telemetry & Statistics ──
export async function fetchConceptTelemetry(conceptSlug) {
  const config = SEED_TELEMETRY[conceptSlug] || DEFAULT_CONFIG;
  const sessionRuns = getSessionRuns(conceptSlug);
  const supabase = getSupabaseClient();

  let cloudRuns = [];
  let isFromSupabase = false;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('concept_runs')
        .select('id, run_type, metrics, created_at')
        .eq('concept_slug', conceptSlug)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data) && data.length > 0) {
        cloudRuns = data.map((item) => {
          let val = 0;
          if (conceptSlug === 'monty-hall') {
            val = item.metrics?.won ? 100 : 0;
          } else if (conceptSlug === 'st-petersburg-paradox') {
            val = Number(item.metrics?.payout || 2);
          } else if (conceptSlug === 'bayes-theorem') {
            val = Number(item.metrics?.posteriorPct || 1.94);
          } else if (conceptSlug === 'trolley-problem') {
            val = item.metrics?.choice === 'divert' ? 100 : 0;
          } else if (conceptSlug === 'murphys-law') {
            val = item.metrics?.landedButterDown ? 100 : 0;
          } else if (conceptSlug === 'schrodingers-cat') {
            val = item.metrics?.state === 'alive' ? 100 : 0;
          } else if (conceptSlug === 'maxwells-demon') {
            val = Number(item.metrics?.heatNanoJoules || 2.3);
          } else if (conceptSlug === 'fermi-paradox') {
            val = Number(item.metrics?.calculatedN || 52);
          } else if (conceptSlug === 'halting-problem') {
            val = item.metrics?.paradox ? 100 : (item.metrics?.halts ? 0 : 50);
          } else {
            val = Number(item.metrics?.value || 50);
          }
          return {
            id: item.id,
            metrics: item.metrics,
            value: val,
            created_at: item.created_at,
          };
        });
        isFromSupabase = true;
      }
    } catch (err) {
      console.warn('Could not fetch runs from Supabase, falling back:', err);
    }
  }

  // Combine data: Cloud runs (or seed baseline) + any brand new session runs
  const basePool = isFromSupabase ? cloudRuns : config.runs;
  const combined = [...basePool, ...sessionRuns];

  // Calculate Running Average Convergence Curve
  let cumulativeSum = 0;
  const convergencePoints = combined.map((run, index) => {
    cumulativeSum += run.value;
    const runningAvg = cumulativeSum / (index + 1);
    return {
      index: index + 1,
      runValue: run.value,
      runningAvg: Number(runningAvg.toFixed(2)),
      theoreticalTarget: config.theoreticalTarget,
      metrics: run.metrics,
    };
  });

  const totalRuns = combined.length;
  const empiricalAverage = totalRuns > 0
    ? Number((cumulativeSum / totalRuns).toFixed(2))
    : config.theoreticalTarget;

  const divergence = Number((empiricalAverage - config.theoreticalTarget).toFixed(2));

  // Generate Frequency Distribution Bins
  const distribution = computeDistribution(combined, conceptSlug);

  return {
    conceptSlug,
    label: config.label,
    unit: config.unit,
    theoreticalTarget: config.theoreticalTarget,
    totalRuns,
    empiricalAverage,
    divergence,
    convergencePoints,
    distribution,
    isLiveCloud: isFromSupabase,
    isSupabaseConfigured: isSupabaseConfigured(),
  };
}

function computeDistribution(runs, slug) {
  if (slug === 'st-petersburg-paradox') {
    // Payout bins: $2, $4, $8, $16, $32, $64+
    const counts = { '$2': 0, '$4': 0, '$8': 0, '$16': 0, '$32': 0, '$64+': 0 };
    runs.forEach((r) => {
      const p = r.value;
      if (p <= 2) counts['$2']++;
      else if (p <= 4) counts['$4']++;
      else if (p <= 8) counts['$8']++;
      else if (p <= 16) counts['$16']++;
      else if (p <= 32) counts['$32']++;
      else counts['$64+']++;
    });
    return Object.entries(counts).map(([bin, count]) => ({
      bin,
      count,
      pct: runs.length ? Number(((count / runs.length) * 100).toFixed(1)) : 0,
    }));
  }

  // Percentage/Probability Bins: 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
  const bins = [
    { bin: '0-20%', min: 0, max: 20, count: 0 },
    { bin: '20-40%', min: 20, max: 40, count: 0 },
    { bin: '40-60%', min: 40, max: 60, count: 0 },
    { bin: '60-80%', min: 60, max: 80, count: 0 },
    { bin: '80-100%', min: 80, max: 100.1, count: 0 },
  ];

  runs.forEach((r) => {
    const v = r.value;
    const matched = bins.find((b) => v >= b.min && v < b.max);
    if (matched) matched.count++;
  });

  return bins.map((b) => ({
    bin: b.bin,
    count: b.count,
    pct: runs.length ? Number(((b.count / runs.length) * 100).toFixed(1)) : 0,
  }));
}
