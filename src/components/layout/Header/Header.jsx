'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import Navigation from '@/components/layout/Navigation/Navigation';
import MobileMenu from '@/components/layout/MobileMenu/MobileMenu';
import Icon from '@/components/common/Icon';

/**
 * Site header with bold branding, solid navigation, and search trigger.
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
        role="banner"
      >
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo} aria-label="NerdVerse Home">
            <div className={styles.logoBadge}>
              <Icon name="logo" size={18} color="#ffffff" />
            </div>
            <span className={styles.logoText}>
              NERD<span className={styles.logoAccent}>VERSE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <Navigation />

          {/* Actions */}
          <div className={styles.actions}>
            {/* Search button */}
            <button
              className={styles.searchButton}
              aria-label="Search concepts"
              title="Search (Ctrl+K)"
            >
              <Icon name="search" size={16} />
              <span className={styles.searchShortcut}>⌘K</span>
            </button>

            {/* CTA */}
            <Link href="/concepts" className={styles.ctaButton}>
              Explore Library
            </Link>

            {/* Mobile hamburger */}
            <button
              className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerActive : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
