'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Icon from '@/components/common/Icon';
import styles from './PhysicsSimulation3D.module.css';

const THEORIES = [
  {
    id: 'novikov',
    title: '1. Novikov Self-Consistency',
    principle: 'Causal Closed Timelike Loops',
    description: 'Any action in the past was already part of history. Causality forms a closed deterministic geodesic.',
    outcome: 'Intervention probability: 0% paradox. Actions preserve the timeline invariant.',
    color: '#39d353',
    icon: 'check',
  },
  {
    id: 'many-worlds',
    title: '2. Many-Worlds Branching',
    principle: 'Quantum Multiverse Divergence',
    description: 'Entering the past bifurcates the state vector into an alternate universe branch (Timeline B).',
    outcome: 'Zero grandfather paradox. Original timeline remains untouched.',
    color: '#58a6ff',
    icon: 'network',
  },
  {
    id: 'hawking',
    title: '3. Chronology Protection',
    principle: 'Quantum Vacuum Instability',
    description: 'Hawking Conjecture: Vacuum fluctuations diverge to infinity near CTC formation, destroying the wormhole.',
    outcome: 'Backwards travel prohibited by the laws of quantum gravity.',
    color: '#f85149',
    icon: 'alert',
  },
];

/**
 * 3D Spacetime Wormhole & Closed Timelike Curve Visualizer for Grandfather Paradox.
 */
export default function GrandfatherSpacetime3D() {
  const mountRef = useRef(null);
  const [selectedTheory, setSelectedTheory] = useState('novikov');
  const [jumpYear, setJumpYear] = useState(1952);
  const [throatRadius, setThroatRadius] = useState(1.2);
  const [showInstructions, setShowInstructions] = useState(true);

  const activeTheory = THEORIES.find((t) => t.id === selectedTheory);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 380;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Wormhole Geometry (Hyperboloid of one sheet) ──
    const radialSegments = 32;
    const heightSegments = 24;
    const cylinderGeo = new THREE.CylinderGeometry(2.4, 2.4, 4.5, radialSegments, heightSegments, true);

    const pos = cylinderGeo.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const y = pos[i + 1];
      const rFactor = 1 + (y * y * 0.2) / throatRadius;
      pos[i] = pos[i] * rFactor * 0.45;
      pos[i + 2] = pos[i + 2] * rFactor * 0.45;
    }
    cylinderGeo.computeVertexNormals();

    const wormholeMat = new THREE.MeshBasicMaterial({
      color: 0x30363d,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const wormhole = new THREE.Mesh(cylinderGeo, wormholeMat);
    scene.add(wormhole);

    // Top mouth ring (Departure Year 2026)
    const topRingGeo = new THREE.TorusGeometry(1.5, 0.04, 16, 32);
    topRingGeo.rotateX(Math.PI / 2);
    const topRing = new THREE.Mesh(topRingGeo, new THREE.MeshBasicMaterial({ color: 0x58a6ff }));
    topRing.position.y = 2.25;
    scene.add(topRing);

    // Bottom mouth ring (Arrival Year Target)
    const botRingGeo = new THREE.TorusGeometry(1.5, 0.04, 16, 32);
    botRingGeo.rotateX(Math.PI / 2);
    const botRing = new THREE.Mesh(botRingGeo, new THREE.MeshBasicMaterial({ color: 0xd29922 }));
    botRing.position.y = -2.25;
    scene.add(botRing);

    // ── Spacetime CTC Particle Stream ──
    const particleCount = 120;
    const particlesGeo = new THREE.BufferGeometry();
    const particleCoords = new Float32Array(particleCount * 3);
    const particleProgress = [];

    for (let i = 0; i < particleCount; i++) {
      particleProgress.push(Math.random());
    }

    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(activeTheory.color),
      size: 2.5,
    });
    const particles = new THREE.Points(particlesGeo, particleMat);
    scene.add(particles);

    // Animation Loop
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      wormhole.rotation.y += 0.005;

      // Update particles along closed curve
      for (let i = 0; i < particleCount; i++) {
        particleProgress[i] = (particleProgress[i] + 0.008) % 1;
        const t = particleProgress[i] * Math.PI * 2;
        const y = Math.sin(t) * 2.1;
        const r = (0.5 + Math.abs(y) * 0.35) * throatRadius;
        const angle = t * 2 + y * 0.5;

        particleCoords[i * 3] = Math.cos(angle) * r;
        particleCoords[i * 3 + 1] = y;
        particleCoords[i * 3 + 2] = Math.sin(angle) * r;
      }
      particlesGeo.setAttribute('position', new THREE.BufferAttribute(particleCoords, 3));
      particlesGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      cylinderGeo.dispose();
      wormholeMat.dispose();
      renderer.dispose();
    };
  }, [throatRadius, activeTheory]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <Icon name="atom" size={13} color="var(--color-brand-primary)" />
          <span>3D Spacetime Topology Lab</span>
        </div>
        <h3 className={styles.title}>Closed Timelike Curve (CTC) Manifold</h3>
        <p className={styles.subtitle}>
          Visualizing general relativity wormhole throat geodesics and how retrocausality is resolved across quantum physics models.
        </p>
      </div>

      <div className={styles.canvasWrapper}>
        <div ref={mountRef} style={{ width: '100%', height: '380px' }} />

        {/* Spacetime Topology Overlay & Experiment Guide */}
        <div className={styles.canvasOverlay}>
          <div className={styles.orbitHint}>
            <Icon name="compass" size={13} />
            <span>Spacetime Geodesic Topology • Continuous Lorentzian Simulation</span>
          </div>

          <div className={styles.instructionCard}>
            <div className={styles.instructionHeader}>
              <div className={styles.instructionTitle}>
                <Icon name="help-circle" size={14} />
                <span>Experiment Guide</span>
              </div>
              <button
                type="button"
                className={styles.instructionToggle}
                onClick={() => setShowInstructions(!showInstructions)}
                title={showInstructions ? 'Minimize guide' : 'Expand guide'}
              >
                {showInstructions ? 'Hide' : 'Show'}
              </button>
            </div>

            {showInstructions && (
              <ul className={styles.instructionList}>
                <li>
                  <span>1.</span>
                  <span><strong>Wormhole Throat:</strong> Blue ring is Departure (2026); Amber ring is Arrival (Past). Slide <strong>Curvature Radius</strong> to bend the gravitational throat geometry.</span>
                </li>
                <li>
                  <span>2.</span>
                  <span><strong>Novikov Loop:</strong> Green geodesic forms an unbroken deterministic cycle. Probability of paradox is strictly 0%.</span>
                </li>
                <li>
                  <span>3.</span>
                  <span><strong>Many-Worlds:</strong> Travel branches spacetime into Timeline B. You can alter the past without erasing your origin timeline.</span>
                </li>
                <li>
                  <span>4.</span>
                  <span><strong>Hawking Conjecture:</strong> Quantum vacuum energy explodes to infinity, physically destroying the wormhole before CTC forms.</span>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {THEORIES.map((theory) => (
          <button
            key={theory.id}
            onClick={() => setSelectedTheory(theory.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: selectedTheory === theory.id ? 'var(--color-brand-primary)' : 'var(--color-bg-secondary)',
              color: selectedTheory === theory.id ? '#0d1117' : 'var(--color-text-secondary)',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              border: '1px solid',
              borderColor: selectedTheory === theory.id ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
              cursor: 'pointer',
            }}
          >
            <Icon name={theory.icon} size={14} color="currentColor" />
            <span>{theory.title}</span>
          </button>
        ))}
      </div>

      <div className={styles.controlsGrid}>
        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Retrocausal Target Jump</label>
            <span className={styles.valBadge}>Year {jumpYear}</span>
          </div>
          <input
            type="range"
            min="1920"
            max="2000"
            step="1"
            value={jumpYear}
            onChange={(e) => setJumpYear(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Target coordinates prior to ancestral meeting</span>
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Wormhole Throat Curvature</label>
            <span className={styles.valBadge}>{throatRadius.toFixed(2)} r_s</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="2.0"
            step="0.1"
            value={throatRadius}
            onChange={(e) => setThroatRadius(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Gravitational throat radius in Schwarzschild units</span>
        </div>
      </div>

      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Resolution Model Principle</div>
          <div className={styles.statValue} style={{ color: activeTheory.color, fontSize: '18px' }}>
            {activeTheory.principle}
          </div>
          <div className={styles.statFormula}>{activeTheory.description}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Spacetime Invariant Status</div>
          <div className={styles.statValueOutcome} style={{ color: '#f0f6fc' }}>
            {activeTheory.outcome}
          </div>
          <div className={styles.statFormula}>Theoretical Consensus: Resolved</div>
        </div>
      </div>
    </div>
  );
}
