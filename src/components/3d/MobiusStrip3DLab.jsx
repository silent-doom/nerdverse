'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Icon from '@/components/common/Icon';
import VisualizationGuideHUD from '@/components/interactive/VisualizationGuideHUD';
import styles from './MobiusStrip3DLab.module.css';

// Audio Synthesizer for Topological Clicks & Chimes
class MobiusAudioEngine {
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

  playStep() {
    if (this.isMuted || !this.ctx) return;
    const nowMs = performance.now();
    if (nowMs - this.lastPlay < 90) return;
    this.lastPlay = nowMs;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.025);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // AudioContext policy suppression fallback
    }
  }

  playChime(frequency = 587.33, duration = 0.25) {
    if (this.isMuted || !this.ctx) return;
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
      // Audio fallback
    }
  }

  playSnip() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio fallback
    }
  }
}

const audioEngine = new MobiusAudioEngine();

/**
 * Anatomically authentic 3D Ant (Formicidae) Builder
 * Includes:
 * - Pear-shaped cranium with mandibles and compound black eyes
 * - Long 2-segment elbowed antennae (scape + flagellum)
 * - 3-segment thorax (pronotum, mesonotum, metanotum)
 * - Pinched petiole waist with dorsal node scale
 * - Segmented droplet gaster (abdomen)
 * - 6 jointed biological legs with coxa, femur (elevated arch), tibia (downward), and tarsus
 * - Fine technical drafting pen touching the surface
 */
function createAuthenticAntMesh() {
  const antGroup = new THREE.Group();

  // Anatomical Chitin Materials
  const chitinMat = new THREE.MeshPhysicalMaterial({
    color: 0x24140e, // Rich dark amber-brown ant chitin
    roughness: 0.3,
    metalness: 0.05,
    clearcoat: 0.85,
    clearcoatRoughness: 0.18,
    sheen: 0.8,
    sheenColor: 0x5a2d18,
  });

  const eyeMat = new THREE.MeshPhysicalMaterial({
    color: 0x050505, // Black glossy compound eye
    roughness: 0.05,
    metalness: 0.1,
    clearcoat: 1.0,
  });

  const penBrassMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Polished brass drafting pen
    metalness: 0.9,
    roughness: 0.2,
  });

  const penTipMat = new THREE.MeshBasicMaterial({
    color: 0xdc2626, // Crimson ink dispenser tip
  });

  // 1. Head (Caput)
  const headGeo = new THREE.SphereGeometry(0.13, 16, 16);
  headGeo.scale(1.2, 0.88, 0.95);
  const head = new THREE.Mesh(headGeo, chitinMat);
  head.position.set(0.32, 0.13, 0);
  antGroup.add(head);

  // Compound Eyes (lateral on head)
  const eyeGeo = new THREE.SphereGeometry(0.042, 12, 12);
  eyeGeo.scale(1.1, 1.2, 0.75);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.36, 0.16, 0.075);
  eyeR.rotation.y = 0.3;
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(0.36, 0.16, -0.075);
  eyeL.rotation.y = -0.3;
  antGroup.add(eyeR, eyeL);

  // Mandibles (curved pincer jaws)
  const mandibleGeo = new THREE.ConeGeometry(0.022, 0.12, 8);
  const mandibleR = new THREE.Mesh(mandibleGeo, chitinMat);
  mandibleR.position.set(0.44, 0.08, 0.035);
  mandibleR.rotation.set(0.2, 0.3, -Math.PI / 2 + 0.4);

  const mandibleL = new THREE.Mesh(mandibleGeo, chitinMat);
  mandibleL.position.set(0.44, 0.08, -0.035);
  mandibleL.rotation.set(-0.2, -0.3, -Math.PI / 2 + 0.4);
  antGroup.add(mandibleR, mandibleL);

  // Jointed Antennae (Scape + Flagellum with natural elbow bend)
  [-1, 1].forEach((side) => {
    const antennaGroup = new THREE.Group();
    antennaGroup.position.set(0.38, 0.18, side * 0.04);

    // Scape (first segment, angling forward and up)
    const scapeGeo = new THREE.CylinderGeometry(0.007, 0.006, 0.18, 6);
    const scape = new THREE.Mesh(scapeGeo, chitinMat);
    scape.position.set(0.06, 0.07, side * 0.03);
    scape.rotation.set(side * 0.3, -0.2, -0.7);
    antennaGroup.add(scape);

    // Flagellum (elbow joint forward and curling down)
    const flagellumGeo = new THREE.CylinderGeometry(0.006, 0.004, 0.22, 6);
    const flagellum = new THREE.Mesh(flagellumGeo, chitinMat);
    flagellum.position.set(0.18, 0.12, side * 0.07);
    flagellum.rotation.set(side * 0.2, -0.4, 0.5);
    antennaGroup.add(flagellum);

    antGroup.add(antennaGroup);
  });

  // 2. Thorax / Mesosoma (Segmented 3-part arch)
  const pronotumGeo = new THREE.SphereGeometry(0.11, 14, 14);
  pronotumGeo.scale(1.0, 0.85, 0.8);
  const pronotum = new THREE.Mesh(pronotumGeo, chitinMat);
  pronotum.position.set(0.16, 0.12, 0);

  const mesonotumGeo = new THREE.SphereGeometry(0.13, 14, 14);
  mesonotumGeo.scale(1.2, 0.95, 0.75);
  const mesonotum = new THREE.Mesh(mesonotumGeo, chitinMat);
  mesonotum.position.set(0.04, 0.13, 0);

  const propodeumGeo = new THREE.SphereGeometry(0.11, 14, 14);
  propodeumGeo.scale(1.0, 0.9, 0.75);
  const propodeum = new THREE.Mesh(propodeumGeo, chitinMat);
  propodeum.position.set(-0.08, 0.11, 0);

  antGroup.add(pronotum, mesonotum, propodeum);

  // 3. Petiole (The Narrow Pinched Waist Node — hallmark of an ant)
  const petioleStemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 8);
  petioleStemGeo.rotateZ(Math.PI / 2);
  const petioleStem = new THREE.Mesh(petioleStemGeo, chitinMat);
  petioleStem.position.set(-0.16, 0.1, 0);

  const petioleNodeGeo = new THREE.SphereGeometry(0.045, 10, 10);
  petioleNodeGeo.scale(0.7, 1.3, 0.8);
  const petioleNode = new THREE.Mesh(petioleNodeGeo, chitinMat);
  petioleNode.position.set(-0.16, 0.14, 0);
  antGroup.add(petioleStem, petioleNode);

  // 4. Gaster / Abdomen (Large segmented bulb tilted slightly downwards)
  const gasterGroup = new THREE.Group();
  gasterGroup.position.set(-0.2, 0.1, 0);

  const gasterBase = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 14), chitinMat);
  gasterBase.position.set(-0.08, 0.02, 0);
  gasterBase.scale.set(1.0, 0.9, 0.85);

  const gasterMain = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), chitinMat);
  gasterMain.position.set(-0.19, 0.02, 0);
  gasterMain.scale.set(1.2, 0.95, 0.9);

  const gasterTip = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.2, 14), chitinMat);
  gasterTip.position.set(-0.35, -0.01, 0);
  gasterTip.rotation.z = Math.PI / 2 + 0.2;

  gasterGroup.add(gasterBase, gasterMain, gasterTip);
  antGroup.add(gasterGroup);

  // 5. Technical Drafting Pen (Mouth/mandibles precision ink stylus)
  const penGroup = new THREE.Group();
  penGroup.position.set(0.44, 0.08, 0);
  penGroup.rotation.z = -Math.PI / 4;

  const penBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.24, 8), penBrassMat);
  penBarrel.position.y = 0.1;
  const penNib = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.08, 8), penBrassMat);
  penNib.rotation.z = Math.PI;
  penNib.position.y = -0.04;
  const penTip = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), penTipMat);
  penTip.position.y = -0.08;

  penGroup.add(penBarrel, penNib, penTip);
  antGroup.add(penGroup);

  // 6. Jointed Biological Legs with realistic insect posture
  // Leg definitions: [coxaX, coxaY, coxaZ, femurAngleZ, tibiaAngleZ, lengthScale]
  const legSpecs = [
    // Front Legs (Prothoracic): angled forward-outward
    { origin: [0.16, 0.07, 0.08], angles: [0.6, 0.5, -0.9], sign: 1, id: 'L1' },
    { origin: [0.16, 0.07, -0.08], angles: [-0.6, 0.5, -0.9], sign: -1, id: 'R1' },
    // Middle Legs (Mesothoracic): arched outward-perpendicular
    { origin: [0.04, 0.07, 0.09], angles: [1.0, 0.1, -1.2], sign: 1, id: 'L2' },
    { origin: [0.04, 0.07, -0.09], angles: [-1.0, 0.1, -1.2], sign: -1, id: 'R2' },
    // Hind Legs (Metathoracic): longest, swept backward
    { origin: [-0.06, 0.07, 0.08], angles: [1.2, -0.5, -1.4], sign: 1, id: 'L3' },
    { origin: [-0.06, 0.07, -0.08], angles: [-1.2, -0.5, -1.4], sign: -1, id: 'R3' },
  ];

  const legMeshes = [];

  legSpecs.forEach((spec) => {
    const legContainer = new THREE.Group();
    legContainer.position.set(...spec.origin);
    legContainer.name = `leg_${spec.id}`;

    // Coxa / Trochanter base
    const coxa = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.014, 0.06, 6), chitinMat);
    coxa.rotation.x = spec.sign * 0.6;
    legContainer.add(coxa);

    // Femur (High inverted V arch upward)
    const femurLen = 0.22;
    const femur = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.011, femurLen, 6), chitinMat);
    femur.position.set(spec.angles[1] * 0.08, 0.1, spec.sign * 0.1);
    femur.rotation.set(spec.sign * 0.8, 0, spec.angles[1] * 0.5);
    legContainer.add(femur);

    // Knee Joint sphere
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), chitinMat);
    knee.position.set(spec.angles[1] * 0.14, 0.2, spec.sign * 0.2);
    legContainer.add(knee);

    // Tibia (Long slender segment angling down to ribbon surface)
    const tibiaLen = 0.26;
    const tibia = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.007, tibiaLen, 6), chitinMat);
    tibia.position.set(spec.angles[1] * 0.17, 0.09, spec.sign * 0.26);
    tibia.rotation.set(spec.sign * -0.4, 0, spec.angles[2] * 0.4);
    legContainer.add(tibia);

    // Tarsus / Foot claw
    const tarsus = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.06, 6), chitinMat);
    tarsus.position.set(spec.angles[1] * 0.19, -0.02, spec.sign * 0.3);
    tarsus.rotation.set(spec.sign * -0.2, 0, 0);
    legContainer.add(tarsus);

    antGroup.add(legContainer);
    legMeshes.push(legContainer);
  });

  // Normal Vector Arrow (clean technical vector extending from ant thorax)
  const arrowDir = new THREE.Vector3(0, 1, 0);
  const arrowOrigin = new THREE.Vector3(0, 0.28, 0);
  const normalArrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 0.75, 0x38bdf8, 0.16, 0.08);
  normalArrow.name = 'normalArrow';
  antGroup.add(normalArrow);

  antGroup.scale.set(0.9, 0.9, 0.9);
  antGroup.userData = { legMeshes };
  return antGroup;
}

/**
 * Creates high-resolution archival paper texture with millimeter grid & dashed centerline
 */
function createCardstockTexture(theme = 'parchment') {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const isParchment = theme === 'parchment';

  // Base background
  ctx.fillStyle = isParchment ? '#f4f0e6' : '#141b2b';
  ctx.fillRect(0, 0, 1024, 128);

  // Subtle paper grain
  ctx.fillStyle = isParchment ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)';
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 128;
    ctx.fillRect(rx, ry, 1.5, 1.5);
  }

  // Edge margin guidelines
  ctx.strokeStyle = isParchment ? 'rgba(100, 116, 139, 0.35)' : 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  if (typeof ctx.strokeRect === 'function') {
    ctx.strokeRect(0, 12, 1024, 104);
  }

  // Millimeter coordinate tick marks
  for (let x = 0; x < 1024; x += 16) {
    const isMajor = x % 64 === 0;
    const tickH = isMajor ? 12 : 6;
    ctx.strokeStyle = isParchment
      ? isMajor
        ? 'rgba(71, 85, 105, 0.5)'
        : 'rgba(148, 163, 184, 0.3)'
      : isMajor
      ? 'rgba(56, 189, 248, 0.5)'
      : 'rgba(56, 189, 248, 0.2)';
    if (typeof ctx.beginPath === 'function') {
      ctx.beginPath();
      ctx.moveTo(x, 12);
      ctx.lineTo(x, 12 + tickH);
      ctx.moveTo(x, 116);
      ctx.lineTo(x, 116 - tickH);
      ctx.stroke();
    }

    if (isMajor && x % 128 === 0 && typeof ctx.fillText === 'function') {
      ctx.fillStyle = isParchment ? '#64748b' : '#38bdf8';
      ctx.font = '9px monospace';
      ctx.fillText(`${x / 16}π`, x + 3, 24);
    }
  }

  // Centerline dashed guide for Ant path
  ctx.strokeStyle = isParchment ? 'rgba(220, 38, 38, 0.3)' : 'rgba(239, 68, 68, 0.3)';
  if (typeof ctx.setLineDash === 'function') {
    ctx.setLineDash([8, 8]);
  }
  ctx.lineWidth = 1.5;
  if (typeof ctx.beginPath === 'function') {
    ctx.beginPath();
    ctx.moveTo(0, 64);
    ctx.lineTo(1024, 64);
    ctx.stroke();
  }
  if (typeof ctx.setLineDash === 'function') {
    ctx.setLineDash([]);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(4, 1);
  return texture;
}

export default function MobiusStrip3DLab() {
  const mountRef = useRef(null);

  // Mode: 'ant' (Traversal & Ink) | 'scissors' (Cutting Paradox) | 'topology' (Manifold Parameters)
  const [activeMode, setActiveMode] = useState('ant');

  // Surface Material Theme: 'parchment' (Archival Cardstock) | 'titanium' (Matte Slate)
  const [surfaceTheme, setSurfaceTheme] = useState('parchment');

  // Mode 1: Ant Traversal State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [traversalU, setTraversalU] = useState(0.0); // 0 to 4*PI
  const [showNormalVector, setShowNormalVector] = useState(true);
  const [cameraFollowAnt, setCameraFollowAnt] = useState(false);

  // Mode 2: Scissors Paradox State
  const [cutType, setCutType] = useState('midline'); // 'midline' | 'offset'
  const [cutProgress, setCutProgress] = useState(0.0);
  const [separationProgress, setSeparationProgress] = useState(0.0);

  // Mode 3: Topology Parameters
  const [halfTwists, setHalfTwists] = useState(1);
  const [ribbonRadius, setRibbonRadius] = useState(3.4);
  const [ribbonWidth, setRibbonWidth] = useState(1.4);
  const [isWireframe, setIsWireframe] = useState(false);
  const [showNormalGrid, setShowNormalGrid] = useState(false);

  // Global settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // Three.js Scene References
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const antMeshRef = useRef(null);
  const stripMeshRef = useRef(null);
  const inkLineMeshRef = useRef(null);
  const cutGroupRef = useRef(null);
  const normalGridGroupRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const circuitMilestoneRef = useRef({ halfCompleted: false, fullCompleted: false });

  // Sync Audio Mute
  useEffect(() => {
    audioEngine.isMuted = !soundEnabled;
  }, [soundEnabled]);

  // Telemetry Calculations
  const telemetry = useMemo(() => {
    const k = activeMode === 'topology' ? halfTwists : 1;
    const R = ribbonRadius;
    const u = traversalU;

    const halfU = (k * u) / 2;
    const nx = Math.sin(halfU) * Math.cos(u);
    const ny = Math.sin(halfU) * Math.sin(u);
    const nz = -Math.cos(halfU);

    const twistAngleDeg = ((u / 2) * (180 / Math.PI)) % 360;
    const arcLengthTraveled = u * R;
    const loopNumber = u < 2 * Math.PI ? 1 : 2;
    const isApparentSideA = loopNumber === 1;

    const isEvenTwist = k % 2 === 0;
    const sidesCount = isEvenTwist ? 2 : 1;
    const boundaryCount = isEvenTwist ? 2 : 1;
    const orientable = isEvenTwist ? 'Orientable' : 'Non-Orientable';

    return {
      nx: nx.toFixed(3),
      ny: ny.toFixed(3),
      nz: nz.toFixed(3),
      twistAngleDeg: twistAngleDeg.toFixed(1),
      arcLengthTraveled: arcLengthTraveled.toFixed(2),
      totalDoubleLength: (4 * Math.PI * R).toFixed(2),
      loopNumber,
      sideName: isApparentSideA ? 'Side A (Apparent Exterior)' : 'Side B (Apparent Interior / Inverted)',
      chirality: loopNumber === 1 ? 'Right-Handed (+)' : 'Left-Handed (-) (Inverted)',
      sidesCount,
      boundaryCount,
      orientable,
      eulerChar: 0,
    };
  }, [traversalU, halfTwists, ribbonRadius, activeMode]);

  // Handle Play/Pause
  const handleTogglePlay = useCallback(() => {
    audioEngine.init();
    setIsPlaying((prev) => !prev);
  }, []);

  // Reset Ant Journey
  const handleResetJourney = useCallback(() => {
    setTraversalU(0.0);
    circuitMilestoneRef.current = { halfCompleted: false, fullCompleted: false };
    if (audioEngine) audioEngine.playStep();
  }, []);

  // Rebuild Möbius Strip Mesh with Photorealistic Studio Textures
  const rebuildStripMesh = useCallback(() => {
    if (!sceneRef.current) return;

    if (stripMeshRef.current) {
      sceneRef.current.remove(stripMeshRef.current);
      stripMeshRef.current.geometry.dispose();
      stripMeshRef.current = null;
    }
    if (cutGroupRef.current) {
      sceneRef.current.remove(cutGroupRef.current);
      cutGroupRef.current = null;
    }
    if (normalGridGroupRef.current) {
      sceneRef.current.remove(normalGridGroupRef.current);
      normalGridGroupRef.current = null;
    }

    const R = ribbonRadius;
    const w = ribbonWidth;
    const k = activeMode === 'topology' ? halfTwists : 1;
    const isParchment = surfaceTheme === 'parchment';
    const cardTexture = createCardstockTexture(surfaceTheme);

    // Mode 2: Scissors Paradox Meshes
    if (activeMode === 'scissors') {
      const group = new THREE.Group();
      const cutAngleLimit = cutProgress * 2 * Math.PI;

      if (cutType === 'midline') {
        const gap = 0.03 + separationProgress * 0.35;
        const unfoldStretch = separationProgress * 1.6;

        // Sub-strip 1: Slate Blue Cardstock
        const geoLeft = buildParametricBandGeometry(R, -w / 2, -gap, k, cutAngleLimit, unfoldStretch, 1);
        const matLeft = new THREE.MeshPhysicalMaterial({
          color: 0x3b82f6,
          roughness: 0.45,
          metalness: 0.1,
          side: THREE.DoubleSide,
          wireframe: isWireframe,
        });
        const meshLeft = new THREE.Mesh(geoLeft, matLeft);

        // Sub-strip 2: Warm Amber Cardstock
        const geoRight = buildParametricBandGeometry(R, gap, w / 2, k, cutAngleLimit, -unfoldStretch, -1);
        const matRight = new THREE.MeshPhysicalMaterial({
          color: 0xf59e0b,
          roughness: 0.45,
          metalness: 0.1,
          side: THREE.DoubleSide,
          wireframe: isWireframe,
        });
        const meshRight = new THREE.Mesh(geoRight, matRight);

        group.add(meshLeft, meshRight);
      } else {
        const gap = 0.04 + separationProgress * 0.4;
        const interlinkOffset = separationProgress * 0.9;

        // Thin loop: Warm Brass / Amber
        const geoThin = buildParametricBandGeometry(R, -w / 2, -w / 6, k, cutAngleLimit, interlinkOffset, 1);
        const matThin = new THREE.MeshPhysicalMaterial({
          color: 0xeab308,
          roughness: 0.4,
          metalness: 0.2,
          side: THREE.DoubleSide,
          wireframe: isWireframe,
        });
        const meshThin = new THREE.Mesh(geoThin, matThin);

        // Thick double loop: Architectural Sage
        const geoThick = buildParametricBandGeometry(R, -w / 6 + gap, w / 2, k, cutAngleLimit, -interlinkOffset, -1);
        const matThick = new THREE.MeshPhysicalMaterial({
          color: 0x10b981,
          roughness: 0.4,
          metalness: 0.2,
          side: THREE.DoubleSide,
          wireframe: isWireframe,
        });
        const meshThick = new THREE.Mesh(geoThick, matThick);

        group.add(meshThin, meshThick);
      }

      cutGroupRef.current = group;
      sceneRef.current.add(group);
      return;
    }

    // Default & Ant & Topology Modes: Studio Cardstock Ribbon
    const uSegments = 160;
    const vSegments = 24;
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= uSegments; i++) {
      const u = (i / uSegments) * 2 * Math.PI;
      const uCoord = i / uSegments;

      for (let j = 0; j <= vSegments; j++) {
        const v = -w / 2 + (j / vSegments) * w;
        const vCoord = j / vSegments;

        const halfU = (k * u) / 2;
        const cosHalfU = Math.cos(halfU);
        const sinHalfU = Math.sin(halfU);
        const cosU = Math.cos(u);
        const sinU = Math.sin(u);

        const x = (R + v * cosHalfU) * cosU;
        const y = (R + v * cosHalfU) * sinU;
        const z = v * sinHalfU;
        positions.push(x, y, z);

        const nx = sinHalfU * cosU;
        const ny = sinHalfU * sinU;
        const nz = -cosHalfU;
        normals.push(nx, ny, nz);

        uvs.push(uCoord, vCoord);
      }
    }

    for (let i = 0; i < uSegments; i++) {
      for (let j = 0; j < vSegments; j++) {
        const a = i * (vSegments + 1) + j;
        const b = (i + 1) * (vSegments + 1) + j;
        const c = (i + 1) * (vSegments + 1) + (j + 1);
        const d = i * (vSegments + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    const material = new THREE.MeshPhysicalMaterial({
      map: cardTexture,
      color: isParchment ? 0xf4f0e6 : 0x1e293b,
      roughness: isParchment ? 0.55 : 0.35,
      metalness: isParchment ? 0.05 : 0.3,
      clearcoat: isParchment ? 0.1 : 0.4,
      clearcoatRoughness: 0.3,
      side: THREE.DoubleSide,
      wireframe: isWireframe,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    stripMeshRef.current = mesh;
    sceneRef.current.add(mesh);

    // Normal Grid Overlay in Topology Mode
    if (activeMode === 'topology' && showNormalGrid) {
      const normalGroup = new THREE.Group();
      const stepU = 10;
      for (let i = 0; i < uSegments; i += stepU) {
        const u = (i / uSegments) * 2 * Math.PI;
        for (let j = 0; j <= vSegments; j += 8) {
          const v = -w / 2 + (j / vSegments) * w;
          const halfU = (k * u) / 2;
          const x = (R + v * Math.cos(halfU)) * Math.cos(u);
          const y = (R + v * Math.cos(halfU)) * Math.sin(u);
          const z = v * Math.sin(halfU);

          const nx = Math.sin(halfU) * Math.cos(u);
          const ny = Math.sin(halfU) * Math.sin(u);
          const nz = -Math.cos(halfU);

          const arrow = new THREE.ArrowHelper(
            new THREE.Vector3(nx, ny, nz).normalize(),
            new THREE.Vector3(x, y, z),
            0.35,
            0x38bdf8,
            0.08,
            0.04
          );
          normalGroup.add(arrow);
        }
      }
      normalGridGroupRef.current = normalGroup;
      sceneRef.current.add(normalGroup);
    }
  }, [
    ribbonRadius,
    ribbonWidth,
    halfTwists,
    activeMode,
    isWireframe,
    showNormalGrid,
    cutType,
    cutProgress,
    separationProgress,
    surfaceTheme,
  ]);

  // Helper: Build parametric band for cut segments
  function buildParametricBandGeometry(R, vMin, vMax, k, cutLimit, offsetZ, dir) {
    const uSegments = 120;
    const vSegments = 8;
    const positions = [];
    const normals = [];
    const indices = [];

    const maxU = Math.min(2 * Math.PI, cutLimit > 0 ? cutLimit : 2 * Math.PI);

    for (let i = 0; i <= uSegments; i++) {
      const u = (i / uSegments) * maxU;
      const halfU = (k * u) / 2;
      const cosHalfU = Math.cos(halfU);
      const sinHalfU = Math.sin(halfU);
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);

      for (let j = 0; j <= vSegments; j++) {
        const v = vMin + (j / vSegments) * (vMax - vMin);
        const x = (R + v * cosHalfU) * cosU;
        const y = (R + v * cosHalfU) * sinU;
        const z = v * sinHalfU + offsetZ * Math.sin(u);

        positions.push(x, y, z);

        const nx = sinHalfU * cosU;
        const ny = sinHalfU * sinU;
        const nz = -cosHalfU;
        normals.push(nx, ny, nz);
      }
    }

    for (let i = 0; i < uSegments; i++) {
      for (let j = 0; j < vSegments; j++) {
        const a = i * (vSegments + 1) + j;
        const b = (i + 1) * (vSegments + 1) + j;
        const c = (i + 1) * (vSegments + 1) + (j + 1);
        const d = i * (vSegments + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setIndex(indices);
    return geo;
  }

  // Build / Update Realistic Red Fountain-Pen Ink Trail
  const updateInkTrailMesh = useCallback(() => {
    if (!sceneRef.current) return;

    if (inkLineMeshRef.current) {
      sceneRef.current.remove(inkLineMeshRef.current);
      inkLineMeshRef.current.geometry.dispose();
      inkLineMeshRef.current = null;
    }

    if (activeMode !== 'ant' || traversalU <= 0.02) return;

    const R = ribbonRadius;
    const k = 1;
    const pointsCount = Math.max(10, Math.floor((traversalU / (4 * Math.PI)) * 360));
    const points = [];

    for (let i = 0; i <= pointsCount; i++) {
      const u = (i / pointsCount) * traversalU;
      const halfU = (k * u) / 2;
      const cosHalfU = Math.cos(halfU);
      const sinHalfU = Math.sin(halfU);
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);

      const nx = sinHalfU * cosU;
      const ny = sinHalfU * sinU;
      const nz = -cosHalfU;

      // Rest ink exactly on paper surface with microscopic offset to eliminate z-fighting
      const elevation = 0.015;
      const x = R * cosU + nx * elevation;
      const y = R * sinU + ny * elevation;
      const z = nz * elevation;

      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, pointsCount, 0.022, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // Deep fountain pen crimson ink
      roughness: 0.2,
      metalness: 0.1,
    });

    const inkMesh = new THREE.Mesh(tubeGeo, tubeMat);
    inkLineMeshRef.current = inkMesh;
    sceneRef.current.add(inkMesh);
  }, [traversalU, ribbonRadius, activeMode]);

  // Position Ant Probe along Surface and animate leg gait
  const updateAntPosition = useCallback(() => {
    if (!antMeshRef.current) return;

    if (activeMode !== 'ant') {
      antMeshRef.current.visible = false;
      return;
    }
    antMeshRef.current.visible = true;

    const R = ribbonRadius;
    const k = 1;
    const u = traversalU;

    const halfU = (k * u) / 2;
    const cosHalfU = Math.cos(halfU);
    const sinHalfU = Math.sin(halfU);
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);

    // Centerline position
    const x = R * cosU;
    const y = R * sinU;
    const z = 0;

    antMeshRef.current.position.set(x, y, z);

    // Tangent along u
    const tu = new THREE.Vector3(-Math.sin(u), Math.cos(u), 0).normalize();

    // Normal n
    const n = new THREE.Vector3(sinHalfU * cosU, sinHalfU * sinU, -cosHalfU).normalize();

    // Binormal tv = n x tu
    const tv = new THREE.Vector3().crossVectors(n, tu).normalize();

    // Orientation Basis: X=tv, Y=n, Z=tu
    const rotMatrix = new THREE.Matrix4();
    rotMatrix.makeBasis(tv, n, tu);
    antMeshRef.current.setRotationFromMatrix(rotMatrix);

    // Alternate Tripod Insect Leg Gait
    const legMeshes = antMeshRef.current.userData?.legMeshes || [];
    if (legMeshes.length === 6) {
      const gaitPhase = u * 12; // Frequency of walking cycle
      const swingL1 = Math.sin(gaitPhase) * 0.12;
      const swingR1 = Math.sin(gaitPhase + Math.PI) * 0.12;

      legMeshes[0].rotation.z = swingL1;
      legMeshes[1].rotation.z = swingR1;
      legMeshes[2].rotation.z = swingR1;
      legMeshes[3].rotation.z = swingL1;
      legMeshes[4].rotation.z = swingL1;
      legMeshes[5].rotation.z = swingR1;
    }

    // Toggle normal vector arrow visibility
    const arrow = antMeshRef.current.getObjectByName('normalArrow');
    if (arrow) {
      arrow.visible = showNormalVector;
    }

    // Camera follow ant
    if (cameraFollowAnt && cameraRef.current && controlsRef.current) {
      const camOffset = n.clone().multiplyScalar(2.6).add(tu.clone().multiplyScalar(-3.2));
      cameraRef.current.position.copy(antMeshRef.current.position).add(camOffset);
      controlsRef.current.target.copy(antMeshRef.current.position);
      controlsRef.current.update();
    }
  }, [traversalU, ribbonRadius, activeMode, showNormalVector, cameraFollowAnt]);

  // Setup Three.js WebGL Scene with Studio Lighting & Pedestal
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, -8.0, 6.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 25;
    controls.minDistance = 2.5;
    controlsRef.current = controls;

    // ── Neutral Photographic Studio Lighting ──
    // Ambient fill (neutral slate, no colored tints)
    const ambientLight = new THREE.AmbientLight(0xf1f5f9, 0.85);
    scene.add(ambientLight);

    // Key Light: Warm studio softbox (3800K)
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.0);
    keyLight.position.set(10, 15, 12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 30;
    scene.add(keyLight);

    // Fill Light: Cool diffused studio fill (5500K)
    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.9);
    fillLight.position.set(-10, 8, -8);
    scene.add(fillLight);

    // Rim / Back Light: Crisp neutral white to carve edge silhouette of half-twist
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 12, -12);
    scene.add(rimLight);

    // Soft upward bounce from lab floor
    const bounceLight = new THREE.DirectionalLight(0x94a3b8, 0.4);
    bounceLight.position.set(0, -10, 0);
    scene.add(bounceLight);

    // ── Studio Measurement Turntable / Ground Pedestal ──
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.y = -2.8;

    // Turntable Disk
    const turntableGeo = new THREE.CylinderGeometry(5.2, 5.4, 0.15, 64);
    const turntableMat = new THREE.MeshStandardMaterial({
      color: 0x0f1422,
      roughness: 0.6,
      metalness: 0.3,
    });
    const turntable = new THREE.Mesh(turntableGeo, turntableMat);
    turntable.receiveShadow = true;
    pedestalGroup.add(turntable);

    // Concentric Metric Calibration Rings on Pedestal
    [1.5, 2.5, 3.5, 4.5].forEach((radius) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.015, radius + 0.015, 64);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x334155,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.08;
      pedestalGroup.add(ring);
    });

    // Soft Contact Shadow Plane directly beneath the ribbon
    const shadowGeo = new THREE.PlaneGeometry(10, 10);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.position.y = 0.085;
    shadowPlane.receiveShadow = true;
    pedestalGroup.add(shadowPlane);

    scene.add(pedestalGroup);

    // Ant Explorer Probe
    const ant = createAuthenticAntMesh();
    antMeshRef.current = ant;
    scene.add(ant);

    // Initial Mesh Build
    rebuildStripMesh();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Rebuild mesh when parameters change
  useEffect(() => {
    rebuildStripMesh();
  }, [rebuildStripMesh]);

  // Update Ink and Ant Position
  useEffect(() => {
    updateAntPosition();
    updateInkTrailMesh();
  }, [updateAntPosition, updateInkTrailMesh]);

  // Animation Loop
  useEffect(() => {
    const animate = (time) => {
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.autoRotateSpeed = 1.0;
        controlsRef.current.update();
      }

      // Mode 1: Ant Walking Logic
      if (activeMode === 'ant' && isPlaying) {
        setTraversalU((prevU) => {
          const step = delta * playbackSpeed * 0.75;
          let nextU = prevU + step;

          audioEngine.playStep();

          // Milestone 1: Reaching 2*PI (50% progress, upside down on Side B)
          if (prevU < 2 * Math.PI && nextU >= 2 * Math.PI) {
            if (!circuitMilestoneRef.current.halfCompleted) {
              audioEngine.playChime(440, 0.3);
              circuitMilestoneRef.current.halfCompleted = true;
            }
          }

          // Milestone 2: Reaching 4*PI (100% progress, full return to Side A)
          if (nextU >= 4 * Math.PI) {
            nextU = 4 * Math.PI;
            setIsPlaying(false);
            if (!circuitMilestoneRef.current.fullCompleted) {
              audioEngine.playChime(880, 0.45);
              circuitMilestoneRef.current.fullCompleted = true;
            }
          }

          return nextU;
        });
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeMode, isPlaying, playbackSpeed, autoRotate]);

  return (
    <div className={styles.labContainer} data-testid="mobius-strip-3d-lab">
      {/* ── Mode Selection Navigation Bar ── */}
      <div className={styles.modeBar}>
        <button
          className={`${styles.modeTab} ${activeMode === 'ant' ? styles.modeTabActive : ''}`}
          onClick={() => {
            setActiveMode('ant');
            audioEngine.init();
          }}
        >
          <Icon name="compass" size={15} />
          <span>The Ant&apos;s 720° Journey</span>
        </button>

        <button
          className={`${styles.modeTab} ${activeMode === 'scissors' ? styles.modeTabActive : ''}`}
          onClick={() => {
            setActiveMode('scissors');
            audioEngine.init();
            audioEngine.playSnip();
          }}
        >
          <Icon name="scissors" size={15} />
          <span>The Scissors Paradox</span>
        </button>

        <button
          className={`${styles.modeTab} ${activeMode === 'topology' ? styles.modeTabActive : ''}`}
          onClick={() => {
            setActiveMode('topology');
            audioEngine.init();
          }}
        >
          <Icon name="sliders" size={15} />
          <span>Topological Manifold Sandbox</span>
        </button>

        {/* Surface Material Theme Toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          <button
            className={`${styles.pillBtn} ${surfaceTheme === 'parchment' ? styles.pillBtnActive : ''}`}
            onClick={() => setSurfaceTheme('parchment')}
            title="Archival Cardstock Paper"
          >
            Parchment
          </button>
          <button
            className={`${styles.pillBtn} ${surfaceTheme === 'titanium' ? styles.pillBtnActive : ''}`}
            onClick={() => setSurfaceTheme('titanium')}
            title="Matte Titanium Slate"
          >
            Titanium
          </button>
        </div>
      </div>

      {/* ── Main 3D Canvas Viewport ── */}
      <div className={styles.canvasContainer}>
        {/* Top Header Floating Overlay */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="zap" size={12} />
              <span>Listing &amp; Möbius (1858) · Non-Orientable Manifold</span>
            </div>
            <h2 className={styles.headerTitle}>Möbius Strip Interactive Laboratory</h2>
            <p className={styles.headerSubtitle}>
              Empirical 3D simulation of one-sided topology, normal vector inversion, and cutting paradoxes.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={`${styles.actionBtn} ${soundEnabled ? styles.actionBtnActive : ''}`}
              onClick={() => {
                audioEngine.init();
                setSoundEnabled((prev) => !prev);
              }}
              title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            >
              <Icon name={soundEnabled ? 'volume-2' : 'volume-x'} size={16} />
            </button>

            <button
              className={`${styles.actionBtn} ${autoRotate ? styles.actionBtnActive : ''}`}
              onClick={() => setAutoRotate((prev) => !prev)}
              title="Auto-Rotate Camera"
            >
              <Icon name="refresh-cw" size={16} />
            </button>

            <button
              className={`${styles.actionBtn} ${guideOpen ? styles.actionBtnActive : ''}`}
              onClick={() => setGuideOpen((prev) => !prev)}
              title="Interactive Lab Guide"
            >
              <Icon name="help-circle" size={16} />
            </button>
          </div>
        </div>

        {/* Floating Telemetry Box */}
        <div className={styles.floatingTelemetry}>
          <div className={styles.telemetryCard}>
            <div className={styles.telemetryRow}>
              <span className={styles.telemetryLabel}>Traversal Arc Length</span>
              <span className={`${styles.telemetryValue} ${styles.telemetryValueCyan}`}>
                {telemetry.arcLengthTraveled} / {telemetry.totalDoubleLength} m
              </span>
            </div>

            <div className={styles.telemetryRow}>
              <span className={styles.telemetryLabel}>Normal Vector (n̂)</span>
              <span className={styles.telemetryValue}>
                ({telemetry.nx}, {telemetry.ny}, {telemetry.nz})
              </span>
            </div>

            <div className={styles.telemetryRow}>
              <span className={styles.telemetryLabel}>Twist Angle (u/2)</span>
              <span className={`${styles.telemetryValue} ${styles.telemetryValueAmber}`}>
                {telemetry.twistAngleDeg}°
              </span>
            </div>

            <div className={styles.telemetryRow}>
              <span className={styles.telemetryLabel}>Loop Circuit</span>
              <span className={styles.telemetryValue}>
                Loop {telemetry.loopNumber} of 2 ({((traversalU / (4 * Math.PI)) * 100).toFixed(0)}%)
              </span>
            </div>

            <div className={styles.statusIndicator}>
              <div
                className={`${styles.statusDot} ${
                  telemetry.loopNumber === 1 ? styles.statusDotCyan : styles.statusDotCrimson
                }`}
              />
              <span>{telemetry.sideName}</span>
            </div>

            <div className={styles.statusIndicator}>
              <div className={`${styles.statusDot} ${styles.statusDotEmerald}`} />
              <span>Chirality: {telemetry.chirality}</span>
            </div>
          </div>
        </div>

        {/* Floating Gizmo Hint */}
        <div className={styles.gizmoHint}>
          <Icon name="compass" size={12} />
          <span>Left-Drag: Orbit · Right-Drag: Pan · Scroll: Zoom</span>
        </div>

        {/* Three.js Canvas Mount */}
        <div ref={mountRef} className={styles.canvasWrapper} />
      </div>

      {/* ── Context-Sensitive Bottom Controls ── */}
      <div className={styles.controlsPanel}>
        {/* Mode 1: Ant 720° Traversal Controls */}
        {activeMode === 'ant' && (
          <>
            <div className={styles.primaryControlRow}>
              <div className={styles.playbackButtonGroup}>
                <button className={styles.playBtn} onClick={handleTogglePlay}>
                  <Icon name={isPlaying ? 'pause' : 'play'} size={15} />
                  <span>{isPlaying ? 'Pause Crawl' : 'Start Ant Crawl'}</span>
                </button>

                <button className={styles.secondaryBtn} onClick={handleResetJourney}>
                  <Icon name="rotate-ccw" size={14} />
                  <span>Reset Origin</span>
                </button>

                <button
                  className={`${styles.secondaryBtn} ${showNormalVector ? styles.actionBtnActive : ''}`}
                  onClick={() => setShowNormalVector((prev) => !prev)}
                >
                  <Icon name="compass" size={14} />
                  <span>{showNormalVector ? 'Hide Normal Vector' : 'Show Normal Vector'}</span>
                </button>

                <button
                  className={`${styles.secondaryBtn} ${cameraFollowAnt ? styles.actionBtnActive : ''}`}
                  onClick={() => setCameraFollowAnt((prev) => !prev)}
                >
                  <Icon name="eye" size={14} />
                  <span>{cameraFollowAnt ? 'Follow Cam: Active' : 'Follow Ant'}</span>
                </button>
              </div>

              {/* Scrubber Slider */}
              <div className={styles.timelineScrubber}>
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineLabel}>Manual Circuit Scrubber (0° to 720°)</span>
                  <span className={styles.timelineValue}>{((traversalU / (4 * Math.PI)) * 720).toFixed(0)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={4 * Math.PI}
                  step="0.02"
                  value={traversalU}
                  onChange={(e) => {
                    setTraversalU(parseFloat(e.target.value));
                    audioEngine.init();
                  }}
                  className={styles.sliderTrack}
                />
              </div>
            </div>

            <div className={styles.paradoxBanner}>
              <div className={styles.paradoxIcon}>
                <Icon name="info" size={18} />
              </div>
              <div>
                <div className={styles.paradoxHeading}>The 720° Topological Return Paradox</div>
                After crawling one complete spatial circle ($2\pi R$), the ant returns to its starting coordinate $(x,
                y)$, but its normal vector has rotated by exactly $180^\circ$—placing it upside down on what intuition
                calls the &ldquo;other side&rdquo;. It must crawl a second full circuit ($4\pi R$, $720^\circ$) to
                return right-side up! The red ink trail coats the entire ribbon without ever crossing an edge.
              </div>
            </div>
          </>
        )}

        {/* Mode 2: Scissors Paradox Controls */}
        {activeMode === 'scissors' && (
          <>
            <div className={styles.primaryControlRow}>
              <div className={styles.pillGroup}>
                <button
                  className={`${styles.pillBtn} ${cutType === 'midline' ? styles.pillBtnActive : ''}`}
                  onClick={() => {
                    setCutType('midline');
                    setCutProgress(1.0);
                    audioEngine.playSnip();
                  }}
                >
                  Midline Cut (Center 1/2)
                </button>
                <button
                  className={`${styles.pillBtn} ${cutType === 'offset' ? styles.pillBtnActive : ''}`}
                  onClick={() => {
                    setCutType('offset');
                    setCutProgress(1.0);
                    audioEngine.playSnip();
                  }}
                >
                  One-Third Offset Cut (1/3 Edge)
                </button>
              </div>

              <div className={styles.timelineScrubber}>
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineLabel}>Scissors Cut Completion</span>
                  <span className={styles.timelineValue}>{(cutProgress * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={cutProgress}
                  onChange={(e) => {
                    setCutProgress(parseFloat(e.target.value));
                    audioEngine.playSnip();
                  }}
                  className={styles.sliderTrack}
                />
              </div>

              <div className={styles.timelineScrubber}>
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineLabel}>Unfold / Separation Displacement</span>
                  <span className={styles.timelineValue}>{(separationProgress * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.02"
                  value={separationProgress}
                  onChange={(e) => setSeparationProgress(parseFloat(e.target.value))}
                  className={styles.sliderTrack}
                />
              </div>
            </div>

            <div className={styles.paradoxBanner}>
              <div className={styles.paradoxIcon}>
                <Icon name="scissors" size={18} />
              </div>
              <div>
                <div className={styles.paradoxHeading}>
                  {cutType === 'midline'
                    ? 'Center Cut Result: ONE Single Double-Length Ribbon (4 Half-Twists)'
                    : '1/3 Cut Result: TWO Interlocked Rings (1 Möbius + 1 Double-Length Loop)'}
                </div>
                {cutType === 'midline' ? (
                  <span>
                    Cutting down the midline of a cylinder produces 2 loops. But cutting down the centerline of a
                    Möbius strip does <strong>NOT</strong> divide it into two! Because the cut travels along a $4\pi$
                    trajectory, it produces <strong>one single continuous loop</strong> of double length ($2L$), half
                    width, with <strong>four half-twists ($720^\circ$)</strong>.
                  </span>
                ) : (
                  <span>
                    Cutting at a 1/3 offset produces <strong>two physically interlinked rings</strong>: one thin Möbius
                    strip of length $L$ linked through a longer two-sided ribbon of length $2L$, forming a topological
                    chain link!
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Mode 3: Topological Parameters Grid */}
        {activeMode === 'topology' && (
          <>
            <div className={styles.parameterGrid}>
              <div className={styles.paramCard}>
                <div className={styles.paramHeader}>
                  <span className={styles.paramTitle}>Half-Twists ($k$)</span>
                  <span className={styles.paramVal}>
                    {halfTwists} ({halfTwists % 2 === 1 ? 'Möbius / Non-Orientable' : 'Cylinder / Orientable'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={halfTwists}
                  onChange={(e) => {
                    setHalfTwists(parseInt(e.target.value, 10));
                    audioEngine.init();
                  }}
                  className={styles.sliderTrack}
                />
              </div>

              <div className={styles.paramCard}>
                <div className={styles.paramHeader}>
                  <span className={styles.paramTitle}>Major Radius ($R$)</span>
                  <span className={styles.paramVal}>{ribbonRadius.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="5.0"
                  step="0.2"
                  value={ribbonRadius}
                  onChange={(e) => setRibbonRadius(parseFloat(e.target.value))}
                  className={styles.sliderTrack}
                />
              </div>

              <div className={styles.paramCard}>
                <div className={styles.paramHeader}>
                  <span className={styles.paramTitle}>Ribbon Width ($w$)</span>
                  <span className={styles.paramVal}>{ribbonWidth.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="2.4"
                  step="0.1"
                  value={ribbonWidth}
                  onChange={(e) => setRibbonWidth(parseFloat(e.target.value))}
                  className={styles.sliderTrack}
                />
              </div>

              <div className={styles.paramCard}>
                <div className={styles.paramHeader}>
                  <span className={styles.paramTitle}>Display Options</span>
                  <span className={styles.paramVal}>Visual Shaders</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    className={`${styles.pillBtn} ${isWireframe ? styles.pillBtnActive : ''}`}
                    onClick={() => setIsWireframe((prev) => !prev)}
                  >
                    Wireframe
                  </button>
                  <button
                    className={`${styles.pillBtn} ${showNormalGrid ? styles.pillBtnActive : ''}`}
                    onClick={() => setShowNormalGrid((prev) => !prev)}
                  >
                    Normal Grid
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.paradoxBanner}>
              <div className={styles.paradoxIcon}>
                <Icon name="database" size={18} />
              </div>
              <div>
                <div className={styles.paradoxHeading}>Topological Invariants: &chi; = 0</div>
                For any half-twist integer $k$, the Euler characteristic is $\chi = V - E + F = 0$. When $k$ is odd (1,
                3), the manifold has strictly <strong>1 boundary component</strong> and <strong>1 side</strong>. When{' '}
                $k$ is even (0, 2, 4), the manifold is orientable with <strong>2 boundaries</strong> and{' '}
                <strong>2 sides</strong>.
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Guided HUD Walkthrough ── */}
      <VisualizationGuideHUD
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Möbius Strip Laboratory Guide"
        steps={[
          {
            title: '1. The Ant & The Ink Trail',
            desc: 'Start the Ant Crawl in Mode 1. Observe how the red ink stylus coats both the "outside" and "inside" continuously. After 360° of spatial rotation, the ant is upside down with normal vector flipped.',
          },
          {
            title: '2. The 720° Full Return',
            desc: 'The ant must complete two full circuits (720°, 4πR) to return right-side up. This proves non-orientability: you cannot define a global outward normal vector on the surface.',
          },
          {
            title: '3. The Scissors Midline Cut',
            desc: 'Switch to Mode 2 and trigger the Midline Cut. Drag the Unfold Slider. Unlike a cylinder which cuts into 2 loops, a Möbius strip cuts into ONE single double-length ribbon with 4 half-twists!',
          },
          {
            title: '4. The 1/3 Offset Cut Paradox',
            desc: 'Try the 1/3 Offset Cut. The cut produces two physically interlinked loops: one thin Möbius loop linked through a longer 2-sided ribbon like chain links.',
          },
        ]}
      />
    </div>
  );
}
