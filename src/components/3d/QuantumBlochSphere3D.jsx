'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Icon from '@/components/common/Icon';
import styles from './PhysicsSimulation3D.module.css';

/**
 * 3D Quantum Bloch Sphere & Superposition Visualizer.
 * Models pure quantum states |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ) sin(θ/2)|1⟩ with live wave-function collapse.
 */
export default function QuantumBlochSphere3D() {
  const mountRef = useRef(null);

  const [theta, setTheta] = useState(Math.PI / 2); // 90 deg -> Equal superposition
  const [phi, setPhi] = useState(0); // Phase angle
  const [collapsedState, setCollapsedState] = useState(null); // '|0⟩' (Alive) or '|1⟩' (Decayed)

  // Quantum Probabilities (Born Rule)
  const prob0 = Math.pow(Math.cos(theta / 2), 2);
  const prob1 = Math.pow(Math.sin(theta / 2), 2);

  const stateVectorRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 380;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.2, 2.4, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Bloch Sphere Wireframe ──
    const sphereRadius = 1.3;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 24, 24);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x30363d,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Equator ring
    const ringGeo = new THREE.RingGeometry(sphereRadius - 0.005, sphereRadius + 0.005, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x484f58, side: THREE.DoubleSide });
    const equator = new THREE.Mesh(ringGeo, ringMat);
    scene.add(equator);

    // Coordinate Axes
    const axesHelper = new THREE.AxesHelper(1.8);
    scene.add(axesHelper);

    // ── Quantum State Vector (|ψ⟩ Arrow) ──
    const arrowDir = new THREE.Vector3(
      Math.sin(theta) * Math.cos(phi),
      Math.cos(theta),
      Math.sin(theta) * Math.sin(phi)
    );
    const arrowHelper = new THREE.ArrowHelper(arrowDir, new THREE.Vector3(0, 0, 0), sphereRadius, 0x58a6ff, 0.2, 0.1);
    scene.add(arrowHelper);
    stateVectorRef.current = arrowHelper;

    // Pole Marker Spheres (|0⟩ top, |1⟩ bottom)
    const poleGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const pole0 = new THREE.Mesh(poleGeo, new THREE.MeshBasicMaterial({ color: 0x39d353 }));
    pole0.position.set(0, sphereRadius, 0);
    scene.add(pole0);

    const pole1 = new THREE.Mesh(poleGeo, new THREE.MeshBasicMaterial({ color: 0xf85149 }));
    pole1.position.set(0, -sphereRadius, 0);
    scene.add(pole1);

    // Animation / Orbit Loop
    let animId;
    let angle = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Update State Vector
      const dir = new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi),
        Math.cos(theta),
        Math.sin(theta) * Math.sin(phi)
      ).normalize();

      arrowHelper.setDirection(dir);

      // Gentle sphere rotation
      sphere.rotation.y += 0.002;
      equator.rotation.z += 0.002;

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
      renderer.dispose();
    };
  }, [theta, phi]);

  const measureState = () => {
    // Quantum measurement: collapse according to Born probability
    const rand = Math.random();
    if (rand < prob0) {
      setTheta(0); // Collapsed to |0>
      setCollapsedState('|0⟩ (Alive / Undecayed)');
    } else {
      setTheta(Math.PI); // Collapsed to |1>
      setCollapsedState('|1⟩ (Decayed / Superposition Collapsed)');
    }
  };

  const resetSuperposition = () => {
    setTheta(Math.PI / 2);
    setPhi(0);
    setCollapsedState(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <Icon name="atom" size={13} color="var(--color-brand-primary)" />
          <span>3D Quantum State Lab</span>
        </div>
        <h3 className={styles.title}>Quantum Superposition & Bloch Sphere</h3>
        <p className={styles.subtitle}>
          Visualizing pure qubit states |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ) sin(θ/2)|1⟩. Observe wavefunction collapse in real time.
        </p>
      </div>

      <div className={styles.canvasWrapper} ref={mountRef} />

      <div className={styles.controlsGrid}>
        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Polar Angle (θ) — Superposition Ratio</label>
            <span className={styles.valBadge}>{((theta * 180) / Math.PI).toFixed(0)}°</span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.PI}
            step="0.05"
            value={theta}
            onChange={(e) => {
              setTheta(Number(e.target.value));
              setCollapsedState(null);
            }}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>θ=0 is |0⟩ | θ=90° is Equal Superposition | θ=180° is |1⟩</span>
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Phase Angle (φ) — Quantum Interference</label>
            <span className={styles.valBadge}>{((phi * 180) / Math.PI).toFixed(0)}°</span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.PI * 2}
            step="0.1"
            value={phi}
            onChange={(e) => setPhi(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Rotates relative phase along equator</span>
        </div>
      </div>

      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>P(|0⟩) Undecayed Probability</div>
          <div className={styles.statValue} style={{ color: 'var(--color-status-success)' }}>
            {(prob0 * 100).toFixed(1)}%
          </div>
          <div className={styles.statFormula}>|cos(θ/2)|²</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>P(|1⟩) Decayed Probability</div>
          <div className={styles.statValue} style={{ color: 'var(--color-status-danger)' }}>
            {(prob1 * 100).toFixed(1)}%
          </div>
          <div className={styles.statFormula}>|sin(θ/2)|²</div>
        </div>

        <div className={`${styles.statCard} ${collapsedState ? styles.cardAlert : ''}`}>
          <div className={styles.statLabel}>Measurement State</div>
          <div className={styles.statValueOutcome}>
            {collapsedState || 'Superposition Active (Unobserved)'}
          </div>
          <div className={styles.statFormula}>
            {collapsedState ? 'Wavefunction Collapsed' : 'Unitary Evolution'}
          </div>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button onClick={measureState} className={styles.launchBtn}>
          <Icon name="search" size={16} />
          <span>Open Box (Measure / Collapse Wavefunction)</span>
        </button>
        <button onClick={resetSuperposition} className={styles.resetBtn}>
          <Icon name="refresh" size={16} />
          <span>Reset to 50/50 Superposition</span>
        </button>
      </div>
    </div>
  );
}
