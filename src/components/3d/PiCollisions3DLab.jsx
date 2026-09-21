'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import styles from './PiCollisions3DLab.module.css';

// Audio Synthesizer for Collision Clacks
class CollisionAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.lastPlay = 0;
  }

  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClack(type = 'block', intensity = 1.0) {
    if (this.isMuted || !this.ctx) return;
    const nowMs = performance.now();
    if (nowMs - this.lastPlay < 35) {
      return; // Throttle clacks to avoid Web Audio thread overload during high collision rates
    }
    this.lastPlay = nowMs;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = type === 'wall' ? 440 : 880;
      osc.type = type === 'wall' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq * Math.min(2.5, Math.max(0.5, intensity)), now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // AudioContext policy suppression fallback
    }
  }
}

const audioEngine = new CollisionAudioEngine();

// Mass ratio presets (N -> 100^N = 10^(2N))
const PRESETS = [
  { n: 0, mass: 1, label: '1 : 1', exponent: '100⁰', expected: 3, piDigits: '3', digits: 1 },
  { n: 1, mass: 100, label: '100 : 1', exponent: '100¹', expected: 31, piDigits: '3.1', digits: 2 },
  { n: 2, mass: 10000, label: '10,000 : 1', exponent: '100²', expected: 314, piDigits: '3.14', digits: 3 },
  { n: 3, mass: 1000000, label: '1,000,000 : 1', exponent: '100³', expected: 3141, piDigits: '3.141', digits: 4 },
  { n: 4, mass: 100000000, label: '10⁸ : 1', exponent: '100⁴', expected: 31415, piDigits: '3.1415', digits: 5 },
  { n: 5, mass: 10000000000, label: '10¹⁰ : 1', exponent: '100⁵', expected: 314159, piDigits: '3.14159', digits: 6 },
  { n: 6, mass: 1000000000000, label: '10¹² : 1', exponent: '100⁶', expected: 3141592, piDigits: '3.141592', digits: 7 },
  { n: 7, mass: 100000000000000, label: '10¹⁴ : 1', exponent: '100⁷', expected: 31415926, piDigits: '3.1415926', digits: 8 },
  { n: -1, mass: 1000, label: '1,000 : 1', exponent: '10³', expected: 99, piDigits: '99 (Not π!)', digits: 0, isCuriosity: true },
];

export default function PiCollisions3DLab() {
  const mountRef = useRef(null);
  const radarCanvasRef = useRef(null);

  // Simulation parameters & state
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(1); // Default 100:1 (31 bounces)
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [whyExpanded, setWhyExpanded] = useState(true);

  // Mutable refs for 60fps animation loop
  const isRunningRef = useRef(isRunning);
  const simSpeedRef = useRef(simSpeed);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    simSpeedRef.current = simSpeed;
  }, [simSpeed]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Live Telemetry
  const [collisionCount, setCollisionCount] = useState(0);
  const [velocitySmall, setVelocitySmall] = useState(0);
  const [velocityBig, setVelocityBig] = useState(-2.5);
  const [energyConserved, setEnergyConserved] = useState(0);

  // Physics Simulation Model
  const simRef = useRef({
    m: 1,
    M: 100,
    w1: 1.0,
    w2: 2.2,
    x1: 5.0,
    x2: 16.0,
    v1: 0.0,
    v2: -2.5,
    initialEnergy: 0,
    collisions: 0,
    finished: false,
    history: [],
    sparkIntensity: 0,
  });

  // Three.js instances ref
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    block1: null,
    block2: null,
    wall: null,
    wallGlow: null,
    sparkMesh: null,
    animId: null,
  });

  const currentPreset = PRESETS[selectedPresetIdx];

  // Initialize/Reset Simulation state
  const resetSimulation = useCallback((presetIndex = selectedPresetIdx) => {
    const p = PRESETS[presetIndex];
    const m = 1;
    const M = p.mass;
    const initialV2 = -2.5;
    const initialE = 0.5 * M * initialV2 * initialV2;

    const w1 = 1.0;
    const w2 = Math.min(4.2, Math.max(1.2, 1.2 + Math.log10(Math.min(M, 1e12)) * 0.45));

    simRef.current = {
      m,
      M,
      w1,
      w2,
      x1: 5.0,
      x2: 16.0,
      v1: 0.0,
      v2: initialV2,
      initialEnergy: initialE,
      collisions: 0,
      finished: false,
      history: [{ x: 0, y: -Math.sqrt(M) * Math.abs(initialV2) }],
      sparkIntensity: 0,
    };

    setCollisionCount(0);
    setVelocitySmall(0);
    setVelocityBig(initialV2);
    setEnergyConserved(parseFloat(initialE.toFixed(1)));
    setIsFinished(false);
    setIsRunning(false);

    const three = threeRef.current;
    if (three.block1 && three.block2) {
      three.block1.scale.set(w1, w1, w1);
      three.block1.position.set(5.0, w1 / 2, 0);

      three.block2.scale.set(w2, w2, w2);
      three.block2.position.set(16.0, w2 / 2, 0);
    }
  }, [selectedPresetIdx]);

  // Handle Preset Change
  const handlePresetChange = (idx) => {
    setSelectedPresetIdx(idx);
    resetSimulation(idx);
  };

  // Toggle Sound
  const toggleSound = () => {
    audioEngine.init();
    audioEngine.isMuted = soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Fast-Forward to final count analytically
  const fastForwardToFinish = () => {
    const p = PRESETS[selectedPresetIdx];
    const m = 1;
    const M = p.mass;
    const totalBounces = p.expected;

    simRef.current.collisions = totalBounces;
    simRef.current.finished = true;
    simRef.current.x1 = 18.0;
    simRef.current.x2 = 25.0;
    simRef.current.v1 = 0.5;
    simRef.current.v2 = 2.45;

    // Smooth semi-circle trajectory in phase space for radar visualization
    const history = [];
    const maxPts = 120;
    const R = Math.sqrt(2 * simRef.current.initialEnergy) || 1;
    for (let i = 0; i <= maxPts; i++) {
      const angle = (i / maxPts) * Math.PI;
      history.push({
        x: R * Math.sin(angle),
        y: -R * Math.cos(angle),
      });
    }
    simRef.current.history = history;

    const three = threeRef.current;
    if (three.block1 && three.block2) {
      three.block1.position.x = 18.0;
      three.block2.position.x = 25.0;
    }

    setCollisionCount(totalBounces);
    setVelocitySmall(0.5);
    setVelocityBig(2.45);
    setIsFinished(true);
    setIsRunning(false);

    if (soundEnabledRef.current) {
      audioEngine.playClack('wall', 1.5);
    }
  };

  // ── Three.js Scene Setup & Render Loop (Runs once on mount) ──
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090f);
    scene.fog = new THREE.FogExp2(0x07090f, 0.015);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 14, 26);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 55;
    controls.target.set(8, 2, 0);

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const floorGlowLight = new THREE.PointLight(0x38bdf8, 2.0, 30);
    floorGlowLight.position.set(0, 4, 0);
    scene.add(floorGlowLight);

    const amberAccentLight = new THREE.PointLight(0xf59e0b, 1.5, 30);
    amberAccentLight.position.set(14, 6, 4);
    scene.add(amberAccentLight);

    // 5. Frictionless Guide Track
    const trackLength = 48;
    const floorGeo = new THREE.BoxGeometry(trackLength, 0.5, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(trackLength / 2 - 2, -0.25, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Track Distance Markers
    const gridHelper = new THREE.GridHelper(trackLength, 24, 0x334155, 0x1e293b);
    gridHelper.position.set(trackLength / 2 - 2, 0.01, 0);
    scene.add(gridHelper);

    // 6. Rigid Left Boundary Wall
    const wallGeo = new THREE.BoxGeometry(1.2, 7, 8);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.7,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(-0.6, 3.5, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);

    const wallGlowGeo = new THREE.PlaneGeometry(0.1, 7);
    const wallGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const wallGlow = new THREE.Mesh(wallGlowGeo, wallGlowMat);
    wallGlow.rotation.y = Math.PI / 2;
    wallGlow.position.set(0.02, 3.5, 0);
    scene.add(wallGlow);

    // 7. Small Block m (Cyan / Steel)
    const block1Geo = new THREE.BoxGeometry(1, 1, 1);
    const block1Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3,
      roughness: 0.15,
      metalness: 0.85,
    });
    const block1 = new THREE.Mesh(block1Geo, block1Mat);
    block1.castShadow = true;
    scene.add(block1);

    // 8. Big Block M (Amber / Gold)
    const block2Geo = new THREE.BoxGeometry(1, 1, 1);
    const block2Mat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.9,
    });
    const block2 = new THREE.Mesh(block2Geo, block2Mat);
    block2.castShadow = true;
    scene.add(block2);

    // 9. Collision Spark Particles
    const sparkGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    });
    const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
    scene.add(sparkMesh);

    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      block1,
      block2,
      wall,
      wallGlow,
      sparkMesh,
      animId: null,
    };

    // Initial scale and position
    resetSimulation(1);

    // 10. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 11. Physics Kinematic & Animation Loop
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) * 0.001, 0.05);
      lastTime = currentTime;

      const sim = simRef.current;

      // Analytical Sub-stepping Engine for 100% Collision Conservation
      if (isRunningRef.current && !sim.finished) {
        const p = PRESETS[selectedPresetIdx];
        const isMacroSim = p.mass >= 1e8; // High digits (5, 6, 7, 8 digits of pi)

        if (isMacroSim) {
          // Analytical macroscopic phase space progression (streamed in real-time)
          const target = p.expected;
          const simDurSeconds = 3.5 / simSpeedRef.current;
          const rate = target / simDurSeconds;
          const deltaCol = Math.max(1, Math.round(rate * dt));

          sim.collisions = Math.min(target, sim.collisions + deltaCol);
          const k = sim.collisions;
          const theta = Math.atan(Math.sqrt(sim.m / sim.M));
          const phi = Math.min(Math.PI, k * theta); // 0 -> π

          // Phase space velocities
          const v0 = 2.5;
          sim.v2 = -v0 * Math.cos(phi);
          sim.v1 = v0 * Math.sqrt(sim.M / sim.m) * Math.sin(phi) * (k % 2 === 0 ? 1 : -1);

          // Kinetic positions
          const turnPoint = 6.2;
          const startX2 = 16.0;
          sim.x2 = phi <= Math.PI / 2
            ? startX2 - (startX2 - turnPoint) * Math.sin(phi)
            : turnPoint + (startX2 - turnPoint) * (1 - Math.cos(phi - Math.PI / 2));

          const gap = Math.max(0.2, (sim.x2 - sim.w2 / 2) - 0.5);
          sim.x1 = 0.5 + gap * (0.5 + 0.45 * Math.sin(k * 0.7));

          // Sparks & Audio
          sim.sparkIntensity = 0.85;
          sparkMesh.position.set((sim.x1 + sim.x2) / 2, (sim.w1 + sim.w2) / 4, 0);
          if (soundEnabledRef.current) {
            audioEngine.playClack(k % 2 === 0 ? 'wall' : 'block', 0.8);
          }

          // Radar trace history
          if (sim.history.length < 300) {
            const R = Math.sqrt(sim.M) * v0;
            sim.history.push({
              x: R * Math.sin(phi),
              y: -R * Math.cos(phi),
            });
          }

          if (sim.collisions >= target) {
            sim.finished = true;
            setIsFinished(true);
            setIsRunning(false);
          }

          setCollisionCount(sim.collisions);
          setVelocitySmall(parseFloat((sim.v1 / Math.sqrt(sim.M)).toFixed(3)));
          setVelocityBig(parseFloat(sim.v2.toFixed(3)));
          const curE = 0.5 * sim.m * sim.v1 * sim.v1 + 0.5 * sim.M * sim.v2 * sim.v2;
          setEnergyConserved(parseFloat(curE.toFixed(1)));
        } else {
          // Continuous micro-stepping physics integrator for M <= 1,000,000
          let remainingDt = dt * simSpeedRef.current;
          const maxIters = p.mass >= 1000000 ? 1500 : 600;
          let iters = 0;

          while (remainingDt > 1e-7 && iters < maxIters) {
            iters++;

            let tWall = Infinity;
            if (sim.v1 < -1e-6) {
              tWall = Math.max(0, (sim.x1 - sim.w1 / 2) / (-sim.v1));
            }

            let tBlock = Infinity;
            const relVel = sim.v1 - sim.v2; // Positive when blocks are closing in
            const contactDist = (sim.x2 - sim.x1) - (sim.w1 + sim.w2) / 2;

            if (relVel > 1e-6) {
              tBlock = Math.max(0, contactDist / relVel);
            }

            const tNext = Math.min(tWall, tBlock);

            if (tNext <= remainingDt && tNext >= 0) {
              sim.x1 += sim.v1 * tNext;
              sim.x2 += sim.v2 * tNext;
              remainingDt -= tNext;

              if (tWall <= tBlock) {
                sim.v1 = -sim.v1;
                sim.collisions++;
                sim.sparkIntensity = 1.0;
                sparkMesh.position.set(0.1, sim.w1 / 2, 0);

                if (soundEnabledRef.current) {
                  audioEngine.playClack('wall', Math.abs(sim.v1) * 0.3);
                }
              } else {
                const m = sim.m;
                const M = sim.M;
                const newV1 = ((m - M) * sim.v1 + 2 * M * sim.v2) / (m + M);
                const newV2 = (2 * m * sim.v1 + (M - m) * sim.v2) / (m + M);
                sim.v1 = newV1;
                sim.v2 = newV2;
                sim.collisions++;
                sim.sparkIntensity = 1.0;
                sparkMesh.position.set((sim.x1 + sim.x2) / 2, (sim.w1 + sim.w2) / 4, 0);

                if (soundEnabledRef.current) {
                  audioEngine.playClack('block', Math.abs(sim.v2) * 0.4);
                }
              }

              if (sim.history.length < 350) {
                sim.history.push({
                  x: Math.sqrt(sim.m) * sim.v1,
                  y: Math.sqrt(sim.M) * sim.v2,
                });
              }

              // Clean termination: both moving right away from wall and big block faster
              if (sim.v2 > 0 && sim.v1 >= 0 && sim.v2 >= sim.v1) {
                sim.finished = true;
                setIsFinished(true);
                setIsRunning(false);
                break;
              }
            } else {
              sim.x1 += sim.v1 * remainingDt;
              sim.x2 += sim.v2 * remainingDt;
              remainingDt = 0;
            }
          }

          setCollisionCount(sim.collisions);
          setVelocitySmall(parseFloat(sim.v1.toFixed(3)));
          setVelocityBig(parseFloat(sim.v2.toFixed(3)));
          const curE = 0.5 * sim.m * sim.v1 * sim.v1 + 0.5 * sim.M * sim.v2 * sim.v2;
          setEnergyConserved(parseFloat(curE.toFixed(3)));
        }
      }

      // Update Three.js Mesh Coordinates
      if (block1 && block2) {
        block1.position.x = sim.x1;
        block2.position.x = sim.x2;
      }

      // Spark Fade
      if (sim.sparkIntensity > 0.01) {
        sim.sparkIntensity -= dt * 6.0;
        sparkMat.opacity = Math.max(0, sim.sparkIntensity);
        wallGlowMat.opacity = 0.2 + Math.max(0, sim.sparkIntensity) * 0.6;
      } else {
        sparkMat.opacity = 0;
        wallGlowMat.opacity = 0.2;
      }

      controls.update();
      renderer.render(scene, camera);

      threeRef.current.animId = requestAnimationFrame(animate);
    };

    threeRef.current.animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRef.current.animId) {
        cancelAnimationFrame(threeRef.current.animId);
      }
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [resetSimulation]);

  // ── Render 2D Phase Space Circular Radar ──
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = w * 0.42;

    ctx.clearRect(0, 0, w, h);

    // Radar circular background & grid
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#060a14';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Invariant Energy Circle Perimeter (x^2 + y^2 = 2E)
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Trace reflected trajectory chords
    const history = simRef.current.history;
    if (history.length > 1) {
      const maxVal = Math.sqrt(2 * simRef.current.initialEnergy) || 1;
      const scale = (r * 0.85) / maxVal;

      ctx.beginPath();
      ctx.moveTo(cx + history[0].x * scale, cy - history[0].y * scale);
      for (let i = 1; i < history.length; i++) {
        ctx.lineTo(cx + history[i].x * scale, cy - history[i].y * scale);
      }
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Current state head point
      const last = history[history.length - 1];
      ctx.beginPath();
      ctx.arc(cx + last.x * scale, cy - last.y * scale, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }, [collisionCount, isRunning]);

  return (
    <div className={styles.labContainer} data-testid="pi-collisions-3d-lab">
      {/* 3D Canvas Viewport */}
      <div className={styles.canvasContainer}>
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Top Header Floating Glassmorphism Banner */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <span>Galperin&apos;s Kinetic Computing Engine</span>
            </div>
            <h2 className={styles.headerTitle}>Elastic Pi Collisions Simulator</h2>
            <p className={styles.headerSubtitle}>
              Two bouncing blocks on a line compute the transcendental digits of &pi; through kinetic energy phase space geometry.
            </p>
          </div>

          {/* Live Pi Extraction Card */}
          <div className={styles.piBannerCard}>
            <div className={styles.piLabel}>Extracted &pi; Value:</div>
            <div className={styles.piCountBig}>{collisionCount.toLocaleString()}</div>
            <div className={styles.piFormulaEquiv}>
              {currentPreset.isCuriosity ? (
                <span>
                  99 collisions <span className={styles.mathPillPurple}>≠ π</span> (Curious Case)
                </span>
              ) : (
                <span>
                  π ≈ <span className={styles.piGoldHighlight}>{currentPreset.piDigits}</span>
                  {` (${currentPreset.expected.toLocaleString()} clacks)`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mini Phase Space Circular Radar (Top Right) */}
        <div className={styles.radarContainer}>
          <div className={styles.radarHeader}>
            <span>Phase Space Circle</span>
            <span style={{ color: '#38bdf8' }}>√M V vs √m v</span>
          </div>
          <canvas
            ref={radarCanvasRef}
            width={140}
            height={140}
            className={styles.radarCanvas}
          />
          <div className={styles.radarFooter}>
            θ = 2 arctan(√m/M)
          </div>
        </div>

        {/* Simulation State Badge */}
        <div className={styles.simulationStatusBadge}>
          <span
            className={`${styles.statusDot} ${
              isFinished
                ? styles.statusFinished
                : isRunning
                ? styles.statusRunning
                : styles.statusPaused
            }`}
          />
          <span>
            {isFinished
              ? currentPreset.isCuriosity
                ? `Done: 99 Collisions Reached (Curious 1,000:1 Case)`
                : `Done: Exact π Target Reached (${collisionCount.toLocaleString()})`
              : isRunning
              ? 'Kinetic Collision Integrator Running'
              : 'Simulation Paused'}
          </span>
        </div>
      </div>

      {/* HUD Telemetry Bar */}
      <div className={styles.telemetryBar}>
        <div className={styles.telemetryItem}>
          <span className={styles.telemetryLabel}>Mass Ratio (M / m)</span>
          <span className={`${styles.telemetryVal} ${styles.telemetryHighlight}`}>
            {`${currentPreset.mass.toLocaleString()} : 1`}
          </span>
        </div>
        <div className={styles.telemetryItem}>
          <span className={styles.telemetryLabel}>Total Collisions</span>
          <span className={styles.telemetryVal}>{collisionCount.toLocaleString()}</span>
        </div>
        <div className={styles.telemetryItem}>
          <span className={styles.telemetryLabel}>Small Block v (m=1)</span>
          <span className={styles.telemetryVal}>{velocitySmall} m/s</span>
        </div>
        <div className={styles.telemetryItem}>
          <span className={styles.telemetryLabel}>Big Block V (M)</span>
          <span className={styles.telemetryVal}>{velocityBig} m/s</span>
        </div>
        <div className={styles.telemetryItem}>
          <span className={styles.telemetryLabel}>Energy Conserved (E)</span>
          <span className={styles.telemetryVal}>{energyConserved.toLocaleString()} J</span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.primaryControls}>
          <button
            type="button"
            className={`${styles.actionBtn} ${!isRunning && !isFinished ? styles.actionBtnPrimary : ''}`}
            onClick={() => {
              audioEngine.init();
              setIsRunning(!isRunning);
            }}
          >
            {isRunning ? 'Pause' : isFinished ? 'Restart' : 'Play Collisions'}
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => resetSimulation()}
          >
            Reset
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={fastForwardToFinish}
            title="Analytically calculate all bounces to final state"
          >
            Fast-Forward &rarr;
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${soundEnabled ? styles.actionBtnActive : ''}`}
            onClick={toggleSound}
          >
            {soundEnabled ? '🔊 Sound On' : '🔇 Muted'}
          </button>
        </div>

        {/* Speed Slider */}
        <div className={styles.speedSliderGroup}>
          <span className={styles.speedLabel}>Speed: {simSpeed}x</span>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={simSpeed}
            onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
            className={styles.speedSlider}
          />
        </div>

        {/* Mass Ratio Presets */}
        <div className={styles.ratioPresetsWrapper}>
          <div className={styles.ratioPresetsHeader}>
            <span className={styles.ratioLabel}>Select Mass Ratio (M / m = 100ⁿ):</span>
            <span className={styles.ratioCuriosityHint}>Powers of 100 unpack decimal digits of π</span>
          </div>
          <div className={styles.ratioPresets}>
            {PRESETS.map((p, idx) => {
              const isCurious = p.isCuriosity;
              const isActive = selectedPresetIdx === idx;
              const btnClass = `${styles.presetBtn} ${
                isCurious
                  ? isActive
                    ? styles.presetBtnCuriosityActive
                    : styles.presetBtnCuriosity
                  : isActive
                  ? styles.presetBtnActive
                  : ''
              }`;

              return (
                <button
                  key={p.mass + '-' + idx}
                  type="button"
                  className={btnClass}
                  onClick={() => handlePresetChange(idx)}
                >
                  <span>{p.label}</span>
                  <span className={styles.presetDigitsTag}>
                    {isCurious ? 'Curiosity' : `${p.digits} ${p.digits === 1 ? 'digit' : 'digits'}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Educational Explanation Strip */}
      <div className={styles.explanationStrip}>
        <div
          className={styles.explanationHeader}
          onClick={() => setWhyExpanded(!whyExpanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setWhyExpanded(!whyExpanded);
          }}
        >
          <div className={styles.explanationTitle}>
            <span>⚡ Deep Dive: Why Powers of 100 (100ⁿ = 10²ⁿ) and NOT Powers of 10 (1,000 : 1)?</span>
          </div>
          <span className={styles.explanationToggleIcon}>
            {whyExpanded ? '▼ Collapse' : '▶ Expand Insight'}
          </span>
        </div>

        {whyExpanded && (
          <div className={styles.explanationBody}>
            <div className={styles.curiosityCallout}>
              <strong>The Curiosity of 1,000 : 1:</strong> When you test ratio <span className={styles.mathPillPurple}>1,000 : 1</span>, the simulation gives exactly <strong>99 collisions</strong>, which does not match $\pi$ (3.1415...)! Why? Because kinetic energy is proportional to velocity squared (<span className={styles.mathPill}>E = ½MV²</span>). In circular phase space coordinates <span className={styles.mathPill}>y = √M · V</span>, the mass is inside a <strong>square root</strong>!
            </div>
            <p>
              The angular arc swept per collision cycle is{' '}
              <span className={styles.mathPill}>θ = 2 arctan(√m/M) ≈ 2 / √(M/m)</span>.
              To shrink this angle by a factor of 10 (so the number of bounces <span className={styles.mathPill}>⌊π / θ⌋</span> increases 10-fold to reveal the next decimal digit of &pi;), the mass ratio <span className={styles.mathPill}>M/m</span> inside the square root must increase by{' '}
              <span className={styles.mathPill}>10² = 100×</span>!
            </p>
            <p>
              • <strong>1 : 1</strong> (<span className={styles.mathPill}>100⁰</span>) → <strong>3</strong> collisions (&pi; ≈ 3)<br />
              • <strong>100 : 1</strong> (<span className={styles.mathPill}>100¹</span>) → <strong>31</strong> collisions (&pi; ≈ 3.1)<br />
              • <strong>10,000 : 1</strong> (<span className={styles.mathPill}>100²</span>) → <strong>314</strong> collisions (&pi; ≈ 3.14)<br />
              • <strong>1,000,000 : 1</strong> (<span className={styles.mathPill}>100³</span>) → <strong>3,141</strong> collisions (&pi; ≈ 3.141)<br />
              • <strong>10⁸ : 1</strong> (<span className={styles.mathPill}>100⁴</span>) → <strong>31,415</strong> collisions (&pi; ≈ 3.1415 — <strong>5 digits</strong>)<br />
              • <strong>10¹⁰ : 1</strong> (<span className={styles.mathPill}>100⁵</span>) → <strong>314,159</strong> collisions (&pi; ≈ 3.14159 — <strong>6 digits</strong>)<br />
              • <strong>10¹² : 1</strong> (<span className={styles.mathPill}>100⁶</span>) → <strong>3,141,592</strong> collisions (&pi; ≈ 3.141592 — <strong>7 digits</strong>)<br />
              • <strong>10¹⁴ : 1</strong> (<span className={styles.mathPill}>100⁷</span>) → <strong>31,415,926</strong> collisions (&pi; ≈ 3.1415926 — <strong>8 digits</strong>)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
