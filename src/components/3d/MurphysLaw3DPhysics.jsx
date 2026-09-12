'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Icon from '@/components/common/Icon';
import styles from './PhysicsSimulation3D.module.css';

/**
 * Real 3D Rigid-Body Physics Simulation of Murphy's Law (Tumbling Buttered Toast).
 * Models gravitational torque, edge slip velocity, free-fall angular momentum, and floor impact.
 */
export default function MurphysLaw3DPhysics() {
  const mountRef = useRef(null);

  // Simulation Parameters
  const [tableHeight, setTableHeight] = useState(0.75); // meters (standard kitchen table)
  const [initialOverhang, setInitialOverhang] = useState(0.04); // meters overhang
  const [gravity, setGravity] = useState(9.81); // m/s^2

  // Telemetry State
  const [simState, setSimState] = useState('idle'); // 'idle', 'falling', 'impact'
  const [outcome, setOutcome] = useState(null); // 'butter_down' | 'butter_up'
  const [currentAngle, setCurrentAngle] = useState(0);
  const [angularVelocity, setAngularVelocity] = useState(0);
  const [flightTime, setFlightTime] = useState(0);

  // Scene references
  const simContextRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 380;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.8, 1.8, 3.2);
    camera.lookAt(0.3, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x58a6ff, 1.2);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    // ── Grid Floor ──
    const floorGeo = new THREE.PlaneGeometry(10, 10, 20, 20);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x30363d,
      wireframe: true,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    scene.add(floor);

    // ── Table Geometry ──
    const tableTopGeo = new THREE.BoxGeometry(1.6, 0.05, 1.2);
    const tableMat = new THREE.MeshBasicMaterial({
      color: 0x161b22,
      wireframe: false,
    });
    const tableLineMat = new THREE.LineBasicMaterial({ color: 0x30363d });

    const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
    const tableEdges = new THREE.LineSegments(new THREE.EdgesGeometry(tableTopGeo), tableLineMat);
    tableTop.add(tableEdges);
    tableTop.position.set(-0.8, tableHeight, 0);
    scene.add(tableTop);

    // Table Leg
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, tableHeight, 16);
    const leg = new THREE.Mesh(legGeo, tableMat);
    leg.position.set(-0.8, tableHeight / 2, 0);
    scene.add(leg);

    // ── Toast Object (Rigid Body with Butter Layer) ──
    const toastGroup = new THREE.Group();

    // Bread base (0.1m x 0.015m x 0.1m)
    const breadGeo = new THREE.BoxGeometry(0.12, 0.015, 0.12);
    const breadMat = new THREE.MeshBasicMaterial({ color: 0xd29922 }); // Amber toast
    const bread = new THREE.Mesh(breadGeo, breadMat);
    toastGroup.add(bread);

    // Butter layer on top (+Y side)
    const butterGeo = new THREE.BoxGeometry(0.1, 0.004, 0.1);
    const butterMat = new THREE.MeshBasicMaterial({ color: 0x58a6ff }); // Electric blue butter layer
    const butter = new THREE.Mesh(butterGeo, butterMat);
    butter.position.y = 0.009;
    toastGroup.add(butter);

    // Outline
    const toastEdges = new THREE.LineSegments(new THREE.EdgesGeometry(breadGeo), new THREE.LineBasicMaterial({ color: 0xf0f6fc }));
    toastGroup.add(toastEdges);

    scene.add(toastGroup);

    // Physics Engine State
    const L = 0.12; // Length of toast (m)
    const m = 0.05; // Mass (kg)

    let posX = -initialOverhang;
    let posY = tableHeight + 0.0075;
    let posZ = 0;
    let rotZ = 0;
    let velX = 0.05; // Initial push velocity
    let velY = 0;
    let omega = 0; // Angular velocity (rad/s)
    let state = 'on_table'; // 'on_table', 'pivoting', 'free_fall', 'impact'
    let timeInAir = 0;

    const resetPosition = (h = tableHeight, oh = initialOverhang) => {
      tableTop.position.y = h;
      leg.scale.y = h / 0.75;
      leg.position.y = h / 2;

      posX = -oh;
      posY = h + 0.0075;
      rotZ = 0;
      velX = 0.06;
      velY = 0;
      omega = 0;
      state = 'on_table';
      timeInAir = 0;

      toastGroup.position.set(posX, posY, posZ);
      toastGroup.rotation.set(0, 0, rotZ);
      setSimState('idle');
      setOutcome(null);
      setCurrentAngle(0);
      setAngularVelocity(0);
      setFlightTime(0);
    };

    resetPosition(tableHeight, initialOverhang);

    simContextRef.current = {
      reset: resetPosition,
      triggerLaunch: () => {
        resetPosition(tableHeight, initialOverhang);
        state = 'pivoting';
        velX = 0.12;
        setSimState('falling');
      },
    };

    // Animation / Physics Step
    let animId;
    const dt = 0.016; // 60 FPS timestep

    const updatePhysics = () => {
      animId = requestAnimationFrame(updatePhysics);

      if (state === 'pivoting') {
        // Pivot around table edge at x = 0
        posX += velX * dt;
        if (posX >= 0) {
          // Center of mass passed table edge -> Gravitational Torque kicks in
          // Torque = m * g * (L/2) * cos(theta)
          // I = (1/3) * m * L^2
          const alpha = (3 * gravity) / (2 * L) * Math.cos(rotZ);
          omega -= alpha * dt * 0.15; // Angular acceleration
          rotZ += omega * dt;

          // Slipping off table when angle exceeds ~30 deg
          if (rotZ < -Math.PI / 6) {
            state = 'free_fall';
            velY = -0.2;
            velX = 0.18;
          }
        }
      } else if (state === 'free_fall') {
        timeInAir += dt;
        velY -= gravity * dt * 0.45; // Scaled for visible real-time physics
        posX += velX * dt;
        posY += velY * dt;
        rotZ += omega * dt; // Conserved angular momentum in air

        // Check ground impact
        if (posY <= 0.0075) {
          posY = 0.0075;
          state = 'impact';
          velY = 0;
          velX = 0;
          omega = 0;

          // Normalize angle into [0, 360)
          const finalDegrees = ((rotZ * (180 / Math.PI)) % 360 + 360) % 360;
          // If angle between 90 and 270 degrees -> Butter side hit first!
          const isButterDown = finalDegrees > 90 && finalDegrees < 270;
          setOutcome(isButterDown ? 'butter_down' : 'butter_up');
          setSimState('impact');
          setFlightTime(Number(timeInAir.toFixed(2)));
        }

        setCurrentAngle(Number((Math.abs(rotZ * (180 / Math.PI)) % 360).toFixed(1)));
        setAngularVelocity(Number(Math.abs(omega).toFixed(2)));
      }

      toastGroup.position.set(posX, posY, posZ);
      toastGroup.rotation.z = rotZ;

      renderer.render(scene, camera);
    };

    updatePhysics();

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
  }, [tableHeight, initialOverhang, gravity]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <Icon name="atom" size={13} color="var(--color-brand-primary)" />
          <span>3D Rigid-Body Physics Lab</span>
        </div>
        <h3 className={styles.title}>Murphy's Law: Rotational Dynamics Engine</h3>
        <p className={styles.subtitle}>
          Real-time 3D simulation of gravitational torque τ = mg(L/2)cos(θ), angular momentum conservation, and the mathematical inevitability of butter-down landing at standard table heights (~0.75m).
        </p>
      </div>

      {/* 3D WebGL Canvas */}
      <div className={styles.canvasWrapper} ref={mountRef} />

      {/* Controls */}
      <div className={styles.controlsGrid}>
        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Table Elevation (h)</label>
            <span className={styles.valBadge}>{tableHeight.toFixed(2)} m</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="1.6"
            step="0.05"
            value={tableHeight}
            onChange={(e) => setTableHeight(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Standard kitchen table is 0.75m</span>
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Initial Edge Overhang (d)</label>
            <span className={styles.valBadge}>{(initialOverhang * 100).toFixed(0)} cm</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.08"
            step="0.005"
            value={initialOverhang}
            onChange={(e) => setInitialOverhang(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Distance center of mass extends past edge</span>
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Gravitational Field (g)</label>
            <span className={styles.valBadge}>{gravity.toFixed(2)} m/s²</span>
          </div>
          <input
            type="range"
            min="1.62" // Moon
            max="24.79" // Jupiter
            step="0.5"
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Earth: 9.81 | Moon: 1.62 | Mars: 3.72</span>
        </div>
      </div>

      {/* Real-time Telemetry Cards */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Angular Rotation Angle (θ)</div>
          <div className={styles.statValue}>{currentAngle}°</div>
          <div className={styles.statFormula}>Target for butter-down: 90° - 270°</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Angular Velocity (ω)</div>
          <div className={styles.statValue}>{angularVelocity} rad/s</div>
          <div className={styles.statFormula}>ω = √(3g/L · sin θ_slip)</div>
        </div>

        <div className={`${styles.statCard} ${outcome === 'butter_down' ? styles.cardAlert : outcome === 'butter_up' ? styles.cardSuccess : ''}`}>
          <div className={styles.statLabel}>Impact Telemetry Verdict</div>
          <div className={styles.statValueOutcome}>
            {outcome === 'butter_down' && '⚠️ Butter-Side Down (Murphy Confirmed)'}
            {outcome === 'butter_up' && '✓ Toast-Side Down (Rare Inversion)'}
            {!outcome && 'Awaiting Drop'}
          </div>
          <div className={styles.statFormula}>
            {flightTime > 0 ? `Time of flight: ${flightTime}s` : 'Press Drop to simulate'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionRow}>
        <button
          onClick={() => simContextRef.current?.triggerLaunch()}
          disabled={simState === 'falling'}
          className={styles.launchBtn}
        >
          <Icon name="zap" size={16} />
          <span>{simState === 'falling' ? 'Calculating Physics...' : 'Drop Toast (Execute 3D Simulation)'}</span>
        </button>
        <button
          onClick={() => simContextRef.current?.reset()}
          className={styles.resetBtn}
        >
          <Icon name="refresh" size={16} />
          <span>Reset Table</span>
        </button>
      </div>
    </div>
  );
}
