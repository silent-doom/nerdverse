'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import styles from './MontyHall3DLab.module.css';
import Icon from '@/components/common/Icon';

/**
 * Practical Decision Domains for Monty Hall
 * Framing probability under real-world asymmetric information filters.
 */
const DOMAINS = {
  classic: {
    id: 'classic',
    title: 'Classic TV Stage (1975)',
    category: 'Game Theory',
    description: 'Monty Hall opens an unchosen dud door revealing a goat. Should you switch to the remaining door?',
    prizeName: 'Luxury Sports Car',
    prizeIcon: '🏎️',
    prizeDetail: 'Asset value: $120,000 utility',
    dudName: 'Booby Prize Goat',
    dudIcon: '🐐',
    dudDetail: 'Asset value: $0 nominal utility',
    hostTitle: 'Host Monty Hall',
    hostAction: 'knowingly unveils a goat from the unchosen doors',
    utilitarianBenefit: 'Doubling expected consumer utility from 1/3 ($40,000) to 2/3 ($80,000).',
    hostDescription: 'The host has complete knowledge of the prize location and is constrained to reveal a goat, filtering asymmetric information directly into the unchosen survivor.',
  },
  vc: {
    id: 'vc',
    title: 'Venture Capital Allocation',
    category: 'Financial Asymmetry',
    description: 'You place initial seed checks across 3 startups. Lead auditor eliminates a known zombie company. Do you concentrate capital?',
    prizeName: 'Decacorn Outlier',
    prizeIcon: '🦄',
    prizeDetail: '100x return ($500M fund returner)',
    dudName: 'Zombie Startup (Write-off)',
    dudIcon: '📉',
    dudDetail: '0x return ($0 capital recovery)',
    hostTitle: 'Syndicate Auditor',
    hostAction: 'performs forensic audit and liquidates a zero-traction startup',
    utilitarianBenefit: 'Maximizing capital efficiency and expected portfolio fund return by 200%.',
    hostDescription: 'The auditor eliminates a confirmed zombie among your unselected bets. The probability mass of the entire non-invested batch collapses onto the remaining candidate.',
  },
  medical: {
    id: 'medical',
    title: 'Clinical Diagnostic Triage',
    category: 'Epidemiology',
    description: 'Three differential pathogen hypotheses. Initial symptom match points to Pathogen A. An emergency biomarker assay rules out Pathogen B. Should therapy pivot?',
    prizeName: 'Curative Targeted Rx',
    prizeIcon: '🎯',
    prizeDetail: '100% Patient Remission & Preserved QALYs',
    dudName: 'Ineffective Screen (Benign)',
    dudIcon: '⚠️',
    dudDetail: 'Refractory infection / disease progression',
    hostTitle: 'Differential Assay',
    hostAction: 'rules out a benign false-positive from the unselected diagnoses',
    utilitarianBenefit: 'Minimizing preventable mortality and maximizing Quality-Adjusted Life Years (QALYs).',
    hostDescription: 'The biomarker assay specifically eliminates an unchosen candidate known to be negative. Preserving the original guess yields only 1/3 efficacy, whereas switching achieves 2/3 cure probability.',
  },
  cloud: {
    id: 'cloud',
    title: 'Distributed Fault Isolation',
    category: 'Site Reliability',
    description: 'Outage alarm triggers on 3 microservice clusters. SRE flags Cluster A. Automated eBPF telemetry proves Cluster B is healthy. Where should the failover route?',
    prizeName: 'Root-Cause Cascade Fault',
    prizeIcon: '⚡',
    prizeDetail: 'Immediate mitigation clears Sev-0 incident',
    dudName: 'Healthy Resilient Pod',
    dudIcon: '🛡️',
    dudDetail: 'Zero packet drop / normal latency',
    hostTitle: 'eBPF Kernel Observer',
    hostAction: 'confirms zero anomaly metrics on one uninspected cluster',
    utilitarianBenefit: 'Minimizing cumulative downtime Downturn and SLA violation penalties.',
    hostDescription: 'Automated telemetry eliminates a healthy candidate pod. Concentrating remediation on the remaining uninspected cluster doubles resolution velocity.',
  },
};

export default function MontyHall3DLab() {
  // Domain selection
  const [selectedDomain, setSelectedDomain] = useState('classic');
  const domain = DOMAINS[selectedDomain];

  // Active sub-mode: 'stage' | 'montecarlo' | 'grid100' | 'bayes'
  const [activeMode, setActiveMode] = useState('stage');

  // Game State: 'choose' | 'switch_or_stay' | 'finished'
  const [gameState, setGameState] = useState('choose');
  const [carDoor, setCarDoor] = useState(() => Math.floor(Math.random() * 3));
  const [playerPick, setPlayerPick] = useState(null);
  const [hostRevealed, setHostRevealed] = useState(null);
  const [finalChoice, setFinalChoice] = useState(null);
  const [gameResult, setGameResult] = useState(null); // 'win' | 'lose'
  const [didSwitch, setDidSwitch] = useState(false);

  // Empirical Stats (Live Session)
  const [sessionStats, setSessionStats] = useState({
    stayWins: 8,
    stayTotal: 24,
    switchWins: 32,
    switchTotal: 48,
  });

  // Monte Carlo Batch Simulation State
  const [monteHistory, setMonteHistory] = useState([
    { trial: 10, stayRate: 30.0, switchRate: 70.0 },
    { trial: 50, stayRate: 32.0, switchRate: 68.0 },
    { trial: 100, stayRate: 34.0, switchRate: 66.0 },
    { trial: 250, stayRate: 33.2, switchRate: 66.8 },
    { trial: 500, stayRate: 33.4, switchRate: 66.6 },
  ]);
  const [isSimulatingBatch, setIsSimulatingBatch] = useState(false);
  const [batchCount, setBatchCount] = useState(500);

  // 100-Door Intuition Grid State
  const [grid100Doors, setGrid100Doors] = useState(() => Array.from({ length: 100 }, (_, i) => i));
  const [grid100Prize, setGrid100Prize] = useState(() => Math.floor(Math.random() * 100));
  const [grid100Pick, setGrid100Pick] = useState(null);
  const [grid100Swept, setGrid100Swept] = useState(new Set());
  const [grid100Survivor, setGrid100Survivor] = useState(null);
  const [grid100Step, setGrid100Step] = useState('pick'); // 'pick' | 'decide' | 'revealed'
  const [grid100Result, setGrid100Result] = useState(null);

  // Camera preset
  const [cameraPreset, setCameraPreset] = useState('front');

  // Canvas & Three.js Refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameId = useRef(null);
  const doorsMeshRef = useRef([]);
  const itemsMeshRef = useRef([]);
  const confettiSystemRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const cameraAnglesRef = useRef({ theta: 0, phi: 0.15, radius: 11 });

  // Door Hinge Animation Targets (radians)
  const doorAnglesTarget = useRef([0, 0, 0]);
  const doorAnglesCurrent = useRef([0, 0, 0]);

  // Update Door angles based on game state
  useEffect(() => {
    if (gameState === 'choose') {
      doorAnglesTarget.current = [0, 0, 0];
    } else if (gameState === 'switch_or_stay') {
      if (hostRevealed !== null) {
        doorAnglesTarget.current = [
          hostRevealed === 0 ? -1.8 : 0,
          hostRevealed === 1 ? -1.8 : 0,
          hostRevealed === 2 ? -1.8 : 0,
        ];
      }
    } else if (gameState === 'finished') {
      doorAnglesTarget.current = [-1.8, -1.8, -1.8];
    }
  }, [gameState, hostRevealed]);

  // Handle Initial Door Selection
  const handleSelectInitialDoor = useCallback((doorIdx) => {
    if (gameState !== 'choose') return;
    setPlayerPick(doorIdx);

    // Host picks a door that is neither player's pick NOR the car door
    const remainingDoors = [0, 1, 2].filter((d) => d !== doorIdx && d !== carDoor);
    const hostChoice = remainingDoors[Math.floor(Math.random() * remainingDoors.length)];

    setHostRevealed(hostChoice);
    setGameState('switch_or_stay');
  }, [gameState, carDoor]);

  // Handle Final Choice: Stay or Switch
  const handleMakeFinalChoice = useCallback((willSwitch) => {
    if (gameState !== 'switch_or_stay') return;
    setDidSwitch(willSwitch);

    const chosenDoor = willSwitch
      ? [0, 1, 2].find((d) => d !== playerPick && d !== hostRevealed)
      : playerPick;

    setFinalChoice(chosenDoor);
    const won = chosenDoor === carDoor;
    setGameResult(won ? 'win' : 'lose');
    setGameState('finished');

    // Trigger celebration particles if won
    if (won && confettiSystemRef.current) {
      confettiSystemRef.current.visible = true;
    }

    // Update Session Stats
    setSessionStats((prev) => {
      if (willSwitch) {
        return {
          ...prev,
          switchWins: prev.switchWins + (won ? 1 : 0),
          switchTotal: prev.switchTotal + 1,
        };
      } else {
        return {
          ...prev,
          stayWins: prev.stayWins + (won ? 1 : 0),
          stayTotal: prev.stayTotal + 1,
        };
      }
    });
  }, [gameState, playerPick, hostRevealed, carDoor]);

  // Reset Single Game Round
  const resetRound = useCallback(() => {
    const newCar = Math.floor(Math.random() * 3);
    setCarDoor(newCar);
    setPlayerPick(null);
    setHostRevealed(null);
    setFinalChoice(null);
    setGameResult(null);
    setDidSwitch(false);
    setGameState('choose');
    doorAnglesTarget.current = [0, 0, 0];
    if (confettiSystemRef.current) {
      confettiSystemRef.current.visible = false;
    }
  }, []);

  // Monte Carlo Batch Engine
  const runMonteCarloBatch = useCallback((runs = 1000) => {
    setIsSimulatingBatch(true);
    setTimeout(() => {
      let switchWins = 0;
      let stayWins = 0;

      for (let i = 0; i < runs; i++) {
        const prize = Math.floor(Math.random() * 3);
        const pick = Math.floor(Math.random() * 3);
        const hostPossible = [0, 1, 2].filter((d) => d !== pick && d !== prize);
        const hostPick = hostPossible[Math.floor(Math.random() * hostPossible.length)];
        const switchedPick = [0, 1, 2].find((d) => d !== pick && d !== hostPick);

        if (pick === prize) stayWins++;
        if (switchedPick === prize) switchWins++;
      }

      const stayPct = Number(((stayWins / runs) * 100).toFixed(1));
      const switchPct = Number(((switchWins / runs) * 100).toFixed(1));

      setMonteHistory((prev) => [
        ...prev.slice(-6),
        { trial: runs, stayRate: stayPct, switchRate: switchPct },
      ]);
      setIsSimulatingBatch(false);
    }, 250);
  }, []);

  // 100-Door Extreme Intuition Handlers
  const handle100DoorPick = useCallback((idx) => {
    if (grid100Step !== 'pick') return;
    setGrid100Pick(idx);

    // Host sweeps 98 duds away, leaving either the prize or one remaining dud
    const allDoors = Array.from({ length: 100 }, (_, i) => i);
    let survivor;

    if (idx === grid100Prize) {
      // Picked prize: survivor is random remaining door
      const possibleSurvivors = allDoors.filter((d) => d !== idx);
      survivor = possibleSurvivors[Math.floor(Math.random() * possibleSurvivors.length)];
    } else {
      // Picked goat: host must leave the actual prize
      survivor = grid100Prize;
    }

    const swept = new Set(allDoors.filter((d) => d !== idx && d !== survivor));
    setGrid100Swept(swept);
    setGrid100Survivor(survivor);
    setGrid100Step('decide');
  }, [grid100Step, grid100Prize]);

  const handle100FinalChoice = useCallback((willSwitch) => {
    if (grid100Step !== 'decide') return;
    const finalPick = willSwitch ? grid100Survivor : grid100Pick;
    const won = finalPick === grid100Prize;
    setGrid100Result(won ? 'win' : 'lose');
    setGrid100Step('revealed');
  }, [grid100Step, grid100Survivor, grid100Pick, grid100Prize]);

  const reset100Grid = useCallback(() => {
    setGrid100Prize(Math.floor(Math.random() * 100));
    setGrid100Pick(null);
    setGrid100Swept(new Set());
    setGrid100Survivor(null);
    setGrid100Step('pick');
    setGrid100Result(null);
  }, []);

  // Set Camera View
  const handleSetCameraPreset = useCallback((preset) => {
    setCameraPreset(preset);
    if (!cameraRef.current) return;

    if (preset === 'front') {
      cameraAnglesRef.current = { theta: 0, phi: 0.12, radius: 10.5 };
    } else if (preset === 'wide') {
      cameraAnglesRef.current = { theta: 0.35, phi: 0.3, radius: 13.5 };
    } else if (preset === 'closeup') {
      cameraAnglesRef.current = { theta: 0, phi: 0.05, radius: 7.5 };
    }
  }, []);

  // Three.js Stage Setup & Animation Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0c10);
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.04);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 2.2, 10.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x1e2230, 1.8);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0xfff1d6, 4.5);
    mainSpot.position.set(0, 9, 8);
    mainSpot.angle = Math.PI / 4;
    mainSpot.penumbra = 0.6;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    scene.add(mainSpot);

    const blueRimLight = new THREE.DirectionalLight(0x3b82f6, 1.8);
    blueRimLight.position.set(-6, 5, -4);
    scene.add(blueRimLight);

    const amberRimLight = new THREE.DirectionalLight(0xf59e0b, 1.6);
    amberRimLight.position.set(6, 5, -4);
    scene.add(amberRimLight);

    // Floor Stage
    const floorGeo = new THREE.PlaneGeometry(32, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x10131a,
      roughness: 0.45,
      metalness: 0.65,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid Overlay on Stage Floor
    const gridHelper = new THREE.GridHelper(24, 24, 0xf59e0b, 0x1f2639);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // Stage Backwall
    const wallGeo = new THREE.PlaneGeometry(32, 12);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e14,
      roughness: 0.9,
      metalness: 0.1,
    });
    const backwall = new THREE.Mesh(wallGeo, wallMat);
    backwall.position.set(0, 5, -4);
    scene.add(backwall);

    // Overhead Studio Truss
    const trussGeo = new THREE.BoxGeometry(16, 0.35, 0.35);
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x272c3d, metalness: 0.8, roughness: 0.3 });
    const truss = new THREE.Mesh(trussGeo, trussMat);
    truss.position.set(0, 5.8, 0);
    scene.add(truss);

    // Spotlights on Truss for each door
    [-3.8, 0, 3.8].forEach((xPos) => {
      const spotLight = new THREE.SpotLight(0xfff8db, 2.5);
      spotLight.position.set(xPos, 5.7, 0);
      spotLight.target.position.set(xPos, 1.5, -2);
      spotLight.angle = 0.45;
      spotLight.penumbra = 0.5;
      scene.add(spotLight);
      scene.add(spotLight.target);
    });

    // 3 Door Stations
    const doorXPositions = [-3.8, 0, 3.8];
    const doorMeshes = [];
    const itemMeshes = [];

    doorXPositions.forEach((xPos, idx) => {
      const doorStationGroup = new THREE.Group();
      doorStationGroup.position.set(xPos, 0, -2);

      // Door Frame (Left, Right, Top)
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x1e2433,
        metalness: 0.7,
        roughness: 0.35,
      });

      const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 0.3), frameMat);
      frameL.position.set(-1.18, 1.8, 0);
      frameL.castShadow = true;
      doorStationGroup.add(frameL);

      const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 0.3), frameMat);
      frameR.position.set(1.18, 1.8, 0);
      frameR.castShadow = true;
      doorStationGroup.add(frameR);

      const frameT = new THREE.Mesh(new THREE.BoxGeometry(2.54, 0.22, 0.3), frameMat);
      frameT.position.set(0, 3.69, 0);
      frameT.castShadow = true;
      doorStationGroup.add(frameT);

      // Door Number Neon Sign
      const signMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const signPlacard = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.08), signMat);
      signPlacard.position.set(0, 4.05, 0.1);
      doorStationGroup.add(signPlacard);

      // Door Hinge Pivot Anchor
      const hingePivot = new THREE.Group();
      hingePivot.position.set(-1.08, 1.8, 0);

      // Door Panel
      const doorPanelGeo = new THREE.BoxGeometry(2.16, 3.48, 0.12);
      const doorMat = new THREE.MeshStandardMaterial({
        color: 0x222a3d,
        roughness: 0.4,
        metalness: 0.5,
      });
      const doorPanel = new THREE.Mesh(doorPanelGeo, doorMat);
      doorPanel.position.set(1.08, 0, 0); // Offset so pivot is on the left edge
      doorPanel.castShadow = true;
      doorPanel.receiveShadow = true;
      doorPanel.userData = { doorIndex: idx };
      hingePivot.add(doorPanel);

      // Door Handle (Brass metallic)
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 });
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 12), handleMat);
      handle.position.set(1.9, 0, 0.14);
      handle.castShadow = true;
      hingePivot.add(handle);

      doorStationGroup.add(hingePivot);
      scene.add(doorStationGroup);
      doorMeshes.push({ group: doorStationGroup, pivot: hingePivot, panel: doorPanel });

      // Stage items behind the door (Prize vs Dud)
      const itemGroup = new THREE.Group();
      itemGroup.position.set(xPos, 0, -2.4);

      // Platform pedestal
      const pedGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.25, 24);
      const pedMat = new THREE.MeshStandardMaterial({ color: 0x151924, metalness: 0.8, roughness: 0.3 });
      const ped = new THREE.Mesh(pedGeo, pedMat);
      ped.position.y = 0.125;
      itemGroup.add(ped);

      // Car / Grand Trophy Placeholder (Detailed Cyber Shape)
      const prizeMesh = new THREE.Group();
      const carBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.45, 0.85),
        new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.85, roughness: 0.15 })
      );
      carBody.position.y = 0.5;
      carBody.castShadow = true;
      prizeMesh.add(carBody);

      const carCockpit = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.35, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.9, roughness: 0.1 })
      );
      carCockpit.position.set(-0.15, 0.85, 0);
      prizeMesh.add(carCockpit);

      // Wheels
      [-0.55, 0.55].forEach((wx) => {
        [-0.45, 0.45].forEach((wz) => {
          const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 0.14, 16),
            new THREE.MeshStandardMaterial({ color: 0x090a0f, roughness: 0.8 })
          );
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(wx, 0.3, wz);
          prizeMesh.add(wheel);
        });
      });

      // Neon Underglow Ring for prize
      const ringGeo = new THREE.RingGeometry(0.7, 0.82, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      prizeMesh.add(ring);

      // Dud / Goat Placeholder (Hazard Dud Crate / Silo)
      const dudMesh = new THREE.Group();
      const dudBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.7, metalness: 0.3 })
      );
      dudBody.position.y = 0.65;
      dudBody.castShadow = true;
      dudMesh.add(dudBody);

      const dudSymbol = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 0.6, 4),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.5 })
      );
      dudSymbol.position.y = 1.35;
      dudMesh.add(dudSymbol);

      itemGroup.add(prizeMesh);
      itemGroup.add(dudMesh);
      scene.add(itemGroup);

      itemMeshes.push({ itemGroup, prizeMesh, dudMesh });
    });

    doorsMeshRef.current = doorMeshes;
    itemsMeshRef.current = itemMeshes;

    // Victory Confetti Particles
    const confettiCount = 180;
    const confettiGeo = new THREE.BufferGeometry();
    const confettiPositions = new Float32Array(confettiCount * 3);
    const confettiColors = new Float32Array(confettiCount * 3);

    for (let i = 0; i < confettiCount; i++) {
      confettiPositions[i * 3] = (Math.random() - 0.5) * 10;
      confettiPositions[i * 3 + 1] = Math.random() * 6 + 1;
      confettiPositions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;

      // Emerald, Gold, Cyan colors
      const col = Math.random() > 0.5 ? new THREE.Color(0x10b981) : new THREE.Color(0xf59e0b);
      confettiColors[i * 3] = col.r;
      confettiColors[i * 3 + 1] = col.g;
      confettiColors[i * 3 + 2] = col.b;
    }

    confettiGeo.setAttribute('position', new THREE.BufferAttribute(confettiPositions, 3));
    confettiGeo.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3));

    const confettiMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const confettiSystem = new THREE.Points(confettiGeo, confettiMat);
    confettiSystem.visible = false;
    scene.add(confettiSystem);
    confettiSystemRef.current = confettiSystem;

    // Raycaster for door clicks directly inside 3D canvas
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const onCanvasClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const panels = doorsMeshRef.current.map((d) => d.panel);
      const intersects = raycaster.intersectObjects(panels);

      if (intersects.length > 0) {
        const doorIdx = intersects[0].object.userData.doorIndex;
        if (typeof doorIdx === 'number') {
          handleSelectInitialDoor(doorIdx);
        }
      }
    };

    // Camera Orbit Mouse Drag Handlers
    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.clientX, y: e.clientY };

      cameraAnglesRef.current.theta -= dx * 0.005;
      cameraAnglesRef.current.phi = Math.max(0.02, Math.min(Math.PI / 2.5, cameraAnglesRef.current.phi + dy * 0.005));
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('click', onCanvasClick);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Resize Handler
    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    // Main Animation Loop
    let lastTime = performance.now();

    const animate = (now) => {
      animFrameId.current = requestAnimationFrame(animate);
      const currentTime = typeof now === 'number' ? now : performance.now();
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Camera positioning via spherical coordinates
      const { theta, phi, radius } = cameraAnglesRef.current;
      camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
      camera.position.y = radius * Math.sin(phi) + 1.8;
      camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
      camera.lookAt(0, 1.8, -2);

      // Smooth Door Hinge Interpolation
      for (let i = 0; i < 3; i++) {
        doorAnglesCurrent.current[i] = THREE.MathUtils.lerp(
          doorAnglesCurrent.current[i],
          doorAnglesTarget.current[i],
          delta * 4.5
        );
        if (doorsMeshRef.current[i]) {
          doorsMeshRef.current[i].pivot.rotation.y = doorAnglesCurrent.current[i];
        }
      }

      // Animate Confetti if visible
      if (confettiSystemRef.current && confettiSystemRef.current.visible) {
        const positions = confettiSystemRef.current.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= delta * 2.5;
          if (positions[i] < 0.2) positions[i] = 6.0;
        }
        confettiSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      container.removeEventListener('click', onCanvasClick);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [handleSelectInitialDoor]);

  // Sync Item Visibilities (Prize vs Dud behind doors) with state
  useEffect(() => {
    if (!itemsMeshRef.current || itemsMeshRef.current.length < 3) return;

    itemsMeshRef.current.forEach((item, idx) => {
      const isCar = idx === carDoor;
      item.prizeMesh.visible = isCar;
      item.dudMesh.visible = !isCar;

      // Highlight selected door panel with accent color
      if (doorsMeshRef.current[idx]) {
        const panel = doorsMeshRef.current[idx].panel;
        if (idx === playerPick) {
          panel.material.color.setHex(0xf59e0b); // Amber for initial selection
          panel.material.emissive.setHex(0xf59e0b);
          panel.material.emissiveIntensity = 0.35;
        } else if (idx === hostRevealed) {
          panel.material.color.setHex(0xef4444); // Red for host revealed dud
          panel.material.emissive.setHex(0xef4444);
          panel.material.emissiveIntensity = 0.2;
        } else if (gameState === 'finished' && idx === carDoor) {
          panel.material.color.setHex(0x10b981); // Emerald winner
          panel.material.emissive.setHex(0x10b981);
          panel.material.emissiveIntensity = 0.4;
        } else {
          panel.material.color.setHex(0x222a3d);
          panel.material.emissive.setHex(0x000000);
          panel.material.emissiveIntensity = 0;
        }
      }
    });
  }, [carDoor, playerPick, hostRevealed, gameState]);

  // Win Rates Calculation
  const stayRate = sessionStats.stayTotal > 0
    ? ((sessionStats.stayWins / sessionStats.stayTotal) * 100).toFixed(1)
    : '0.0';
  const switchRate = sessionStats.switchTotal > 0
    ? ((sessionStats.switchWins / sessionStats.switchTotal) * 100).toFixed(1)
    : '0.0';

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.tagline}>
          <span>Empirical Bayesian Decision Engine</span>
          <span className={styles.taglineBadge}>Consequence Calculus</span>
        </div>
        <h2 className={styles.title}>The Monty Hall Problem & Practical Information Asymmetry</h2>
        <p className={styles.subtitle}>
          A mathematical demonstration of how host-filtered information concentrates unobserved probability mass.
          Explore classic game theory alongside high-stakes venture capital, clinical medicine, and distributed systems.
        </p>
      </div>

      {/* Practical Domain Selector */}
      <div className={styles.domainSection}>
        <div className={styles.domainLabel}>Select Decision Scenario (Practical Context)</div>
        <div className={styles.domainTabs}>
          {Object.values(DOMAINS).map((d) => (
            <button
              key={d.id}
              type="button"
              className={`${styles.domainTab} ${selectedDomain === d.id ? styles.domainTabActive : ''}`}
              onClick={() => {
                setSelectedDomain(d.id);
                resetRound();
              }}
            >
              <div className={styles.domainTabTitle}>
                <span>{d.prizeIcon}</span>
                <span>{d.title}</span>
              </div>
              <span className={styles.domainTabCategory}>{d.category}</span>
              <p className={styles.domainTabDesc}>{d.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation for Modes */}
      <div className={styles.modeNav}>
        <button
          type="button"
          className={`${styles.modeBtn} ${activeMode === 'stage' ? styles.modeBtnActive : ''}`}
          onClick={() => setActiveMode('stage')}
        >
          <Icon name="play" size={14} />
          <span>3D Interactive Stage</span>
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${activeMode === 'montecarlo' ? styles.modeBtnActive : ''}`}
          onClick={() => setActiveMode('montecarlo')}
        >
          <Icon name="zap" size={14} />
          <span>Monte Carlo Batch Engine (10k Runs)</span>
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${activeMode === 'grid100' ? styles.modeBtnActive : ''}`}
          onClick={() => setActiveMode('grid100')}
        >
          <Icon name="grid" size={14} />
          <span>100-Door Extreme Intuition</span>
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${activeMode === 'bayes' ? styles.modeBtnActive : ''}`}
          onClick={() => setActiveMode('bayes')}
        >
          <Icon name="activity" size={14} />
          <span>Bayesian Waterfall & Math Proof</span>
        </button>
      </div>

      {/* MODE 1: 3D Interactive Stage */}
      {activeMode === 'stage' && (
        <div className={styles.stageCard}>
          {/* Canvas Wrapper */}
          <div className={styles.canvasWrapper}>
            <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />

            {/* Stage Overlay Top */}
            <div className={styles.stageOverlayTop}>
              <div className={styles.contextBanner}>
                <div className={styles.contextPrize}>
                  <span>Target: {domain.prizeName}</span>
                </div>
                <div className={styles.contextDud}>
                  <span>Elimination: {domain.dudName}</span>
                </div>
              </div>

              {/* Camera Presets */}
              <div className={styles.camControls}>
                <button
                  type="button"
                  className={`${styles.camBtn} ${cameraPreset === 'front' ? styles.camBtnActive : ''}`}
                  onClick={() => handleSetCameraPreset('front')}
                >
                  Front
                </button>
                <button
                  type="button"
                  className={`${styles.camBtn} ${cameraPreset === 'wide' ? styles.camBtnActive : ''}`}
                  onClick={() => handleSetCameraPreset('wide')}
                >
                  Studio
                </button>
                <button
                  type="button"
                  className={`${styles.camBtn} ${cameraPreset === 'closeup' ? styles.camBtnActive : ''}`}
                  onClick={() => handleSetCameraPreset('closeup')}
                >
                  Focus
                </button>
              </div>
            </div>

            {/* Stage Overlay Bottom */}
            <div className={styles.stageOverlayBottom}>
              <div className={styles.hintBadge}>
                Drag in 3D to rotate camera • Click any door to choose
              </div>
            </div>
          </div>

          {/* Interactive Decision Console */}
          <div className={styles.decisionConsole}>
            {/* Status Narrative */}
            <div className={styles.statusMessage}>
              <div>
                <div className={styles.statusTextMain}>
                  {gameState === 'choose' && (
                    <>
                      <span>Step 1: Make Initial Selection</span>
                      <span className={styles.taglineBadge}>Prior = 33.3%</span>
                    </>
                  )}
                  {gameState === 'switch_or_stay' && (
                    <>
                      <span>Step 2: {domain.hostTitle} Reveals a Dud!</span>
                      <span className={styles.taglineBadge}>Host Action: Asymmetric Filter</span>
                    </>
                  )}
                  {gameState === 'finished' && (
                    <>
                      <span>Outcome: {gameResult === 'win' ? '🎉 Target Captured!' : '❌ Selected Dud.'}</span>
                      <span className={styles.taglineBadge}>
                        {didSwitch ? 'Switched (66.7% Strategy)' : 'Stayed (33.3% Strategy)'}
                      </span>
                    </>
                  )}
                </div>
                <div className={styles.statusTextSub}>
                  {gameState === 'choose' &&
                    `You stand before 3 doors. Exactly one conceals the ${domain.prizeName}. Pick your initial bet.`}
                  {gameState === 'switch_or_stay' &&
                    `The ${domain.hostTitle} ${domain.hostAction} behind Door ${hostRevealed + 1}. Because the host knew where the dud was, the remaining unchosen door now carries 66.7% probability mass. Do you switch?`}
                  {gameState === 'finished' &&
                    `${gameResult === 'win' ? 'Success!' : 'Loss.'} ${domain.utilitarianBenefit} In repeating this decision over thousands of iterations, switching systematically maximizes net expected utility.`}
                </div>
              </div>

              {gameState === 'finished' && (
                <button type="button" className={styles.resetBtn} onClick={resetRound}>
                  <Icon name="refresh" size={14} />
                  <span>Next Round</span>
                </button>
              )}
            </div>

            {/* 3 Door Buttons Selector */}
            <div className={styles.doorButtonsGrid}>
              {[0, 1, 2].map((dIdx) => {
                const isSelected = playerPick === dIdx;
                const isRevealed = hostRevealed === dIdx;
                const isWinner = gameState === 'finished' && carDoor === dIdx;

                let statusLabel = 'Unopened';
                if (isSelected) statusLabel = 'Your Initial Pick';
                if (isRevealed) statusLabel = `${domain.dudName} (Revealed)`;
                if (isWinner) statusLabel = `★ ${domain.prizeName} ★`;

                return (
                  <button
                    key={dIdx}
                    type="button"
                    disabled={gameState !== 'choose' || isRevealed}
                    className={`${styles.doorSelectorBtn} ${isSelected ? styles.doorSelectorSelected : ''} ${
                      isRevealed ? styles.doorSelectorRevealed : ''
                    } ${isWinner ? styles.doorSelectorWinner : ''}`}
                    onClick={() => handleSelectInitialDoor(dIdx)}
                  >
                    <span className={styles.doorBtnNum}>DOOR 0{dIdx + 1}</span>
                    <span className={styles.doorBtnLabel}>
                      {isRevealed ? domain.dudIcon : isWinner ? domain.prizeIcon : '🚪'}
                    </span>
                    <span className={styles.doorBtnStatus}>{statusLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Switch vs Stay Prompt Action Box */}
            {gameState === 'switch_or_stay' && (
              <div className={styles.actionChoiceBox}>
                <div className={styles.actionChoiceHeader}>
                  <span className={styles.actionChoiceTitle}>
                    Strategic Dilemma: Preserve Original Pick or Switch?
                  </span>
                  <span className={styles.taglineBadge}>Utilitarian Expected Value: +100% Boost</span>
                </div>
                <div className={styles.actionButtonsRow}>
                  <button
                    type="button"
                    className={styles.switchActionBtn}
                    onClick={() => handleMakeFinalChoice(true)}
                  >
                    <Icon name="shuffle" size={16} />
                    <span>Switch to Other Door (P = 66.7%)</span>
                  </button>
                  <button
                    type="button"
                    className={styles.stayActionBtn}
                    onClick={() => handleMakeFinalChoice(false)}
                  >
                    <Icon name="anchor" size={16} />
                    <span>Stay with Door 0{playerPick + 1} (P = 33.3%)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: High-Speed Monte Carlo Simulation */}
      {activeMode === 'montecarlo' && (
        <div className={styles.monteCarloCard}>
          <div className={styles.monteHeader}>
            <div>
              <div className={styles.monteTitle}>
                <Icon name="trending-up" size={18} color="#F59E0B" />
                <span>Paul Erdős Monte Carlo Batch Verifier</span>
              </div>
              <p className={styles.statusTextSub}>
                When the legendary mathematician Paul Erdős was first presented with the Monty Hall problem, he refused to believe switching doubled odds until shown a Monte Carlo computer simulation.
              </p>
            </div>
            <div className={styles.batchControls}>
              <button
                type="button"
                className={styles.batchBtn}
                disabled={isSimulatingBatch}
                onClick={() => runMonteCarloBatch(50)}
              >
                +50 Trials
              </button>
              <button
                type="button"
                className={styles.batchBtn}
                disabled={isSimulatingBatch}
                onClick={() => runMonteCarloBatch(500)}
              >
                +500 Trials
              </button>
              <button
                type="button"
                className={styles.batchBtn}
                disabled={isSimulatingBatch}
                onClick={() => runMonteCarloBatch(5000)}
              >
                +5,000 Trials
              </button>
            </div>
          </div>

          {/* SVG Convergence Line Chart */}
          <div className={styles.chartContainer}>
            <svg width="100%" height="100%" viewBox="0 0 600 220" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="73.3" x2="600" y2="73.3" stroke="rgba(16, 185, 129, 0.35)" strokeDasharray="4 4" strokeWidth="1.5" />
              <text x="12" y="68" fill="#10B981" fontSize="10" fontFamily="monospace">66.7% Theoretical Switch Limit (2/3)</text>

              <line x1="0" y1="146.7" x2="600" y2="146.7" stroke="rgba(239, 68, 68, 0.35)" strokeDasharray="4 4" strokeWidth="1.5" />
              <text x="12" y="142" fill="#EF4444" fontSize="10" fontFamily="monospace">33.3% Theoretical Stay Limit (1/3)</text>

              {/* Data points lines */}
              {monteHistory.length > 1 && (
                <>
                  {/* Switch Rate Polyline */}
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    points={monteHistory
                      .map((pt, i) => {
                        const x = (i / (monteHistory.length - 1)) * 560 + 20;
                        const y = 220 - (pt.switchRate / 100) * 220;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Stay Rate Polyline */}
                  <polyline
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3"
                    points={monteHistory
                      .map((pt, i) => {
                        const x = (i / (monteHistory.length - 1)) * 560 + 20;
                        const y = 220 - (pt.stayRate / 100) * 220;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Points */}
                  {monteHistory.map((pt, i) => {
                    const x = (i / (monteHistory.length - 1)) * 560 + 20;
                    const ySwitch = 220 - (pt.switchRate / 100) * 220;
                    const yStay = 220 - (pt.stayRate / 100) * 220;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={ySwitch} r="4" fill="#10B981" />
                        <circle cx={x} cy={yStay} r="4" fill="#EF4444" />
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>

          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
              <div className={styles.statLabel}>Switch Win Rate (Empirical)</div>
              <div className={`${styles.statValue} ${styles.statValueGreen}`}>
                {monteHistory[monteHistory.length - 1]?.switchRate}%
              </div>
              <div className={styles.statSub}>Target: 66.67% Expected Utility</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Stay Win Rate (Empirical)</div>
              <div className={styles.statValue}>
                {monteHistory[monteHistory.length - 1]?.stayRate}%
              </div>
              <div className={styles.statSub}>Target: 33.33% Expected Utility</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Batch Executions</div>
              <div className={styles.statValue}>
                {monteHistory.reduce((acc, h) => acc + h.trial, 0).toLocaleString()}
              </div>
              <div className={styles.statSub}>Simulated Independent Trials</div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: 100-Door Extreme Intuition */}
      {activeMode === 'grid100' && (
        <div className={styles.grid100Card}>
          <div className={styles.monteHeader}>
            <div>
              <div className={styles.grid100Title}>
                The 100-Door Extreme Intuition Clarifier
              </div>
              <p className={styles.statusTextSub}>
                Why does switching feel counter-intuitive? Because 3 doors feels close to 50/50.
                Imagine 100 doors: You pick 1 door (1% chance). The host opens 98 doors showing duds, leaving only 1 other door intact.
                Do you stay with your 1% pick, or switch to the door that survived a 98-door elimination purge?
              </p>
            </div>
            {grid100Step === 'revealed' && (
              <button type="button" className={styles.resetBtn} onClick={reset100Grid}>
                <Icon name="refresh" size={14} />
                <span>Reset 100 Doors</span>
              </button>
            )}
          </div>

          {grid100Step === 'pick' && (
            <div className={styles.hintBadge}>
              Step 1: Click any of the 100 doors to make your initial blind pick (Probability = 1/100 = 1.0%).
            </div>
          )}

          {grid100Step === 'decide' && (
            <div className={styles.actionChoiceBox}>
              <div className={styles.actionChoiceHeader}>
                <span className={styles.actionChoiceTitle}>
                  Host eliminated 98 duds! 2 doors remain: Door #{grid100Pick + 1} vs Door #{grid100Survivor + 1}.
                </span>
                <span className={styles.taglineBadge}>Survivor Probability: 99.0%</span>
              </div>
              <div className={styles.actionButtonsRow}>
                <button
                  type="button"
                  className={styles.switchActionBtn}
                  onClick={() => handle100FinalChoice(true)}
                >
                  <Icon name="shuffle" size={16} />
                  <span>Switch to Purge Survivor #{grid100Survivor + 1} (99% Odds)</span>
                </button>
                <button
                  type="button"
                  className={styles.stayActionBtn}
                  onClick={() => handle100FinalChoice(false)}
                >
                  <Icon name="anchor" size={16} />
                  <span>Stay with Blind Pick #{grid100Pick + 1} (1% Odds)</span>
                </button>
              </div>
            </div>
          )}

          {grid100Step === 'revealed' && (
            <div className={styles.statusMessage}>
              <div className={styles.statusTextMain}>
                {grid100Result === 'win' ? '🎉 Extraordinary Win!' : '❌ Loss!'}
                <span className={styles.taglineBadge}>
                  Actual Target was Door #{grid100Prize + 1}
                </span>
              </div>
            </div>
          )}

          {/* 100 Door Grid */}
          <div className={styles.doors100Grid}>
            {grid100Doors.map((idx) => {
              const isPick = grid100Pick === idx;
              const isSwept = grid100Swept.has(idx);
              const isSurvivor = grid100Survivor === idx;
              const isPrize = grid100Step === 'revealed' && grid100Prize === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={grid100Step !== 'pick'}
                  className={`${styles.door100Cell} ${isPick ? styles.door100Selected : ''} ${
                    isSwept ? styles.door100Swept : ''
                  } ${isSurvivor ? styles.door100Survivor : ''}`}
                  onClick={() => handle100DoorPick(idx)}
                >
                  {isPrize ? '🦄' : isSwept ? '✕' : idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 4: Bayesian Waterfall & Math Proof */}
      {activeMode === 'bayes' && (
        <div className={styles.bayesCard}>
          <div className={styles.monteTitle}>
            <Icon name="book" size={18} color="#F59E0B" />
            <span>Bayesian Formulation of Information Concentration</span>
          </div>
          <p className={styles.statusTextSub}>
            Let $C_i$ denote the state that the prize is behind Door $i$, with uniform prior $P(C_i) = 1/3$.
            Suppose the player chooses Door 1, and the host (who cannot reveal the prize) opens Door 3 ($O_3$).
          </p>

          <div className={styles.bayesWaterfall}>
            <div>
              <div className={styles.statLabel}>1. Prior Probability Distribution (Before Host Evidence)</div>
              <div className={styles.bayesBarTrack}>
                <div className={styles.bayesBarSegment} style={{ width: '33.3%', background: '#3B82F6' }}>
                  Door 1 (P = 33.3%)
                </div>
                <div className={styles.bayesBarSegment} style={{ width: '33.3%', background: '#10B981' }}>
                  Door 2 (P = 33.3%)
                </div>
                <div className={styles.bayesBarSegment} style={{ width: '33.4%', background: '#8B5CF6' }}>
                  Door 3 (P = 33.3%)
                </div>
              </div>
            </div>

            <div>
              <div className={styles.statLabel}>2. Host Evidence Filter: Host Opens Door 3 ($O_3$)</div>
              <p className={styles.statusTextSub}>
                • If Prize is at Door 1: Host picks between Door 2 & 3 randomly $\Rightarrow P(O_3 | C_1) = 1/2$.<br />
                • If Prize is at Door 2: Host has NO CHOICE but to open Door 3 $\Rightarrow P(O_3 | C_2) = 1$.<br />
                • If Prize is at Door 3: Host is forbidden from opening Door 3 $\Rightarrow P(O_3 | C_3) = 0$.
              </p>
            </div>

            <div>
              <div className={styles.statLabel}>3. Posterior Probability Distribution via Bayes&#39; Theorem</div>
              <div className={styles.bayesBarTrack}>
                <div className={styles.bayesBarSegment} style={{ width: '33.3%', background: '#EF4444' }}>
                  Stay: Door 1 (P = 1/3)
                </div>
                <div className={styles.bayesBarSegment} style={{ width: '66.7%', background: '#10B981' }}>
                  Switch: Door 2 (P = 2/3)
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.8125rem',
            lineHeight: '1.6',
            color: '#E5E7EB',
          }}>
            <strong>Bayesian Equation:</strong><br />
            P(C_2 | O_3) = [ P(O_3 | C_2) * P(C_2) ] / [ P(O_3 | C_1)*P(C_1) + P(O_3 | C_2)*P(C_2) + P(O_3 | C_3)*P(C_3) ]<br />
            P(C_2 | O_3) = [ 1 * (1/3) ] / [ (1/2 * 1/3) + (1 * 1/3) + (0 * 1/3) ]<br />
            P(C_2 | O_3) = (1/3) / (1/6 + 2/6) = (1/3) / (1/2) = <strong>2/3 ≈ 66.67%</strong>
          </div>
        </div>
      )}

      {/* Live Session Scoreboard */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
          <div className={styles.statLabel}>Live Session: Switch Win Rate</div>
          <div className={`${styles.statValue} ${styles.statValueGreen}`}>{switchRate}%</div>
          <div className={styles.statSub}>
            {sessionStats.switchWins} wins / {sessionStats.switchTotal} trials
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Live Session: Stay Win Rate</div>
          <div className={styles.statValue}>{stayRate}%</div>
          <div className={styles.statSub}>
            {sessionStats.stayWins} wins / {sessionStats.stayTotal} trials
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Consequence Arbitrage</div>
          <div className={styles.statValue}>2.00x</div>
          <div className={styles.statSub}>Multiplicative Advantage of Switching</div>
        </div>
      </div>
    </div>
  );
}
