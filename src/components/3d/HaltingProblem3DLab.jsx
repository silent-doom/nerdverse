'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './HaltingProblem3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

// Audio Synthesizer for Authentic Mechanical Turing Machine
function playTuringSound(type = 'step', freq = 320) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'stamp') {
      // Typewriter hammer punch
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'bell') {
      // Vintage carriage bell on HALT
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.5, ctx.currentTime); // E6
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'chatter') {
      // Paradox relay chatter
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else {
      // Ratchet stepper click
      osc.type = 'square';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    }
  } catch {
    // Audio context may require user gesture
  }
}

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
  const [activeHypothesis, setActiveHypothesis] = useState('hypothesisA'); // 'hypothesisA' | 'hypothesisB'

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
  const headPosRef = useRef(headPos);
  const stateRef = useRef(state);
  const tapeRef = useRef(tape);

  useEffect(() => { modeRef.current = activeMode; }, [activeMode]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speedMultiplier; }, [speedMultiplier]);
  useEffect(() => { isHaltedRef.current = isHalted; }, [isHalted]);
  useEffect(() => { isParadoxRef.current = isParadoxOverload; }, [isParadoxOverload]);
  useEffect(() => { oraclePredRef.current = oraclePrediction; }, [oraclePrediction]);
  useEffect(() => { inverterActiveRef.current = inverterActive; }, [inverterActive]);
  useEffect(() => { headPosRef.current = headPos; }, [headPos]);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { tapeRef.current = tape; }, [tape]);

  // Three.js object references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const carriageGroupRef = useRef(null);
  const stampHeadRef = useRef(null);
  const stateDrumRef = useRef(null);
  const tapeCellsGroupRef = useRef(null);
  const leftSpoolRef = useRef(null);
  const rightSpoolRef = useRef(null);
  const greenBulbRef = useRef(null);
  const redBulbRef = useRef(null);
  const paradoxArcRef = useRef(null);
  const rockerArmRef = useRef(null);

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
      setIsHalted(false);
      setOraclePrediction(prog.predictedOutcome);
    }
    playTuringSound('step');
  }, []);

  // Single Step Execution
  const handleStep = useCallback(() => {
    if (isHalted && selectedProgram !== 'oppositeParadox') return;

    if (selectedProgram === 'oppositeParadox') {
      setIsParadoxOverload((prev) => !prev);
      setStepCount((prev) => prev + 1);
      playTuringSound('chatter', Math.random() > 0.5 ? 400 : 280);
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
      playTuringSound('bell');
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

    // Mechanical audio
    playTuringSound('stamp');
  }, [isHalted, selectedProgram, tape, headPos, state]);

  // Autoplay ticker
  useEffect(() => {
    if (!isPlaying || isHalted) return;
    const intervalTime = Math.max(160, 650 / speedMultiplier);
    const timer = setInterval(() => {
      handleStep();
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, isHalted, speedMultiplier, handleStep]);

  // Trigger Oracle Scan Analysis
  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    playTuringSound('step', 500);

    setTimeout(() => {
      if (selectedProgram === 'oppositeParadox') {
        setIsParadoxOverload(true);
        playTuringSound('chatter', 350);
      } else {
        setIsParadoxOverload(false);
        setOraclePrediction(PROGRAMS[selectedProgram].predictedOutcome);
        playTuringSound('step', 600);
      }
      setIsAnalyzing(false);
    }, 850);
  };

  // ── Helper to build 3D Tape Cells with visible printed symbols ──
  const updateTapeCellsIn3D = useCallback((scene, tapeData, activeHead) => {
    if (!tapeCellsGroupRef.current) return;
    const group = tapeCellsGroupRef.current;

    // Remove existing cell meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }

    const cellWidth = 0.82;
    const totalCells = tapeData.length;
    const tapeLength = Math.max(8, totalCells * cellWidth + 1.2);

    // 1. Continuous Paper Ribbon
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xfbf7eb,
      roughness: 0.8,
      metalness: 0.05,
    });
    const ribbonGeo = new THREE.BoxGeometry(tapeLength, 0.02, 0.68);
    const ribbon = new THREE.Mesh(ribbonGeo, paperMat);
    ribbon.position.set(0, 0.51, 0);
    ribbon.receiveShadow = true;
    group.add(ribbon);

    // 2. Individual cells with printed border and 3D symbol marker
    const startX = -((totalCells - 1) * cellWidth) / 2;

    tapeData.forEach((sym, idx) => {
      const cellX = startX + idx * cellWidth;
      const isHead = idx === activeHead;

      // Cell border square
      const borderGeo = new THREE.BoxGeometry(0.74, 0.025, 0.6);
      const borderMat = new THREE.MeshStandardMaterial({
        color: isHead ? 0xf59e0b : 0xe2d9c0,
        roughness: 0.7,
        metalness: 0.1,
      });
      const borderMesh = new THREE.Mesh(borderGeo, borderMat);
      borderMesh.position.set(cellX, 0.52, 0);
      group.add(borderMesh);

      // 3D Symbol Representation
      // '1' = High-contrast dark brass bar
      // '0' = Ring torus
      // 'B' = Subtle blank indentation
      // 'P' = Paradox diamond
      if (sym === '1') {
        const barGeo = new THREE.BoxGeometry(0.12, 0.04, 0.36);
        const barMat = new THREE.MeshStandardMaterial({
          color: isHead ? 0x0f172a : 0x1e293b,
          roughness: 0.3,
          metalness: 0.8,
        });
        const barMesh = new THREE.Mesh(barGeo, barMat);
        barMesh.position.set(cellX, 0.54, 0);
        group.add(barMesh);
      } else if (sym === '0') {
        const ringGeo = new THREE.TorusGeometry(0.16, 0.04, 8, 20);
        const ringMat = new THREE.MeshStandardMaterial({
          color: isHead ? 0x0f172a : 0x475569,
          roughness: 0.4,
          metalness: 0.6,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.set(cellX, 0.54, 0);
        group.add(ringMesh);
      } else if (sym === 'P') {
        // Paradox Gödel Token
        const diaGeo = new THREE.ConeGeometry(0.16, 0.22, 4);
        const diaMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xef4444,
          emissiveIntensity: 0.6,
          metalness: 0.8,
        });
        const diaMesh = new THREE.Mesh(diaGeo, diaMat);
        diaMesh.rotation.y = Math.PI / 4;
        diaMesh.position.set(cellX, 0.58, 0);
        group.add(diaMesh);
      } else {
        // Blank cell 'B' dash
        const dashGeo = new THREE.BoxGeometry(0.2, 0.02, 0.05);
        const dashMat = new THREE.MeshStandardMaterial({ color: 0xc8bba0, roughness: 0.9 });
        const dash = new THREE.Mesh(dashGeo, dashMat);
        dash.position.set(cellX, 0.53, 0);
        group.add(dash);
      }
    });
  }, []);

  // Update 3D tape when tape state changes
  useEffect(() => {
    if (sceneRef.current) {
      updateTapeCellsIn3D(sceneRef.current, tape, headPos);
    }
  }, [tape, headPos, updateTapeCellsIn3D]);

  // ── Three.js Simulation Setup (Realistic 1936 Electro-Mechanical Machine) ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0c14);
    scene.fog = new THREE.FogExp2(0x0a0c14, 0.015);

    const width = mount.clientWidth;
    const height = mount.clientHeight || 580;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.4, 7.8);
    camera.lookAt(0, 0.6, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    if (renderer.shadowMap) renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── 3. Realistic Studio & Banker's Lamp Lighting ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Warm Banker's Lamp Spotlight (Vintage Emerald Glass Desk Lamp casting a warm cone)
    const deskLampSpot = new THREE.SpotLight(0xfef08a, 4.2, 14, Math.PI / 3.8, 0.35, 1.1);
    deskLampSpot.position.set(0, 4.6, 1.8);
    deskLampSpot.target.position.set(0, 0.5, 0);
    deskLampSpot.castShadow = true;
    scene.add(deskLampSpot);
    scene.add(deskLampSpot.target);

    // Cool Cyan Rim Light (Highlights polished steel guide rails and brass spools)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(-6, 6, -4);
    scene.add(rimLight);

    const warmFill = new THREE.DirectionalLight(0xf59e0b, 1.0);
    warmFill.position.set(6, 4, 3);
    scene.add(warmFill);

    // Dynamic Indicator Lights
    const greenLight = new THREE.PointLight(0x10b981, 0, 8);
    greenLight.position.set(-2.2, 2.0, 0.5);
    scene.add(greenLight);

    const redLight = new THREE.PointLight(0xef4444, 0, 8);
    redLight.position.set(2.2, 2.0, 0.5);
    scene.add(redLight);

    // ── 4. Polished Walnut / Teak Laboratory Workbench ──
    const benchGeo = new THREE.BoxGeometry(8.2, 0.4, 4.2);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x1f1510,
      roughness: 0.65,
      metalness: 0.15,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, 0.2, 0);
    bench.receiveShadow = true;
    scene.add(bench);

    // Cast Iron Chassis Plate
    const chassisGeo = new THREE.BoxGeometry(7.0, 0.1, 2.8);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.4,
      metalness: 0.85,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.set(0, 0.45, 0);
    scene.add(chassis);

    // Solid Brass Materials
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xdfa037,
      roughness: 0.28,
      metalness: 0.92,
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.2,
      metalness: 0.95,
    });

    // ── 5. Twin Brass Tape Reels (Feed & Takeup Spools) ──
    const createSpool = (x) => {
      const g = new THREE.Group();
      g.position.set(x, 0.9, 0);

      // Center Spindle
      const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 24), steelMat);
      g.add(spindle);

      // Flange Plates (Top & Bottom Discs)
      for (const y of [-0.3, 0.3]) {
        const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.04, 32), brassMat);
        flange.position.y = y;
        g.add(flange);
      }

      // Rolled paper ribbon core
      const rollMat = new THREE.MeshStandardMaterial({ color: 0xf3ede0, roughness: 0.8 });
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.55, 32), rollMat);
      g.add(roll);

      // Mount bracket
      const mount = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.3), chassisMat);
      mount.position.set(0, -0.4, 0);
      g.add(mount);

      scene.add(g);
      return g;
    };

    leftSpoolRef.current = createSpool(-3.1);
    rightSpoolRef.current = createSpool(3.1);

    // ── 6. Paper Tape Group (Dynamic 3D Cells) ──
    const tapeCellsGroup = new THREE.Group();
    scene.add(tapeCellsGroup);
    tapeCellsGroupRef.current = tapeCellsGroup;

    // Initial 3D tape generation
    updateTapeCellsIn3D(scene, tapeRef.current, headPosRef.current);

    // ── 7. Guide Rails & Scanner Carriage (Turing Read/Write Head) ──
    // Twin Polished Steel Guide Rails
    for (const z of [-0.6, 0.6]) {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 6.2, 16), steelMat);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, 1.25, z);
      scene.add(rail);
    }

    // The Mechanical Carriage Group (Moves along the rails to match headPos)
    const carriage = new THREE.Group();
    carriage.position.set(0, 1.25, 0);
    scene.add(carriage);
    carriageGroupRef.current = carriage;

    // Carriage Body Block (Heavy Brass & Steel Crosshead)
    const carriageBody = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.32, 1.4), brassMat);
    carriageBody.position.set(0, 0, 0);
    carriage.add(carriageBody);

    // Carriage Bushings on rails
    for (const z of [-0.6, 0.6]) {
      const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 16), brassMat);
      bushing.rotation.z = Math.PI / 2;
      bushing.position.set(0, 0, z);
      carriage.add(bushing);
    }

    // Vertical Stamping Stylus / Hammer
    const stampGroup = new THREE.Group();
    stampGroup.position.set(0, -0.16, 0);
    carriage.add(stampGroup);
    stampHeadRef.current = stampGroup;

    const stampShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 16), steelMat);
    stampShaft.position.set(0, -0.2, 0);
    stampGroup.add(stampShaft);

    const stampHead = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.12, 16), brassMat);
    stampHead.position.set(0, -0.48, 0);
    stampGroup.add(stampHead);

    // Cylindrical Mechanical State Drum (Geneva State Register atop carriage)
    const drumGroup = new THREE.Group();
    drumGroup.position.set(0, 0.4, 0);
    carriage.add(drumGroup);
    stateDrumRef.current = drumGroup;

    const drumGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.45, 24);
    const drumMesh = new THREE.Mesh(drumGeo, brassMat);
    drumMesh.rotation.z = Math.PI / 2;
    drumGroup.add(drumMesh);

    // State Indicator Window Bezel
    const bezelGeo = new THREE.BoxGeometry(0.35, 0.18, 0.22);
    const bezel = new THREE.Mesh(bezelGeo, chassisMat);
    bezel.position.set(0, 0, 0.32);
    drumGroup.add(bezel);

    // ── 8. The Halting Problem Analyzer & Inverter Linkage (Rear Console) ──
    const analyzerModule = new THREE.Group();
    analyzerModule.position.set(0, 0.5, -1.2);
    scene.add(analyzerModule);

    // Analyzer Housing with Louvers
    const housing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 0.75), chassisMat);
    housing.position.set(0, 0.7, 0);
    analyzerModule.add(housing);

    // Engraved Brass Nameplate: "DECISION ORACLE H (TURING 1936)"
    const plaqueMat = new THREE.MeshStandardMaterial({ color: 0xdfa037, metalness: 0.9, roughness: 0.25 });
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 0.04), plaqueMat);
    plaque.position.set(0, 1.15, 0.39);
    analyzerModule.add(plaque);

    // Dual Semaphore Signal Flags / Indicator Bulbs:
    // Left = HALT (Green), Right = LOOP FOREVER (Red)
    const createIndicator = (x, colorHex, label) => {
      const g = new THREE.Group();
      g.position.set(x, 1.4, 0);

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12), brassMat);
      g.add(post);

      const bulbMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.4,
        roughness: 0.2,
      });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), bulbMat);
      bulb.position.y = 0.25;
      g.add(bulb);

      analyzerModule.add(g);
      return bulb;
    };

    greenBulbRef.current = createIndicator(-1.2, 0x10b981, 'HALT');
    redBulbRef.current = createIndicator(1.2, 0xef4444, 'LOOP');

    // Diagonal Inverter Rocker Arm (Mechanical feedback linkage)
    const rockerArm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.12), steelMat);
    rockerArm.position.set(0, 0.9, 0.45);
    analyzerModule.add(rockerArm);
    rockerArmRef.current = rockerArm;

    // Paradox Contradiction Lightning Arc (Active in paradox overload)
    const arcGeo = new THREE.BufferGeometry();
    const arcCount = 20;
    const arcPositions = new Float32Array(arcCount * 3);
    for (let i = 0; i < arcCount * 3; i += 3) {
      arcPositions[i] = (Math.random() - 0.5) * 1.8;
      arcPositions[i + 1] = 0.8 + Math.random() * 0.8;
      arcPositions[i + 2] = -0.5 + Math.random() * 0.5;
    }
    arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));
    const arcMat = new THREE.LineBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const paradoxArc = new THREE.Line(arcGeo, arcMat);
    paradoxArc.visible = false;
    scene.add(paradoxArc);
    paradoxArcRef.current = paradoxArc;

    // ── Mouse Drag Orbit Controls ──
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = Math.PI / 2;
    let sphericalPhi = 0.48;
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
      sphericalPhi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, sphericalPhi + dy));

      camera.position.x = radius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = radius * Math.cos(sphericalPhi);
      camera.position.z = radius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 0.6, 0);

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

      // 1. Carriage Smooth Horizontal Interpolation to active headPos
      if (carriageGroupRef.current) {
        const cellWidth = 0.82;
        const totalCells = tapeRef.current.length;
        const startX = -((totalCells - 1) * cellWidth) / 2;
        const targetX = startX + headPosRef.current * cellWidth;

        carriageGroupRef.current.position.x += (targetX - carriageGroupRef.current.position.x) * 0.22;
      }

      // 2. Tape Spools Rotation during tape motion
      if (leftSpoolRef.current && rightSpoolRef.current) {
        if (isPlayingRef.current) {
          const spin = delta * 2.5 * (speedRef.current || 1);
          leftSpoolRef.current.rotation.y += spin;
          rightSpoolRef.current.rotation.y += spin;
        }
      }

      // 3. State Drum Rotation when state changes
      if (stateDrumRef.current) {
        const stateStr = stateRef.current;
        let targetRot = 0;
        if (stateStr === 'q1' || stateStr === 'qB') targetRot = Math.PI / 2;
        else if (stateStr === 'qC' || stateStr === 'qLoopB') targetRot = Math.PI;
        else if (stateStr === 'qHalt') targetRot = Math.PI * 1.5;

        stateDrumRef.current.rotation.x += (targetRot - stateDrumRef.current.rotation.x) * 0.2;
      }

      // 4. Stamping pin vertical strike animation
      if (stampHeadRef.current) {
        // Quick subtle bob on steps
        const bob = Math.sin(elapsed * 12) * 0.04;
        stampHeadRef.current.position.y = -0.16 + (isPlayingRef.current ? bob : 0);
      }

      // 5. Halting Problem Paradox & Indicator Logic
      const isParadox = isParadoxRef.current;
      const pred = oraclePredRef.current;

      if (isParadox) {
        // Contradiction Deadlock: Rocker arm oscillates wildly, indicators strobe
        const strobe = Math.sin(elapsed * 18) > 0;
        if (greenBulbRef.current) greenBulbRef.current.material.emissiveIntensity = strobe ? 4.5 : 0.2;
        if (redBulbRef.current) redBulbRef.current.material.emissiveIntensity = !strobe ? 4.5 : 0.2;
        if (greenLight) greenLight.intensity = strobe ? 3.0 : 0;
        if (redLight) redLight.intensity = !strobe ? 3.0 : 0;

        if (rockerArmRef.current) {
          rockerArmRef.current.rotation.z = Math.sin(elapsed * 24) * 0.35;
        }

        if (paradoxArcRef.current) {
          paradoxArcRef.current.visible = true;
          const pos = paradoxArcRef.current.geometry.attributes.position.array;
          for (let i = 0; i < pos.length; i += 3) {
            pos[i] = (Math.random() - 0.5) * 1.8;
            pos[i + 1] = 0.8 + Math.random() * 0.8;
          }
          paradoxArcRef.current.geometry.attributes.position.needsUpdate = true;
        }
      } else {
        const willHalt = pred === 'HALTS';
        if (greenBulbRef.current) greenBulbRef.current.material.emissiveIntensity = willHalt ? 4.0 : 0.2;
        if (redBulbRef.current) redBulbRef.current.material.emissiveIntensity = !willHalt ? 4.0 : 0.2;
        if (greenLight) greenLight.intensity = willHalt ? 3.0 : 0.2;
        if (redLight) redLight.intensity = !willHalt ? 3.0 : 0.2;

        if (rockerArmRef.current) {
          const targetAngle = willHalt ? 0.25 : -0.25;
          rockerArmRef.current.rotation.z += (targetAngle - rockerArmRef.current.rotation.z) * 0.15;
        }

        if (paradoxArcRef.current) paradoxArcRef.current.visible = false;
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
  }, [updateTapeCellsIn3D]);

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
    <div
      className={styles.labContainer}
      aria-label="Turing Halting Problem 3D Interactive Lab"
      data-testid="halting-problem-3d-lab"
    >
      {/* 3D Canvas Area */}
      <div className={styles.canvasContainer}>
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Top Floating Header & Realtime Telemetry Badges */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="cpu" size={13} />
              Alan Turing 1936 Computability Apparatus
            </div>
            <h2 className={styles.labTitle}>Turing Halting Problem — The Incomputable Horizon</h2>
          </div>

          <div className={styles.statsCluster}>
            <div className={`${styles.statPill} ${isHalted ? styles.statPillHalted : ''}`}>
              <span className={styles.statLabel}>Machine Status</span>
              <span className={styles.statValue}>
                {isParadoxOverload
                  ? 'PARADOX DEADLOCK (H ≠ g)'
                  : isHalted
                  ? 'HALTED (Terminal State)'
                  : isPlaying
                  ? 'COMPUTING CYCLE...'
                  : 'READY'}
              </span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Internal State / Clock Steps</span>
              <span className={styles.statValue}>
                <span className={styles.stateChip}>{state}</span> | {stepCount} Steps
              </span>
            </div>
          </div>
        </div>

        {/* 3D Scene Controls Overlay */}
        <div className={styles.overlayControls}>
          <div className={styles.tapeFeedCard}>
            <span className={styles.tapeFeedLabel}>Infinite Tape (Paper Strip) Head Position: Cell [{headPos}]</span>
            <div className={styles.tapeStripVisual}>
              {tape.map((symbol, idx) => (
                <div
                  key={`tape-cell-${idx}`}
                  className={`${styles.tapeCell} ${idx === headPos ? styles.tapeCellActive : ''}`}
                >
                  <span className={styles.cellSymbol}>{symbol}</span>
                  <span className={styles.cellIndex}>{idx}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Control Deck */}
      <div className={styles.controlDeck}>
        {/* Navigation Tabs */}
        <div className={styles.tabsRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeMode === 'tapeEngine' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveMode('tapeEngine')}
          >
            <Icon name="cpu" size={14} />
            1. Mechanical Tape Engine (1936)
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeMode === 'paradoxProof' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveMode('paradoxProof')}
          >
            <Icon name="zap" size={14} />
            2. The Opposite(Opposite) Paradox
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeMode === 'undecidability' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveMode('undecidability')}
          >
            <Icon name="code" size={14} />
            3. Busy Beaver & Rice&apos;s Theorem
          </button>
        </div>

        {/* ── MODE 1: Mechanical Tape Engine (1936) ── */}
        {activeMode === 'tapeEngine' && (
          <div className={styles.modeSection}>
            {/* Quick Banner for the Paradox */}
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(56, 189, 248, 0.08) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                <strong style={{ color: '#fbbf24' }}>⚡ Alan Turing&apos;s 1936 Thought Experiment:</strong>
                {' '}Can a general machine H read any program tape and predict whether it halts or loops forever?
              </div>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setActiveMode('paradoxProof')}
                style={{ borderColor: '#f59e0b', color: '#fbbf24', fontSize: '12px', padding: '6px 12px' }}
              >
                Inspect Paradox Proof →
              </button>
            </div>

            <div className={styles.controlsGrid}>
              {/* Program Selector Card */}
              <div className={styles.controlCard}>
                <div className={styles.cardHeader}>
                  <span>Select Turing Program Tape</span>
                  <span className={styles.cardSubtitle}>Historical & Theoretical Machines</span>
                </div>
                <div className={styles.programGrid}>
                  {Object.entries(PROGRAMS).map(([key, prog]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.progBtn} ${selectedProgram === key ? styles.progBtnActive : ''}`}
                      onClick={() => handleSelectProgram(key)}
                    >
                      <div className={styles.progBtnTitle}>{prog.name}</div>
                      <div className={styles.progBtnDesc}>{prog.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Execution Controls Card */}
              <div className={styles.controlCard}>
                <div className={styles.cardHeader}>
                  <span>Execution Controls</span>
                  <span className={styles.cardSubtitle}>Mechanical Stepping</span>
                </div>

                <div className={styles.actionRow}>
                  <button
                    type="button"
                    className={`${styles.primaryBtn} ${isPlaying ? styles.paused : ''}`}
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={isHalted && selectedProgram !== 'oppositeParadox'}
                  >
                    <Icon name={isPlaying ? 'pause' : 'play'} size={15} />
                    {isPlaying ? 'Halt Clock' : 'Run Clock (Auto-Step)'}
                  </button>

                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={handleStep}
                    disabled={isPlaying || (isHalted && selectedProgram !== 'oppositeParadox')}
                  >
                    <Icon name="chevron-right" size={15} />
                    Step Cycle (1 Step)
                  </button>

                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => handleSelectProgram(selectedProgram)}
                  >
                    <Icon name="refresh" size={15} />
                    Reset Tape
                  </button>
                </div>

                {/* Speed Slider */}
                <div className={styles.sliderBox}>
                  <div className={styles.sliderHeader}>
                    <span>Clock Speed Multiplier</span>
                    <span className={styles.sliderValue}>{speedMultiplier}x Speed</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={speedMultiplier}
                    onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                    className={styles.rangeInput}
                    aria-label="Speed Multiplier"
                  />
                </div>

                {/* Oracle Scan Trigger */}
                <button
                  type="button"
                  className={styles.oracleBtn}
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                >
                  <Icon name="sparkles" size={14} />
                  {isAnalyzing ? 'Scanning Blueprint Tape...' : 'Consult Oracle Machine H'}
                </button>

                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={handleRecordRun}
                  style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}
                >
                  <Icon name="check" size={14} />
                  {hasRecorded ? 'Turing State Synchronized to Cloud Database' : 'Record Undecidability Telemetry'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODE 2: The Opposite(Opposite) Paradox ── */}
        {activeMode === 'paradoxProof' && (
          <div className={styles.modeSection}>
            <div className={styles.paradoxBanner}>
              <div className={styles.paradoxTitle}>
                <Icon name="alert-triangle" size={18} />
                Alan Turing&apos;s 1936 Diagonalization Proof
              </div>
              <p className={styles.paradoxExplanation}>
                Assume a hypothetical oracle algorithm <code>Halt(P, I)</code> exists that infallibly determines whether any program <code>P</code> with input <code>I</code> halts.
                We construct a malicious diagonal program <code>Opposite(P)</code> that queries <code>Halt(P, P)</code> and deliberately does the exact opposite:
              </p>
            </div>

            <div className={styles.controlsGrid}>
              <div className={styles.controlCard}>
                <div className={styles.cardHeader}>
                  <span>The Contradiction Inverter</span>
                  <span className={styles.cardSubtitle}>Test the Self-Referential Deadlock</span>
                </div>

                <div className={styles.hypothesisSelector}>
                  <button
                    type="button"
                    className={`${styles.hypoBtn} ${activeHypothesis === 'hypothesisA' ? styles.hypoBtnActive : ''}`}
                    onClick={() => {
                      setActiveHypothesis('hypothesisA');
                      setOraclePrediction('HALTS');
                      setIsParadoxOverload(true);
                      playTuringSound('chatter', 420);
                    }}
                  >
                    Hypothesis A: Halt says Opposite will HALT
                  </button>
                  <button
                    type="button"
                    className={`${styles.hypoBtn} ${activeHypothesis === 'hypothesisB' ? styles.hypoBtnActive : ''}`}
                    onClick={() => {
                      setActiveHypothesis('hypothesisB');
                      setOraclePrediction('LOOPS');
                      setIsParadoxOverload(true);
                      playTuringSound('chatter', 300);
                    }}
                  >
                    Hypothesis B: Halt says Opposite will LOOP
                  </button>
                </div>

                <div className={styles.contradictionBox}>
                  <div className={styles.contradictionHeader}>
                    <Icon name="x-circle" size={16} />
                    Contradiction Absolute
                  </div>
                  {activeHypothesis === 'hypothesisA' ? (
                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                      If Halt returns TRUE (Opposite halts), the code executes <code>while (true) {}</code> and loops forever.
                      Therefore, Halt lied: <strong>it does not halt!</strong>
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                      If Halt returns FALSE, Opposite immediately returns 0 and halts.
                      Therefore, Halt lied: <strong>it halts!</strong>
                    </p>
                  )}
                </div>

                <div style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
                  <strong>Conclusion:</strong> The assumption that a universal halting analyzer can exist leads to mathematical contradiction (H(g, g) ≠ g(g)). Thus, the Halting Problem is fundamentally <strong>undecidable</strong>.
                </div>
              </div>

              <div className={styles.controlCard}>
                <div className={styles.cardHeader}>
                  <span>The Barber Paradox of Computing</span>
                  <span className={styles.cardSubtitle}>Epistemic Diagonalization</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0 }}>
                    Turing&apos;s proof is computationally equivalent to:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#94a3b8' }}>
                    <li><strong>Russell&apos;s Barber Paradox:</strong> The barber shaves all men in town who do not shave themselves. Who shaves the barber?</li>
                    <li><strong>Gödel&apos;s Incompleteness Theorem:</strong> &ldquo;This mathematical statement cannot be proven within this formal system.&rdquo;</li>
                    <li><strong>The Liar Paradox:</strong> &ldquo;This statement is false.&rdquo;</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODE 3: Busy Beaver & Rice's Theorem ── */}
        {activeMode === 'undecidability' && (
          <div className={styles.modeSection}>
            <div className={styles.controlsGrid}>
              <div className={styles.controlCard}>
                <div className={styles.cardHeader}>
                  <span>Busy Beaver State Count (n)</span>
                  <span className={styles.sliderValue}>n = {busyBeaverN} States</span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={busyBeaverN}
                  onChange={(e) => setBusyBeaverN(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Busy Beaver States"
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Max Steps Before Halting:</span>
                    <strong style={{ color: '#38bdf8' }}>{bbStats.steps}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Max 1s Written on Tape:</span>
                    <strong style={{ color: '#10b981' }}>{bbStats.ones}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Status:</span>
                    <strong style={{ color: '#fbbf24' }}>{bbStats.status}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.controlCard}>
                <div className={styles.cardHeader}>
                  <span>Rice&apos;s Theorem (1953)</span>
                  <span className={styles.cardSubtitle}>Generalization of Halting</span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                  Rice&apos;s theorem proves that <strong>any non-trivial semantic property</strong> of a computer program is undecidable.
                  No compiler or antivirus can ever determine with 100% mathematical certainty whether an arbitrary program will crash, divide by zero, or contain a security exploit without executing it.
                </p>

                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleRecordRun}
                  style={{ marginTop: '12px' }}
                >
                  <Icon name="check" size={14} />
                  {hasRecorded ? 'Turing State Synchronized to Cloud Database' : 'Record Undecidability Telemetry'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
