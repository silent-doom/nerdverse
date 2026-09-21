'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './KnowledgeNodeGraph.module.css';
import { concepts } from '@/data/concepts';
import { CATEGORIES, getCategoryById } from '@/lib/constants/categories';
import { GRAPH_NODES, GRAPH_LINKS, DOMAIN_CLUSTERS, getNodeById } from '@/data/knowledgeGraphData';
import Icon from '@/components/common/Icon';

const CANVAS_SIZE = 1200;

// Domain cluster hubs across the 1200x1200 canvas
const CLUSTER_CENTERS = {
  cs: { x: 600, y: 190, r: 140, label: 'Computation & Systems', color: '#10B981' },
  physics: { x: 260, y: 340, r: 140, label: 'Physics & Cosmology', color: '#38BDF8' },
  math: { x: 940, y: 340, r: 140, label: 'Mathematics & Probability', color: '#F59E0B' },
  biology: { x: 600, y: 600, r: 100, label: 'Ecology & Evolution', color: '#84CC16' },
  philosophy: { x: 260, y: 880, r: 140, label: 'Philosophy & Ethics', color: '#A855F7' },
  psychology: { x: 940, y: 880, r: 140, label: 'Cognition & Mind', color: '#EC4899' },
  economics: { x: 600, y: 1010, r: 140, label: 'Economics & Game Dynamics', color: '#F97316' },
};

// Compute deterministic non-overlapping coordinates for all 36 concepts
function computeNodeLayouts() {
  const domainNodes = {};
  GRAPH_NODES.forEach((n) => {
    domainNodes[n.domain] = domainNodes[n.domain] || [];
    domainNodes[n.domain].push(n.slug);
  });

  const layouts = {};
  Object.entries(domainNodes).forEach(([domain, slugs]) => {
    const cluster = CLUSTER_CENTERS[domain] || { x: 600, y: 600, r: 140 };
    const total = slugs.length;
    slugs.forEach((slug, idx) => {
      if (total === 1) {
        layouts[slug] = { x: cluster.x, y: cluster.y };
      } else {
        const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
        const x = Math.round(cluster.x + cluster.r * Math.cos(angle));
        const y = Math.round(cluster.y + cluster.r * Math.sin(angle));
        layouts[slug] = { x, y };
      }
    });
  });

  return layouts;
}

const NODE_LAYOUTS = computeNodeLayouts();

export default function KnowledgeNodeGraph({ initialActiveSlug = null }) {
  const [activeNode, setActiveNode] = useState(initialActiveSlug);
  const [activeDomain, setActiveDomain] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter nodes matching search & domain
  const visibleSlugs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return new Set(
      GRAPH_NODES.filter((n) => {
        const matchesDomain = activeDomain === 'all' || n.domain === activeDomain;
        const matchesSearch =
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.domainName.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q);
        return matchesDomain && matchesSearch;
      }).map((n) => n.slug)
    );
  }, [activeDomain, searchQuery]);

  // Connected nodes map for active selection
  const connectedSlugs = useMemo(() => {
    if (!activeNode) return new Set();
    const set = new Set([activeNode]);
    GRAPH_LINKS.forEach((l) => {
      if (l.source === activeNode) set.add(l.target);
      if (l.target === activeNode) set.add(l.source);
    });
    return set;
  }, [activeNode]);

  const activeNodeData = useMemo(() => {
    if (!activeNode) return null;
    return getNodeById(activeNode);
  }, [activeNode]);

  return (
    <div className={styles.container} data-testid="knowledge-node-graph">
      <div className={styles.header}>
        <div className={styles.headerBadge}>
          <Icon name="network" size={14} color="var(--color-brand-primary)" />
          <span>2D Neo-Brutalist Epistemic Constellation</span>
        </div>
        <h2 className={styles.title}>The Knowledge Web</h2>
        <p className={styles.subtitle}>
          Interactive network linking all {concepts.length} scientific principles, cognitive biases, and paradoxes.
        </p>
      </div>

      {/* Control Bar: Search & Domain Filters */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Icon name="search" size={15} color="var(--color-text-secondary)" />
          <input
            type="text"
            placeholder="Search all 36 knowledge nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={styles.clearSearchBtn}
              aria-label="Clear search"
            >
              <Icon name="x" size={13} />
            </button>
          )}
        </div>

        <div className={styles.domainPills}>
          <button
            className={`${styles.domainPill} ${activeDomain === 'all' ? styles.domainPillActive : ''}`}
            onClick={() => setActiveDomain('all')}
          >
            All Nodes ({concepts.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.domainPill} ${activeDomain === cat.id ? styles.domainPillActive : ''}`}
              onClick={() => setActiveDomain(activeDomain === cat.id ? 'all' : cat.id)}
              style={{
                '--pill-accent': cat.color,
              }}
            >
              <Icon name={cat.iconName} size={12} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2D SVG Graph Constellation */}
      <div className={styles.graphWrapper}>
        <svg
          className={styles.svgLayer}
          width="100%"
          height="100%"
          viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.12)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Domain Cluster Regions */}
          {Object.entries(CLUSTER_CENTERS).map(([key, cluster]) => {
            const isDomainActive = activeDomain === 'all' || activeDomain === key;
            return (
              <g key={`cluster-${key}`} opacity={isDomainActive ? 0.85 : 0.15}>
                <circle
                  cx={cluster.x}
                  cy={cluster.y}
                  r={cluster.r + 35}
                  fill="none"
                  stroke={cluster.color}
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                  opacity="0.3"
                />
                <circle
                  cx={cluster.x}
                  cy={cluster.y}
                  r={cluster.r + 55}
                  fill="url(#hubGlow)"
                  opacity="0.2"
                />
                <text
                  x={cluster.x}
                  y={cluster.y - cluster.r - 45}
                  textAnchor="middle"
                  fill={cluster.color}
                  fontSize="13"
                  fontWeight="700"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  opacity="0.8"
                >
                  {cluster.label}
                </text>
              </g>
            );
          })}

          {/* Draw SVG Links */}
          {GRAPH_LINKS.map((link, idx) => {
            const source = NODE_LAYOUTS[link.source];
            const target = NODE_LAYOUTS[link.target];
            if (!source || !target) return null;

            const isDirectLink =
              activeNode &&
              (link.source === activeNode || link.target === activeNode);
            const isVisible =
              visibleSlugs.has(link.source) && visibleSlugs.has(link.target);

            let strokeColor = 'rgba(71, 85, 105, 0.25)';
            let strokeWidth = 1.5;
            let opacity = 0.4;

            if (isDirectLink) {
              strokeColor = 'var(--color-brand-primary, #e5a93c)';
              strokeWidth = 3.5;
              opacity = 1;
            } else if (!isVisible) {
              opacity = 0.05;
            }

            return (
              <line
                key={`link-${idx}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                opacity={opacity}
                className={styles.linkLine}
              />
            );
          })}
        </svg>

        {/* Draw All 36 Interactive Nodes */}
        {concepts.map((concept) => {
          const layout = NODE_LAYOUTS[concept.slug];
          if (!layout) return null;

          const category = getCategoryById(concept.category);
          const color = category ? category.color : '#38bdf8';
          const isActive = activeNode === concept.slug;
          const isConnected = connectedSlugs.has(concept.slug);
          const isVisible = visibleSlugs.has(concept.slug);

          let opacity = 1;
          if (activeNode) {
            opacity = isActive ? 1 : isConnected ? 0.9 : 0.2;
          } else if (!isVisible) {
            opacity = 0.15;
          }

          return (
            <motion.div
              key={concept.slug}
              className={`${styles.node} ${isActive ? styles.nodeActive : ''} ${
                isConnected && !isActive ? styles.nodeConnected : ''
              }`}
              style={{
                left: `${(layout.x / CANVAS_SIZE) * 100}%`,
                top: `${(layout.y / CANVAS_SIZE) * 100}%`,
                borderColor: isActive ? 'var(--color-brand-primary, #e5a93c)' : color,
                backgroundColor: 'var(--color-bg-elevated, #111726)',
                opacity,
              }}
              onMouseEnter={() => setActiveNode(concept.slug)}
              onMouseLeave={() => {}}
              onClick={() => setActiveNode(concept.slug)}
              whileHover={{ scale: 1.15 }}
            >
              <Link
                href={`/concepts/${concept.slug}`}
                className={styles.nodeLink}
                title={concept.title}
              >
                <div className={styles.nodeIcon}>
                  <Icon
                    name={category?.iconName || 'atom'}
                    size={18}
                    color={color}
                  />
                </div>
                <div className={styles.nodeTooltip}>
                  <div className={styles.tooltipTitle}>{concept.title}</div>
                  <div className={styles.tooltipCategory} style={{ color }}>
                    {category?.name || concept.category} · {concept.difficulty}
                  </div>
                  <div className={styles.tooltipSummary}>{concept.summary}</div>
                  <div className={styles.tooltipCta}>Open Lab →</div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Node Telemetry & Quick Action Card */}
      {activeNodeData && (
        <div className={styles.activeNodeCard}>
          <div className={styles.activeCardHeader}>
            <div className={styles.activeCardMeta}>
              <span
                className={styles.activeCardDomainBadge}
                style={{
                  color: CLUSTER_CENTERS[activeNodeData.domain]?.color || '#38bdf8',
                  borderColor: CLUSTER_CENTERS[activeNodeData.domain]?.color || '#38bdf8',
                }}
              >
                {activeNodeData.domainName}
              </span>
              <span className={styles.activeCardDifficulty}>{activeNodeData.difficulty}</span>
              <span className={styles.activeCardScore}>Impact {activeNodeData.citationsScore}/100</span>
            </div>
            <button
              onClick={() => setActiveNode(null)}
              className={styles.closeActiveBtn}
              aria-label="Deselect node"
            >
              <Icon name="x" size={14} />
            </button>
          </div>

          <h3 className={styles.activeCardTitle}>{activeNodeData.title}</h3>
          <p className={styles.activeCardSummary}>{activeNodeData.summary}</p>
          <div className={styles.activeCardBridge}>
            <strong>Paradox Core:</strong> {activeNodeData.paradoxCore}
          </div>

          <div className={styles.activeCardActions}>
            <Link href={activeNodeData.interactivePath} className={styles.primaryActionBtn}>
              <Icon name="zap" size={15} />
              <span>Launch Interactive Lab</span>
            </Link>
            <Link href={`/explore?node=${activeNodeData.slug}`} className={styles.secondaryActionBtn}>
              <Icon name="network" size={15} />
              <span>Inspect in 3D Space</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

