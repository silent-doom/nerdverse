'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './BayesTheorem3DLab.module.css';
import Icon from '@/components/common/Icon';

export default function BayesTheorem3DLab() {
  const mountRef = useRef(null);

  // Bayesian parameters (percentages)
  const [baseRate, setBaseRate] = useState(0.1); // 0.1% prevalence
  const [sensitivity, setSensitivity] = useState(99.0); // 99% true positive
  const [falsePositiveRate, setFalsePositiveRate] = useState(5.0); // 5% false positive
  const [isScanning, setIsScanning] = useState(false);
  const [isPartitioned, setIsPartitioned] = useState(true);

  // 100,000 population cohort calculations
  const totalCohort = 100000;
  const stats = useMemo(() => {
    const pD = baseRate / 100;
    const pSens = sensitivity / 100;
    const pFPR = falsePositiveRate / 100;

    const diseasedCount = totalCohort * pD;
    const healthyCount = totalCohort * (1 - pD);

    const truePositives = Math.round(diseasedCount * pSens);
    const falseNegatives = Math.round(diseasedCount * (1 - pSens));
    const falsePositives = Math.round(healthyCount * pFPR);
    const trueNegatives = Math.round(healthyCount * (1 - pFPR));

    const totalPositives = truePositives + falsePositives;
    const posteriorPct = totalPositives > 0
      ? ((truePositives / totalPositives) * 100).toFixed(2)
      : '0.00';

    return {
      diseasedCount: Math.round(diseasedCount),
      healthyCount: Math.round(healthyCount),
      truePositives,
      falseNegatives,
      falsePositives,
      trueNegatives,
      totalPositives,
      posteriorPct,
    };
  }, [baseRate, sensitivity, falsePositiveRate]);

  // Three.js refs
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    instancedMesh: null,
    scanPlane: null,
    voxelData: [],
    animId: null,
  });

  // Apply Presets
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
    }
  }, []);

  // Trigger Scanning Laser Plane
  const triggerScan = useCallback(() => {
    setIsScanning(true);
    const three = threeRef.current;
    if (three.scanPlane) {
      three.scanPlane.position.z = -18;
      three.scanPlane.visible = true;
    }
  }, []);

  // ── Three.js Scene Setup ──
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06080e, 0.012);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    camera.position.set(22, 24, 30);

    // 2. Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 80;
    controls.minDistance = 10;
    controls.target.set(0, 2, 0);

    // 4. Studio Lighting (Crisp, balanced clinical diagnostic illumination)
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 1.45);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfff7ed, 2.5);
    mainKeyLight.position.set(12, 24, 16);
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.35);
    fillLight.position.set(-14, 16, 12);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(0, 10, -16);
    scene.add(rimLight);

    const centerSpot = new THREE.SpotLight(0x38bdf8, 3.2, 45, Math.PI / 3.5, 0.4);
    centerSpot.position.set(0, 22, 4);
    scene.add(centerSpot);

    // 5. Grid Helper Floor
    const grid = new THREE.GridHelper(40, 20, 0x1e293b, 0x0f172a);
    grid.position.y = -0.5;
    scene.add(grid);

    // 6. Population Instanced Mesh (36 x 36 grid = 1,296 voxels)
    const gridSize = 36;
    const totalVoxels = gridSize * gridSize;
    const boxGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
    const boxMat = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 0.2,
    });
    const instancedMesh = new THREE.InstancedMesh(boxGeo, boxMat, totalVoxels);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    // Build voxel coordinate metadata
    const dummy = new THREE.Object3D();
    const voxelData = [];
    let idx = 0;
    const spacing = 0.8;
    const offset = ((gridSize - 1) * spacing) / 2;

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const posX = x * spacing - offset;
        const posZ = z * spacing - offset;
        dummy.position.set(posX, 0, posZ);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(idx, dummy.matrix);

        voxelData.push({
          idx,
          baseX: posX,
          baseZ: posZ,
          targetY: 0,
          currentY: 0,
          color: new THREE.Color(0x13151c),
        });
        idx++;
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;

    // 7. Scanning Laser Plane (Warm Amber Translucent Beam)
    const scanGeo = new THREE.PlaneGeometry(36, 1.5);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0xe5a93c,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    scanPlane.rotation.x = Math.PI / 2;
    scanPlane.position.set(0, 0.5, -18);
    scanPlane.visible = false;
    scene.add(scanPlane);

    // 7b. Load Blender-crafted Diagnostic Scanner Console
    const loader = new GLTFLoader();
    loader.load(
      '/models/diagnostic_scanner.glb',
      (gltf) => {
        const scannerModel = gltf.scene;
        scannerModel.position.set(0, 0, -17.5);
        scannerModel.scale.set(1.4, 1.4, 1.4);
        scene.add(scannerModel);
      },
      undefined,
      () => {}
    );

    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      instancedMesh,
      scanPlane,
      voxelData,
      animId: null,
    };

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    const animate = () => {
      controls.update();

      const three = threeRef.current;
      if (three.scanPlane && three.scanPlane.visible) {
        three.scanPlane.position.z += 0.35;
        if (three.scanPlane.position.z > 18) {
          three.scanPlane.visible = false;
          setIsScanning(false);
        }
      }

      // Smooth levitation of partitioned positive voxels
      if (three.instancedMesh && three.voxelData) {
        let needsUpdate = false;
        three.voxelData.forEach((v) => {
          if (Math.abs(v.currentY - v.targetY) > 0.01) {
            v.currentY += (v.targetY - v.currentY) * 0.1;
            dummy.position.set(v.baseX, v.currentY, v.baseZ);
            dummy.updateMatrix();
            three.instancedMesh.setMatrixAt(v.idx, dummy.matrix);
            needsUpdate = true;
          }
        });
        if (needsUpdate) {
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

  // ── Sync Three.js Voxel Colors & Heights with Bayesian State ──
  useEffect(() => {
    const three = threeRef.current;
    if (!three.instancedMesh || !three.voxelData || three.voxelData.length === 0) return;

    const total = three.voxelData.length; // 1,296 voxels
    const pD = baseRate / 100;
    const pSens = sensitivity / 100;
    const pFPR = falsePositiveRate / 100;

    // Calculate exact number of voxels in each category
    const sickTotal = Math.max(1, Math.round(total * pD));
    const healthyTotal = total - sickTotal;

    const sickPos = Math.max(1, Math.round(sickTotal * pSens));
    const sickNeg = sickTotal - sickPos;
    const healthyPos = Math.round(healthyTotal * pFPR);
    const healthyNeg = healthyTotal - healthyPos;

    // Color definitions (Monotone / Duotone Scholarly Amber & Obsidian Slate)
    const colorTruePos = new THREE.Color(0xe5a93c); // Signature Amber (Diseased & Flagged +)
    const colorFalsePos = new THREE.Color(0x9ca3af); // Muted Slate (Healthy & Falsely Flagged +)
    const colorFalseNeg = new THREE.Color(0x4b5563); // Charcoal (Diseased & Missed -)
    const colorTrueNeg = new THREE.Color(0x13151c); // Surface Graphite (Healthy & Cleared -)

    three.voxelData.forEach((v, i) => {
      let col;
      let isPositive = false;

      if (i < sickPos) {
        col = colorTruePos;
        isPositive = true;
      } else if (i < sickPos + sickNeg) {
        col = colorFalseNeg;
        isPositive = false;
      } else if (i < sickPos + sickNeg + healthyPos) {
        col = colorFalsePos;
        isPositive = true;
      } else {
        col = colorTrueNeg;
        isPositive = false;
      }

      three.instancedMesh.setColorAt(v.idx, col);

      // Levitate positives into upper triage tier
      v.targetY = (isPartitioned && isPositive) ? 3.5 : 0;
    });

    if (three.instancedMesh.instanceColor) {
      three.instancedMesh.instanceColor.needsUpdate = true;
    }
  }, [baseRate, sensitivity, falsePositiveRate, isPartitioned]);

  return (
    <div className={styles.labContainer} data-testid="bayes-theorem-3d-lab">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className={styles.canvasWrapper} />

      {/* Top Floating Header & Posterior Readout */}
      <div className={styles.topHeader}>
        <div className={styles.headerTitleBox}>
          <div className={styles.labBadge}>
            <Icon name="math" size={13} color="#e5a93c" />
            <span>Bayesian Contingency Projection</span>
          </div>
          <h2 className={styles.labTitle}>Bayes' Theorem 3D Diagnostic Lab</h2>
        </div>

        <div className={styles.posteriorDisplay}>
          <span className={styles.posteriorLabel}>True Posterior Probability P(D|+)</span>
          <span className={styles.posteriorValue}>{stats.posteriorPct}%</span>
        </div>
      </div>

      {/* 3D Visual Legend */}
      <div className={styles.hudLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#e5a93c' }} />
          <span>True Positive (Diseased & Flagged): {stats.truePositives.toLocaleString()}</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#9ca3af' }} />
          <span>False Positive (Healthy & Falsely Flagged): {stats.falsePositives.toLocaleString()}</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#21232c' }} />
          <span>True Negative (Healthy & Cleared): {stats.trueNegatives.toLocaleString()}</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#4b5563' }} />
          <span>False Negative (Diseased & Missed): {stats.falseNegatives.toLocaleString()}</span>
        </div>
      </div>

      {/* Status Bar */}
      <div className={styles.scanStatus}>
        <Icon name="zap" size={14} color={isScanning ? '#e5a93c' : '#9ca3af'} />
        <span>{isScanning ? 'Laser Scanning Cohort...' : 'Population Matrix Ready · Levitation Shows Triage Floor'}</span>
      </div>

      {/* Interactive Controls & Telemetry Dashboard */}
      <div className={styles.dashboard}>
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
              min="0.01"
              max="10.0"
              step="0.05"
              value={baseRate}
              onChange={(e) => setBaseRate(parseFloat(e.target.value))}
              className={styles.rangeInput}
            />
            <p className={styles.sliderDesc}>
              The underlying frequency of the condition in the general population ({stats.diseasedCount.toLocaleString()} out of 100,000).
            </p>
          </div>

          {/* Slider 2: Test Sensitivity */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>2. Test Sensitivity P(+|D)</span>
              <span className={styles.sliderValue}>{sensitivity.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              aria-label="Test Sensitivity P(+|D)"
              min="50.0"
              max="99.9"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className={styles.rangeInput}
            />
            <p className={styles.sliderDesc}>
              The probability that an infected patient correctly tests positive (True Positive Rate).
            </p>
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
              max="20.0"
              step="0.1"
              value={falsePositiveRate}
              onChange={(e) => setFalsePositiveRate(parseFloat(e.target.value))}
              className={styles.rangeInput}
            />
            <p className={styles.sliderDesc}>
              The probability that a completely healthy person is falsely flagged positive.
            </p>
          </div>
        </div>

        {/* 100,000 Cohort Contingency Telemetry */}
        <div className={styles.matrixStatsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Positive Tests</span>
            <span className={styles.statVal} style={{ color: '#f9fafb' }}>
              {stats.totalPositives.toLocaleString()}
            </span>
            <span className={styles.statDesc}>All flagged individuals</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>True Positives</span>
            <span className={styles.statVal} style={{ color: '#e5a93c' }}>
              {stats.truePositives.toLocaleString()}
            </span>
            <span className={styles.statDesc}>Actually infected</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>False Positives</span>
            <span className={styles.statVal} style={{ color: '#9ca3af' }}>
              {stats.falsePositives.toLocaleString()}
            </span>
            <span className={styles.statDesc}>Healthy people panicked</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Bayesian Ratio</span>
            <span className={styles.statVal} style={{ color: '#e5a93c' }}>
              {stats.truePositives} / {stats.totalPositives}
            </span>
            <span className={styles.statDesc}>True vs Total Flagged</span>
          </div>
        </div>

        {/* Presets & Scan Buttons */}
        <div className={styles.presetsRow}>
          <div className={styles.presetBtns}>
            <button className={styles.presetBtn} onClick={() => applyPreset('rare-disease')}>
              Rare Disease (0.1% / 99% / 5%)
            </button>
            <button className={styles.presetBtn} onClick={() => applyPreset('mammogram')}>
              Mammogram (1% / 90% / 8%)
            </button>
            <button className={styles.presetBtn} onClick={() => applyPreset('phishing')}>
              Phishing Filter (5% / 98% / 2%)
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setIsPartitioned(!isPartitioned)}
              style={{ borderColor: isPartitioned ? '#e5a93c' : 'var(--color-border-default, #21232c)' }}
            >
              {isPartitioned ? 'Flatten Grid' : 'Levitate Triage Floor'}
            </button>
          </div>

          <button className={styles.scanBtn} onClick={triggerScan}>
            <Icon name="zap" size={14} color="#08090c" />
            <span>Run Laser Scan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
