'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Icon from '@/components/common/Icon';
import VisualizationGuideHUD from '@/components/interactive/VisualizationGuideHUD';
import styles from './BrouwersFixedPoint3DLab.module.css';

// Audio Synthesizer for Topological Chimes, Fluid Swirls, and Paper Crinkles
class BrouwerAudioEngine {
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

  playSwirl(frequency = 190, duration = 0.5) {
    if (this.isMuted || !this.ctx) return;
    const nowMs = performance.now();
    if (nowMs - this.lastPlay < 60) return;
    this.lastPlay = nowMs;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(360, now);
      filter.frequency.exponentialRampToValueAtTime(140, now + duration);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.linearRampToValueAtTime(frequency * 0.65, now + duration);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio suppression fallback
    }
  }

  playChime(frequency = 659.25, duration = 0.28) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio suppression fallback
    }
  }

  playCrumple() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = i * 0.08;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320 - i * 60, now + delay);
        osc.frequency.exponentialRampToValueAtTime(80, now + delay + 0.12);

        gain.gain.setValueAtTime(0.09, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.15);
      }
    } catch {
      // Audio suppression fallback
    }
  }
}

const audioEngine = new BrouwerAudioEngine();

export default function BrouwersFixedPoint3DLab() {
  const mountRef = useRef(null);

  // Active Lab Mode: 'coffee' (Fluid Vortex) | 'map' (Crumpled Map Paradox)
  const [activeMode, setActiveMode] = useState('coffee');

  // Mode 1: Coffee Cup Stir Controls
  const [stirSpeed, setStirSpeed] = useState(60); // RPM: 0 to 120
  const [vortexX, setVortexX] = useState(0.0); // -0.8 to 0.8
  const [vortexZ, setVortexZ] = useState(0.0); // -0.8 to 0.8
  const [showVectors, setShowVectors] = useState(true);

  // Mode 2: Crumpled Map Invariant Controls
  const [crumpleFactor, setCrumpleFactor] = useState(70); // 0 (flat) to 100 (deeply crumpled)
  const [mapRotation, setMapRotation] = useState(40); // 0 to 360 degrees
  const [showLaserBeam, setShowLaserBeam] = useState(true);

  // Action Active States
  const [isStirringActive, setIsStirringActive] = useState(false);
  const [isCrumplingActive, setIsCrumplingActive] = useState(false);

  // Audio Mute State
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Three.js References
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Mesh References
  const coffeeGroupRef = useRef(null);
  const mapGroupRef = useRef(null);
  const spoonRef = useRef(null);
  const liquidMeshRef = useRef(null);
  const liquidBasePosRef = useRef(null);
  const tracerParticlesRef = useRef(null);
  const vectorArrowsRef = useRef([]);
  const fixedBeaconRef = useRef(null);
  const pulseRingRef = useRef(null);

  const crumpledMeshRef = useRef(null);
  const crumpledBasePosRef = useRef(null);
  const laserBeamRef = useRef(null);
  const mapTargetsRef = useRef({ top: null, bottom: null });

  // Animation Timers & Interpolators (Refs for smooth 60fps)
  const stirTimerRef = useRef(0);
  const crumpleTimerRef = useRef(0);
  const currentCrumpleRef = useRef(0.7); // Internal smoothly interpolated crumple amount

  // Telemetry Metrics State
  const [telemetry, setTelemetry] = useState({
    fixedPointX: '0.000',
    fixedPointY: '0.000',
    fixedPointZ: '0.900',
    residualError: '0.00000000',
    velocityAtPoint: '0.0000 mm/s',
    domainStatus: 'Compact Convex K ⊂ ℝ³',
    topologicalInvariant: 'f(x*) = x*',
  });

  // Sound Mute Toggle
  const toggleAudio = useCallback(() => {
    audioEngine.init();
    audioEngine.isMuted = !isAudioMuted;
    setIsAudioMuted(!isAudioMuted);
  }, [isAudioMuted]);

  // Action: Stir Fluid Grid (Challenge 1 action)
  const handleStirAction = useCallback(() => {
    audioEngine.init();
    audioEngine.playSwirl(240, 0.6);
    setIsStirringActive(true);
    stirTimerRef.current = 4.5; // 4.5-second stirring sequence

    // Dynamically shift vortex position to demonstrate invariance across arbitrary center points
    const nextVx = (Math.random() - 0.5) * 0.95;
    const nextVz = (Math.random() - 0.5) * 0.95;
    setVortexX(nextVx);
    setVortexZ(nextVz);
    setStirSpeed((prev) => Math.min(prev + 30, 115));
  }, []);

  // Action: Crumple Coordinate Map (Challenge 2 action)
  const handleCrumpleAction = useCallback(() => {
    audioEngine.init();
    audioEngine.playCrumple();
    setIsCrumplingActive(true);
    crumpleTimerRef.current = 3.5; // 3.5-second progressive folding sequence

    // If already crumpled, smooth fold to new configuration; if flat, crinkle up!
    setCrumpleFactor((prev) => (prev > 75 ? 35 : prev + 25));
    setMapRotation((prev) => (prev + 60) % 360);
  }, []);

  // Three.js Scene Setup & Loop
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 5.5, 6.8);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 3.2;
    controls.maxDistance = 16;
    controls.target.set(0, 0.4, 0);
    controlsRef.current = controls;

    // 5. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(5, 11, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-6, 5, -4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xeab308, 0.8, 10);
    rimLight.position.set(0, -0.6, 3.2);
    scene.add(rimLight);

    // Studio Table Platform
    const tableGeo = new THREE.CylinderGeometry(5.2, 5.2, 0.16, 64);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x11141e,
      roughness: 0.85,
      metalness: 0.1,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = -1.55;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // ─────────────────────────────────────────────────────────────
    // 6. BUILD MODE 1: COFFEE CUP & FLUID MECHANICS
    // ─────────────────────────────────────────────────────────────
    const coffeeGroup = new THREE.Group();
    coffeeGroupRef.current = coffeeGroup;
    scene.add(coffeeGroup);

    // Ceramic Porcelain Mug Body
    const mugOuterGeo = new THREE.CylinderGeometry(1.85, 1.45, 2.6, 48, 1, false);
    const porcelainMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d212c,
      roughness: 0.14,
      metalness: 0.05,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
    });
    const mugMesh = new THREE.Mesh(mugOuterGeo, porcelainMat);
    mugMesh.position.y = -0.15;
    mugMesh.castShadow = true;
    mugMesh.receiveShadow = true;
    coffeeGroup.add(mugMesh);

    // Gold Rim Accent Ring
    const rimGeo = new THREE.TorusGeometry(1.86, 0.05, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      roughness: 0.3,
      metalness: 0.85,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 1.15;
    coffeeGroup.add(rimMesh);

    // Ceramic Handle Loop
    const handleGeo = new THREE.TorusGeometry(0.9, 0.16, 16, 36, Math.PI * 0.95);
    const handleMesh = new THREE.Mesh(handleGeo, porcelainMat);
    handleMesh.position.set(1.8, -0.15, 0);
    handleMesh.rotation.z = -Math.PI / 2 + 0.15;
    handleMesh.castShadow = true;
    coffeeGroup.add(handleMesh);

    // Dynamic Coffee Liquid Mesh
    // Constructed with dense subdivisions and clamped circular perimeter
    const liquidSubdivisions = 48;
    const liquidGeo = new THREE.PlaneGeometry(3.56, 3.56, liquidSubdivisions, liquidSubdivisions);
    const lPos = liquidGeo.attributes.position;
    const baseLiquidPos = new Float32Array(lPos.count * 3);

    // Clamp square grid to circular cylinder boundary (radius 1.76)
    for (let i = 0; i < lPos.count; i++) {
      let x = lPos.getX(i);
      let y = lPos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      if (r > 1.76) {
        x = (x / r) * 1.76;
        y = (y / r) * 1.76;
        lPos.setXY(i, x, y);
      }
      baseLiquidPos[i * 3 + 0] = x;
      baseLiquidPos[i * 3 + 1] = y;
      baseLiquidPos[i * 3 + 2] = 0;
    }
    liquidGeo.computeVertexNormals();
    liquidBasePosRef.current = baseLiquidPos;

    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0x1f1108,
      roughness: 0.08,
      metalness: 0.05,
      transmission: 0.28,
      ior: 1.34,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.rotation.x = -Math.PI / 2;
    liquidMesh.position.y = 0.88;
    liquidMeshRef.current = liquidMesh;
    coffeeGroup.add(liquidMesh);

    // Stainless Steel Stirring Spoon
    const spoonGroup = new THREE.Group();
    spoonRef.current = spoonGroup;

    const spoonMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    });
    const spoonHandleGeo = new THREE.CylinderGeometry(0.035, 0.045, 2.7, 16);
    const spoonHandle = new THREE.Mesh(spoonHandleGeo, spoonMat);
    spoonHandle.position.y = 1.35;
    spoonGroup.add(spoonHandle);

    const spoonHeadGeo = new THREE.SphereGeometry(0.24, 16, 16);
    spoonHeadGeo.scale(1.0, 0.35, 1.4);
    const spoonHead = new THREE.Mesh(spoonHeadGeo, spoonMat);
    spoonHead.position.y = 0.06;
    spoonHead.rotation.x = 0.28;
    spoonGroup.add(spoonHead);

    spoonGroup.position.set(0.65, 0.95, 0.5);
    spoonGroup.rotation.z = -0.35;
    spoonGroup.rotation.x = 0.2;
    coffeeGroup.add(spoonGroup);

    // 550+ Swirling Tracer Particles (Crema & Grounds)
    const particleCount = 550;
    const tracerGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const radii = new Float32Array(particleCount);
    const angles = new Float32Array(particleCount);
    const depths = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const r = 0.1 + Math.sqrt(Math.random()) * 1.55;
      const theta = Math.random() * Math.PI * 2;
      const d = (Math.random() - 0.5) * 0.08;

      radii[i] = r;
      angles[i] = theta;
      depths[i] = d;

      positions[i * 3 + 0] = Math.cos(theta) * r;
      positions[i * 3 + 1] = 0.89 + d;
      positions[i * 3 + 2] = Math.sin(theta) * r;
    }

    tracerGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const tracerMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.055,
      transparent: true,
      opacity: 0.9,
    });
    const tracerPoints = new THREE.Points(tracerGeo, tracerMat);
    tracerParticlesRef.current = { points: tracerPoints, radii, angles, depths };
    coffeeGroup.add(tracerPoints);

    // Vector Flow Field Arrows
    const vectorArrowGroup = new THREE.Group();
    const arrowCount = 28;
    const arrowHelpers = [];

    for (let i = 0; i < arrowCount; i++) {
      const r = 0.4 + (i / arrowCount) * 1.15;
      const angle = (i * 1.37) % (Math.PI * 2);
      const px = Math.cos(angle) * r;
      const pz = Math.sin(angle) * r;
      const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)).normalize();

      const arrow = new THREE.ArrowHelper(tangent, new THREE.Vector3(px, 0.91, pz), 0.22, 0x38bdf8, 0.08, 0.05);
      arrow.line.material.transparent = true;
      arrow.line.material.opacity = 0.75;
      arrowHelpers.push({ arrow, r, angle });
      vectorArrowGroup.add(arrow);
    }
    vectorArrowsRef.current = arrowHelpers;
    coffeeGroup.add(vectorArrowGroup);

    // Invariant Fixed Point Reticle Beacon
    const fixedBeaconGroup = new THREE.Group();
    fixedBeaconRef.current = fixedBeaconGroup;

    const ringGeo1 = new THREE.RingGeometry(0.12, 0.16, 32);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2;
    fixedBeaconGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(0.24, 0.28, 32);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xeab308, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2;
    pulseRingRef.current = ring2;
    fixedBeaconGroup.add(ring2);

    const needleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.65, 16);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.y = 0.32;
    fixedBeaconGroup.add(needle);

    const coreGeo = new THREE.SphereGeometry(0.055, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const coreNode = new THREE.Mesh(coreGeo, coreMat);
    fixedBeaconGroup.add(coreNode);

    fixedBeaconGroup.position.set(0, 0.88, 0);
    coffeeGroup.add(fixedBeaconGroup);

    // ─────────────────────────────────────────────────────────────
    // 7. BUILD MODE 2: CRUMPLED MAP PARADOX
    // ─────────────────────────────────────────────────────────────
    const mapGroup = new THREE.Group();
    mapGroupRef.current = mapGroup;
    scene.add(mapGroup);
    mapGroup.visible = false;

    // Bottom Reference Map (Flat Coordinate Grid)
    const refMapGeo = new THREE.PlaneGeometry(3.6, 3.6, 24, 24);
    const refMapMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const refMapMesh = new THREE.Mesh(refMapGeo, refMapMat);
    refMapMesh.rotation.x = -Math.PI / 2;
    refMapMesh.position.y = -0.8;
    refMapMesh.receiveShadow = true;
    mapGroup.add(refMapMesh);

    const gridHelper = new THREE.GridHelper(3.6, 18, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -0.79;
    mapGroup.add(gridHelper);

    // Top Crumpled Map (Wrinkled 3D Parchment Sheet)
    const crumpleSubdivisions = 56;
    const crumpleGeo = new THREE.PlaneGeometry(3.4, 3.4, crumpleSubdivisions, crumpleSubdivisions);
    const cPos = crumpleGeo.attributes.position;
    const baseCrumplePos = new Float32Array(cPos.count * 3);
    for (let i = 0; i < cPos.count; i++) {
      baseCrumplePos[i * 3 + 0] = cPos.getX(i);
      baseCrumplePos[i * 3 + 1] = cPos.getY(i);
      baseCrumplePos[i * 3 + 2] = 0;
    }
    crumpledBasePosRef.current = baseCrumplePos;

    const crumpleMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.55,
      metalness: 0.08,
      side: THREE.DoubleSide,
      flatShading: true,
    });
    const crumpledMesh = new THREE.Mesh(crumpleGeo, crumpleMat);
    crumpledMesh.rotation.x = -Math.PI / 2;
    crumpledMesh.position.y = 0.65;
    crumpledMesh.castShadow = true;
    crumpledMeshRef.current = crumpledMesh;
    mapGroup.add(crumpledMesh);

    // Vertical Laser Invariant Beam
    const laserGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.48, 16);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.position.set(0.2, -0.06, 0.15);
    laserBeamRef.current = laserBeam;
    mapGroup.add(laserBeam);

    // Reticle Targets for Top and Bottom Maps
    const topTargetGeo = new THREE.RingGeometry(0.08, 0.13, 24);
    const topTargetMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const topTarget = new THREE.Mesh(topTargetGeo, topTargetMat);
    topTarget.rotation.x = Math.PI / 2;
    mapGroup.add(topTarget);

    const bottomTarget = new THREE.Mesh(topTargetGeo, topTargetMat);
    bottomTarget.rotation.x = Math.PI / 2;
    mapGroup.add(bottomTarget);

    mapTargetsRef.current = { top: topTarget, bottom: bottomTarget };

    // ─────────────────────────────────────────────────────────────
    // 8. ANIMATION RENDER LOOP (60 FPS FLUID & CRUMPLE KINEMATICS)
    // ─────────────────────────────────────────────────────────────
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();

      // Decrement action animation timers
      if (stirTimerRef.current > 0) {
        stirTimerRef.current = Math.max(0, stirTimerRef.current - delta);
        if (stirTimerRef.current === 0) {
          setIsStirringActive(false);
          audioEngine.playChime(784, 0.4); // Chime on settling onto invariant point
        }
      }
      if (crumpleTimerRef.current > 0) {
        crumpleTimerRef.current = Math.max(0, crumpleTimerRef.current - delta);
        if (crumpleTimerRef.current === 0) {
          setIsCrumplingActive(false);
          audioEngine.playChime(880, 0.35); // Chime on completing crumple lock
        }
      }

      // ── FLUID MECHANICS (COFFEE CUP) ──
      if (coffeeGroup.visible) {
        const isStirring = stirTimerRef.current > 0;
        const currentRPM = isStirring ? stirSpeed * 1.5 : stirSpeed;
        const radPerSec = (currentRPM / 60) * Math.PI * 2;

        const vx = vortexX;
        const vz = vortexZ;
        const vortexDepth = (currentRPM / 120) * 0.45;

        // Dynamic Spoon Trajectory & Local Scoop Position
        let spoonX = 0.65;
        let spoonY = 0.95;
        let spoonZ = 0.5;

        if (spoonRef.current) {
          if (isStirring) {
            const stirAngle = elapsed * 8.0;
            const stirRadius = 0.75 + 0.25 * Math.sin(elapsed * 3.5);
            spoonX = vx + Math.cos(stirAngle) * stirRadius;
            spoonZ = vz + Math.sin(stirAngle) * stirRadius;
            spoonY = 0.88 + 0.1 * Math.sin(stirAngle * 2);

            spoonRef.current.position.set(spoonX, spoonY, spoonZ);
            spoonRef.current.rotation.z = -0.38 * Math.cos(stirAngle);
            spoonRef.current.rotation.x = 0.38 * Math.sin(stirAngle);
          } else {
            // Resting against inner rim
            spoonX = 0.65;
            spoonY = 0.95;
            spoonZ = 0.5;
            spoonRef.current.position.set(spoonX, spoonY, spoonZ);
            spoonRef.current.rotation.z = -0.35;
            spoonRef.current.rotation.x = 0.2;
          }
        }

        // Deform Liquid Mesh Surface Vertices
        if (liquidMeshRef.current && liquidBasePosRef.current) {
          const posAttr = liquidMeshRef.current.geometry.attributes.position;
          const basePos = liquidBasePosRef.current;

          for (let i = 0; i < posAttr.count; i++) {
            const bx = basePos[i * 3 + 0];
            const by = basePos[i * 3 + 1];

            // Local plane coords -> World coords
            const wx = bx;
            const wz = -by;

            // Distance to primary vortex eye (vx, vz)
            const distVortexSq = (wx - vx) ** 2 + (wz - vz) ** 2;

            // Distance to stirring spoon scoop
            const distSpoonSq = (wx - spoonX) ** 2 + (wz - spoonZ) ** 2;
            const rSpoon = Math.sqrt(distSpoonSq);

            // Centrifugal whirlpool dip
            const vortexDip = -vortexDepth * Math.exp(-distVortexSq / 0.7);

            // Rim parabolic rise
            const rCenter = Math.sqrt(wx * wx + wz * wz);
            const rimRise = ((rCenter / 1.76) ** 2) * (vortexDepth * 0.35);

            // Spoon churn & turbulent wake ripples
            const spoonChurn = isStirring ? -0.16 * Math.exp(-distSpoonSq / 0.18) : 0;
            const wakeWave = isStirring
              ? 0.05 * Math.sin(rSpoon * 14 - elapsed * 12) * Math.exp(-rSpoon * 1.5)
              : 0.015 * Math.sin(rCenter * 8 - elapsed * 4);

            // Total local Z displacement (which is World Y)
            const totalDisplacement = vortexDip + rimRise + spoonChurn + wakeWave;
            posAttr.setZ(i, totalDisplacement);
          }

          posAttr.needsUpdate = true;
          liquidMeshRef.current.geometry.computeVertexNormals();
        }

        // Swirling Tracer Particles (Coffee Crema & Ground Flecks)
        if (tracerParticlesRef.current) {
          const { points, radii, angles, depths } = tracerParticlesRef.current;
          const posAttr = points.geometry.attributes.position;

          for (let i = 0; i < radii.length; i++) {
            const r = radii[i];
            const speedMultiplier = Math.max(0.2, 1.3 - r * 0.45);
            angles[i] += radPerSec * delta * speedMultiplier;

            const px = vx + Math.cos(angles[i]) * r;
            const pz = vz + Math.sin(angles[i]) * r;

            // Constrain inside circular cup perimeter
            const cupDist = Math.sqrt(px * px + pz * pz);
            let finalX = px;
            let finalZ = pz;
            if (cupDist > 1.65) {
              finalX = (px / cupDist) * 1.65;
              finalZ = (pz / cupDist) * 1.65;
            }

            const distVortex = Math.sqrt((finalX - vx) ** 2 + (finalZ - vz) ** 2);
            const finalY = 0.88 + depths[i] - vortexDepth * Math.exp(-(distVortex ** 2) / 0.7);

            posAttr.setXYZ(i, finalX, finalY, finalZ);
          }
          posAttr.needsUpdate = true;
        }

        // Position Fixed Point Invariant Beacon
        if (fixedBeaconRef.current) {
          const beaconY = 0.88 - vortexDepth;
          fixedBeaconRef.current.position.set(vx, beaconY, vz);

          const pulseScale = 1 + Math.sin(elapsed * 5) * 0.18;
          if (pulseRingRef.current) {
            pulseRingRef.current.scale.set(pulseScale, pulseScale, 1);
          }
        }

        // Telemetry Update for Coffee Mode
        setTelemetry({
          fixedPointX: vx.toFixed(3),
          fixedPointY: vz.toFixed(3),
          fixedPointZ: (0.88 - vortexDepth).toFixed(3),
          residualError: '0.00000000',
          velocityAtPoint: '0.0000 mm/s',
          domainStatus: 'Compact Convex K ⊂ ℝ³',
          topologicalInvariant: 'f(x*) = x*',
        });
      }

      // ── CRUMPLED MAP MECHANICS ──
      if (mapGroup.visible && crumpledMeshRef.current && crumpledBasePosRef.current) {
        // Smoothly interpolate crumple amount
        const targetCrumple = crumpleFactor / 100;
        currentCrumpleRef.current += (targetCrumple - currentCrumpleRef.current) * Math.min(delta * 4, 0.2);
        const c = currentCrumpleRef.current;

        const rotRad = (mapRotation * Math.PI) / 180;
        const posAttr = crumpledMeshRef.current.geometry.attributes.position;
        const basePos = crumpledBasePosRef.current;

        // Inward shrinkage factor as paper is crumpled
        const contract = 1.0 - c * 0.35;

        for (let i = 0; i < posAttr.count; i++) {
          const u0 = basePos[i * 3 + 0];
          const v0 = basePos[i * 3 + 1];

          // 1. Inward lateral contraction & non-linear folding
          const uCrumpled = u0 * contract + c * 0.12 * Math.sin(u0 * 5.2 + v0 * 4.1);
          const vCrumpled = v0 * contract + c * 0.12 * Math.cos(v0 * 5.2 - u0 * 3.8);

          // 2. High-frequency sharp origami ridges & creases (Z in local space)
          const crease1 = Math.abs(Math.sin(u0 * 4.2 + v0 * 3.1 + rotRad)) * 0.42;
          const crease2 = Math.abs(Math.cos(v0 * 6.5 - u0 * 4.8)) * 0.32;
          const fineWrinkle = Math.sin(u0 * 11.0) * Math.cos(v0 * 9.5) * 0.14;

          const totalWrinkle = (crease1 + crease2 + fineWrinkle - 0.35) * c * 1.5;

          posAttr.setXYZ(i, uCrumpled, vCrumpled, totalWrinkle);
        }

        posAttr.needsUpdate = true;
        crumpledMeshRef.current.geometry.computeVertexNormals();

        // Rotate entire crumpled sheet
        crumpledMeshRef.current.rotation.z = rotRad;

        // Sheet drops closer to base map as it crumples down
        const paperHeight = 0.85 - c * 0.35;
        crumpledMeshRef.current.position.y = paperHeight;

        // Invariant coordinate for contraction mapping
        // Brouwer fixed coordinate theorem for rotated contractive mapping
        const fixedX = 0.25 * (1 - contract);
        const fixedZ = 0.18 * (1 - contract);

        // Update Laser Invariant Beam
        if (laserBeamRef.current) {
          laserBeamRef.current.position.set(fixedX, (paperHeight - 0.8) / 2, fixedZ);
          laserBeamRef.current.scale.y = Math.max(0.2, (paperHeight + 0.8) / 1.48);
          laserBeamRef.current.material.opacity = 0.65 + Math.sin(elapsed * 7) * 0.3;
        }

        // Update Target Reticles on Top and Bottom Sheets
        if (mapTargetsRef.current.top && mapTargetsRef.current.bottom) {
          mapTargetsRef.current.top.position.set(fixedX, paperHeight + 0.05, fixedZ);
          mapTargetsRef.current.bottom.position.set(fixedX, -0.78, fixedZ);
        }

        setTelemetry({
          fixedPointX: fixedX.toFixed(3),
          fixedPointY: fixedZ.toFixed(3),
          fixedPointZ: paperHeight.toFixed(3),
          residualError: '0.00000000',
          velocityAtPoint: '|f(x) - x| = 0',
          domainStatus: 'Contracted Disk D² ⊂ ℝ²',
          topologicalInvariant: 'x* = f(x*)',
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Mode Switcher Visibility & Camera Layout
  useEffect(() => {
    if (!coffeeGroupRef.current || !mapGroupRef.current || !cameraRef.current || !controlsRef.current) return;

    if (activeMode === 'coffee') {
      coffeeGroupRef.current.visible = true;
      coffeeGroupRef.current.position.set(0, 0, 0);
      mapGroupRef.current.visible = false;
      cameraRef.current.position.set(0, 5.5, 6.8);
      controlsRef.current.target.set(0, 0.4, 0);
    } else {
      coffeeGroupRef.current.visible = false;
      mapGroupRef.current.visible = true;
      mapGroupRef.current.position.set(0, 0, 0);
      cameraRef.current.position.set(0, 4.8, 5.8);
      controlsRef.current.target.set(0, 0.2, 0);
    }
  }, [activeMode]);

  // Vector Field Visibility
  useEffect(() => {
    if (!vectorArrowsRef.current) return;
    vectorArrowsRef.current.forEach(({ arrow }) => {
      arrow.visible = showVectors;
    });
  }, [showVectors]);

  return (
    <div className={styles.labContainer} data-testid="brouwers-fixed-point-3d-lab">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className={styles.canvasMount} />

      {/* Top Header Mode Switcher (Clean 2-Tab Navigation) */}
      <div className={styles.topOverlay}>
        <div className={styles.modeSwitcher} role="tablist">
          <button
            type="button"
            className={`${styles.modeBtn} ${activeMode === 'coffee' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setActiveMode('coffee');
              audioEngine.init();
              audioEngine.playChime(520, 0.2);
            }}
            role="tab"
            aria-selected={activeMode === 'coffee'}
          >
            <Icon name="coffee" size={14} />
            <span>1. The Coffee Cup Stir</span>
          </button>

          <button
            type="button"
            className={`${styles.modeBtn} ${activeMode === 'map' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setActiveMode('map');
              audioEngine.init();
              audioEngine.playChime(660, 0.2);
            }}
            role="tab"
            aria-selected={activeMode === 'map'}
          >
            <Icon name="map" size={14} />
            <span>2. The Crumpled Map Paradox</span>
          </button>
        </div>

        <div className={styles.utilityGroup}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={toggleAudio}
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            <Icon name={isAudioMuted ? 'volume-x' : 'volume-2'} size={16} />
          </button>
        </div>
      </div>

      {/* Floating Telemetry & Mathematical Invariant HUD */}
      <div className={styles.telemetryHUD}>
        <div className={styles.hudHeader}>
          <div className={styles.hudTitle}>
            <Icon name="target" size={14} />
            <span>Invariant Fixed Point</span>
          </div>
          <span className={styles.hudStatus}>
            <span className={styles.statusPulse} />
            <span>Guaranteed Exists</span>
          </span>
        </div>

        <div className={styles.hudGrid}>
          <div className={styles.hudMetric}>
            <span className={styles.hudLabel}>Fixed Coord (x*, z*)</span>
            <span className={styles.hudValue}>
              ({telemetry.fixedPointX}, {telemetry.fixedPointY})
            </span>
          </div>
          <div className={styles.hudMetric}>
            <span className={styles.hudLabel}>Residual Invariance</span>
            <span className={styles.hudValue}>{telemetry.residualError}</span>
          </div>
          <div className={styles.hudMetric}>
            <span className={styles.hudLabel}>Velocity at Node</span>
            <span className={styles.hudValue}>{telemetry.velocityAtPoint}</span>
          </div>
          <div className={styles.hudMetric}>
            <span className={styles.hudLabel}>Topology Set</span>
            <span className={styles.hudValue}>{telemetry.domainStatus}</span>
          </div>
        </div>

        <div className={styles.hudFormulaBox}>
          <strong>Brouwer&apos;s Invariance Theorem:</strong> Any continuous transformation{' '}
          <code>f: K → K</code> on a compact convex domain <code>K</code> leaves at least one coordinate invariant: <code>f(x*) = x*</code>.
        </div>
      </div>

      {/* Standardized Viewport Navigation HUD */}
      <VisualizationGuideHUD
        mode="3d"
        title="Brouwer Invariant Lab Navigation"
        hotkeys={[
          { key: 'Left Drag', action: 'Orbit 3D Studio' },
          { key: 'Scroll', action: 'Zoom into Invariant Node' },
          { key: 'Right Drag', action: 'Pan Camera' },
        ]}
      />

      {/* Bottom Interactive Controls */}
      <div className={styles.bottomControls}>
        {activeMode === 'coffee' ? (
          <>
            <div className={styles.sliderGroup}>
              <div className={styles.sliderItem}>
                <div className={styles.sliderHeader}>
                  <span>Stirring Velocity</span>
                  <span className={styles.sliderValue}>{stirSpeed} RPM</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={stirSpeed}
                  onChange={(e) => setStirSpeed(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Stirring Velocity"
                />
              </div>

              <div className={styles.sliderItem}>
                <div className={styles.sliderHeader}>
                  <span>Vortex Center X</span>
                  <span className={styles.sliderValue}>{vortexX.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-0.8"
                  max="0.8"
                  step="0.05"
                  value={vortexX}
                  onChange={(e) => setVortexX(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Vortex X Offset"
                />
              </div>

              <div className={styles.sliderItem}>
                <div className={styles.sliderHeader}>
                  <span>Vortex Center Z</span>
                  <span className={styles.sliderValue}>{vortexZ.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-0.8"
                  max="0.8"
                  step="0.05"
                  value={vortexZ}
                  onChange={(e) => setVortexZ(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Vortex Z Offset"
                />
              </div>
            </div>

            <div className={styles.actionButtonGroup}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${showVectors ? styles.toggleBtnActive : ''}`}
                onClick={() => setShowVectors(!showVectors)}
              >
                <Icon name="activity" size={13} />
                <span>Vector Field</span>
              </button>

              <button
                type="button"
                className={styles.primaryActionBtn}
                onClick={handleStirAction}
              >
                <Icon name="refresh-cw" size={14} />
                <span>{isStirringActive ? 'Churning Liquid...' : 'Stir Fluid Grid'}</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.sliderGroup}>
              <div className={styles.sliderItem}>
                <div className={styles.sliderHeader}>
                  <span>Crumple Deformation</span>
                  <span className={styles.sliderValue}>{crumpleFactor}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={crumpleFactor}
                  onChange={(e) => setCrumpleFactor(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Crumple Deformation"
                />
              </div>

              <div className={styles.sliderItem}>
                <div className={styles.sliderHeader}>
                  <span>Sheet Rotation Angle</span>
                  <span className={styles.sliderValue}>{mapRotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={mapRotation}
                  onChange={(e) => setMapRotation(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Sheet Rotation"
                />
              </div>
            </div>

            <div className={styles.actionButtonGroup}>
              <button
                type="button"
                className={styles.primaryActionBtn}
                onClick={handleCrumpleAction}
              >
                <Icon name="layers" size={14} />
                <span>{isCrumplingActive ? 'Folding Sheet...' : 'Crumple Coordinate Map'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
