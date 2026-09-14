'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './MaxwellsDemon3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

const KB = 1.380649e-23; // J/K
const T_ENV = 300; // Kelvin ambient room temp

export default function MaxwellsDemon3DLab() {
  const containerRef = useRef(null);
  const mountRef = useRef(null);

  // Simulation controls state
  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const isDoorOpenRef = useRef(false);
  const [sortingEfficiency, setSortingEfficiency] = useState(85); // 0 - 100%
  const sortingEfficiencyRef = useRef(85);
  const [particleSpeedMultiplier, setParticleSpeedMultiplier] = useState(1.0);
  const particleSpeedMultiplierRef = useRef(1.0);

  // Thermodynamic telemetry
  const [tempLeft, setTempLeft] = useState(300);
  const [tempRight, setTempRight] = useState(300);
  const [countLeft, setCountLeft] = useState(90);
  const [countRight, setCountRight] = useState(90);
  const [entropyDelta, setEntropyDelta] = useState(0.0);
  const [bitsErasedTotal, setBitsErasedTotal] = useState(0);
  const [storedBits, setStoredBits] = useState(0);
  const [landauerHeatDissipated, setLandauerHeatDissipated] = useState(0);
  const [isMemoryFlashing, setIsMemoryFlashing] = useState(false);

  // Sync state refs for requestAnimationFrame loop
  useEffect(() => {
    isDoorOpenRef.current = isDoorOpen;
  }, [isDoorOpen]);

  useEffect(() => {
    sortingEfficiencyRef.current = sortingEfficiency;
  }, [sortingEfficiency]);

  useEffect(() => {
    particleSpeedMultiplierRef.current = particleSpeedMultiplier;
  }, [particleSpeedMultiplier]);

  // Three.js scene refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesDataRef = useRef([]);
  const particleMeshRef = useRef(null);
  const shutterMeshRef = useRef(null);
  const demonEyeMeshRef = useRef(null);

  // Handle Landauer bit erasure
  const handleEraseMemory = useCallback(() => {
    if (storedBits === 0) return;
    const bitsToErase = storedBits;
    const heatJ = bitsToErase * KB * T_ENV * Math.LN2;
    const heatNanoJoules = (heatJ * 1e9).toFixed(3);

    setBitsErasedTotal((prev) => prev + bitsToErase);
    setLandauerHeatDissipated((prev) => +(prev + parseFloat(heatNanoJoules)).toFixed(3));
    setStoredBits(0);
    setIsMemoryFlashing(true);
    setTimeout(() => setIsMemoryFlashing(false), 800);

    // Record telemetry run
    recordConceptRun('maxwells-demon', 'single', {
      mode,
      bitsErased: bitsToErase,
      entropyDelta: entropyDelta,
      tempLeft: tempLeft,
      tempRight: tempRight,
      sortingEfficiency: sortingEfficiencyRef.current,
      heatNanoJoules,
    });
  }, [storedBits, mode, entropyDelta, tempLeft, tempRight]);

  // Manual trapdoor keyboard handlers (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode === 'manual' && e.code === 'Space') {
        e.preventDefault();
        setIsDoorOpen(true);
      }
    };
    const handleKeyUp = (e) => {
      if (mode === 'manual' && e.code === 'Space') {
        e.preventDefault();
        setIsDoorOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode]);

  // Three.js initialization
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 800;
    const height = currentMount.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090c);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 11);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const demonSpotLight = new THREE.SpotLight(0xe5a93c, 3.5, 12, Math.PI / 4, 0.4);
    demonSpotLight.position.set(0, 3.2, 0);
    demonSpotLight.target.position.set(0, 0, 0);
    scene.add(demonSpotLight);
    scene.add(demonSpotLight.target);

    // 5. Container Dimensions
    const BOX_HALF_X = 5.0;
    const BOX_HALF_Y = 2.4;
    const BOX_HALF_Z = 2.2;
    const APERTURE_RADIUS = 0.8;

    // 6. Chamber Wireframe / Glass Shell
    const chamberGeo = new THREE.BoxGeometry(BOX_HALF_X * 2, BOX_HALF_Y * 2, BOX_HALF_Z * 2);
    const edgesGeo = new THREE.EdgesGeometry(chamberGeo);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0x222634, linewidth: 1.5 });
    const chamberWire = new THREE.LineSegments(edgesGeo, edgesMat);
    scene.add(chamberWire);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x12141a,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.88,
      thickness: 0.5,
      transparent: true,
      opacity: 0.35,
    });
    const glassMesh = new THREE.Mesh(chamberGeo, glassMat);
    scene.add(glassMesh);

    // 7. Partition Wall & Trapdoor Aperture
    const partitionGroup = new THREE.Group();

    // Top partition segment
    const partTopGeo = new THREE.BoxGeometry(0.12, BOX_HALF_Y - APERTURE_RADIUS, BOX_HALF_Z * 2);
    const partMat = new THREE.MeshStandardMaterial({ color: 0x181a24, metalness: 0.8, roughness: 0.3 });
    const partTop = new THREE.Mesh(partTopGeo, partMat);
    partTop.position.set(0, (BOX_HALF_Y + APERTURE_RADIUS) / 2, 0);
    partitionGroup.add(partTop);

    // Bottom partition segment
    const partBottom = new THREE.Mesh(partTopGeo, partMat);
    partBottom.position.set(0, -(BOX_HALF_Y + APERTURE_RADIUS) / 2, 0);
    partitionGroup.add(partBottom);

    // Partition side segments
    const sideWidth = (BOX_HALF_Z * 2 - APERTURE_RADIUS * 2) / 2;
    const partSideGeo = new THREE.BoxGeometry(0.12, APERTURE_RADIUS * 2, sideWidth);
    const partSideFront = new THREE.Mesh(partSideGeo, partMat);
    partSideFront.position.set(0, 0, (BOX_HALF_Z * 2 - sideWidth) / 2);
    partitionGroup.add(partSideFront);

    const partSideBack = new THREE.Mesh(partSideGeo, partMat);
    partSideBack.position.set(0, 0, -(BOX_HALF_Z * 2 - sideWidth) / 2);
    partitionGroup.add(partSideBack);

    // Shutter / Trapdoor
    const shutterGeo = new THREE.BoxGeometry(0.08, APERTURE_RADIUS * 2, APERTURE_RADIUS * 2);
    const shutterMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xe5a93c,
      emissiveIntensity: 0.15,
    });
    const shutterMesh = new THREE.Mesh(shutterGeo, shutterMat);
    shutterMesh.position.set(0, 0, 0);
    partitionGroup.add(shutterMesh);
    shutterMeshRef.current = shutterMesh;

    // Demon Sensor Eye
    const demonEyeGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const demonEyeMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      emissive: 0xe5a93c,
      emissiveIntensity: 1.2,
    });
    const demonEyeMesh = new THREE.Mesh(demonEyeGeo, demonEyeMat);
    demonEyeMesh.position.set(0, 2.7, 0);
    partitionGroup.add(demonEyeMesh);
    demonEyeMeshRef.current = demonEyeMesh;

    // Load Blender GLB Model for detailed trapdoor aperture if available
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/maxwell_trapdoor.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.9, 0.9, 0.9);
        model.position.set(0, -1.0, 0);
        partitionGroup.add(model);
      },
      undefined,
      () => {
        // Fallback procedural geometry already active
      }
    );

    scene.add(partitionGroup);

    // 8. 3D Particles with Maxwell-Boltzmann Speed Distribution
    const PARTICLE_COUNT = 180;
    const particles = [];
    const dummy = new THREE.Object3D();

    const pGeo = new THREE.SphereGeometry(0.085, 8, 8);
    const pMat = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 0.2,
    });
    const instancedMesh = new THREE.InstancedMesh(pGeo, pMat, PARTICLE_COUNT);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);
    particleMeshRef.current = instancedMesh;

    const vCutoff = 2.0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Half left, half right initial split
      const isLeft = i < PARTICLE_COUNT / 2;
      const x = isLeft ? -Math.random() * (BOX_HALF_X - 0.4) - 0.2 : Math.random() * (BOX_HALF_X - 0.4) + 0.2;
      const y = (Math.random() - 0.5) * (BOX_HALF_Y * 1.8);
      const z = (Math.random() - 0.5) * (BOX_HALF_Z * 1.8);

      // Maxwell-Boltzmann speed profile via Box-Muller normal distribution
      const u1 = Math.max(Math.random(), 1e-6);
      const u2 = Math.random();
      const speedMag = Math.sqrt(-2.0 * Math.log(u1)) * 1.6 + 0.5;

      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const vx = speedMag * Math.sin(phi) * Math.cos(theta);
      const vy = speedMag * Math.sin(phi) * Math.sin(theta);
      const vz = speedMag * Math.cos(phi);

      const isFast = speedMag > vCutoff;

      particles.push({
        x,
        y,
        z,
        vx,
        vy,
        vz,
        speed: speedMag,
        isFast,
      });

      // Set initial color: Fast = Red/Amber (#F87171), Slow = Cyan/Blue (#38BDF8)
      const color = isFast ? new THREE.Color(0xf87171) : new THREE.Color(0x38bdf8);
      instancedMesh.setColorAt(i, color);
    }
    instancedMesh.instanceColor.needsUpdate = true;
    particlesDataRef.current = particles;

    // 9. Camera Orbit Dragging
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= dx * 0.007;
      sphericalPhi = Math.max(-0.5, Math.min(0.8, sphericalPhi + dy * 0.007));

      const radius = 12.0;
      camera.position.x = radius * Math.sin(sphericalTheta) * Math.cos(sphericalPhi);
      camera.position.y = radius * Math.sin(sphericalPhi) + 2.5;
      camera.position.z = radius * Math.cos(sphericalTheta) * Math.cos(sphericalPhi);
      camera.lookAt(0, 0, 0);
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    currentMount.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 10. Animation & Physics Simulation Loop
    let animationFrameId;
    let lastTime = performance.now();
    let sampleCounter = 0;

    const animate = (currentTime) => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min((currentTime - lastTime) / 1000, 0.04);
      lastTime = currentTime;

      const speedScale = particleSpeedMultiplierRef.current;
      const open = isDoorOpenRef.current;
      const efficiency = sortingEfficiencyRef.current / 100;

      let leftCount = 0;
      let rightCount = 0;
      let leftKeSum = 0;
      let rightKeSum = 0;

      // Check Automated Demon intent
      let demonWantsOpen = false;

      // Update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx * dt * speedScale;
        p.y += p.vy * dt * speedScale;
        p.z += p.vz * dt * speedScale;

        // Outer wall collisions (elastic)
        if (p.x < -BOX_HALF_X) { p.x = -BOX_HALF_X; p.vx = -p.vx; }
        if (p.x > BOX_HALF_X) { p.x = BOX_HALF_X; p.vx = -p.vx; }
        if (p.y < -BOX_HALF_Y) { p.y = -BOX_HALF_Y; p.vy = -p.vy; }
        if (p.y > BOX_HALF_Y) { p.y = BOX_HALF_Y; p.vy = -p.vy; }
        if (p.z < -BOX_HALF_Z) { p.z = -BOX_HALF_Z; p.vz = -p.vz; }
        if (p.z > BOX_HALF_Z) { p.z = BOX_HALF_Z; p.vz = -p.vz; }

        // Central partition collision at x = 0
        const inAperture = Math.abs(p.y) < APERTURE_RADIUS && Math.abs(p.z) < APERTURE_RADIUS;

        // Automated Demon decision logic
        if (mode === 'auto' && inAperture && Math.abs(p.x) < 0.7) {
          // Allow fast moving left->right OR slow moving right->left
          if (p.isFast && p.vx > 0 && Math.random() < efficiency) {
            demonWantsOpen = true;
          } else if (!p.isFast && p.vx < 0 && Math.random() < efficiency) {
            demonWantsOpen = true;
          }
        }

        const canPass = inAperture && (open || (mode === 'auto' && demonWantsOpen));

        if (!canPass) {
          // Partition barrier bounce at x = 0
          if (p.x > -0.15 && p.x < 0 && p.vx > 0) {
            p.vx = -p.vx;
            p.x = -0.15;
          } else if (p.x < 0.15 && p.x > 0 && p.vx < 0) {
            p.vx = -p.vx;
            p.x = 0.15;
          }
        }

        // Tally partition stats
        const ke = 0.5 * (p.vx * p.vx + p.vy * p.vy + p.vz * p.vz);
        if (p.x < 0) {
          leftCount++;
          leftKeSum += ke;
        } else {
          rightCount++;
          rightKeSum += ke;
        }

        // Update Three.js instance matrix
        dummy.position.set(p.x, p.y, p.z);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;

      // Animate Trapdoor Shutter Position
      const doorIsOpenNow = open || (mode === 'auto' && demonWantsOpen);
      const targetShutterY = doorIsOpenNow ? APERTURE_RADIUS * 2.2 : 0;
      if (shutterMeshRef.current) {
        shutterMeshRef.current.position.y += (targetShutterY - shutterMeshRef.current.position.y) * 0.2;
      }

      // Demon Eye Scanner Pulse
      if (demonEyeMeshRef.current) {
        const pulse = doorIsOpenNow ? 2.5 : 0.6 + 0.4 * Math.sin(currentTime * 0.005);
        demonEyeMeshRef.current.material.emissiveIntensity = pulse;
      }

      // Sample thermodynamic values at ~10Hz
      sampleCounter++;
      if (sampleCounter % 6 === 0) {
        const tL = leftCount > 0 ? (leftKeSum / leftCount) * 150 : 300;
        const tR = rightCount > 0 ? (rightKeSum / rightCount) * 150 : 300;

        setCountLeft(leftCount);
        setCountRight(rightCount);
        setTempLeft(Math.round(tL));
        setTempRight(Math.round(tR));

        // Theoretical macroscopic entropy differential ΔS = Cv * ln(T_R / T_L)
        const dS = -Math.abs(Math.log(Math.max(tR, 1) / Math.max(tL, 1)) * 0.6);
        setEntropyDelta(+dS.toFixed(3));

        // Accumulate information bits when sorting creates ΔT
        if (doorIsOpenNow) {
          setStoredBits((prev) => Math.min(prev + 1, 1024));
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mode]);

  return (
    <div className={styles.labContainer} data-testid="maxwells-demon-lab">
      <div className={styles.canvasContainer}>
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Top Header Floating Telemetry */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="atom" size={13} color="#E5A93C" />
              <span>Statistical Mechanics Lab</span>
            </div>
            <h2 className={styles.labTitle}>Maxwell&apos;s Demon Thermodynamic Chamber</h2>
          </div>

          <div className={styles.entropyDisplay}>
            <span className={styles.entropyLabel}>Entropy Change (ΔS)</span>
            <span className={styles.entropyValue}>
              {entropyDelta < 0 ? `${entropyDelta} J/K` : '0.000 J/K'}
            </span>
          </div>
        </div>

        {/* Dual Chamber Gas Temperature & Pressure Badges */}
        <div className={styles.chamberBadges}>
          <div className={styles.chamberBadgeLeft}>
            <span className={styles.badgeDotCyan} />
            <div>
              <strong>Chamber A (Cold Source)</strong>
              <span>{tempLeft} K · {countLeft} molecules</span>
            </div>
          </div>

          <div className={styles.chamberBadgeRight}>
            <span className={styles.badgeDotRed} />
            <div>
              <strong>Chamber B (Hot Target)</strong>
              <span>{tempRight} K · {countRight} molecules</span>
            </div>
          </div>
        </div>

        {/* Bottom Shutter & Mode Controls Overlay */}
        <div className={styles.shutterActionOverlay}>
          <div className={styles.modeButtonGroup}>
            <button
              className={`${styles.modeBtn} ${mode === 'auto' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('auto')}
            >
              <Icon name="zap" size={13} />
              <span>Automated Demon</span>
            </button>
            <button
              className={`${styles.modeBtn} ${mode === 'manual' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('manual')}
            >
              <Icon name="user" size={13} />
              <span>Manual Shutter</span>
            </button>
          </div>

          {mode === 'manual' ? (
            <button
              className={`${styles.trapdoorActuateBtn} ${isDoorOpen ? styles.trapdoorOpenState : ''}`}
              onMouseDown={() => setIsDoorOpen(true)}
              onMouseUp={() => setIsDoorOpen(false)}
              onTouchStart={() => setIsDoorOpen(true)}
              onTouchEnd={() => setIsDoorOpen(false)}
            >
              <Icon name={isDoorOpen ? 'unlock' : 'lock'} size={14} />
              <span>{isDoorOpen ? 'Trapdoor Open (Spacebar Held)' : 'Hold to Open Trapdoor'}</span>
            </button>
          ) : (
            <div className={styles.modeBtn} style={{ background: 'rgba(14, 16, 22, 0.88)', color: '#E5A93C' }}>
              <Icon name="eye" size={13} color="#E5A93C" />
              <span>Demon Scanning Trajectories...</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls & Landauer Memory Dashboard */}
      <div className={styles.dashboard}>
        {/* Landauer Principle Resolution Banner */}
        <div
          className={styles.landauerBanner}
          style={{
            borderColor: isMemoryFlashing ? '#EF4444' : 'rgba(229, 169, 60, 0.35)',
            boxShadow: isMemoryFlashing ? '0 0 24px rgba(239, 68, 68, 0.4)' : 'none',
          }}
        >
          <div className={styles.landauerInfo}>
            <div className={styles.landauerTitle}>
              <Icon name="database" size={15} color="#E5A93C" />
              <span>Landauer Memory Register · Information Is Physical</span>
            </div>
            <div className={styles.landauerDesc}>
              Stored Memory: <strong>{storedBits} bits</strong> · Cumulative Dissipated Heat (Q = k_B·T·ln 2):{' '}
              <strong>{landauerHeatDissipated} nJ</strong> ({bitsErasedTotal} bits erased).
            </div>
          </div>

          <button className={styles.eraseMemoryBtn} onClick={handleEraseMemory} disabled={storedBits === 0}>
            <Icon name="refresh" size={13} />
            <span>Erase Memory ({storedBits} bits)</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className={styles.controlsGrid}>
          <div className={styles.controlCard}>
            <div className={styles.controlHeader}>
              <span className={styles.controlLabel}>Demon Sorting Efficiency</span>
              <span className={styles.controlVal}>{sortingEfficiency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={sortingEfficiency}
              onChange={(e) => setSortingEfficiency(Number(e.target.value))}
              className={styles.rangeInput}
            />
            <div className={styles.controlFooter}>
              <span>0% (Random Thermal Mix)</span>
              <span>100% (Perfect Maxwell Sorter)</span>
            </div>
          </div>

          <div className={styles.controlCard}>
            <div className={styles.controlHeader}>
              <span className={styles.controlLabel}>Molecular Velocity Multiplier</span>
              <span className={styles.controlVal}>{particleSpeedMultiplier.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={particleSpeedMultiplier}
              onChange={(e) => setParticleSpeedMultiplier(Number(e.target.value))}
              className={styles.rangeInput}
            />
            <div className={styles.controlFooter}>
              <span>0.4x (Slow Motion)</span>
              <span>2.5x (Hyper-Kinetic)</span>
            </div>
          </div>
        </div>

        {/* Thermodynamic Quantities Summary Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Temperature Gradient (ΔT)</span>
            <span className={styles.statVal} style={{ color: '#E5A93C' }}>
              {Math.abs(tempRight - tempLeft)} K
            </span>
            <span className={styles.statDesc}>Apparent thermal imbalance</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Particle Count</span>
            <span className={styles.statVal} style={{ color: '#F9FAFB' }}>
              180
            </span>
            <span className={styles.statDesc}>Conserved Maxwellian ensemble</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>2nd Law of Thermodynamics</span>
            <span className={styles.statVal} style={{ color: storedBits > 0 ? '#F87171' : '#10B981' }}>
              {storedBits > 0 ? 'Pending Erasure' : 'Protected'}
            </span>
            <span className={styles.statDesc}>
              {storedBits > 0 ? 'Entropy stored as informational bits' : 'Total entropy (gas + memory) >= 0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
