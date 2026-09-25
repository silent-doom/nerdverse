'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ConceptSimulatorResolver from '@/components/interactive/ConceptSimulatorResolver';
import ConceptTelemetryChart from '@/components/analytics/ConceptTelemetryChart';
import Badge from '@/components/ui/Badge/Badge';
import Card from '@/components/ui/Card/Card';
import Icon from '@/components/common/Icon';
import styles from './ConceptDetail.module.css';
import { renderMathInMarkdown, cleanDisplayFormula } from '@/lib/mathRenderer';

function parseContentBlocks(raw) {
  if (!raw) return [];
  const normalized = raw
    .replace(/\r\n/g, '\n')
    .replace(/(^|\n)(#{1,4}\s+[^\n]+)/g, '$1\n\n$2\n\n')
    .replace(/(^|\n)(>[^\n]+(\n>[^\n]+)*)/g, '$1\n\n$2\n\n')
    .replace(/(\$\$[\s\S]*?\$\$)/g, '\n\n$1\n\n')
    .replace(/([^\n])\n([-\*]\s+[^\n]+)/g, '$1\n\n$2') // Ensure list after sentence becomes separate block
    .replace(/([-\*]\s+[^\n]+)\n([^\n-\*#>\$])/g, '$1\n\n$2') // Ensure paragraph after list becomes separate block
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return normalized.split('\n\n').map((b) => b.trim()).filter(Boolean);
}


export default function ConceptDetailClient({ concept, category, relatedConcepts }) {
  const [activeTab, setActiveTab] = useState('narrative'); // 'narrative' | 'math' | 'telemetry' | 'citations'
  const [selectedChallenge, setSelectedChallenge] = useState(0);

  const blocks = parseContentBlocks(concept.content);
  const mathBlocks = blocks.filter(
    (b) => b.includes('$$') || b.includes('`') || b.startsWith('### The Mathematics') || b.includes('Formula') || b.includes('Probability')
  );
  const narrativeBlocks = blocks.filter(
    (b) => !(b.startsWith('$$') && b.endsWith('$$'))
  );

  const challenges = concept.challenges || [];

  return (
    <article className={styles.detailPage}>
      {/* Top Header / Breadcrumbs */}
      <header className={styles.header}>
        <div className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href="/concepts" className={styles.breadcrumbLink}>Concepts</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{concept.title}</span>
        </div>

        <div className={styles.metaRow}>
          <Badge variant="category" category={concept.category} size="md">
            {category?.name || concept.category}
          </Badge>
          <Badge variant="difficulty" difficulty={concept.difficulty} size="md" />
          <div className={styles.readTime}>
            <Icon name="clock" size={13} />
            <span>{concept.readTime} min activity</span>
          </div>
          <Link
            href={`/explore?node=${concept.slug}`}
            className={styles.graphNodeBadge}
            title={`Inspect ${concept.title} in the 3D Knowledge Graph`}
          >
            <Icon name="network" size={13} />
            <span>Knowledge Node #{concept.id}</span>
          </Link>
        </div>

        <h1 className={styles.title}>{concept.title}</h1>
        <p className={styles.summary} dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(concept.summary) }} />
      </header>

      {/* ── TIER 1: The 30-Second Hook (Above the Fold) ── */}
      {concept.hook && (
        <section className={styles.hookCard}>
          <div className={styles.hookHeader}>
            <div className={styles.hookHeaderTitle}>
              <Icon name="zap" size={16} />
              <span>The 30-Second Paradox at a Glance</span>
            </div>
            <span className={styles.hookBadge}>Instant Aha! Moment</span>
          </div>

          <div className={styles.hookGrid}>
            <div className={styles.hookCol}>
              <div className={styles.hookColHeader}>
                <Icon name="zap" size={16} color="#eab308" />
                <span className={styles.hookColTitle}>The Premise</span>
              </div>
              <p className={styles.hookColBody} dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(concept.hook.premise) }} />
            </div>

            <div className={styles.hookCol}>
              <div className={styles.hookColHeader}>
                <Icon name="brain" size={16} color="#38bdf8" />
                <span className={styles.hookColTitle}>Common Intuition</span>
              </div>
              <p className={styles.hookColBody} dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(concept.hook.intuition) }} />
            </div>

            <div className={`${styles.hookCol} ${styles.hookColHighlight}`}>
              <div className={styles.hookColHeader}>
                <Icon name="sparkles" size={16} color="#f59e0b" />
                <span className={styles.hookColTitle}>The Mind-Bending Twist</span>
              </div>
              <p className={styles.hookColBody} dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(concept.hook.twist) }} />
            </div>
          </div>

          {concept.takeaway && (
            <div className={styles.takeawayBanner}>
              <span className={styles.takeawayLabel}>
                <Icon name="lightbulb" size={15} color="#fef08a" />
                <span>Core Mental Model:</span>
              </span>
              <span className={styles.takeawayText} dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(concept.takeaway) }} />
            </div>
          )}
        </section>
      )}

      {/* ── TIER 2: Guided Challenge Bar & Interactive Lab ── */}
      {concept.interactiveType && (
        <section className={styles.labSection}>
          {challenges.length > 0 && (
            <div className={styles.challengeBar}>
              <div className={styles.challengeBarTop}>
                <div className={styles.challengeBarTitle}>
                  <Icon name="compass" size={15} />
                  <span>Guided Lab Scenarios: What are you testing?</span>
                </div>
                <div className={styles.challengePills}>
                  {challenges.map((c, idx) => (
                    <button
                      key={c.id || idx}
                      type="button"
                      className={`${styles.challengePillBtn} ${selectedChallenge === idx ? styles.challengePillActive : ''}`}
                      onClick={() => setSelectedChallenge(idx)}
                    >
                      <span>{c.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {challenges[selectedChallenge] && (
                <div className={styles.challengePromptBox}>
                  <div className={styles.challengePrompt}>
                    <strong>Goal:</strong> <span dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(challenges[selectedChallenge].prompt) }} />
                  </div>
                  {challenges[selectedChallenge].actionLabel && (
                    <div className={styles.challengeActionHint}>
                      <Icon name="arrow-right" size={12} />
                      <span>Suggested Action: <code>{challenges[selectedChallenge].actionLabel}</code> in the lab below</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={styles.simulatorWrapper}>
            <ConceptSimulatorResolver type={concept.interactiveType} concept={concept} />
          </div>
        </section>
      )}

      {/* ── TIER 3: Progressive Disclosure Deep Dive (Tabs) ── */}
      <section className={styles.deepDiveSection}>
        <div className={styles.deepDiveTabs} role="tablist">
          <button
            type="button"
            className={`${styles.deepTabBtn} ${activeTab === 'narrative' ? styles.deepTabBtnActive : ''}`}
            onClick={() => setActiveTab('narrative')}
            role="tab"
            aria-selected={activeTab === 'narrative'}
          >
            <Icon name="brain" size={15} />
            <span>1. Story & Human Context</span>
          </button>
          <button
            type="button"
            className={`${styles.deepTabBtn} ${activeTab === 'math' ? styles.deepTabBtnActive : ''}`}
            onClick={() => setActiveTab('math')}
            role="tab"
            aria-selected={activeTab === 'math'}
          >
            <Icon name="math" size={15} />
            <span>2. Formal Math & Logic</span>
          </button>
          <button
            type="button"
            className={`${styles.deepTabBtn} ${activeTab === 'telemetry' ? styles.deepTabBtnActive : ''}`}
            onClick={() => setActiveTab('telemetry')}
            role="tab"
            aria-selected={activeTab === 'telemetry'}
          >
            <Icon name="chart" size={15} />
            <span>3. Telemetry & Live Runs</span>
          </button>
          <button
            type="button"
            className={`${styles.deepTabBtn} ${activeTab === 'citations' ? styles.deepTabBtnActive : ''}`}
            onClick={() => setActiveTab('citations')}
            role="tab"
            aria-selected={activeTab === 'citations'}
          >
            <Icon name="compass" size={15} />
            <span>4. Facts & Citations</span>
          </button>
        </div>

        <div className={styles.deepDivePane}>
          {/* Tab 1: Narrative & Context */}
          {activeTab === 'narrative' && (
            <div className={styles.prose}>
              {narrativeBlocks.map((block, idx) => {
                if (block.startsWith('## ')) {
                  return (
                    <h2
                      key={idx}
                      className={styles.h2}
                      dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(block.replace(/^##\s+/, '')) }}
                    />
                  );
                }
                if (block.startsWith('### ')) {
                  return (
                    <h3
                      key={idx}
                      className={styles.h3}
                      dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(block.replace(/^###\s+/, '')) }}
                    />
                  );
                }
                if (block.startsWith('>')) {
                  return (
                    <blockquote key={idx} className={styles.blockquote}>
                      <p dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(block.replace(/^>\s*/gm, '')) }} />
                    </blockquote>
                  );
                }
                if (block.startsWith('```')) {
                  const lines = block.split('\n');
                  const code = lines.slice(1, -1).join('\n');
                  return (
                    <pre key={idx} className={styles.codeBlock}>
                      <code>{code}</code>
                    </pre>
                  );
                }
                if (block.startsWith('- ')) {
                  const items = block.split('\n').map((line) => line.replace(/^[-\*]\s+/, ''));
                  return (
                    <ul key={idx} className={styles.list}>
                      {items.map((item, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(item) }} />
                      ))}
                    </ul>
                  );
                }
                return (
                  <p
                    key={idx}
                    className={styles.paragraph}
                    dangerouslySetInnerHTML={{
                      __html: renderMathInMarkdown(block),
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Tab 2: Formal Math & Logic */}
          {activeTab === 'math' && (
            <div className={styles.prose}>
              <div className={styles.mathIntroBox}>
                <Icon name="math" size={16} />
                <span>Formal proofs, mathematical formulations, and quantitative derivations.</span>
              </div>

              {mathBlocks.length === 0 ? (
                <p className={styles.paragraph}>
                  This thought experiment relies primarily on qualitative philosophical and conceptual logic rather than formal symbolic mathematics.
                </p>
              ) : (
                mathBlocks.map((block, idx) => {
                  if (block.startsWith('## ') || block.startsWith('### ')) {
                    return (
                      <h3
                        key={idx}
                        className={styles.h3}
                        dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(block.replace(/^#{2,3}\s+/, '')) }}
                      />
                    );
                  }
                  if (block.startsWith('$$') && block.endsWith('$$')) {
                    return (
                      <div
                        key={idx}
                        className={styles.formulaBlock}
                        dangerouslySetInnerHTML={{ __html: cleanDisplayFormula(block) }}
                      />
                    );
                  }
                  return (
                    <p
                      key={idx}
                      className={styles.paragraph}
                      dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(block) }}
                    />
                  );
                })
              )}
            </div>
          )}

          {/* Tab 3: Telemetry & Live Runs */}
          {activeTab === 'telemetry' && (
            <div className={styles.telemetryTabWrapper}>
              <div className={styles.telemetryIntro}>
                <h3 className={styles.telemetryTitle}>Live Statistical Telemetry & Historical Convergence</h3>
                <p className={styles.telemetrySub}>
                  Every interaction you test in the simulator above records an empirical data point. Here is how your session converges toward theoretical limits.
                </p>
              </div>
              <ConceptTelemetryChart conceptSlug={concept.slug} conceptTitle={concept.title} />
            </div>
          )}

          {/* Tab 4: Facts & Citations */}
          {activeTab === 'citations' && (
            <div className={styles.citationsGrid}>
              {concept.facts && concept.facts.length > 0 && (
                <Card variant="outline" className={styles.sidebarCard}>
                  <div className={styles.sidebarHeader}>
                    <Icon name="zap" size={16} color="var(--color-category-philosophy)" />
                    <h3 className={styles.sidebarTitle}>Key Empirical Facts</h3>
                  </div>
                  <ul className={styles.factsList}>
                    {concept.facts.map((fact, index) => (
                      <li key={index} className={styles.factItem}>
                        <span className={styles.factIndex}>{index + 1}</span>
                        <span dangerouslySetInnerHTML={{ __html: renderMathInMarkdown(fact) }} />
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {concept.sources && concept.sources.length > 0 && (
                <Card variant="outline" className={styles.sidebarCard}>
                  <div className={styles.sidebarHeader}>
                    <Icon name="compass" size={16} color="var(--color-brand-primary)" />
                    <h3 className={styles.sidebarTitle}>Verified Citations & Original Papers</h3>
                  </div>
                  <ul className={styles.sourcesList}>
                    {concept.sources.map((src, index) => (
                      <li key={index}>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.sourceLink}
                        >
                          <span>{src.title}</span>
                          <Icon name="portal" size={12} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Related Concepts Section ── */}
      {relatedConcepts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Explore Related Theories</h2>
          <div className={styles.relatedGrid}>
            {relatedConcepts.map((rel) => {
              return (
                <Link key={rel.id} href={`/concepts/${rel.slug}`} className={styles.relatedCardLink}>
                  <Card variant="interactive" padding="md" className={styles.relatedCard}>
                    <div className={styles.relatedMeta}>
                      <span className={styles.relatedDifficulty}>{rel.difficulty}</span>
                    </div>
                    <h3 className={styles.relatedCardTitle}>{rel.title}</h3>
                    <p className={styles.relatedSummary}>{rel.summary}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
