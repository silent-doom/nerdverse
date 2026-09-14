'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './MontyHall3DLab.module.css';
import Icon from '@/components/common/Icon';

/**
 * Real-world practical context applications of Bayesian information concentration
 */
const PRACTICAL_APPLICATIONS = [
  {
    id: 'vc',
    title: 'Venture Capital Portfolio Strategy',
    icon: '🦄',
    category: 'Power-Law Finance',
    description:
      'You invest initial seed checks across parallel startups. A lead syndicate audit discovers and liquidates a zero-traction failure among your unselected bets. Because the audit selectively pruned a known dud from the non-invested batch, concentrating follow-on capital on the surviving candidate doubles the probability of capturing the 100x decacorn.',
    takeaway: 'Doubles portfolio fund return probability from 33.3% to 66.7%.',
  },
  {
    id: 'medical',
    title: 'Clinical Diagnostic Triage',
    icon: '🎯',
    category: 'Acute Epidemiology',
    description:
      'An emergency patient presents with acute distress with 3 viable differential pathogen hypotheses. Initial empiric therapy targets Pathogen 1. An emergency biomarker assay rules out Pathogen 3. Under Bayesian probability rules, Pathogen 2 now carries a 66.7% probability of being the true causative agent. Pivoting therapy preserves Quality-Adjusted Life Years (QALYs).',
    takeaway: 'Minimizes preventable morbidity and diagnostic inertia.',
  },
  {
    id: 'cloud',
    title: 'Distributed Systems & Incident Response',
    icon: '⚡',
    category: 'Site Reliability Engineering',
    description:
      'During a high-severity cloud outage, 3 upstream clusters are candidate root causes. An on-call SRE routes triage scripts to Cluster 1. Automated eBPF kernel tracing proves Cluster 3 has zero packet loss. Redirecting remediation resources to Cluster 2 yields twice the likelihood of clearing the outage cascade.',
    takeaway: 'Cuts expected downtime and SLA breach penalties by 50%.',
  },
];

export default function MontyHall3DLab() {
  // Game State: 'choose' | 'switch_or_stay' | 'finished'
  const [gameState, setGameState] = useState('choose');
  const [carDoor, setCarDoor] = useState(() => Math.floor(Math.random() * 3));
  const [playerPick, setPlayerPick] = useState(null);
  const [hostRevealed, setHostRevealed] = useState(null);
  const [finalChoice, setFinalChoice] = useState(null);
  const [gameResult, setGameResult] = useState(null); // 'win' | 'lose'
  const [didSwitch, setDidSwitch] = useState(false);

  // Live Session Stats
  const [sessionStats, setSessionStats] = useState({
    stayWins: 6,
    stayTotal: 18,
    switchWins: 24,
    switchTotal: 36,
  });

  // Automated Quick Simulation State
  const [isSimulatingBatch, setIsSimulatingBatch] = useState(false);
  const [batchFeedback, setBatchFeedback] = useState(null);

  // Optional 100-Door Accordion Toggle
  const [show100Doors, setShow100Doors] = useState(false);
  const [grid100Pick, setGrid100Pick] = useState(null);
  const [grid100Survivor, setGrid100Survivor] = useState(null);
  const [grid100Prize] = useState(() => Math.floor(Math.random() * 100));

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
  const cameraAnglesRef = useRef({ theta: 0, phi: 0.12, radius: 10.5 });

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
  const handleSelectInitialDoor = useCallback(
    (doorIdx) => {
      if (gameState !== 'choose') return;
      setPlayerPick(doorIdx);

      // Host picks a door that is neither player's pick NOR the car door
      const remainingDoors = [0, 1, 2].filter((d) => d !== doorIdx && d !== carDoor);
      const hostChoice = remainingDoors[Math.floor(Math.random() * remainingDoors.length)];

      setHostRevealed(hostChoice);
      setGameState('switch_or_stay');
    },
    [gameState, carDoor]
  );

  // Handle Final Choice: Stay or Switch
  const handleMakeFinalChoice = useCallback(
    (willSwitch) => {
      if (gameState !== 'switch_or_stay') return;
      setDidSwitch(willSwitch);

      const chosenDoor = willSwitch
        ? [0, 1, 2].find((d) => d !== playerPick && d !== hostRevealed)
        : playerPick;

      setFinalChoice(chosenDoor);
      const won = chosenDoor === carDoor;
      setGameResult(won ? 'win' : 'lose');
      setGameState('finished');

      if (won && confettiSystemRef.current) {
        confettiSystemRef.current.visible = true;
      }

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
    },
    [gameState, playerPick, hostRevealed, carDoor]
  );

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

  // Run 1,000 Automated Trials Instantly
  const runQuickSimulation = useCallback((runs = 1000) => {
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

      setSessionStats((prev) => ({
        stayWins: prev.stayWins + stayWins,
        stayTotal: prev.stayTotal + runs,
        switchWins: prev.switchWins + switchWins,
        switchTotal: prev.switchTotal + runs,
      }));

      const switchPct = ((switchWins / runs) * 100).toFixed(1);
      const stayPct = ((stayWins / runs) * 100).toFixed(1);
      setBatchFeedback(
        `Ran ${runs.toLocaleString()} simulated rounds: Switching won ${switchPct}% (${switchWins.toLocaleString()}) vs Staying ${stayPct}% (${stayWins.toLocaleString()}).`
      );
      setIsSimulatingBatch(false);
    }, 200);
  }, []);

  // Camera presets
  const handleSetCameraPreset = useCallback((preset) => {
    setCameraPreset(preset);
    if (preset === 'front') {
      cameraAnglesRef.current = { theta: 0, phi: 0.12, radius: 10.5 };
    } else if (preset === 'studio') {
      cameraAnglesRef.current = { theta: 0.35, phi: 0.28, radius: 12.5 };
    }
  }, []);

  // 100-Door demo click
  const handle100DoorClick = useCallback(
    (idx) => {
      setGrid100Pick(idx);
      const survivor = idx === grid100Prize ? (idx === 0 ? 1 : 0) : grid100Prize;
      setGrid100Survivor(survivor);
    },
    [grid100Prize]
  );

  // Three.js Scene Setup & Animation Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0c10);
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 2.0, 10.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting & Tone Mapping (Balanced, clear illumination without murky darkness)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    const ambientLight = new THREE.AmbientLight(0xf8fafc, 1.45);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfff7ed, 2.5);
    mainKeyLight.position.set(5, 10, 8);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.35);
    fillLight.position.set(-7, 7, 7);
    scene.add(fillLight);

    const overheadSpot = new THREE.SpotLight(0xffedd5, 3.2, 28, Math.PI / 3.5, 0.45);
    overheadSpot.position.set(0, 10, 2);
    overheadSpot.castShadow = true;
    scene.add(overheadSpot);

    const rimLight = new THREE.DirectionalLight(0xe2e8f0, 1.25);
    rimLight.position.set(0, 7, -6);
    scene.add(rimLight);

    // Stage Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(32, 24),
      new THREE.MeshStandardMaterial({ color: 0x0e1017, roughness: 0.45, metalness: 0.65 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(24, 24, 0xe5a93c, 0x1f232c);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // 3 Door Stations
    const doorXPositions = [-3.8, 0, 3.8];
    const doorMeshes = [];
    const itemMeshes = [];

    doorXPositions.forEach((xPos, idx) => {
      const doorStationGroup = new THREE.Group();
      doorStationGroup.position.set(xPos, 0, -2);

      // Station Spotlight
      const doorSpot = new THREE.SpotLight(0xffedd5, 2.2, 14, Math.PI / 4, 0.4);
      doorSpot.position.set(0, 5.5, 1.5);
      doorSpot.target = doorStationGroup;
      doorStationGroup.add(doorSpot);

      // --- FULL SOLID 3D ENCLOSURE BOOTH ---
      // Materials
      const boothExtMat = new THREE.MeshStandardMaterial({
        color: 0x11131a,
        metalness: 0.82,
        roughness: 0.38,
      });
      const boothIntMat = new THREE.MeshStandardMaterial({
        color: 0x08090d,
        roughness: 0.95,
        metalness: 0.05,
      });
      const boothTrimMat = new THREE.MeshStandardMaterial({
        color: 0x1e222e,
        metalness: 0.9,
        roughness: 0.25,
      });
      const amberTrimMat = new THREE.MeshStandardMaterial({
        color: 0xe5a93c,
        metalness: 0.88,
        roughness: 0.2,
      });

      // 1. Left Enclosure Wall (Solid side barrier)
      const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.8, 2.6), boothExtMat);
      wallL.position.set(-1.22, 1.85, -1.3);
      wallL.castShadow = true;
      wallL.receiveShadow = true;
      doorStationGroup.add(wallL);

      // 2. Right Enclosure Wall (Solid side barrier)
      const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.8, 2.6), boothExtMat);
      wallR.position.set(1.22, 1.85, -1.3);
      wallR.castShadow = true;
      wallR.receiveShadow = true;
      doorStationGroup.add(wallR);

      // 3. Back Enclosure Wall (Solid rear barrier)
      const wallB = new THREE.Mesh(new THREE.BoxGeometry(2.58, 3.8, 0.14), boothExtMat);
      wallB.position.set(0, 1.85, -2.6);
      wallB.castShadow = true;
      wallB.receiveShadow = true;
      doorStationGroup.add(wallB);

      // 4. Roof / Ceiling (Solid top barrier)
      const roof = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.14, 2.6), boothExtMat);
      roof.position.set(0, 3.75, -1.3);
      roof.castShadow = true;
      roof.receiveShadow = true;
      doorStationGroup.add(roof);

      // 5. Interior Stage Base Floor
      const boothFloor = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.06, 2.5), boothIntMat);
      boothFloor.position.set(0, 0.03, -1.3);
      boothFloor.receiveShadow = true;
      doorStationGroup.add(boothFloor);

      // 6. Threshold Kickplate (Seals light/line-of-sight directly under the door panel)
      const threshold = new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.1, 0.24), boothTrimMat);
      threshold.position.set(0, 0.05, 0);
      threshold.receiveShadow = true;
      doorStationGroup.add(threshold);

      // 7. Interior Stage Back Acoustic Panel with Amber Accent Edges
      const interiorBackPanel = new THREE.Mesh(new THREE.BoxGeometry(2.1, 3.4, 0.04), boothIntMat);
      interiorBackPanel.position.set(0, 1.8, -2.51);
      doorStationGroup.add(interiorBackPanel);

      const accentStripL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.4, 0.04), amberTrimMat);
      accentStripL.position.set(-1.05, 1.8, -2.51);
      doorStationGroup.add(accentStripL);

      const accentStripR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.4, 0.04), amberTrimMat);
      accentStripR.position.set(1.05, 1.8, -2.51);
      doorStationGroup.add(accentStripR);

      // 8. Interior Ceiling Downlight (Illuminates compartment when door opens)
      const interiorDownlight = new THREE.SpotLight(0xfff7ed, 1.6, 5.5, Math.PI / 3, 0.4);
      interiorDownlight.position.set(0, 3.6, -1.3);
      const downlightTarget = new THREE.Object3D();
      downlightTarget.position.set(0, 0.1, -1.3);
      doorStationGroup.add(downlightTarget);
      interiorDownlight.target = downlightTarget;
      doorStationGroup.add(interiorDownlight);

      // --- FRONT DOOR FRAME & HINGED DOOR ---
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x181a24, metalness: 0.8, roughness: 0.35 });
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

      // Amber Number Placard
      const signPlacard = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.45, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xe5a93c, emissive: 0xe5a93c, emissiveIntensity: 0.6 })
      );
      signPlacard.position.set(0, 4.05, 0.1);
      doorStationGroup.add(signPlacard);

      // Door Hinge Pivot Anchor
      const hingePivot = new THREE.Group();
      hingePivot.position.set(-1.08, 1.8, 0);

      // Door Panel
      const doorPanel = new THREE.Mesh(
        new THREE.BoxGeometry(2.16, 3.48, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x161822, roughness: 0.45, metalness: 0.5 })
      );
      doorPanel.position.set(1.08, 0, 0);
      doorPanel.castShadow = true;
      doorPanel.receiveShadow = true;
      doorPanel.userData = { doorIndex: idx };
      hingePivot.add(doorPanel);

      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.4, 12),
        new THREE.MeshStandardMaterial({ color: 0xe5a93c, metalness: 0.9, roughness: 0.2 })
      );
      handle.position.set(1.9, 0, 0.14);
      handle.castShadow = true;
      hingePivot.add(handle);

      doorStationGroup.add(hingePivot);
      scene.add(doorStationGroup);
      doorMeshes.push({ group: doorStationGroup, pivot: hingePivot, panel: doorPanel });

      // --- INTERIOR PRIZE & DUD DISPLAY (NESTED FULLY INSIDE BOOTH) ---
      const itemGroup = new THREE.Group();
      // Centered at z = -1.3 inside the booth (0.39m clearance behind closed door)
      itemGroup.position.set(0, 0, -1.3);
      doorStationGroup.add(itemGroup);

      // Sports Car Prize Anchor
      const prizeMesh = new THREE.Group();
      
      // Deluxe Chrome / Carbon Turntable Platform (Sized to fit comfortably inside booth)
      const carTurntable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.82, 0.85, 0.12, 32),
        new THREE.MeshStandardMaterial({ color: 0x12131a, metalness: 0.85, roughness: 0.2 })
      );
      carTurntable.position.y = 0.06;
      carTurntable.receiveShadow = true;
      prizeMesh.add(carTurntable);

      // Warm Amber Underglow Ring
      const carUnderglow = new THREE.Mesh(
        new THREE.RingGeometry(0.72, 0.84, 32),
        new THREE.MeshBasicMaterial({ color: 0xe5a93c, side: THREE.DoubleSide })
      );
      carUnderglow.rotation.x = -Math.PI / 2;
      carUnderglow.position.y = 0.125;
      prizeMesh.add(carUnderglow);

      const carAnchor = new THREE.Group();
      prizeMesh.add(carAnchor);

      // Goat / Farm Paddock Anchor
      const dudMesh = new THREE.Group();
      
      // Grounded Earthy Pasture Disk (Sized to fit comfortably inside booth)
      const goatPaddock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.82, 0.85, 0.12, 32),
        new THREE.MeshStandardMaterial({ color: 0x202620, roughness: 0.9, metalness: 0.05 })
      );
      goatPaddock.position.y = 0.06;
      goatPaddock.receiveShadow = true;
      dudMesh.add(goatPaddock);

      // Pasture fence posts around the paddock
      const fencePostGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.4, 8);
      const fencePostMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
      for (let f = 0; f < 8; f++) {
        const ang = (f / 8) * Math.PI * 2;
        const post = new THREE.Mesh(fencePostGeo, fencePostMat);
        post.position.set(Math.cos(ang) * 0.76, 0.2, Math.sin(ang) * 0.76);
        dudMesh.add(post);
      }

      // Subtle Slate Paddock Border Ring
      const goatGlow = new THREE.Mesh(
        new THREE.RingGeometry(0.66, 0.78, 32),
        new THREE.MeshBasicMaterial({ color: 0x64748b, side: THREE.DoubleSide })
      );
      goatGlow.rotation.x = -Math.PI / 2;
      goatGlow.position.y = 0.125;
      dudMesh.add(goatGlow);

      const goatAnchor = new THREE.Group();
      dudMesh.add(goatAnchor);

      itemGroup.add(prizeMesh);
      itemGroup.add(dudMesh);

      itemMeshes.push({ itemGroup, prizeMesh, dudMesh, carAnchor, goatAnchor, goatModel: null, carModel: null });
    });

    doorsMeshRef.current = doorMeshes;
    itemsMeshRef.current = itemMeshes;

    // Load Blender 3D Models (Sports Car & Goat)
    const gltfLoader = new GLTFLoader();
    
    gltfLoader.load('/models/sports_car.glb', (gltf) => {
      itemMeshes.forEach((item) => {
        const carClone = gltf.scene.clone(true);
        carClone.scale.set(0.78, 0.78, 0.78);
        carClone.position.set(0, 0.12, 0);
        carClone.rotation.y = -Math.PI / 5;
        carClone.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        item.carAnchor.add(carClone);
        item.carModel = carClone;
      });
    });

    gltfLoader.load('/models/goat.glb', (gltf) => {
      itemMeshes.forEach((item, idx) => {
        const goatClone = gltf.scene.clone(true);
        goatClone.scale.set(0.8, 0.8, 0.8);
        goatClone.position.set(0, 0.1, 0);
        goatClone.rotation.y = idx === 0 ? 0.35 : idx === 2 ? -0.35 : 0;
        goatClone.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        item.goatAnchor.add(goatClone);
        item.goatModel = goatClone;
      });
    });

    // Confetti Particles
    const confettiCount = 180;
    const confettiGeo = new THREE.BufferGeometry();
    const confettiPositions = new Float32Array(confettiCount * 3);
    const confettiColors = new Float32Array(confettiCount * 3);

    for (let i = 0; i < confettiCount; i++) {
      confettiPositions[i * 3] = (Math.random() - 0.5) * 10;
      confettiPositions[i * 3 + 1] = Math.random() * 6 + 1;
      confettiPositions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;

      const col = Math.random() > 0.5 ? new THREE.Color(0xe5a93c) : new THREE.Color(0xf3f4f6);
      confettiColors[i * 3] = col.r;
      confettiColors[i * 3 + 1] = col.g;
      confettiColors[i * 3 + 2] = col.b;
    }

    confettiGeo.setAttribute('position', new THREE.BufferAttribute(confettiPositions, 3));
    confettiGeo.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3));

    const confettiMat = new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.9 });
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

    // Camera Orbit Mouse Drag
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

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let lastTime = performance.now();

    const animate = (now) => {
      animFrameId.current = requestAnimationFrame(animate);
      const currentTime = typeof now === 'number' ? now : performance.now();
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const { theta, phi, radius } = cameraAnglesRef.current;
      camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
      camera.position.y = radius * Math.sin(phi) + 1.8;
      camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
      camera.lookAt(0, 1.8, -2);

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

      // Animate 3D Models
      itemsMeshRef.current.forEach((item, idx) => {
        if (item.goatModel) {
          // Organic breathing & gentle idle head movement
          item.goatModel.position.y = 0.10 + Math.sin(currentTime * 0.003 + idx * 1.5) * 0.015;
          item.goatModel.rotation.z = Math.sin(currentTime * 0.002 + idx) * 0.02;
        }
        if (item.carModel && item.prizeMesh.visible) {
          // Slow luxury turntable rotation when prize is active
          item.carAnchor.rotation.y += delta * 0.35;
        }
      });

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

  // Sync Item Visibilities
  useEffect(() => {
    if (!itemsMeshRef.current || itemsMeshRef.current.length < 3) return;

    itemsMeshRef.current.forEach((item, idx) => {
      const isCar = idx === carDoor;
      item.prizeMesh.visible = isCar;
      item.dudMesh.visible = !isCar;

      if (doorsMeshRef.current[idx]) {
        const panel = doorsMeshRef.current[idx].panel;
        if (idx === playerPick) {
          panel.material.color.setHex(0xe5a93c);
          panel.material.emissive.setHex(0xe5a93c);
          panel.material.emissiveIntensity = 0.25;
        } else if (idx === hostRevealed) {
          panel.material.color.setHex(0x272a34);
          panel.material.emissive.setHex(0x000000);
          panel.material.emissiveIntensity = 0;
        } else if (gameState === 'finished' && idx === carDoor) {
          panel.material.color.setHex(0xe5a93c);
          panel.material.emissive.setHex(0xe5a93c);
          panel.material.emissiveIntensity = 0.4;
        } else {
          panel.material.color.setHex(0x161822);
          panel.material.emissive.setHex(0x000000);
          panel.material.emissiveIntensity = 0;
        }
      }
    });
  }, [carDoor, playerPick, hostRevealed, gameState]);

  // Win Rates Calculation
  const stayRate =
    sessionStats.stayTotal > 0 ? ((sessionStats.stayWins / sessionStats.stayTotal) * 100).toFixed(1) : '0.0';
  const switchRate =
    sessionStats.switchTotal > 0 ? ((sessionStats.switchWins / sessionStats.switchTotal) * 100).toFixed(1) : '0.0';

  return (
    <div className={styles.container}>
      {/* Simple Header with Clear Pretext */}
      <div className={styles.header}>
        <div className={styles.tagline}>
          <span>Bayesian Probability Laboratory</span>
          <span className={styles.taglineBadge}>Interactive 3D Stage</span>
        </div>
        <h2 className={styles.title}>The Monty Hall Problem</h2>
        <p className={styles.subtitle}>
          Behind one door is a brand-new sports car; behind the other two are goats. You pick a door.
          The host reveals a goat behind one of the other doors. <strong>Should you switch?</strong>
        </p>
      </div>

      {/* 3D Stage Card */}
      <div className={styles.stageCard}>
        <div className={styles.canvasWrapper}>
          <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />

          {/* Top Overlays */}
          <div className={styles.stageOverlayTop}>
            <div className={styles.contextBanner}>
              <div className={styles.contextPrize}>
                <span>🏎️ Target: Sports Car ($120k)</span>
              </div>
              <div className={styles.contextDud}>
                <span>🐐 Dud: Booby Prize Goat ($0)</span>
              </div>
            </div>

            <div className={styles.camControls}>
              <button
                type="button"
                className={`${styles.camBtn} ${cameraPreset === 'front' ? styles.camBtnActive : ''}`}
                onClick={() => handleSetCameraPreset('front')}
              >
                Front View
              </button>
              <button
                type="button"
                className={`${styles.camBtn} ${cameraPreset === 'studio' ? styles.camBtnActive : ''}`}
                onClick={() => handleSetCameraPreset('studio')}
              >
                Free Angle
              </button>
            </div>
          </div>

          <div className={styles.stageOverlayBottom}>
            <div className={styles.hintBadge}>Drag in 3D to rotate camera • Click any door to choose</div>
          </div>
        </div>

        {/* Streamlined Decision Console */}
        <div className={styles.decisionConsole}>
          {/* Status Message */}
          <div className={styles.statusMessage}>
            <div>
              <div className={styles.statusTextMain}>
                {gameState === 'choose' && (
                  <>
                    <span>Step 1: Pick a Door</span>
                    <span className={styles.taglineBadge}>Initial Odds: 1/3 (33.3%)</span>
                  </>
                )}
                {gameState === 'switch_or_stay' && (
                  <>
                    <span>Step 2: Monty Reveals a Goat!</span>
                    <span className={styles.taglineBadge}>Host Action: Asymmetric Filter</span>
                  </>
                )}
                {gameState === 'finished' && (
                  <>
                    <span>{gameResult === 'win' ? '🎉 You Won the Sports Car!' : '❌ You Got a Goat.'}</span>
                    <span className={styles.taglineBadge}>
                      {didSwitch ? 'Switched (66.7% Strategy)' : 'Stayed (33.3% Strategy)'}
                    </span>
                  </>
                )}
              </div>
              <div className={styles.statusTextSub}>
                {gameState === 'choose' &&
                  'Choose Door 1, 2, or 3 below (or click directly on the door in the 3D stage above):'}
                {gameState === 'switch_or_stay' &&
                  `Monty opened Door 0${hostRevealed + 1} showing a goat. Because Monty never reveals the car, the remaining unchosen door now holds 66.7% probability mass! Do you switch?`}
                {gameState === 'finished' &&
                  (gameResult === 'win'
                    ? 'Target captured! Switching gives you a 2-to-1 advantage over repeated trials.'
                    : 'A tough break! Even with 2/3 odds, 1 in 3 trials lose. Over time, switching wins twice as often.')}
              </div>
            </div>

            {gameState === 'finished' && (
              <button type="button" className={styles.resetBtn} onClick={resetRound}>
                <Icon name="refresh" size={14} />
                <span>Play Again</span>
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
              if (isRevealed) statusLabel = 'Goat (Revealed)';
              if (isWinner) statusLabel = '★ Sports Car ★';

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
                  <span className={styles.doorBtnLabel}>{isRevealed ? '🐐' : isWinner ? '🏎️' : '🚪'}</span>
                  <span className={styles.doorBtnStatus}>{statusLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Switch vs Stay Action Prompt */}
          {gameState === 'switch_or_stay' && (
            <div className={styles.actionChoiceBox}>
              <div className={styles.actionChoiceHeader}>
                <span className={styles.actionChoiceTitle}>
                  The Million-Dollar Question: Switch or Stay?
                </span>
                <span className={styles.taglineBadge}>Switching Yields +100% Expected Gain</span>
              </div>
              <div className={styles.actionButtonsRow}>
                <button
                  type="button"
                  className={styles.switchActionBtn}
                  onClick={() => handleMakeFinalChoice(true)}
                >
                  <Icon name="shuffle" size={16} />
                  <span>Switch to Other Door (66.7% Win Chance)</span>
                </button>
                <button
                  type="button"
                  className={styles.stayActionBtn}
                  onClick={() => handleMakeFinalChoice(false)}
                >
                  <Icon name="anchor" size={16} />
                  <span>Stay with Door 0{playerPick + 1} (33.3% Win Chance)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Scoreboard & Fast Empirical Batch Test */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
          <div className={styles.statLabel}>Switch Win Rate</div>
          <div className={`${styles.statValue} ${styles.statValueGreen}`}>{switchRate}%</div>
          <div className={styles.statSub}>
            {sessionStats.switchWins} wins / {sessionStats.switchTotal} trials (Target: 66.7%)
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Stay Win Rate</div>
          <div className={styles.statValue}>{stayRate}%</div>
          <div className={styles.statSub}>
            {sessionStats.stayWins} wins / {sessionStats.stayTotal} trials (Target: 33.3%)
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Empirical Verification</div>
          <button
            type="button"
            className={styles.batchBtn}
            disabled={isSimulatingBatch}
            style={{ width: '100%', marginTop: '0.25rem', padding: '0.65rem' }}
            onClick={() => runQuickSimulation(1000)}
          >
            <Icon name="zap" size={14} />
            <span>{isSimulatingBatch ? 'Simulating...' : 'Run 1,000 Quick Trials'}</span>
          </button>
          <div className={styles.statSub}>
            {batchFeedback || 'Simulate 1,000 rounds to verify convergence'}
          </div>
        </div>
      </div>

      {/* Practical Context Section: Real-World Applications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
        <div className={styles.domainLabel}>Practical Context: Why This Principle Dictates Real-World Decisions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {PRACTICAL_APPLICATIONS.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'var(--color-card-bg, #12131a)',
                border: '1px solid var(--color-border-default, #21232c)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--color-text-primary, #f9fafb)' }}>
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span>{item.title}</span>
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-brand-light, #e5a93c)', fontFamily: 'var(--font-mono, monospace)' }}>
                {item.category}
              </span>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary, #9ca3af)', lineHeight: '1.45', margin: 0 }}>
                {item.description}
              </p>
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--color-border-default, #21232c)',
                  fontSize: '0.75rem',
                  color: 'var(--color-brand-light, #e5a93c)',
                  fontWeight: 600,
                }}
              >
                ★ {item.takeaway}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The 100-Door Extreme Intuition Clarifier */}
      <div style={{ marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setShow100Doors(!show100Doors)}
          style={{
            background: 'rgba(18, 19, 26, 0.75)',
            border: '1px solid var(--color-border-default, #21232c)',
            borderRadius: 'var(--radius-md, 8px)',
            color: 'var(--color-text-secondary, #9ca3af)',
            padding: '0.75rem 1rem',
            width: '100%',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <span>💡 Still feels counter-intuitive? Expand the 100-Door Shortcut</span>
          <span>{show100Doors ? '▲ Close' : '▼ Expand'}</span>
        </button>

        {show100Doors && (
          <div className={styles.grid100Card} style={{ marginTop: '0.75rem' }}>
            <p className={styles.statusTextSub}>
              Imagine <strong>100 doors</strong>. You make a blind guess on Door #1 (<strong>1% odds</strong>).
              Monty sweeps down the stage and opens <strong>98 goat doors</strong>, leaving only Door #1 and Door #77.
              Do you stay with your 1% guess, or switch to the door that survived a 98-door purge?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={styles.batchBtn}
                onClick={() => handle100DoorClick(Math.floor(Math.random() * 100))}
              >
                Pick a Random Door
              </button>
              {grid100Pick !== null && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-brand-light, #e5a93c)', display: 'flex', alignItems: 'center' }}>
                  You picked Door #{grid100Pick + 1} (1% chance). Monty purged 98 duds, leaving Door #{grid100Survivor + 1} (99% chance)!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
