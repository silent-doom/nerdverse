'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import Icon from '@/components/common/Icon';
import styles from './PhysicsSimulation3D.module.css';

/**
 * High-Clarity Canvas Textures for Toast
 */
function createButterTopTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich melted golden butter gradient
  const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 250);
  grad.addColorStop(0, '#fef08a'); // Warm molten yellow center
  grad.addColorStop(0.4, '#f59e0b'); // Golden butter
  grad.addColorStop(0.85, '#d97706'); // Deep amber melted edge
  grad.addColorStop(1.0, '#b45309'); // Caramelized butter rim

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Melted butter gloss swirls
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(230, 220, 140, 0.2, 1.8);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(270, 270, 90, 2.2, 3.8);
  ctx.stroke();

  // Fine butter droplets
  ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
  for (let i = 0; i < 28; i++) {
    const rx = 60 + Math.random() * 392;
    const ry = 60 + Math.random() * 392;
    const rr = 4 + Math.random() * 10;
    ctx.beginPath();
    ctx.arc(rx, ry, rr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Clear pedagogical insignia stamp
  ctx.fillStyle = '#78350f';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🧈 BUTTERED SURFACE', 256, 230);

  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('• TOP LAYER (+Y) •', 256, 275);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

function createBreadCrumbTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Toasted bread grain
  ctx.fillStyle = '#dfaa75';
  ctx.fillRect(0, 0, 512, 512);

  // Porous bread crumb speckles
  for (let i = 0; i < 400; i++) {
    const bx = Math.random() * 512;
    const by = Math.random() * 512;
    const br = 2 + Math.random() * 6;
    ctx.fillStyle = Math.random() > 0.5 ? '#cb8e56' : '#ebd1b0';
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // Toasted diagonal grill stripes
  ctx.strokeStyle = 'rgba(120, 53, 15, 0.22)';
  ctx.lineWidth = 22;
  for (let d = -200; d < 800; d += 80) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + 300, 512);
    ctx.stroke();
  }

  // Pedagogical label on dry bottom
  ctx.fillStyle = '#5c2c16';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍞 DRY TOAST CRUMB', 256, 230);

  ctx.fillStyle = '#78350f';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('• BOTTOM BASE (-Y) •', 256, 275);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Calibrated Scientific Height Scale Texture (NEVER Stretches)
 * Uses fixed pixels-per-meter so centimeter ticks retain razor-sharp physical spacing
 */
function createHeightRulerTexture(heightVal) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  const pxPerMeter = 500;
  canvas.width = 160;
  canvas.height = Math.max(256, Math.round(heightVal * pxPerMeter));
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#141722';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Brass border
  ctx.strokeStyle = '#e5a93c';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

  const totalCm = Math.round(heightVal * 100);
  for (let cm = 0; cm <= totalCm; cm += 2) {
    const y = canvas.height - (cm / 100) * pxPerMeter;
    const isHalfMeter = cm % 50 === 0;
    const isDeciMeter = cm % 10 === 0;

    ctx.lineWidth = isHalfMeter ? 4 : isDeciMeter ? 2.5 : 1.5;
    ctx.strokeStyle = isHalfMeter ? '#e5a93c' : isDeciMeter ? '#fef08a' : 'rgba(254, 240, 138, 0.6)';
    ctx.beginPath();
    ctx.moveTo(8, y);
    ctx.lineTo(isHalfMeter ? 52 : isDeciMeter ? 38 : 22, y);
    ctx.stroke();

    if (isDeciMeter && y > 24 && y < canvas.height - 12) {
      ctx.font = isHalfMeter ? 'bold 15px monospace' : '12px monospace';
      ctx.fillStyle = isHalfMeter ? '#e5a93c' : '#d1d5db';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${(cm / 100).toFixed(1)}m`, isHalfMeter ? 58 : 44, y);
    }
  }

  // Active top elevation readout
  ctx.fillStyle = '#e5a93c';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`▲ H = ${heightVal.toFixed(2)}m`, canvas.width / 2, 22);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * High-Fidelity 3D Physics Laboratory for Murphy's Law: The Tumbling Buttered Toast.
 * Based on Robert Matthews' 1995 Royal Astronomical Society paper:
 * "Tumbling toast, Murphy's Law and the fundamental constants".
 */
export default function MurphysLaw3DPhysics() {
  const mountRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Simulation Parameters
  const [tableHeight, setTableHeight] = useState(0.75); // meters
  const [initialOverhang, setInitialOverhang] = useState(0.04); // meters overhang
  const [gravity, setGravity] = useState(9.81); // m/s^2 (Earth standard)
  const [slowMotion, setSlowMotion] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Telemetry State
  const [simState, setSimState] = useState('idle'); // 'idle', 'sliding', 'pivoting', 'falling', 'impact'
  const [outcome, setOutcome] = useState(null); // 'butter_down' | 'butter_up'
  const [currentAngle, setCurrentAngle] = useState(0);
  const [angularVelocity, setAngularVelocity] = useState(0);
  const [flightTime, setFlightTime] = useState(0);

  // Monte Carlo Statistical Batch State
  const [monteCarloStats, setMonteCarloStats] = useState({
    total: 0,
    butterDown: 0,
    butterUp: 0,
    percentageDown: 84,
  });

  // Scene references
  const simContextRef = useRef(null);
  // Focused cinematic framing making the table and toast prominently fill the viewport
  const cameraAngleRef = useRef({ theta: 0.58, phi: 0.22, radius: 0.98 });
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const updateCameraPosRef = useRef(null);

  // Web Audio Synthesizer with juicy butter squelch impact
  const playThudSound = useCallback((isButterDown) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      if (isButterDown) {
        // Juicy squelch + low thud for buttered side impact
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(90, now);
        osc1.frequency.exponentialRampToValueAtTime(25, now + 0.16);
        gain1.gain.setValueAtTime(0.45, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.2);

        // High squelch sweep
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(340, now);
        osc2.frequency.exponentialRampToValueAtTime(55, now + 0.12);
        gain2.gain.setValueAtTime(0.2, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.15);
      } else {
        // Dry crisp bread thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // Audio policy fallback
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = 520;

    // 1. Scene with warm studio ambiance and distance fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11141e);
    scene.fog = new THREE.Fog(0x11141e, 4.5, 12);

    // 2. Camera with focused cinematic focal length
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.05, 100);

    const updateCameraPos = () => {
      const { theta, phi, radius } = cameraAngleRef.current;
      // Proportional distance scaling so table elevation (0.5m to 3.0m) remains centered and visible
      const effectiveDist = radius * (1.0 + (tableHeight - 0.75) * 0.35);
      camera.position.x = effectiveDist * Math.cos(phi) * Math.sin(theta);
      camera.position.y = effectiveDist * Math.sin(phi) + tableHeight * 0.52;
      camera.position.z = effectiveDist * Math.cos(phi) * Math.cos(theta);
      camera.lookAt(0.06, tableHeight * 0.52, 0);
    };
    updateCameraPosRef.current = updateCameraPos;
    updateCameraPos();

    // 3. High-Quality WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.38;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Balanced Multi-Point Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 3.8);
    keyLight.position.set(3.5, 5.5, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.camera.left = -2.5;
    keyLight.shadow.camera.right = 2.5;
    keyLight.shadow.camera.top = 2.5;
    keyLight.shadow.camera.bottom = -2.5;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    const pivotSpot = new THREE.SpotLight(0xfef08a, 4.6, 8, Math.PI / 3.0, 0.35, 1.1);
    pivotSpot.position.set(0.1, 3.0, 1.4);
    pivotSpot.target.position.set(0.05, tableHeight, 0);
    scene.add(pivotSpot);
    scene.add(pivotSpot.target);

    const rimLight = new THREE.PointLight(0xe5a93c, 3.2, 8);
    rimLight.position.set(-2.0, 2.2, -1.8);
    scene.add(rimLight);

    const groundFill = new THREE.PointLight(0xa5b4fc, 1.8, 5);
    groundFill.position.set(0, 0.35, 0.4);
    scene.add(groundFill);

    // 5. Studio Platform Floor
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x161a27,
      roughness: 0.45,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(8, 16, 0xe5a93c, 0x272c3d);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    // 6. Dynamic Butter Splatter Puddle System
    const butterGroup = new THREE.Group();
    butterGroup.position.set(0.26, 0.004, 0);
    butterGroup.visible = false;
    scene.add(butterGroup);

    const butterStainMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.06,
      metalness: 0.18,
      emissive: 0xd97706,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.94,
    });

    const mainPuddle = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24).rotateX(-Math.PI / 2), butterStainMat);
    butterGroup.add(mainPuddle);

    const splatterOffsets = [
      [0.14, 0.09, 0.04],
      [-0.13, 0.08, 0.032],
      [0.06, -0.14, 0.045],
      [-0.09, -0.11, 0.03],
      [0.17, -0.05, 0.024],
      [-0.16, -0.04, 0.02],
      [0.08, 0.15, 0.035],
    ];
    splatterOffsets.forEach(([sx, sz, sr]) => {
      const drop = new THREE.Mesh(new THREE.CircleGeometry(sr, 16).rotateX(-Math.PI / 2), butterStainMat);
      drop.position.set(sx, 0.0005, sz);
      butterGroup.add(drop);
    });

    // Dynamic 3D Butter Splash Particle Burst
    const splashParticles = [];
    const splashGroup = new THREE.Group();
    scene.add(splashGroup);

    for (let i = 0; i < 24; i++) {
      const particleGeo = new THREE.SphereGeometry(0.012, 8, 8);
      const particle = new THREE.Mesh(particleGeo, butterStainMat);
      particle.visible = false;
      splashGroup.add(particle);
      splashParticles.push({
        mesh: particle,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        active: false,
      });
    }

    // 7. Dynamic Dining Table Group
    const tableGroup = new THREE.Group();
    scene.add(tableGroup);

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x3d271d,
      roughness: 0.36,
      metalness: 0.12,
    });
    const brassTrimMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      roughness: 0.22,
      metalness: 0.92,
    });
    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xfbfbfb,
      roughness: 0.15,
      metalness: 0.05,
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.18,
      metalness: 0.95,
    });

    // Tabletop Slab (Pivot edge aligned at x = 0)
    const tableWidth = 1.35;
    const tableDepth = 1.05;
    const tableThick = 0.048;
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(tableWidth, tableThick, tableDepth),
      woodMat
    );
    tableTop.position.set(-tableWidth / 2, tableHeight - tableThick / 2, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // Brass Pivot Edge Trim
    const tableEdgeTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, tableThick + 0.004, tableDepth + 0.01),
      brassTrimMat
    );
    tableEdgeTrim.position.set(0.009, tableHeight - tableThick / 2, 0);
    tableEdgeTrim.castShadow = true;
    tableGroup.add(tableEdgeTrim);

    // 4 Turned Walnut Legs (Normalized Unit Height = 1.0)
    const legRadius = 0.028;
    const legOffsets = [
      [-tableWidth + 0.11, -tableDepth / 2 + 0.11],
      [-0.11, -tableDepth / 2 + 0.11],
      [-tableWidth + 0.11, tableDepth / 2 - 0.11],
      [-0.11, tableDepth / 2 - 0.11],
    ];
    const legMeshes = [];

    const legGeom = new THREE.CylinderGeometry(legRadius, legRadius * 0.75, 1.0, 16);

    legOffsets.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeom, woodMat);
      leg.scale.set(1, tableHeight - tableThick, 1);
      leg.position.set(lx, (tableHeight - tableThick) / 2, lz);
      leg.castShadow = true;
      tableGroup.add(leg);
      legMeshes.push(leg);

      const ferrule = new THREE.Mesh(
        new THREE.CylinderGeometry(legRadius * 0.8, legRadius * 0.8, 0.06, 16),
        brassTrimMat
      );
      ferrule.position.set(lx, 0.03, lz);
      tableGroup.add(ferrule);
    });

    // Ceramic Breakfast Plate with Gold Rim
    const plateGroup = new THREE.Group();
    plateGroup.position.set(-0.45, tableHeight, 0.22);

    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.14, 0.018, 32), ceramicMat);
    plate.position.y = 0.009;
    plate.receiveShadow = true;
    plateGroup.add(plate);

    const plateGoldRim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.004, 8, 32), brassTrimMat);
    plateGoldRim.position.y = 0.018;
    plateGoldRim.rotation.x = Math.PI / 2;
    plateGroup.add(plateGoldRim);

    const knife = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.003, 0.018), steelMat);
    knife.position.set(0.04, 0.022, 0.06);
    knife.rotation.y = 0.45;
    plateGroup.add(knife);

    tableGroup.add(plateGroup);

    // Warm Ceramic Coffee Mug
    const mugGroup = new THREE.Group();
    mugGroup.position.set(-0.48, tableHeight, -0.28);

    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.11, 24), ceramicMat);
    mug.position.y = 0.055;
    mug.castShadow = true;
    mugGroup.add(mug);

    const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 8, 16, Math.PI), ceramicMat);
    mugHandle.position.set(0.055, 0.055, 0);
    mugHandle.rotation.y = Math.PI / 2;
    mugGroup.add(mugHandle);

    const coffeeSurface = new THREE.Mesh(
      new THREE.CircleGeometry(0.048, 16).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x1c120c, roughness: 0.1 })
    );
    coffeeSurface.position.y = 0.1;
    mugGroup.add(coffeeSurface);

    tableGroup.add(mugGroup);

    // 8. Calibrated Scientific Height Gauge (Geometry regenerated cleanly per heightVal)
    const rulerGroup = new THREE.Group();
    rulerGroup.position.set(0.04, 0, -0.58);
    scene.add(rulerGroup);

    let rulerPoleGeo = new THREE.BoxGeometry(0.028, tableHeight, 0.08);
    const rulerPoleMat = new THREE.MeshStandardMaterial({
      map: createHeightRulerTexture(tableHeight),
      roughness: 0.3,
      metalness: 0.5,
    });
    const rulerPole = new THREE.Mesh(rulerPoleGeo, rulerPoleMat);
    rulerPole.position.y = tableHeight / 2;
    rulerPole.castShadow = true;
    rulerGroup.add(rulerPole);

    const rulerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.015, 24), brassTrimMat);
    rulerBase.position.y = 0.0075;
    rulerGroup.add(rulerBase);

    // 9. 3D Overhang Indicator Bracket at Table Edge
    const overhangBracketMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      roughness: 0.2,
      metalness: 0.85,
      emissive: 0xe5a93c,
      emissiveIntensity: 0.45,
    });
    const overhangBracket = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.002, 0.22),
      overhangBracketMat
    );
    overhangBracket.scale.x = Math.max(0.002, initialOverhang);
    overhangBracket.position.set(initialOverhang / 2, tableHeight + 0.001, 0);
    tableGroup.add(overhangBracket);

    // 10. Artisan Buttered Toast Object
    const toastGroup = new THREE.Group();
    const L = 0.20; // Length in meters (20 cm)
    const W = 0.20; // Width
    const H = 0.032; // Thickness (3.2 cm)

    const butterTex = createButterTopTexture();
    const crumbTex = createBreadCrumbTexture();

    const crustMat = new THREE.MeshStandardMaterial({
      color: 0x6e3710,
      roughness: 0.88,
    });
    const butterMat = new THREE.MeshStandardMaterial({
      map: butterTex,
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
    });
    const bottomCrumbMat = new THREE.MeshStandardMaterial({
      map: crumbTex,
      color: 0xffffff,
      roughness: 0.85,
    });

    const toastMaterials = [
      crustMat, // +X
      crustMat, // -X
      butterMat, // +Y (BUTTER SIDE)
      bottomCrumbMat, // -Y (DRY CRUMB SIDE)
      crustMat, // +Z
      crustMat, // -Z
    ];

    const breadSlice = new THREE.Mesh(
      new THREE.BoxGeometry(L, H, W),
      toastMaterials
    );
    breadSlice.castShadow = true;
    breadSlice.receiveShadow = true;
    toastGroup.add(breadSlice);

    const butterPatMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.08,
      metalness: 0.15,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.35,
    });
    const butterPat = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.014, 0.055),
      butterPatMat
    );
    butterPat.position.set(0.01, H / 2 + 0.007, -0.01);
    butterPat.rotation.y = 0.32;
    butterPat.castShadow = true;
    toastGroup.add(butterPat);

    scene.add(toastGroup);

    // 11. Rigid-Body Physics Engine State
    let posX = initialOverhang - L / 2;
    let posY = tableHeight + H / 2;
    let posZ = 0;
    let rotZ = 0;
    let velX = 0;
    let velY = 0;
    let omega = 0; // Angular velocity (rad/s)
    let state = 'on_table'; // 'on_table', 'sliding', 'pivoting', 'free_fall', 'impact'
    let timeInAir = 0;

    // Floor impact settling physics state (prevents bread staying stuck vertically)
    let impactStartRot = 0;
    let targetRotZ = 0;
    let settleTimer = 0;
    let hasTriggeredSplash = false;

    const resetToast = (h = tableHeight, oh = initialOverhang) => {
      tableTop.position.y = h - tableThick / 2;
      tableEdgeTrim.position.y = h - tableThick / 2;
      plateGroup.position.y = h;
      mugGroup.position.y = h;

      // Legs stay clamped precisely to underside of table
      legMeshes.forEach((leg) => {
        leg.scale.set(1, h - tableThick, 1);
        leg.position.y = (h - tableThick) / 2;
      });

      // Regenerate calibrated height ruler geometry & texture so tick marks NEVER stretch
      rulerPole.geometry.dispose();
      rulerPole.geometry = new THREE.BoxGeometry(0.028, h, 0.08);
      rulerPole.position.y = h / 2;
      if (rulerPole.material.map) {
        rulerPole.material.map.dispose();
      }
      rulerPole.material.map = createHeightRulerTexture(h);
      rulerPole.material.needsUpdate = true;

      // Overhang 3D visual guide
      overhangBracket.scale.x = Math.max(0.002, oh);
      overhangBracket.position.set(oh / 2, h + 0.001, 0);

      // Toast resting position along table edge
      posX = oh - L / 2;
      posY = h + H / 2;
      posZ = 0;
      rotZ = 0;
      velX = 0;
      velY = 0;
      omega = 0;
      state = 'on_table';
      timeInAir = 0;
      settleTimer = 0;
      hasTriggeredSplash = false;

      toastGroup.position.set(posX, posY, posZ);
      toastGroup.rotation.set(0, 0, rotZ);

      butterGroup.visible = false;
      butterGroup.scale.set(0.01, 1, 0.01);
      splashParticles.forEach((p) => {
        p.active = false;
        p.mesh.visible = false;
      });

      setSimState('idle');
      setOutcome(null);
      setCurrentAngle(0);
      setAngularVelocity(0);
      setFlightTime(0);

      updateCameraPosRef.current?.();
    };

    resetToast(tableHeight, initialOverhang);

    // Trigger Physical Drop
    simContextRef.current = {
      reset: resetToast,
      launch: () => {
        resetToast(tableHeight, initialOverhang);
        state = 'sliding';
        velX = 0.12 + initialOverhang * 1.5;
        setSimState('sliding');
      },
      batchMonteCarlo: () => {
        let downCount = 0;
        let upCount = 0;
        const trials = 100;

        for (let t = 0; t < trials; t++) {
          const g = gravity;
          const h = tableHeight;
          const tFall = Math.sqrt((2 * h) / g);
          const thetaSlip = 0.52 + Math.random() * 0.1;
          const torqueFactor = 0.85 + (initialOverhang / (L / 2)) * 0.55;
          const w = Math.sqrt((3 * g / L) * Math.sin(thetaSlip)) * 0.52 * torqueFactor;
          const totalAngleRad = thetaSlip + w * tFall;
          const finalDeg = ((totalAngleRad * 180 / Math.PI) % 360 + 360) % 360;

          if (finalDeg > 90 && finalDeg < 270) {
            downCount++;
          } else {
            upCount++;
          }
        }

        setMonteCarloStats({
          total: trials,
          butterDown: downCount,
          butterUp: upCount,
          percentageDown: Math.round((downCount / trials) * 100),
        });
      },
    };

    // 12. Animation & Physics Simulation Loop
    let animId;
    let lastTime = performance.now();

    const triggerButterSplash = (impactX) => {
      butterGroup.position.set(impactX, 0.003, 0);
      butterGroup.scale.set(0.1, 1, 0.1);
      butterGroup.visible = true;

      // Launch 24 radial splash droplet particles
      splashParticles.forEach((p, idx) => {
        const angle = (idx / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const speed = 0.8 + Math.random() * 1.6;
        p.x = impactX + (Math.random() - 0.5) * 0.06;
        p.y = 0.02;
        p.z = (Math.random() - 0.5) * 0.06;
        p.vx = Math.cos(angle) * speed;
        p.vy = 1.0 + Math.random() * 1.2; // Upward splash arc
        p.vz = Math.sin(angle) * speed;
        p.active = true;
        p.mesh.position.set(p.x, p.y, p.z);
        p.mesh.scale.set(1, 1, 1);
        p.mesh.visible = true;
      });
    };

    const updatePhysics = (now) => {
      animId = requestAnimationFrame(updatePhysics);
      let dt = (now - lastTime) / 1000;
      lastTime = now;
      if (dt > 0.1) dt = 0.016;
      if (slowMotion) dt *= 0.25;

      if (state === 'sliding') {
        posX += velX * dt;
        if (posX >= 0) {
          state = 'pivoting';
          setSimState('pivoting');
        }
      } else if (state === 'pivoting') {
        const torqueBoost = 0.85 + (initialOverhang / (L / 2)) * 0.55;
        const alpha = ((3 * gravity) / (2 * L)) * Math.cos(rotZ) * torqueBoost;
        omega -= alpha * dt;
        rotZ += omega * dt;

        posX = (L / 2) * (1 - Math.cos(rotZ));
        posY = tableHeight + H / 2 - (L / 2) * Math.sin(-rotZ);

        const slipThreshold = -Math.PI * (0.16 + (initialOverhang / L) * 0.08);
        if (rotZ < slipThreshold) {
          state = 'free_fall';
          setSimState('falling');
          velX = 0.22 + Math.abs(omega) * 0.04;
          velY = -0.14 - Math.abs(omega) * 0.02;
        }
      } else if (state === 'free_fall') {
        timeInAir += dt;
        velY -= gravity * dt;
        posX += velX * dt;
        posY += velY * dt;
        rotZ += omega * dt;

        // Ground Impact Detection
        if (posY <= H / 2) {
          posY = H / 2;
          state = 'impact';
          velX = 0;
          velY = 0;
          omega = 0;

          const finalDeg = ((rotZ * (180 / Math.PI)) % 360 + 360) % 360;
          const isButterDown = finalDeg > 90 && finalDeg < 270;
          setOutcome(isButterDown ? 'butter_down' : 'butter_up');
          setSimState('impact');
          setFlightTime(Number(timeInAir.toFixed(2)));

          playThudSound(isButterDown);

          // Calculate nearest flat resting orientation (eliminates vertical sticking)
          impactStartRot = rotZ;
          if (isButterDown) {
            // Flat on buttered face (odd multiple of -PI)
            const k = Math.round((rotZ + Math.PI) / (2 * Math.PI));
            targetRotZ = 2 * k * Math.PI - Math.PI;
          } else {
            // Flat on bread base (even multiple of -PI)
            const k = Math.round(rotZ / (2 * Math.PI));
            targetRotZ = 2 * k * Math.PI;
          }
          settleTimer = 0;

          if (isButterDown && !hasTriggeredSplash) {
            hasTriggeredSplash = true;
            triggerButterSplash(posX);
          }
        }

        setCurrentAngle(Number((Math.abs(rotZ * (180 / Math.PI)) % 360).toFixed(1)));
        setAngularVelocity(Number(Math.abs(omega).toFixed(2)));
      } else if (state === 'impact') {
        // Smooth physics settling animation to slap flat onto floor
        if (settleTimer < 0.28) {
          settleTimer += dt;
          const progress = Math.min(1, settleTimer / 0.28);
          const ease = 1 - Math.pow(1 - progress, 3); // Smooth ease-out
          rotZ = THREE.MathUtils.lerp(impactStartRot, targetRotZ, ease);
          // Damped micro-bounce
          posY = H / 2 + Math.sin(progress * Math.PI) * 0.015 * Math.max(0, 1 - progress);
        } else {
          rotZ = targetRotZ;
          posY = H / 2;
        }

        // Animate expanding butter stain puddle
        if (hasTriggeredSplash && butterGroup.visible) {
          const puddleProgress = Math.min(1, settleTimer / 0.24);
          const pScale = THREE.MathUtils.lerp(0.1, 1.25, puddleProgress);
          butterGroup.scale.set(pScale, 1, pScale);
        }
      }

      // Update 3D Butter Splash Droplet Particles
      splashParticles.forEach((p) => {
        if (p.active) {
          p.vy -= 9.81 * 1.5 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;

          if (p.y <= 0.003) {
            // Droplet hits floor, flattens and sticks
            p.y = 0.003;
            p.active = false;
            p.mesh.scale.set(2.2, 0.1, 2.2);
          }
          p.mesh.position.set(p.x, p.y, p.z);
        }
      });

      toastGroup.position.set(posX, posY, posZ);
      toastGroup.rotation.z = rotZ;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(updatePhysics);

    // 13. Interactive Camera Controls (Drag to orbit, scroll to zoom)
    const dom = renderer.domElement;
    const activePointers = new Map();
    let initialPinchDist = null;
    let initialPinchRadius = null;

    const onPointerDown = (e) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      dom.setPointerCapture?.(e.pointerId);

      if (activePointers.size === 1) {
        isDraggingRef.current = true;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };
      } else if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        initialPinchRadius = cameraAngleRef.current.radius;
        isDraggingRef.current = false;
      }
    };

    const onPointerMove = (e) => {
      if (activePointers.has(e.pointerId)) {
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Two-finger pinch to zoom on tablets & touchscreens
      if (activePointers.size === 2 && initialPinchDist) {
        const pts = Array.from(activePointers.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (currentDist > 5) {
          const ratio = initialPinchDist / currentDist;
          cameraAngleRef.current.radius = Math.max(0.7, Math.min(3.5, initialPinchRadius * ratio));
          updateCameraPos();
        }
        return;
      }

      if (isDraggingRef.current && activePointers.size === 1) {
        const dx = e.clientX - prevPointerRef.current.x;
        const dy = e.clientY - prevPointerRef.current.y;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };

        cameraAngleRef.current.theta -= dx * 0.008;
        cameraAngleRef.current.phi = Math.max(0.04, Math.min(0.85, cameraAngleRef.current.phi + dy * 0.008));
        updateCameraPos();
      }
    };

    const onPointerUp = (e) => {
      activePointers.delete(e.pointerId);
      dom.releasePointerCapture?.(e.pointerId);
      if (activePointers.size < 2) {
        initialPinchDist = null;
      }
      if (activePointers.size === 0) {
        isDraggingRef.current = false;
      }
    };

    const onPointerCancel = (e) => {
      activePointers.delete(e.pointerId);
      if (activePointers.size === 0) {
        isDraggingRef.current = false;
        initialPinchDist = null;
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(0.7, Math.min(3.5, cameraAngleRef.current.radius + e.deltaY * 0.004));
      updateCameraPos();
    };

    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        simContextRef.current?.launch();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        simContextRef.current?.reset();
      }
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('pointercancel', onPointerCancel);
    dom.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);

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
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('pointercancel', onPointerCancel);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [tableHeight, initialOverhang, gravity, slowMotion, playThudSound]);

  const handleResetCamera = () => {
    cameraAngleRef.current = { theta: 0.58, phi: 0.22, radius: 0.98 };
    updateCameraPosRef.current?.();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <Icon name="logo" size={13} />
          <span>Matthews Rotational Dynamics Laboratory</span>
        </div>
        <h3 className={styles.title}>Murphy's Law: The Physics of Tumbling Toast</h3>
        <p className={styles.subtitle}>
          Standard dining tables (~0.75m) provide just enough free-fall time for gravitational torque τ = mg(L/2)cos(θ) to execute exactly half a rotation (180°), causing toast to land butter-side down ~84% of the time. Elevate the table to 2.5m–3m to prove that a full 360° rotation restores butter-side up!
        </p>
      </div>

      {/* 3D WebGL Canvas with Interactive Instructions Overlay */}
      <div className={styles.canvasWrapper}>
        <div className={styles.canvasMount} ref={mountRef} />

        <div className={styles.canvasOverlay}>
          <div className={styles.orbitHint}>
            <Icon name="rotate-ccw" size={12} />
            <span>🖱️ Drag to rotate • 🔍 Scroll to zoom</span>
          </div>

          <div className={styles.instructionCard}>
            <div className={styles.instructionHeader}>
              <span>⚡ Experiment Guide</span>
              <button
                className={styles.instructionToggle}
                onClick={() => setShowInstructions(!showInstructions)}
                title={showInstructions ? 'Minimize guide' : 'Expand guide'}
              >
                {showInstructions ? 'Hide' : 'Show'}
              </button>
            </div>

            {showInstructions && (
              <ul className={styles.instructionList}>
                <li>
                  <span>1.</span>
                  <span><strong>Murphy's Test:</strong> At <span className={styles.keyBadge}>0.75m</span>, click Drop Toast or press <span className={styles.keyBadge}>Space</span>. Toast flips 180° and lands <strong>Butter-Down</strong>.</span>
                </li>
                <li>
                  <span>2.</span>
                  <span><strong>Inversion Test:</strong> Increase Table Elevation to <span className={styles.keyBadge}>2.6m</span>. Longer flight time completes a full 360° rotation to land <strong>Butter-Up</strong>!</span>
                </li>
                <li>
                  <span>3.</span>
                  <span><strong>Overhang:</strong> Slide <span className={styles.keyBadge}>1cm - 8cm</span> to see initial edge torque & tipping speed change.</span>
                </li>
                <li>
                  <span>4.</span>
                  <span><strong>Keys:</strong> <span className={styles.keyBadge}>Space</span> to drop, <span className={styles.keyBadge}>R</span> to reset table.</span>
                </li>
              </ul>
            )}
          </div>
        </div>

        <div className={styles.canvasTools}>
          <button
            className={`${styles.toolBtn} ${slowMotion ? styles.activeToolBtn : ''}`}
            onClick={() => setSlowMotion(!slowMotion)}
            title="Toggle 0.25x Slow Motion"
          >
            <Icon name="clock" size={13} />
            <span>{slowMotion ? '0.25x Slow-Mo' : '1.0x Realtime'}</span>
          </button>
          <button className={styles.toolBtn} onClick={handleResetCamera} title="Reset Camera Angle">
            <Icon name="rotate-ccw" size={13} />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Physical Parameter Controls */}
      <div className={styles.controlsGrid}>
        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Table Elevation (h)</label>
            <span className={styles.valBadge}>{tableHeight.toFixed(2)} m</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.05"
            value={tableHeight}
            onChange={(e) => setTableHeight(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Kitchen table: 0.75m (180° Butter Down) | High table: 2.6m (360° Butter Up)</span>
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Initial Overhang Offset (d)</label>
            <span className={styles.valBadge}>{(initialOverhang * 100).toFixed(1)} cm</span>
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
          <span className={styles.hint}>Overhang determines initial gravitational torque & tipping speed</span>
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
          <span className={styles.hint}>Earth: 9.81 | Moon: 1.62 | Mars: 3.72 | Jupiter: 24.79</span>
        </div>
      </div>

      {/* Real-time Telemetry Cards */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Angular Rotation Angle (θ)</div>
          <div className={styles.statValue}>{currentAngle}°</div>
          <div className={styles.statFormula}>Butter-Down Band: 90° to 270°</div>
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
            {outcome === 'butter_up' && '✓ Toast-Side Down (Full 360° Inversion)'}
            {!outcome && 'Awaiting Drop...'}
          </div>
          <div className={styles.statFormula}>
            {flightTime > 0 ? `Time of flight: ${flightTime}s (t = √(2h/g))` : 'Click Drop Toast or press [Space]'}
          </div>
        </div>
      </div>

      {/* Monte Carlo Statistical Probability Card */}
      <div className={styles.monteCarloCard}>
        <div className={styles.monteCarloHeader}>
          <span>Monte Carlo Statistical Distribution (100 Stochastic Trials)</span>
          <span className={styles.probRatio}>
            {monteCarloStats.percentageDown}% Butter-Down Inevitability
          </span>
        </div>
        <div className={styles.probBarContainer}>
          <div
            className={styles.probBarDown}
            style={{ width: `${monteCarloStats.percentageDown}%` }}
          />
          <div
            className={styles.probBarUp}
            style={{ width: `${100 - monteCarloStats.percentageDown}%` }}
          />
        </div>
        <div className={styles.probLegend}>
          <span>⚠️ Butter-Down: {monteCarloStats.percentageDown}% ({monteCarloStats.butterDown}/100)</span>
          <span>✓ Toast-Down: {100 - monteCarloStats.percentageDown}% ({monteCarloStats.butterUp}/100)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionRow}>
        <button
          onClick={() => simContextRef.current?.launch()}
          disabled={simState === 'sliding' || simState === 'pivoting' || simState === 'falling'}
          className={styles.launchBtn}
        >
          <Icon name="zap" size={16} />
          <span>
            {simState === 'sliding' || simState === 'pivoting' || simState === 'falling'
              ? 'Calculating Trajectory...'
              : 'Drop Toast (Execute 3D Simulation)'}
          </span>
        </button>

        <button
          onClick={() => simContextRef.current?.batchMonteCarlo()}
          className={styles.monteBtn}
          title="Run 100 stochastic trials to compute empirical distribution"
        >
          <Icon name="bar-chart" size={16} />
          <span>Run 100-Drop Monte Carlo Batch</span>
        </button>

        <button
          onClick={() => simContextRef.current?.reset()}
          className={styles.resetBtn}
        >
          <Icon name="rotate-ccw" size={16} />
          <span>Reset Table</span>
        </button>
      </div>
    </div>
  );
}
