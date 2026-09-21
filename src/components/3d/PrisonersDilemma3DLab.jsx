'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './PrisonersDilemma3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

// 1950s Interrogation Audio Synthesizer
function playDilemmaSound(type = 'click') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'lever') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'gavel') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'tape') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(850, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch {
    // Audio gesture required by browser
  }
}

// Axelrod Opponent Strategy Engine
function getOpponentMove(strategy, history, roundIndex) {
  if (strategy === 'alwaysDefect') return 'defect';
  if (strategy === 'alwaysCooperate') return 'cooperate';
  if (strategy === 'random') return Math.random() > 0.5 ? 'cooperate' : 'defect';

  if (strategy === 'titForTat') {
    if (roundIndex === 0 || history.length === 0) return 'cooperate';
    const lastRound = history[history.length - 1];
    return lastRound.playerChoice;
  }

  if (strategy === 'generousTFT') {
    if (roundIndex === 0 || history.length === 0) return 'cooperate';
    const lastRound = history[history.length - 1];
    if (lastRound.playerChoice === 'defect') {
      return Math.random() < 0.15 ? 'cooperate' : 'defect';
    }
    return 'cooperate';
  }

  if (strategy === 'grimTrigger') {
    const hasDefected = history.some(r => r.playerChoice === 'defect');
    return hasDefected ? 'defect' : 'cooperate';
  }

  if (strategy === 'pavlov') {
    if (roundIndex === 0 || history.length === 0) return 'cooperate';
    const lastRound = history[history.length - 1];
    const won = (lastRound.playerChoice === 'cooperate' && lastRound.oppChoice === 'cooperate') ||
                (lastRound.playerChoice === 'defect' && lastRound.oppChoice === 'cooperate');
    return won ? lastRound.oppChoice : (lastRound.oppChoice === 'cooperate' ? 'defect' : 'cooperate');
  }

  return 'defect';
}

// ── Realistic Procedural Seated Human Fallback ──
function createProceduralPrisoner(isFemale) {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    color: isFemale ? 0xe0a886 : 0xd49774,
    roughness: 0.5,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: isFemale ? 0x22130c : 0x1a1512,
    roughness: 0.45,
  });
  const suitMat = new THREE.MeshStandardMaterial({
    color: isFemale ? 0x163852 : 0x33221e, // Navy for Alice, dark charcoal for Bob
    roughness: 0.7,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.8,
  });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.32), suitMat);
  torso.position.set(0, 0.96, 0);
  torso.castShadow = true;
  group.add(torso);

  // Inner shirt collar
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.1), shirtMat);
  collar.position.set(0, 1.25, -0.12);
  group.add(collar);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.18, 8), skinMat);
  neck.position.set(0, 1.34, 0);
  group.add(neck);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 12), skinMat);
  head.position.set(0, 1.54, 0);
  head.scale.set(0.95, 1.05, 0.95);
  head.castShadow = true;
  group.add(head);

  // Hair
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 10), hairMat);
  hair.position.set(0, 1.58, 0.02);
  hair.scale.set(1.02, 1.02, 1.05);
  group.add(hair);

  if (isFemale) {
    // Side hair strands for Alice
    [-0.18, 0.18].forEach((hx) => {
      const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 6), hairMat);
      strand.position.set(hx, 1.44, -0.04);
      group.add(strand);
    });
  }

  // Seated Thighs (extending forward along -Z toward desk)
  [-0.16, 0.16].forEach((tx) => {
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.55, 8), suitMat);
    thigh.rotation.x = Math.PI / 2;
    thigh.position.set(tx, 0.62, -0.28);
    thigh.castShadow = true;
    group.add(thigh);

    // Lower Shins down to floor
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.6, 8), suitMat);
    shin.position.set(tx, 0.3, -0.55);
    group.add(shin);

    // Shoes
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.22), hairMat);
    shoe.position.set(tx, 0.06, -0.62);
    group.add(shoe);
  });

  // Arms reaching forward onto desk
  const armGroup = new THREE.Group();
  [-0.26, 0.26].forEach((ax) => {
    const uarm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.45, 8), suitMat);
    uarm.rotation.x = -Math.PI / 4;
    uarm.position.set(ax, 0.98, -0.15);
    armGroup.add(uarm);

    const farm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.48, 8), suitMat);
    farm.rotation.x = -Math.PI / 2.2;
    farm.position.set(ax, 0.88, -0.45);
    armGroup.add(farm);

    // Hands on desk
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), skinMat);
    hand.scale.set(1.1, 0.7, 1.2);
    hand.position.set(ax * 0.75, 0.88, -0.72);
    armGroup.add(hand);
  });
  group.add(armGroup);

  return { group, head, torso, armGroup };
}

export default function PrisonersDilemma3DLab() {
  const mountRef = useRef(null);

  // ── Mode: 'single' (1950 Tucker) | 'tournament' (Axelrod 1980) | 'realWorld' ──
  const [activeTab, setActiveTab] = useState('single');

  // ── Mode 1: Single Interrogation State ──
  const [player1Choice, setPlayer1Choice] = useState('cooperate'); // 'cooperate' (Silent) | 'defect' (Betray)
  const [player2Choice, setPlayer2Choice] = useState('defect'); // Default rational Nash opponent
  const [opponentStrategy, setOpponentStrategy] = useState('pureRational');

  // ── Mode 2: Axelrod Tournament State ──
  const [tournamentOpponent, setTournamentOpponent] = useState('titForTat');
  const [tournamentRounds] = useState(20);
  const [tournamentHistory, setTournamentHistory] = useState([]);

  // ── Mode 3: Real-World Dilemmas ──
  const [selectedScenario, setSelectedScenario] = useState('coldWar');

  // ── Camera Views: 'dual' | 'roomA' | 'roomB' | 'matrix' ──
  const [cameraView, setCameraView] = useState('dual');

  // ── Telemetry & Metrics ──
  const [totalPlayerYears, setTotalPlayerYears] = useState(2);
  const [totalOpponentYears, setTotalOpponentYears] = useState(2);
  const [equilibriumStatus, setEquilibriumStatus] = useState('Nash Equilibrium Trap');
  const [hasRecorded, setHasRecorded] = useState(false);

  // Animation Sync Refs
  const p1ChoiceRef = useRef(player1Choice);
  const p2ChoiceRef = useRef(player2Choice);
  const cameraViewRef = useRef(cameraView);

  useEffect(() => { p1ChoiceRef.current = player1Choice; }, [player1Choice]);
  useEffect(() => { p2ChoiceRef.current = player2Choice; }, [player2Choice]);
  useEffect(() => { cameraViewRef.current = cameraView; }, [cameraView]);

  // Compute Payoff for Single Round
  const calculatePayoff = useCallback((p1, p2) => {
    if (p1 === 'cooperate' && p2 === 'cooperate') {
      return { p1Years: 1, p2Years: 1, status: 'Pareto Optimal (Mutual Silence)', code: 'CC' };
    }
    if (p1 === 'cooperate' && p2 === 'defect') {
      return { p1Years: 3, p2Years: 0, status: 'Exploited (Sucker Payoff)', code: 'CD' };
    }
    if (p1 === 'defect' && p2 === 'cooperate') {
      return { p1Years: 0, p2Years: 3, status: 'Temptation Win (Walk Free)', code: 'DC' };
    }
    return { p1Years: 2, p2Years: 2, status: 'Nash Equilibrium Trap (Mutual Betrayal)', code: 'DD' };
  }, []);

  // Update Single Round Evaluation
  useEffect(() => {
    if (activeTab === 'single') {
      const outcome = calculatePayoff(player1Choice, player2Choice);
      setTotalPlayerYears(outcome.p1Years);
      setTotalOpponentYears(outcome.p2Years);
      setEquilibriumStatus(outcome.status);
    }
  }, [activeTab, player1Choice, player2Choice, calculatePayoff]);

  // Handle Player 1 Lever Selection
  const handleP1Select = useCallback((choice) => {
    playDilemmaSound('lever');
    setPlayer1Choice(choice);

    if (opponentStrategy === 'pureRational') {
      setPlayer2Choice('defect');
    } else if (opponentStrategy === 'loyalPartner') {
      setPlayer2Choice('cooperate');
    } else if (opponentStrategy === 'random') {
      setPlayer2Choice(Math.random() > 0.5 ? 'cooperate' : 'defect');
    } else if (opponentStrategy === 'titForTat') {
      setPlayer2Choice(choice);
    }
  }, [opponentStrategy]);

  // Step 1 Round in Axelrod Tournament
  const stepTournamentRound = useCallback((pChoice = player1Choice) => {
    const roundIdx = tournamentHistory.length;
    if (roundIdx >= tournamentRounds) return;

    const oppChoice = getOpponentMove(tournamentOpponent, tournamentHistory, roundIdx);
    const outcome = calculatePayoff(pChoice, oppChoice);

    playDilemmaSound('tape');
    const newRound = {
      round: roundIdx + 1,
      playerChoice: pChoice,
      oppChoice,
      p1Years: outcome.p1Years,
      p2Years: outcome.p2Years,
      code: outcome.code,
    };

    setTournamentHistory(prev => {
      const updated = [...prev, newRound];
      const sumP1 = updated.reduce((acc, r) => acc + r.p1Years, 0);
      const sumP2 = updated.reduce((acc, r) => acc + r.p2Years, 0);
      setTotalPlayerYears(sumP1);
      setTotalOpponentYears(sumP2);
      setEquilibriumStatus(`Round ${newRound.round}: ${outcome.status}`);
      return updated;
    });

    setPlayer1Choice(pChoice);
    setPlayer2Choice(oppChoice);
  }, [tournamentHistory, tournamentRounds, tournamentOpponent, player1Choice, calculatePayoff]);

  // Reset Tournament
  const resetTournament = useCallback(() => {
    setTournamentHistory([]);
    setTotalPlayerYears(0);
    setTotalOpponentYears(0);
    setEquilibriumStatus('Tournament Ready');
  }, []);

  // Record Telemetry
  const handleRecordRun = useCallback(async () => {
    playDilemmaSound('gavel');
    await recordConceptRun('prisoners-dilemma', 'single', {
      tab: activeTab,
      player1Choice,
      player2Choice,
      totalPlayerYears,
      totalOpponentYears,
      opponentStrategy: activeTab === 'single' ? opponentStrategy : tournamentOpponent,
    });
    setHasRecorded(true);
    setTimeout(() => setHasRecorded(false), 2400);
  }, [activeTab, player1Choice, player2Choice, totalPlayerYears, totalOpponentYears, opponentStrategy, tournamentOpponent]);

  // Three.js Scene Setup
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 580;

    // 1. Scene & High-Clarity Interrogation Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111726); // Crisp deep slate navy
    scene.fog = new THREE.FogExp2(0x111726, 0.012); // Light atmospheric depth, NOT pitch black

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 9.5);
    camera.lookAt(0, 1.4, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    if (renderer.shadowMap) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    mount.appendChild(renderer.domElement);

    // 3. Bright, Realistic High-Key Interrogation Lighting
    // Ambient Light (substantially elevated for full visibility)
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.95);
    scene.add(ambientLight);

    // Front Observation Key Fill Light
    const keyFill = new THREE.DirectionalLight(0xf8fafc, 1.2);
    keyFill.position.set(0, 6, 8);
    scene.add(keyFill);

    // High-Intensity Focused Spotlight for Room A (Alice)
    const spotRoomA = new THREE.SpotLight(0xffedd5, 4.8, 16, Math.PI / 3, 0.45, 1.2);
    spotRoomA.position.set(-3.2, 4.5, 0.4);
    spotRoomA.target.position.set(-3.2, 1.0, 0.2);
    spotRoomA.castShadow = true;
    scene.add(spotRoomA);
    scene.add(spotRoomA.target);

    // High-Intensity Focused Spotlight for Room B (Bob)
    const spotRoomB = new THREE.SpotLight(0xffedd5, 4.8, 16, Math.PI / 3, 0.45, 1.2);
    spotRoomB.position.set(3.2, 4.5, 0.4);
    spotRoomB.target.position.set(3.2, 1.0, 0.2);
    spotRoomB.castShadow = true;
    scene.add(spotRoomB);
    scene.add(spotRoomB.target);

    // Overhead Fluorescent Ceiling Corridor Illumination
    const ceilingLightA = new THREE.PointLight(0xbae6fd, 1.8, 14);
    ceilingLightA.position.set(-3.2, 3.8, 0.5);
    scene.add(ceilingLightA);

    const ceilingLightB = new THREE.PointLight(0xbae6fd, 1.8, 14);
    ceilingLightB.position.set(3.2, 3.8, 0.5);
    scene.add(ceilingLightB);

    // Blue Glow from One-Way Mirror
    const mirrorGlow = new THREE.PointLight(0x38bdf8, 1.6, 8);
    mirrorGlow.position.set(0, 2.2, 0);
    scene.add(mirrorGlow);

    // ── 4. Interrogation Environment Architecture ──
    const floorGeo = new THREE.PlaneGeometry(20, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e2538,
      roughness: 0.6,
      metalness: 0.25,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const floorGrid = new THREE.GridHelper(20, 20, 0x3b4562, 0x242c40);
    floorGrid.position.y = 0.01;
    scene.add(floorGrid);

    // Back Concrete Wall with Seams
    const backWallGeo = new THREE.PlaneGeometry(20, 8);
    const backWallMat = new THREE.MeshStandardMaterial({ color: 0x222a3d, roughness: 0.75 });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 4.0, -4);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Dividing Partition Wall between Room A & Room B
    const wallGeo = new THREE.BoxGeometry(0.3, 7, 8.5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x28334a, roughness: 0.7 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 3.5, -0.25);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);

    // One-Way Observation Mirror Glass Window
    const mirrorGeo = new THREE.BoxGeometry(0.12, 2.4, 3.6);
    const mirrorMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.08,
      transmission: 0.5,
      transparent: true,
      opacity: 0.75,
    });
    const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
    mirror.position.set(0, 2.2, 0);
    scene.add(mirror);

    const frameGeo = new THREE.BoxGeometry(0.2, 2.5, 3.7);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 2.2, 0);
    scene.add(frame);

    // ── 5. Room Props & Desks with VISIBLE PRISONERS ALICE & BOB ──
    const gltfLoader = new GLTFLoader();

    const createInterrogationDesk = (xPos, label, isFemale) => {
      const roomGroup = new THREE.Group();
      roomGroup.position.set(xPos, 0, 0);

      // Heavy Desk Tabletop
      const tableGeo = new THREE.BoxGeometry(2.5, 0.12, 1.5);
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x2e2b27, roughness: 0.65, metalness: 0.15 });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.set(0, 1.0, 0);
      table.castShadow = true;
      table.receiveShadow = true;
      roomGroup.add(table);

      // 4 Steel Legs
      const legGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.0, 12);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
      [
        [-1.05, 0.5, -0.55],
        [1.05, 0.5, -0.55],
        [-1.05, 0.5, 0.55],
        [1.05, 0.5, 0.55],
      ].forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        roomGroup.add(leg);
      });

      // Steel Chair
      const chairSeatGeo = new THREE.BoxGeometry(0.75, 0.06, 0.75);
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      const seat = new THREE.Mesh(chairSeatGeo, chairMat);
      seat.position.set(0, 0.6, 0.85);
      seat.castShadow = true;
      roomGroup.add(seat);

      const chairBackGeo = new THREE.BoxGeometry(0.75, 0.65, 0.06);
      const chairBack = new THREE.Mesh(chairBackGeo, chairMat);
      chairBack.position.set(0, 1.05, 1.18);
      chairBack.castShadow = true;
      roomGroup.add(chairBack);

      // ── VISIBLE PRISONER ANCHOR (SEATED AT THE DESK) ──
      const prisonerAnchor = new THREE.Group();
      // Position prisoner on the chair facing towards the table (table is at z = 0)
      prisonerAnchor.position.set(0, 0, 0.85);
      roomGroup.add(prisonerAnchor);

      // A. Insert realistic procedural fallback human immediately
      const procPrisoner = createProceduralPrisoner(isFemale);
      prisonerAnchor.add(procPrisoner.group);

      // B. Load Blender Sculpted Character Model asynchronously
      const modelPath = isFemale ? '/models/prisoner_alice.glb' : '/models/prisoner_bob.glb';
      gltfLoader.load(
        modelPath,
        (gltf) => {
          prisonerAnchor.remove(procPrisoner.group);
          const model = gltf.scene;
          // In Blender script, legs face +X. Rotate Y by -PI/2 so prisoner faces table (-Z)
          model.rotation.y = -Math.PI / 2;
          model.scale.set(0.95, 0.95, 0.95);
          model.position.set(0, 0, 0);
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          prisonerAnchor.add(model);
        },
        undefined,
        (err) => console.warn(`Using procedural fallback for ${label}:`, err?.message || err)
      );

      // Hanging Industrial Lamp with Cone Shade
      const lampGeo = new THREE.ConeGeometry(0.42, 0.32, 16, 1, true);
      const lampMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(0, 2.8, 0);
      roomGroup.add(lamp);

      const cordGeo = new THREE.CylinderGeometry(0.01, 0.01, 2.2);
      const cordMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
      const cord = new THREE.Mesh(cordGeo, cordMat);
      cord.position.set(0, 3.9, 0);
      roomGroup.add(cord);

      // Dossier Folder
      const folderGeo = new THREE.BoxGeometry(0.48, 0.02, 0.38);
      const folderMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 });
      const folder = new THREE.Mesh(folderGeo, folderMat);
      folder.position.set(-0.55, 1.08, 0.05);
      folder.rotation.y = 0.2;
      folder.castShadow = true;
      roomGroup.add(folder);

      // Tape Recorder Box
      const recorderGeo = new THREE.BoxGeometry(0.58, 0.15, 0.42);
      const recorderMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 });
      const recorder = new THREE.Mesh(recorderGeo, recorderMat);
      recorder.position.set(0.62, 1.14, 0.1);
      recorder.castShadow = true;
      roomGroup.add(recorder);

      // Tape Reels
      const reelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16);
      const reelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
      const reel1 = new THREE.Mesh(reelGeo, reelMat);
      reel1.position.set(0.5, 1.22, 0.1);
      const reel2 = new THREE.Mesh(reelGeo, reelMat);
      reel2.position.set(0.74, 1.22, 0.1);
      roomGroup.add(reel1);
      roomGroup.add(reel2);

      // Mechanical Decision Switch / Lever
      const baseGeo = new THREE.BoxGeometry(0.26, 0.06, 0.36);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
      const leverBase = new THREE.Mesh(baseGeo, baseMat);
      leverBase.position.set(0, 1.08, -0.2);
      roomGroup.add(leverBase);

      const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.26, 12);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
      const leverHandle = new THREE.Mesh(handleGeo, handleMat);
      leverHandle.position.set(0, 1.2, -0.2);
      roomGroup.add(leverHandle);

      // Status Indicator Glow Beacon on Lever
      const beaconGeo = new THREE.SphereGeometry(0.05, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 1.36, -0.2);
      roomGroup.add(beacon);

      // Desk Illuminated Nameplate Badge
      const nameplateGeo = new THREE.BoxGeometry(1.2, 0.24, 0.06);
      const nameplateMat = new THREE.MeshStandardMaterial({
        color: isFemale ? 0x0369a1 : 0xbe123c,
        emissive: isFemale ? 0x0284c7 : 0xe11d48,
        emissiveIntensity: 0.5,
        roughness: 0.3,
      });
      const nameplate = new THREE.Mesh(nameplateGeo, nameplateMat);
      nameplate.position.set(0, 0.94, -0.76);
      roomGroup.add(nameplate);

      scene.add(roomGroup);
      return { roomGroup, leverHandle, beacon, reel1, reel2, lamp, prisonerAnchor, isFemale };
    };

    const roomA = createInterrogationDesk(-3.2, 'Alice', true);
    const roomB = createInterrogationDesk(3.2, 'Bob', false);

    // ── 6. 3D Wall-Mounted Payoff Matrix Billboard ──
    const matrixBoardGroup = new THREE.Group();
    matrixBoardGroup.position.set(0, 4.2, -3.8);

    const boardBackGeo = new THREE.BoxGeometry(3.8, 2.4, 0.12);
    const boardBackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const boardBack = new THREE.Mesh(boardBackGeo, boardBackMat);
    matrixBoardGroup.add(boardBack);

    // 4 Outcome Quadrant Indicators (CC, CD, DC, DD)
    const quadGeo = new THREE.BoxGeometry(1.7, 1.0, 0.08);
    const createQuad = (x, y, color) => {
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        emissive: color,
        emissiveIntensity: 0.25,
      });
      const mesh = new THREE.Mesh(quadGeo, mat);
      mesh.position.set(x, y, 0.08);
      matrixBoardGroup.add(mesh);
      return mesh;
    };

    const quadCC = createQuad(-0.9, 0.55, 0x059669); // Top-Left: Mutual Silence
    const quadCD = createQuad(0.9, 0.55, 0xbe123c);  // Top-Right: Alice Sil, Bob Bet
    const quadDC = createQuad(-0.9, -0.55, 0x2563eb); // Bottom-Left: Alice Bet, Bob Sil
    const quadDD = createQuad(0.9, -0.55, 0xd97706); // Bottom-Right: Mutual Betrayal (Nash)

    scene.add(matrixBoardGroup);

    // Window Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ── Mouse Drag Orbit Controls ──
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationY -= deltaX * 0.005;
      targetRotationX = Math.max(-0.2, Math.min(0.6, targetRotationX + deltaY * 0.005));
    };

    const onMouseUp = () => { isDragging = false; };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // ── Animation Loop ──
    let animationId;
    let lastTime = performance.now();

    const animate = (now) => {
      animationId = requestAnimationFrame(animate);
      const currentTime = typeof now === 'number' ? now : performance.now();
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const time = currentTime * 0.001;

      // Camera view positioning interpolation
      const currentView = cameraViewRef.current;
      let desiredCamPos = new THREE.Vector3(0, 4.4, 9.5);
      let desiredLookAt = new THREE.Vector3(0, 1.4, 0);

      if (currentView === 'roomA') {
        desiredCamPos.set(-3.2, 2.4, 3.8);
        desiredLookAt.set(-3.2, 1.35, 0.5);
      } else if (currentView === 'roomB') {
        desiredCamPos.set(3.2, 2.4, 3.8);
        desiredLookAt.set(3.2, 1.35, 0.5);
      } else if (currentView === 'matrix') {
        desiredCamPos.set(0, 4.2, 2.5);
        desiredLookAt.set(0, 4.2, -3.8);
      }

      // Smooth camera lerp
      camera.position.lerp(desiredCamPos, delta * 3.0);
      camera.lookAt(desiredLookAt);

      // Rotate Tape Reels
      roomA.reel1.rotation.y += delta * 1.5;
      roomA.reel2.rotation.y += delta * 1.5;
      roomB.reel1.rotation.y += delta * 1.5;
      roomB.reel2.rotation.y += delta * 1.5;

      // Lamp gentle swinging pendulum physics
      roomA.lamp.rotation.z = Math.sin(time * 1.2) * 0.03;
      roomB.lamp.rotation.z = Math.sin(time * 1.2 + 1) * 0.03;

      // Lever Angle & Beacon Indicator based on Player choices
      const p1Choice = p1ChoiceRef.current;
      const p2Choice = p2ChoiceRef.current;

      const p1TargetRotZ = p1Choice === 'cooperate' ? -0.35 : 0.35;
      const p2TargetRotZ = p2Choice === 'cooperate' ? -0.35 : 0.35;

      roomA.leverHandle.rotation.z = THREE.MathUtils.lerp(roomA.leverHandle.rotation.z, p1TargetRotZ, delta * 6);
      roomB.leverHandle.rotation.z = THREE.MathUtils.lerp(roomB.leverHandle.rotation.z, p2TargetRotZ, delta * 6);

      // Color beacons
      roomA.beacon.material.color.setHex(p1Choice === 'cooperate' ? 0x10b981 : 0xf43f5e);
      roomB.beacon.material.color.setHex(p2Choice === 'cooperate' ? 0x10b981 : 0xf43f5e);

      // ── DYNAMIC PRISONER BREATHING & EXPRESSIVE CONFESSION POSTURE ──
      // Breathing vertical bob
      const breathA = Math.sin(time * 2.2) * 0.012;
      const breathB = Math.sin(time * 2.2 + 1.2) * 0.012;

      // If confessing (defect), prisoner leans forward aggressively towards tape recorder; if silent, upright and calm
      const targetPitchA = p1Choice === 'defect' ? 0.16 : 0.0;
      const targetPitchB = p2Choice === 'defect' ? 0.16 : 0.0;

      if (roomA.prisonerAnchor) {
        roomA.prisonerAnchor.position.y = breathA;
        roomA.prisonerAnchor.rotation.x = THREE.MathUtils.lerp(roomA.prisonerAnchor.rotation.x, targetPitchA, delta * 4.0);
      }
      if (roomB.prisonerAnchor) {
        roomB.prisonerAnchor.position.y = breathB;
        roomB.prisonerAnchor.rotation.x = THREE.MathUtils.lerp(roomB.prisonerAnchor.rotation.x, targetPitchB, delta * 4.0);
      }

      // Payoff Billboard Quad Highlights
      quadCC.material.emissiveIntensity = (p1Choice === 'cooperate' && p2Choice === 'cooperate') ? 0.85 : 0.15;
      quadCD.material.emissiveIntensity = (p1Choice === 'cooperate' && p2Choice === 'defect') ? 0.85 : 0.15;
      quadDC.material.emissiveIntensity = (p1Choice === 'defect' && p2Choice === 'cooperate') ? 0.85 : 0.15;
      quadDD.material.emissiveIntensity = (p1Choice === 'defect' && p2Choice === 'defect') ? 0.85 : 0.15;

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
      aria-label="Prisoner's Dilemma 3D Interactive Laboratory"
      data-testid="prisoners-dilemma-3d-lab"
    >
      {/* 3D Canvas Area */}
      <div className={styles.canvasContainer}>
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Top Header & Telemetry Cluster */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="shield" size={13} />
              RAND Corporation 1950 &bull; Game Theory Engine
            </div>
            <h2 className={styles.labTitle}>Prisoner&apos;s Dilemma</h2>
            <div className={styles.labQuote}>
              Suspects Alice &amp; Bob interrogated simultaneously in isolated rooms.
            </div>
          </div>

          <div className={styles.statsCluster}>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Player 1 (Alice)</span>
              <span className={`${styles.statValue} ${styles.statValueCyan}`}>{totalPlayerYears} Years</span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Player 2 (Bob)</span>
              <span className={`${styles.statValue} ${styles.statValueRose}`}>{totalOpponentYears} Years</span>
            </div>
            <div className={`${styles.statPill} ${totalPlayerYears + totalOpponentYears >= 4 ? styles.statPillCrisis : ''}`}>
              <span className={styles.statLabel}>Game Equilibrium</span>
              <span className={`${styles.statValue} ${styles.statValueAmber}`}>{equilibriumStatus}</span>
            </div>
          </div>
        </div>

        {/* Camera Perspective Angle Switcher */}
        <div className={styles.cameraControls} role="group" aria-label="Camera Presets">
          <button
            type="button"
            className={`${styles.camBtn} ${cameraView === 'dual' ? styles.camBtnActive : ''}`}
            onClick={() => setCameraView('dual')}
            aria-label="Dual Room Overview"
          >
            <Icon name="eye" size={12} />
            Dual View (Both Rooms)
          </button>
          <button
            type="button"
            className={`${styles.camBtn} ${cameraView === 'roomA' ? styles.camBtnActive : ''}`}
            onClick={() => setCameraView('roomA')}
            aria-label="Suspect Alice Room"
          >
            <Icon name="user" size={12} />
            Alice (Room A)
          </button>
          <button
            type="button"
            className={`${styles.camBtn} ${cameraView === 'roomB' ? styles.camBtnActive : ''}`}
            onClick={() => setCameraView('roomB')}
            aria-label="Suspect Bob Room"
          >
            <Icon name="user" size={12} />
            Bob (Room B)
          </button>
          <button
            type="button"
            className={`${styles.camBtn} ${cameraView === 'matrix' ? styles.camBtnActive : ''}`}
            onClick={() => setCameraView('matrix')}
            aria-label="Tucker Matrix Board"
          >
            <Icon name="grid" size={12} />
            Payoff Matrix
          </button>
        </div>

        {/* Floating 2x2 Tucker Payoff Matrix HUD */}
        <div className={styles.matrixHUD}>
          <div className={styles.matrixHeader}>
            <span>Tucker 1950 Sentence Matrix (Years Served)</span>
            <span>Nash Trap: Betrayal</span>
          </div>
          <div className={styles.matrixGrid}>
            <div className={styles.matrixCorner}>A \ B</div>
            <div className={styles.matrixColLabel}>Bob: Silent</div>
            <div className={styles.matrixColLabel}>Bob: Betray</div>

            <div className={styles.matrixRowLabel}>Alice: Silent</div>
            <div
              className={`${styles.matrixCell} ${
                player1Choice === 'cooperate' && player2Choice === 'cooperate' ? styles.matrixCellHighlight : ''
              }`}
            >
              <div className={styles.cellPayoffs}>
                <span className={styles.p1Payoff}>1 yr</span>, <span className={styles.p2Payoff}>1 yr</span>
              </div>
              <span className={styles.cellVerdict}>Pareto Optimal</span>
            </div>
            <div
              className={`${styles.matrixCell} ${
                player1Choice === 'cooperate' && player2Choice === 'defect' ? styles.matrixCellHighlight : ''
              }`}
            >
              <div className={styles.cellPayoffs}>
                <span className={styles.p1Payoff}>3 yrs</span>, <span className={styles.p2Payoff}>0 yrs</span>
              </div>
              <span className={styles.cellVerdict}>Sucker Payoff</span>
            </div>

            <div className={styles.matrixRowLabel}>Alice: Betray</div>
            <div
              className={`${styles.matrixCell} ${
                player1Choice === 'defect' && player2Choice === 'cooperate' ? styles.matrixCellHighlight : ''
              }`}
            >
              <div className={styles.cellPayoffs}>
                <span className={styles.p1Payoff}>0 yrs</span>, <span className={styles.p2Payoff}>3 yrs</span>
              </div>
              <span className={styles.cellVerdict}>Temptation Win</span>
            </div>
            <div
              className={`${styles.matrixCell} ${styles.matrixCellNash} ${
                player1Choice === 'defect' && player2Choice === 'defect' ? styles.matrixCellHighlight : ''
              }`}
            >
              <div className={styles.cellPayoffs}>
                <span className={styles.p1Payoff}>2 yrs</span>, <span className={styles.p2Payoff}>2 yrs</span>
              </div>
              <span className={styles.cellVerdict}>Nash Equilibrium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fast 1-Click Scenario Presets */}
      <div className={styles.scenarioBar}>
        <span className={styles.scenarioBarLabel}>Instant Presets:</span>
        <div className={styles.scenarioButtonsRow}>
          <button
            type="button"
            className={`${styles.scenarioQuickBtn} ${player1Choice === 'cooperate' && player2Choice === 'cooperate' ? styles.scenarioQuickBtnActive : ''}`}
            onClick={() => { handleP1Select('cooperate'); handleP2Select('cooperate'); }}
          >
            <Icon name="handshake" size={13} />
            <span>Mutual Silence (1 yr each)</span>
          </button>
          <button
            type="button"
            className={`${styles.scenarioQuickBtn} ${player1Choice === 'defect' && player2Choice === 'cooperate' ? styles.scenarioQuickBtnActive : ''}`}
            onClick={() => { handleP1Select('defect'); handleP2Select('cooperate'); }}
          >
            <Icon name="swords" size={13} />
            <span>You Betray, Bob Silent (You: 0, Bob: 3)</span>
          </button>
          <button
            type="button"
            className={`${styles.scenarioQuickBtn} ${player1Choice === 'defect' && player2Choice === 'defect' ? styles.scenarioQuickBtnActive : ''}`}
            onClick={() => { handleP1Select('defect'); handleP2Select('defect'); }}
          >
            <Icon name="zap" size={13} />
            <span>Both Betray (Nash Trap: 2 yrs each)</span>
          </button>
          <button
            type="button"
            className={`${styles.scenarioQuickBtn} ${player1Choice === 'cooperate' && player2Choice === 'defect' ? styles.scenarioQuickBtnActive : ''}`}
            onClick={() => { handleP1Select('cooperate'); handleP2Select('defect'); }}
          >
            <Icon name="alert" size={13} />
            <span>Bob Betrays You (You: 3, Bob: 0)</span>
          </button>
        </div>
      </div>

      {/* Core Paradox Insight Box */}
      <div className={styles.insightBox}>
        <div className={styles.insightHeader}>
          <Icon name="zap" size={14} />
          <span>The Core Paradox Insight</span>
        </div>
        <p className={styles.insightText}>
          {player1Choice === 'defect' && player2Choice === 'defect' && (
            <><strong>The Nash Trap:</strong> Even though mutual silence yields only 1 year each, both suspects rationally deduce that defecting is strictly dominant (0 &lt; 1 and 2 &lt; 3). Local rational self-interest inexorably forces both into mutual disaster (2 years each).</>
          )}
          {player1Choice === 'cooperate' && player2Choice === 'cooperate' && (
            <><strong>The Fragile Ideal:</strong> Mutual silence produces the best collective outcome (1 year each). But without binding contracts, both feel an irresistible temptation to defect (walk free in 0 years) and terror of being exploited (3 years).</>
          )}
          {player1Choice === 'defect' && player2Choice === 'cooperate' && (
            <><strong>Temptation Payoff:</strong> You confess and walk out a free person (0 years), leaving Bob to serve the maximum 3-year term. This asymmetric reward is what breaks trust in single-round interactions.</>
          )}
          {player1Choice === 'cooperate' && player2Choice === 'defect' && (
            <><strong>Exploited (Sucker&apos;s Payoff):</strong> You trusted Bob and stayed silent, but Bob confessed and walked free. You take the full 3-year sentence. This fear is why rational players preemptively defect.</>
          )}
        </p>
      </div>

      {/* Primary Control Deck */}
      <div className={styles.controlDeck}>
        {/* Navigation Tabs */}
        <div className={styles.tabsRow} role="tablist">
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'single' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('single')}
            role="tab"
            aria-selected={activeTab === 'single'}
          >
            <Icon name="user" size={14} />
            1. The 1950 Tucker Interrogation
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'tournament' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('tournament')}
            role="tab"
            aria-selected={activeTab === 'tournament'}
          >
            <Icon name="repeat" size={14} />
            2. Axelrod 1980 Iterated Tournament
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'realWorld' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('realWorld')}
            role="tab"
            aria-selected={activeTab === 'realWorld'}
          >
            <Icon name="globe" size={14} />
            3. Real-World Dilemma Scenarios
          </button>
        </div>

        {/* Tab 1: Single Interrogation */}
        {activeTab === 'single' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Your Decision (Suspect Alice)</span>
                <span className={styles.cardSubtitle}>
                  Current: {player1Choice === 'cooperate' ? 'Remain Silent' : 'Confess & Betray'}
                </span>
              </div>

              <div className={styles.decisionButtonGroup}>
                <button
                  type="button"
                  className={`${styles.decisionBtn} ${styles.decisionBtnCooperate} ${
                    player1Choice === 'cooperate' ? styles.decisionBtnCooperateActive : ''
                  }`}
                  onClick={() => handleP1Select('cooperate')}
                  aria-label="Remain Silent"
                >
                  <div className={styles.decisionTitle}>
                    <Icon name="lock" size={15} />
                    Remain Silent
                  </div>
                  <div className={styles.decisionSub}>Cooperate with Partner</div>
                </button>

                <button
                  type="button"
                  className={`${styles.decisionBtn} ${styles.decisionBtnDefect} ${
                    player1Choice === 'defect' ? styles.decisionBtnDefectActive : ''
                  }`}
                  onClick={() => handleP1Select('defect')}
                  aria-label="Confess and Betray"
                >
                  <div className={styles.decisionTitle}>
                    <Icon name="zap" size={15} />
                    Confess &amp; Betray
                  </div>
                  <div className={styles.decisionSub}>Dominant Strategy</div>
                </button>
              </div>

              <div style={{ marginTop: '8px' }}>
                <div className={styles.cardHeader} style={{ marginBottom: '6px' }}>
                  <span>Opponent Behavioral Strategy (Suspect Bob)</span>
                </div>
                <select
                  value={opponentStrategy}
                  onChange={(e) => {
                    setOpponentStrategy(e.target.value);
                    if (e.target.value === 'pureRational') setPlayer2Choice('defect');
                    if (e.target.value === 'loyalPartner') setPlayer2Choice('cooperate');
                  }}
                  className={styles.strategySelect}
                  aria-label="Opponent Strategy"
                >
                  <option value="pureRational">Pure Rational Actor (Nash Defection)</option>
                  <option value="loyalPartner">Loyal Partner (Unconditional Silence)</option>
                  <option value="random">Unpredictable Suspect (50% Coin Flip)</option>
                  <option value="titForTat">Reciprocal (Tit for Tat)</option>
                </select>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Game Theoretic Analysis</span>
                <span className={styles.cardSubtitle}>Why Rationality Traps Both</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                Betrayal is Alice&apos;s <strong>Strictly Dominant Strategy</strong>:
                Whether Bob stays silent or betrays, Alice serves fewer years by defecting.
                Since Bob faces the identical mathematical calculus, both rationally defect—serving 2 years each, even though mutual silence would have earned them only 1 year!
              </p>
              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, display: 'block' }}>Pareto Inefficiency</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Individual rational optimization leads directly to collective sub-optimality.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Axelrod Tournament */}
        {activeTab === 'tournament' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Iterated Dilemma Tournament</span>
                <span className={styles.cardSubtitle}>Rounds: {tournamentHistory.length} / {tournamentRounds}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={tournamentOpponent}
                  onChange={(e) => {
                    setTournamentOpponent(e.target.value);
                    resetTournament();
                  }}
                  className={styles.strategySelect}
                  aria-label="Tournament Opponent Strategy"
                >
                  <option value="titForTat">Tit for Tat (Anatol Rapoport - Tournament Winner)</option>
                  <option value="alwaysDefect">Always Defect (Hawk / Predatory)</option>
                  <option value="alwaysCooperate">Always Cooperate (Dove / Pacifist)</option>
                  <option value="grimTrigger">Grim Trigger (Permanent Betrayal on 1st Defection)</option>
                  <option value="generousTFT">Generous Tit for Tat (15% Forgiveness)</option>
                  <option value="pavlov">Pavlov (Win-Stay, Lose-Shift)</option>
                </select>

                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={resetTournament}
                  aria-label="Reset Tournament"
                >
                  <Icon name="rotate-ccw" size={13} />
                  Reset
                </button>
              </div>

              {/* Action levers for round */}
              <div className={styles.decisionButtonGroup} style={{ marginTop: '6px' }}>
                <button
                  type="button"
                  className={`${styles.decisionBtn} ${styles.decisionBtnCooperate}`}
                  onClick={() => stepTournamentRound('cooperate')}
                  aria-label="Play Silent (Cooperate)"
                >
                  <div className={styles.decisionTitle}>
                    <Icon name="check" size={14} />
                    Play Silent
                  </div>
                </button>
                <button
                  type="button"
                  className={`${styles.decisionBtn} ${styles.decisionBtnDefect}`}
                  onClick={() => stepTournamentRound('defect')}
                  aria-label="Play Betray (Defect)"
                >
                  <div className={styles.decisionTitle}>
                    <Icon name="x" size={14} />
                    Play Betray
                  </div>
                </button>
              </div>

              {/* Round History Visualizer */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                  Tournament History Tape:
                </div>
                <div className={styles.historyTape}>
                  {tournamentHistory.length === 0 && (
                    <span style={{ fontSize: '11px', color: '#64748b' }}>No rounds executed yet. Click &apos;Play Silent&apos; or &apos;Play Betray&apos;.</span>
                  )}
                  {tournamentHistory.map((item) => (
                    <div key={item.round} className={styles.roundChip}>
                      <span className={styles.chipNumber}>#{item.round}</span>
                      <div className={item.playerChoice === 'cooperate' ? styles.chipDotCoop : styles.chipDotDefect} title={`Player: ${item.playerChoice}`} />
                      <div className={item.oppChoice === 'cooperate' ? styles.chipDotCoop : styles.chipDotDefect} title={`Opponent: ${item.oppChoice}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Axelrod&apos;s Four Virtues of Cooperation</span>
                <span className={styles.cardSubtitle}>The Evolution of Trust</span>
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>1. Be Nice:</strong> Never be the first to defect.</div>
                <div><strong>2. Be Retaliatory:</strong> If betrayed, immediately retaliate to avoid being exploited.</div>
                <div><strong>3. Be Forgiving:</strong> Once cooperation is restored, resume mutual trust.</div>
                <div><strong>4. Be Clear:</strong> Predictable simplicity encourages mutual reciprocal cooperation.</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Real-World Coordination Dilemmas */}
        {activeTab === 'realWorld' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Select Macro Dilemma Context</span>
                <span className={styles.cardSubtitle}>Game Theory in the Real World</span>
              </div>
              <div className={styles.scenarioGrid}>
                <div
                  className={`${styles.scenarioCard} ${selectedScenario === 'coldWar' ? styles.scenarioCardActive : ''}`}
                  onClick={() => { setSelectedScenario('coldWar'); setPlayer1Choice('defect'); setPlayer2Choice('defect'); }}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.scenarioTitle}>
                    <Icon name="radiation" size={14} color="#f87171" />
                    <span>Cold War Nuclear Arms Race</span>
                  </div>
                  <div className={styles.scenarioDesc}>
                    Disarm (Cooperate) vs Arm (Defect). Both sides spend trillions to avoid unilateral domination.
                  </div>
                </div>

                <div
                  className={`${styles.scenarioCard} ${selectedScenario === 'priceWar' ? styles.scenarioCardActive : ''}`}
                  onClick={() => { setSelectedScenario('priceWar'); setPlayer1Choice('cooperate'); setPlayer2Choice('cooperate'); }}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.scenarioTitle}>
                    <Icon name="dollar" size={14} color="#fbbf24" />
                    <span>Corporate Price Wars</span>
                  </div>
                  <div className={styles.scenarioDesc}>
                    Maintain Margins (Cooperate) vs Undercut Prices (Defect). Can lead to mutual zero-profit ruin.
                  </div>
                </div>

                <div
                  className={`${styles.scenarioCard} ${selectedScenario === 'climate' ? styles.scenarioCardActive : ''}`}
                  onClick={() => { setSelectedScenario('climate'); setPlayer1Choice('cooperate'); setPlayer2Choice('defect'); }}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.scenarioTitle}>
                    <Icon name="globe" size={14} color="#34d399" />
                    <span>Global Carbon Accord</span>
                  </div>
                  <div className={styles.scenarioDesc}>
                    Abate Emissions (Cooperate) vs Free-Ride (Defect). Explains treaty non-compliance challenges.
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Structural Escape Mechanisms</span>
                <span className={styles.cardSubtitle}>Solving the Dilemma</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                Real-world institutions overcome the Prisoner&apos;s Dilemma by altering the payoff matrix:
              </p>
              <ul style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>Enforceable Contracts:</strong> Third-party legal enforcement penalizes defection.</li>
                <li><strong>Repeated Interaction (Shadow of the Future):</strong> High future discount rate makes mutual cooperation self-enforcing.</li>
                <li><strong>Reputation & Transparency:</strong> Open monitoring prevents opportunistic exploitation.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Global Action Row */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => {
              setPlayer1Choice('cooperate');
              setPlayer2Choice('cooperate');
            }}
            aria-label="Set Mutual Silence"
          >
            <Icon name="lock" size={14} />
            Mutual Silence (1, 1)
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => {
              setPlayer1Choice('defect');
              setPlayer2Choice('defect');
            }}
            aria-label="Set Mutual Betrayal"
          >
            <Icon name="zap" size={14} />
            Nash Trap (2, 2)
          </button>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleRecordRun}
            aria-label="Record Dilemma Telemetry"
          >
            <Icon name="check" size={15} />
            {hasRecorded ? 'Telemetry Logged!' : 'Record Dilemma Telemetry'}
          </button>
        </div>
      </div>
    </div>
  );
}
