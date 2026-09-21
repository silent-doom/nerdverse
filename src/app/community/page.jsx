'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Community.module.css';
import Icon from '@/components/common/Icon';
import { CATEGORIES } from '@/lib/constants/categories';

export default function CommunityPage() {
  const [activeWorkspace, setActiveWorkspace] = useState('issue'); // 'issue' | 'rfc'


  // ── 1. Interactive Issue Desk State ──
  const [issueTitle, setIssueTitle] = useState('');
  const [issueCategory, setIssueCategory] = useState('math-notation');
  const [issuePage, setIssuePage] = useState('/concepts/pi-collisions');
  const [customPageUrl, setCustomPageUrl] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueSteps, setIssueSteps] = useState('1. Navigate to /concepts/pi-collisions\n2. Scroll down to "The Revolution of π: The Universal Nexus"\n3. Observe the formula notation');
  const [issueExpected, setIssueExpected] = useState('Equations and symbols like π, √, Δ, and e^(iπ) should render as formatted mathematical formulas.');
  const [issueObserved, setIssueObserved] = useState('Formula symbols are displaying as raw text or LaTeX markup.');
  const [issueAuthor, setIssueAuthor] = useState('');
  const [issueEnv, setIssueEnv] = useState('macOS / Chrome Browser');
  const [showIssuePreview, setShowIssuePreview] = useState(false);
  const [issueCopied, setIssueCopied] = useState(false);

  // Formatted Issue Markdown Output
  const resolvedPage = issuePage === 'custom' ? (customPageUrl || 'Custom Page') : issuePage;
  const categoryLabels = {
    'math-notation': '📐 Math / Formula Notation Error',
    'bug': '🐛 Bug / Functional Defect',
    '3d-lab': '⚡ 3D Lab / Simulation Glitch',
    'content': '📖 Content Typo / Inaccuracy',
    'enhancement': '🚀 Feature Request / Enhancement',
  };

  const generatedIssueMarkdown = `### [${categoryLabels[issueCategory] || issueCategory}]: ${issueTitle || 'Issue Summary'}

**Target Page / Component**: \`${resolvedPage}\`
**Category**: ${categoryLabels[issueCategory] || issueCategory}
**Reported by**: @${issueAuthor || 'community-contributor'}

#### 1. Description of the Issue
${issueDesc || 'Describe the bug, formula rendering error, 3D simulation glitch, or visual defect.'}

#### 2. Steps to Reproduce
${issueSteps || '1. Go to page\n2. Perform action\n3. Observe problem'}

#### 3. Expected Behavior
${issueExpected || 'What should have happened or how the formula should be rendered.'}

#### 4. Observed Behavior
${issueObserved || 'What actually occurred or what incorrect text was displayed.'}

#### 5. Environment & System Details
- **Environment**: ${issueEnv || 'Web Browser'}
- **Platform**: NerdVerse Web Client
- **Timestamp**: ${new Date().toISOString()}`;

  const handleCopyIssue = () => {
    navigator.clipboard.writeText(generatedIssueMarkdown);
    setIssueCopied(true);
    setTimeout(() => setIssueCopied(false), 2400);
  };

  const handleOpenGitHubIssue = () => {
    const titleParam = encodeURIComponent(`[${issueCategory}]: ${issueTitle || 'Issue Report on ' + resolvedPage}`);
    const bodyParam = encodeURIComponent(generatedIssueMarkdown);
    const labelParam = encodeURIComponent(issueCategory);
    window.open(`https://github.com/silent-doom/nerdverse/issues/new?title=${titleParam}&body=${bodyParam}&labels=${labelParam}`, '_blank');
  };

  // ── 2. Interactive RFC Builder State ──
  const [rfcTitle, setRfcTitle] = useState('');
  const [rfcCategory, setRfcCategory] = useState('physics');
  const [rfcParadox, setRfcParadox] = useState('');
  const [rfcFormula, setRfcFormula] = useState('');
  const [rfc3DIdea, setRfc3DIdea] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [showRfcPreview, setShowRfcPreview] = useState(false);
  const [rfcCopied, setRfcCopied] = useState(false);

  // Formatted RFC Markdown Output
  const generatedRfcMarkdown = `### Concept RFC Proposal: ${rfcTitle || '[Concept Title]'}
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

  const handleCopyRfc = () => {
    navigator.clipboard.writeText(generatedRfcMarkdown);
    setRfcCopied(true);
    setTimeout(() => setRfcCopied(false), 2400);
  };

  const handleOpenGitHubRfc = () => {
    const issueTitle = encodeURIComponent(`[Concept RFC]: ${rfcTitle || 'New Concept Proposal'}`);
    const issueBody = encodeURIComponent(generatedRfcMarkdown);
    window.open(`https://github.com/silent-doom/nerdverse/issues/new?title=${issueTitle}&body=${issueBody}&labels=concept-rfc`, '_blank');
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
          Report notation issues and bugs, propose new thought experiments, and collaborate on 3D interactive laboratories.
        </p>
      </header>

      {/* Jump Navigation Bar */}
      <nav className={styles.navBar} aria-label="Community Sections">
        <a href="#workspace" className={styles.navPill} onClick={() => setActiveWorkspace('issue')}>
          <Icon name="zap" size={14} />
          <span>Issue &amp; Bug Desk</span>
        </a>
        <a href="#workspace" className={styles.navPill} onClick={() => setActiveWorkspace('rfc')}>
          <Icon name="atom" size={14} />
          <span>Concept RFC Builder</span>
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

      {/* ── Interactive Workspace (Issue Desk vs RFC Builder) ── */}
      <div id="workspace" className={styles.workspaceTabs} role="tablist">
        <button
          type="button"
          className={`${styles.workspaceTabBtn} ${activeWorkspace === 'issue' ? styles.workspaceTabBtnActiveAmber : ''}`}
          onClick={() => setActiveWorkspace('issue')}
          role="tab"
          aria-selected={activeWorkspace === 'issue'}
        >
          <Icon name="zap" size={16} />
          <span>Report an Issue / Notation Bug</span>
        </button>
        <button
          type="button"
          className={`${styles.workspaceTabBtn} ${activeWorkspace === 'rfc' ? styles.workspaceTabBtnActive : ''}`}
          onClick={() => setActiveWorkspace('rfc')}
          role="tab"
          aria-selected={activeWorkspace === 'rfc'}
        >
          <Icon name="atom" size={16} />
          <span>Propose New Concept (RFC Builder)</span>
        </button>
      </div>

      {/* ── 1. Interactive Issue & Bug Desk ── */}
      {activeWorkspace === 'issue' && (
        <section id="issue-reporter" className={`${styles.builderSection} ${styles.builderSectionAmber}`}>
          <h2 className={styles.sectionHeading}>
            <Icon name="zap" size={20} color="#f59e0b" />
            <span>NerdVerse Issue Desk: Raise a GitHub Issue</span>
          </h2>
          <p className={styles.sectionDesc}>
            Spotted a mathematical formula typo, raw LaTeX leakage, 3D simulation glitch, or broken animation?
            Fill out the structured template below to open a pre-formatted GitHub issue directly in our repository.
          </p>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Issue Category</label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                className={styles.select}
                data-testid="issue-category-select"
              >
                <option value="math-notation">📐 Mathematical / Formula Notation Error</option>
                <option value="bug">🐛 Bug / Functional Defect</option>
                <option value="3d-lab">⚡ 3D Lab / Simulation Glitch</option>
                <option value="content">📖 Content Typo / Inaccuracy</option>
                <option value="enhancement">🚀 Feature Request / Enhancement</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Target Page / Component</label>
              <select
                value={issuePage}
                onChange={(e) => setIssuePage(e.target.value)}
                className={styles.select}
                data-testid="issue-page-select"
              >
                <option value="/concepts/pi-collisions">/concepts/pi-collisions (Galperin's Pi Collisions)</option>
                <option value="/concepts/eulers-number">/concepts/eulers-number (Euler's Number)</option>
                <option value="/concepts/murphys-law">/concepts/murphys-law (Murphy's Law)</option>
                <option value="/concepts/schrodingers-cat">/concepts/schrodingers-cat (Schrödinger's Cat)</option>
                <option value="/concepts/simpsons-paradox">/concepts/simpsons-paradox (Simpson's Paradox)</option>
                <option value="/concepts/monty-hall-problem">/concepts/monty-hall-problem (Monty Hall)</option>
                <option value="/concepts/prisoners-dilemma">/concepts/prisoners-dilemma (Prisoner's Dilemma)</option>
                <option value="/explore">/explore (3D Knowledge Graph)</option>
                <option value="/about">/about (About Page)</option>
                <option value="/community">/community (Community Hub)</option>
                <option value="custom">Custom Page / URL...</option>
              </select>
            </div>

            {issuePage === 'custom' && (
              <div className={styles.formGroupFull}>
                <label className={styles.label}>Custom Page URL or Path</label>
                <input
                  type="text"
                  placeholder="e.g. /concepts/your-concept or specific section"
                  value={customPageUrl}
                  onChange={(e) => setCustomPageUrl(e.target.value)}
                  className={styles.input}
                />
              </div>
            )}

            <div className={styles.formGroupFull}>
              <label className={styles.label}>Issue Title / Summary</label>
              <input
                type="text"
                placeholder="e.g. Formula Error: \pi displayed as raw text in heading on pi-collisions"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                className={styles.input}
                data-testid="issue-title-input"
              />
            </div>

            <div className={styles.formGroupFull}>
              <label className={styles.label}>1. Detailed Description of the Issue</label>
              <textarea
                placeholder="Describe what went wrong, which formula is broken, or what simulation bug you encountered."
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
                className={styles.textarea}
              />
            </div>

            <div className={styles.formGroupFull}>
              <label className={styles.label}>2. Steps to Reproduce (if any)</label>
              <textarea
                placeholder="1. Go to page&#10;2. Scroll to section&#10;3. Observe problem"
                value={issueSteps}
                onChange={(e) => setIssueSteps(e.target.value)}
                className={styles.textarea}
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>3. Expected Behavior</label>
              <textarea
                placeholder="e.g. Equations and symbols should render as formatted mathematical formulas."
                value={issueExpected}
                onChange={(e) => setIssueExpected(e.target.value)}
                className={styles.textarea}
                rows={2}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>4. Observed Behavior</label>
              <textarea
                placeholder="e.g. Raw LaTeX text like \pi or \sqrt{L/g} is visible."
                value={issueObserved}
                onChange={(e) => setIssueObserved(e.target.value)}
                className={styles.textarea}
                rows={2}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Your GitHub Handle (Optional)</label>
              <input
                type="text"
                placeholder="e.g. your_github_username"
                value={issueAuthor}
                onChange={(e) => setIssueAuthor(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Device / Environment</label>
              <input
                type="text"
                placeholder="e.g. macOS / Chrome / 1470x802"
                value={issueEnv}
                onChange={(e) => setIssueEnv(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.builderActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setShowIssuePreview((p) => !p)}
            >
              <Icon name="eye" size={14} />
              <span>{showIssuePreview ? 'Hide Preview' : 'Preview Issue Markdown'}</span>
            </button>

            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleCopyIssue}
              data-testid="copy-issue-btn"
            >
              <Icon name="clipboard" size={14} />
              <span>{issueCopied ? 'Copied to Clipboard!' : 'Copy Template'}</span>
            </button>

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleOpenGitHubIssue}
              data-testid="submit-github-issue-btn"
            >
              <Icon name="external-link" size={14} />
              <span>Submit Issue on GitHub</span>
            </button>
          </div>

          {showIssuePreview && (
            <div className={styles.previewBox}>
              <pre className={styles.previewCode}>{generatedIssueMarkdown}</pre>
            </div>
          )}
        </section>
      )}

      {/* ── 2. Interactive Concept RFC Builder ── */}
      {activeWorkspace === 'rfc' && (
        <section id="rfc-builder" className={styles.builderSection}>
          <h2 className={styles.sectionHeading}>
            <Icon name="atom" size={20} color="#38bdf8" />
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
              onClick={() => setShowRfcPreview((p) => !p)}
            >
              <Icon name="eye" size={14} />
              <span>{showRfcPreview ? 'Hide Preview' : 'Preview RFC Markdown'}</span>
            </button>

            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleCopyRfc}
            >
              <Icon name="clipboard" size={14} />
              <span>{rfcCopied ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
            </button>

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleOpenGitHubRfc}
            >
              <Icon name="external-link" size={14} />
              <span>Submit RFC on GitHub Issues</span>
            </button>
          </div>

          {showRfcPreview && (
            <div className={styles.previewBox}>
              <pre className={styles.previewCode}>{generatedRfcMarkdown}</pre>
            </div>
          )}
        </section>
      )}


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
