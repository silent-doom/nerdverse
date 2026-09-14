'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Community.module.css';
import Icon from '@/components/common/Icon';
import { CATEGORIES } from '@/lib/constants/categories';

export default function CommunityPage() {
  // Interactive RFC Builder State
  const [rfcTitle, setRfcTitle] = useState('');
  const [rfcCategory, setRfcCategory] = useState('physics');
  const [rfcParadox, setRfcParadox] = useState('');
  const [rfcFormula, setRfcFormula] = useState('');
  const [rfc3DIdea, setRfc3DIdea] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Formatted Markdown Output
  const generatedMarkdown = `### Concept RFC Proposal: ${rfcTitle || '[Concept Title]'}
**Domain**: ${CATEGORIES.find((c) => c.id === rfcCategory)?.name || rfcCategory}
**Proposed by**: @${authorHandle || 'anonymous'}

#### 1. The Core Paradox / Mind-Bender
${rfcParadox || 'Describe the counter-intuitive thought experiment, empirical conflict, or mathematical contradiction.'}

#### 2. Governing Equations / Theoretical Foundation
\`\`\`
${rfcFormula || 'E.g., Bayes theorem, Schrödinger equation, Lorenz attractor, or Turing transition table.'}
\`\`\`

#### 3. 3D Thought Experiment Visualization Idea
${rfc3DIdea || 'Describe the interactive physical apparatus (e.g., balance scale, astrolabe, track, particle chamber) and what variables the user can manipulate.'}

#### 4. Historical Reference & Literature
- Primary Source: [Author, Year, Paper Title]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleOpenGitHub = () => {
    const issueTitle = encodeURIComponent(`[Concept RFC]: ${rfcTitle || 'New Concept Proposal'}`);
    const issueBody = encodeURIComponent(generatedMarkdown);
    window.open(`https://github.com/silent-doom/nerdverse/issues/new?title=${issueTitle}&body=${issueBody}`, '_blank');
  };

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <header className={styles.header}>
        <div className={styles.badge}>
          <Icon name="atom" size={14} />
          <span>Open Science &amp; Peer Contribution</span>
        </div>
        <h1 className={styles.title}>Community &amp; Contribution Hub</h1>
        <p className={styles.subtitle}>
          NerdVerse is an open-source commons dedicated to decoding the universe&apos;s deepest ideas.
          Discover how to propose new thought experiments, build 3D interactive laboratories, and collaborate with researchers.
        </p>
      </header>

      {/* Jump Navigation Bar */}
      <nav className={styles.navBar} aria-label="Community Sections">
        <a href="#rfc-builder" className={styles.navPill}>
          <Icon name="zap" size={14} />
          <span>RFC Proposal Builder</span>
        </a>
        <a href="#methods" className={styles.navPill}>
          <Icon name="layers" size={14} />
          <span>Contribution Methods</span>
        </a>
        <a href="#discussions" className={styles.navPill}>
          <Icon name="message" size={14} />
          <span>Discussions</span>
        </a>
        <a href="#contributors" className={styles.navPill}>
          <Icon name="users" size={14} />
          <span>Contributors</span>
        </a>
        <a href="#guidelines" className={styles.navPill}>
          <Icon name="check" size={14} />
          <span>Rigor Guidelines</span>
        </a>
      </nav>

      {/* ── 1. Interactive Concept RFC Builder ── */}
      <section id="rfc-builder" className={styles.builderSection}>
        <h2 className={styles.sectionHeading}>
          <Icon name="zap" size={20} color="#38bdf8" />
          <span>Propose a New Thought Experiment (RFC Builder)</span>
        </h2>
        <p className={styles.sectionDesc}>
          Have an idea for a profound scientific paradox, economic dilemma, or mathematical proof?
          Draft your proposal below to generate an official formatted GitHub Request for Comments (RFC).
        </p>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Concept / Thought Experiment Title</label>
            <input
              type="text"
              placeholder="e.g. Levinthal's Paradox, Red Queen Hypothesis, Arrow's Impossibility"
              value={rfcTitle}
              onChange={(e) => setRfcTitle(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Intellectual Discipline</label>
            <select
              value={rfcCategory}
              onChange={(e) => setRfcCategory(e.target.value)}
              className={styles.select}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>The Core Paradox / Mind-Bender</label>
            <textarea
              placeholder="Explain the counter-intuitive friction or dilemma. What makes this thought experiment profound?"
              value={rfcParadox}
              onChange={(e) => setRfcParadox(e.target.value)}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mathematical / Theoretical Formalism</label>
            <input
              type="text"
              placeholder="e.g. H(X) = -Σ p(x) log p(x), Δx Δp ≥ ℏ/2"
              value={rfcFormula}
              onChange={(e) => setRfcFormula(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Your GitHub / Author Handle</label>
            <input
              type="text"
              placeholder="e.g. richard_feynman"
              value={authorHandle}
              onChange={(e) => setAuthorHandle(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Proposed 3D Visualization / Physical Apparatus</label>
            <textarea
              placeholder="What 3D apparatus should be modeled (e.g. in Blender / Three.js)? What sliders, buttons, or lenses should users manipulate?"
              value={rfc3DIdea}
              onChange={(e) => setRfc3DIdea(e.target.value)}
              className={styles.textarea}
            />
          </div>
        </div>

        <div className={styles.builderActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setShowPreview((p) => !p)}
          >
            <Icon name="eye" size={14} />
            <span>{showPreview ? 'Hide Preview' : 'Preview RFC Markdown'}</span>
          </button>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleCopy}
          >
            <Icon name="clipboard" size={14} />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
          </button>

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleOpenGitHub}
          >
            <Icon name="external-link" size={14} />
            <span>Submit RFC on GitHub Issues</span>
          </button>
        </div>

        {showPreview && (
          <div className={styles.previewBox}>
            <pre className={styles.previewCode}>{generatedMarkdown}</pre>
          </div>
        )}
      </section>

      {/* ── 2. The 5-Pillar NerdVerse Contribution Methods ── */}
      <section id="methods" className={styles.pillarsSection}>
        <h2 className={styles.sectionHeading}>
          <Icon name="layers" size={20} color="#f59e0b" />
          <span>Recommended Methods for Contributing</span>
        </h2>
        <p className={styles.sectionDesc}>
          To maintain world-class pedagogical, mathematical, and aesthetic fidelity, all contributions follow our 5-pillar open framework:
        </p>

        <div className={styles.pillarsGrid}>
          <div className={styles.pillarCard}>
            <div className={styles.pillarHeader}>
              <div className={styles.pillarIcon}>
                <Icon name="cube" size={18} />
              </div>
              <h3 className={styles.pillarTitle}>1. 3D Thought Experiment Blueprint</h3>
            </div>
            <p className={styles.pillarText}>
              Build tangible apparatus using Three.js and Blender MCP. Every simulation must feature real physical analogies (levers, particle chambers, tracks, scales, reels) rather than abstract 2D graphs.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarHeader}>
              <div className={styles.pillarIcon}>
                <Icon name="book-open" size={18} />
              </div>
              <h3 className={styles.pillarTitle}>2. 4-Stage Epistemic Narrative</h3>
            </div>
            <p className={styles.pillarText}>
              Write deep, humanized accounts following our 4-act narrative structure: (1) Historical Laboratory Origin, (2) Mathematical Proof, (3) The Paradox Dilemma, and (4) Consequence Calculus.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarHeader}>
              <div className={styles.pillarIcon}>
                <Icon name="activity" size={18} />
              </div>
              <h3 className={styles.pillarTitle}>3. Crowd Telemetry Benchmarks</h3>
            </div>
            <p className={styles.pillarText}>
              Plug each simulation into Supabase <code>concept_runs</code>. Record user choices and parameters so visitors can compare their results against theoretical predictions and global peer telemetry.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarHeader}>
              <div className={styles.pillarIcon}>
                <Icon name="git-pull-request" size={18} />
              </div>
              <h3 className={styles.pillarTitle}>4. Curated Bounties &amp; RFCs</h3>
            </div>
            <p className={styles.pillarText}>
              Browse our GitHub issues tagged <code>concept-rfc</code>, <code>3d-lab-needed</code>, or <code>good-first-issue</code>. Propose architectural enhancements before writing substantial PR diffs.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarHeader}>
              <div className={styles.pillarIcon}>
                <Icon name="shield-check" size={18} />
              </div>
              <h3 className={styles.pillarTitle}>5. 100% Quality Gates</h3>
            </div>
            <p className={styles.pillarText}>
              All contributions require Vitest unit tests verifying state transitions, mode switches, and telemetry hooks. Builds must pass cleanly with zero lint or hydration warnings.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarHeader}>
              <div className={styles.pillarIcon}>
                <Icon name="network" size={18} />
              </div>
              <h3 className={styles.pillarTitle}>6. Knowledge Graph Integration</h3>
            </div>
            <p className={styles.pillarText}>
              Every new concept must be added to <code>knowledgeGraphData.js</code> with 3D Euclidean coordinates, domain cluster assignment, epistemic utility vectors, and semantic similarity links.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Discussions Channels ── */}
      <section id="discussions" className={styles.discussionsSection}>
        <h2 className={styles.sectionHeading}>
          <Icon name="message" size={20} color="#a855f7" />
          <span>Active Community Discussions</span>
        </h2>
        <p className={styles.sectionDesc}>
          Join deep debates, suggest paradox variants, and discuss theoretical physics and philosophy:
        </p>

        <div className={styles.channelsGrid}>
          <a
            href="https://github.com/silent-doom/nerdverse/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.channelCard}
          >
            <div className={styles.channelTitle}>
              <span>Quantum &amp; Astrophysics</span>
              <Icon name="external-link" size={13} color="#38bdf8" />
            </div>
            <p className={styles.channelDesc}>
              Interpretations of quantum mechanics (Many-Worlds vs Copenhagen), Fermi Paradox solutions, and relativity.
            </p>
          </a>

          <a
            href="https://github.com/silent-doom/nerdverse/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.channelCard}
          >
            <div className={styles.channelTitle}>
              <span>Game Theory &amp; Systems</span>
              <Icon name="external-link" size={13} color="#38bdf8" />
            </div>
            <p className={styles.channelDesc}>
              Iterated Prisoner&apos;s Dilemma strategies, Braess network routing, and collective governance of the commons.
            </p>
          </a>

          <a
            href="https://github.com/silent-doom/nerdverse/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.channelCard}
          >
            <div className={styles.channelTitle}>
              <span>Philosophy of Mind &amp; AI</span>
              <Icon name="external-link" size={13} color="#38bdf8" />
            </div>
            <p className={styles.channelDesc}>
              Searle&apos;s Chinese Room, personal identity (Theseus), computational undecidability, and consciousness.
            </p>
          </a>

          <a
            href="https://github.com/silent-doom/nerdverse/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.channelCard}
          >
            <div className={styles.channelTitle}>
              <span>3D Simulation Labs &amp; Blender</span>
              <Icon name="external-link" size={13} color="#38bdf8" />
            </div>
            <p className={styles.channelDesc}>
              Blender MCP pipelines, GLTF procedural shaders, Three.js performance tuning, and camera ergonomics.
            </p>
          </a>
        </div>
      </section>

      {/* ── 4. Contributors Hall of Fame ── */}
      <section id="contributors" className={styles.discussionsSection}>
        <h2 className={styles.sectionHeading}>
          <Icon name="users" size={20} color="#10b981" />
          <span>Contributors &amp; Scientific Curators</span>
        </h2>
        <p className={styles.sectionDesc}>
          Recognizing the open-source contributors, reviewers, and scientific modelers who craft NerdVerse:
        </p>

        <div className={styles.channelsGrid}>
          <div className={styles.channelCard}>
            <div className={styles.channelTitle}>
              <span>Faizan Choudhary</span>
              <span style={{ fontSize: '11px', color: '#38bdf8' }}>Core Maintainer</span>
            </div>
            <p className={styles.channelDesc}>
              Lead architect, 3D laboratory engineering, Blender MCP modeling, and knowledge graph engine.
            </p>
          </div>

          <div className={styles.channelCard}>
            <div className={styles.channelTitle}>
              <span>The Open Source Community</span>
              <span style={{ fontSize: '11px', color: '#34d399' }}>Global Peers</span>
            </div>
            <p className={styles.channelDesc}>
              Curating peer-reviewed sources, proposing mathematical paradoxes, and validating telemetry bounds.
            </p>
          </div>

          <a
            href="https://github.com/silent-doom/nerdverse/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.channelCard}
          >
            <div className={styles.channelTitle}>
              <span>Join as a Contributor</span>
              <Icon name="external-link" size={13} color="#38bdf8" />
            </div>
            <p className={styles.channelDesc}>
              Submit an RFC, fix an issue, or create a 3D visualization. Your GitHub profile will be featured here!
            </p>
          </a>
        </div>
      </section>

      {/* ── 5. Rigor Guidelines ── */}
      <section id="guidelines" className={styles.guidelinesSection}>
        <h2 className={styles.sectionHeading}>
          <Icon name="check" size={20} color="#34d399" />
          <span>Scientific Rigor &amp; Peer Review Standards</span>
        </h2>
        <p className={styles.sectionDesc}>
          To maintain scholarly authority, all submissions must adhere to our peer review criteria:
        </p>

        <ul className={styles.guidelinesList}>
          <li className={styles.guidelinesItem}>
            <span className={styles.checkIcon}>✔</span>
            <span>
              <strong>Primary Source Grounding:</strong> Cite original historical papers (e.g. Turing 1936, Festinger 1959, Laplace 1814, Bernoulli 1738) with verifiable links or DOIs.
            </span>
          </li>
          <li className={styles.guidelinesItem}>
            <span className={styles.checkIcon}>✔</span>
            <span>
              <strong>Mathematical Fidelity:</strong> Equations must be accurate and rendered in LaTeX or standard mathematical notation with defined variable bounds.
            </span>
          </li>
          <li className={styles.guidelinesItem}>
            <span className={styles.checkIcon}>✔</span>
            <span>
              <strong>Physical Realism in 3D:</strong> Avoid simplistic 2D toy widgets; utilize genuine mechanical, optical, or kinematic apparatus modeled to scale.
            </span>
          </li>
          <li className={styles.guidelinesItem}>
            <span className={styles.checkIcon}>✔</span>
            <span>
              <strong>Pedagogical Neutrality:</strong> Clearly present all competing schools of thought (e.g. Many-Worlds vs Copenhagen; Hobbes vs Aristotle; Strong AI vs Searle).
            </span>
          </li>
          <li className={styles.guidelinesItem}>
            <span className={styles.checkIcon}>✔</span>
            <span>
              <strong>Consequence Calculus:</strong> Explain why the concept matters to civilization, engineering safety, modern AI, or personal decision-making.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
