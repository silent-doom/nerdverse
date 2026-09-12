'use client';

import dynamic from 'next/dynamic';
import Icon from '@/components/common/Icon';
import styles from './ExploreGraph.module.css';

const KnowledgeNodeGraph = dynamic(() => import('@/components/interactive/KnowledgeNodeGraph'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F4F0', border: '4px solid #1A1A1A', color: '#1A1A1A', fontWeight: 'bold' }}>
      Loading Knowledge Web...
    </div>
  ),
});

export default function ExplorePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>
          <Icon name="network" size={16} />
          <span>Structural Data Map</span>
        </div>
        <h1 className={styles.title}>Knowledge Web</h1>
        <p className={styles.subtitle}>
          Trace the logical connections between physics, mathematics, and philosophy. 
          No space themes. Just data.
        </p>
      </header>

      {/* 2D Neo-Brutalist Knowledge Graph */}
      <KnowledgeNodeGraph />
    </div>
  );
}
