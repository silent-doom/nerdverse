'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './SearchModal.module.css';
import Icon from '@/components/common/Icon';
import { getAllPublishedConcepts } from '@/data/concepts';
import { CATEGORIES } from '@/lib/constants/categories';

export default function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // All concepts cached
  const allConcepts = useMemo(() => getAllPublishedConcepts(), []);

  // Filtered concepts
  const filteredConcepts = useMemo(() => {
    let list = allConcepts;

    if (activeCategory !== 'all') {
      list = list.filter((c) => c.category === activeCategory);
    }

    if (!query.trim()) {
      return list;
    }

    const q = query.trim().toLowerCase();
    return list.filter((c) => {
      const titleMatch = c.title.toLowerCase().includes(q);
      const summaryMatch = c.summary.toLowerCase().includes(q);
      const slugMatch = c.slug.toLowerCase().includes(q);
      const factsMatch = Array.isArray(c.facts) && c.facts.some((f) => f.toLowerCase().includes(q));
      return titleMatch || summaryMatch || slugMatch || factsMatch;
    });
  }, [allConcepts, activeCategory, query]);

  // Reset selected index when query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setActiveCategory('all');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredConcepts.length > 0 ? (prev + 1) % filteredConcepts.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredConcepts.length > 0 ? (prev - 1 + filteredConcepts.length) % filteredConcepts.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredConcepts.length > 0 && filteredConcepts[selectedIndex]) {
          const target = filteredConcepts[selectedIndex];
          onClose();
          router.push(`/concepts/${target.slug}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredConcepts, selectedIndex, onClose, router]);

  if (!isOpen) return null;

  const handleSelectConcept = (slug) => {
    onClose();
    router.push(`/concepts/${slug}`);
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search Concepts and 3D Labs"
      data-testid="search-modal-overlay"
    >
      <div className={styles.modal} data-testid="search-modal">
        {/* Search Input Bar */}
        <div className={styles.inputHeader}>
          <Icon name="search" size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Search all 19 concepts, thought experiments, or paradoxes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search input"
          />
          {query ? (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <Icon name="x" size={16} />
            </button>
          ) : (
            <button
              type="button"
              className={styles.escBadge}
              onClick={onClose}
              title="Close modal"
            >
              ESC
            </button>
          )}
        </div>

        {/* Category Quick Filter Row */}
        <div className={styles.filterRow}>
          <button
            type="button"
            className={`${styles.filterChip} ${activeCategory === 'all' ? styles.filterChipActive : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Disciplines ({allConcepts.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = allConcepts.filter((c) => c.category === cat.id).length;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.name}</span>
                <span>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Results */}
        {filteredConcepts.length > 0 ? (
          <ul className={styles.resultsList} role="listbox">
            {filteredConcepts.map((concept, idx) => {
              const isSelected = idx === selectedIndex;
              const category = CATEGORIES.find((c) => c.id === concept.category);

              return (
                <li
                  key={concept.id}
                  className={`${styles.resultItem} ${isSelected ? styles.resultItemActive : ''}`}
                  onClick={() => handleSelectConcept(concept.slug)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className={styles.resultMain}>
                    <div className={styles.resultTitleRow}>
                      <span className={styles.resultTitle}>{concept.title}</span>
                      {category && (
                        <span
                          className={styles.domainBadge}
                          style={{
                            backgroundColor: `${category.color || '#38bdf8'}22`,
                            color: category.color || '#38bdf8',
                            border: `1px solid ${category.color || '#38bdf8'}44`,
                          }}
                        >
                          {category.name}
                        </span>
                      )}
                    </div>
                    <span className={styles.resultSummary}>{concept.summary}</span>
                  </div>

                  <div className={styles.resultMeta}>
                    {concept.interactiveType && (
                      <span className={styles.interactiveBadge}>
                        <Icon name="zap" size={11} />
                        <span>3D Lab</span>
                      </span>
                    )}
                    <span className={styles.arrowHint}>↵</span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={styles.emptyState}>
            <Icon name="search" size={28} color="#64748b" />
            <span className={styles.emptyTitle}>No concepts found</span>
            <p className={styles.emptyDesc}>
              No thought experiment matched &quot;{query}&quot;. Try searching for &quot;cat&quot;, &quot;trolley&quot;, &quot;turing&quot;, or browse the 3D Knowledge Graph.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className={styles.modalFooter}>
          <div className={styles.keyboardHints}>
            <span className={styles.keyHint}>
              <kbd className={styles.keyKbd}>↑</kbd>
              <kbd className={styles.keyKbd}>↓</kbd> navigate
            </span>
            <span className={styles.keyHint}>
              <kbd className={styles.keyKbd}>↵</kbd> select
            </span>
            <span className={styles.keyHint}>
              <kbd className={styles.keyKbd}>esc</kbd> close
            </span>
          </div>

          <Link
            href="/explore"
            className={styles.kgLink}
            onClick={onClose}
          >
            <Icon name="network" size={13} />
            <span>Open 3D Knowledge Graph</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
