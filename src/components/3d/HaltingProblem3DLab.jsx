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
      'q0,1': { write: '0', move: -1, next: 'q0' },
      'q0,0': { write: '1', move: 0, next: 'qHalt' },
      'q0,B': { write: '1', move: 0, next: 'qHalt' },
    },
    guaranteedHalt: true,
    predictedOutcome: 'HALTS',
    codeSnippet: 'n = 11; n = n + 1; halt(n);',
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
    predictedOutcome: 'HALTS',
    codeSnippet: 'execute_finite_automaton(3_states); // Halts at step 14',
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
    predictedOutcome: 'LOOPS',
    codeSnippet: 'while (true) { bounce_left_right(); }',
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
    predictedOutcome: 'PARADOX',
    codeSnippet: 'if (Halt(Opposite, Opposite) == HALTS) loop_forever(); else halt();',
  },
};

export default function HaltingProblem3DLab() {
  const mountRef = useRef(null);

  // ── Mode: 'tapeEngine' | 'paradoxProof' | 'undecidability' ──
  const [activeMode, setActiveMode] = useState('tapeEngine');
  const modeRef = useRef('tapeEngine');

  // ── Program & Execution State ──
  const [selectedProgram, setSelectedProgram] = useState('binaryIncrement');
  const [tape, setTape] = useState(PROGRAMS.binaryIncrement.initialTape);
  const [headPos, setHeadPos] = useState(PROGRAMS.binaryIncrement.initialHead);
  const [state, setState] = useState(PROGRAMS.binaryIncrement.initialState);
  const [stepCount, setStepCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isHalted, setIsHalted] = useState(false);

  // ── Oracle & Inverter Interactive State ──
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [oraclePrediction, setOraclePrediction] = useState('HALTS'); // 'HALTS' | 'LOOPS'
  const [inverterActive, setInverterActive] = useState(true);
  const [isParadoxOverload, setIsParadoxOverload] = useState(true);

  // ── Mode 3: Busy Beaver States ──
  const [busyBeaverN, setBusyBeaverN] = useState(3);

  // ── Telemetry State ──
  const [hasRecorded, setHasRecorded] = useState(false);

  // Sync refs for Three.js animation loop
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speedMultiplier);
  const isHaltedRef = useRef(isHalted);
  const isParadoxRef = useRef(isParadoxOverload);
  const oraclePredRef = useRef(oraclePrediction);
  const inverterActiveRef = useRef(inverterActive);

  useEffect(() => { modeRef.current = activeMode; }, [activeMode]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speedMultiplier; }, [speedMultiplier]);
  useEffect(() => { isHaltedRef.current = isHalted; }, [isHalted]);
  useEffect(() => { isParadoxRef.current = isParadoxOverload; }, [isParadoxOverload]);
  useEffect(() => { oraclePredRef.current = oraclePrediction; }, [oraclePrediction]);
  useEffect(() => { inverterActiveRef.current = inverterActive; }, [inverterActive]);

  // Three.js object references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const flywheelRef = useRef(null);
  const gearMainRef = useRef(null);
  const gearInverterRef = useRef(null);
  const brakeClampRef = useRef(null);
  const scannerLaserRef = useRef(null);
  const holographicCoreRef = useRef(null);
  const greenBulbRef = useRef(null);
  const redBulbRef = useRef(null);
  const sparkParticlesRef = useRef(null);
  const greenLightRef = useRef(null);
  const redLightRef = useRef(null);

  // Select Program
  const handleSelectProgram = useCallback((progKey) => {
    const prog = PROGRAMS[progKey];
    setSelectedProgram(progKey);
    setTape([...prog.initialTape]);
    setHeadPos(prog.initialHead);
    setState(prog.initialState);
    setStepCount(0);
    setIsPlaying(false);

    if (progKey === 'oppositeParadox') {
      setIsParadoxOverload(true);
      setIsHalted(false);
      setInverterActive(true);
    } else {
      setIsParadoxOverload(false);
      setIsHalted(prog.guaranteedHalt);
      setOraclePrediction(prog.predictedOutcome);
    }
  }, []);

  // Single Step Execution
  const handleStep = useCallback(() => {
    if (isHalted && selectedProgram !== 'oppositeParadox') return;

    if (selectedProgram === 'oppositeParadox') {
      setIsParadoxOverload((prev) => !prev);
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

  // Trigger Oracle Scan Analysis
  const handleRunAnalysis = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      if (selectedProgram === 'oppositeParadox') {
        setIsParadoxOverload(true);
      } else {
        setIsParadoxOverload(false);
        setOraclePrediction(PROGRAMS[selectedProgram].predictedOutcome);
      }
      setIsAnalyzing(false);
    }, 900);
  };

  // ── Three.js Simulation Setup ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060810);
    scene.fog = new THREE.FogExp2(0x060810, 0.012);

    const width = mount.clientWidth;
    const height = mount.clientHeight || 580;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 8.8);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Cinematic Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.4);
    scene.add(ambientLight);

    // Warm Key Light (Golden-Amber Spotlight illuminating brass mechanisms)
    const keySpot = new THREE.SpotLight(0xf59e0b, 3.8, 25, Math.PI / 3.5, 0.35, 1.1);
    keySpot.position.set(4.5, 9, 6);
    keySpot.castShadow = true;
    scene.add(keySpot);

    // Cool Rim Light (Cyan metallic edge definition)
    const rimSpot = new THREE.SpotLight(0x38bdf8, 2.6, 22, Math.PI / 3, 0.4, 1.2);
    rimSpot.position.set(-6, 7, -4);
    scene.add(rimSpot);

    // Violet Bottom Glow
    const baseGlow = new THREE.PointLight(0x6366f1, 1.2, 14);
    baseGlow.position.set(0, -1, 2);
    scene.add(baseGlow);

    // Dynamic Oracle Indicator Point Lights
    const greenLight = new THREE.PointLight(0x10b981, 0, 10);
    greenLight.position.set(-1.8, 2.4, 0);
    scene.add(greenLight);
    greenLightRef.current = greenLight;

    const redLight = new THREE.PointLight(0xef4444, 0, 10);
    redLight.position.set(1.8, 2.4, 0);
    scene.add(redLight);
    redLightRef.current = redLight;

    // 4. Laboratory Pedestal & Grid
    const grid = new THREE.GridHelper(26, 26, 0x1e293b, 0x0f172a);
    grid.position.y = -0.01;
    scene.add(grid);

    // Master Apparatus Base
    const baseGeo = new THREE.BoxGeometry(6.4, 0.4, 3.4);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0c0f17,
      roughness: 0.35,
      metalness: 0.9,
    });
    const mainChassis = new THREE.Mesh(baseGeo, baseMat);
    mainChassis.position.set(0, 0.2, 0);
    scene.add(mainChassis);

    // Polished Brass Trim Rails
    const brassTrimMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      roughness: 0.22,
      metalness: 0.95,
    });
    for (const z of [-1.55, 1.55]) {
      const railGeo = new THREE.CylinderGeometry(0.05, 0.05, 6.4, 16);
      const rail = new THREE.Mesh(railGeo, brassTrimMat);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, 0.42, z);
      scene.add(rail);
    }

    // ── Chamber A: The Oracle Holographic Core (Center) ──
    const oracleGroup = new THREE.Group();
    oracleGroup.position.set(0, 0.4, 0);
    scene.add(oracleGroup);

    // Cylindrical Laser Chamber Glass
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
      transmission: 0.85,
      thickness: 0.6,
    });
    const glassCylinderGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.8, 32);
    const glassCylinder = new THREE.Mesh(glassCylinderGeo, glassMat);
    glassCylinder.position.set(0, 1.0, 0);
    oracleGroup.add(glassCylinder);

    // Inner Glowing Hologram Ring
    const holoGeo = new THREE.TorusGeometry(0.55, 0.04, 16, 48);
    const holoMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.5,
      roughness: 0.2,
    });
    const holoRing = new THREE.Mesh(holoGeo, holoMat);
    holoRing.rotation.x = Math.PI / 2;
    holoRing.position.set(0, 1.0, 0);
    oracleGroup.add(holoRing);
    holographicCoreRef.current = holoRing;

    // Laser Scan Disc (Moves up/down during analysis)
    const laserDiscGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.02, 32);
    const laserDiscMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const laserDisc = new THREE.Mesh(laserDiscGeo, laserDiscMat);
    laserDisc.position.set(0, 1.0, 0);
    oracleGroup.add(laserDisc);
    scannerLaserRef.current = laserDisc;

    // ── Dual Decision Bulbs: Left = HALT (Green), Right = LOOP (Red) ──
    function createIndicatorBulb(x, labelColor) {
      const g = new THREE.Group();
      g.position.set(x, 0.4, 0.8);

      const pedestalGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.25, 24);
      const pedestal = new THREE.Mesh(pedestalGeo, brassTrimMat);
      g.add(pedestal);

      const bulbGeo = new THREE.SphereGeometry(0.26, 24, 24);
      const bulbMat = new THREE.MeshStandardMaterial({
        color: labelColor,
        emissive: labelColor,
        emissiveIntensity: 0.5,
        roughness: 0.1,
      });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.y = 0.35;
      g.add(bulb);

      scene.add(g);
      return bulb;
    }

    greenBulbRef.current = createIndicatorBulb(-1.8, 0x10b981);
    redBulbRef.current = createIndicatorBulb(1.8, 0xef4444);

    // ── Chamber B: Physical Execution Mechanism (Kinetic Flywheel & Inverter Brake) ──
    const mechGroup = new THREE.Group();
    mechGroup.position.set(0, 0.4, -0.6);
    scene.add(mechGroup);

    // Massive Brass Flywheel
    const flywheelGeo = new THREE.TorusGeometry(0.85, 0.14, 24, 48);
    const flywheel = new THREE.Mesh(flywheelGeo, brassTrimMat);
    flywheel.position.set(0, 1.0, 0);
    mechGroup.add(flywheel);
    flywheelRef.current = flywheel;

    // Flywheel Spokes
    for (let i = 0; i < 3; i++) {
      const spokeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 12);
      const spoke = new THREE.Mesh(spokeGeo, brassTrimMat);
      spoke.rotation.z = (i * Math.PI) / 3;
      spoke.position.set(0, 1.0, 0);
      mechGroup.add(spoke);
    }

    // Kinetic Gears (Turing Stepper)
    const gearGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 24);
    const gearMain = new THREE.Mesh(gearGeo, brassTrimMat);
    gearMain.position.set(-1.8, 1.0, 0);
    gearMain.rotation.x = Math.PI / 2;
    mechGroup.add(gearMain);
    gearMainRef.current = gearMain;

    const gearInverter = new THREE.Mesh(gearGeo, brassTrimMat);
    gearInverter.position.set(1.8, 1.0, 0);
    gearInverter.rotation.x = Math.PI / 2;
    mechGroup.add(gearInverter);
    gearInverterRef.current = gearInverter;

    // Emergency Brake Clamp Shoe (Drops onto flywheel to force HALT)
    const brakeGeo = new THREE.BoxGeometry(0.5, 0.22, 0.35);
    const brakeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.18,
    });
    const brakeClamp = new THREE.Mesh(brakeGeo, brakeMat);
    brakeClamp.position.set(0, 2.05, 0);
    mechGroup.add(brakeClamp);
    brakeClampRef.current = brakeClamp;

    // Spark Particles for Paradox State
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 2.4;
      particlePos[i + 1] = 0.8 + Math.random() * 1.6;
      particlePos[i + 2] = (Math.random() - 0.5) * 1.8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const sparkParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(sparkParticles);
    sparkParticlesRef.current = sparkParticles;

    // ── Mouse Drag Orbit Controls ──
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = Math.PI / 2;
    let sphericalPhi = 0.42;
    const radius = 9.2;

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
      sphericalPhi = Math.max(0.18, Math.min(Math.PI / 2 - 0.05, sphericalPhi + dy));

      camera.position.x = radius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = radius * Math.cos(sphericalPhi);
      camera.position.z = radius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 0.5, 0);

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => { isDragging = false; };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // ── Animation Loop ──
    let animationId;
    let prevTime = performance.now();
    const startTime = prevTime;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;
      const elapsed = (now - startTime) / 1000;

      // Laser Scanner Sweep
      if (scannerLaserRef.current) {
        scannerLaserRef.current.position.y = 1.0 + Math.sin(elapsed * 4.5) * 0.55;
      }

      // Holographic Ring Rotation
      if (holographicCoreRef.current) {
        holographicCoreRef.current.rotation.z += delta * 1.8;
      }

      // Physical Mechanism Dynamics
      const isParadox = isParadoxRef.current;
      const pred = oraclePredRef.current;
      const inverterOn = inverterActiveRef.current;

      if (isParadox) {
        // Paradox Overload: Flywheel stutters, brake chatters rapidly, indicators strobe
        const strobe = Math.sin(elapsed * 16) > 0;
        if (greenBulbRef.current) {
          greenBulbRef.current.material.emissiveIntensity = strobe ? 4.5 : 0.2;
        }
        if (redBulbRef.current) {
          redBulbRef.current.material.emissiveIntensity = !strobe ? 4.5 : 0.2;
        }
        if (greenLightRef.current) greenLightRef.current.intensity = strobe ? 3.5 : 0;
        if (redLightRef.current) redLightRef.current.intensity = !strobe ? 3.5 : 0;

        if (flywheelRef.current) {
          flywheelRef.current.rotation.z += delta * (Math.sin(elapsed * 12) * 8);
        }
        if (gearMainRef.current) gearMainRef.current.rotation.z += delta * 6;
        if (gearInverterRef.current) gearInverterRef.current.rotation.z -= delta * 6;

        if (brakeClampRef.current) {
          brakeClampRef.current.position.y = 1.85 + Math.sin(elapsed * 24) * 0.15;
        }

        // Active Sparks
        if (sparkParticlesRef.current) {
          sparkParticlesRef.current.visible = true;
          const pos = sparkParticlesRef.current.geometry.attributes.position.array;
          for (let i = 0; i < pos.length; i += 3) {
            pos[i + 1] += delta * (1.2 + Math.random() * 0.8);
            if (pos[i + 1] > 2.4) pos[i + 1] = 0.8;
          }
          sparkParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
      } else {
        // Stable State: Oracle prediction lighting
        const willHalt = pred === 'HALTS';
        const machineRuns = !willHalt || (inverterOn && willHalt);

        if (greenBulbRef.current) {
          greenBulbRef.current.material.emissiveIntensity = willHalt ? 4.0 : 0.3;
        }
        if (redBulbRef.current) {
          redBulbRef.current.material.emissiveIntensity = !willHalt ? 4.0 : 0.3;
        }
        if (greenLightRef.current) greenLightRef.current.intensity = willHalt ? 3.0 : 0.2;
        if (redLightRef.current) redLightRef.current.intensity = !willHalt ? 3.0 : 0.2;

        if (sparkParticlesRef.current) {
          sparkParticlesRef.current.visible = false;
        }

        // Brake Position
        if (brakeClampRef.current) {
          const targetY = willHalt && !inverterOn ? 1.72 : 2.15;
          brakeClampRef.current.position.y += (targetY - brakeClampRef.current.position.y) * 0.1;
        }

        // Flywheel Spin
        if (flywheelRef.current) {
          const spinSpeed = machineRuns ? 4.5 * (speedRef.current || 1) : 0;
          flywheelRef.current.rotation.z += delta * spinSpeed;
        }
        if (gearMainRef.current) {
          const spinSpeed = machineRuns ? 4.5 * (speedRef.current || 1) : 0;
          gearMainRef.current.rotation.z += delta * spinSpeed;
        }
        if (gearInverterRef.current) {
          const spinSpeed = machineRuns ? 4.5 * (speedRef.current || 1) : 0;
          gearInverterRef.current.rotation.z -= delta * spinSpeed;
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
      paradox: isParadoxOverload,
      busyBeaverN,
    });
    setHasRecorded(true);
    setTimeout(() => setHasRecorded(false), 2400);
  }, [selectedProgram, stepCount, isHalted, isParadoxOverload, busyBeaverN]);

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
              <Icon name="code" size={13} />
              <span>Theoretical Computer Science &amp; Decidability</span>
            </div>
            <h2 className={styles.labTitle}>Turing Halting Problem — The Incomputable Horizon</h2>
          </div>

          <div className={styles.statsCluster}>
            <div className={`${styles.statPill} ${isHalted ? styles.statPillHalted : isParadoxOverload ? styles.statPillParadox : styles.statPillLoop}`}>
              <span className={styles.statLabel}>Machine Status</span>
              <span className={`${styles.statValue} ${isHalted ? styles.statValueHalted : isParadoxOverload ? styles.statValueParadox : styles.statValueLoop}`}>
                {isParadoxOverload ? 'PARADOX BREAKDOWN' : isHalted ? 'HALTED (Normal Exit)' : 'EXECUTING (Looping)'}
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
            <Icon name="layers" size={13} />
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
            <Icon name="network" size={13} />
            <span>3. Busy Beaver &amp; Rice&apos;s Theorem</span>
          </button>
        </div>

        {/* 3D WebGL Canvas */}
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Floating In-Canvas Badges */}
        <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightLeft}`}>
          <Icon name="eye" size={12} />
          <span>Oracle Core: {isParadoxOverload ? 'CONTRADICTION DETECTED' : `PREDICTS ${oraclePrediction}`}</span>
        </div>
        <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightCenter}`}>
          <Icon name="code" size={12} />
          <span>Code: {PROGRAMS[selectedProgram]?.name}</span>
        </div>
        <div className={`${styles.inCanvasBadge} ${styles.badgeHighlightRight}`}>
          <Icon name="zap" size={12} />
          <span>Decidability: {isParadoxOverload ? '0% (Logically Impossible)' : '100% (Pre-evaluated)'}</span>
        </div>
      </div>

      {/* Interactive Controls Panel */}
      <div className={styles.controlPanel}>
        {/* Mode 2: Paradox Breakdown Controls (Primary Simplified View) */}
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
                Can we build a master program <strong>Halt(P, I)</strong> that inspects any code and predicts whether it finishes or runs forever?
                Alan Turing constructed a troublemaker program called <strong>Opposite</strong> that asks the Oracle what it will do, and then deliberately does the reverse.
              </p>
            </div>

            <div className={styles.controlRow}>
              {/* Hypothesis Selection */}
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
                    className={`${styles.presetBtn} ${oraclePrediction === 'HALTS' && !isParadoxOverload ? styles.presetBtnActive : ''}`}
                    onClick={() => {
                      setOraclePrediction('HALTS');
                      setIsParadoxOverload(false);
                      setIsHalted(true);
                    }}
                  >
                    <Icon name="check" size={13} />
                    <span>Hypothesis A: Halt says Opposite will HALT</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.presetBtn} ${oraclePrediction === 'LOOPS' && !isParadoxOverload ? styles.presetBtnActive : ''}`}
                    onClick={() => {
                      setOraclePrediction('LOOPS');
                      setIsParadoxOverload(false);
                      setIsHalted(false);
                    }}
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

                {/* Paradox Overload Trigger */}
                <div style={{ marginTop: '14px' }}>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                    onClick={() => {
                      setIsParadoxOverload(true);
                      handleSelectProgram('oppositeParadox');
                    }}
                  >
                    <Icon name="zap" size={14} />
                    <span>Feed Opposite into Itself: Opposite(Opposite)</span>
                  </button>
                </div>
              </div>

              {/* Mathematical Conclusion */}
              <div className={styles.sliderCard}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Mathematical Conclusion</span>
                  <span className={styles.sliderValue} style={{ color: '#ef4444' }}>
                    Contradiction Absolute
                  </span>
                </div>
                <p className={styles.sliderDesc}>
                  Because Halt() fails in both cases, the initial premise is false. <strong>No general algorithm can ever exist that solves the Halting Problem for all programs.</strong>
                </p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleStep}
                  >
                    <Icon name="arrow-right" size={13} />
                    <span>Step Cycle (1 Step)</span>
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                  >
                    <Icon name="search" size={13} />
                    <span>{isAnalyzing ? 'Scanning Holographic Core...' : 'Re-Analyze Oracle'}</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mode 1: Tape Engine Controls (Mechanical Implementation Details) */}
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
                    <Icon name="arrow-right" size={14} />
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
                  aria-label="Speed multiplier"
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
                aria-label="Busy beaver state count"
              />
              <p className={styles.sliderDesc}>
                The Busy Beaver function measures the maximum number of steps an n-state Turing machine can execute before halting. It grows faster than ANY computable function.
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
