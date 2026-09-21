'use client';

import Link from 'next/link';
import styles from './Footer.module.css';
import Icon from '@/components/common/Icon';

const FOOTER_LINKS = {
  Explore: [
    { label: 'All Concepts', href: '/concepts' },
    { label: 'Knowledge Graph', href: '/explore' },
    { label: 'Disciplines', href: '/concepts#disciplines' },
  ],
  Community: [
    { label: 'Discussions', href: '/community#discussions' },
    { label: 'Contributors', href: '/community#contributors' },
    { label: 'Guidelines', href: '/community#guidelines' },
  ],
  About: [
    { label: 'Our Mission', href: '/about#mission' },
    { label: 'Open Source', href: 'https://github.com/silent-doom/nerdverse', external: true },
    { label: 'Contact', href: '/about#contact' },
  ],
};

/**
 * Site footer with bold branding, solid structure, and interactive easter eggs.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleSchrodingerClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nerdverse:schrodinger'));
    }
  };

  const handleMurphyClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nerdverse:murphy'));
    }
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`container ${styles.inner}`}>
        {/* Brand Column */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoBadge}>
              <Icon name="logo" size={16} color="#ffffff" />
            </div>
            <span className={styles.logoText}>
              NERD<span className={styles.logoAccent}>VERSE</span>
            </span>
          </Link>
          <p className={styles.tagline}>
            Explore the universe, one concept at a time. Rigorous interactive models of the ideas that shape reality.
          </p>
        </div>

        {/* Link Columns */}
        <div className={styles.columns}>
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className={styles.column}>
              <h4 className={styles.columnTitle}>{title}</h4>
              <ul className={styles.columnList}>
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.columnLink}
                      >
                        {link.label}
                        <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }}>↗</span>
                      </a>
                    ) : (
                      <Link href={link.href} className={styles.columnLink}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar with Easter Eggs */}
      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <p className={styles.copyright}>
            © {currentYear} NerdVerse. Open source knowledge infrastructure.
          </p>

          <div className={styles.easterEggRow}>
            <button
              type="button"
              className={styles.eggBtn}
              onClick={handleSchrodingerClick}
              title="Click to collapse Schrödinger's cat wavefunction"
            >
              <Icon name="portal" size={13} />
              <span>Schrödinger&apos;s Box</span>
            </button>
            <button
              type="button"
              className={`${styles.eggBtn} ${styles.dangerEggBtn}`}
              onClick={handleMurphyClick}
              title="Murphy's Law: Do not click this button"
            >
              <Icon name="alert" size={13} />
              <span>DO NOT PRESS</span>
            </button>
            <button
              type="button"
              className={styles.eggBtn}
              onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('nerdverse:warp'))}
              title="Special Relativity: Accelerate to speed of light c"
            >
              <Icon name="zap" size={13} />
              <span>c = 299,792,458 m/s</span>
            </button>
            <button
              type="button"
              className={styles.eggBtn}
              onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('nerdverse:matrix'))}
              title="Universal Invariants: Cascading matrix of mathematical constants"
            >
              <Icon name="math" size={13} />
              <span>Matrix Invariants</span>
            </button>
            <button
              type="button"
              className={styles.eggBtn}
              onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('nerdverse:blackhole'))}
              title="General Relativity: Schwarzschild Event Horizon"
            >
              <Icon name="network" size={13} />
              <span>Event Horizon</span>
            </button>
            <button
              type="button"
              className={styles.eggBtn}
              onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('nerdverse:heisenberg'))}
              title="Quantum Mechanics: Heisenberg Uncertainty Jitter"
            >
              <Icon name="brain" size={13} />
              <span>Δx·Δp ≥ ℏ/2</span>
            </button>
            <button
              type="button"
              className={styles.eggBtn}
              onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('nerdverse:dontpanic'))}
              title="The Hitchhiker's Guide to the Galaxy: 42"
            >
              <Icon name="sparkles" size={13} />
              <span>Don&apos;t Panic</span>
            </button>
          </div>

          <div className={styles.madeWith}>
            <Icon name="logo" size={13} color="var(--color-brand-primary)" />
            <span>Built for rigorous scientific curiosity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
