'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
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

export default function ExplorePage() {
  const publishedCount = getAllPublishedConcepts().length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>
          <Icon name="network" size={15} />
          <span>3D Domain Projection &amp; Epistemic Graph</span>
        </div>
        <h1 className={styles.title}>The Knowledge Graph</h1>
        <p className={styles.subtitle}>
          A multidimensional 3D projection of the domains that scientific and philosophical ideas are about. 
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
      </header>

      {/* 3D Knowledge Graph Projection */}
      <main className={styles.graphWrapper}>
        <KnowledgeGraph3D />
      </main>
    </div>
  );
}
