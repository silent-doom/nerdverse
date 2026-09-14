'use client';

import Link from 'next/link';
import styles from './Footer.module.css';
import Icon from '@/components/common/Icon';

const FOOTER_LINKS = {
  Explore: [
    { label: 'All Concepts', href: '/concepts' },
    { label: 'Knowledge Graph', href: '/explore' },
    { label: 'Disciplines', href: '/concepts?view=categories' },
  ],
  Community: [
    { label: 'Discussions', href: '#' },
    { label: 'Contributors', href: '#' },
    { label: 'Guidelines', href: '#' },
  ],
  About: [
    { label: 'Our Mission', href: '#' },
    { label: 'Open Source', href: '#' },
    { label: 'Contact', href: '#' },
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
                    <Link href={link.href} className={styles.columnLink}>
                      {link.label}
                    </Link>
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
              <span>📦</span>
              <span>Schrödinger&apos;s Box</span>
            </button>
            <button
              type="button"
              className={`${styles.eggBtn} ${styles.dangerEggBtn}`}
              onClick={handleMurphyClick}
              title="Murphy's Law: Do not click this button"
            >
              <span>⚠️</span>
              <span>DO NOT PRESS</span>
            </button>
            <span className={styles.eggBtn} title="Speed of light in vacuum">
              <span>⚡ c = 299,792,458 m/s</span>
            </span>
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
