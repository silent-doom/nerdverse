'use client';

import dynamic from 'next/dynamic';
import Icon from '@/components/common/Icon';
import styles from './ExploreGraph.module.css';

const ConstellationGraph3D = dynamic(() => import('@/components/3d/ConstellationGraph3D'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '540px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1117', borderRadius: '12px', border: '1px solid #30363d', color: '#8b949e' }}>
      Initializing 3D Constellation WebGL Engine...
    </div>
  ),
});

export default function ExplorePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>
          <Icon name="network" size={14} color="var(--color-brand-primary)" />
          <span>Interactive 3D Knowledge Nexus</span>
        </div>
        <h1 className={styles.title}>3D Concept Constellation</h1>
        <p className={styles.subtitle}>
          Interactive 3D graph visualizing the topological connections across quantum mechanics, retrocausality, mathematical paradoxes, and psychology.
        </p>
      </header>

      {/* 3D Knowledge Graph */}
      <ConstellationGraph3D />
    </div>
  );
}
