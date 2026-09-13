'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './SchrodingersCat3DLab.module.css';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/common/Icon';

/**
 * Procedural Vintage 1935 Geiger-Müller Dial Plate Texture
 */
function createGeigerDialTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Aged ivory parchment background
  ctx.fillStyle = '#EAE5D8';
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();

  // Outer brass retention ring
  ctx.strokeStyle = '#92702E';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Inner black bezel line
  ctx.strokeStyle = '#22252E';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(128, 128, 116, 0, Math.PI * 2);
  ctx.stroke();

  // Scale Arcs
  const startAngle = Math.PI * 0.78;
  const endAngle = Math.PI * 2.22;

  // Safe zone arc
  ctx.strokeStyle = '#181A22';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(128, 138, 92, startAngle, startAngle + (endAngle - startAngle) * 0.72);
  ctx.stroke();

  // Danger zone arc
  ctx.strokeStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(128, 138, 92, startAngle + (endAngle - startAngle) * 0.72, endAngle);
  ctx.stroke();

  // Calibration Tick Marks
  const totalTicks = 25;
  for (let i = 0; i <= totalTicks; i++) {
    const angle = startAngle + (i / totalTicks) * (endAngle - startAngle);
    const isMajor = i % 5 === 0;
    const rIn = isMajor ? 78 : 84;
    const rOut = 92;
    const x1 = 128 + Math.cos(angle) * rIn;
    const y1 = 138 + Math.sin(angle) * rIn;
    const x2 = 128 + Math.cos(angle) * rOut;
    const y2 = 138 + Math.sin(angle) * rOut;

    ctx.strokeStyle = i >= 18 ? '#D97706' : '#181A22';
    ctx.lineWidth = isMajor ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (isMajor) {
      const val = i * 40;
      const textR = 66;
      const tx = 128 + Math.cos(angle) * textR;
      const ty = 138 + Math.sin(angle) * textR;
      ctx.fillStyle = '#181A22';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${val}`, tx, ty);
    }
  }

  // Dial typography
  ctx.fillStyle = '#181A22';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('COUNTS / MIN', 128, 172);

  ctx.fillStyle = '#6B7280';
  ctx.font = '8px monospace';
  ctx.fillText('GEIGER-MÜLLER • 1935', 128, 188);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Procedural Industrial Hazard Placard Texture
 */
function createHazardPlacardTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  // Heavy steel plate
  ctx.fillStyle = '#141722';
  ctx.fillRect(0, 0, 384, 192);

  // Warning amber perimeter border
  ctx.strokeStyle = '#E5A93C';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 372, 180);

  ctx.strokeStyle = '#2B3042';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, 356, 164);

  // Radiation Trefoil Symbol
  ctx.fillStyle = '#E5A93C';
  ctx.beginPath();
  ctx.arc(60, 96, 12, 0, Math.PI * 2);
  ctx.fill();

  for (let b = 0; b < 3; b++) {
    const angle = (b * 120 - 90) * (Math.PI / 180);
    ctx.beginPath();
    ctx.arc(60, 96, 34, angle - 0.52, angle + 0.52);
    ctx.arc(60, 96, 16, angle + 0.52, angle - 0.52, true);
    ctx.closePath();
    ctx.fill();
  }

  // Text
  ctx.fillStyle = '#F9FAFB';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ACHTUNG: STAHLKAMMER', 112, 58);

  ctx.fillStyle = '#E5A93C';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('QUANTUM ENTANGLEMENT CHAMBER', 112, 86);

  ctx.fillStyle = '#9CA3AF';
  ctx.font = '10px monospace';
  ctx.fillText('RADIOACTIVE ISOTOPE & HCN POISON', 112, 114);

  ctx.fillStyle = '#6B7280';
  ctx.font = '9px monospace';
  ctx.fillText('ERWIN SCHRÖDINGER • BERLIN 1935', 112, 140);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Procedural Realistic Cat Eye Iris Texture
 */
function createCatEyeTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Warm luminous amber iris gradient
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
  grad.addColorStop(0, '#F59E0B');
  grad.addColorStop(0.5, '#D97706');
  grad.addColorStop(0.85, '#92400E');
  grad.addColorStop(1, '#3B1A04');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, Math.PI * 2);
  ctx.fill();

  // Feline vertical slit pupil
  ctx.fillStyle = '#08090C';
  ctx.beginPath();
  ctx.ellipse(64, 64, 8, 46, 0, 0, Math.PI * 2);
  ctx.fill();

  // Highlight specular reflection glint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(74, 50, 7, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

/**
 * High-Fidelity 3D WebGL Quantum Simulation Laboratory for Schrödinger's Cat.
 * Rebuilt for realistic physical presence:
 * - Riveted lead-lined industrial steel chamber (Stahlkammer)
 * - Sculpted feline anatomy (ribcage, flanks, folded paws, alert ears, slit eyes, Catmull-Rom tail)
 * - Authentic 1930s Geiger-Müller counter with cylindrical tube, bakelite dials, calibrated scale
 * - Lead collimator box with radioactive uranium crystal emitting sparks
 * - Precision electromechanical solenoid relay, spring trip hammer, and Erlenmeyer cyanide flask
 * - Realistic glass refraction, liquid meniscus, and shattered glass spill in collapsed state
 * - Synthesized Web Audio Geiger clicks and vault unlatch clinks
 */
export default function SchrodingersCat3DLab() {
  const mountRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Simulation State
  const [boxState, setBoxState] = useState('sealed'); // 'sealed', 'measuring', 'alive', 'dead'
  const [xrayMode, setXrayMode] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(30);
  const [interpretation, setInterpretation] = useState('copenhagen');
  const [trials, setTrials] = useState({ total: 0, alive: 0, dead: 0 });
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);

  // 3D Scene Refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const doorGroupRef = useRef(null);
  const catGroupRef = useRef(null);
  const catAliveMeshRef = useRef(null);
  const catDeadMeshRef = useRef(null);
  const coreMeshRef = useRef(null);
  const sparksRef = useRef(null);
  const geigerNeedleRef = useRef(null);
  const hammerRef = useRef(null);
  const intactFlaskRef = useRef(null);
  const shatteredFlaskRef = useRef(null);
  const poisonPoolRef = useRef(null);
  const chamberWallsRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const updateCameraPosRef = useRef(null);

  // Camera Orbit State
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: 0.35, phi: 0.22, radius: 13.5 });

  // Physics: P(decay) = 1 - (0.5)^(t / t_half)
  const halfLife = 30;
  const decayProb = Math.min(0.99, Math.max(0.01, 1 - Math.pow(0.5, elapsedMinutes / halfLife)));
  const aliveProb = 1 - decayProb;

  // Synthesize realistic acoustic Geiger click
  const playGeigerClick = useCallback(() => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const bufferSize = ctx.sampleRate * 0.003;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 3200 + Math.random() * 800;
      filter.Q.value = 3.0;
      const gain = ctx.createGain();
      gain.gain.value = 0.45;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch {
      // Audio fallback without crash
    }
  }, [audioEnabled]);

  // Synthesize mechanical vault latch sound
  const playLatchSound = useCallback(() => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {
      // audio fallback
    }
  }, [audioEnabled]);

  // Periodic random Geiger clicks based on decay probability
  useEffect(() => {
    if (boxState !== 'sealed' && boxState !== 'measuring') return;
    const interval = setInterval(() => {
      if (Math.random() < decayProb * 0.85) {
        playGeigerClick();
        if (geigerNeedleRef.current) {
          geigerNeedleRef.current.rotation.z = -0.35 - Math.random() * 0.7;
          setTimeout(() => {
            if (geigerNeedleRef.current) geigerNeedleRef.current.rotation.z = -0.15;
          }, 140);
        }
      }
    }, 450);
    return () => clearInterval(interval);
  }, [boxState, decayProb, playGeigerClick]);

  // Build Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    // 1. Scene with studio laboratory ambiance
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1118);
    sceneRef.current = scene;

    // 2. Camera with focused center of interest
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    cameraRef.current = camera;
    const updateCameraPos = () => {
      const { theta, phi, radius } = cameraAngleRef.current;
      camera.position.x = radius * Math.cos(phi) * Math.sin(theta);
      camera.position.y = radius * Math.sin(phi) + 0.3;
      camera.position.z = radius * Math.cos(phi) * Math.cos(theta);
      camera.lookAt(0, -0.6, 0);
    };
    updateCameraPosRef.current = updateCameraPos;
    updateCameraPos();

    // 3. Renderer with high-fidelity soft shadows and exposure
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25; // Bright, rich laboratory illumination
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting System (No pitch-black voids: clear, balanced studio laboratory illumination)
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 1.45);
    scene.add(ambientLight);

    // Frontal Studio Key Light
    const mainLight = new THREE.DirectionalLight(0xfff7ed, 2.3);
    mainLight.position.set(6, 8, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 2;
    mainLight.shadow.camera.far = 28;
    mainLight.shadow.camera.left = -6;
    mainLight.shadow.camera.right = 6;
    mainLight.shadow.camera.top = 6;
    mainLight.shadow.camera.bottom = -6;
    mainLight.shadow.bias = -0.0004;
    scene.add(mainLight);

    // Fill Light from Front-Left
    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.35);
    fillLight.position.set(-7, 6, 8);
    scene.add(fillLight);

    // Overhead Tungsten Laboratory Fixture
    const overheadLamp = new THREE.PointLight(0xfff1dc, 3.6, 18);
    overheadLamp.position.set(0, 1.9, 0);
    overheadLamp.castShadow = true;
    overheadLamp.shadow.bias = -0.001;
    scene.add(overheadLamp);

    // Dedicated Task Spotlight on Apparatus Workbench
    const benchSpot = new THREE.SpotLight(0xfde68a, 2.4, 10, Math.PI / 3.5, 0.35);
    benchSpot.position.set(-1.4, 2.0, 0.5);
    benchSpot.target.position.set(-1.4, -0.9, -0.1);
    scene.add(benchSpot);
    scene.add(benchSpot.target);

    // Warm Specular Rim Accent on the Feline
    const catAccent = new THREE.PointLight(0xe5a93c, 1.5, 6);
    catAccent.position.set(1.15, -0.4, 1.4);
    scene.add(catAccent);

    // 5. Materials
    const steelWallMat = new THREE.MeshStandardMaterial({
      color: 0x272c3b,
      roughness: 0.45,
      metalness: 0.48,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0,
    });

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x33394a,
      roughness: 0.38,
      metalness: 0.55,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0,
    });

    const brassFrameMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      roughness: 0.28,
      metalness: 0.88,
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x161922,
      roughness: 0.65,
      metalness: 0.45,
    });

    const boxWidth = 7.4;
    const boxHeight = 4.8;
    const boxDepth = 5.6;
    const floorY = -boxHeight / 2 + 0.25 / 2; // -2.275
    const groundPlaneY = -2.15; // Surface of the steel chamber floor
    const chamberWalls = [];

    // Heavy Laboratory Base Pedestal
    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(11.5, 0.35, 9.5),
      new THREE.MeshStandardMaterial({ color: 0x11131a, roughness: 0.75, metalness: 0.4 })
    );
    basePlate.position.y = -boxHeight / 2 - 0.175;
    basePlate.receiveShadow = true;
    scene.add(basePlate);

    // Wall creation helper
    const addWall = (w, h, d, x, y, z, mat = steelWallMat) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat.clone());
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      chamberWalls.push(mesh);
      return mesh;
    };

    // Floor, Ceiling, Back, Left, Right
    addWall(boxWidth, 0.25, boxDepth, 0, -boxHeight / 2, 0, floorMat);
    addWall(boxWidth, 0.25, boxDepth, 0, boxHeight / 2, 0);
    addWall(boxWidth, boxHeight, 0.25, 0, 0, -boxDepth / 2);
    addWall(0.25, boxHeight, boxDepth, -boxWidth / 2, 0, 0);
    addWall(0.25, boxHeight, boxDepth, boxWidth / 2, 0, 0);

    // Floor Grid Seam Plate Lines (adds authentic industrial chamber depth)
    const seamMat = new THREE.MeshStandardMaterial({ color: 0x1c202c, roughness: 0.5, metalness: 0.8 });
    for (let gx = -2.4; gx <= 2.4; gx += 1.6) {
      const seamX = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, boxDepth - 0.4), seamMat);
      seamX.position.set(gx, groundPlaneY + 0.005, 0);
      scene.add(seamX);
    }

    // Riveted Steel Corner Reinforcements
    const trimT = 0.16;
    const trimD = 0.22;
    const topTrim = new THREE.Mesh(new THREE.BoxGeometry(boxWidth + trimT * 2, trimT, trimD), brassFrameMat);
    topTrim.position.set(0, boxHeight / 2 + trimT / 2, boxDepth / 2);
    scene.add(topTrim);

    const botTrim = new THREE.Mesh(new THREE.BoxGeometry(boxWidth + trimT * 2, trimT, trimD), brassFrameMat);
    botTrim.position.set(0, -boxHeight / 2 - trimT / 2, boxDepth / 2);
    scene.add(botTrim);

    const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(trimT, boxHeight, trimD), brassFrameMat);
    leftTrim.position.set(-boxWidth / 2 - trimT / 2, 0, boxDepth / 2);
    scene.add(leftTrim);

    const rightTrim = new THREE.Mesh(new THREE.BoxGeometry(trimT, boxHeight, trimD), brassFrameMat);
    rightTrim.position.set(boxWidth / 2 + trimT / 2, 0, boxDepth / 2);
    scene.add(rightTrim);

    // Steel Rivet Details along the front frame
    const rivetGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12);
    rivetGeom.rotateX(Math.PI / 2);
    const rivetMat = new THREE.MeshStandardMaterial({ color: 0xc4cbd4, metalness: 0.85, roughness: 0.25 });
    for (let r = -3.2; r <= 3.2; r += 0.8) {
      const topRivet = new THREE.Mesh(rivetGeom, rivetMat);
      topRivet.position.set(r, boxHeight / 2 + trimT / 2, boxDepth / 2 + trimD / 2 + 0.02);
      scene.add(topRivet);
      const botRivet = new THREE.Mesh(rivetGeom, rivetMat);
      botRivet.position.set(r, -boxHeight / 2 - trimT / 2, boxDepth / 2 + trimD / 2 + 0.02);
      scene.add(botRivet);
    }

    // Overhead Industrial Lamp Fixture in Chamber Ceiling
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0, boxHeight / 2 - 0.15, 0);

    const lampShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.6, 0.25, 20),
      new THREE.MeshStandardMaterial({ color: 0x242836, metalness: 0.8, roughness: 0.3 })
    );
    lampGroup.add(lampShade);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfff3e0, emissive: 0xffe0b2, emissiveIntensity: 2.2 })
    );
    bulb.position.y = -0.12;
    lampGroup.add(bulb);

    // Wire cage around bulb
    for (let c = 0; c < 4; c++) {
      const wire = new THREE.Mesh(
        new THREE.TorusGeometry(0.25, 0.015, 6, 16, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.9 })
      );
      wire.position.y = -0.14;
      wire.rotation.x = Math.PI;
      wire.rotation.y = (c * Math.PI) / 4;
      lampGroup.add(wire);
    }
    scene.add(lampGroup);

    // Electrical conduit tubing along ceiling to back wall
    const conduitCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, boxHeight / 2 - 0.15, 0),
      new THREE.Vector3(-1.8, boxHeight / 2 - 0.18, -0.8),
      new THREE.Vector3(-2.1, 0.6, -2.1),
    ]);
    const conduitMesh = new THREE.Mesh(
      new THREE.TubeGeometry(conduitCurve, 24, 0.04, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.35 })
    );
    scene.add(conduitMesh);

    chamberWallsRef.current = chamberWalls;

    // 6. The Heavy Hinged Vault Door
    const doorGroup = new THREE.Group();
    doorGroup.position.set(-boxWidth / 2, 0, boxDepth / 2); // Hinge pivot on left

    // Heavy Dual Barrel Hinges
    const hingeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.9 });
    const topHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.6, 16), hingeMat);
    topHinge.position.set(0, 1.4, 0);
    doorGroup.add(topHinge);
    const botHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.6, 16), hingeMat);
    botHinge.position.set(0, -1.4, 0);
    doorGroup.add(botHinge);

    // Main Door Slab
    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(boxWidth, boxHeight - 0.1, 0.28),
      new THREE.MeshStandardMaterial({
        color: 0x222735,
        roughness: 0.48,
        metalness: 0.45,
        transparent: true,
        opacity: 1.0,
      })
    );
    doorMesh.position.set(boxWidth / 2, 0, 0);
    doorMesh.castShadow = true;
    doorGroup.add(doorMesh);
    chamberWalls.push(doorMesh);

    // Heavy Vault Locking Wheel Mechanism
    const lockCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.18, 24),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.25 })
    );
    lockCenter.rotation.x = Math.PI / 2;
    lockCenter.position.set(boxWidth / 2, 0.1, 0.2);
    doorGroup.add(lockCenter);

    const wheelRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.05, 12, 32),
      brassFrameMat
    );
    wheelRim.position.set(boxWidth / 2, 0.1, 0.22);
    doorGroup.add(wheelRim);

    // 4 Wheel Spokes
    for (let s = 0; s < 4; s++) {
      const spoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 1.44, 8),
        brassFrameMat
      );
      spoke.position.set(boxWidth / 2, 0.1, 0.22);
      spoke.rotation.z = (s * Math.PI) / 4;
      doorGroup.add(spoke);
    }

    // Heavy Brass Latch Bar
    const latchBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.85, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
    );
    latchBar.position.set(boxWidth - 0.25, 0.1, 0.16);
    doorGroup.add(latchBar);

    // Warning Placard on Door Face
    const placardTexture = createHazardPlacardTexture();
    if (placardTexture) {
      const placard = new THREE.Mesh(
        new THREE.PlaneGeometry(1.9, 0.95),
        new THREE.MeshStandardMaterial({ map: placardTexture, roughness: 0.4, metalness: 0.2 })
      );
      placard.position.set(boxWidth / 2, 1.35, 0.155);
      doorGroup.add(placard);
    }

    scene.add(doorGroup);
    doorGroupRef.current = doorGroup;

    // 7. Grounded Laboratory Equipment Workbench (Unifies all apparatus on a single physical plane)
    const workbenchGroup = new THREE.Group();
    workbenchGroup.position.set(-1.45, 0, -0.1);

    const tableTopY = -1.14; // Workbench surface height
    const legHeight = tableTopY - groundPlaneY; // 1.01

    // Tabletop Slab (Heavy dark vulcanite/steel with bevelled brass trim)
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.1, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x1e2230, metalness: 0.65, roughness: 0.4 })
    );
    tableTop.position.set(0, tableTopY - 0.05, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    workbenchGroup.add(tableTop);

    const tableTrim = new THREE.Mesh(
      new THREE.BoxGeometry(2.64, 0.04, 1.64),
      brassFrameMat
    );
    tableTrim.position.set(0, tableTopY - 0.08, 0);
    workbenchGroup.add(tableTrim);

    // 4 Heavy Steel Legs with Brass Leveler Feet
    const legGeom = new THREE.CylinderGeometry(0.055, 0.055, legHeight, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2a2f40, metalness: 0.85, roughness: 0.3 });
    const footMat = brassFrameMat;

    const legOffsets = [
      [-1.15, -0.65],
      [1.15, -0.65],
      [-1.15, 0.65],
      [1.15, 0.65],
    ];

    legOffsets.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeom, legMat);
      leg.position.set(lx, groundPlaneY + legHeight / 2, lz);
      leg.castShadow = true;
      workbenchGroup.add(leg);

      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16), footMat);
      foot.position.set(lx, groundPlaneY + 0.02, lz);
      workbenchGroup.add(foot);
    });

    scene.add(workbenchGroup);

    // 8. Apparatus Component 1: Lead Isotope Collimator Castle ("Kästchen")
    const isotopeGroup = new THREE.Group();
    // Mounted on the left of the workbench surface
    isotopeGroup.position.set(-2.25, tableTopY, -0.1);

    // Heavy Octagonal Lead Castle Housing
    const leadWell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.38, 0.52, 8),
      new THREE.MeshStandardMaterial({ color: 0x2b3040, metalness: 0.9, roughness: 0.35 })
    );
    leadWell.position.y = 0.26;
    leadWell.castShadow = true;
    isotopeGroup.add(leadWell);

    // Brass base retention ring
    const leadBaseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16), brassFrameMat);
    leadBaseRing.position.y = 0.025;
    isotopeGroup.add(leadBaseRing);

    // Horizontal Collimator Aperture Nozzle pointed along +X toward the GM tube
    const collimatorNozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.16, 16),
      brassFrameMat
    );
    collimatorNozzle.rotation.z = Math.PI / 2;
    collimatorNozzle.position.set(0.38, 0.26, 0);
    isotopeGroup.add(collimatorNozzle);

    // Natural Faceted Pitchblende/Uranium Ore Core Crystal
    const coreMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.15, 1),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 1.4,
        roughness: 0.3,
        metalness: 0.4,
      })
    );
    coreMesh.position.set(0.05, 0.26, 0);
    isotopeGroup.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // Ionization Particle Spark Stream (travels neatly from collimator into GM tube)
    const sparkCount = 45;
    const sparkGeom = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = -1.82 + Math.random() * 0.3;
      sparkPositions[i * 3 + 1] = tableTopY + 0.26 + (Math.random() - 0.5) * 0.1;
      sparkPositions[i * 3 + 2] = -0.1 + (Math.random() - 0.5) * 0.1;
    }
    sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.055,
      transparent: true,
      opacity: 0.95,
    });
    const sparkPoints = new THREE.Points(sparkGeom, sparkMat);
    scene.add(sparkPoints);
    sparksRef.current = sparkPoints;

    scene.add(isotopeGroup);

    // 9. Apparatus Component 2: Vintage 1935 Geiger-Müller Detection Instrument
    const geigerGroup = new THREE.Group();
    // Mounted on the middle of the workbench
    geigerGroup.position.set(-1.42, tableTopY, -0.15);

    // Instrument Metal Housing Chassis
    const geigerChassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.72, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x222736, metalness: 0.8, roughness: 0.35 })
    );
    geigerChassis.position.set(0, 0.36, 0);
    geigerChassis.castShadow = true;
    geigerGroup.add(geigerChassis);

    // Horizontal Geiger-Müller Sensing Tube (Chrome/Mica window, perfectly aligned with collimator aperture Y)
    const gmTubeGroup = new THREE.Group();
    gmTubeGroup.position.set(-0.06, 0.26, 0.34);

    const gmTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.65, 20),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 })
    );
    gmTube.rotation.z = Math.PI / 2;
    gmTube.castShadow = true;
    gmTubeGroup.add(gmTube);

    // Mica Window cap on tube facing -X towards collimator
    const micaCap = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.04, 16), brassFrameMat);
    micaCap.rotation.z = Math.PI / 2;
    micaCap.position.x = -0.32;
    gmTubeGroup.add(micaCap);

    // Brass insulated mounting standoffs connecting tube to chassis
    const bracket1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.12), brassFrameMat);
    bracket1.position.set(-0.18, -0.07, -0.06);
    gmTubeGroup.add(bracket1);
    const bracket2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.12), brassFrameMat);
    bracket2.position.set(0.18, -0.07, -0.06);
    gmTubeGroup.add(bracket2);

    geigerGroup.add(gmTubeGroup);

    // Round Galvanometer Meter with Calibrated Logarithmic Scale
    const dialPlateGeom = new THREE.CircleGeometry(0.24, 32);
    const dialTex = createGeigerDialTexture();
    const dialPlate = new THREE.Mesh(
      dialPlateGeom,
      new THREE.MeshBasicMaterial({ map: dialTex })
    );
    dialPlate.position.set(-0.12, 0.44, 0.28);
    geigerGroup.add(dialPlate);

    // Brass Meter Bezel Rim
    const dialBezel = new THREE.Mesh(
      new THREE.TorusGeometry(0.245, 0.02, 12, 32),
      brassFrameMat
    );
    dialBezel.position.set(-0.12, 0.44, 0.285);
    geigerGroup.add(dialBezel);

    // Convex Protective Glass Lens Cover
    const dialGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 24, 12, 0, Math.PI * 2, 0, Math.PI / 4),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.96,
        transparent: true,
        roughness: 0.04,
        ior: 1.5,
      })
    );
    dialGlass.position.set(-0.12, 0.44, 0.27);
    dialGlass.rotation.x = Math.PI / 2;
    geigerGroup.add(dialGlass);

    // Needle Pointer with Brass Pivot Cap
    const needleGeom = new THREE.BoxGeometry(0.02, 0.2, 0.01);
    needleGeom.translate(0, 0.09, 0);
    const needle = new THREE.Mesh(needleGeom, new THREE.MeshBasicMaterial({ color: 0xd97706 }));
    needle.position.set(-0.12, 0.36, 0.29);
    needle.rotation.z = -0.15;
    geigerGroup.add(needle);
    geigerNeedleRef.current = needle;

    const needleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16), brassFrameMat);
    needleCap.rotation.x = Math.PI / 2;
    needleCap.position.set(-0.12, 0.36, 0.298);
    geigerGroup.add(needleCap);

    // Vintage Knurled Sensitivity Knob & Heavy Industrial Toggle
    const knob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.09, 20),
      new THREE.MeshStandardMaterial({ color: 0x11131a, roughness: 0.6 })
    );
    knob.rotation.x = Math.PI / 2;
    knob.position.set(0.25, 0.52, 0.28);
    geigerGroup.add(knob);

    const toggleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12), brassFrameMat);
    toggleBase.rotation.x = Math.PI / 2;
    toggleBase.position.set(0.25, 0.28, 0.28);
    geigerGroup.add(toggleBase);

    const toggleLever = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.08, 8), brassFrameMat);
    toggleLever.position.set(0.25, 0.31, 0.31);
    toggleLever.rotation.x = 0.3;
    geigerGroup.add(toggleLever);

    // Signal Wire conduit bridging from Geiger chassis into the Solenoid Relay
    const wireCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.41, 0.35, 0),
      new THREE.Vector3(0.65, 0.45, 0.05),
      new THREE.Vector3(0.85, 0.6, 0.1),
    ]);
    const signalWire = new THREE.Mesh(
      new THREE.TubeGeometry(wireCurve, 16, 0.018, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x1a1c24, roughness: 0.8 })
    );
    geigerGroup.add(signalWire);

    scene.add(geigerGroup);

    // 10. Apparatus Component 3: Laboratory Stand, Solenoid Relay, Trip Hammer & Cyanide Flask
    const relayPoisonGroup = new THREE.Group();
    // Clamped on the right side of the workbench
    relayPoisonGroup.position.set(-0.55, tableTopY, -0.05);

    // Heavy Cast-Iron Laboratory Retort Stand Base
    const standBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.04, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x181a24, metalness: 0.85, roughness: 0.4 })
    );
    standBase.position.set(0, 0.02, 0);
    relayPoisonGroup.add(standBase);

    // Vertical Stainless Support Rod
    const standRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.45, 16),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.15 })
    );
    standRod.position.set(0.16, 0.725, -0.18);
    standRod.castShadow = true;
    relayPoisonGroup.add(standRod);

    // Solenoid Relay Box clamped to the vertical rod
    const relayChassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.45, 0.42),
      darkTrimMat
    );
    relayChassis.position.set(0, 0.95, 0);
    relayChassis.castShadow = true;
    relayPoisonGroup.add(relayChassis);

    // Copper Wire Solenoid Cylinder
    const copperCoil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.28, 20),
      new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.88, roughness: 0.25 })
    );
    copperCoil.position.set(0, 0.95, 0);
    relayPoisonGroup.add(copperCoil);

    // Spring Trip Hammer Mechanism (Directly aligned above the flask neck)
    const hammerGroup = new THREE.Group();
    hammerGroup.position.set(0, 0.72, 0); // Pivot point centered directly over flask

    const pivotPin = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 16), brassFrameMat);
    pivotPin.rotation.x = Math.PI / 2;
    hammerGroup.add(pivotPin);

    // Steel Hammer Shank
    const hammerShankGeom = new THREE.BoxGeometry(0.045, 0.35, 0.045);
    hammerShankGeom.translate(0, -0.175, 0);
    const hammerShank = new THREE.Mesh(
      hammerShankGeom,
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.92, roughness: 0.15 })
    );
    hammerGroup.add(hammerShank);

    // Heavy Steel Hammer Head (poised directly to strike the flask stopper when released)
    const hammerHeadGeom = new THREE.BoxGeometry(0.2, 0.12, 0.14);
    hammerHeadGeom.translate(0, -0.35, 0);
    const hammerHead = new THREE.Mesh(
      hammerHeadGeom,
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.25 })
    );
    hammerHead.castShadow = true;
    hammerGroup.add(hammerHead);

    hammerGroup.rotation.z = -Math.PI * 0.35; // Cocked ready to strike
    relayPoisonGroup.add(hammerGroup);
    hammerRef.current = hammerGroup;

    // Prussic Acid Chemical Flask (Erlenmeyer Flask resting securely on the table)
    const flaskGroup = new THREE.Group();
    flaskGroup.position.set(0, 0, 0);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      transparent: true,
      roughness: 0.06,
      ior: 1.52,
      thickness: 0.35,
    });

    // Erlenmeyer Conical Flask Body
    const flaskBody = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.42, 24), glassMat);
    flaskBody.position.y = 0.21;
    flaskBody.castShadow = true;
    flaskGroup.add(flaskBody);

    // Cylindrical Neck
    const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.18, 20), glassMat);
    flaskNeck.position.y = 0.46;
    flaskGroup.add(flaskNeck);

    // Rubber Laboratory Stopper in neck top
    const stopper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.065, 0.09, 16),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.75 })
    );
    stopper.position.y = 0.54;
    flaskGroup.add(stopper);

    // Amber Toxic Cyanide Liquid Meniscus inside
    const liquidMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.23, 0.26, 20),
      new THREE.MeshStandardMaterial({
        color: 0xe5a93c,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
        roughness: 0.15,
        transparent: true,
        opacity: 0.85,
      })
    );
    liquidMesh.position.y = 0.13;
    flaskGroup.add(liquidMesh);

    relayPoisonGroup.add(flaskGroup);
    intactFlaskRef.current = flaskGroup;

    // Shattered Glass Shards for Collapsed Dead State
    const shatteredGroup = new THREE.Group();
    shatteredGroup.position.set(0, 0.03, 0);
    shatteredGroup.visible = false;

    for (let g = 0; g < 10; g++) {
      const shard = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.06 + Math.random() * 0.06, 0),
        glassMat
      );
      shard.position.set((Math.random() - 0.5) * 0.45, 0.02, (Math.random() - 0.5) * 0.45);
      shard.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      shatteredGroup.add(shard);
    }
    relayPoisonGroup.add(shatteredGroup);
    shatteredFlaskRef.current = shatteredGroup;

    // Spilled Cyanide Liquid Puddle on the workbench surface
    const puddleGeom = new THREE.CircleGeometry(0.35, 20);
    puddleGeom.rotateX(-Math.PI / 2);
    const puddle = new THREE.Mesh(
      puddleGeom,
      new THREE.MeshStandardMaterial({
        color: 0xe5a93c,
        roughness: 0.1,
        emissive: 0xd97706,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.85,
      })
    );
    puddle.position.set(0, 0.015, 0);
    puddle.scale.set(1.3, 1.0, 0.85);
    puddle.visible = false;
    relayPoisonGroup.add(puddle);
    poisonPoolRef.current = puddle;

    scene.add(relayPoisonGroup);

    // 11. Anatomically Credible Feline Model (Naturally Proportioned, Realistic Slate/Charcoal Coat)
    const catGroup = new THREE.Group();
    // Grounded firmly on the steel chamber floor, perfectly scaled relative to workbench & apparatus
    catGroup.position.set(1.15, groundPlaneY, 0.0);

    const createAnatomicalCat = (isDeadPose = false) => {
      const catSubGroup = new THREE.Group();

      // Rich warm scholarly amber ginger coat (expressive, charismatic, authentic feline)
      const furColor = isDeadPose ? 0x383e50 : 0xd97706;
      const furMat = new THREE.MeshStandardMaterial({
        color: furColor,
        roughness: 0.74,
        metalness: 0.04,
      });

      const chestBibMat = new THREE.MeshStandardMaterial({
        color: isDeadPose ? 0x64748b : 0xfef3c7,
        roughness: 0.76,
      });

      const innerEarMat = new THREE.MeshStandardMaterial({
        color: isDeadPose ? 0x475569 : 0xfbbf24,
        roughness: 0.65,
      });

      const noseMat = new THREE.MeshStandardMaterial({
        color: 0x181a24,
        roughness: 0.35,
      });

      const catEyeTex = createCatEyeTexture();

      if (!isDeadPose) {
        // ================= ALIVE POSE (Expressive, alert, charismatic domestic feline) =================

        // 1. Ribcage & Chest (Leaned forward with subtle breathing animation)
        const ribcage = new THREE.Mesh(new THREE.SphereGeometry(0.34, 22, 18), furMat);
        ribcage.scale.set(0.95, 1.25, 1.22);
        ribcage.position.set(0, 0.60, -0.04);
        ribcage.rotation.x = -0.18;
        ribcage.castShadow = true;
        ribcage.name = 'chest';
        catSubGroup.add(ribcage);

        // Warm Cream Bib on front chest
        const bib = new THREE.Mesh(new THREE.SphereGeometry(0.25, 18, 14), chestBibMat);
        bib.scale.set(0.68, 1.12, 0.52);
        bib.position.set(0, 0.56, 0.24);
        bib.rotation.x = -0.22;
        catSubGroup.add(bib);

        // 2. Muscular Flanks & Pelvis
        const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.36, 22, 18), furMat);
        pelvis.scale.set(1.08, 0.95, 1.15);
        pelvis.position.set(0, 0.34, -0.18);
        pelvis.castShadow = true;
        catSubGroup.add(pelvis);

        // 3. Folded Rear Thighs (Left and Right haunches)
        const thighL = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 14), furMat);
        thighL.scale.set(0.68, 1.18, 1.28);
        thighL.position.set(-0.30, 0.28, -0.14);
        thighL.castShadow = true;
        catSubGroup.add(thighL);

        const thighR = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 14), furMat);
        thighR.scale.set(0.68, 1.18, 1.28);
        thighR.position.set(0.30, 0.28, -0.14);
        thighR.castShadow = true;
        catSubGroup.add(thighR);

        // 4. Slender Front Forelegs & Sculpted Paws with Toe Pads
        const legGeom = new THREE.CylinderGeometry(0.068, 0.058, 0.50, 16);
        const legL = new THREE.Mesh(legGeom, furMat);
        legL.position.set(-0.15, 0.25, 0.25);
        legL.castShadow = true;
        catSubGroup.add(legL);

        const legR = new THREE.Mesh(legGeom, furMat);
        legR.position.set(0.15, 0.25, 0.25);
        legR.castShadow = true;
        catSubGroup.add(legR);

        // Paws
        const pawGeom = new THREE.SphereGeometry(0.088, 16, 12);
        pawGeom.scale(1.05, 0.65, 1.35);
        const pawL = new THREE.Mesh(pawGeom, furMat);
        pawL.position.set(-0.15, 0.04, 0.33);
        catSubGroup.add(pawL);

        const pawR = new THREE.Mesh(pawGeom, furMat);
        pawR.position.set(0.15, 0.04, 0.33);
        catSubGroup.add(pawR);

        // Individual Toe Pads
        const toeMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 });
        for (let t = -1; t <= 1; t++) {
          const toeL = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), toeMat);
          toeL.position.set(-0.15 + t * 0.032, 0.032, 0.41);
          catSubGroup.add(toeL);

          const toeR = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), toeMat);
          toeR.position.set(0.15 + t * 0.032, 0.032, 0.41);
          catSubGroup.add(toeR);
        }

        // 5. Cranium & Expressive Feline Facial Anatomy
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.06, 0.08); // Ear tips reach y ~ -0.96, head at y ~ -1.10
        headGroup.name = 'head';

        // Sculpted wedge-shaped cranium
        const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.28, 22, 18), furMat);
        cranium.scale.set(1.05, 0.94, 1.0);
        cranium.castShadow = true;
        headGroup.add(cranium);

        // Distinct Left and Right Whisker Cushions (Bilateral Muzzle Pads)
        const muzzleGeom = new THREE.SphereGeometry(0.095, 16, 14);
        muzzleGeom.scale(1.15, 0.9, 1.1);

        const muzzleL = new THREE.Mesh(muzzleGeom, furMat);
        muzzleL.position.set(-0.075, -0.07, 0.25);
        headGroup.add(muzzleL);

        const muzzleR = new THREE.Mesh(muzzleGeom, furMat);
        muzzleR.position.set(0.075, -0.07, 0.25);
        headGroup.add(muzzleR);

        // Rhinarium Nose Leather (Inverted triangle resting between whisker pads)
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.048, 3), noseMat);
        nose.rotation.x = Math.PI;
        nose.position.set(0, -0.035, 0.32);
        headGroup.add(nose);

        // Realistic Fine Whisker Filaments (3 on each side protruding gracefully)
        const whiskerMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb, transparent: true, opacity: 0.8 });
        for (let w = -1; w <= 1; w++) {
          const wL = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.08, -0.07 + w * 0.025, 0.27),
            new THREE.Vector3(-0.24, -0.08 + w * 0.035, 0.24),
            new THREE.Vector3(-0.38, -0.10 + w * 0.045, 0.18),
          ]);
          headGroup.add(new THREE.Mesh(new THREE.TubeGeometry(wL, 8, 0.0035, 4, false), whiskerMat));

          const wR = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.08, -0.07 + w * 0.025, 0.27),
            new THREE.Vector3(0.24, -0.08 + w * 0.035, 0.24),
            new THREE.Vector3(0.38, -0.10 + w * 0.045, 0.18),
          ]);
          headGroup.add(new THREE.Mesh(new THREE.TubeGeometry(wR, 8, 0.0035, 4, false), whiskerMat));
        }

        // Alert Feline Ears with Acoustic Inner Cavities
        const earGeom = new THREE.ConeGeometry(0.125, 0.25, 4);
        earGeom.scale(1.0, 1.0, 0.55);

        const earL = new THREE.Mesh(earGeom, furMat);
        earL.position.set(-0.16, 0.27, 0.02);
        earL.rotation.z = 0.22;
        earL.rotation.y = -0.18;
        headGroup.add(earL);

        const earR = new THREE.Mesh(earGeom, furMat);
        earR.position.set(0.16, 0.27, 0.02);
        earR.rotation.z = -0.22;
        earR.rotation.y = 0.18;
        headGroup.add(earR);

        const innerEarGeom = new THREE.ConeGeometry(0.085, 0.19, 4);
        innerEarGeom.scale(0.8, 1.0, 0.35);
        const innerEarL = new THREE.Mesh(innerEarGeom, innerEarMat);
        innerEarL.position.set(-0.15, 0.25, 0.05);
        innerEarL.rotation.z = 0.22;
        headGroup.add(innerEarL);

        const innerEarR = new THREE.Mesh(innerEarGeom, innerEarMat);
        innerEarR.position.set(0.15, 0.25, 0.05);
        innerEarR.rotation.z = -0.22;
        headGroup.add(innerEarR);

        // Expressive Almond Feline Eyes with Procedural Amber Iris & Slit Pupil Texture
        const eyeGeom = new THREE.SphereGeometry(0.075, 18, 18);
        const eyeMat = new THREE.MeshStandardMaterial({
          map: catEyeTex,
          roughness: 0.08,
          metalness: 0.15,
        });

        const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
        eyeL.position.set(-0.12, 0.035, 0.24);
        eyeL.rotation.y = -0.14;
        eyeL.rotation.z = 0.06;
        headGroup.add(eyeL);

        const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
        eyeR.position.set(0.12, 0.035, 0.24);
        eyeR.rotation.y = 0.14;
        eyeR.rotation.z = -0.06;
        headGroup.add(eyeR);

        catSubGroup.add(headGroup);

        // 6. Graceful Tail Curled Around Forepaws
        const tailCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0.18, -0.28),
          new THREE.Vector3(0.26, 0.11, -0.32),
          new THREE.Vector3(0.48, 0.06, -0.06),
          new THREE.Vector3(0.40, 0.05, 0.34),
          new THREE.Vector3(0.19, 0.07, 0.46),
        ]);
        const tailMesh = new THREE.Mesh(
          new THREE.TubeGeometry(tailCurve, 28, 0.058, 10, false),
          furMat
        );
        tailMesh.name = 'tail';
        catSubGroup.add(tailMesh);
      } else {
        // ================= DEAD / COLLAPSED POSE (Resting peacefully on the chamber floor) =================

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 16), furMat);
        body.scale.set(1.35, 0.75, 0.95);
        body.position.set(-0.12, 0.2, 0);
        body.rotation.z = 0.06;
        body.castShadow = true;
        catSubGroup.add(body);

        const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 16), furMat);
        pelvis.scale.set(1.1, 0.7, 0.9);
        pelvis.position.set(0.38, 0.18, -0.04);
        catSubGroup.add(pelvis);

        // Reclined Head resting on the floor
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 16), furMat);
        head.scale.set(1.05, 0.85, 0.95);
        head.position.set(-0.62, 0.15, 0.08);
        head.rotation.z = -0.2;
        catSubGroup.add(head);

        const earL = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.20, 4), furMat);
        earL.position.set(-0.76, 0.28, 0.12);
        earL.rotation.z = -0.35;
        catSubGroup.add(earL);

        // Limp relaxed paws
        const paw1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.34, 6, 10), furMat);
        paw1.rotation.z = Math.PI / 2.5;
        paw1.position.set(-0.25, 0.07, 0.28);
        catSubGroup.add(paw1);

        const paw2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.34, 6, 10), furMat);
        paw2.rotation.z = Math.PI / 2.8;
        paw2.position.set(0.24, 0.07, 0.28);
        catSubGroup.add(paw2);

        // Closed eyelid slits (peaceful repose)
        const closedEye = new THREE.Mesh(
          new THREE.BoxGeometry(0.09, 0.016, 0.016),
          new THREE.MeshBasicMaterial({ color: 0x1e2230 })
        );
        closedEye.position.set(-0.6, 0.16, 0.3);
        closedEye.rotation.z = -0.15;
        catSubGroup.add(closedEye);

        // Limp Tail on the floor
        const tailCurveDead = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.65, 0.1, -0.04),
          new THREE.Vector3(0.88, 0.05, 0.08),
          new THREE.Vector3(0.96, 0.04, 0.28),
        ]);
        const tailDead = new THREE.Mesh(
          new THREE.TubeGeometry(tailCurveDead, 18, 0.052, 8, false),
          furMat
        );
        catSubGroup.add(tailDead);
      }

      return catSubGroup;
    };

    const aliveMesh = createAnatomicalCat(false);
    const deadMesh = createAnatomicalCat(true);
    catGroup.add(aliveMesh);
    catGroup.add(deadMesh);

    catAliveMeshRef.current = aliveMesh;
    catDeadMeshRef.current = deadMesh;
    catGroupRef.current = catGroup;
    scene.add(catGroup);

    // 12. Animation Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Subtle pulse and tumble on uranium crystal
      if (coreMeshRef.current) {
        coreMeshRef.current.rotation.y += delta * 0.9;
        coreMeshRef.current.rotation.x += delta * 0.6;
      }

      // Stream ionization sparks straight from collimator into Geiger sensing tube window
      if (sparksRef.current) {
        const positions = sparksRef.current.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += delta * 0.55;
          if (positions[i] > -1.5) {
            positions[i] = -1.82 + Math.random() * 0.06;
            positions[i + 1] = tableTopY + 0.26 + (Math.random() - 0.5) * 0.1;
            positions[i + 2] = -0.1 + (Math.random() - 0.5) * 0.1;
          }
        }
        sparksRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Living Feline Breathing & Gentle Tail Flick Animation
      if (catAliveMeshRef.current && catAliveMeshRef.current.visible) {
        const chest = catAliveMeshRef.current.getObjectByName('chest');
        if (chest) {
          const breath = 1.0 + Math.sin(time * 2.6) * 0.022;
          chest.scale.set(0.92 * breath, 1.22 * breath, 1.18 * breath);
        }

        const tail = catAliveMeshRef.current.getObjectByName('tail');
        if (tail) {
          tail.rotation.y = Math.sin(time * 2.5) * 0.12;
          tail.rotation.z = Math.cos(time * 1.3) * 0.04;
        }

        const head = catAliveMeshRef.current.getObjectByName('head');
        if (head) {
          head.rotation.y = Math.sin(time * 0.7) * 0.06;
          head.rotation.z = Math.cos(time * 1.0) * 0.025;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // 12. Pointer Controls for Camera Orbit
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
          cameraAngleRef.current.radius = Math.max(6, Math.min(20, initialPinchRadius * ratio));
          updateCameraPos();
        }
        return;
      }

      if (isDraggingRef.current && activePointers.size === 1) {
        const dx = e.clientX - prevPointerRef.current.x;
        const dy = e.clientY - prevPointerRef.current.y;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };

        cameraAngleRef.current.theta -= dx * 0.008;
        cameraAngleRef.current.phi = Math.max(-0.1, Math.min(0.85, cameraAngleRef.current.phi + dy * 0.008));
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
      cameraAngleRef.current.radius = Math.max(6, Math.min(20, cameraAngleRef.current.radius + e.deltaY * 0.015));
      updateCameraPos();
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('pointercancel', onPointerCancel);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 480;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('pointercancel', onPointerCancel);
      dom.removeEventListener('wheel', onWheel);
      if (container && renderer.domElement) {
        container.innerHTML = '';
      }
      renderer.dispose();
    };
  }, []);

  // Update Visuals based on Box State & X-Ray Mode
  useEffect(() => {
    // 1. Chamber Wall Opacity (Solid vs. X-Ray Quantum Peeking)
    if (chamberWallsRef.current) {
      chamberWallsRef.current.forEach((mesh) => {
        mesh.material.opacity = xrayMode ? 0.15 : 1.0;
        mesh.material.depthWrite = !xrayMode;
        mesh.material.needsUpdate = true;
      });
    }

    // 2. Door Open Angle & Decal Opacity
    if (doorGroupRef.current) {
      if (boxState === 'sealed') {
        doorGroupRef.current.rotation.y = 0; // Closed
      } else if (boxState === 'measuring') {
        doorGroupRef.current.rotation.y = Math.PI * 0.4; // Half open unlatching
      } else {
        doorGroupRef.current.rotation.y = Math.PI * 0.92; // Fully swung open flush against side wall
      }

      doorGroupRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity = xrayMode ? 0.15 : 1.0;
          child.material.depthWrite = !xrayMode;
          child.material.needsUpdate = true;
        }
      });
    }

    // 3. Superposition vs Collapsed Cat Visualization
    if (catAliveMeshRef.current && catDeadMeshRef.current) {
      if (boxState === 'sealed' || boxState === 'measuring') {
        // In Superposition: Alive cat is primary, phantom dead pose visible in X-Ray mode
        catAliveMeshRef.current.visible = true;
        catDeadMeshRef.current.visible = xrayMode;
        catAliveMeshRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = xrayMode ? 0.65 : 1.0;
          }
        });
        catDeadMeshRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = 0.45;
          }
        });
        // Intact flask, cocked hammer
        if (hammerRef.current) hammerRef.current.rotation.z = -Math.PI * 0.35;
        if (intactFlaskRef.current) intactFlaskRef.current.visible = true;
        if (shatteredFlaskRef.current) shatteredFlaskRef.current.visible = false;
        if (poisonPoolRef.current) poisonPoolRef.current.visible = false;
      } else if (boxState === 'alive') {
        // Collapsed ALIVE: Cat fully solid, breathing happily, hammer cocked safely
        catAliveMeshRef.current.visible = true;
        catDeadMeshRef.current.visible = false;
        catAliveMeshRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
        });
        if (hammerRef.current) hammerRef.current.rotation.z = -Math.PI * 0.35;
        if (intactFlaskRef.current) intactFlaskRef.current.visible = true;
        if (shatteredFlaskRef.current) shatteredFlaskRef.current.visible = false;
        if (poisonPoolRef.current) poisonPoolRef.current.visible = false;
      } else if (boxState === 'dead') {
        // Collapsed DEAD: Cat in resting ground state, hammer struck, flask shattered, cyanide pooled
        catAliveMeshRef.current.visible = false;
        catDeadMeshRef.current.visible = true;
        catDeadMeshRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
        });
        if (hammerRef.current) hammerRef.current.rotation.z = 0; // Struck down
        if (intactFlaskRef.current) intactFlaskRef.current.visible = false;
        if (shatteredFlaskRef.current) shatteredFlaskRef.current.visible = true;
        if (poisonPoolRef.current) poisonPoolRef.current.visible = true;
      }
    }
  }, [boxState, xrayMode]);

  // Handle Measurement Trigger (Open Chamber)
  const handleMeasure = () => {
    if (boxState !== 'sealed') return;
    playLatchSound();
    setBoxState('measuring');

    setTimeout(() => {
      const roll = Math.random();
      const isAlive = roll > decayProb;

      setBoxState(isAlive ? 'alive' : 'dead');
      setTrials((prev) => ({
        total: prev.total + 1,
        alive: prev.alive + (isAlive ? 1 : 0),
        dead: prev.dead + (!isAlive ? 1 : 0),
      }));

      if (!isAlive) {
        playGeigerClick();
      }
    }, 900);
  };

  // Reset Experiment to Sealed Superposition
  const handleReset = () => {
    playLatchSound();
    setBoxState('sealed');
  };

  // Reset Camera Viewport to Default Front Perspective
  const handleResetCamera = () => {
    cameraAngleRef.current = { theta: 0.35, phi: 0.22, radius: 13.5 };
    if (updateCameraPosRef.current) {
      updateCameraPosRef.current();
    }
  };

  // Keyboard Shortcuts (Space to measure/reseal, R to reset, X for X-Ray)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (boxState === 'sealed') {
          handleMeasure();
        } else if (boxState === 'alive' || boxState === 'dead') {
          handleReset();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      } else if (e.code === 'KeyX') {
        e.preventDefault();
        setXrayMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [boxState, decayProb]);

  return (
    <div className={styles.container}>
      {/* Simulation Header */}
      <div className={styles.header}>
        <div className={styles.tagline}>Quantum Thought Experiment Lab</div>
        <h2 className={styles.title}>Schrödinger's Cat 3D Chamber</h2>
        <p className={styles.subtitle}>
          Rotate the 3D chamber, configure the radioactive decay half-life, peek inside via X-Ray superposition, and trigger observation to collapse the wave function.
        </p>
      </div>

      {/* Main 3D Viewport & HUD Overlay */}
      <div className={styles.viewportWrapper}>
        <div ref={mountRef} className={styles.canvasContainer} />

        {/* 3D Viewport Hint & Camera Reset */}
        <div className={styles.cameraHint}>
          <Icon name="compass" size={13} />
          <span>Drag to rotate • Scroll to zoom</span>
          <button
            type="button"
            className={styles.resetCamBtn}
            onClick={handleResetCamera}
            title="Reset camera to default front view"
          >
            <Icon name="rotate-ccw" size={11} />
            <span>Reset View</span>
          </button>
        </div>

        {/* Live Quantum State Badge HUD */}
        <div className={styles.statusHud}>
          <div className={styles.statusLabel}>CHAMBER STATE:</div>
          <div className={`${styles.statusValue} ${styles[boxState]}`}>
            {boxState === 'sealed' && 'SUPERPOSITION | |Ψ⟩ = α|Alive⟩ + β|Dead⟩'}
            {boxState === 'measuring' && 'DECOHERENCE COLLAPSING...'}
            {boxState === 'alive' && 'MEASURED: ALIVE (Eigenstate |1⟩)'}
            {boxState === 'dead' && 'MEASURED: COLLAPSED (Eigenstate |0⟩)'}
          </div>
        </div>

        {/* Experiment Guide HUD (Collapsible) */}
        <div className={styles.instructionCard}>
          <div className={styles.instructionHeader}>
            <div className={styles.instructionTitle}>
              <Icon name="help-circle" size={13} />
              <span>Experiment Guide</span>
            </div>
            <button
              type="button"
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
                <span><strong>Quantum Superposition:</strong> Click <span className={styles.keyBadge}>Quantum X-Ray</span> or press <span className={styles.keyBadge}>X</span> to view the cat inside the sealed chamber in uncollapsed state <span className={styles.keyBadge}>|Ψ⟩ = α|Alive⟩ + β|Dead⟩</span>.</span>
              </li>
              <li>
                <span>2.</span>
                <span><strong>Decay Probability:</strong> Adjust <strong>Exposure Time</strong> (<span className={styles.keyBadge}>1m – 90m</span>). Longer duration exponentially increases decay likelihood from 10% to 87%.</span>
              </li>
              <li>
                <span>3.</span>
                <span><strong>Force Wave Collapse:</strong> Click <strong>Open Chamber (Measure)</strong> or press <span className={styles.keyBadge}>Space</span>. The wave function decoheres into a classical eigenstate (Alive vs Collapsed).</span>
              </li>
              <li>
                <span>4.</span>
                <span><strong>Multiverse Branching:</strong> Switch interpretation to <strong>Many-Worlds</strong> to inspect the alternate parallel universe where the opposite outcome occurred. Press <span className={styles.keyBadge}>R</span> to reseal.</span>
              </li>
            </ul>
          )}
        </div>

        {/* Quick Viewport Controls */}
        <div className={styles.viewportControls}>
          <button
            className={`${styles.viewBtn} ${xrayMode ? styles.activeViewBtn : ''}`}
            onClick={() => setXrayMode(!xrayMode)}
            title="Toggle Quantum Peeking (X-Ray view into sealed superposition)"
          >
            <Icon name={xrayMode ? 'eye-off' : 'eye'} size={14} />
            <span>{xrayMode ? 'Solid Chamber' : 'Quantum X-Ray View'}</span>
          </button>

          <button
            className={`${styles.viewBtn} ${audioEnabled ? styles.activeViewBtn : ''}`}
            onClick={() => setAudioEnabled(!audioEnabled)}
            title="Toggle Geiger Counter Clicks"
          >
            <Icon name={audioEnabled ? 'volume-2' : 'volume-x'} size={14} />
            <span>{audioEnabled ? 'Geiger Audio ON' : 'Mute Geiger'}</span>
          </button>
        </div>
      </div>

      {/* Many-Worlds Multiverse Branch View */}
      {interpretation === 'many-worlds' && (boxState === 'alive' || boxState === 'dead') && (
        <div className={styles.manyWorldsBanner}>
          <div className={styles.branchHeader}>
            <Icon name="network" size={18} />
            <span>Everett Many-Worlds Branch Detected</span>
          </div>
          <div className={styles.branchesGrid}>
            <div className={`${styles.branchCard} ${boxState === 'alive' ? styles.activeBranch : ''}`}>
              <div className={styles.branchTitle}>Universe Branch α (Your Observation)</div>
              <div className={styles.branchOutcome}>Cat is ALIVE</div>
              <p className={styles.branchDesc}>The radioactive isotope did not decay. The observer entangles with the living timeline.</p>
            </div>
            <div className={`${styles.branchCard} ${boxState === 'dead' ? styles.activeBranch : ''}`}>
              <div className={styles.branchTitle}>Universe Branch β (Parallel Reality)</div>
              <div className={styles.branchOutcome}>Cat is COLLAPSED</div>
              <p className={styles.branchDesc}>In an identical parallel universe, the hammer tripped. Both realities exist simultaneously.</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Controls & Telemetry Dashboard */}
      <div className={styles.dashboard}>
        {/* Left Column: Experiment Controls */}
        <div className={styles.controlPanel}>
          <h4 className={styles.panelTitle}>Chamber Controls</h4>

          {/* Primary Action Button */}
          <div className={styles.primaryActionRow}>
            {boxState === 'sealed' ? (
              <Button size="lg" variant="primary" onClick={handleMeasure} className={styles.actionBtn}>
                <Icon name="eye" size={18} />
                <span>Open Chamber (Measure)</span>
              </Button>
            ) : (
              <Button size="lg" variant="secondary" onClick={handleReset} disabled={boxState === 'measuring'} className={styles.actionBtn}>
                <Icon name="rotate-ccw" size={18} />
                <span>Reseal Chamber (Reset Superposition)</span>
              </Button>
            )}
          </div>

          {/* Half-life Elapsed Time Slider */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabelRow}>
              <span>Elapsed Exposure Time: <strong>{elapsedMinutes} mins</strong></span>
              <span className={styles.halfLifeNotice}>Half-Life: {halfLife}m</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={elapsedMinutes}
              disabled={boxState !== 'sealed'}
              onChange={(e) => setElapsedMinutes(Number(e.target.value))}
              className={styles.timeSlider}
            />
            <div className={styles.sliderScale}>
              <span>0m (100% Alive)</span>
              <span>30m (50/50)</span>
              <span>90m (87% Decayed)</span>
            </div>
          </div>

          {/* Interpretation Switcher */}
          <div className={styles.interpretationRow}>
            <div className={styles.controlLabel}>Quantum Interpretation:</div>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${interpretation === 'copenhagen' ? styles.toggleActive : ''}`}
                onClick={() => setInterpretation('copenhagen')}
              >
                Copenhagen Collapse
              </button>
              <button
                className={`${styles.toggleBtn} ${interpretation === 'many-worlds' ? styles.toggleActive : ''}`}
                onClick={() => setInterpretation('many-worlds')}
              >
                Many-Worlds (Multiverse)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Quantum Probability & Telemetry HUD */}
        <div className={styles.telemetryPanel}>
          <h4 className={styles.panelTitle}>Quantum Telemetry</h4>

          {/* Probability Bar */}
          <div className={styles.probGauge}>
            <div className={styles.gaugeHeader}>
              <span>Wave Amplitude |ψ|²</span>
              <span>P(Alive): {(aliveProb * 100).toFixed(1)}% | P(Dead): {(decayProb * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.gaugeTrack}>
              <div className={styles.gaugeAlive} style={{ width: `${aliveProb * 100}%` }} />
              <div className={styles.gaugeDead} style={{ width: `${decayProb * 100}%` }} />
            </div>
          </div>

          {/* Apparatus Telemetry Grid */}
          <div className={styles.telemetryGrid}>
            <div className={styles.telemetryCard}>
              <div className={styles.telemetryNum}>{(decayProb * 100).toFixed(0)}%</div>
              <div className={styles.telemetryLabel}>Decay Probability</div>
            </div>
            <div className={styles.telemetryCard}>
              <div className={styles.telemetryNum}>{trials.total}</div>
              <div className={styles.telemetryLabel}>Total Runs Tested</div>
            </div>
            <div className={styles.telemetryCard}>
              <div className={styles.telemetryNum}>{trials.alive}</div>
              <div className={styles.telemetryLabel}>Alive Outcomes</div>
            </div>
            <div className={styles.telemetryCard}>
              <div className={styles.telemetryNum}>{trials.dead}</div>
              <div className={styles.telemetryLabel}>Dead Outcomes</div>
            </div>
          </div>

          {/* Empirical vs Theoretical Ratio */}
          {trials.total > 0 && (
            <div className={styles.empiricalStat}>
              <span>Empirical Observed Ratio: <strong>{((trials.alive / trials.total) * 100).toFixed(1)}% Alive</strong></span>
              <span className={styles.lawNotice}>(Converges with higher N trials)</span>
            </div>
          )}
        </div>
      </div>

      {/* Educational Pedagogical Takeaway */}
      <div className={styles.pedagogyCard}>
        <div className={styles.pedagogyHeader}>
          <Icon name="compass" size={16} />
          <span>Why Schrödinger Proposed This Paradox</span>
        </div>
        <p>
          Erwin Schrödinger did not write this thought experiment because he believed macroscopic cats could actually be alive and dead at the same time. He constructed it to highlight what he considered the <strong>fundamental absurdity</strong> of the Copenhagen Interpretation: if subatomic particles genuinely stay in indefinite superpositions, when exactly does quantum indefiniteness stop and macroscopic reality begin?
        </p>
      </div>
    </div>
  );
}
