'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import styles from './BayesTheorem3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

export default function BayesTheorem3DLab() {
  const mountRef = useRef(null);

  // Bayesian parameters (percentages)
  const [baseRate, setBaseRate] = useState(0.1); // 0.1% prevalence (1 in 1,000)
  const [sensitivity, setSensitivity] = useState(99.0); // 99% true positive
  const [falsePositiveRate, setFalsePositiveRate] = useState(5.0); // 5% false positive
  const [viewMode, setViewMode] = useState('triage'); // 'triage' (split chambers) | 'cohort' (unified matrix) | 'posterior' (focus positive only)
  const [isScanning, setIsScanning] = useState(false);
  const [isLevitated, setIsLevitated] = useState(true);

  // 1,000 Citizen Cohort Calculation
  const cohortTotal = 1000;
  const stats = useMemo(() => {
    const pD = baseRate / 100;
    const pSens = sensitivity / 100;
    const pFPR = falsePositiveRate / 100;

    const diseasedCount = 100000 * pD;
    const healthyCount = 100000 * (1 - pD);

    const truePositives100k = Math.round(diseasedCount * pSens);
    const falsePositives100k = Math.round(healthyCount * pFPR);
    const totalPositives100k = truePositives100k + falsePositives100k;

    const posteriorPct = totalPositives100k > 0
      ? ((truePositives100k / totalPositives100k) * 100).toFixed(2)
      : '0.00';

    // 1,000 Visual 3D Cohort
    const sickCount = Math.max(1, Math.round(cohortTotal * pD));
    const healthyCount1k = cohortTotal - sickCount;
    const truePositives = Math.max(1, Math.round(sickCount * pSens));
    const falseNegatives = sickCount - truePositives;
    const falsePositives = Math.max(0, Math.round(healthyCount1k * pFPR));
    const trueNegatives = healthyCount1k - falsePositives;
    const totalPositives = truePositives + falsePositives;

    return {
      sickCount,
      healthyCount: healthyCount1k,
      truePositives,
      falseNegatives,
      falsePositives,
      trueNegatives,
      totalPositives,
      posteriorPct,
      pop100k_sick: Math.round(diseasedCount),
      pop100k_tp: truePositives100k,
      pop100k_fp: falsePositives100k,
      pop100k_totalPos: totalPositives100k,
    };
  }, [baseRate, sensitivity, falsePositiveRate]);

  // Three.js refs
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    instancedMesh: null,
    particles: [],
    scannerMesh: null,
    pillarTP: null,
    pillarFP: null,
    posPlatform: null,
    posTrim: null,
    animId: null,
  });

  useEffect(() => {
    const three = threeRef.current;
    if (three.posPlatform && three.posTrim) {
      three.posPlatform.position.y = isLevitated ? 0.8 : 0.05;
      three.posTrim.position.y = isLevitated ? 1.06 : 0.31;
    }
  }, [isLevitated]);

  // Camera presets
  const setCameraPreset = useCallback((preset) => {
    const three = threeRef.current;
    if (!three.camera || !three.controls) return;
    if (preset === 'lab') {
      three.camera.position.set(0, 18, 26);
      three.controls.target.set(0, 1.5, 0);
    } else if (preset === 'positive') {
      three.camera.position.set(-7, 10, 14);
      three.controls.target.set(-7, 2.5, 0);
    } else if (preset === 'top') {
      three.camera.position.set(0, 32, 2);
      three.controls.target.set(0, 0, 0);
    }
    three.controls.update();
  }, []);

  // Presets
  const applyPreset = useCallback((preset) => {
    if (preset === 'rare-disease') {
      setBaseRate(0.1);
      setSensitivity(99.0);
      setFalsePositiveRate(5.0);
    } else if (preset === 'mammogram') {
      setBaseRate(1.0);
      setSensitivity(90.0);
      setFalsePositiveRate(8.0);
    } else if (preset === 'phishing') {
      setBaseRate(5.0);
      setSensitivity(98.0);
      setFalsePositiveRate(2.0);
    } else if (preset === 'high-prevalence') {
      setBaseRate(15.0);
      setSensitivity(95.0);
      setFalsePositiveRate(3.0);
    }
  }, []);

  // Trigger Holographic Laser Scan
  const triggerScan = useCallback(() => {
    setIsScanning(true);
    const three = threeRef.current;
    if (three.scannerMesh) {
      three.scannerMesh.position.z = -14;
      three.scannerMesh.visible = true;
    }

    recordConceptRun('bayes-theorem', 'single', {
      baseRate,
      sensitivity,
      falsePositiveRate,
      posteriorPct: parseFloat(stats.posteriorPct),
    });

    setTimeout(() => {
      setIsScanning(false);
    }, 1800);
  }, [baseRate, sensitivity, falsePositiveRate, stats.posteriorPct]);

  // Three.js Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene & Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 18, 26);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 60;
    controls.minDistance = 8;
    controls.target.set(0, 1.5, 0);

    // 2. Studio Lighting (Clean, luminous laboratory atmosphere)
    const ambientLight = new THREE.AmbientLight(0xf1f5f9, 1.6);
    scene.add(ambientLight);

    const mainKey = new THREE.DirectionalLight(0xfff7ed, 2.8);
    mainKey.position.set(10, 22, 14);
    scene.add(mainKey);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-14, 16, -10);
    scene.add(fillLight);

    const positiveSpot = new THREE.SpotLight(0xf59e0b, 3.5, 25, Math.PI / 4, 0.5);
    positiveSpot.position.set(-7, 14, 2);
    const posTarget = new THREE.Object3D();
    posTarget.position.set(-7, 2, 0);
    scene.add(posTarget);
    positiveSpot.target = posTarget;
    scene.add(positiveSpot);

    const clearedSpot = new THREE.SpotLight(0x38bdf8, 2.5, 30, Math.PI / 3.5, 0.4);
    clearedSpot.position.set(6, 16, 2);
    const clearTarget = new THREE.Object3D();
    clearTarget.position.set(6, 0, 0);
    scene.add(clearTarget);
    clearedSpot.target = clearTarget;
    scene.add(clearedSpot);

    // 3. Laboratory Deck & Chamber Platforms
    // Main High-Tech Base Deck
    const deckGeo = new THREE.BoxGeometry(32, 0.4, 18);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x11131a, roughness: 0.5, metalness: 0.8 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, -0.2, 0);
    scene.add(deck);

    // Grid wireframe on deck
    const grid = new THREE.GridHelper(30, 24, 0xe5a93c, 0x1e293b);
    grid.position.set(0, 0.01, 0);
    scene.add(grid);

    // Left Chamber Platform: "POSITIVE TEST REGISTRY" (Elevated & Amber Trim)
    const posPlatGeo = new THREE.BoxGeometry(11, 0.5, 12);
    const posPlatMat = new THREE.MeshStandardMaterial({ color: 0x181410, roughness: 0.35, metalness: 0.85 });
    const posPlatform = new THREE.Mesh(posPlatGeo, posPlatMat);
    posPlatform.position.set(-7.5, 0.8, 0);
    scene.add(posPlatform);

    const posTrim = new THREE.Mesh(
      new THREE.BoxGeometry(11.2, 0.1, 12.2),
      new THREE.MeshBasicMaterial({ color: 0xe5a93c })
    );
    posTrim.position.set(-7.5, 1.06, 0);
    scene.add(posTrim);

    // Right Chamber Platform: "CLEARED NEGATIVE REGISTRY" (Cyan / Slate Trim)
    const negPlatGeo = new THREE.BoxGeometry(14, 0.3, 14);
    const negPlatMat = new THREE.MeshStandardMaterial({ color: 0x0f141c, roughness: 0.45, metalness: 0.75 });
    const negPlatform = new THREE.Mesh(negPlatGeo, negPlatMat);
    negPlatform.position.set(6.5, 0.05, 0);
    scene.add(negPlatform);

    const negTrim = new THREE.Mesh(
      new THREE.BoxGeometry(14.2, 0.06, 14.2),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    negTrim.position.set(6.5, 0.21, 0);
    scene.add(negTrim);

    // 4. Holographic Ratio Columns in Foreground
    // Shows the exact physical ratio between True Positives vs False Positives
    const pillarMatTP = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.2,
    });
    const pillarMatFP = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2,
    });

    const pillarTP = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1, 24), pillarMatTP);
    pillarTP.position.set(-2.0, 0.5, 8.2);
    scene.add(pillarTP);

    const pillarFP = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1, 24), pillarMatFP);
    pillarFP.position.set(2.0, 0.5, 8.2);
    scene.add(pillarFP);

    // 5. 1,000 Cohort Citizens (Instanced Cylindrical Micro-Capsules)
    const capsuleGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.38, 12);
    const capsuleMat = new THREE.MeshStandardMaterial({
      roughness: 0.25,
      metalness: 0.65,
    });

    const instancedMesh = new THREE.InstancedMesh(capsuleGeo, capsuleMat, cohortTotal);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    // Generate metadata for all 1,000 individuals
    // In cohort view: 25 rows x 40 cols
    const particles = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < cohortTotal; i++) {
      const row = Math.floor(i / 40);
      const col = i % 40;

      // Centered unified cohort matrix coords
      const cohortX = (col - 19.5) * 0.62;
      const cohortZ = (row - 12) * 0.58;

      dummy.position.set(cohortX, 0.2, cohortZ);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);

      particles.push({
        idx: i,
        cohortX,
        cohortZ,
        targetX: cohortX,
        targetY: 0.2,
        targetZ: cohortZ,
        targetScale: 1,
        currentX: cohortX,
        currentY: 0.2,
        currentZ: cohortZ,
        currentScale: 1,
        color: new THREE.Color(0x38bdf8),
        category: 'TN', // 'TP' | 'FP' | 'TN' | 'FN'
      });
    }
    instancedMesh.instanceMatrix.needsUpdate = true;

    // 6. Holographic Scanning Laser Beam
    const scannerGeo = new THREE.BoxGeometry(30, 0.08, 0.4);
    const scannerMat = new THREE.MeshBasicMaterial({
      color: 0xe5a93c,
      transparent: true,
      opacity: 0.75,
    });
    const scannerMesh = new THREE.Mesh(scannerGeo, scannerMat);
    scannerMesh.position.set(0, 1.2, -14);
    scannerMesh.visible = false;
    scene.add(scannerMesh);

    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      instancedMesh,
      particles,
      scannerMesh,
      pillarTP,
      pillarFP,
      posPlatform,
      posTrim,
      animId: null,
    };

    // 7. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Render & Animation Loop
    let lastTime = performance.now();
    const animate = (now) => {
      controls.update();

      const three = threeRef.current;
      const curTime = typeof now === 'number' ? now : performance.now();
      const delta = Math.min((curTime - lastTime) / 1000, 0.1);
      lastTime = curTime;

      // Animate laser scan
      if (three.scannerMesh && three.scannerMesh.visible) {
        three.scannerMesh.position.z += delta * 18;
        if (three.scannerMesh.position.z > 14) {
          three.scannerMesh.visible = false;
        }
      }

      // Smooth Particle Lerp Transitions to Target Positions
      if (three.instancedMesh && three.particles.length > 0) {
        let changed = false;
        const lerpSpeed = 7.0 * delta;

        for (let i = 0; i < cohortTotal; i++) {
          const p = three.particles[i];
          const dx = p.targetX - p.currentX;
          const dy = p.targetY - p.currentY;
          const dz = p.targetZ - p.currentZ;
          const ds = p.targetScale - p.currentScale;

          if (Math.abs(dx) > 0.005 || Math.abs(dy) > 0.005 || Math.abs(dz) > 0.005 || Math.abs(ds) > 0.005) {
            p.currentX += dx * lerpSpeed;
            p.currentY += dy * lerpSpeed;
            p.currentZ += dz * lerpSpeed;
            p.currentScale += ds * lerpSpeed;

            dummy.position.set(p.currentX, p.currentY, p.currentZ);
            dummy.scale.set(p.currentScale, p.currentScale, p.currentScale);
            dummy.updateMatrix();
            three.instancedMesh.setMatrixAt(i, dummy.matrix);
            changed = true;
          }
        }

        if (changed) {
          three.instancedMesh.instanceMatrix.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
      three.animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRef.current.animId) cancelAnimationFrame(threeRef.current.animId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Citizen Positions, Categories & Colors
  useEffect(() => {
    const three = threeRef.current;
    if (!three.instancedMesh || !three.particles || three.particles.length === 0) return;

    const { truePositives, falseNegatives, falsePositives, trueNegatives, totalPositives } = stats;

    // Rich, luminous color palette (Scholarly Amber & Ice Slate)
    const colTP = new THREE.Color(0xf59e0b); // Radiant Amber Gold (Sick & Flagged Positive)
    const colFP = new THREE.Color(0xf8fafc); // Bright Ice White (Healthy & False Alarm Positive)
    const colFN = new THREE.Color(0xef4444); // Crimson Coral (Sick & Missed Negative)
    const colTN = new THREE.Color(0x334155); // Deep Slate Crystal (Healthy & Cleared Negative)

    // Assign categories sequentially across 1,000 citizens
    let idx = 0;

    // 1. True Positives
    for (let i = 0; i < truePositives && idx < cohortTotal; i++, idx++) {
      three.particles[idx].category = 'TP';
      three.particles[idx].color = colTP;
    }
    // 2. False Negatives
    for (let i = 0; i < falseNegatives && idx < cohortTotal; i++, idx++) {
      three.particles[idx].category = 'FN';
      three.particles[idx].color = colFN;
    }
    // 3. False Positives
    for (let i = 0; i < falsePositives && idx < cohortTotal; i++, idx++) {
      three.particles[idx].category = 'FP';
      three.particles[idx].color = colFP;
    }
    // 4. True Negatives (All remaining)
    while (idx < cohortTotal) {
      three.particles[idx].category = 'TN';
      three.particles[idx].color = colTN;
      idx++;
    }

    // Determine 3D Coordinates based on View Mode:
    // Mode 'triage': Split into Left (Positive) and Right (Negative) Chambers
    // Mode 'cohort': Unified 25x40 population grid
    // Mode 'posterior': Isolate and enlarge the Positive Test group only
    let posCount = 0;
    let negCount = 0;

    three.particles.forEach((p) => {
      three.instancedMesh.setColorAt(p.idx, p.color);

      if (viewMode === 'cohort') {
        p.targetX = p.cohortX;
        p.targetY = 0.2;
        p.targetZ = p.cohortZ;
        p.targetScale = p.category === 'TP' ? 1.5 : 1.0;
      } else if (viewMode === 'triage') {
        if (p.category === 'TP' || p.category === 'FP') {
          // Left Chamber: Positive Registry (10 x 10 grid layout)
          const r = Math.floor(posCount / 10);
          const c = posCount % 10;
          p.targetX = -11.5 + c * 0.9;
          p.targetY = isLevitated ? 1.35 : 0.35;
          p.targetZ = -4.2 + r * 0.9;
          p.targetScale = p.category === 'TP' ? 1.6 : 1.1;
          posCount++;
        } else {
          // Right Chamber: Cleared Negative Registry (30 cols x 32 rows)
          const r = Math.floor(negCount / 30);
          const c = negCount % 30;
          p.targetX = 0.5 + c * 0.42;
          p.targetY = 0.35;
          p.targetZ = -5.8 + r * 0.38;
          p.targetScale = 0.85;
          negCount++;
        }
      } else if (viewMode === 'posterior') {
        // Focus mode: ONLY Positives are showcased prominently, negatives disappear
        if (p.category === 'TP' || p.category === 'FP') {
          const r = Math.floor(posCount / 8);
          const c = posCount % 8;
          p.targetX = -3.5 + c * 1.0;
          p.targetY = isLevitated ? 1.6 : 0.5;
          p.targetZ = -3.5 + r * 1.0;
          p.targetScale = p.category === 'TP' ? 2.0 : 1.3;
          posCount++;
        } else {
          p.targetX = p.cohortX;
          p.targetY = -3.0; // Sink into floor
          p.targetZ = p.cohortZ;
          p.targetScale = 0.01;
        }
      }
    });

    if (three.instancedMesh.instanceColor) {
      three.instancedMesh.instanceColor.needsUpdate = true;
    }

    // Update Ratio Pillars
    if (three.pillarTP && three.pillarFP) {
      const hTP = Math.max(0.2, (truePositives / Math.max(1, totalPositives)) * 4.5);
      const hFP = Math.max(0.2, (falsePositives / Math.max(1, totalPositives)) * 4.5);

      three.pillarTP.scale.set(1, hTP, 1);
      three.pillarTP.position.y = hTP / 2 + 0.1;

      three.pillarFP.scale.set(1, hFP, 1);
      three.pillarFP.position.y = hFP / 2 + 0.1;
    }
  }, [stats, viewMode, isLevitated]);

  return (
    <div className={styles.labContainer} data-testid="bayes-theorem-3d-lab">
      {/* 3D WebGL Canvas Viewport with Scoped Overlays */}
      <div className={styles.canvasContainer}>
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Top Floating Header */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="activity" size={13} color="#f59e0b" />
              <span>Bayesian Diagnostic Cohort · 1,000 Citizens</span>
            </div>
            <h2 className={styles.labTitle}>Bayes' Theorem 3D Diagnostic Lab</h2>
          </div>

          <div className={styles.posteriorDisplay}>
            <span className={styles.posteriorLabel}>Posterior Probability P(Infected | Positive Test)</span>
            <span className={styles.posteriorValue}>{stats.posteriorPct}%</span>
          </div>
        </div>

        {/* Dynamic 3D Chamber Labels Overlay */}
        <div className={styles.chamberBadges}>
          <div className={styles.positiveChamberBadge}>
            <div className={styles.badgeDotAmber} />
            <div>
              <strong>FLAGGED POSITIVE REGISTRY ({stats.totalPositives})</strong>
              <span>{stats.truePositives} True Patient · {stats.falsePositives} False Alarms</span>
            </div>
          </div>

          <div className={styles.clearedChamberBadge}>
            <div className={styles.badgeDotCyan} />
            <div>
              <strong>CLEARED NEGATIVE REGISTRY ({cohortTotal - stats.totalPositives})</strong>
              <span>{stats.trueNegatives} Healthy Cleared · {stats.falseNegatives} Missed</span>
            </div>
          </div>
        </div>

        {/* View Mode Toolbar Inside Canvas */}
        <div className={styles.viewModeOverlay}>
          <div className={styles.viewModeGroup}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'triage' ? styles.viewBtnActive : ''}`}
              onClick={() => {
                setViewMode('triage');
                setCameraPreset('lab');
              }}
            >
              <Icon name="columns" size={14} />
              <span>Dual-Chamber Triage</span>
            </button>

            <button
              className={`${styles.viewBtn} ${viewMode === 'posterior' ? styles.viewBtnActive : ''}`}
              onClick={() => {
                setViewMode('posterior');
                setCameraPreset('positive');
              }}
            >
              <Icon name="crosshair" size={14} />
              <span>Focus Positive Flagged ({stats.totalPositives})</span>
            </button>

            <button
              className={`${styles.viewBtn} ${viewMode === 'cohort' ? styles.viewBtnActive : ''}`}
              onClick={() => {
                setViewMode('cohort');
                setCameraPreset('top');
              }}
            >
              <Icon name="grid" size={14} />
              <span>Full 1,000 Cohort</span>
            </button>

            <button
              className={styles.viewBtn}
              onClick={() => setIsLevitated(!isLevitated)}
            >
              <Icon name="layers" size={14} />
              <span>{isLevitated ? 'Flatten Grid' : 'Levitate Triage Floor'}</span>
            </button>
          </div>

          <button className={styles.laserScanBtn} onClick={triggerScan} disabled={isScanning}>
            <Icon name="zap" size={14} color="#08090c" />
            <span>{isScanning ? 'Laser Scanning Cohort...' : 'Run Laser Scan'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls & Mathematical Telemetry Dashboard */}
      <div className={styles.dashboard}>
        {/* Step-by-Step Bayesian Formula Readout */}
        <div className={styles.formulaBanner}>
          <span className={styles.formulaTitle}>Bayesian Belief Revision Formula:</span>
          <span className={styles.formulaCode}>
            {`P(D|+) = [P(+|D) × P(D)] / P(+) = ${stats.truePositives} / (${stats.truePositives} + ${stats.falsePositives}) ≈ P(D|+) = ${stats.posteriorPct}%`}
          </span>
        </div>

        {/* Sliders Grid */}
        <div className={styles.controlsGrid}>
          {/* Slider 1: Base Rate */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>1. Base Rate / Disease Prevalence P(D)</span>
              <span className={styles.sliderValue}>{baseRate.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              aria-label="Base Rate / Disease Prevalence P(D)"
              min="0.05"
              max="15.0"
              step="0.05"
              value={baseRate}
              onChange={(e) => setBaseRate(parseFloat(e.target.value))}
              className={styles.rangeInput}
            />
            <div className={styles.sliderFooter}>
              <span>1 in {Math.round(100 / baseRate)} citizens</span>
              <span>{stats.sickCount} sick / 1,000</span>
            </div>
          </div>

          {/* Slider 2: Sensitivity */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>2. Test Sensitivity P(+|D)</span>
              <span className={styles.sliderValue}>{sensitivity.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              aria-label="Test Sensitivity P(+|D)"
              min="80.0"
              max="99.9"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className={styles.rangeInput}
            />
            <div className={styles.sliderFooter}>
              <span>True Positive Accuracy</span>
              <span>Catches {stats.truePositives} of {stats.sickCount}</span>
            </div>
          </div>

          {/* Slider 3: False Positive Rate */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>3. False Positive Rate P(+|H)</span>
              <span className={styles.sliderValue}>{falsePositiveRate.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              aria-label="False Positive Rate P(+|H)"
              min="0.1"
              max="15.0"
              step="0.1"
              value={falsePositiveRate}
              onChange={(e) => setFalsePositiveRate(parseFloat(e.target.value))}
              className={styles.rangeInput}
            />
            <div className={styles.sliderFooter}>
              <span>Healthy False Alarm Rate</span>
              <span>Flags {stats.falsePositives} innocent people!</span>
            </div>
          </div>
        </div>

        {/* 100,000 Patient Real-World Extrapolation Grid */}
        <div className={styles.matrixStatsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>True Positives (Actually Sick)</span>
            <span className={styles.statVal} style={{ color: '#f59e0b' }}>
              {stats.truePositives}
            </span>
            <span className={styles.statDesc}>{stats.pop100k_tp.toLocaleString()} per 100k</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>False Positives (Innocent Flagged)</span>
            <span className={styles.statVal} style={{ color: '#f8fafc' }}>
              {stats.falsePositives}
            </span>
            <span className={styles.statDesc}>{stats.pop100k_fp.toLocaleString()} per 100k</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Positive Test Results</span>
            <span className={styles.statVal} style={{ color: '#e5a93c' }}>
              {stats.totalPositives}
            </span>
            <span className={styles.statDesc}>{stats.pop100k_totalPos.toLocaleString()} per 100k</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Bayesian Odds Given + Test</span>
            <span className={styles.statVal} style={{ color: '#f59e0b' }}>
              1 in {stats.totalPositives > 0 ? Math.round(stats.totalPositives / stats.truePositives) : '∞'}
            </span>
            <span className={styles.statDesc}>Actual sick probability: {stats.posteriorPct}%</span>
          </div>
        </div>

        {/* Real-World Preset Scenarios */}
        <div className={styles.presetsRow}>
          <span className={styles.presetsTitle}>Clinical & Industry Presets:</span>
          <div className={styles.presetBtns}>
            <button className={styles.presetBtn} onClick={() => applyPreset('rare-disease')}>
              🩺 Rare Neurological Disease (0.1% / 99% / 5%)
            </button>
            <button className={styles.presetBtn} onClick={() => applyPreset('mammogram')}>
              🎗️ Mammogram Screening (1.0% / 90% / 8%)
            </button>
            <button className={styles.presetBtn} onClick={() => applyPreset('phishing')}>
              🛡️ AI Cyber Attack Filter (5.0% / 98% / 2%)
            </button>
            <button className={styles.presetBtn} onClick={() => applyPreset('high-prevalence')}>
              🧪 High-Prevalence Outbreak (15% / 95% / 3%)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
