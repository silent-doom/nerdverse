'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/common/Icon';
import styles from './ExploreGraph.module.css';
import { getAllPublishedConcepts } from '@/data/concepts';

const KnowledgeGraph3D = dynamic(() => import('@/components/3d/KnowledgeGraph3D'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingPlaceholder}>
      <div className={styles.loadingSpinner} />
      <span>Projecting 3D Domain Coordinate Graph...</span>
    </div>
  ),
});

const KnowledgeNodeGraph = dynamic(() => import('@/components/interactive/KnowledgeNodeGraph'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingPlaceholder}>
      <div className={styles.loadingSpinner} />
      <span>Loading 2D Knowledge Web...</span>
    </div>
  ),
});

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialNode = searchParams.get('node') || null;
  const initialView = searchParams.get('view') === '2d' ? '2d' : '3d';
  const [viewMode, setViewMode] = useState(initialView);
  const publishedCount = getAllPublishedConcepts().length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>
          <Icon name="network" size={15} />
          <span>Domain Projection &amp; Epistemic Network</span>
        </div>
        <h1 className={styles.title}>The Knowledge Graph</h1>
        <p className={styles.subtitle}>
          A multidimensional projection of the domains that scientific and philosophical ideas are about. 
          Discover semantic affinity paths, disciplinary clusters, and cross-domain bridges inspired by Connected Papers.
        </p>

        <div className={styles.featuresStrip}>
          <Link href="/concepts" className={styles.catalogLinkPill}>
            <Icon name="layers" size={13} color="#38bdf8" />
            <span>Browse Full Concepts Catalog ({publishedCount} Concepts) →</span>
          </Link>
          <div className={styles.featurePill}>
            <Icon name="atom" size={13} color="#38bdf8" />
            <span>7 Domain Clusters</span>
          </div>
          <div className={styles.featurePill}>
            <Icon name="layers" size={13} color="#f59e0b" />
            <span>Connected Papers Inspector</span>
          </div>
          <div className={styles.featurePill}>
            <Icon name="zap" size={13} color="#10b981" />
            <span>Direct 3D Lab Jumps</span>
          </div>
          <div className={styles.featurePill}>
            <Icon name="search" size={13} color="#ec4899" />
            <span>Instant Semantic Search</span>
          </div>
        </div>

        {/* View Mode Toggle: 3D Orbit vs 2D Web */}
        <div className={styles.viewModeToggle} role="tablist" aria-label="Knowledge Graph View Mode">
          <button
            className={`${styles.viewModeBtn} ${viewMode === '3d' ? styles.viewModeBtnActive : ''}`}
            onClick={() => setViewMode('3d')}
            role="tab"
            aria-selected={viewMode === '3d'}
          >
            <Icon name="network" size={15} />
            <span>3D Orbit Space</span>
          </button>
          <button
            className={`${styles.viewModeBtn} ${viewMode === '2d' ? styles.viewModeBtnActive : ''}`}
            onClick={() => setViewMode('2d')}
            role="tab"
            aria-selected={viewMode === '2d'}
          >
            <Icon name="layers" size={15} />
            <span>2D Knowledge Web ({publishedCount} Nodes)</span>
          </button>
        </div>
      </header>

      {/* Projection Area */}
      <main className={styles.graphWrapper}>
        {viewMode === '3d' ? (
          <KnowledgeGraph3D initialNodeSlug={initialNode} />
        ) : (
          <KnowledgeNodeGraph initialActiveSlug={initialNode} />
        )}
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className={styles.loadingPlaceholder}>
          <div className={styles.loadingSpinner} />
          <span>Initializing Knowledge Graph...</span>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}

