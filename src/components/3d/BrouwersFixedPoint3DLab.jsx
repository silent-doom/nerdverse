'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Icon from '@/components/common/Icon';
import VisualizationGuideHUD from '@/components/interactive/VisualizationGuideHUD';
import styles from './BrouwersFixedPoint3DLab.module.css';

// Audio Synthesizer for Topological Chimes & Fluid Swirl Resonances
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

  playSwirl(frequency = 180, duration = 0.3) {
    if (this.isMuted || !this.ctx) return;
    const nowMs = performance.now();
    if (nowMs - this.lastPlay < 80) return;
    this.lastPlay = nowMs;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + duration);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.linearRampToValueAtTime(frequency * 0.7, now + duration);

      gain.gain.setValueAtTime(0.08, now);
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

  playChime(frequency = 659.25, duration = 0.25) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio suppression fallback
    }
  }
}

const audioEngine = new BrouwerAudioEngine();

export default function BrouwersFixedPoint3DLab() {
  const mountRef = useRef(null);

  // Active Lab Mode: 'coffee' (Fluid Vortex) | 'map' (Crumpled Map Invariant)
  const [activeMode, setActiveMode] = useState('coffee');

  // Mode 1: Coffee Cup Stir Controls
  const [stirSpeed, setStirSpeed] = useState(45); // RPM: 0 to 120
  const [vortexEccentricityX, setVortexEccentricityX] = useState(0.0); // -0.8 to 0.8
  const [vortexEccentricityY, setVortexEccentricityY] = useState(0.0); // -0.8 to 0.8
  const [viscosity, setViscosity] = useState('medium'); // 'low' | 'medium' | 'high'
  const [showVectors, setShowVectors] = useState(true);

  // Mode 2: Crumpled Map Invariant Controls
  const [crumpleIntensity, setCrumpleIntensity] = useState(65); // 0 to 100%
  const [mapRotation, setMapRotation] = useState(35); // 0 to 360 degrees
  const [compressionScale, setCompressionScale] = useState(75); // 50 to 95%
  const [showLaserBeam, setShowLaserBeam] = useState(true);

  // General Simulation State
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);

  // Three.js References
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Mesh Groups
  const coffeeGroupRef = useRef(null);
  const mapGroupRef = useRef(null);
  const tracerParticlesRef = useRef(null);
  const liquidSurfaceRef = useRef(null);
  const vectorArrowsRef = useRef([]);
  const fixedPointBeaconRef = useRef(null);
  const crumpledMeshRef = useRef(null);
  const laserBeamRef = useRef(null);

  // Telemetry Metrics
  const [telemetry, setTelemetry] = useState({
    fixedPointX: 0.0,
    fixedPointY: 0.0,
    fixedPointZ: 0.8,
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

  // Trigger Stir Fluid Grid (Challenge 1 action)
  const handleStirAction = useCallback(() => {
    audioEngine.init();
    audioEngine.playSwirl(240, 0.5);
    setStirSpeed((prev) => Math.min(prev + 30, 110));
    setVortexEccentricityX((Math.random() - 0.5) * 0.9);
    setVortexEccentricityY((Math.random() - 0.5) * 0.9);
  }, []);

  // Trigger Crumple Coordinate Map (Challenge 2 action)
  const handleCrumpleAction = useCallback(() => {
    audioEngine.init();
    audioEngine.playChime(784, 0.3);
    setCrumpleIntensity((prev) => (prev > 80 ? 25 : prev + 25));
    setMapRotation((prev) => (prev + 45) % 360);
  }, []);

  // Three.js Scene Initialization
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 5.5, 6.8);
    cameraRef.current = camera;

    // 3. Renderer
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
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going beneath studio table
    controls.minDistance = 3.5;
    controls.maxDistance = 15;
    controls.target.set(0, 0.4, 0);
    controlsRef.current = controls;

    // 5. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    mainKeyLight.position.set(5, 10, 6);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    scene.add(mainKeyLight);

    const softFillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    softFillLight.position.set(-6, 4, -4);
    scene.add(softFillLight);

    const bottomRimLight = new THREE.PointLight(0xeab308, 0.8, 10);
    bottomRimLight.position.set(0, -1, 3);
    scene.add(bottomRimLight);

    // Studio Table Surface
    const tableGeo = new THREE.CylinderGeometry(4.8, 4.8, 0.15, 64);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x11131a,
      roughness: 0.85,
      metalness: 0.1,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = -1.5;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // ─────────────────────────────────────────────────────────────
    // 6. BUILD MODE 1: COFFEE CUP & FLUID VORTEX
    // ─────────────────────────────────────────────────────────────
    const coffeeGroup = new THREE.Group();
    coffeeGroupRef.current = coffeeGroup;
    scene.add(coffeeGroup);

    // Ceramic Porcelain Mug Body
    const mugOuterGeo = new THREE.CylinderGeometry(1.85, 1.45, 2.6, 48, 1, false);
    const porcelainMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e222d,
      roughness: 0.15,
      metalness: 0.05,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });
    const mugMesh = new THREE.Mesh(mugOuterGeo, porcelainMat);
    mugMesh.position.y = -0.15;
    mugMesh.castShadow = true;
    mugMesh.receiveShadow = true;
    coffeeGroup.add(mugMesh);

    // Mug Rim Accent Ring (Golden Scholar Brass)
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

    // Ceramic Handle (Smooth Ergonomic Loop)
    const handleGeo = new THREE.TorusGeometry(0.9, 0.16, 16, 36, Math.PI * 0.95);
    const handleMesh = new THREE.Mesh(handleGeo, porcelainMat);
    handleMesh.position.set(1.8, -0.15, 0);
    handleMesh.rotation.z = -Math.PI / 2 + 0.15;
    handleMesh.castShadow = true;
    coffeeGroup.add(handleMesh);

    // Coffee Liquid Interior Surface
    const liquidGeo = new THREE.PlaneGeometry(3.3, 3.3, 40, 40);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0x24140a,
      roughness: 0.12,
      metalness: 0.1,
      transmission: 0.25,
      ior: 1.34,
      clearcoat: 1.0,
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.rotation.x = -Math.PI / 2;
    liquidMesh.position.y = 0.85;
    liquidSurfaceRef.current = liquidMesh;
    coffeeGroup.add(liquidMesh);

    // Swirling Tracer Particles (Coffee Crema & Ground Flecks)
    const particleCount = 450;
    const tracerGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const radii = new Float32Array(particleCount);
    const angles = new Float32Array(particleCount);
    const depths = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const r = 0.1 + Math.sqrt(Math.random()) * 1.45;
      const theta = Math.random() * Math.PI * 2;
      const d = (Math.random() - 0.5) * 0.15;

      radii[i] = r;
      angles[i] = theta;
      depths[i] = d;

      positions[i * 3 + 0] = Math.cos(theta) * r;
      positions[i * 3 + 1] = 0.86 + d;
      positions[i * 3 + 2] = Math.sin(theta) * r;
    }

    tracerGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const tracerMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.05,
      transparent: true,
      opacity: 0.85,
    });
    const tracerPoints = new THREE.Points(tracerGeo, tracerMat);
    tracerParticlesRef.current = { points: tracerPoints, radii, angles, depths };
    coffeeGroup.add(tracerPoints);

    // Vector Flow Arrows (Instanced Velocity Flow Arrows)
    const vectorArrowGroup = new THREE.Group();
    const arrowCount = 28;
    const arrowHelpers = [];
    const dir = new THREE.Vector3(1, 0, 0);
    const origin = new THREE.Vector3(0, 0.88, 0);

    for (let i = 0; i < arrowCount; i++) {
      const r = 0.4 + (i / arrowCount) * 1.1;
      const angle = (i * 1.37) % (Math.PI * 2);
      const px = Math.cos(angle) * r;
      const pz = Math.sin(angle) * r;
      const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)).normalize();

      const arrow = new THREE.ArrowHelper(tangent, new THREE.Vector3(px, 0.88, pz), 0.22, 0x38bdf8, 0.08, 0.05);
      arrow.line.material.transparent = true;
      arrow.line.material.opacity = 0.7;
      arrowHelpers.push({ arrow, r, angle, baseTangent: tangent });
      vectorArrowGroup.add(arrow);
    }
    vectorArrowsRef.current = arrowHelpers;
    coffeeGroup.add(vectorArrowGroup);

    // Fixed Point Marker (Brouwer Invariant Beacon)
    const fixedBeaconGroup = new THREE.Group();
    fixedPointBeaconRef.current = fixedBeaconGroup;

    // Outer Target Rings
    const ringGeo1 = new THREE.RingGeometry(0.12, 0.16, 32);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2;
    fixedBeaconGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(0.24, 0.27, 32);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xeab308, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2;
    fixedBeaconGroup.add(ring2);

    // Vertical Reticle Needle
    const needleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 16);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.y = 0.3;
    fixedBeaconGroup.add(needle);

    // Center Core Node (Zero-Displacement Molecule)
    const coreGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const coreNode = new THREE.Mesh(coreGeo, coreMat);
    fixedBeaconGroup.add(coreNode);

    fixedBeaconGroup.position.set(0, 0.86, 0);
    coffeeGroup.add(fixedBeaconGroup);

    // ─────────────────────────────────────────────────────────────
    // 7. BUILD MODE 2: CRUMPLED MAP PARADOX
    // ─────────────────────────────────────────────────────────────
    const mapGroup = new THREE.Group();
    mapGroupRef.current = mapGroup;
    scene.add(mapGroup);
    mapGroup.visible = false; // Initially hidden

    // Bottom Reference Map (Flat Coordinate Grid)
    const refMapGeo = new THREE.PlaneGeometry(3.6, 3.6, 24, 24);
    const refMapMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: false,
    });
    const refMapMesh = new THREE.Mesh(refMapGeo, refMapMat);
    refMapMesh.rotation.x = -Math.PI / 2;
    refMapMesh.position.y = -0.8;
    refMapMesh.receiveShadow = true;
    mapGroup.add(refMapMesh);

    // Reference Grid Lines
    const gridHelper = new THREE.GridHelper(3.6, 18, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -0.79;
    mapGroup.add(gridHelper);

    // Top Crumpled Map (Deformed Topological Sheet)
    const crumpleGeo = new THREE.PlaneGeometry(3.4, 3.4, 48, 48);
    const crumpleMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.65,
      metalness: 0.1,
      side: THREE.DoubleSide,
      flatShading: true,
    });
    const crumpledMesh = new THREE.Mesh(crumpleGeo, crumpleMat);
    crumpledMesh.rotation.x = -Math.PI / 2;
    crumpledMesh.position.y = 0.6;
    crumpledMesh.castShadow = true;
    crumpledMeshRef.current = crumpledMesh;
    mapGroup.add(crumpledMesh);

    // Laser Invariant Beam (Vertical Ray Penetrating Identical Coordinate)
    const laserGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.45, 16);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.position.set(0.25, -0.08, 0.15);
    laserBeamRef.current = laserBeam;
    mapGroup.add(laserBeam);

    // Reticle Targets for Map (Top and Bottom)
    const mapTargetGeo = new THREE.RingGeometry(0.08, 0.12, 24);
    const mapTargetMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });

    const topTarget = new THREE.Mesh(mapTargetGeo, mapTargetMat);
    topTarget.rotation.x = Math.PI / 2;
    topTarget.position.set(0.25, 0.65, 0.15);
    mapGroup.add(topTarget);

    const bottomTarget = new THREE.Mesh(mapTargetGeo, mapTargetMat);
    bottomTarget.rotation.x = Math.PI / 2;
    bottomTarget.position.set(0.25, -0.78, 0.15);
    mapGroup.add(bottomTarget);

    // ─────────────────────────────────────────────────────────────
    // 8. ANIMATION RENDER LOOP
    // ─────────────────────────────────────────────────────────────
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();

      // Mode 1: Coffee Cup Dynamics
      if (coffeeGroup.visible) {
        const radPerSec = (stirSpeed / 60) * Math.PI * 2;

        // Dynamic vortex offset
        const vx = vortexEccentricityX;
        const vz = vortexEccentricityY;
        const vortexDepth = (stirSpeed / 120) * 0.45;

        // Update Liquid Surface Vertex Depression
        if (liquidSurfaceRef.current) {
          const posAttr = liquidSurfaceRef.current.geometry.attributes.position;
          for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            const distSq = (x - vx) ** 2 + (y - vz) ** 2;
            const dip = -vortexDepth * Math.exp(-distSq / 0.8);
            posAttr.setZ(i, dip);
          }
          posAttr.needsUpdate = true;
        }

        // Update Swirling Tracer Particles
        if (tracerParticlesRef.current) {
          const { points, radii, angles, depths } = tracerParticlesRef.current;
          const posAttr = points.geometry.attributes.position;

          for (let i = 0; i < radii.length; i++) {
            // Speed decreases slightly near edge due to friction
            const r = radii[i];
            const speedFactor = Math.max(0.2, 1.2 - r * 0.5);
            angles[i] += radPerSec * delta * speedFactor;

            const px = vx + Math.cos(angles[i]) * r;
            const pz = vz + Math.sin(angles[i]) * r;

            // Restrict within cup inner radius (~1.65)
            const cupDist = Math.sqrt(px * px + pz * pz);
            let finalX = px;
            let finalZ = pz;
            if (cupDist > 1.62) {
              finalX = (px / cupDist) * 1.62;
              finalZ = (pz / cupDist) * 1.62;
            }

            const distToVortex = Math.sqrt((finalX - vx) ** 2 + (finalZ - vz) ** 2);
            const finalY = 0.86 + depths[i] - vortexDepth * Math.exp(-(distToVortex ** 2) / 0.8);

            posAttr.setXYZ(i, finalX, finalY, finalZ);
          }
          posAttr.needsUpdate = true;
        }

        // Update Fixed Point Beacon Location and Pulse
        if (fixedPointBeaconRef.current) {
          const beaconY = 0.86 - vortexDepth;
          fixedPointBeaconRef.current.position.set(vx, beaconY, vz);

          // Pulse expansion of outer ring
          const scale = 1 + Math.sin(elapsed * 4) * 0.15;
          fixedPointBeaconRef.current.children[1].scale.set(scale, scale, 1);
        }

        // Telemetry Update for Coffee Mode
        setTelemetry({
          fixedPointX: vx.toFixed(3),
          fixedPointY: vz.toFixed(3),
          fixedPointZ: (0.86 - vortexDepth).toFixed(3),
          residualError: '0.00000000',
          velocityAtPoint: '0.0000 mm/s',
          domainStatus: 'Compact Convex K ⊂ ℝ³',
          topologicalInvariant: 'f(x*) = x*',
        });
      }

      // Mode 2: Crumpled Map Dynamics
      if (mapGroup.visible && crumpledMeshRef.current) {
        const rotRad = (mapRotation * Math.PI) / 180;
        const scaleFactor = compressionScale / 100;
        const intensity = crumpleIntensity / 100;

        const posAttr = crumpledMeshRef.current.geometry.attributes.position;
        // Theoretical fixed coordinate for affine compression + rotation
        // Contraction mapping theorem ensures unique fixed point
        const targetU = 0.25 * (1 - scaleFactor);
        const targetV = 0.15 * (1 - scaleFactor);

        for (let i = 0; i < posAttr.count; i++) {
          const u = posAttr.getX(i);
          const v = posAttr.getY(i);

          // Complex multi-frequency crumpling wrinkles
          const wrinkle =
            Math.sin(u * 5 + rotRad) * Math.cos(v * 6) * 0.25 * intensity +
            Math.sin(u * 12) * Math.sin(v * 10) * 0.12 * intensity +
            Math.cos((u + v) * 8 + elapsed * 0.5) * 0.08 * intensity;

          posAttr.setZ(i, wrinkle);
        }
        posAttr.needsUpdate = true;

        crumpledMeshRef.current.rotation.z = rotRad;
        crumpledMeshRef.current.scale.set(scaleFactor, scaleFactor, 1);

        // Position of Invariant Point
        const fixedX = targetU;
        const fixedZ = targetV;

        if (laserBeamRef.current) {
          laserBeamRef.current.position.x = fixedX;
          laserBeamRef.current.position.z = fixedZ;
        }

        setTelemetry({
          fixedPointX: fixedX.toFixed(3),
          fixedPointY: fixedZ.toFixed(3),
          fixedPointZ: (0.6).toFixed(3),
          residualError: '0.00000000',
          velocityAtPoint: '|f(x) - x| = 0',
          domainStatus: 'Contracted Disk D² ⊂ ℝ²',
          topologicalInvariant: 'x* = f(x*)',
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
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

  // Mode Switcher Effect
  useEffect(() => {
    if (!coffeeGroupRef.current || !mapGroupRef.current) return;
    if (activeMode === 'coffee') {
      coffeeGroupRef.current.visible = true;
      mapGroupRef.current.visible = false;
      if (cameraRef.current) cameraRef.current.position.set(0, 5.5, 6.8);
    } else {
      coffeeGroupRef.current.visible = false;
      mapGroupRef.current.visible = true;
      if (cameraRef.current) cameraRef.current.position.set(0, 4.8, 5.8);
    }
  }, [activeMode]);

  // Vector Visibility Effect
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

      {/* Top Header Mode Switcher & Utilities */}
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

      {/* Floating Telemetry & Mathematical HUD */}
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
            <span className={styles.hudLabel}>Residual |f(x*) - x*|</span>
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
          <strong>Brouwer&apos;s Theorem:</strong> Any continuous mapping{' '}
          <code>f: K → K</code> on compact convex set <code>K</code> possesses at least one point where{' '}
          <code>f(x*) = x*</code>.
        </div>
      </div>

      {/* Standardized Viewport Navigation HUD */}
      <VisualizationGuideHUD
        mode="3d"
        title="Brouwer Invariant Lab Navigation"
        hotkeys={[
          { key: 'Left Drag', action: 'Rotate Studio View' },
          { key: 'Scroll', action: 'Zoom into Invariant Node' },
          { key: 'Right Drag', action: 'Pan View' },
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
                  <span>Spoon Vortex Eccentricity X</span>
                  <span className={styles.sliderValue}>{vortexEccentricityX.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-0.8"
                  max="0.8"
                  step="0.05"
                  value={vortexEccentricityX}
                  onChange={(e) => setVortexEccentricityX(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Vortex X Offset"
                />
              </div>

              <div className={styles.sliderItem}>
                <div className={styles.sliderHeader}>
                  <span>Spoon Vortex Eccentricity Z</span>
                  <span className={styles.sliderValue}>{vortexEccentricityY.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-0.8"
                  max="0.8"
                  step="0.05"
                  value={vortexEccentricityY}
                  onChange={(e) => setVortexEccentricityY(Number(e.target.value))}
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
                <span>Stir Fluid Grid</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.sliderGroup}>
              <div className={styles.sliderItem}>
                <div className={styles.sliderHeader}>
                  <span>Crumple Deformation Intensity</span>
                  <span className={styles.sliderValue}>{crumpleIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={crumpleIntensity}
                  onChange={(e) => setCrumpleIntensity(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Crumple Intensity"
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

              <div className={styles.sliderItem}>
                <div className={styles.sliderHeader}>
                  <span>Contraction Factor (Scale)</span>
                  <span className={styles.sliderValue}>{compressionScale}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={compressionScale}
                  onChange={(e) => setCompressionScale(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Contraction Scale"
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
                <span>Crumple Coordinate Map</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
