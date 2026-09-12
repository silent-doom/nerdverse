'use client';

import Link from 'next/link';
import styles from './MobileMenu.module.css';
import Icon from '@/components/common/Icon';

const MENU_ITEMS = [
  { label: 'All Concepts', href: '/concepts', icon: 'layers' },
  { label: 'Explore Constellation', href: '/explore', icon: 'network' },
  { label: 'Disciplines', href: '/concepts?view=categories', icon: 'compass' },
];

/**
 * Mobile slide-out navigation menu.
 */
export default function MobileMenu({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.menuTitle}>Navigation</span>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <nav className={styles.nav}>
            <ul className={styles.list}>
              {MENU_ITEMS.map((item) => (
                <li key={item.href} className={styles.item}>
                  <Link
                    href={item.href}
                    className={styles.link}
                    onClick={onClose}
                  >
                    <Icon name={item.icon} size={18} />
                    <span className={styles.linkText}>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.footer}>
            <Link
              href="/concepts"
              className={styles.exploreCta}
              onClick={onClose}
            >
              Start Exploring
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
