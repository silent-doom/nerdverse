'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
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
      // Heavy mechanical lever clunk
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
      // Resonant sentencing thud
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
      // Tape recorder relay switch click
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
    // User audio gesture required by browser
  }
}

// Axelrod Opponent Strategy Engine
function getOpponentMove(strategy, history, roundIndex) {
  if (strategy === 'alwaysDefect') return 'defect';
  if (strategy === 'alwaysCooperate') return 'cooperate';
  if (strategy === 'random') return Math.random() > 0.5 ? 'cooperate' : 'defect';

  if (strategy === 'titForTat') {
    // Start with cooperate; then mirror player's last move
    if (roundIndex === 0 || history.length === 0) return 'cooperate';
    const lastRound = history[history.length - 1];
    return lastRound.playerChoice;
  }

  if (strategy === 'generousTFT') {
    // Forgives defection 15% of the time to escape toxic retribution cycles
    if (roundIndex === 0 || history.length === 0) return 'cooperate';
    const lastRound = history[history.length - 1];
    if (lastRound.playerChoice === 'defect') {
      return Math.random() < 0.15 ? 'cooperate' : 'defect';
    }
    return 'cooperate';
  }

  if (strategy === 'grimTrigger') {
    // Cooperates until player defects even once, then defects for eternity
    const hasDefected = history.some(r => r.playerChoice === 'defect');
    return hasDefected ? 'defect' : 'cooperate';
  }

  if (strategy === 'pavlov') {
    // Win-Stay, Lose-Shift
    if (roundIndex === 0 || history.length === 0) return 'cooperate';
    const lastRound = history[history.length - 1];
    // Win conditions: CC (both coop, got 1 yr) or DC (got 0 yrs)
    const won = (lastRound.playerChoice === 'cooperate' && lastRound.oppChoice === 'cooperate') ||
                (lastRound.playerChoice === 'defect' && lastRound.oppChoice === 'cooperate');
    return won ? lastRound.oppChoice : (lastRound.oppChoice === 'cooperate' ? 'defect' : 'cooperate');
  }

  return 'defect'; // Default pure rational actor
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
  const [tournamentRounds, setTournamentRounds] = useState(20);
  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // ── Mode 3: Real-World Dilemmas ──
  const [selectedScenario, setSelectedScenario] = useState('coldWar'); // 'coldWar' | 'priceWar' | 'climate'

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
  const isPlayingRef = useRef(isAutoPlaying);

  useEffect(() => { p1ChoiceRef.current = player1Choice; }, [player1Choice]);
  useEffect(() => { p2ChoiceRef.current = player2Choice; }, [player2Choice]);
  useEffect(() => { cameraViewRef.current = cameraView; }, [cameraView]);
  useEffect(() => { isPlayingRef.current = isAutoPlaying; }, [isAutoPlaying]);

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

    // If opponent strategy is set in single mode, trigger immediate reaction
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
    const height = mount.clientHeight || 560;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c14);
    scene.fog = new THREE.FogExp2(0x0a0c14, 0.03);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 9.5);
    camera.lookAt(0, 1.4, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    if (renderer.shadowMap) renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Warm Tungsten Spotlight for Room A (Alice)
    const spotRoomA = new THREE.SpotLight(0xfef08a, 2.8, 12, Math.PI / 4, 0.4, 1.5);
    spotRoomA.position.set(-3.2, 4.5, 0);
    spotRoomA.target.position.set(-3.2, 0.8, 0);
    scene.add(spotRoomA);
    scene.add(spotRoomA.target);

    // Warm Tungsten Spotlight for Room B (Bob)
    const spotRoomB = new THREE.SpotLight(0xfef08a, 2.8, 12, Math.PI / 4, 0.4, 1.5);
    spotRoomB.position.set(3.2, 4.5, 0);
    spotRoomB.target.position.set(3.2, 0.8, 0);
    scene.add(spotRoomB);
    scene.add(spotRoomB.target);

    // Center Blue Rim Fill
    const observationLight = new THREE.PointLight(0x38bdf8, 1.2, 14);
    observationLight.position.set(0, 2.5, 4.0);
    scene.add(observationLight);

    // ── 4. Interrogation Environment Architecture ──
    // Floor
    const floorGeo = new THREE.PlaneGeometry(18, 14);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x121520,
      roughness: 0.65,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Floor Grid Tile Marks
    const floorGrid = new THREE.GridHelper(18, 18, 0x242a3e, 0x191e2c);
    floorGrid.position.y = 0.01;
    scene.add(floorGrid);

    // Back Concrete Wall
    const backWallGeo = new THREE.PlaneGeometry(18, 7);
    const backWallMat = new THREE.MeshStandardMaterial({ color: 0x161a28, roughness: 0.8 });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 3.5, -4);
    scene.add(backWall);

    // Dividing Partition Wall between Room A & Room B
    const wallGeo = new THREE.BoxGeometry(0.3, 6, 7.5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1c2234, roughness: 0.7 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 3, -0.25);
    scene.add(wall);

    // One-Way Observation Mirror Glass Window
    const mirrorGeo = new THREE.BoxGeometry(0.12, 2.2, 3.2);
    const mirrorMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.1,
      transmission: 0.4,
      transparent: true,
      opacity: 0.65,
    });
    const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
    mirror.position.set(0, 2.2, 0);
    scene.add(mirror);

    // Mirror Steel Border Frame
    const frameGeo = new THREE.BoxGeometry(0.2, 2.3, 3.3);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 2.2, 0);
    scene.add(frame);

    // ── 5. Room Props & Desks Builder ──
    const createInterrogationDesk = (xPos, label) => {
      const roomGroup = new THREE.Group();
      roomGroup.position.set(xPos, 0, 0);

      // Heavy Desk Tabletop
      const tableGeo = new THREE.BoxGeometry(2.4, 0.12, 1.4);
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x272421, roughness: 0.7, metalness: 0.1 });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.set(0, 1.0, 0);
      roomGroup.add(table);

      // 4 Steel Legs
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 12);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
      [
        [-1.0, 0.5, -0.5],
        [1.0, 0.5, -0.5],
        [-1.0, 0.5, 0.5],
        [1.0, 0.5, 0.5],
      ].forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        roomGroup.add(leg);
      });

      // Steel Chair
      const chairSeatGeo = new THREE.BoxGeometry(0.7, 0.06, 0.7);
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      const seat = new THREE.Mesh(chairSeatGeo, chairMat);
      seat.position.set(0, 0.6, 0.85);
      roomGroup.add(seat);

      const chairBackGeo = new THREE.BoxGeometry(0.7, 0.6, 0.06);
      const chairBack = new THREE.Mesh(chairBackGeo, chairMat);
      chairBack.position.set(0, 1.05, 1.15);
      roomGroup.add(chairBack);

      // Hanging Industrial Lamp
      const lampGeo = new THREE.ConeGeometry(0.4, 0.3, 16, 1, true);
      const lampMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(0, 2.8, 0);
      roomGroup.add(lamp);

      // Suspension Cord
      const cordGeo = new THREE.CylinderGeometry(0.01, 0.01, 2.2);
      const cordMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
      const cord = new THREE.Mesh(cordGeo, cordMat);
      cord.position.set(0, 3.9, 0);
      roomGroup.add(cord);

      // Classified Case Dossier Folder
      const folderGeo = new THREE.BoxGeometry(0.45, 0.02, 0.35);
      const folderMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });
      const folder = new THREE.Mesh(folderGeo, folderMat);
      folder.position.set(-0.5, 1.08, 0.1);
      folder.rotation.y = 0.15;
      roomGroup.add(folder);

      // Tape Recorder Box
      const recorderGeo = new THREE.BoxGeometry(0.55, 0.14, 0.4);
      const recorderMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 });
      const recorder = new THREE.Mesh(recorderGeo, recorderMat);
      recorder.position.set(0.6, 1.14, 0.1);
      roomGroup.add(recorder);

      // Tape Reels (2 cylinders)
      const reelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16);
      const reelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
      const reel1 = new THREE.Mesh(reelGeo, reelMat);
      reel1.position.set(0.48, 1.22, 0.1);
      const reel2 = new THREE.Mesh(reelGeo, reelMat);
      reel2.position.set(0.72, 1.22, 0.1);
      roomGroup.add(reel1);
      roomGroup.add(reel2);

      // Mechanical Decision Switch / Lever
      const baseGeo = new THREE.BoxGeometry(0.25, 0.06, 0.35);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
      const leverBase = new THREE.Mesh(baseGeo, baseMat);
      leverBase.position.set(0, 1.08, -0.15);
      roomGroup.add(leverBase);

      const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 12);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
      const leverHandle = new THREE.Mesh(handleGeo, handleMat);
      leverHandle.position.set(0, 1.2, -0.15);
      roomGroup.add(leverHandle);

      // Status Indicator Glow Beacon on Lever
      const beaconGeo = new THREE.SphereGeometry(0.045, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 1.35, -0.15);
      roomGroup.add(beacon);

      scene.add(roomGroup);
      return { roomGroup, leverHandle, beacon, reel1, reel2, lamp };
    };

    const roomA = createInterrogationDesk(-3.2, 'Alice');
    const roomB = createInterrogationDesk(3.2, 'Bob');

    // ── 6. 3D Wall-Mounted Payoff Matrix Billboard ──
    const matrixBoardGroup = new THREE.Group();
    matrixBoardGroup.position.set(0, 4.2, -3.8);

    const boardBackGeo = new THREE.BoxGeometry(3.6, 2.2, 0.1);
    const boardBackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const boardBack = new THREE.Mesh(boardBackGeo, boardBackMat);
    matrixBoardGroup.add(boardBack);

    // 4 Outcome Quadrant Indicators (CC, CD, DC, DD)
    const quadGeo = new THREE.BoxGeometry(1.6, 0.9, 0.08);
    const createQuad = (x, y, color) => {
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        emissive: color,
        emissiveIntensity: 0.2,
      });
      const mesh = new THREE.Mesh(quadGeo, mat);
      mesh.position.set(x, y, 0.06);
      matrixBoardGroup.add(mesh);
      return mesh;
    };

    const quadCC = createQuad(-0.85, 0.5, 0x065f46); // Top-Left: Mutual Silence
    const quadCD = createQuad(0.85, 0.5, 0x831843);  // Top-Right: Alice Sil, Bob Bet
    const quadDC = createQuad(-0.85, -0.5, 0x1e3a8a); // Bottom-Left: Alice Bet, Bob Sil
    const quadDD = createQuad(0.85, -0.5, 0x7c2d12); // Bottom-Right: Mutual Betrayal (Nash)

    scene.add(matrixBoardGroup);

    // Window Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 560;
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
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Camera view positioning interpolation
      const currentView = cameraViewRef.current;
      let desiredCamPos = new THREE.Vector3(0, 4.2, 9.5);
      let desiredLookAt = new THREE.Vector3(0, 1.4, 0);

      if (currentView === 'roomA') {
        desiredCamPos.set(-3.2, 2.5, 3.8);
        desiredLookAt.set(-3.2, 1.2, 0);
      } else if (currentView === 'roomB') {
        desiredCamPos.set(3.2, 2.5, 3.8);
        desiredLookAt.set(3.2, 1.2, 0);
      } else if (currentView === 'matrix') {
        desiredCamPos.set(0, 4.2, 2.5);
        desiredLookAt.set(0, 4.2, -3.8);
      }

      // Smooth camera lerp
      camera.position.lerp(desiredCamPos, delta * 2.8);
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      camera.lookAt(desiredLookAt);

      // Rotate Tape Reels
      roomA.reel1.rotation.y += delta * 1.5;
      roomA.reel2.rotation.y += delta * 1.5;
      roomB.reel1.rotation.y += delta * 1.5;
      roomB.reel2.rotation.y += delta * 1.5;

      // Lamp gentle swinging pendulum physics
      roomA.lamp.rotation.z = Math.sin(time * 1.2) * 0.04;
      roomB.lamp.rotation.z = Math.sin(time * 1.2 + 1) * 0.04;

      // Lever Angle & Beacon Indicator based on Player choices
      const p1Choice = p1ChoiceRef.current;
      const p2Choice = p2ChoiceRef.current;

      const p1TargetRotZ = p1Choice === 'cooperate' ? -0.35 : 0.35;
      const p2TargetRotZ = p2Choice === 'cooperate' ? -0.35 : 0.35;

      roomA.leverHandle.rotation.z = THREE.MathUtils.lerp(roomA.leverHandle.rotation.z, p1TargetRotZ, delta * 6);
      roomB.leverHandle.rotation.z = THREE.MathUtils.lerp(roomB.leverHandle.rotation.z, p2TargetRotZ, delta * 6);

      // Color beacons (Emerald for Silence, Crimson for Betray)
      roomA.beacon.material.color.setHex(p1Choice === 'cooperate' ? 0x10b981 : 0xf43f5e);
      roomB.beacon.material.color.setHex(p2Choice === 'cooperate' ? 0x10b981 : 0xf43f5e);

      // Payoff Billboard Quad Highlights
      quadCC.material.emissiveIntensity = (p1Choice === 'cooperate' && p2Choice === 'cooperate') ? 0.8 : 0.1;
      quadCD.material.emissiveIntensity = (p1Choice === 'cooperate' && p2Choice === 'defect') ? 0.8 : 0.1;
      quadDC.material.emissiveIntensity = (p1Choice === 'defect' && p2Choice === 'cooperate') ? 0.8 : 0.1;
      quadDD.material.emissiveIntensity = (p1Choice === 'defect' && p2Choice === 'defect') ? 0.8 : 0.1;

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
            Dual View
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
                    Confess & Betray
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
                  <div className={styles.scenarioTitle}>☢️ Cold War Nuclear Arms Race</div>
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
                  <div className={styles.scenarioTitle}>💰 Corporate Price Wars</div>
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
                  <div className={styles.scenarioTitle}>🌍 Global Carbon Accord</div>
                  <div className={styles.scenarioDesc}>
                    Cut Emissions (Cooperate) vs Free-Ride on Coal (Defect). The planet bears the systemic cost.
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Thomas Hobbes &amp; The Leviathan</span>
                <span className={styles.cardSubtitle}>The Social Contract Solution</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                In a state of nature without governance, rational self-interest yields a war of all against all.
                Human civilization escapes the Prisoner&apos;s Dilemma by constructing legal systems, reputational transparency, and enforceable contracts that penalize defection—reshaping the payoff matrix so cooperation becomes the rational choice.
              </p>
            </div>
          </div>
        )}

        {/* Global Action Row */}
        <div className={styles.actionRow}>
          {activeTab === 'tournament' && (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={resetTournament}
              aria-label="Reset Tournament"
            >
              <Icon name="rotate-ccw" size={15} />
              Reset Tournament
            </button>
          )}

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleRecordRun}
            aria-label="Record Dilemma Telemetry"
          >
            <Icon name="check" size={15} />
            {hasRecorded ? 'Sentencing Logged!' : 'Record Dilemma Telemetry'}
          </button>
        </div>
      </div>
    </div>
  );
}
