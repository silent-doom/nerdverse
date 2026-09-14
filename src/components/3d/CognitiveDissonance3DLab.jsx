'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './CognitiveDissonance3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

export default function CognitiveDissonance3DLab() {
  const mountRef = useRef(null);

  // ── Mode: 'festinger1959' | 'prophecy1954' | 'gyroscope' ──
  const [activeMode, setActiveMode] = useState('festinger1959');
  const modeRef = useRef('festinger1959');

  // ── Mode 1: Festinger 1959 Controls ──
  // 'bribe20' | 'bribe1' | 'control0'
  const [bribeCondition, setBribeCondition] = useState('bribe1');
  const bribeRef = useRef('bribe1');
  const [pegTurnCount, setPegTurnCount] = useState(14);
  const pegTurnCountRef = useRef(14);

  // ── Mode 2: When Prophecy Fails Controls ──
  const [cultSacrifice, setCultSacrifice] = useState(85); // 0 - 100% Sunk Cost
  const cultSacrificeRef = useRef(85);
  const [prophecyTime, setProphecyTime] = useState(285); // minutes past midnight: 0 = 12:00am, 285 = 4:45am
  const prophecyTimeRef = useRef(285);

  // ── Mode 3: Tension Gyroscope Controls ──
  const [discrepancySeverity, setDiscrepancySeverity] = useState(80);
  const discrepancyRef = useRef(80);
  const [resolutionStrategy, setResolutionStrategy] = useState('distort'); // 'admit' | 'justify' | 'distort'
  const resolutionRef = useRef('distort');

  // ── Telemetry & Metrics ──
  const [dissonanceScore, setDissonanceScore] = useState(92); // 0 - 100%
  const [taskRating, setTaskRating] = useState(7.8); // -5.0 to +10.0 scale
  const [hasRecorded, setHasRecorded] = useState(false);

  // Sync refs
  useEffect(() => { modeRef.current = activeMode; }, [activeMode]);
  useEffect(() => {
    bribeRef.current = bribeCondition;
    if (bribeCondition === 'bribe20') {
      setDissonanceScore(12);
      setTaskRating(-4.5);
    } else if (bribeCondition === 'bribe1') {
      setDissonanceScore(92);
      setTaskRating(7.8);
    } else {
      setDissonanceScore(0);
      setTaskRating(-5.0);
    }
  }, [bribeCondition]);

  useEffect(() => { cultSacrificeRef.current = cultSacrifice; }, [cultSacrifice]);
  useEffect(() => { prophecyTimeRef.current = prophecyTime; }, [prophecyTime]);
  useEffect(() => { discrepancyRef.current = discrepancySeverity; }, [discrepancySeverity]);
  useEffect(() => { resolutionRef.current = resolutionStrategy; }, [resolutionStrategy]);

  // Three.js scene refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const festingerGroupRef = useRef(null);
  const cultGroupRef = useRef(null);
  const gyroGroupRef = useRef(null);
  const brainMeshRef = useRef(null);
  const pegsRef = useRef([]);
  const cash20Ref = useRef(null);
  const cash1Ref = useRef(null);
  const balanceBeamRef = useRef(null);
  const tensionSpringRef = useRef(null);
  const clockHandRef = useRef(null);

  // ── Initialize Simulation ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060810);
    scene.fog = new THREE.FogExp2(0x060810, 0.038);

    const width = mount.clientWidth;
    const height = mount.clientHeight || 580;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.6, 7.8);
    camera.lookAt(0, 0.3, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const deskLamp = new THREE.PointLight(0xfef08a, 2.8, 14);
    deskLamp.position.set(0, 4.2, 1.2);
    scene.add(deskLamp);

    const cyanCognitionLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    cyanCognitionLight.position.set(-6, 3, 4);
    scene.add(cyanCognitionLight);

    const redDissonanceLight = new THREE.DirectionalLight(0xef4444, 1.4);
    redDissonanceLight.position.set(6, 3, -4);
    scene.add(redDissonanceLight);

    // 4. Starfield Background (for Cult Mode & Cosmic Lattice)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 450;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 44;
      starPos[i + 1] = (Math.random() - 0.5) * 44;
      starPos[i + 2] = (Math.random() - 0.5) * 44;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x818cf8, size: 0.11, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(starGeo, starMat));

    // ── 5. MODE 1: Festinger 1959 Laboratory Apparatus ──
    const festingerGroup = new THREE.Group();
    scene.add(festingerGroup);
    festingerGroupRef.current = festingerGroup;

    // Wood & Brass Materials
    const walnutDeskMat = new THREE.MeshStandardMaterial({ color: 0x221711, roughness: 0.7, metalness: 0.1 });
    const oakTrayMat = new THREE.MeshStandardMaterial({ color: 0x543d2b, roughness: 0.6, metalness: 0.15 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xdfa037, metalness: 0.85, roughness: 0.28 });
    const pegMat = new THREE.MeshStandardMaterial({ color: 0xd6c4a5, roughness: 0.45 });

    // Laboratory Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.35, 4.4), walnutDeskMat);
    desk.position.set(0, -0.15, 0);
    festingerGroup.add(desk);

    // Pegboard Tray (48 Pegs Grid)
    const board = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.2, 2.6), oakTrayMat);
    board.position.set(-0.8, 0.12, 0.3);
    festingerGroup.add(board);

    // 24 Turnable Pegs
    const pegs = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        const px = -2.3 + c * 0.6;
        const pz = -0.65 + r * 0.62;
        const pegGroup = new THREE.Group();

        const pegCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.38, 16), pegMat);
        pegCyl.position.y = 0.25;
        pegGroup.add(pegCyl);

        const knob = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.08), brassMat);
        knob.position.y = 0.45;
        pegGroup.add(knob);

        pegGroup.position.set(px, 0.08, pz);
        pegGroup.rotation.y = ((r * 3 + c) % 4) * (Math.PI / 2);
        festingerGroup.add(pegGroup);
        pegs.push(pegGroup);
      }
    }
    pegsRef.current = pegs;

    // $20 Cash Stack (High External Justification)
    const cash20Group = new THREE.Group();
    const billMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xdfa037, roughness: 0.3 });
    const cashStack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.32, 0.65), billMat);
    cashStack.position.y = 0.22;
    cash20Group.add(cashStack);
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.34, 0.67), bandMat);
    band.position.y = 0.22;
    cash20Group.add(band);
    cash20Group.position.set(2.2, 0.05, 0.2);
    festingerGroup.add(cash20Group);
    cash20Ref.current = cash20Group;

    // $1 Single Bill (Insufficient Justification)
    const cash1Group = new THREE.Group();
    const singleBill = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.02, 0.55), billMat);
    singleBill.position.y = 0.08;
    singleBill.rotation.y = 0.25;
    cash1Group.add(singleBill);
    cash1Group.position.set(2.2, 0.05, 0.2);
    cash1Group.visible = false;
    festingerGroup.add(cash1Group);
    cash1Ref.current = cash1Group;

    // Neural Dissonance Holographic Core (Floating above desk)
    const brainGroup = new THREE.Group();
    const brainGeo = new THREE.IcosahedronGeometry(0.65, 2);
    const brainMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const brainMesh = new THREE.Mesh(brainGeo, brainMat);
    brainGroup.add(brainMesh);

    // Inner ego core
    const egoMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.2 })
    );
    brainGroup.add(egoMesh);
    brainGroup.position.set(2.2, 2.0, 0.2);
    festingerGroup.add(brainGroup);
    brainMeshRef.current = brainMesh;

    // ── 6. MODE 2: When Prophecy Fails (1954 Doomsday Cult) ──
    const cultGroup = new THREE.Group();
    cultGroup.visible = false;
    scene.add(cultGroup);
    cultGroupRef.current = cultGroup;

    // Hilltop Knoll
    const knollMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.95 });
    const knoll = new THREE.Mesh(new THREE.ConeGeometry(5.2, 1.8, 24), knollMat);
    knoll.position.set(0, -0.9, 0);
    cultGroup.add(knoll);

    // Doomsday Brass Countdown Clock
    const clockDial = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 32), brassMat);
    clockDial.rotation.x = Math.PI / 2;
    clockDial.position.set(0, 1.6, -1.2);
    cultGroup.add(clockDial);

    const clockHand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.02), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    clockHand.position.set(0, 1.8, -1.1);
    cultGroup.add(clockHand);
    clockHandRef.current = clockHand;

    // Extraterrestrial Clarion Telepathic Antenna Beacon
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, emissive: 0x4f46e5, emissiveIntensity: 1.5 });
    const antennaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 3.4), brassMat);
    antennaPole.position.set(-2.4, 1.7, 0);
    cultGroup.add(antennaPole);

    const antennaOrb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), antennaMat);
    antennaOrb.position.set(-2.4, 3.4, 0);
    cultGroup.add(antennaOrb);

    // ── 7. MODE 3: The Dissonance Gyroscope (Equilibrium Engine) ──
    const gyroGroup = new THREE.Group();
    gyroGroup.visible = false;
    scene.add(gyroGroup);
    gyroGroupRef.current = gyroGroup;

    // Fulcrum Base & Pillar
    const gyroBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.35, 24), walnutDeskMat);
    gyroBase.position.y = -0.6;
    gyroGroup.add(gyroBase);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 3.2, 16), brassMat);
    pillar.position.y = 1.0;
    gyroGroup.add(pillar);

    // Balance Beam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.15, 0.18), brassMat);
    beam.position.y = 2.4;
    gyroGroup.add(beam);
    balanceBeamRef.current = beam;

    // Node A (Cognition A: Belief / Self-Worth)
    const nodeA = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.4 })
    );
    nodeA.position.set(-2.4, 2.4, 0);
    gyroGroup.add(nodeA);

    // Node B (Cognition B: Forced Behavior / Contradiction)
    const nodeB = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 1.4 })
    );
    nodeB.position.set(2.4, 2.4, 0);
    gyroGroup.add(nodeB);

    // Connecting Tension Spring / Electric Arc
    const springGeo = new THREE.BufferGeometry();
    const springPts = [];
    for (let s = 0; s <= 30; s++) {
      springPts.push(-2.4 + (s / 30) * 4.8, 2.4 + Math.sin(s * 1.5) * 0.2, 0);
    }
    springGeo.setAttribute('position', new THREE.Float32BufferAttribute(springPts, 3));
    const springMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
    const springLine = new THREE.Line(springGeo, springMat);
    gyroGroup.add(springLine);
    tensionSpringRef.current = springLine;

    // ── Mouse Orbit Controls ──
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = Math.PI / 3.4;
    const cameraRadius = 8.2;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= deltaX * 0.006;
      sphericalPhi = Math.max(0.25, Math.min(Math.PI / 2 - 0.05, sphericalPhi - deltaY * 0.006));

      camera.position.x = cameraRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = Math.max(1.0, cameraRadius * Math.cos(sphericalPhi));
      camera.position.z = cameraRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 0.4, 0);
    };
    const onMouseUp = () => { isDragging = false; };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // ── Animation Loop ──
    let animationId;
    let clock = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      clock += 0.02;

      const currentMode = modeRef.current;

      // MODE 1: Festinger 1959
      if (currentMode === 'festinger1959') {
        festingerGroupRef.current.visible = true;
        cultGroupRef.current.visible = false;
        gyroGroupRef.current.visible = false;

        const bribe = bribeRef.current;
        if (cash20Ref.current && cash1Ref.current) {
          cash20Ref.current.visible = bribe === 'bribe20';
          cash1Ref.current.visible = bribe === 'bribe1';
        }

        // Brain pulsation & color based on dissonance
        if (brainMeshRef.current) {
          if (bribe === 'bribe1') {
            // High Dissonance: violent jitter and crimson color
            const jitter = Math.sin(clock * 18) * 0.03;
            brainMeshRef.current.position.set(jitter, jitter * 0.5, 0);
            brainMeshRef.current.scale.set(1 + Math.sin(clock * 8) * 0.08, 1 + Math.sin(clock * 8) * 0.08, 1);
            brainMeshRef.current.material.color.setHex(0xef4444);
          } else if (bribe === 'bribe20') {
            // Low Dissonance: calm, smooth emerald/gold
            brainMeshRef.current.position.set(0, 0, 0);
            brainMeshRef.current.scale.set(1, 1, 1);
            brainMeshRef.current.material.color.setHex(0x10b981);
          } else {
            // Control ($0): neutral
            brainMeshRef.current.position.set(0, 0, 0);
            brainMeshRef.current.scale.set(0.95, 0.95, 0.95);
            brainMeshRef.current.material.color.setHex(0x6b7280);
          }
          brainMeshRef.current.rotation.y += 0.015;
        }
      }

      // MODE 2: When Prophecy Fails 1954
      else if (currentMode === 'prophecy1954') {
        festingerGroupRef.current.visible = false;
        cultGroupRef.current.visible = true;
        gyroGroupRef.current.visible = false;

        // Clock hand rotation to indicate midnight / 4:45 am
        if (clockHandRef.current) {
          const pt = prophecyTimeRef.current;
          // rotate hand based on minutes past midnight
          clockHandRef.current.rotation.z = -(pt / 360) * Math.PI * 2;
        }
      }

      // MODE 3: Gyroscope Equilibrium
      else if (currentMode === 'gyroscope') {
        festingerGroupRef.current.visible = false;
        cultGroupRef.current.visible = false;
        gyroGroupRef.current.visible = true;

        const disc = discrepancyRef.current;
        const res = resolutionRef.current;

        // Beam tilt based on tension & resolution
        if (balanceBeamRef.current) {
          let targetTilt = -(disc / 100) * 0.35;
          if (res === 'justify') targetTilt *= 0.25;
          if (res === 'distort') targetTilt = 0.02; // Falsely restored equilibrium!
          balanceBeamRef.current.rotation.z = targetTilt;
        }

        if (tensionSpringRef.current) {
          tensionSpringRef.current.material.color.setHex(
            res === 'distort' ? 0x10b981 : disc > 60 ? 0xef4444 : 0xe5a93c
          );
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Turn Pegs Interactive Action
  const handleTurnPegs = () => {
    setPegTurnCount((prev) => prev + 4);
    if (pegsRef.current) {
      pegsRef.current.forEach((p) => {
        p.rotation.y += Math.PI / 2;
      });
    }
  };

  // ── Record Telemetry Run ──
  const handleRecordRun = useCallback(() => {
    recordConceptRun('cognitive-dissonance', 'single', {
      mode: activeMode,
      bribeCondition,
      dissonanceScore,
      taskRating,
      pegTurnCount,
      cultSacrifice,
    });
    setHasRecorded(true);
    setTimeout(() => setHasRecorded(false), 2400);
  }, [activeMode, bribeCondition, dissonanceScore, taskRating, pegTurnCount, cultSacrifice]);

  return (
    <div className={styles.labContainer} data-testid="cognitive-dissonance-3d-lab">
      <div className={styles.canvasContainer}>
        {/* Top Floating Header */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="brain" size={13} />
              <span>Behavioral Psychology & Ego Preservation</span>
            </div>
            <h2 className={styles.labTitle}>Cognitive Dissonance — The Self-Justification Engine</h2>
          </div>

          <div className={styles.statsCluster}>
            <div className={`${styles.statPill} ${dissonanceScore > 50 ? styles.statPillCrisis : styles.statPillHarmonious}`}>
              <span className={styles.statLabel}>Psychological Tension (ΔΨ)</span>
              <span className={`${styles.statValue} ${dissonanceScore > 50 ? styles.statValueCrisis : styles.statValueHarmonious}`}>
                {dissonanceScore}% {dissonanceScore > 50 ? 'Critical' : 'Equilibrium'}
              </span>
            </div>
            <div className={`${styles.statPill} ${taskRating > 0 ? styles.statPillHarmonious : ''}`}>
              <span className={styles.statLabel}>Subconscious Enjoyment Rating</span>
              <span className={`${styles.statValue} ${taskRating > 0 ? styles.statValueHarmonious : ''}`}>
                {taskRating > 0 ? `+${taskRating.toFixed(1)}` : taskRating.toFixed(1)} / 10
              </span>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className={styles.modeTabs}>
          <button
            type="button"
            className={`${styles.modeTab} ${activeMode === 'festinger1959' ? styles.modeTabActive : ''}`}
            onClick={() => setActiveMode('festinger1959')}
          >
            <Icon name="zap" size={13} />
            <span>1. The $1 vs $20 Experiment (1959)</span>
          </button>
          <button
            type="button"
            className={`${styles.modeTab} ${activeMode === 'prophecy1954' ? styles.modeTabActive : ''}`}
            onClick={() => setActiveMode('prophecy1954')}
          >
            <Icon name="clock" size={13} />
            <span>2. When Prophecy Fails (1954)</span>
          </button>
          <button
            type="button"
            className={`${styles.modeTab} ${activeMode === 'gyroscope' ? styles.modeTabActive : ''}`}
            onClick={() => setActiveMode('gyroscope')}
          >
            <Icon name="compass" size={13} />
            <span>3. Tension Equilibrium Engine</span>
          </button>
        </div>

        {/* 3D WebGL Canvas */}
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Floating Stage Badges */}
        <div className={styles.inCanvasBadges}>
          {activeMode === 'festinger1959' && (
            <>
              <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightLeft}`}>
                <Icon name="layers" size={12} />
                <span>48-Peg Boredom Board ({pegTurnCount} Turns)</span>
              </div>
              <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightCenter}`}>
                <Icon name="zap" size={12} />
                <span>Bribe: {bribeCondition === 'bribe20' ? '$20 (High Justification)' : bribeCondition === 'bribe1' ? '$1 (Insufficient Justification)' : '$0 Control'}</span>
              </div>
              <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightRight}`}>
                <Icon name="brain" size={12} />
                <span>Subconscious Memory Distortion: {dissonanceScore > 50 ? 'Active (Rewriting Belief)' : 'Dormant (Truth Intact)'}</span>
              </div>
            </>
          )}

          {activeMode === 'prophecy1954' && (
            <>
              <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightLeft}`}>
                <Icon name="clock" size={12} />
                <span>Midnight Watch: {prophecyTime >= 285 ? '4:45 AM (Prophecy Collapsed)' : '12:00 AM (Awaiting Clarion)'}</span>
              </div>
              <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightCenter}`}>
                <Icon name="alert" size={12} />
                <span>Sunk Cost Sacrifice: {cultSacrifice}%</span>
              </div>
              <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightRight}`}>
                <Icon name="zap" size={12} />
                <span>Proselytizing Conviction: {cultSacrifice > 60 ? '100% Extreme Fanaticism' : '30% Casual'}</span>
              </div>
            </>
          )}

          {activeMode === 'gyroscope' && (
            <>
              <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightLeft}`}>
                <Icon name="compass" size={12} />
                <span>Node A: Self-Worth (&quot;I am moral &amp; wise&quot;)</span>
              </div>
              <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightRight}`}>
                <Icon name="alert" size={12} />
                <span>Node B: Behavior (&quot;I performed an absurd action&quot;)</span>
              </div>
            </>
          )}
        </div>

        {/* Floating Telemetry Badge */}
        <div className={styles.statusFloatingOverlay}>
          <div className={dissonanceScore > 50 ? styles.pulseDotCrisis : styles.pulseDot} />
          <span>
            {activeMode === 'festinger1959'
              ? bribeCondition === 'bribe1'
                ? 'Acute Dissonance: Subject paid only $1 to lie. Lacking external justification, the brain rewrites its attitude to believe the boring task was genuinely fascinating.'
                : bribeCondition === 'bribe20'
                ? 'Low Dissonance: $20 provides full external justification. The subject honestly admits the task was dreadful with zero ego threat.'
                : 'Control: No reward or forced compliance. Task is objectively rated -5.0 (dull).'
              : activeMode === 'prophecy1954'
              ? 'When December 21 passed with no flood, high-commitment cultists did not disband; they rationalized that their vigil saved humanity, exploding into proselytizing.'
              : 'The Mind Equilibrium Engine: To relieve psychological strain, humans will distort their core beliefs before acknowledging personal foolishness.'}
          </span>
        </div>
      </div>

      {/* Control Console */}
      <div className={styles.controlPanel}>
        {/* Mode 1: Festinger $1 vs $20 Controls */}
        {activeMode === 'festinger1959' && (
          <>
            <div className={styles.presetContainer}>
              <span className={styles.presetLabel}>Stanford Experiment Conditions (1959)</span>
              <div className={styles.presetRow}>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${bribeCondition === 'bribe1' ? styles.presetBtnActive : ''}`}
                  onClick={() => setBribeCondition('bribe1')}
                >
                  <Icon name="alert" size={13} />
                  <span>$1 Payment (Insufficient Justification → Belief Warps to &quot;Fun!&quot;)</span>
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${bribeCondition === 'bribe20' ? styles.presetBtnActive : ''}`}
                  onClick={() => setBribeCondition('bribe20')}
                >
                  <Icon name="check" size={13} />
                  <span>$20 Payment (Sufficient External Justification → Truth Retained)</span>
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${bribeCondition === 'control0' ? styles.presetBtnActive : ''}`}
                  onClick={() => setBribeCondition('control0')}
                >
                  <Icon name="layers" size={13} />
                  <span>$0 Control (No Lie / Honest Baseline)</span>
                </button>
              </div>
            </div>

            <div className={styles.controlRow}>
              <div className={styles.sliderCard}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Laboratory Task (Turning Wooden Pegs)</span>
                  <span className={styles.sliderValue}>{pegTurnCount} Turns</span>
                </div>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={handleTurnPegs}
                  style={{ alignSelf: 'flex-start', marginTop: 4 }}
                >
                  <Icon name="rotate-ccw" size={14} />
                  <span>Rotate 48 Wooden Pegs 90°</span>
                </button>
                <p className={styles.sliderDesc}>
                  Subjects were forced to turn 48 pegs one-by-one clockwise for an entire hour. The task was designed to be undeniably tedious.
                </p>
              </div>

              <div className={styles.sliderCard}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Ego Defense Mechanism Status</span>
                  <span className={styles.sliderValue} style={{ color: dissonanceScore > 50 ? '#ef4444' : '#10b981' }}>
                    {dissonanceScore > 50 ? 'Subconscious Rationalization Active' : 'Transparent External Justification'}
                  </span>
                </div>
                <p className={styles.sliderDesc}>
                  {bribeCondition === 'bribe1'
                    ? 'The participant cannot stomach being a liar for a measly buck. The subconscious brain resolves the internal conflict by altering authentic memory: "I actually found the pegs enjoyable!"'
                    : '$20 was worth two days of wages in 1959. Because the participant has an airtight financial excuse ("I did it for twenty dollars"), the ego is protected without distorting reality.'}
                </p>
              </div>
            </div>

            <div className={styles.mindWarpBox}>
              <div className={styles.mindFormula}>
                ΔΨ = Dissonant Cognition / External Justification
              </div>
              <div className={styles.mindExplain}>
                {bribeCondition === 'bribe1'
                  ? '⚠️ Insufficient Justification Paradox: Less reward creates MORE attitude change, because internal belief is the only variable the brain can alter to restore psychological balance.'
                  : 'ℹ️ High External Justification: The presence of a compelling external incentive ($20) insulates the ego from cognitive dissonance.'}
              </div>
            </div>
          </>
        )}

        {/* Mode 2: When Prophecy Fails Controls */}
        {activeMode === 'prophecy1954' && (
          <div className={styles.controlRow}>
            <div className={styles.sliderCard}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>Cultist Irreversible Commitment (Sunk Cost)</span>
                <span className={styles.sliderValue}>{cultSacrifice}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={cultSacrifice}
                onChange={(e) => setCultSacrifice(parseInt(e.target.value, 10))}
                className={styles.rangeInput}
              />
              <p className={styles.sliderDesc}>
                Giving away family savings, destroying bank accounts, and quitting careers creates catastrophic psychological irreversibility.
              </p>
            </div>

            <div className={styles.sliderCard}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>Prophecy Timeline Hour</span>
                <span className={styles.sliderValue}>
                  {prophecyTime >= 285 ? '4:45 AM (The Telepathic Excuse)' : prophecyTime === 0 ? 'Midnight (Disconfirmation)' : '11:59 PM (Tension)'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="15"
                value={prophecyTime}
                onChange={(e) => setProphecyTime(parseInt(e.target.value, 10))}
                className={styles.rangeInput}
              />
              <p className={styles.sliderDesc}>
                At 4:45 AM, leader Marian Keech received the &quot;message from Clarion&quot;: God spared Earth because of their faith. Fervent proselytizing immediately replaced despair.
              </p>
            </div>
          </div>
        )}

        {/* Mode 3: Gyroscope Tension Controls */}
        {activeMode === 'gyroscope' && (
          <>
            <div className={styles.presetContainer}>
              <span className={styles.presetLabel}>Cognitive Resolution Mechanism</span>
              <div className={styles.presetRow}>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${resolutionStrategy === 'distort' ? styles.presetBtnActive : ''}`}
                  onClick={() => setResolutionStrategy('distort')}
                >
                  <Icon name="brain" size={13} />
                  <span>1. Distort Belief (Sour Grapes / &quot;I meant to do that&quot;)</span>
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${resolutionStrategy === 'justify' ? styles.presetBtnActive : ''}`}
                  onClick={() => setResolutionStrategy('justify')}
                >
                  <Icon name="layers" size={13} />
                  <span>2. Invent External Excuse (&quot;Everyone does it&quot;)</span>
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${resolutionStrategy === 'admit' ? styles.presetBtnActive : ''}`}
                  onClick={() => setResolutionStrategy('admit')}
                >
                  <Icon name="alert" size={13} />
                  <span>3. Acknowledge Error (Painful Ego Exposure)</span>
                </button>
              </div>
            </div>

            <div className={styles.controlRow}>
              <div className={styles.sliderCard}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Contradiction Magnitude</span>
                  <span className={styles.sliderValue}>{discrepancySeverity}% Conflict</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={discrepancySeverity}
                  onChange={(e) => setDiscrepancySeverity(parseInt(e.target.value, 10))}
                  className={styles.rangeInput}
                />
                <p className={styles.sliderDesc}>
                  Distance between self-image (&quot;I am moral, rational, and competent&quot;) and reality (&quot;I made a ruinous or deceitful decision&quot;).
                </p>
              </div>

              <div className={styles.sliderCard}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Equilibrium State</span>
                  <span className={styles.sliderValue} style={{ color: resolutionStrategy === 'distort' ? '#10b981' : '#e5a93c' }}>
                    {resolutionStrategy === 'distort' ? 'Self-Delusion Restores Balance' : resolutionStrategy === 'admit' ? 'Ego Shock / Growth' : 'Partial Relief'}
                  </span>
                </div>
                <p className={styles.sliderDesc}>
                  Because acknowledging error feels like psychological amputation, humans overwhelmingly choose belief distortion to artificially restore peace of mind.
                </p>
              </div>
            </div>
          </>
        )}

        {/* 3-Card Pedagogical Walkthrough Grid */}
        <div className={styles.pedagogyGrid}>
          <div className={styles.pedagogyCard}>
            <span className={styles.pedagogyStep}>Act I · The Conflict</span>
            <h4 className={styles.pedagogyTitle}>The Incompatible Cognitions</h4>
            <p className={styles.pedagogyText}>
              Holding two contradictory realities creates acute mental anguish in the anterior cingulate cortex, demanding immediate resolution.
            </p>
          </div>
          <div className={styles.pedagogyCard}>
            <span className={styles.pedagogyStep}>Act II · The Justification Trap</span>
            <h4 className={styles.pedagogyTitle}>Insufficient Justification</h4>
            <p className={styles.pedagogyText}>
              When people lack external excuses ($1 vs $20), they are forced to change their internal beliefs to maintain a coherent self-image.
            </p>
          </div>
          <div className={styles.pedagogyCard}>
            <span className={styles.pedagogyStep}>Act III · The Danger</span>
            <h4 className={styles.pedagogyTitle}>Institutional Blind Spots</h4>
            <p className={styles.pedagogyText}>
              From medical blunders to sinking money into bad investments, cognitive dissonance causes leaders to double down rather than admit fallibility.
            </p>
          </div>
        </div>

        {/* Philosophical Insight Card */}
        <div className={styles.insightCard}>
          <strong>Aesop&apos;s Fable (500 BC):</strong> When the fox could not reach the high grapes, he declared: <em>&quot;The grapes were sour anyway.&quot;</em> Rather than admitting inadequacy, humans twist their appraisal of reality. Self-justification is the brain&apos;s immune system for the ego.
        </div>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <div className={styles.actionBtnGroup}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => {
                setBribeCondition('bribe1');
                setPegTurnCount(0);
              }}
            >
              <Icon name="rotate-ccw" size={14} />
              <span>Reset Experiment</span>
            </button>

            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleRecordRun}
            >
              <Icon name="zap" size={14} />
              <span>Record Psychological Telemetry</span>
            </button>
          </div>

          {hasRecorded && (
            <span className={styles.actionFeedback}>
              <Icon name="check" size={14} />
              <span>Cognitive State Recorded to Cloud Database</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
