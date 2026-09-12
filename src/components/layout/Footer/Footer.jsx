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
 * Site footer with bold branding and solid structure.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`container ${styles.inner}`}>
        {/* Brand Column */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoBadge}>
              <Icon name="atom" size={16} color="#ffffff" />
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

      {/* Bottom Bar */}
      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <p className={styles.copyright}>
            © {currentYear} NerdVerse. Open source knowledge infrastructure.
          </p>
          <div className={styles.madeWith}>
            <Icon name="atom" size={12} color="var(--color-brand-primary)" />
            <span>Built for rigorous scientific curiosity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
