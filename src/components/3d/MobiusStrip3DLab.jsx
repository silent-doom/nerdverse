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
    if (nowMs - this.lastPlay < 80) return;
    this.lastPlay = nowMs;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.03);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
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

      gain.gain.setValueAtTime(0.2, now);
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
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio fallback
    }
  }
}

const audioEngine = new MobiusAudioEngine();

/**
 * Procedural Ant Probe Builder (Robotic explorer with sensor eye and ink tip)
 */
function createAntProbeMesh() {
  const antGroup = new THREE.Group();

  // Materials
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.2,
  });

  const sensorMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.5,
  });

  const stylusMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.1,
  });

  // Thorax
  const thoraxGeo = new THREE.SphereGeometry(0.18, 16, 16);
  thoraxGeo.scale(1.2, 0.8, 0.9);
  const thorax = new THREE.Mesh(thoraxGeo, chassisMat);
  thorax.position.y = 0.16;
  antGroup.add(thorax);

  // Head
  const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const head = new THREE.Mesh(headGeo, chassisMat);
  head.position.set(0.24, 0.18, 0);
  antGroup.add(head);

  // Cyan Eye Sensor
  const eyeGeo = new THREE.SphereGeometry(0.04, 12, 12);
  const eyeR = new THREE.Mesh(eyeGeo, sensorMat);
  eyeR.position.set(0.33, 0.21, 0.05);
  const eyeL = new THREE.Mesh(eyeGeo, sensorMat);
  eyeL.position.set(0.33, 0.21, -0.05);
  antGroup.add(eyeR, eyeL);

  // Abdomen
  const abdomenGeo = new THREE.SphereGeometry(0.22, 16, 16);
  abdomenGeo.scale(1.4, 0.9, 0.9);
  const abdomen = new THREE.Mesh(abdomenGeo, chassisMat);
  abdomen.position.set(-0.28, 0.2, 0);
  antGroup.add(abdomen);

  // Ink Stylus Tip pointing down toward surface
  const stylusGeo = new THREE.ConeGeometry(0.03, 0.14, 8);
  stylusGeo.rotateZ(Math.PI);
  const stylus = new THREE.Mesh(stylusGeo, stylusMat);
  stylus.position.set(0, 0.06, 0);
  antGroup.add(stylus);

  // 6 Articulated Legs
  const legPositions = [
    [0.1, 0.14, 0.22],
    [0.0, 0.14, 0.25],
    [-0.1, 0.14, 0.22],
    [0.1, 0.14, -0.22],
    [0.0, 0.14, -0.25],
    [-0.1, 0.14, -0.22],
  ];

  legPositions.forEach(([lx, ly, lz]) => {
    const legGeo = new THREE.CylinderGeometry(0.015, 0.012, 0.22, 6);
    const leg = new THREE.Mesh(legGeo, chassisMat);
    leg.position.set(lx, ly * 0.6, lz * 0.7);
    leg.rotation.x = lz > 0 ? 0.7 : -0.7;
    leg.rotation.z = lx > 0 ? -0.2 : 0.2;
    antGroup.add(leg);
  });

  // Normal Vector Arrow
  const arrowDir = new THREE.Vector3(0, 1, 0);
  const arrowOrigin = new THREE.Vector3(0, 0.35, 0);
  const normalArrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 0.65, 0x38bdf8, 0.18, 0.1);
  normalArrow.name = 'normalArrow';
  antGroup.add(normalArrow);

  antGroup.scale.set(0.85, 0.85, 0.85);
  return antGroup;
}

export default function MobiusStrip3DLab() {
  const mountRef = useRef(null);

  // Mode: 'ant' (Traversal & Ink) | 'scissors' (Cutting Paradox) | 'topology' (Manifold Parameters)
  const [activeMode, setActiveMode] = useState('ant');

  // Mode 1: Ant Traversal State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [traversalU, setTraversalU] = useState(0.0); // 0 to 4*PI (two full circuits)
  const [showNormalVector, setShowNormalVector] = useState(true);
  const [cameraFollowAnt, setCameraFollowAnt] = useState(false);

  // Mode 2: Scissors Paradox State
  const [cutType, setCutType] = useState('midline'); // 'midline' (1/2) | 'offset' (1/3)
  const [cutProgress, setCutProgress] = useState(0.0); // 0.0 to 1.0 cut circuit
  const [separationProgress, setSeparationProgress] = useState(0.0); // 0.0 to 1.0 unfold/separate

  // Mode 3: Topology Parameters
  const [halfTwists, setHalfTwists] = useState(1); // 0=cylinder, 1=mobius, 2=full twist, 3=trefoil
  const [ribbonRadius, setRibbonRadius] = useState(3.4);
  const [ribbonWidth, setRibbonWidth] = useState(1.4);
  const [isWireframe, setIsWireframe] = useState(false);
  const [showNormalGrid, setShowNormalGrid] = useState(false);

  // Global settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // Three.js References
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

  // Compute Telemetry Values based on traversalU
  const telemetry = useMemo(() => {
    const k = activeMode === 'topology' ? halfTwists : 1;
    const R = ribbonRadius;
    const w = ribbonWidth;
    const u = traversalU;

    // Normal calculation at centerline v=0
    // r(u, 0) = (R cos u, R sin u, 0)
    // tu = (-R sin u, R cos u, 0)
    // tv = (cos(ku/2) cos u, cos(ku/2) sin u, sin(ku/2))
    // tu x tv = (R sin(ku/2) cos u, R sin(ku/2) sin u, -R cos(ku/2))
    // Normalized n = (sin(ku/2) cos u, sin(ku/2) sin u, -cos(ku/2))
    const halfU = (k * u) / 2;
    const nx = Math.sin(halfU) * Math.cos(u);
    const ny = Math.sin(halfU) * Math.sin(u);
    const nz = -Math.cos(halfU);

    // Cumulative orientation angle
    const twistAngleDeg = ((u / 2) * (180 / Math.PI)) % 360;

    // Distance traveled (approximate 2*pi*R per loop)
    const arcLengthTraveled = u * R;
    const totalCircumference = 2 * Math.PI * R;
    const loopNumber = u < 2 * Math.PI ? 1 : 2;
    const isApparentSideA = loopNumber === 1;

    // Topological Invariants
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
      eulerChar: 0, // chi = 0
    };
  }, [traversalU, halfTwists, ribbonRadius, ribbonWidth, activeMode]);

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

  // Update Three.js Surface Geometry
  const rebuildStripMesh = useCallback(() => {
    if (!sceneRef.current) return;

    // Remove existing meshes
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

    // Mode 2: Scissors Paradox Meshes
    if (activeMode === 'scissors') {
      const group = new THREE.Group();
      const cutAngleLimit = cutProgress * 2 * Math.PI;

      if (cutType === 'midline') {
        // Midline Cut: Splitting v into [-w/2, -gap] and [gap, w/2]
        const gap = 0.03 + separationProgress * 0.35;
        const unfoldStretch = separationProgress * 1.5;

        // Sub-strip 1: left half
        const geoLeft = buildParametricBandGeometry(R, -w / 2, -gap, k, cutAngleLimit, unfoldStretch, 1);
        const matLeft = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          metalness: 0.6,
          roughness: 0.3,
          side: THREE.DoubleSide,
          wireframe: isWireframe,
        });
        const meshLeft = new THREE.Mesh(geoLeft, matLeft);

        // Sub-strip 2: right half
        const geoRight = buildParametricBandGeometry(R, gap, w / 2, k, cutAngleLimit, -unfoldStretch, -1);
        const matRight = new THREE.MeshStandardMaterial({
          color: 0xec4899,
          metalness: 0.6,
          roughness: 0.3,
          side: THREE.DoubleSide,
          wireframe: isWireframe,
        });
        const meshRight = new THREE.Mesh(geoRight, matRight);

        group.add(meshLeft, meshRight);
      } else {
        // 1/3 Offset Cut: One strip width [ -w/2, -w/6 ], other [ -w/6 + gap, w/2 ]
        const gap = 0.04 + separationProgress * 0.4;
        const interlinkOffset = separationProgress * 0.8;

        const geoThin = buildParametricBandGeometry(R, -w / 2, -w / 6, k, cutAngleLimit, interlinkOffset, 1);
        const matThin = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.7,
          roughness: 0.25,
          side: THREE.DoubleSide,
          wireframe: isWireframe,
        });
        const meshThin = new THREE.Mesh(geoThin, matThin);

        const geoThick = buildParametricBandGeometry(R, -w / 6 + gap, w / 2, k, cutAngleLimit, -interlinkOffset, -1);
        const matThick = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          metalness: 0.7,
          roughness: 0.25,
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

    // Default & Ant & Topology Modes: Canonical Single Surface
    const uSegments = 140;
    const vSegments = 20;
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];

    const colorOuter = new THREE.Color(0x38bdf8); // Cyan
    const colorInner = new THREE.Color(0x818cf8); // Indigo/Purple

    for (let i = 0; i <= uSegments; i++) {
      const u = (i / uSegments) * 2 * Math.PI;
      for (let j = 0; j <= vSegments; j++) {
        const v = -w / 2 + (j / vSegments) * w;

        const halfU = (k * u) / 2;
        const cosHalfU = Math.cos(halfU);
        const sinHalfU = Math.sin(halfU);
        const cosU = Math.cos(u);
        const sinU = Math.sin(u);

        const x = (R + v * cosHalfU) * cosU;
        const y = (R + v * cosHalfU) * sinU;
        const z = v * sinHalfU;
        positions.push(x, y, z);

        // Exact normal vector
        const nx = sinHalfU * cosU;
        const ny = sinHalfU * sinU;
        const nz = -cosHalfU;
        normals.push(nx, ny, nz);

        // Subtle gradient coloring along twist
        const t = (Math.sin(halfU) + 1) / 2;
        const vertexColor = colorOuter.clone().lerp(colorInner, t);
        colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
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
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.55,
      roughness: 0.35,
      side: THREE.DoubleSide,
      wireframe: isWireframe,
    });

    const mesh = new THREE.Mesh(geometry, material);
    stripMeshRef.current = mesh;
    sceneRef.current.add(mesh);

    // Normal Grid Overlay in Topology Mode
    if (activeMode === 'topology' && showNormalGrid) {
      const normalGroup = new THREE.Group();
      const stepU = 10;
      for (let i = 0; i < uSegments; i += stepU) {
        const u = (i / uSegments) * 2 * Math.PI;
        for (let j = 0; j <= vSegments; j += 10) {
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
            0.1,
            0.05
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

  // Build / Update Glowing Red Ink Trail
  const updateInkTrailMesh = useCallback(() => {
    if (!sceneRef.current) return;

    if (inkLineMeshRef.current) {
      sceneRef.current.remove(inkLineMeshRef.current);
      inkLineMeshRef.current.geometry.dispose();
      inkLineMeshRef.current = null;
    }

    if (activeMode !== 'ant' || traversalU <= 0.02) return;

    const R = ribbonRadius;
    const k = 1; // Canonical Möbius
    const pointsCount = Math.max(10, Math.floor((traversalU / (4 * Math.PI)) * 320));
    const points = [];

    for (let i = 0; i <= pointsCount; i++) {
      const u = (i / pointsCount) * traversalU;
      const halfU = (k * u) / 2;
      const cosHalfU = Math.cos(halfU);
      const sinHalfU = Math.sin(halfU);
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);

      // Normal vector to elevate ink slightly off surface
      const nx = sinHalfU * cosU;
      const ny = sinHalfU * sinU;
      const nz = -cosHalfU;

      const elevation = 0.025;
      const x = R * cosU + nx * elevation;
      const y = R * sinU + ny * elevation;
      const z = nz * elevation;

      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, pointsCount, 0.025, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0xef4444, // Glowing Red Ink
    });

    const inkMesh = new THREE.Mesh(tubeGeo, tubeMat);
    inkLineMeshRef.current = inkMesh;
    sceneRef.current.add(inkMesh);
  }, [traversalU, ribbonRadius, activeMode]);

  // Position Ant Probe along Surface
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

    // Position at centerline v=0
    const x = R * cosU;
    const y = R * sinU;
    const z = 0;

    antMeshRef.current.position.set(x, y, z);

    // Tangent along u: tu = (-R sin u, R cos u, 0)
    const tu = new THREE.Vector3(-Math.sin(u), Math.cos(u), 0).normalize();

    // Normal n = (sin(u/2) cos u, sin(u/2) sin u, -cos(u/2))
    const n = new THREE.Vector3(sinHalfU * cosU, sinHalfU * sinU, -cosHalfU).normalize();

    // Binormal tv = n x tu
    const tv = new THREE.Vector3().crossVectors(n, tu).normalize();

    // Orientation Matrix: X=tv, Y=n, Z=tu
    const rotMatrix = new THREE.Matrix4();
    rotMatrix.makeBasis(tv, n, tu);
    antMeshRef.current.setRotationFromMatrix(rotMatrix);

    // Toggle normal vector arrow visibility
    const arrow = antMeshRef.current.getObjectByName('normalArrow');
    if (arrow) {
      arrow.visible = showNormalVector;
    }

    // Camera follow ant
    if (cameraFollowAnt && cameraRef.current && controlsRef.current) {
      const camOffset = n.clone().multiplyScalar(2.5).add(tu.clone().multiplyScalar(-3.0));
      cameraRef.current.position.copy(antMeshRef.current.position).add(camOffset);
      controlsRef.current.target.copy(antMeshRef.current.position);
      controlsRef.current.update();
    }
  }, [traversalU, ribbonRadius, activeMode, showNormalVector, cameraFollowAnt]);

  // Setup Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, -7.5, 6.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 25;
    controls.minDistance = 2.5;
    controlsRef.current = controls;

    // Ambient and Directional Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight1.position.set(8, 12, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xec4899, 1.0);
    dirLight2.position.set(-8, -10, -8);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.8, 15);
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);

    // Subtle Celestial Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const starPos = [];
    for (let i = 0; i < starCount; i++) {
      starPos.push((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x475569, size: 0.08 });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // Ant Explorer Probe
    const ant = createAntProbeMesh();
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
        controlsRef.current.autoRotateSpeed = 1.2;
        controlsRef.current.update();
      }

      // Mode 1: Ant Walking Logic
      if (activeMode === 'ant' && isPlaying) {
        setTraversalU((prevU) => {
          const step = delta * playbackSpeed * 0.8;
          let nextU = prevU + step;

          // Sound trigger for steps
          audioEngine.playStep();

          // Milestone 1: Reaching 2*PI (50% progress, upside down on Side B)
          if (prevU < 2 * Math.PI && nextU >= 2 * Math.PI) {
            if (!circuitMilestoneRef.current.halfCompleted) {
              audioEngine.playChime(440, 0.3); // Chime for inverted arrival
              circuitMilestoneRef.current.halfCompleted = true;
            }
          }

          // Milestone 2: Reaching 4*PI (100% progress, full return to Side A)
          if (nextU >= 4 * Math.PI) {
            nextU = 4 * Math.PI;
            setIsPlaying(false);
            if (!circuitMilestoneRef.current.fullCompleted) {
              audioEngine.playChime(880, 0.45); // High triumph chime
              circuitMilestoneRef.current.fullCompleted = true;
            }
          }

          return nextU;
        });
      }

      // Render Scene
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
            <p className={styles.subtitle || styles.headerSubtitle}>
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
