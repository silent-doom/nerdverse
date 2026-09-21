import React from 'react';
import Link from 'next/link';
import styles from './About.module.css';
import Icon from '@/components/common/Icon';

export const metadata = {
  title: 'About NerdVerse — Open Intellectual Infrastructure',
  description: 'Our mission is to decode the deepest scientific, mathematical, and philosophical ideas through interactive 3D thought experiments.',
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <header className={styles.header}>
        <div className={styles.badge}>
          <Icon name="compass" size={14} />
          <span>Epistemic Clarity &amp; Public Good</span>
        </div>
        <h1 className={styles.title}>About NerdVerse</h1>
        <p className={styles.subtitle}>
          We build interactive 3D physical laboratories for the ideas that shaped human civilization.
        </p>
      </header>

      {/* ── 1. Our Mission (#mission) ── */}
      <section id="mission" className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <Icon name="zap" size={20} />
          </div>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
        </div>
        <p className={styles.text}>
          For centuries, the pinnacle insights of science and philosophy—from Schrödinger&apos;s quantum superposition to Turing&apos;s undecidable halting problem—have been locked inside academic paywalls, dense equations, and dry textbooks.
        </p>
        <p className={styles.text}>
          <strong>NerdVerse exists to change that.</strong> We believe true comprehension comes not from reading passive words, but from physical interaction: twisting the knobs of an empirical apparatus, observing counter-intuitive feedback, and feeling the paradox directly.
        </p>
        <div className={styles.highlightBox}>
          <strong>Core Thesis:</strong> If you cannot build an interactive mechanical or physical model of a concept, you do not truly understand it. By pair-programming with physical 3D simulations, anyone can develop authentic scientific intuition.
        </div>
      </section>

      {/* ── 2. Open Source (#open-source) ── */}
      <section id="open-source" className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <Icon name="code" size={20} />
          </div>
          <h2 className={styles.sectionTitle}>100% Open Source Infrastructure</h2>
        </div>
        <p className={styles.text}>
          NerdVerse is built entirely as a free, open-source educational commons licensed under the MIT License. There are no paywalls, no tracking advertisements, and no intellectual moats.
        </p>
        <p className={styles.text}>
          All 3D models (crafted in Blender), Three.js physics engines, telemetry pipelines, and narrative proofs are available for researchers, educators, and students worldwide.
        </p>
        <a
          href="https://github.com/silent-doom/nerdverse"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubBtn}
        >
          <Icon name="external-link" size={15} />
          <span>Explore NerdVerse on GitHub</span>
        </a>
      </section>

      {/* ── 3. Contact & Research Outreach (#contact) ── */}
      <section id="contact" className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <Icon name="message" size={20} />
          </div>
          <h2 className={styles.sectionTitle}>Contact &amp; Inquiries</h2>
        </div>
        <p className={styles.text}>
          Whether you are an academic researcher wanting to collaborate, an educator seeking classroom integrations, or a developer contributing a new 3D thought experiment:
        </p>

        <div className={styles.contactGrid}>
          <a href="mailto:curiosity.nerdverse@gmail.com" className={styles.contactCard}>
            <span className={styles.contactType}>General &amp; Research Inquiries</span>
            <span className={styles.contactVal}>curiosity.nerdverse@gmail.com</span>
            <span className={styles.contactDesc}>Academic collaboration, curriculum integration, and questions.</span>
          </a>

          <a
            href="https://github.com/silent-doom/nerdverse/issues"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactCard}
          >
            <span className={styles.contactType}>Bug Reports &amp; RFCs</span>
            <span className={styles.contactVal}>GitHub Issues ↗</span>
            <span className={styles.contactDesc}>Report simulation anomalies, suggest concepts, or submit PRs.</span>
          </a>

          <Link href="/community" className={styles.contactCard}>
            <span className={styles.contactType}>Community Hub</span>
            <span className={styles.contactVal}>Community &amp; RFC Builder →</span>
            <span className={styles.contactDesc}>Propose a new thought experiment and join active discussions.</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
