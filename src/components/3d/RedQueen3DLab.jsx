'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './RedQueen3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

// ── Web Audio Synthesizer for Evolutionary Events ──
function playEvolutionSound(type = 'stride', freq = 340) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'mutation') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.6, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else if (type === 'surge') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // AudioContext requires user gesture or is unsupported in test env
  }
}

// ── Procedural Quadruped Fallbacks (guarantees NO cones even if GLB fails/delays) ──
function createProceduralLeopard() {
  const group = new THREE.Group();
  group.name = 'ProceduralLeopard';

  const furMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Tawny golden
    roughness: 0.7,
    metalness: 0.1,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.8,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.5,
  });

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 1.5, 12), furMat);
  torso.rotation.z = Math.PI / 2;
  torso.position.set(0, 0.9, 0);
  torso.castShadow = true;
  group.add(torso);

  // Chest
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.46, 12, 12), furMat);
  chest.scale.set(1.1, 0.85, 0.9);
  chest.position.set(0.55, 0.95, 0);
  chest.castShadow = true;
  group.add(chest);

  // Hips
  const hips = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), furMat);
  hips.position.set(-0.6, 0.92, 0);
  hips.castShadow = true;
  group.add(hips);

  // Neck & Head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.65, 8), furMat);
  neck.rotation.z = -Math.PI / 4;
  neck.position.set(0.95, 1.2, 0);
  group.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), furMat);
  head.position.set(1.3, 1.45, 0);
  head.castShadow = true;
  group.add(head);

  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.26), bellyMat);
  muzzle.position.set(1.52, 1.38, 0);
  group.add(muzzle);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), darkMat);
  nose.position.set(1.66, 1.42, 0);
  group.add(nose);

  // 4 Sprinting legs
  const legPositions = [
    [0.6, 0.3, 0.65, -0.4],
    [0.4, -0.3, 0.65, 0.3],
    [-0.5, 0.28, 0.65, 0.5],
    [-0.7, -0.28, 0.65, -0.3],
  ];
  legPositions.forEach(([lx, lz, ly, rot]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.8, 8), furMat);
    leg.position.set(lx, ly, lz);
    leg.rotation.z = rot;
    leg.castShadow = true;
    group.add(leg);
  });

  // Long rudder tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.9, 8), furMat);
  tail.rotation.z = Math.PI / 3;
  tail.position.set(-1.1, 1.15, 0);
  group.add(tail);

  return group;
}

function createProceduralGazelle() {
  const group = new THREE.Group();
  group.name = 'ProceduralGazelle';

  const coatMat = new THREE.MeshStandardMaterial({
    color: 0xc27838, // Warm tan gazelle coat
    roughness: 0.65,
    metalness: 0.1,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.8,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5,
  });
  const hornMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.6,
  });

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 1.35, 12), coatMat);
  torso.rotation.z = Math.PI / 2;
  torso.position.set(0, 1.05, 0);
  torso.castShadow = true;
  group.add(torso);

  // White Underbelly
  const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 1.1, 8), bellyMat);
  belly.rotation.z = Math.PI / 2;
  belly.position.set(0, 0.94, 0);
  group.add(belly);

  // Dark flank stripes
  [-0.22, 0.22].forEach((z) => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.02), darkMat);
    stripe.position.set(0, 1.02, z);
    group.add(stripe);
  });

  // Chest & Rump
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 10), coatMat);
  chest.position.set(0.5, 1.08, 0);
  group.add(chest);

  const rump = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), coatMat);
  rump.position.set(-0.55, 1.06, 0);
  group.add(rump);

  // Slender High-Held Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.8, 8), coatMat);
  neck.rotation.z = -Math.PI / 3.2;
  neck.position.set(0.85, 1.42, 0);
  group.add(neck);

  // Head & Muzzle
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), coatMat);
  head.position.set(1.2, 1.76, 0);
  head.castShadow = true;
  group.add(head);

  const muzzle = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 8), bellyMat);
  muzzle.rotation.z = -Math.PI / 2.2;
  muzzle.position.set(1.42, 1.68, 0);
  group.add(muzzle);

  // Lyre-shaped horns
  [-0.08, 0.08].forEach((z) => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.55, 8), hornMat);
    horn.rotation.z = Math.PI / 3.5;
    horn.rotation.x = z * 1.5;
    horn.position.set(1.15, 2.05, z);
    horn.castShadow = true;
    group.add(horn);
  });

  // 4 Slender Stotting/Sprinting Legs
  const legPositions = [
    [0.55, 0.22, 0.65, -0.3],
    [0.4, -0.22, 0.65, 0.3],
    [-0.5, 0.2, 0.68, 0.45],
    [-0.65, -0.2, 0.68, -0.25],
  ];
  legPositions.forEach(([lx, lz, ly, rot]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 0.95, 6), coatMat);
    leg.position.set(lx, ly, lz);
    leg.rotation.z = rot;
    leg.castShadow = true;
    group.add(leg);

    const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.06), darkMat);
    hoof.position.set(lx + (rot > 0 ? -0.2 : 0.2), 0.04, lz);
    group.add(hoof);
  });

  return group;
}

export default function RedQueen3DLab() {
  const mountRef = useRef(null);

  // ── Mode: 'cheetahGazelle' (Flagship) | 'armsRace' | 'costOfSex' ──
  const [activeMode, setActiveMode] = useState('cheetahGazelle');
  const modeRef = useRef('cheetahGazelle');

  // ── Environment Theme: 'savannah' | 'lookingGlass' (Lewis Carroll Chessboard) ──
  const [environmentTheme, setEnvironmentTheme] = useState('savannah');
  const envThemeRef = useRef('savannah');

  // ── Camera Preset: 'sidePursuit' | 'predatorPov' | 'preyPov' | 'orbit' ──
  const [cameraPreset, setCameraPreset] = useState('sidePursuit');
  const cameraPresetRef = useRef('sidePursuit');

  // ── Evolutionary Epoch & Speed Controls ──
  const [generation, setGeneration] = useState(1);
  const [predatorSpeed, setPredatorSpeed] = useState(70); // km/h (40 - 125)
  const [preyAgility, setPreyAgility] = useState(70); // km/h (40 - 125)
  const [isPlaying, setIsPlaying] = useState(true);

  // ── Mode 1 & 2 Historical Parameters (Preserved for Tab Consistency) ──
  const [hostMutationRate, setHostMutationRate] = useState(65);
  const [pathogenVirulence, setPathogenVirulence] = useState(60);
  const [reproStrategy, setReproStrategy] = useState('sexual');
  const reproRef = useRef('sexual');

  // ── Evolutionary Dynamics & Telemetry State ──
  const [relativeVelocity, setRelativeVelocity] = useState(0.0); // The Red Queen Invariant: Delta v = 0.0
  const [relativeDistance, setRelativeDistance] = useState(3.6); // meters (equilibrium gap)
  const [extinctionStatus, setExtinctionStatus] = useState('equilibrium'); // 'equilibrium' | 'preyExtinct' | 'predatorExtinct'
  const [infectionRate, setInfectionRate] = useState(38);
  const [immuneDiversity, setImmuneDiversity] = useState(88);
  const [hasRecorded, setHasRecorded] = useState(false);

  // ── Synchronized Refs for WebGL Animation Loop ──
  const isPlayingRef = useRef(isPlaying);
  const predatorSpeedRef = useRef(predatorSpeed);
  const preyAgilityRef = useRef(preyAgility);
  const hostMutationRef = useRef(hostMutationRate);
  const pathogenVirulenceRef = useRef(pathogenVirulence);
  const relativeDistanceRef = useRef(relativeDistance);
  const extinctionStatusRef = useRef(extinctionStatus);

  useEffect(() => { modeRef.current = activeMode; }, [activeMode]);
  useEffect(() => { envThemeRef.current = environmentTheme; }, [environmentTheme]);
  useEffect(() => { cameraPresetRef.current = cameraPreset; }, [cameraPreset]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { predatorSpeedRef.current = predatorSpeed; }, [predatorSpeed]);
  useEffect(() => { preyAgilityRef.current = preyAgility; }, [preyAgility]);
  useEffect(() => { hostMutationRef.current = hostMutationRate; }, [hostMutationRate]);
  useEffect(() => { pathogenVirulenceRef.current = pathogenVirulence; }, [pathogenVirulence]);
  useEffect(() => { reproRef.current = reproStrategy; }, [reproStrategy]);
  useEffect(() => { relativeDistanceRef.current = relativeDistance; }, [relativeDistance]);
  useEffect(() => { extinctionStatusRef.current = extinctionStatus; }, [extinctionStatus]);

  // Dynamic Telemetry Calculations
  useEffect(() => {
    if (activeMode === 'costOfSex') {
      if (reproStrategy === 'asexual') {
        setImmuneDiversity(10);
        setInfectionRate(92);
        setRelativeVelocity(-1.8);
      } else {
        setImmuneDiversity(94);
        setInfectionRate(24);
        setRelativeVelocity(0.0);
      }
    } else if (activeMode === 'armsRace') {
      const vDiff = (hostMutationRate - pathogenVirulence) / 25;
      setRelativeVelocity(Number(vDiff.toFixed(2)));
      const infect = Math.max(10, Math.min(95, Math.round(50 + (pathogenVirulence - hostMutationRate) * 0.6)));
      setInfectionRate(infect);
      setImmuneDiversity(Math.round(hostMutationRate * 0.9 + 10));
    } else {
      // Flagship: Cheetah/Leopard vs Gazelle
      const diff = Number((predatorSpeed - preyAgility).toFixed(1));
      setRelativeVelocity(diff);

      // Distance calculation: gap shifts dynamically
      let gap = 3.6 - (diff * 0.12);
      if (gap <= 0.6) {
        gap = 0.6;
        setExtinctionStatus('preyExtinct');
      } else if (gap >= 6.5) {
        gap = 6.5;
        setExtinctionStatus('predatorExtinct');
      } else {
        setExtinctionStatus('equilibrium');
      }
      setRelativeDistance(Number(gap.toFixed(2)));

      // Telemetry metrics
      setInfectionRate(Math.round(Math.max(12, Math.min(96, 50 - diff * 2))));
      setImmuneDiversity(Math.round(Math.min(99, 45 + generation * 0.05)));
    }
  }, [activeMode, predatorSpeed, preyAgility, hostMutationRate, pathogenVirulence, reproStrategy, generation]);

  // Three.js References
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const leopardAnchorRef = useRef(null);
  const gazelleAnchorRef = useRef(null);
  const treadmillRef = useRef(null);
  const dustParticlesRef = useRef(null);
  const chessFloorRef = useRef(null);
  const savannahFloorRef = useRef(null);

  // ── Step Forward 1 Generation ──
  const stepGeneration = useCallback(() => {
    setGeneration(g => g + 1);
    playEvolutionSound('mutation', 520 + Math.random() * 180);

    // Natural co-evolutionary drift: both adapt equally
    setPredatorSpeed(p => Math.min(125, Number((p + 0.5).toFixed(1))));
    setPreyAgility(g => Math.min(125, Number((g + 0.5).toFixed(1))));
  }, []);

  // ── Interactive Evolutionary Interventions ──
  const handlePredatorSurge = useCallback(() => {
    setPredatorSpeed(p => Math.min(125, p + 14));
    playEvolutionSound('surge', 220);
  }, []);

  const handlePreyCounter = useCallback(() => {
    setPreyAgility(g => Math.min(125, g + 14));
    playEvolutionSound('surge', 380);
  }, []);

  const handleResetEquilibrium = useCallback(() => {
    const avg = Math.round((predatorSpeed + preyAgility) / 2);
    setPredatorSpeed(avg);
    setPreyAgility(avg);
    setRelativeDistance(3.6);
    setExtinctionStatus('equilibrium');
  }, [predatorSpeed, preyAgility]);

  const handleFreezePrey = useCallback(() => {
    // Gazelle stops adapting, leopard easily overpowers it
    setPreyAgility(50);
    setPredatorSpeed(105);
  }, []);

  const handleFreezePredator = useCallback(() => {
    // Leopard stops adapting, falls hopelessly behind and starves
    setPredatorSpeed(50);
    setPreyAgility(105);
  }, []);

  // Record Telemetry
  const handleRecordRun = useCallback(async () => {
    await recordConceptRun('red-queen-hypothesis', 'single', {
      mode: activeMode,
      generation,
      predatorSpeed,
      preyAgility,
      relativeDistance,
      relativeVelocity,
      environmentTheme,
    });
    setHasRecorded(true);
    setTimeout(() => setHasRecorded(false), 2400);
  }, [activeMode, generation, predatorSpeed, preyAgility, relativeDistance, relativeVelocity, environmentTheme]);

  // ── Three.js Scene Setup ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 580;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0710);
    scene.fog = new THREE.FogExp2(0x0a0710, 0.018);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 8.5);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    if (renderer.shadowMap) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Dynamic Studio & Sunlight Lighting
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    sunLight.position.set(6, 12, 6);
    sunLight.castShadow = true;
    if (sunLight.shadow) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 30;
      sunLight.shadow.bias = -0.0005;
    }
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xf43f5e, 1.4);
    rimLight.position.set(-8, 5, -6);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(0, -2, 6);
    scene.add(fillLight);

    // ── 4. The Evolutionary Treadmill Track (Infinite Running Surface) ──
    const treadmillGroup = new THREE.Group();
    scene.add(treadmillGroup);
    treadmillRef.current = treadmillGroup;

    // A. Serengeti Savannah Earthen Track
    const savannahGeo = new THREE.PlaneGeometry(28, 9, 32, 16);
    const savannahMat = new THREE.MeshStandardMaterial({
      color: 0x452514, // Rich warm savanna earth
      roughness: 0.85,
      metalness: 0.05,
    });
    const savannahFloor = new THREE.Mesh(savannahGeo, savannahMat);
    savannahFloor.rotation.x = -Math.PI / 2;
    savannahFloor.receiveShadow = true;
    treadmillGroup.add(savannahFloor);
    savannahFloorRef.current = savannahFloor;

    // Longitudinal speed track lines on savannah
    const trackLines = new THREE.GridHelper(28, 28, 0xf59e0b, 0x683719);
    trackLines.position.y = 0.01;
    treadmillGroup.add(trackLines);

    // B. The Looking-Glass Giant Chessboard (Lewis Carroll's Thought Experiment)
    const chessGeo = new THREE.PlaneGeometry(28, 9, 14, 6);
    const chessCanvas = document.createElement('canvas');
    chessCanvas.width = 256;
    chessCanvas.height = 256;
    const ctx = chessCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillRect(128, 128, 128, 128);
    }
    const chessTexture = new THREE.CanvasTexture(chessCanvas);
    chessTexture.wrapS = THREE.RepeatWrapping;
    chessTexture.wrapT = THREE.RepeatWrapping;
    chessTexture.repeat.set(14, 4);

    const chessMat = new THREE.MeshStandardMaterial({
      map: chessTexture,
      roughness: 0.3,
      metalness: 0.4,
    });
    const chessFloor = new THREE.Mesh(chessGeo, chessMat);
    chessFloor.rotation.x = -Math.PI / 2;
    chessFloor.position.y = 0.02;
    chessFloor.receiveShadow = true;
    chessFloor.visible = false;
    treadmillGroup.add(chessFloor);
    chessFloorRef.current = chessFloor;

    // ── 5. Dust & High-Speed Particle System ──
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 26;
      particlePos[i * 3 + 1] = Math.random() * 1.8 + 0.05;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      particleSpeeds[i] = Math.random() * 0.8 + 0.4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.14,
      transparent: true,
      opacity: 0.75,
    });
    const dustSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(dustSystem);
    dustParticlesRef.current = dustSystem;

    // ── 6. 3D Leopard & Gazelle Anchors ──
    const leopardAnchor = new THREE.Group();
    leopardAnchor.position.set(-1.8, 0, 0);
    scene.add(leopardAnchor);
    leopardAnchorRef.current = leopardAnchor;

    const gazelleAnchor = new THREE.Group();
    gazelleAnchor.position.set(1.8, 0, 0);
    scene.add(gazelleAnchor);
    gazelleAnchorRef.current = gazelleAnchor;

    // A. Insert initial high-fidelity procedural quadrupeds immediately (ZERO CONES!)
    const procLeopard = createProceduralLeopard();
    leopardAnchor.add(procLeopard);

    const procGazelle = createProceduralGazelle();
    gazelleAnchor.add(procGazelle);

    // B. Load Blender-generated GLTF Models asynchronously
    const gltfLoader = new GLTFLoader();

    // 1. Load Blender Leopard Model
    gltfLoader.load(
      '/models/leopard.glb',
      (gltf) => {
        // Swap out procedural fallback with authentic Blender mesh
        leopardAnchor.remove(procLeopard);
        const model = gltf.scene;
        // In Blender script, head points to -X. Rotate Y by PI so leopard sprints towards +X
        model.rotation.y = Math.PI;
        model.scale.set(1.2, 1.2, 1.2);
        model.position.set(0, 0, 0);
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        leopardAnchor.add(model);
      },
      undefined,
      (err) => {
        // Graceful fallback to procedural model in tests or offline
        console.warn('Using procedural Leopard fallback:', err?.message || err);
      }
    );

    // 2. Load Blender Gazelle Model
    gltfLoader.load(
      '/models/gazelle.glb',
      (gltf) => {
        // Swap out procedural fallback with authentic Blender mesh
        gazelleAnchor.remove(procGazelle);
        const model = gltf.scene;
        // In Blender script, head points to -X. Rotate Y by PI so gazelle sprints towards +X
        model.rotation.y = Math.PI;
        model.scale.set(1.15, 1.15, 1.15);
        model.position.set(0, 0, 0);
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        gazelleAnchor.add(model);
      },
      undefined,
      (err) => {
        // Graceful fallback to procedural model in tests or offline
        console.warn('Using procedural Gazelle fallback:', err?.message || err);
      }
    );

    // ── Mouse Drag Orbit Controls ──
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = Math.PI / 2;
    let sphericalPhi = 0.38;
    let camRadius = 8.8;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = (e.clientX - prevMouseX) * 0.006;
      const dy = (e.clientY - prevMouseY) * 0.006;

      sphericalTheta -= dx;
      sphericalPhi = Math.max(0.12, Math.min(Math.PI / 2 - 0.05, sphericalPhi + dy));

      if (cameraPresetRef.current === 'orbit') {
        camera.position.x = camRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
        camera.position.y = camRadius * Math.cos(sphericalPhi) + 0.8;
        camera.position.z = camRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
        camera.lookAt(0, 1.2, 0);
      }

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => { isDragging = false; };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // ── Resize Observer ──
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ── Animation Loop ──
    let animationId;
    let lastTime = performance.now();

    const animate = (time) => {
      animationId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const running = isPlayingRef.current;
      const curPredSpeed = predatorSpeedRef.current || 88;
      const curPreyAgility = preyAgilityRef.current || 88;
      const avgSpeed = (curPredSpeed + curPreyAgility) / 2;
      const speedFactor = avgSpeed / 80;

      // 1. Environment Theme Toggle
      const isChess = envThemeRef.current === 'lookingGlass';
      if (chessFloorRef.current && savannahFloorRef.current) {
        chessFloorRef.current.visible = isChess;
        savannahFloorRef.current.visible = !isChess;
      }

      // 2. Camera Preset Coordinates
      const preset = cameraPresetRef.current;
      if (preset === 'sidePursuit') {
        // Dramatic side tracking camera showcasing constant Delta X
        camera.position.set(0, 3.2, 8.2);
        camera.lookAt(0, 1.2, 0);
      } else if (preset === 'predatorPov') {
        // Behind the charging leopard looking directly at gazelle
        const lx = leopardAnchorRef.current ? leopardAnchorRef.current.position.x : -1.8;
        camera.position.set(lx - 2.8, 2.1, 0);
        camera.lookAt(lx + 4.0, 1.2, 0);
      } else if (preset === 'preyPov') {
        // Looking back from gazelle towards the pursuing leopard
        const gx = gazelleAnchorRef.current ? gazelleAnchorRef.current.position.x : 1.8;
        camera.position.set(gx + 2.5, 1.9, 0.5);
        camera.lookAt(gx - 4.5, 1.1, 0);
      }

      // 3. Infinite Treadmill Scrolling (Conveys "Running to Stay in Place")
      if (running && trackLines) {
        const scrollDist = delta * speedFactor * 12.0;
        trackLines.position.x = (trackLines.position.x - scrollDist) % 1.0;

        if (chessTexture) {
          chessTexture.offset.x += delta * speedFactor * 0.9;
        }
      }

      // 4. Dynamic Particle Motion (Dust / Wind lines)
      if (dustParticlesRef.current && running) {
        const posAttr = dustParticlesRef.current.geometry.attributes.position;
        const arr = posAttr.array;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3] -= delta * speedFactor * 16.0 * particleSpeeds[i];
          if (arr[i * 3] < -14.0) {
            arr[i * 3] = 14.0;
            arr[i * 3 + 1] = Math.random() * 1.5 + 0.05;
          }
        }
        posAttr.needsUpdate = true;
      }

      // 5. Dynamic Animal Sprint Animations (Biomechanics & Gallop Cycle)
      const currentGap = relativeDistanceRef.current || 3.6;
      const predFreq = (curPredSpeed / 70) * 14.0;
      const preyFreq = (curPreyAgility / 70) * 14.5;

      if (leopardAnchorRef.current && gazelleAnchorRef.current) {
        // Calculate X positioning: Gazelle ahead, Leopard behind
        const targetGazelleX = currentGap / 2;
        const targetLeopardX = -currentGap / 2;

        leopardAnchorRef.current.position.x = THREE.MathUtils.lerp(
          leopardAnchorRef.current.position.x,
          targetLeopardX,
          delta * 4.0
        );
        gazelleAnchorRef.current.position.x = THREE.MathUtils.lerp(
          gazelleAnchorRef.current.position.x,
          targetGazelleX,
          delta * 4.0
        );

        if (running) {
          // A. Leopard explosive gallop bounce & spine flexion
          const leopardCycle = time * 0.001 * predFreq;
          leopardAnchorRef.current.position.y = Math.abs(Math.sin(leopardCycle)) * 0.22;
          leopardAnchorRef.current.rotation.z = Math.sin(leopardCycle) * 0.12; // Spine pitch
          leopardAnchorRef.current.rotation.y = Math.sin(leopardCycle * 0.5) * 0.04;

          // B. Gazelle spring-like pronk/stotting leap & evasive agile lean
          const gazelleCycle = time * 0.001 * preyFreq;
          gazelleAnchorRef.current.position.y = Math.abs(Math.sin(gazelleCycle)) * 0.32;
          gazelleAnchorRef.current.rotation.z = Math.sin(gazelleCycle) * 0.16; // Head/body tilt
          gazelleAnchorRef.current.rotation.y = Math.sin(time * 0.002) * 0.08; // High-G turning evasion
        }
      }

      renderer.render(scene, camera);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className={styles.labContainer}
      aria-label="The Red Queen Hypothesis 3D Interactive Lab"
      data-testid="red-queen-3d-lab"
    >
      {/* Canvas Area */}
      <div className={styles.canvasContainer}>
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Top HUD */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="atom" size={13} />
              Leigh Van Valen 1973 Evolutionary Engine
            </div>
            <h2 className={styles.labTitle}>The Red Queen Hypothesis</h2>
            <div className={styles.labQuote}>
              &ldquo;Now, here, you see, it takes all the running you can do, to keep in the same place.&rdquo;
            </div>
          </div>

          <div className={styles.statsCluster}>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Generation</span>
              <span className={`${styles.statValue} ${styles.statValueCyan}`}>Gen #{generation}</span>
            </div>

            <div className={styles.statPill}>
              <span className={styles.statLabel}>Leopard Speed (v₁)</span>
              <span className={`${styles.statValue} ${styles.statValueAmber}`}>{predatorSpeed} km/h</span>
            </div>

            <div className={styles.statPill}>
              <span className={styles.statLabel}>Gazelle Agility (v₂)</span>
              <span className={`${styles.statValue} ${styles.statValueEmerald}`}>{preyAgility} km/h</span>
            </div>

            <div className={styles.statPill}>
              <span className={styles.statLabel}>Relative Gap (Δx)</span>
              <span className={`${styles.statValue} ${extinctionStatus !== 'equilibrium' ? styles.statValueRose : styles.statValueCyan}`}>
                {relativeDistance} m
              </span>
            </div>

            <div className={styles.statPill}>
              <span className={styles.statLabel}>Relative Velocity (Δv)</span>
              <span className={`${styles.statValue} ${styles.statValueCyan}`}>
                {relativeVelocity === 0 ? '0.0 (Treadmill Lock)' : `${relativeVelocity > 0 ? '+' : ''}${relativeVelocity} km/h`}
              </span>
            </div>

            <div className={`${styles.statPill} ${infectionRate > 75 ? styles.statPillCrisis : ''}`}>
              <span className={styles.statLabel}>Infection Threat</span>
              <span className={`${styles.statValue} ${styles.statValueRose}`}>{infectionRate}% Vulnerable</span>
            </div>

            <div className={styles.statPill}>
              <span className={styles.statLabel}>Immune Diversity Index</span>
              <span className={`${styles.statValue} ${styles.statValueEmerald}`}>{immuneDiversity}% Polymorphic</span>
            </div>
          </div>
        </div>

        {/* View & Environment Controls Overlays */}
        <div className={styles.viewControlsBar}>
          <div className={styles.viewBtnGroup}>
            <span className={styles.viewGroupLabel}>Camera:</span>
            <button
              type="button"
              className={`${styles.viewBtn} ${cameraPreset === 'sidePursuit' ? styles.viewBtnActive : ''}`}
              onClick={() => setCameraPreset('sidePursuit')}
            >
              Side Pursuit Track
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${cameraPreset === 'predatorPov' ? styles.viewBtnActive : ''}`}
              onClick={() => setCameraPreset('predatorPov')}
            >
              Leopard POV
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${cameraPreset === 'preyPov' ? styles.viewBtnActive : ''}`}
              onClick={() => setCameraPreset('preyPov')}
            >
              Gazelle Rearview
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${cameraPreset === 'orbit' ? styles.viewBtnActive : ''}`}
              onClick={() => setCameraPreset('orbit')}
            >
              Free 3D Orbit
            </button>
          </div>

          <div className={styles.viewBtnGroup}>
            <span className={styles.viewGroupLabel}>Stage:</span>
            <button
              type="button"
              className={`${styles.viewBtn} ${environmentTheme === 'savannah' ? styles.viewBtnActive : ''}`}
              onClick={() => setEnvironmentTheme('savannah')}
            >
              Serengeti Plains
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${environmentTheme === 'lookingGlass' ? styles.viewBtnActive : ''}`}
              onClick={() => setEnvironmentTheme('lookingGlass')}
            >
              Looking-Glass Chessboard
            </button>
          </div>
        </div>

        {/* Treadmill HUD */}
        <div className={styles.treadmillHUD}>
          <div className={styles.treadmillInfo}>
            <div className={styles.treadmillTitle}>
              <Icon name="repeat" size={14} />
              The Evolutionary Treadmill (Running to Stay in Place)
            </div>
            <div className={styles.treadmillDesc}>
              {extinctionStatus === 'equilibrium' && (
                <span>
                  <strong>Zero Net Darwinian Gain:</strong> Both cheetah and gazelle have evolved from 45 km/h ancestors to over {predatorSpeed} km/h, expending massive metabolic energy, yet their relative distance remains locked at {relativeDistance}m with an invariant 50% capture probability!
                </span>
              )}
              {extinctionStatus === 'preyExtinct' && (
                <span style={{ color: '#fb7185' }}>
                  <strong>Extinction Event (Prey Stagnation):</strong> The gazelle stopped counter-adapting. The leopard closes the gap, capturing the prey to population collapse.
                </span>
              )}
              {extinctionStatus === 'predatorExtinct' && (
                <span style={{ color: '#fb7185' }}>
                  <strong>Extinction Event (Predator Starvation):</strong> The leopard failed to match the prey&apos;s speed escalation. The gazelle easily escapes, leading to predator famine.
                </span>
              )}
            </div>
          </div>

          <div className={styles.treadmillActionGroup}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={stepGeneration}
              aria-label="Step Generation"
            >
              <Icon name="chevron-right" size={14} />
              Advance Generation (+1)
            </button>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleResetEquilibrium}
              aria-label="Restore Equilibrium"
            >
              <Icon name="refresh" size={14} />
              Reset Equilibrium
            </button>
          </div>
        </div>
      </div>

      {/* Primary Control Deck */}
      <div className={styles.controlDeck}>
        {/* Navigation Tabs */}
        <div className={styles.tabsRow} role="tablist">
          <button
            type="button"
            className={`${styles.tabBtn} ${activeMode === 'cheetahGazelle' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveMode('cheetahGazelle')}
            role="tab"
            aria-selected={activeMode === 'cheetahGazelle'}
          >
            <Icon name="zap" size={14} />
            3. Cheetah vs Gazelle Locomotion
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeMode === 'armsRace' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveMode('armsRace')}
            role="tab"
            aria-selected={activeMode === 'armsRace'}
          >
            <Icon name="shield" size={14} />
            1. Host-Parasite Arms Race
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeMode === 'costOfSex' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveMode('costOfSex')}
            role="tab"
            aria-selected={activeMode === 'costOfSex'}
          >
            <Icon name="users" size={14} />
            2. The Mystery of Sex (Clones vs Diversity)
          </button>
        </div>

        {/* Tab 3 / Flagship: Cheetah vs Gazelle Locomotion */}
        {activeMode === 'cheetahGazelle' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Predator Velocity vs Prey Agility</span>
                <span className={styles.cardSubtitle}>Co-Adaptive Escalation</span>
              </div>
              <div className={styles.sliderBox}>
                <div className={styles.sliderHeader}>
                  <span>Cheetah Acceleration: {predatorSpeed} km/h</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="125"
                  value={predatorSpeed}
                  onChange={(e) => setPredatorSpeed(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Predator Speed"
                />
              </div>

              <div className={styles.sliderBox} style={{ marginTop: '10px' }}>
                <div className={styles.sliderHeader}>
                  <span>Gazelle Evasion Agility: {preyAgility} km/h</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="125"
                  value={preyAgility}
                  onChange={(e) => setPreyAgility(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Prey Agility"
                />
              </div>

              {/* Arms Race Escalation Buttons */}
              <div className={styles.escalationBtnRow}>
                <button
                  type="button"
                  className={styles.quickSurgeBtn}
                  onClick={handlePredatorSurge}
                >
                  ⚡ Leopard Mutation (+14 km/h)
                </button>
                <button
                  type="button"
                  className={styles.quickSurgeBtn}
                  onClick={handlePreyCounter}
                >
                  🦌 Gazelle Counter-Adapt (+14 km/h)
                </button>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Van Valen&apos;s Extinction Law (1973)</span>
                <span className={styles.cardSubtitle}>The Life-Dinner Principle</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                As Richard Dawkins formulated: <em>&ldquo;The rabbit runs faster than the fox, because the rabbit is running for his life while the fox is only running for his dinner.&rdquo;</em>
                Both species are forced into extreme biomechanical specialization, yet neither achieves absolute superiority.
              </p>
              <div className={styles.hazardRow}>
                <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Test Extinction Hazard:</span>
                <button
                  type="button"
                  className={styles.hazardBtn}
                  onClick={handleFreezePrey}
                >
                  Freeze Prey (Catch)
                </button>
                <button
                  type="button"
                  className={styles.hazardBtn}
                  onClick={handleFreezePredator}
                >
                  Freeze Predator (Starve)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Host-Parasite Arms Race */}
        {activeMode === 'armsRace' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Host Immune Mutation Rate</span>
                <span className={styles.sliderValue}>{hostMutationRate}% Speed</span>
              </div>
              <div className={styles.sliderBox}>
                <div className={styles.sliderHeader}>
                  <span>Stagnant Immune System</span>
                  <span>Rapid Allele Shuffling</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={hostMutationRate}
                  onChange={(e) => setHostMutationRate(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Host Mutation Rate"
                />
              </div>

              <div className={styles.cardHeader} style={{ marginTop: '12px' }}>
                <span>Parasite Virulence & Adaptation</span>
                <span className={styles.sliderValue}>{pathogenVirulence}% Adapt</span>
              </div>
              <div className={styles.sliderBox}>
                <div className={styles.sliderHeader}>
                  <span>Mild Pathogen</span>
                  <span>Hyper-Mutating Virus</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={pathogenVirulence}
                  onChange={(e) => setPathogenVirulence(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Pathogen Virulence"
                />
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Van Valen&apos;s Law of Extinction (1973)</span>
                <span className={styles.cardSubtitle}>Constant Extinction Risk</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0 }}>
                  A species does not become more immune to extinction as it gets older. Because its competitors, predators, and pathogens are also evolving, its relative adaptive fitness remains constant:
                </p>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #f43f5e' }}>
                  <em>&ldquo;Now, here, you see, it takes all the running you can do, to keep in the same place.&rdquo;</em>
                  <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>— The Red Queen to Alice, Through the Looking-Glass</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: The Two-Fold Cost of Sex */}
        {activeMode === 'costOfSex' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Select Reproduction Strategy</span>
                <span className={styles.cardSubtitle}>The Evolutionary Paradox of Sex</span>
              </div>
              <div className={styles.reproSelector}>
                <div
                  className={`${styles.reproCard} ${reproStrategy === 'asexual' ? styles.reproCardActive : ''}`}
                  onClick={() => setReproStrategy('asexual')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.reproTitle}>Asexual Clones (2× Reproduction)</div>
                  <div className={styles.reproDesc}>
                    Fastest growth, but 100% identical receptor coat. Once a virus mutates the master key, the entire colony collapses.
                  </div>
                </div>

                <div
                  className={`${styles.reproCard} ${reproStrategy === 'sexual' ? styles.reproCardActive : ''}`}
                  onClick={() => setReproStrategy('sexual')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.reproTitle}>Sexual Recombination (Diversity)</div>
                  <div className={styles.reproDesc}>
                    Costs 50% fitness (males don&apos;t bear offspring), but creates diverse polymorphic surface locks that defeat pandemic extinction.
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Antibiotic & Oncology Relevance</span>
                <span className={styles.cardSubtitle}>Modern Red Queen Dynamics</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                Every time medical science introduces a new antibiotic or chemotherapy, bacteria and cancer cells evolve beta-lactamase enzymes or drug-efflux pumps. Medical pharmacology is permanently running on the Red Queen treadmill.
              </p>
            </div>
          </div>
        )}

        {/* Action Controls Bar */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className={`${styles.primaryBtn} ${!isPlaying ? styles.paused : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            <Icon name={isPlaying ? 'pause' : 'play'} size={15} />
            {isPlaying ? 'Pause Coevolution' : 'Resume Coevolution'}
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={stepGeneration}
            aria-label="Advance Generation"
          >
            <Icon name="refresh" size={15} />
            Advance Generation (+1)
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleRecordRun}
            aria-label="Record Evolutionary Telemetry"
          >
            <Icon name="check" size={15} />
            {hasRecorded ? 'Telemetry Synchronized!' : 'Record Evolutionary Telemetry'}
          </button>
        </div>
      </div>
    </div>
  );
}
