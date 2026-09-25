'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Icon from '@/components/common/Icon';
import VisualizationGuideHUD from '@/components/interactive/VisualizationGuideHUD';
import { cleanDisplayFormula, renderMathInMarkdown } from '@/lib/mathRenderer';
import styles from './EulersNumber3DLab.module.css';

// Audio Synthesizer for Harmonic Compounding Chimes
class EulerAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.lastPlay = 0;
  }

  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChime(frequency = 528, duration = 0.12) {
    if (this.isMuted || !this.ctx) return;
    const nowMs = performance.now();
    if (nowMs - this.lastPlay < 40) return;
    this.lastPlay = nowMs;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // AudioContext policy suppression fallback
    }
  }
}

const audioEngine = new EulerAudioEngine();

// Jacob Bernoulli 1683 Compounding Presets
const BERNOULLI_PRESETS = [
  { id: 'annual', n: 1, label: 'Annual (n=1)', period: '1 Year', desc: 'Single 100% interest payout at year-end' },
  { id: 'semi', n: 2, label: 'Semi-Annual (n=2)', period: '6 Months', desc: 'Two 50% compounding steps: $1 → $1.50 → $2.25' },
  { id: 'quarter', n: 4, label: 'Quarterly (n=4)', period: '3 Months', desc: 'Four 25% compounding steps reaching $2.4414' },
  { id: 'month', n: 12, label: 'Monthly (n=12)', period: '1 Month', desc: 'Twelve monthly interest compoundings reaching $2.6130' },
  { id: 'week', n: 52, label: 'Weekly (n=52)', period: '1 Week', desc: '52 weekly compoundings reaching $2.6926' },
  { id: 'day', n: 365, label: 'Daily (n=365)', period: '1 Day', desc: '365 daily compounding pulses reaching $2.7145' },
  { id: 'infinity', n: 1e12, label: 'Continuous (n → ∞)', period: 'Infinitesimal dt', desc: 'Infinite compounding converges to e = 2.7182818...' },
];

export default function EulersNumber3DLab() {
  const mountRef = useRef(null);

  // Active Lab Mode: 'bernoulli' | 'calculus' | 'complex'
  const [activeMode, setActiveMode] = useState('bernoulli');

  // Mode 1: Bernoulli Thought Experiment State
  const [selectedPreset, setSelectedPreset] = useState('annual');
  const [interestRate] = useState(1.0); // 100% annual
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(1.0); // 0.0 to 1.0 (year)

  // Mode 2: Calculus Tangent Inspector State
  const [tangentX, setTangentX] = useState(1.0); // probe position x
  const [compareBases, setCompareBases] = useState(true);

  // Mode 3: Complex Rotation State
  const [angleTheta, setAngleTheta] = useState(Math.PI); // default to pi for Euler's identity

  // Global settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const [educationalOpen, setEducationalOpen] = useState(true);

  // Active n calculation
  const activeN = useMemo(() => {
    const found = BERNOULLI_PRESETS.find((p) => p.id === selectedPreset);
    return found ? found.n : 1;
  }, [selectedPreset]);

  // Synchronous state refs for 60fps WebGL animation loop without re-mounting
  const sceneStateRef = useRef({
    activeMode: 'bernoulli',
    activeN: 1,
    interestRate: 1.0,
    timelineProgress: 1.0,
    tangentX: 1.0,
    compareBases: true,
    angleTheta: Math.PI,
    isRotating: false,
  });

  useEffect(() => {
    sceneStateRef.current.activeMode = activeMode;
    sceneStateRef.current.activeN = activeN;
    sceneStateRef.current.interestRate = interestRate;
    sceneStateRef.current.timelineProgress = timelineProgress;
    sceneStateRef.current.tangentX = tangentX;
    sceneStateRef.current.compareBases = compareBases;
    sceneStateRef.current.angleTheta = angleTheta;
    sceneStateRef.current.isRotating = isRotating;
  }, [activeMode, activeN, interestRate, timelineProgress, tangentX, compareBases, angleTheta, isRotating]);

  // Bernoulli discrete balance calculation: P * (1 + r/n)^(n * t)
  const calculateBalance = useCallback((p, r, n, t) => {
    if (n >= 1e9) {
      return p * Math.exp(r * t);
    }
    // Discrete compounding: count full intervals elapsed up to time t
    const stepsElapsed = Math.floor(n * t);
    return p * Math.pow(1 + r / n, stepsElapsed);
  }, []);

  const currentBernoulliValue = useMemo(() => {
    return calculateBalance(1.0, interestRate, activeN, timelineProgress);
  }, [interestRate, activeN, timelineProgress, calculateBalance]);

  const continuousLimitValue = useMemo(() => {
    return Math.exp(interestRate * timelineProgress);
  }, [interestRate, timelineProgress]);

  // Audio mute sync
  useEffect(() => {
    audioEngine.isMuted = !soundEnabled;
  }, [soundEnabled]);

  // Timeline playback animation loop (updates timelineProgress smoothly)
  useEffect(() => {
    if (!isTimelinePlaying) return;
    let animId;
    let lastTime = performance.now();
    let lastStepIndex = -1;

    const step = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      setTimelineProgress((prev) => {
        const next = prev + dt * 0.22;
        if (next >= 1.0) {
          setIsTimelinePlaying(false);
          audioEngine.playChime(784, 0.2);
          return 1.0;
        }

        // Play chime on compounding step pulse
        const curStep = Math.floor(activeN * next);
        if (curStep !== lastStepIndex && curStep > 0) {
          lastStepIndex = curStep;
          audioEngine.playChime(520 + (curStep % 8) * 35, 0.08);
        }

        return next;
      });

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isTimelinePlaying, activeN]);

  // ── Three.js Scene Setup (MOUNTED ONCE ON COMPONENT MOUNT) ──
  const threeRefs = useRef({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    bernoulliGroup: null,
    calculusGroup: null,
    complexGroup: null,
    probeMarker: null,
    probeLine: null,
    tangentMarker: null,
    tangentLine: null,
    tangentSlopeCol: null,
    helixTip: null,
    helixArrow: null,
    rebuildBernoulli: null,
    rebuildCalculus: null,
    rebuildComplex: null,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 9.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.minDistance = 3.0;
    controls.maxDistance = 22;
    controls.target.set(0, 1.6, 0);

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight.position.set(6, 12, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const goldPoint = new THREE.PointLight(0xf59e0b, 2.5, 15);
    goldPoint.position.set(-4, 6, -3);
    scene.add(goldPoint);

    const emeraldPoint = new THREE.PointLight(0x10b981, 3.0, 14);
    emeraldPoint.position.set(3, 4, 2);
    scene.add(emeraldPoint);

    // Floor Reference Grid
    const floorGrid = new THREE.GridHelper(14, 28, 0x10b981, 0x1e293b);
    floorGrid.position.y = 0;
    scene.add(floorGrid);

    // 3. Mode Visual Groups
    const bernoulliGroup = new THREE.Group();
    const calculusGroup = new THREE.Group();
    const complexGroup = new THREE.Group();
    scene.add(bernoulliGroup);
    scene.add(calculusGroup);
    scene.add(complexGroup);

    // ── Build Mode 1: Bernoulli Compound Interest Timeline ──
    const rebuildBernoulli = () => {
      while (bernoulliGroup.children.length > 0) {
        const obj = bernoulliGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        bernoulliGroup.remove(obj);
      }

      const n = sceneStateRef.current.activeN;
      const xStart = -4.0;
      const xEnd = 4.0;
      const totalWidth = xEnd - xStart;
      const yScale = 1.1; // scale height in 3D units

      // Time Track Axis (Baseline y = 0)
      const trackGeo = new THREE.BoxGeometry(totalWidth, 0.08, 0.2);
      const trackMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
      const trackMesh = new THREE.Mesh(trackGeo, trackMat);
      trackMesh.position.set(0, 0.04, 0);
      bernoulliGroup.add(trackMesh);

      // Baseline Deposit Level ($1.00 at height 1.1)
      const baseLinePts = [new THREE.Vector3(xStart, 1.0 * yScale, 0), new THREE.Vector3(xEnd, 1.0 * yScale, 0)];
      const baseLineGeo = new THREE.BufferGeometry().setFromPoints(baseLinePts);
      const baseLineMat = new THREE.LineDashedMaterial({ color: 0x64748b, dashSize: 0.2, gapSize: 0.15 });
      const baseLine = new THREE.Line(baseLineGeo, baseLineMat);
      baseLine.computeLineDistances();
      bernoulliGroup.add(baseLine);

      // Bernoulli Cosmic Ceiling Plane at height y = e ≈ 2.71828 (y * yScale ≈ 2.99)
      const eHeight = Math.E * yScale;
      const ceilingGeo = new THREE.PlaneGeometry(totalWidth, 2.5);
      const ceilingMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 0.9,
      });
      const ceilingPlane = new THREE.Mesh(ceilingGeo, ceilingMat);
      ceilingPlane.rotation.x = Math.PI / 2;
      ceilingPlane.position.set(0, eHeight, 0);
      bernoulliGroup.add(ceilingPlane);

      // Golden Asymptote Line at Ceiling
      const asymPts = [new THREE.Vector3(xStart, eHeight, 0), new THREE.Vector3(xEnd, eHeight, 0)];
      const asymGeo = new THREE.BufferGeometry().setFromPoints(asymPts);
      const asymMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
      bernoulliGroup.add(new THREE.Line(asymGeo, asymMat));

      // Continuous Euler Exponential Curve y(t) = e^t
      const continuousCurvePts = [];
      for (let i = 0; i <= 80; i++) {
        const t = i / 80;
        const cx = xStart + t * totalWidth;
        const cy = Math.exp(t) * yScale;
        continuousCurvePts.push(new THREE.Vector3(cx, cy, 0.05));
      }
      const curveGeo = new THREE.BufferGeometry().setFromPoints(continuousCurvePts);
      const curveMat = new THREE.LineBasicMaterial({ color: 0x34d399, linewidth: 3 });
      bernoulliGroup.add(new THREE.Line(curveGeo, curveMat));

      // Discrete Staircase Bars for Active n
      const stepsCount = Math.min(n, 48); // render up to 48 visual steps smoothly
      for (let i = 0; i < stepsCount; i++) {
        const tStart = i / stepsCount;
        const tEnd = (i + 1) / stepsCount;
        const stepX = xStart + ((tStart + tEnd) / 2) * totalWidth;
        const stepW = totalWidth / stepsCount;

        const val = Math.pow(1 + 1 / n, Math.floor(n * tStart));
        const barH = val * yScale;

        const stepGeo = new THREE.BoxGeometry(stepW * 0.96, barH, 0.4);
        const isFinal = i === stepsCount - 1;
        const stepMat = new THREE.MeshStandardMaterial({
          color: isFinal ? 0x10b981 : 0x0284c7,
          emissive: isFinal ? 0x059669 : 0x0369a1,
          emissiveIntensity: 0.35,
          roughness: 0.25,
          metalness: 0.75,
          transparent: true,
          opacity: 0.82,
        });
        const stepMesh = new THREE.Mesh(stepGeo, stepMat);
        stepMesh.position.set(stepX, barH / 2, 0);
        bernoulliGroup.add(stepMesh);
      }

      // Active Capital Probe Marker (Moving Gold Sphere)
      const probeGeo = new THREE.SphereGeometry(0.18, 24, 24);
      const probeMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.9,
      });
      const probeMesh = new THREE.Mesh(probeGeo, probeMat);
      bernoulliGroup.add(probeMesh);
      threeRefs.current.probeMarker = probeMesh;

      // Vertical Dropline from Probe to Timeline Track
      const linePts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
      const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.75 });
      const probeLineMesh = new THREE.Line(lineGeo, lineMat);
      bernoulliGroup.add(probeLineMesh);
      threeRefs.current.probeLine = probeLineMesh;
    };

    // ── Build Mode 2: Calculus Rate Invariance (d/dx e^x = e^x) ──
    const rebuildCalculus = () => {
      while (calculusGroup.children.length > 0) {
        const obj = calculusGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        calculusGroup.remove(obj);
      }

      const curvePts = [];
      const base2Pts = [];
      const base3Pts = [];

      for (let x = -1.8; x <= 1.8; x += 0.05) {
        curvePts.push(new THREE.Vector3(x * 1.8, Math.exp(x) * 0.75, 0));
        base2Pts.push(new THREE.Vector3(x * 1.8, Math.pow(2, x) * 0.75, 0.5));
        base3Pts.push(new THREE.Vector3(x * 1.8, Math.pow(3, x) * 0.75, -0.5));
      }

      // Curve y = e^x
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
      const curveMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 });
      calculusGroup.add(new THREE.Line(curveGeo, curveMat));

      // Base 2 curve
      const b2Geo = new THREE.BufferGeometry().setFromPoints(base2Pts);
      const b2Mat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
      calculusGroup.add(new THREE.Line(b2Geo, b2Mat));

      // Base 3 curve
      const b3Geo = new THREE.BufferGeometry().setFromPoints(base3Pts);
      const b3Mat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.65 });
      calculusGroup.add(new THREE.Line(b3Geo, b3Mat));

      // Tangent Marker Sphere
      const tGeo = new THREE.SphereGeometry(0.14, 20, 20);
      const tMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.9 });
      const tMesh = new THREE.Mesh(tGeo, tMat);
      calculusGroup.add(tMesh);
      threeRefs.current.tangentMarker = tMesh;

      // Tangent Line
      const tLinePts = [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)];
      const tLineGeo = new THREE.BufferGeometry().setFromPoints(tLinePts);
      const tLineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const tLine = new THREE.Line(tLineGeo, tLineMat);
      calculusGroup.add(tLine);
      threeRefs.current.tangentLine = tLine;

      // Vertical Height Column
      const colGeo = new THREE.CylinderGeometry(0.04, 0.04, 1, 16);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.7 });
      const colMesh = new THREE.Mesh(colGeo, colMat);
      calculusGroup.add(colMesh);
      threeRefs.current.tangentSlopeCol = colMesh;
    };

    // ── Build Mode 3: Complex Rotation & Identity (e^{i theta}) ──
    const rebuildComplex = () => {
      while (complexGroup.children.length > 0) {
        const obj = complexGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        complexGroup.remove(obj);
      }

      const circleRadius = 2.2;

      // Unit circle on the real-imaginary plane
      const circlePts = [];
      for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.08) {
        circlePts.push(new THREE.Vector3(Math.cos(a) * circleRadius, Math.sin(a) * circleRadius, 0));
      }
      const cGeo = new THREE.BufferGeometry().setFromPoints(circlePts);
      const cMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
      complexGroup.add(new THREE.Line(cGeo, cMat));

      // 3D Space Helix (t advances in depth Z)
      const helixPts = [];
      for (let a = 0; a <= Math.PI * 4; a += 0.06) {
        helixPts.push(new THREE.Vector3(Math.cos(a) * circleRadius, Math.sin(a) * circleRadius, -a * 0.4));
      }
      const hGeo = new THREE.BufferGeometry().setFromPoints(helixPts);
      const hMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 });
      complexGroup.add(new THREE.Line(hGeo, hMat));

      // Pointer Arrow
      const arrowDir = new THREE.Vector3(1, 0, 0);
      const arrow = new THREE.ArrowHelper(arrowDir, new THREE.Vector3(0, 0, 0), circleRadius, 0xf59e0b, 0.35, 0.22);
      complexGroup.add(arrow);
      threeRefs.current.helixArrow = arrow;

      // Vector Tip Sphere
      const tipGeo = new THREE.SphereGeometry(0.15, 24, 24);
      const tipMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.8 });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      complexGroup.add(tip);
      threeRefs.current.helixTip = tip;
    };

    threeRefs.current = {
      scene,
      camera,
      renderer,
      controls,
      bernoulliGroup,
      calculusGroup,
      complexGroup,
      rebuildBernoulli,
      rebuildCalculus,
      rebuildComplex,
    };

    rebuildBernoulli();
    rebuildCalculus();
    rebuildComplex();

    // 4. Animation & Continuous Update Loop (NO RE-MOUNTS)
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const state = sceneStateRef.current;

      // Mode visibility management
      bernoulliGroup.visible = state.activeMode === 'bernoulli';
      calculusGroup.visible = state.activeMode === 'calculus';
      complexGroup.visible = state.activeMode === 'complex';

      if (state.activeMode === 'bernoulli') {
        const xStart = -4.0;
        const xEnd = 4.0;
        const totalWidth = xEnd - xStart;
        const yScale = 1.1;

        const curT = state.timelineProgress;
        const curX = xStart + curT * totalWidth;
        const curBalance = Math.pow(1 + 1 / state.activeN, Math.floor(state.activeN * curT));
        const curY = curBalance * yScale;

        if (threeRefs.current.probeMarker) {
          threeRefs.current.probeMarker.position.set(curX, curY, 0.05);
        }

        if (threeRefs.current.probeLine) {
          const pos = threeRefs.current.probeLine.geometry.attributes.position;
          pos.setXYZ(0, curX, 0.04, 0.05);
          pos.setXYZ(1, curX, curY, 0.05);
          pos.needsUpdate = true;
        }
      } else if (state.activeMode === 'calculus') {
        const tx = state.tangentX;
        const px = tx * 1.8;
        const py = Math.exp(tx) * 0.75;
        const slope = (Math.exp(tx) * 0.75) / 1.8;

        if (threeRefs.current.tangentMarker) {
          threeRefs.current.tangentMarker.position.set(px, py, 0);
        }

        if (threeRefs.current.tangentLine) {
          const tanLen = 0.9;
          const pos = threeRefs.current.tangentLine.geometry.attributes.position;
          pos.setXYZ(0, px - tanLen, py - tanLen * slope, 0);
          pos.setXYZ(1, px + tanLen, py + tanLen * slope, 0);
          pos.needsUpdate = true;
        }

        if (threeRefs.current.tangentSlopeCol) {
          threeRefs.current.tangentSlopeCol.scale.set(1, py, 1);
          threeRefs.current.tangentSlopeCol.position.set(px, py / 2, 0);
        }
      } else if (state.activeMode === 'complex') {
        const theta = state.angleTheta;
        const radius = 2.2;
        const vx = Math.cos(theta) * radius;
        const vy = Math.sin(theta) * radius;
        const vz = -theta * 0.4;

        if (threeRefs.current.helixArrow) {
          const dir = new THREE.Vector3(vx, vy, 0).normalize();
          threeRefs.current.helixArrow.setDirection(dir);
        }

        if (threeRefs.current.helixTip) {
          threeRefs.current.helixTip.position.set(vx, vy, vz);
          const isAtPi = Math.abs(theta - Math.PI) < 0.08;
          threeRefs.current.helixTip.material.color.setHex(isAtPi ? 0xef4444 : 0x10b981);
          threeRefs.current.helixTip.material.emissive.setHex(isAtPi ? 0xef4444 : 0x10b981);
        }
      }

      if (state.isRotating) {
        scene.rotation.y += 0.003;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 5. Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // Run ONCE on mount!

  // Update Three.js when preset changes without remounting canvas
  const handleSelectPreset = (presetId) => {
    audioEngine.init();
    audioEngine.playChime(660);
    setSelectedPreset(presetId);
    setTimelineProgress(1.0);
    setTimeout(() => {
      if (threeRefs.current.rebuildBernoulli) {
        threeRefs.current.rebuildBernoulli();
      }
    }, 10);
  };

  // Switch Mode
  const handleModeChange = (mode) => {
    audioEngine.init();
    audioEngine.playChime(528);
    setActiveMode(mode);
  };

  // Toggle Timeline Play/Pause
  const toggleTimeline = () => {
    audioEngine.init();
    if (timelineProgress >= 1.0) {
      setTimelineProgress(0.0);
    }
    setIsTimelinePlaying((prev) => !prev);
  };

  return (
    <div className={styles.labContainer} data-testid="eulers-number-lab">
      {/* ── Mode Selection Header ── */}
      <div className={styles.modeTabsBar} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'bernoulli'}
          className={`${styles.modeTab} ${activeMode === 'bernoulli' ? styles.modeTabActive : ''}`}
          onClick={() => handleModeChange('bernoulli')}
          data-testid="tab-bernoulli"
        >
          <Icon name="bank" size={16} />
          <span>1683 Bernoulli Compound Interest Staircase</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'calculus'}
          className={`${styles.modeTab} ${activeMode === 'calculus' ? styles.modeTabActive : ''}`}
          onClick={() => handleModeChange('calculus')}
          data-testid="tab-calculus"
        >
          <Icon name="trending-up" size={16} />
          <span>Calculus Rate Invariance (d/dx eˣ = eˣ)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'complex'}
          className={`${styles.modeTab} ${activeMode === 'complex' ? styles.modeTabActive : ''}`}
          onClick={() => handleModeChange('complex')}
          data-testid="tab-complex"
        >
          <Icon name="spiral" size={16} />
          <span>Euler&apos;s Identity &amp; Complex Helix (e<sup>iπ</sup> + 1 = 0)</span>
        </button>
      </div>

      {/* ── 3D Viewport ── */}
      <div className={styles.canvasContainer}>
        <div className={styles.canvasWrapper} ref={mountRef} data-testid="euler-canvas" />

        {/* Top Header Floating Overlay */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="sparkles" size={13} color="#10B981" />
              <span>Euler&apos;s Number Thought Experiment</span>
            </div>
            <h2 className={styles.headerTitle}>
              {activeMode === 'bernoulli' && 'Jacob Bernoulli (1683): The Limit of Infinite Compounding'}
              {activeMode === 'calculus' && 'Leonhard Euler (1736): The Universal Base of Calculus'}
              {activeMode === 'complex' && 'The Five Fundamental Constants: e^{iπ} + 1 = 0'}
            </h2>
            <p className={styles.headerSubtitle}>
              {activeMode === 'bernoulli' && 'Watch discrete interest compounding steps converge to the cosmic asymptote e ≈ 2.7182818'}
              {activeMode === 'calculus' && 'Base e is the only base where instantaneous growth rate exactly equals function height'}
              {activeMode === 'complex' && 'Continuous perpendicular growth bends expansion into a 3D rotation helix'}
            </p>
          </div>

          {/* Current Live Euler Value Metric */}
          <div className={styles.eulerValueCard}>
            <div>
              <div className={styles.eulerLabel}>Effective Value</div>
              <div className={styles.eulerCountBig} data-testid="euler-live-value">
                {activeMode === 'bernoulli' && `$${currentBernoulliValue.toFixed(6)}`}
                {activeMode === 'calculus' && `e^(${tangentX.toFixed(2)}) = ${Math.exp(tangentX).toFixed(4)}`}
                {activeMode === 'complex' && (
                  <span>
                    {Math.cos(angleTheta).toFixed(3)} + {Math.sin(angleTheta).toFixed(3)}i
                  </span>
                )}
              </div>
            </div>
            <div className={styles.eulerFormulaTag}>
              {activeMode === 'bernoulli' && (
                <span>
                  Theoretical Bound: <strong className={styles.greenHighlight}>${continuousLimitValue.toFixed(6)}</strong>
                </span>
              )}
              {activeMode === 'calculus' && (
                <span>
                  Tangent Slope: <strong className={styles.greenHighlight}>{Math.exp(tangentX).toFixed(4)}</strong>
                </span>
              )}
              {activeMode === 'complex' && (
                <span>
                  Modulus |z|: <strong className={styles.greenHighlight}>1.0000</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Standardized 3D HUD Guide with zero emojis */}
        <VisualizationGuideHUD
          mode="3d"
          title="Euler Thought Experiment Controls"
          interactionNotes="Orbit, pan, and zoom to inspect the discrete compounding staircase vs the continuous ceiling limit e."
        />
      </div>

      {/* ── Interactive Controls Console ── */}
      <div className={styles.controlsSection}>
        {/* Mode 1 Controls: Bernoulli */}
        {activeMode === 'bernoulli' && (
          <>
            <div className={styles.controlsRow}>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={toggleTimeline}
                  data-testid="btn-play-timeline"
                >
                  <Icon name={isTimelinePlaying ? 'sliders' : 'zap'} size={15} />
                  <span>{isTimelinePlaying ? 'Pause Compounding' : 'Play 1-Year Compounding'}</span>
                </button>

                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setTimelineProgress(1.0)}
                >
                  <Icon name="rotate" size={14} />
                  <span>Jump to Year End (t = 1)</span>
                </button>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setIsRotating((p) => !p)}
                  aria-label="Toggle Model Rotation"
                >
                  <Icon name="rotate" size={14} />
                  <span>{isRotating ? 'Pause Orbit Spin' : 'Resume Orbit Spin'}</span>
                </button>

                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setSoundEnabled((p) => !p)}
                  aria-label="Toggle Audio"
                >
                  <Icon name={soundEnabled ? 'volume-2' : 'volume-x'} size={14} />
                  <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
                </button>
              </div>
            </div>

            {/* Compounding Frequency Presets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className={styles.sliderLabel}>
                <Icon name="sliders" size={14} />
                <span>Compounding Periods (n):</span>
              </span>
              <div className={styles.buttonGroup} role="group" aria-label="Compounding frequencies">
                {BERNOULLI_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`${styles.presetPill} ${selectedPreset === p.id ? styles.presetPillActive : ''}`}
                    onClick={() => handleSelectPreset(p.id)}
                    data-testid={`preset-${p.id}`}
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Progress Slider */}
            <div className={styles.sliderCard}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>
                  <Icon name="clock" size={14} />
                  <span>Investment Timeline Progress (t):</span>
                </span>
                <span className={styles.sliderValue}>
                  {(timelineProgress * 365).toFixed(0)} Days / 365 ({(timelineProgress * 100).toFixed(1)}%)
                </span>
              </div>
              <input
                type="range"
                className={styles.rangeInput}
                min="0.01"
                max="1.0"
                step="0.01"
                value={timelineProgress}
                onChange={(e) => setTimelineProgress(parseFloat(e.target.value))}
                aria-label="Timeline progress in years"
              />
            </div>
          </>
        )}

        {/* Mode 2 Controls: Calculus */}
        {activeMode === 'calculus' && (
          <div className={styles.controlsRow}>
            <div className={styles.sliderCard}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>
                  <Icon name="move" size={14} />
                  <span>Tangent Probe Position (x):</span>
                </span>
                <span className={styles.sliderValue}>x = {tangentX.toFixed(2)}</span>
              </div>
              <input
                type="range"
                className={styles.rangeInput}
                min="-1.8"
                max="1.8"
                step="0.05"
                value={tangentX}
                onChange={(e) => setTangentX(parseFloat(e.target.value))}
                aria-label="Tangent probe x position"
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={`${styles.btnSecondary} ${compareBases ? styles.presetPillActive : ''}`}
                onClick={() => setCompareBases((p) => !p)}
              >
                <Icon name="layers" size={15} />
                <span>Compare Bases (2ˣ vs eˣ vs 3ˣ)</span>
              </button>
            </div>
          </div>
        )}

        {/* Mode 3 Controls: Complex Rotation */}
        {activeMode === 'complex' && (
          <div className={styles.controlsRow}>
            <div className={styles.sliderCard}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>
                  <Icon name="rotate" size={14} />
                  <span>Phase Angle (θ):</span>
                </span>
                <span className={styles.sliderValue}>
                  θ = {angleTheta.toFixed(3)} rad ({(angleTheta * (180 / Math.PI)).toFixed(1)}°)
                </span>
              </div>
              <input
                type="range"
                className={styles.rangeInput}
                min="0"
                max={Math.PI * 2}
                step="0.05"
                value={angleTheta}
                onChange={(e) => setAngleTheta(parseFloat(e.target.value))}
                aria-label="Phase angle theta"
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={`${styles.btnSecondary} ${Math.abs(angleTheta - Math.PI) < 0.05 ? styles.presetPillActive : ''}`}
                onClick={() => setAngleTheta(Math.PI)}
              >
                <Icon name="target" size={14} />
                <span>Lock to θ = π (Euler&apos;s Identity)</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Live Telemetry Cards ── */}
        <div className={styles.telemetryGrid}>
          {activeMode === 'bernoulli' && (
            <>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Compounding Frequency (n)</span>
                <span className={styles.metricValue}>
                  {activeN >= 1e9 ? '∞ (Continuous)' : activeN.toLocaleString()}
                </span>
                <span className={styles.metricSub}>Interest credits per year</span>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Effective Compound Factor</span>
                <span className={styles.metricValue}>{currentBernoulliValue.toFixed(6)}</span>
                <span className={styles.metricSub}>Balance on $1.00 deposit</span>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Gap to Cosmic Ceiling (e - Aₙ)</span>
                <span className={styles.metricValue}>
                  {Math.max(0, Math.E - currentBernoulliValue).toExponential(4)}
                </span>
                <span className={styles.metricSub}>Infinitesimal residue</span>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Bernoulli Bound (1683)</span>
                <span className={styles.metricValue}>$2.718281828...</span>
                <span className={styles.metricSub}>Nature&apos;s compounding ceiling</span>
              </div>
            </>
          )}

          {activeMode === 'calculus' && (
            <>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Base 2 Slope Multiplier</span>
                <span className={styles.metricValue}>ln(2) ≈ 0.6931</span>
                <span className={styles.metricSub}>Grows slower than current size</span>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Base e Slope Multiplier</span>
                <span className={styles.metricValue} style={{ color: '#10B981' }}>
                  ln(e) = 1.000000
                </span>
                <span className={styles.metricSub}>Rate of growth ≡ Current size</span>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Base 3 Slope Multiplier</span>
                <span className={styles.metricValue}>ln(3) ≈ 1.0986</span>
                <span className={styles.metricSub}>Grows faster than current size</span>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Instantaneous Tangent Slope</span>
                <span className={styles.metricValue}>{Math.exp(tangentX).toFixed(6)}</span>
                <span className={styles.metricSub}>Identical to height y = {Math.exp(tangentX).toFixed(6)}</span>
              </div>
            </>
          )}

          {activeMode === 'complex' && (
            <>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Real Component (cos θ)</span>
                <span className={styles.metricValue}>{Math.cos(angleTheta).toFixed(6)}</span>
                <span className={styles.metricSub}>Horizontal projection</span>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Imaginary Component (sin θ)</span>
                <span className={styles.metricValue}>{Math.sin(angleTheta).toFixed(6)}i</span>
                <span className={styles.metricSub}>Vertical projection</span>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Modulus |e^{'{iθ}'}|</span>
                <span className={styles.metricValue} style={{ color: '#10B981' }}>
                  1.000000
                </span>
                <span className={styles.metricSub}>Unit circle isometry</span>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Identity Residue</span>
                <span className={styles.metricValue}>
                  {Math.abs(angleTheta - Math.PI) < 0.05 ? 'e^(iπ) + 1 = 0' : '|e^(iθ) - (-1)| > 0'}
                </span>
                <span className={styles.metricSub}>Euler&apos;s masterpiece condition</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Educational Mathematical Breakdown (Formatted with clean mathRenderer) ── */}
      <div className={styles.educationalSection}>
        <div
          className={styles.accordionHeader}
          onClick={() => setEducationalOpen((prev) => !prev)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setEducationalOpen((prev) => !prev)}
        >
          <div className={styles.accordionTitle}>
            <Icon name="math" size={18} color="#10B981" />
            <span>Mathematical Derivations & Historical Thought Experiment</span>
          </div>
          <Icon name={educationalOpen ? 'x' : 'sparkles'} size={16} />
        </div>

        {educationalOpen && (
          <div className={styles.accordionContent}>
            <div className={styles.formulaBox}>
              <div className={styles.formulaHeader}>1. Jacob Bernoulli (1683) — The Compound Interest Wager</div>
              <p dangerouslySetInnerHTML={{
                __html: renderMathInMarkdown(
                  'Bernoulli asked: If an account pays 100% annual interest on $1.00, what happens as the compounding frequency $n$ approaches infinity?'
                ),
              }} />
              <div
                className={styles.formulaBlock}
                dangerouslySetInnerHTML={{
                  __html: cleanDisplayFormula('A_n = P \\cdot \\left(1 + \\frac{1}{n}\\right)^n'),
                }}
              />
              <p dangerouslySetInnerHTML={{
                __html: renderMathInMarkdown(
                  'Does balance grow without bound? No! As $n \\to \\infty$, the compounding pulses converge to an immutable upper ceiling:'
                ),
              }} />
              <div
                className={styles.formulaBlock}
                dangerouslySetInnerHTML={{
                  __html: cleanDisplayFormula('\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e \\approx 2.718281828459...'),
                }}
              />
            </div>

            <div className={styles.formulaBox}>
              <div className={styles.formulaHeader}>2. Leonhard Euler (1736) — The Factorial Series</div>
              <p dangerouslySetInnerHTML={{
                __html: renderMathInMarkdown(
                  'In *Mechanica*, Euler derived $e$ as the infinite sum of inverse factorials:'
                ),
              }} />
              <div
                className={styles.formulaBlock}
                dangerouslySetInnerHTML={{
                  __html: cleanDisplayFormula('e = \\sum_{k=0}^\\infty \\frac{1}{k!} = 1 + 1 + \\frac{1}{2} + \\frac{1}{6} + \\frac{1}{24} + \\dots'),
                }}
              />
              <p dangerouslySetInnerHTML={{
                __html: renderMathInMarkdown(
                  'Because factorials grow super-exponentially, this series converges with astonishing rapidity. Euler calculated 23 digits and proved in 1737 that $e$ is irrational.'
                ),
              }} />
            </div>

            <div className={styles.formulaBox}>
              <div className={styles.formulaHeader}>3. The Calculus Rate Invariance Miracle</div>
              <p dangerouslySetInnerHTML={{
                __html: renderMathInMarkdown(
                  'In calculus, the derivative of an exponential function $a^x$ scales by the natural logarithm of its base:'
                ),
              }} />
              <div
                className={styles.formulaBlock}
                dangerouslySetInnerHTML={{
                  __html: cleanDisplayFormula('\\frac{d}{dx}\\left(a^x\\right) = \\ln(a) \\cdot a^x'),
                }}
              />
              <p dangerouslySetInnerHTML={{
                __html: renderMathInMarkdown(
                  'Only when $a = e$ does $\\ln(e) = 1.000000$. Hence $e^x$ is the unique non-trivial function identical to its own derivative:'
                ),
              }} />
              <div
                className={styles.formulaBlock}
                dangerouslySetInnerHTML={{
                  __html: cleanDisplayFormula('\\frac{d}{dx}\\left(e^x\\right) = e^x'),
                }}
              />
            </div>

            <div className={styles.formulaBox}>
              <div className={styles.formulaHeader}>4. Euler&apos;s Identity — The 5 Fundamental Constants</div>
              <p dangerouslySetInnerHTML={{
                __html: renderMathInMarkdown(
                  'In the complex plane, multiplication by the imaginary unit $i$ acts as a perpendicular torque, turning exponential growth into circular rotation:'
                ),
              }} />
              <div
                className={styles.formulaBlock}
                dangerouslySetInnerHTML={{
                  __html: cleanDisplayFormula('e^{i\\theta} = \\cos\\theta + i\\sin\\theta'),
                }}
              />
              <p dangerouslySetInnerHTML={{
                __html: renderMathInMarkdown(
                  'Setting $\\theta = \\pi$ produces the most revered equation in mathematical physics, linking $e, i, \\pi, 1,$ and $0$:'
                ),
              }} />
              <div
                className={styles.formulaBlock}
                dangerouslySetInnerHTML={{
                  __html: cleanDisplayFormula('e^{i\\pi} + 1 = 0'),
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
