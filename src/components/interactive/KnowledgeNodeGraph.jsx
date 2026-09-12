import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './KnowledgeNodeGraph.module.css';
import { concepts } from '@/data/concepts';
import { CATEGORIES } from '@/lib/constants/categories';
import Icon from '@/components/common/Icon';

// Manually position nodes for a clean, architectural layout
const nodeLayouts = {
  'schrodingers-cat': { x: 300, y: 150 },
  'grandfather-paradox': { x: 100, y: 300 },
  'monty-hall': { x: 500, y: 300 },
  'murphys-law': { x: 300, y: 450 },
  'trolley-problem': { x: 100, y: 500 }
};

export default function KnowledgeNodeGraph() {
  const [activeNode, setActiveNode] = useState(null);

  // Define explicit connections for the SVG lines
  const links = [
    { source: 'schrodingers-cat', target: 'grandfather-paradox' },
    { source: 'schrodingers-cat', target: 'monty-hall' },
    { source: 'grandfather-paradox', target: 'murphys-law' },
    { source: 'monty-hall', target: 'murphys-law' },
    { source: 'grandfather-paradox', target: 'trolley-problem' }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>The Knowledge Web</h2>
        <p className={styles.subtitle}>Click a node to explore connections.</p>
      </div>

      <div className={styles.graphWrapper}>
        <svg className={styles.svgLayer} width="100%" height="100%" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet">
          {/* Draw solid, thick neo-brutalist lines */}
          {links.map((link, idx) => {
            const source = nodeLayouts[link.source];
            const target = nodeLayouts[link.target];
            const isActive = activeNode === link.source || activeNode === link.target;
            
            if (!source || !target) return null;
            
            return (
              <line
                key={`link-${idx}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isActive ? 'var(--color-brand-primary)' : 'var(--color-border-default)'}
                strokeWidth={isActive ? '6' : '4'}
                className={styles.linkLine}
              />
            );
          })}
        </svg>

        {/* Draw the nodes */}
        {concepts.map((concept) => {
          const layout = nodeLayouts[concept.slug];
          if (!layout) return null;
          
          const category = CATEGORIES.find(c => c.id === concept.category);
          const color = category ? category.color : 'var(--color-accent-quantum)';
          const isActive = activeNode === concept.slug;
          const isRelated = activeNode && concept.relatedSlugs?.includes(activeNode);
          
          let opacity = 1;
          if (activeNode && !isActive && !isRelated) {
            opacity = 0.3;
          }

          return (
            <motion.div
              key={concept.slug}
              className={`${styles.node} ${isActive ? styles.nodeActive : ''}`}
              style={{
                left: `${(layout.x / 600) * 100}%`,
                top: `${(layout.y / 600) * 100}%`,
                backgroundColor: color,
                opacity
              }}
              onMouseEnter={() => setActiveNode(concept.slug)}
              onMouseLeave={() => setActiveNode(null)}
              whileHover={{ scale: 1.1 }}
            >
              <Link href={`/concepts/${concept.slug}`} className={styles.nodeLink}>
                <div className={styles.nodeIcon}>
                  <Icon name={category?.iconName || 'atom'} size={24} color="var(--color-text-inverse)" />
                </div>
                <div className={styles.nodeTooltip}>
                  <div className={styles.tooltipTitle}>{concept.title}</div>
                  <div className={styles.tooltipCategory}>{category?.name}</div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
