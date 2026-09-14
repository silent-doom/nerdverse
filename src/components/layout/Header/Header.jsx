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

  const [logoClicks, setLogoClicks] = useState(0);
  const [isWarping, setIsWarping] = useState(false);

  const handleLogoClick = (e) => {
    const nextCount = logoClicks + 1;
    setLogoClicks(nextCount);

    if (nextCount >= 5) {
      e.preventDefault();
      setLogoClicks(0);
      setIsWarping(true);
      window.dispatchEvent(new CustomEvent('nerdverse:singularity'));
      setTimeout(() => setIsWarping(false), 2000);
    }
  };

  return (
    <>
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
        role="banner"
      >
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link
            href="/"
            className={styles.logo}
            aria-label="NerdVerse Home"
            onClick={handleLogoClick}
          >
            <div
              className={styles.logoBadge}
              style={{
                transform: isWarping ? 'rotate(1080deg) scale(1.35)' : 'none',
                transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: isWarping ? '0 0 30px #F59E0B' : 'none',
              }}
            >
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
