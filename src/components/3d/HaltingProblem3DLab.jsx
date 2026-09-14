'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './HaltingProblem3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

// Pre-programmed Turing Machine Transition Tables
const PROGRAMS = {
  binaryIncrement: {
    id: 'binaryIncrement',
    name: '1. Binary Counter (+1)',
    desc: 'Increments binary 1011 (11) to 1100 (12) with carry propagation and halts.',
    initialTape: ['B', '1', '0', '1', '1', 'B'],
    initialHead: 4, // start at least significant bit
    initialState: 'q0',
    transitions: {
      // q0: add 1 with carry
      'q0,1': { write: '0', move: -1, next: 'q0' },
      'q0,0': { write: '1', move: 0, next: 'qHalt' },
      'q0,B': { write: '1', move: 0, next: 'qHalt' },
    },
    guaranteedHalt: true,
  },
  busyBeaver3: {
    id: 'busyBeaver3',
    name: '2. Busy Beaver (3-State)',
    desc: 'Runs for exactly 14 steps on an empty tape, prints six 1s, and halts.',
    initialTape: ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
    initialHead: 3,
    initialState: 'qA',
    transitions: {
      'qA,B': { write: '1', move: 1, next: 'qB' },
      'qA,1': { write: '1', move: 1, next: 'qHalt' },
      'qB,B': { write: '0', move: 1, next: 'qC' },
      'qB,1': { write: '1', move: 1, next: 'qB' },
      'qC,B': { write: '1', move: -1, next: 'qC' },
      'qC,1': { write: '1', move: -1, next: 'qA' },
    },
    guaranteedHalt: true,
  },
  pingPongLoop: {
    id: 'pingPongLoop',
    name: '3. Infinite Ping-Pong Loop',
    desc: 'Oscillates between two cells endlessly without ever reaching a halting state.',
    initialTape: ['B', '1', '0', 'B'],
    initialHead: 1,
    initialState: 'qLoopA',
    transitions: {
      'qLoopA,1': { write: '1', move: 1, next: 'qLoopB' },
      'qLoopB,0': { write: '0', move: -1, next: 'qLoopA' },
      'qLoopA,0': { write: '0', move: 1, next: 'qLoopB' },
      'qLoopB,1': { write: '1', move: -1, next: 'qLoopA' },
    },
    guaranteedHalt: false,
  },
  oppositeParadox: {
    id: 'oppositeParadox',
    name: '4. Opposite(Opposite) Self-Reference',
    desc: 'Turing diagonal program that inverts the Halt oracle prediction, causing immediate logical contradiction.',
    initialTape: ['B', 'P', 'P', 'B'],
    initialHead: 1,
    initialState: 'qEval',
    transitions: {},
    guaranteedHalt: null, // Undecidable!
  },
};

export default function HaltingProblem3DLab() {
  const mountRef = useRef(null);

  // ── Mode: 'tapeEngine' | 'paradoxProof' | 'undecidability' ──
  const [activeMode, setActiveMode] = useState('tapeEngine');
  const modeRef = useRef('tapeEngine');

  // ── Mode 1: Tape Engine State ──
  const [selectedProgram, setSelectedProgram] = useState('binaryIncrement');
  const [tape, setTape] = useState(PROGRAMS.binaryIncrement.initialTape);
  const [headPos, setHeadPos] = useState(PROGRAMS.binaryIncrement.initialHead);
  const [state, setState] = useState(PROGRAMS.binaryIncrement.initialState);
  const [stepCount, setStepCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isHalted, setIsHalted] = useState(false);

  // ── Mode 2: Paradox Oracle State ──
  const [oraclePrediction, setOraclePrediction] = useState('HALTS'); // 'HALTS' | 'LOOPS'
  const [paradoxTriggered, setParadoxTriggered] = useState(true);

  // ── Mode 3: Busy Beaver States ──
  const [busyBeaverN, setBusyBeaverN] = useState(3);

  // ── Telemetry State ──
  const [hasRecorded, setHasRecorded] = useState(false);

  // Sync refs for Three.js animation loop
  const tapeRef = useRef(tape);
  const headPosRef = useRef(headPos);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speedMultiplier);
  const isHaltedRef = useRef(isHalted);
  const paradoxTriggeredRef = useRef(paradoxTriggered);

  useEffect(() => { modeRef.current = activeMode; }, [activeMode]);
  useEffect(() => { tapeRef.current = tape; }, [tape]);
  useEffect(() => { headPosRef.current = headPos; }, [headPos]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speedMultiplier; }, [speedMultiplier]);
  useEffect(() => { isHaltedRef.current = isHalted; }, [isHalted]);
  useEffect(() => { paradoxTriggeredRef.current = paradoxTriggered; }, [paradoxTriggered]);

  // Three.js object references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const turingGroupRef = useRef(null);
  const oracleGroupRef = useRef(null);
  const tapeRibbonMeshRef = useRef(null);
  const headMeshRef = useRef(null);
  const genevaGearRef = useRef(null);
  const reelLeftRef = useRef(null);
  const reelRightRef = useRef(null);
  const mobiusRingRef = useRef(null);
  const brakeShoeRef = useRef(null);
  const sparkParticlesRef = useRef(null);
  const vacuumBulbsRef = useRef([]);

  // Reset Program Tape
  const handleSelectProgram = useCallback((progKey) => {
    const prog = PROGRAMS[progKey];
    setSelectedProgram(progKey);
    setTape([...prog.initialTape]);
    setHeadPos(prog.initialHead);
    setState(prog.initialState);
    setStepCount(0);
    setIsHalted(false);
    setIsPlaying(false);
  }, []);

  // Single Step Execution
  const handleStep = useCallback(() => {
    if (isHalted) return;

    if (selectedProgram === 'oppositeParadox') {
      // In the paradox program, any attempt to evaluate results in self-contradiction
      setIsHalted(false);
      setStepCount((prev) => prev + 1);
      return;
    }

    const currentProg = PROGRAMS[selectedProgram];
    const currentSymbol = tape[headPos] || 'B';
    const key = `${state},${currentSymbol}`;
    const rule = currentProg.transitions[key];

    if (!rule || rule.next === 'qHalt') {
      setIsHalted(true);
      setIsPlaying(false);
      if (rule) {
        const nextTape = [...tape];
        nextTape[headPos] = rule.write;
        setTape(nextTape);
        setState('qHalt');
      }
      setStepCount((prev) => prev + 1);
      return;
    }

    // Apply rule
    const nextTape = [...tape];
    nextTape[headPos] = rule.write;

    let nextHead = headPos + rule.move;
    if (nextHead < 0) {
      nextTape.unshift('B');
      nextHead = 0;
    } else if (nextHead >= nextTape.length) {
      nextTape.push('B');
    }

    setTape(nextTape);
    setHeadPos(nextHead);
    setState(rule.next);
    setStepCount((prev) => prev + 1);
  }, [isHalted, selectedProgram, tape, headPos, state]);

  // Autoplay ticker
  useEffect(() => {
    if (!isPlaying || isHalted) return;
    const intervalTime = Math.max(160, 600 / speedMultiplier);
    const timer = setInterval(() => {
      handleStep();
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, isHalted, speedMultiplier, handleStep]);

  // ── Three.js Simulation Setup ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x05070d);
    scene.fog = new THREE.FogExp2(0x05070d, 0.035);

    const width = mount.clientWidth;
    const height = mount.clientHeight || 580;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 8.2);
    camera.lookAt(0, 0.4, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0x38bdf8, 3.5, 20, Math.PI / 4, 0.4, 1.2);
    mainSpot.position.set(3, 8, 5);
    scene.add(mainSpot);

    const warmFill = new THREE.PointLight(0xf59e0b, 2.2, 15);
    warmFill.position.set(-4, 3, -2);
    scene.add(warmFill);

    const paradoxRedLight = new THREE.PointLight(0xef4444, 2.5, 12);
    paradoxRedLight.position.set(0, 2, 0);
    scene.add(paradoxRedLight);

    // 4. Subtle Cybernetic Laboratory Grid Floor
    const gridHelper = new THREE.GridHelper(24, 24, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // ── Group 1: Turing Machine & Paper Tape Bed ──
    const turingGroup = new THREE.Group();
    scene.add(turingGroup);
    turingGroupRef.current = turingGroup;

    // Base Chassis
    const baseGeo = new THREE.BoxGeometry(4.2, 0.35, 2.2);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.4, metalness: 0.85 });
    const chassis = new THREE.Mesh(baseGeo, baseMat);
    chassis.position.set(0, 0.18, 0);
    turingGroup.add(chassis);

    // Brass Rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.9 });
    for (const z of [-0.9, 0.9]) {
      const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.2, 16);
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, 0.38, z);
      turingGroup.add(rail);
    }

    // Supply & Take-up Tape Reels
    const reelMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.25, metalness: 0.9 });
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 });

    function createReelGroup(x) {
      const group = new THREE.Group();
      group.position.set(x, 0.7, 0);

      const flangeGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.04, 32);
      const topFlange = new THREE.Mesh(flangeGeo, reelMat);
      topFlange.position.y = 0.16;
      group.add(topFlange);

      const bottomFlange = new THREE.Mesh(flangeGeo, reelMat);
      bottomFlange.position.y = -0.16;
      group.add(bottomFlange);

      const paperGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.28, 32);
      const paperRoll = new THREE.Mesh(paperGeo, paperMat);
      group.add(paperRoll);

      turingGroup.add(group);
      return group;
    }

    reelLeftRef.current = createReelGroup(-1.5);
    reelRightRef.current = createReelGroup(1.5);

    // Geneva Stepper Drive Wheel
    const gearGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 24);
    const genevaGear = new THREE.Mesh(gearGeo, reelMat);
    genevaGear.position.set(0, 0.42, -0.75);
    turingGroup.add(genevaGear);
    genevaGearRef.current = genevaGear;

    // Read / Write Head Carriage
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.8, 0);
    const headBoxGeo = new THREE.BoxGeometry(0.65, 0.55, 0.5);
    const headBoxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.7 });
    const headBox = new THREE.Mesh(headBoxGeo, headBoxMat);
    headGroup.add(headBox);

    // Stamping Plunger Needle
    const plungerGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 16);
    const plungerMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.9, emissive: 0x0284c7, emissiveIntensity: 0.5 });
    const plunger = new THREE.Mesh(plungerGeo, plungerMat);
    plunger.position.y = -0.26;
    headGroup.add(plunger);

    turingGroup.add(headGroup);
    headMeshRef.current = headGroup;

    // Vacuum Tube State Register Display (5 Bulbs)
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.1, transparent: true, opacity: 0.45 });
    const filamentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 3.5 });
    const bulbs = [];

    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.45;
      const bulbGroup = new THREE.Group();
      bulbGroup.position.set(x, 0.65, 0.75);

      const glassGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.36, 16);
      const glass = new THREE.Mesh(glassGeo, bulbMat);
      bulbGroup.add(glass);

      const coreGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.24, 12);
      const filament = new THREE.Mesh(coreGeo, filamentMat);
      bulbGroup.add(filament);

      turingGroup.add(bulbGroup);
      bulbs.push(filament);
    }
    vacuumBulbsRef.current = bulbs;

    // ── Group 2: Paradox Diagnostic Inverter (Mode 2) ──
    const oracleGroup = new THREE.Group();
    oracleGroup.position.set(0, 0, 0);
    scene.add(oracleGroup);
    oracleGroupRef.current = oracleGroup;

    // Oracle Black Box
    const oracleBoxGeo = new THREE.BoxGeometry(2.6, 0.6, 1.6);
    const oracleBoxMat = new THREE.MeshStandardMaterial({ color: 0x0a0d14, roughness: 0.2, metalness: 0.9 });
    const oracleBox = new THREE.Mesh(oracleBoxGeo, oracleBoxMat);
    oracleBox.position.set(0, 0.3, 0);
    oracleGroup.add(oracleBox);

    // Paradox Mobius Ring
    const mobiusGeo = new THREE.TorusGeometry(0.65, 0.09, 24, 64);
    const mobiusMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0xdc2626,
      emissiveIntensity: 1.8,
    });
    const mobiusRing = new THREE.Mesh(mobiusGeo, mobiusMat);
    mobiusRing.position.set(0, 0.9, 0);
    oracleGroup.add(mobiusRing);
    mobiusRingRef.current = mobiusRing;

    // Mechanical Emergency Brake Shoe
    const brakeGeo = new THREE.BoxGeometry(0.25, 0.7, 0.12);
    const brakeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.95 });
    const brakeShoe = new THREE.Mesh(brakeGeo, brakeMat);
    brakeShoe.position.set(0, 1.45, 0);
    oracleGroup.add(brakeShoe);
    brakeShoeRef.current = brakeShoe;

    // Spark Particles for Paradox State
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 1.8;
      particlePos[i + 1] = 0.6 + Math.random() * 1.4;
      particlePos[i + 2] = (Math.random() - 0.5) * 1.8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xff3b30,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const sparkParticles = new THREE.Points(particleGeo, particleMat);
    oracleGroup.add(sparkParticles);
    sparkParticlesRef.current = sparkParticles;

    // ── Mouse Drag Orbit Controls ──
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = Math.PI / 2;
    let sphericalPhi = 0.45;
    const radius = 8.5;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = (e.clientX - prevMouseX) * 0.005;
      const dy = (e.clientY - prevMouseY) * 0.005;

      sphericalTheta -= dx;
      sphericalPhi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, sphericalPhi + dy));

      camera.position.x = radius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = radius * Math.cos(sphericalPhi);
      camera.position.z = radius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 0.4, 0);

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => { isDragging = false; };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // ── Animation Render Loop ──
    let animationId;
    let prevTime = performance.now();
    const startTime = prevTime;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;
      const elapsed = (now - startTime) / 1000;

      // Visibility based on Active Mode
      if (turingGroupRef.current) {
        turingGroupRef.current.visible = (modeRef.current === 'tapeEngine' || modeRef.current === 'undecidability');
      }
      if (oracleGroupRef.current) {
        oracleGroupRef.current.visible = (modeRef.current === 'paradoxProof');
      }

      // Rotate Reels & Geneva drive while running
      if (isPlayingRef.current && !isHaltedRef.current) {
        const rotSpeed = 3.5 * (speedRef.current || 1) * delta;
        if (reelLeftRef.current) reelLeftRef.current.rotation.y += rotSpeed;
        if (reelRightRef.current) reelRightRef.current.rotation.y += rotSpeed;
        if (genevaGearRef.current) genevaGearRef.current.rotation.z += rotSpeed * 1.5;
        if (headMeshRef.current) {
          headMeshRef.current.position.y = 0.8 + Math.sin(elapsed * 12) * 0.04;
        }
      }

      // Vacuum Tube Filament Pulsing
      if (vacuumBulbsRef.current.length > 0) {
        vacuumBulbsRef.current.forEach((bulb, idx) => {
          const intensity = 2.0 + Math.sin(elapsed * 4 + idx * 1.2) * 1.2;
          bulb.material.emissiveIntensity = intensity;
        });
      }

      // Mode 2 Paradox Animation
      if (modeRef.current === 'paradoxProof') {
        if (mobiusRingRef.current) {
          mobiusRingRef.current.rotation.x += 1.8 * delta;
          mobiusRingRef.current.rotation.y += 2.4 * delta;
        }
        if (brakeShoeRef.current) {
          // Rapidly chatter up and down trying to halt the paradoxical spin
          brakeShoeRef.current.position.y = 1.35 + Math.sin(elapsed * 25) * 0.08;
        }
        if (sparkParticlesRef.current) {
          const positions = sparkParticlesRef.current.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += delta * (0.8 + Math.random() * 0.5);
            if (positions[i + 1] > 2.2) {
              positions[i + 1] = 0.6;
            }
          }
          sparkParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

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

  // Record Telemetry
  const handleRecordRun = useCallback(async () => {
    await recordConceptRun('halting-problem', 'single', {
      program: selectedProgram,
      steps: stepCount,
      halts: isHalted,
      paradox: activeMode === 'paradoxProof',
      busyBeaverN,
    });
    setHasRecorded(true);
    setTimeout(() => setHasRecorded(false), 2400);
  }, [selectedProgram, stepCount, isHalted, activeMode, busyBeaverN]);

  // Busy Beaver Step Calculator
  const getBusyBeaverStats = (n) => {
    switch (n) {
      case 1: return { steps: 1, ones: 1, status: 'Known (Trivial)' };
      case 2: return { steps: 6, ones: 4, status: 'Known (Radó 1962)' };
      case 3: return { steps: 21, ones: 6, status: 'Known (Lin & Radó 1965)' };
      case 4: return { steps: 107, ones: 13, status: 'Known (Brady 1983)' };
      case 5: return { steps: '≥ 47,176,870', ones: '≥ 4,098', status: 'Uncomputable Frontier (Skelet 2003)' };
      default: return { steps: 'Astronomical', ones: 'Unknown', status: 'Unknowable' };
    }
  };

  const bbStats = getBusyBeaverStats(busyBeaverN);

  return (
    <div className={styles.labContainer} data-testid="halting-problem-3d-lab">
      <div className={styles.canvasContainer}>
        {/* Top Floating Header */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="cpu" size={13} />
              <span>Theoretical Computer Science &amp; Decidability</span>
            </div>
            <h2 className={styles.labTitle}>Turing Halting Problem — The Incomputable Horizon</h2>
          </div>

          <div className={styles.statsCluster}>
            <div className={`${styles.statPill} ${isHalted ? styles.statPillHalted : activeMode === 'paradoxProof' ? styles.statPillParadox : styles.statPillLoop}`}>
              <span className={styles.statLabel}>Machine Status</span>
              <span className={`${styles.statValue} ${isHalted ? styles.statValueHalted : activeMode === 'paradoxProof' ? styles.statValueParadox : styles.statValueLoop}`}>
                {activeMode === 'paradoxProof' ? 'PARADOX BREAKDOWN' : isHalted ? 'HALTED (Normal Exit)' : 'EXECUTING (Looping)'}
              </span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Internal State / Clock Steps</span>
              <span className={styles.statValue}>
                {state} · {stepCount} Steps
              </span>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className={styles.modeTabs}>
          <button
            type="button"
            className={`${styles.modeTab} ${activeMode === 'tapeEngine' ? styles.modeTabActive : ''}`}
            onClick={() => setActiveMode('tapeEngine')}
          >
            <Icon name="cpu" size={13} />
            <span>1. Mechanical Tape Engine (1936)</span>
          </button>
          <button
            type="button"
            className={`${styles.modeTab} ${activeMode === 'paradoxProof' ? styles.modeTabActive : ''}`}
            onClick={() => setActiveMode('paradoxProof')}
          >
            <Icon name="alert" size={13} />
            <span>2. The Opposite(Opposite) Paradox</span>
          </button>
          <button
            type="button"
            className={`${styles.modeTab} ${activeMode === 'undecidability' ? styles.modeTabActive : ''}`}
            onClick={() => setActiveMode('undecidability')}
          >
            <Icon name="layers" size={13} />
            <span>3. Busy Beaver &amp; Rice&apos;s Theorem</span>
          </button>
        </div>

        {/* 3D WebGL Canvas */}
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Floating Stage Badges */}
        <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightLeft}`}>
          <Icon name="clock" size={12} />
          <span>Universal Turing Machine (1936 Proof)</span>
        </div>
        <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightCenter}`}>
          <Icon name="layers" size={12} />
          <span>Head Cell: [{headPos}] = &apos;{tape[headPos] || 'B'}&apos;</span>
        </div>
        <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightRight}`}>
          <Icon name="zap" size={12} />
          <span>Decidability: {activeMode === 'paradoxProof' ? '0% (Undecidable Proof)' : 'Discrete Step Simulation'}</span>
        </div>
      </div>

      {/* Interactive Controls Panel */}
      <div className={styles.controlPanel}>
        {/* Mode 1: Tape Engine Controls */}
        {activeMode === 'tapeEngine' && (
          <>
            <div className={styles.presetContainer}>
              <span className={styles.presetLabel}>Select Classical Program</span>
              <div className={styles.presetRow}>
                {Object.values(PROGRAMS).map((prog) => (
                  <button
                    key={prog.id}
                    type="button"
                    className={`${styles.presetBtn} ${selectedProgram === prog.id ? styles.presetBtnActive : ''}`}
                    onClick={() => handleSelectProgram(prog.id)}
                  >
                    <Icon name={prog.guaranteedHalt ? 'check' : prog.guaranteedHalt === false ? 'rotate-ccw' : 'alert'} size={13} />
                    <span>{prog.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tape Ribbon Visualizer */}
            <div className={styles.tapeRibbonContainer}>
              <div className={styles.tapeHeader}>
                <span>Infinite Tape Cells</span>
                <span>Active Symbol: &apos;{tape[headPos] || 'B'}&apos;</span>
              </div>
              <div className={styles.tapeTrack}>
                {tape.map((sym, idx) => (
                  <div
                    key={idx}
                    className={`${styles.tapeCell} ${idx === headPos ? styles.tapeCellActive : ''}`}
                  >
                    {idx === headPos && <span className={styles.tapeHeadArrow}>▼</span>}
                    {sym}
                  </div>
                ))}
              </div>
            </div>

            {/* Playback Controls & Speed */}
            <div className={styles.controlRow}>
              <div className={styles.sliderCard}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Execution Engine Controls</span>
                  <span className={styles.sliderValue}>{speedMultiplier}x Speed</span>
                </div>
                <div className={styles.playbackRow}>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => setIsPlaying((p) => !p)}
                    disabled={isHalted}
                  >
                    <Icon name={isPlaying ? 'pause' : 'play'} size={14} />
                    <span>{isPlaying ? 'Pause' : 'Run Clock'}</span>
                  </button>

                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleStep}
                    disabled={isHalted}
                  >
                    <Icon name="skip-forward" size={14} />
                    <span>Step Cycle (1 Step)</span>
                  </button>

                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => handleSelectProgram(selectedProgram)}
                  >
                    <Icon name="rotate-ccw" size={14} />
                    <span>Reset Tape</span>
                  </button>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={speedMultiplier}
                  onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                  className={styles.rangeInput}
                />
              </div>

              <div className={styles.sliderCard}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Program Description</span>
                  <span className={styles.sliderValue} style={{ color: PROGRAMS[selectedProgram].guaranteedHalt ? '#34d399' : '#fbbf24' }}>
                    {PROGRAMS[selectedProgram].guaranteedHalt ? 'Halts Cleanly' : 'Infinite Loop / Undecidable'}
                  </span>
                </div>
                <p className={styles.sliderDesc}>
                  {PROGRAMS[selectedProgram].desc}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Mode 2: Paradox Breakdown Controls */}
        {activeMode === 'paradoxProof' && (
          <>
            <div className={styles.paradoxBox}>
              <div className={styles.paradoxTitle}>
                <Icon name="alert" size={15} />
                <span>Alan Turing&apos;s 1936 Diagonalization Proof</span>
              </div>
              <div className={styles.paradoxFormula}>
                def Opposite(X): if Halt(X, X) == TRUE: loop_forever() else: halt()
              </div>
              <p className={styles.paradoxExplain}>
                Suppose an omniscient compiler oracle <strong>Halt(P, I)</strong> exists. We feed <em>Opposite</em> into itself as its own input: <strong>Opposite(Opposite)</strong>.
              </p>
            </div>

            <div className={styles.controlRow}>
              <div className={styles.sliderCard}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Oracle Hypothesis: What Does Halt() Predict?</span>
                  <span className={styles.sliderValue} style={{ color: oraclePrediction === 'HALTS' ? '#34d399' : '#f87171' }}>
                    {oraclePrediction}
                  </span>
                </div>
                <div className={styles.presetRow}>
                  <button
                    type="button"
                    className={`${styles.presetBtn} ${oraclePrediction === 'HALTS' ? styles.presetBtnActive : ''}`}
                    onClick={() => setOraclePrediction('HALTS')}
                  >
                    <Icon name="check" size={13} />
                    <span>Hypothesis A: Halt says Opposite will HALT</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.presetBtn} ${oraclePrediction === 'LOOPS' ? styles.presetBtnActive : ''}`}
                    onClick={() => setOraclePrediction('LOOPS')}
                  >
                    <Icon name="rotate-ccw" size={13} />
                    <span>Hypothesis B: Halt says Opposite will LOOP</span>
                  </button>
                </div>
                <p className={styles.sliderDesc}>
                  {oraclePrediction === 'HALTS'
                    ? '⚠️ If Halt returns TRUE, Opposite executes "while True: pass" and runs forever. Therefore, Halt was WRONG.'
                    : '⚠️ If Halt returns FALSE, Opposite immediately returns 0 and halts. Therefore, Halt was WRONG AGAIN.'}
                </p>
              </div>

              <div className={styles.sliderCard}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Mathematical Conclusion</span>
                  <span className={styles.sliderValue} style={{ color: '#ef4444' }}>
                    Contradiction Absolute
                  </span>
                </div>
                <p className={styles.sliderDesc}>
                  Because Halt() fails in both cases, the premise is false. <strong>No general algorithm can ever exist that solves the Halting Problem for all programs.</strong>
                </p>
              </div>
            </div>
          </>
        )}

        {/* Mode 3: Busy Beaver & Rice's Theorem Controls */}
        {activeMode === 'undecidability' && (
          <div className={styles.controlRow}>
            <div className={styles.sliderCard}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>Busy Beaver State Count (n)</span>
                <span className={styles.sliderValue}>n = {busyBeaverN} States</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={busyBeaverN}
                onChange={(e) => setBusyBeaverN(parseInt(e.target.value, 10))}
                className={styles.rangeInput}
              />
              <p className={styles.sliderDesc}>
                The Busy Beaver function $\Sigma(n)$ measures the maximum number of steps an $n$-state Turing machine can execute before halting. It grows faster than ANY computable function.
              </p>
            </div>

            <div className={styles.sliderCard}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>Max Halting Steps / Status</span>
                <span className={styles.sliderValue} style={{ color: busyBeaverN === 5 ? '#ef4444' : '#38bdf8' }}>
                  {bbStats.steps} Steps ({bbStats.status})
                </span>
              </div>
              <p className={styles.sliderDesc}>
                {busyBeaverN <= 4
                  ? `For n=${busyBeaverN}, all machines have been exhaustively simulated and proven to halt in at most ${bbStats.steps} steps.`
                  : 'For n=5, the step count explodes beyond 47 million. Proving whether the remaining candidate machines ever halt requires resolving open mathematical conjectures!'}
              </p>
            </div>
          </div>
        )}

        {/* 3-Card Pedagogical Walkthrough Grid */}
        <div className={styles.pedagogyGrid}>
          <div className={styles.pedagogyCard}>
            <span className={styles.pedagogyStep}>Act I · The Universal Machine</span>
            <h4 className={styles.pedagogyTitle}>Hilbert&apos;s Dream</h4>
            <p className={styles.pedagogyText}>
              In 1900, David Hilbert asked if an automatic mechanical procedure could decide the truth of any mathematical statement. Turing answered with the Universal Machine.
            </p>
          </div>
          <div className={styles.pedagogyCard}>
            <span className={styles.pedagogyStep}>Act II · Self-Reference</span>
            <h4 className={styles.pedagogyTitle}>The Diagonal Trap</h4>
            <p className={styles.pedagogyText}>
              By feeding a program its own code, Turing mirrored Gödel&apos;s incompleteness: systems cannot be completely consistent and completely self-analyzing.
            </p>
          </div>
          <div className={styles.pedagogyCard}>
            <span className={styles.pedagogyStep}>Act III · Modern Security</span>
            <h4 className={styles.pedagogyTitle}>Rice&apos;s Theorem</h4>
            <p className={styles.pedagogyText}>
              Every non-trivial property of software is undecidable. Antivirus software and static code analyzers can never be 100% bug-free by mathematical law.
            </p>
          </div>
        </div>

        {/* Philosophical Insight Card */}
        <div className={styles.insightCard}>
          <strong>Douglas Hofstadter (Gödel, Escher, Bach):</strong> <em>&quot;No matter what formal system you construct, there will always be true statements that escape its proof machinery.&quot;</em> Turing did not discover a failure of engineering; he uncovered the foundational topology of logic.
        </div>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <div className={styles.actionBtnGroup}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => handleSelectProgram('binaryIncrement')}
            >
              <Icon name="rotate-ccw" size={14} />
              <span>Reset to Standard Machine</span>
            </button>

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleRecordRun}
            >
              <Icon name="zap" size={14} />
              <span>Record Undecidability Telemetry</span>
            </button>
          </div>

          {hasRecorded && (
            <span className={styles.actionFeedback}>
              <Icon name="check" size={14} />
              <span>Turing State Synchronized to Cloud Database</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
