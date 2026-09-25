'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './TrolleyProblem3DLab.module.css';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

/**
 * Scenario Presets & Consequence Arithmetic Specifications
 */
const SCENARIOS = {
  switch: {
    id: 'switch',
    title: 'The Classic Switch',
    year: '1967',
    philosopher: 'Philippa Foot',
    tagline: 'Standard Switch Turnout',
    desc: 'Runaway locomotive heads toward 5 trapped railworkers. Pulling the switch diverts it onto a spur track with 1 worker.',
    straightVictims: 5,
    divertVictims: 1,
    defaultActionText: 'Pull Lever to Divert',
    defaultInactionText: 'Keep Main Line (Do Not Pull)',
    mechanismText: 'Diverting routes the train away from 5 workers. The solitary worker is struck as a foreseen consequence of redirecting kinetic harm, preserving 4 net lives.',
    actionParity: 'Active Intervention (+4 Net Lives)',
    utilitarianScore: 4,
    dlPfcActivity: 88,
    limbicActivity: 22,
    hasFootbridge: false,
    hasLoop: false,
    isAutonomousVehicle: false,
  },
  footbridge: {
    id: 'footbridge',
    title: 'The Footbridge Dilemma',
    year: '1976',
    philosopher: 'Judith Jarvis Thomson',
    tagline: 'Direct Physical Intervention',
    desc: 'No side track exists. Standing on a footbridge over the rails beside a heavy bystander, pushing him halts the train before striking 5 workers.',
    straightVictims: 5,
    divertVictims: 1,
    defaultActionText: 'Push Heavy Bystander',
    defaultInactionText: 'Refrain From Pushing',
    mechanismText: 'Pushing the bystander converts a conscious human body into an instrumental mechanical brake. The arithmetic yields +4 net lives preserved, yet tactile physical contact activates intense emotional inhibition.',
    actionParity: 'Physical Sacrifice (+4 Net Lives)',
    utilitarianScore: 4,
    dlPfcActivity: 54,
    limbicActivity: 94,
    hasFootbridge: true,
    hasLoop: false,
    isAutonomousVehicle: false,
  },
  loop: {
    id: 'loop',
    title: 'The Loop Dilemma',
    year: '1976',
    philosopher: 'Judith Jarvis Thomson',
    tagline: 'Instrumental Collateral Loop',
    desc: 'The side track loops back into the main line behind the 5 workers. The train will only stop if it collides with the heavy worker on the loop.',
    straightVictims: 5,
    divertVictims: 1,
    defaultActionText: 'Divert onto Loop',
    defaultInactionText: 'Stay on Straight Track',
    mechanismText: 'Unlike the classic switch, the single worker is not collateral: his physical bulk serves as the necessary impact barrier that prevents the locomotive from looping back to strike the 5.',
    actionParity: 'Instrumental Collision (+4 Net Lives)',
    utilitarianScore: 4,
    dlPfcActivity: 80,
    limbicActivity: 66,
    hasFootbridge: false,
    hasLoop: true,
    isAutonomousVehicle: false,
  },
  autonomous: {
    id: 'autonomous',
    title: 'Autonomous Vehicle AI',
    year: '2018',
    philosopher: 'MIT Moral Machine',
    tagline: 'Algorithmic Collision Matrix',
    desc: 'Self-driving vehicle suffers catastrophic brake failure at 60 mph. Continue into 5 crosswalk pedestrians, or swerve into a concrete barrier killing the passenger.',
    straightVictims: 5,
    divertVictims: 1,
    defaultActionText: 'Swerve into Barrier',
    defaultInactionText: 'Maintain Lane (Straight)',
    mechanismText: 'Machine ethics compiled into software policy: sparing 5 pedestrians at the cost of the vehicle occupant, evaluating quantitative welfare optimization against consumer duty.',
    actionParity: 'Algorithmic Optimization (+4 Net Lives)',
    utilitarianScore: 4,
    dlPfcActivity: 96,
    limbicActivity: 14,
    hasFootbridge: false,
    hasLoop: false,
    isAutonomousVehicle: true,
  },
};

export default function TrolleyProblem3DLab() {
  const mountRef = useRef(null);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('switch');
  const [isSwitchPulled, setIsSwitchPulled] = useState(false);
  const [simState, setSimState] = useState('IDLE'); // 'IDLE', 'RUNNING', 'RESOLVED'
  const [cameraView, setCameraView] = useState('overview'); // 'overview', 'chase', 'lever'
  const [decisionHistory, setDecisionHistory] = useState([]);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  const scenario = SCENARIOS[selectedScenarioKey];

  // Refs for 3D objects and physics
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const trolleyGroupRef = useRef(null);
  const switchBladeRef = useRef(null);
  const switchPointLRef = useRef(null);
  const switchPointRRef = useRef(null);
  const throwRodRef = useRef(null);
  const tieBarRef = useRef(null);
  const leverRodRef = useRef(null);
  const switchMastRef = useRef(null);
  const signalLampRef = useRef(null);
  const victimsGroupRef = useRef(null);
  const footbridgeMeshRef = useRef(null);
  const bystanderGroupRef = useRef(null);
  const sparksParticlesRef = useRef(null);
  const steamParticlesRef = useRef(null);
  const loopGroupRef = useRef(null);
  const bufferStopRef = useRef(null);
  const turnoutSplineRef = useRef(null);

  // Victim physics records array
  const victimRecordsRef = useRef([]);

  const animStateRef = useRef({
    trolleyProgress: 0,
    isSwitchPulled: false,
    scenarioKey: 'switch',
    simState: 'IDLE',
    speed: 1,
    cameraView: 'overview',
    cameraAngle: { theta: 0.35, phi: 0.88, radius: 48 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    shakeIntensity: 0,
    trainVelocity: 0,
    bystanderFallen: false,
    bystanderPosY: 5.8,
    bystanderVelY: 0,
    bystanderPosZ: 14,
  });

  // Synchronize state with animation ref
  useEffect(() => {
    animStateRef.current.isSwitchPulled = isSwitchPulled;
    // In footbridge scenario, pulling the switch initiates bystander fall
    if (selectedScenarioKey === 'footbridge' && isSwitchPulled) {
      animStateRef.current.bystanderFallen = true;
    }
  }, [isSwitchPulled, selectedScenarioKey]);

  useEffect(() => {
    animStateRef.current.scenarioKey = selectedScenarioKey;
  }, [selectedScenarioKey]);

  useEffect(() => {
    animStateRef.current.simState = simState;
  }, [simState]);

  useEffect(() => {
    animStateRef.current.speed = simulationSpeed;
  }, [simulationSpeed]);

  useEffect(() => {
    animStateRef.current.cameraView = cameraView;
  }, [cameraView]);

  /**
   * Three.js Scene Setup & Kinetic Physics Render Loop
   */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Rich Atmospheric Horizon
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#101420');
    scene.fog = new THREE.FogExp2('#121724', 0.0055);
    sceneRef.current = scene;

    // 2. Camera Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 350);
    camera.position.set(0, 36, 50);
    cameraRef.current = camera;

    // 3. WebGL Renderer with ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Dramatic Daylight & Fill Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#D4E5FF', '#3E362A', 1.8);
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight('#4F5E7A', 1.1);
    scene.add(ambientLight);

    // Warm Sun with Crisp Shadows
    const mainSun = new THREE.DirectionalLight('#FFF9EE', 4.5);
    mainSun.position.set(35, 55, 25);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 2048;
    mainSun.shadow.mapSize.height = 2048;
    mainSun.shadow.camera.near = 0.5;
    mainSun.shadow.camera.far = 160;
    mainSun.shadow.camera.left = -45;
    mainSun.shadow.camera.right = 45;
    mainSun.shadow.camera.top = 45;
    mainSun.shadow.camera.bottom = -45;
    mainSun.shadow.bias = -0.0006;
    scene.add(mainSun);

    // Cool Sky Fill
    const skyFill = new THREE.DirectionalLight('#60A5FA', 1.6);
    skyFill.position.set(-28, 28, -20);
    scene.add(skyFill);

    // Warm Golden Rim Light
    const warmRim = new THREE.DirectionalLight('#F59E0B', 1.4);
    warmRim.position.set(-16, 15, 32);
    scene.add(warmRim);

    // Signal Point Light at Switch Station
    const switchStationLight = new THREE.PointLight('#FBBF24', 2.2, 28);
    switchStationLight.position.set(-3.2, 3.5, 0);
    scene.add(switchStationLight);

    // 5. Expansive Ground Terrain
    const groundGeo = new THREE.PlaneGeometry(240, 240, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#151822',
      roughness: 0.92,
      metalness: 0.08,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Perimeter Horizon Hills (atmospheric depth)
    const hillGroup = new THREE.Group();
    const hillMat = new THREE.MeshStandardMaterial({ color: '#10141E', roughness: 0.95 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 95 + (i % 3) * 12;
      const hillGeo = new THREE.ConeGeometry(22 + (i % 2) * 10, 16 + (i % 3) * 8, 7);
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.position.set(Math.cos(angle) * dist, 6, Math.sin(angle) * dist);
      hillGroup.add(hill);
    }
    scene.add(hillGroup);

    // 5b. Rich Natural Environment (Pine Trees, Leafy Woodland, Telegraph Poles, Boulders)
    const envGroup = new THREE.Group();
    scene.add(envGroup);

    // Natural Materials Palette
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#3A281E', roughness: 0.92 });
    const pineMats = [
      new THREE.MeshStandardMaterial({ color: '#1B4029', roughness: 0.82 }),
      new THREE.MeshStandardMaterial({ color: '#245235', roughness: 0.82 }),
      new THREE.MeshStandardMaterial({ color: '#2E6342', roughness: 0.82 }),
    ];
    const deciduousMats = [
      new THREE.MeshStandardMaterial({ color: '#2C5A38', roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: '#3E6F45', roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: '#B45309', roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: '#C28828', roughness: 0.85 }),
    ];
    const boulderMat = new THREE.MeshStandardMaterial({ color: '#29303D', roughness: 0.92, flatShading: true });
    const poleMat = new THREE.MeshStandardMaterial({ color: '#3A2E24', roughness: 0.85, metalness: 0.1 });
    const insulatorMat = new THREE.MeshStandardMaterial({ color: '#F3F4F6', roughness: 0.2, metalness: 0.5 });
    const wireMat = new THREE.LineBasicMaterial({ color: '#1C222E', linewidth: 1 });

    // Helper: Stylized Conifer Pine Tree
    const addPineTree = (x, z, s = 1.0) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      const trunkGeo = new THREE.CylinderGeometry(0.22 * s, 0.35 * s, 2.2 * s, 7);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.1 * s;
      trunk.castShadow = true;
      tree.add(trunk);

      // 3 Tiers of pine foliage
      const t1 = new THREE.Mesh(new THREE.ConeGeometry(1.8 * s, 2.4 * s, 7), pineMats[0]);
      t1.position.y = 2.3 * s;
      t1.castShadow = true;

      const t2 = new THREE.Mesh(new THREE.ConeGeometry(1.35 * s, 2.1 * s, 7), pineMats[1]);
      t2.position.y = 3.5 * s;
      t2.castShadow = true;

      const t3 = new THREE.Mesh(new THREE.ConeGeometry(0.9 * s, 1.8 * s, 7), pineMats[2]);
      t3.position.y = 4.7 * s;
      t3.castShadow = true;

      tree.add(t1, t2, t3);
      envGroup.add(tree);
      return tree;
    };

    // Helper: Broadleaf / Autumn Deciduous Tree
    const addDeciduousTree = (x, z, s = 1.0, matIdx = 0) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      const trunkGeo = new THREE.CylinderGeometry(0.28 * s, 0.42 * s, 2.6 * s, 7);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.3 * s;
      trunk.castShadow = true;
      tree.add(trunk);

      const leafMat = deciduousMats[matIdx % deciduousMats.length];
      const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6 * s, 1), leafMat);
      c1.position.set(0, 3.2 * s, 0);
      c1.castShadow = true;

      const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2 * s, 1), leafMat);
      c2.position.set(0.55 * s, 4.0 * s, -0.35 * s);
      c2.castShadow = true;

      const c3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1 * s, 1), leafMat);
      c3.position.set(-0.45 * s, 3.8 * s, 0.45 * s);
      c3.castShadow = true;

      tree.add(c1, c2, c3);
      envGroup.add(tree);
      return tree;
    };

    // Helper: Low-poly Ground Boulder
    const addBoulder = (x, z, s = 1.0) => {
      const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), boulderMat);
      mesh.position.set(x, s * 0.55, z);
      mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      envGroup.add(mesh);
    };

    // Populate Natural Groves:
    // Left Woodland (behind switch lever)
    addPineTree(-14, 22, 1.2);
    addDeciduousTree(-18, 16, 1.1, 0);
    addPineTree(-12, 6, 0.95);
    addDeciduousTree(-16, -4, 1.3, 2);
    addPineTree(-20, -14, 1.15);
    addPineTree(-14, -22, 1.0);
    addDeciduousTree(-19, -32, 1.2, 3);
    addPineTree(-15, -42, 1.25);
    addPineTree(-22, -50, 1.4);
    addDeciduousTree(-26, -26, 1.0, 1);
    addPineTree(-24, 8, 1.3);
    addDeciduousTree(-28, 28, 1.4, 3);

    // Right Woodland (beyond the spur line)
    addPineTree(24, 20, 1.1);
    addDeciduousTree(22, 10, 1.2, 1);
    addPineTree(26, -2, 1.0);
    addDeciduousTree(29, -12, 1.3, 3);
    addPineTree(32, -22, 1.15);
    addPineTree(30, -34, 1.25);
    addDeciduousTree(35, -44, 1.1, 2);
    addPineTree(28, -52, 1.35);
    addPineTree(22, -60, 1.4);
    addDeciduousTree(38, -28, 1.0, 0);

    // Distant Backdrop Forest (North behind workers)
    addPineTree(-6, -65, 1.5);
    addDeciduousTree(2, -68, 1.4, 2);
    addPineTree(12, -66, 1.6);
    addPineTree(-18, -64, 1.3);
    addDeciduousTree(20, -62, 1.2, 3);
    addPineTree(-28, -58, 1.4);

    // Ground Boulders along right-of-way
    addBoulder(-7, 14, 1.1);
    addBoulder(-8, -6, 1.3);
    addBoulder(-6, -28, 1.2);
    addBoulder(8, 8, 0.9);
    addBoulder(20, -6, 1.5);
    addBoulder(22, -28, 1.4);
    addBoulder(14, -48, 1.6);
    addBoulder(-10, -48, 1.3);

    // Telegraph Utility Poles & Wire Cables along Left Rail (X: -5.4)
    const poleZList = [24, 12, 4, -8, -22, -36];
    const wirePts = [];

    poleZList.forEach((pz) => {
      const pole = new THREE.Group();
      pole.position.set(-5.4, 0, pz);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.8, 8), poleMat);
      shaft.position.y = 2.9;
      shaft.castShadow = true;
      pole.add(shaft);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.12), poleMat);
      arm.position.y = 5.2;
      arm.castShadow = true;
      pole.add(arm);

      const insL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 8), insulatorMat);
      insL.position.set(-0.7, 5.32, 0);
      const insR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 8), insulatorMat);
      insR.position.set(0.7, 5.32, 0);
      pole.add(insL, insR);

      envGroup.add(pole);
      wirePts.push(new THREE.Vector3(-5.4 - 0.7, 5.34, pz));
    });

    if (wirePts.length > 1) {
      const wireCurve = new THREE.CatmullRomCurve3(wirePts);
      const wireGeo = new THREE.BufferGeometry().setFromPoints(wireCurve.getPoints(60));
      const wireLine = new THREE.Line(wireGeo, wireMat);
      envGroup.add(wireLine);
    }

    // Subtle Railroad Grid on Base Ballast
    const gridHelper = new THREE.GridHelper(160, 40, '#283042', '#1A202E');
    gridHelper.position.y = 0.03;
    scene.add(gridHelper);

    // 6. Realistic Railroad Tracks System (Ballast Bed + Wooden Ties + Steel I-Rails)
    const tracksGroup = new THREE.Group();
    scene.add(tracksGroup);

    const railHeadMat = new THREE.MeshStandardMaterial({
      color: '#A2A9B9',
      metalness: 0.94,
      roughness: 0.22,
    });
    const sleeperMat = new THREE.MeshStandardMaterial({
      color: '#241D17',
      roughness: 0.88,
      metalness: 0.05,
    });
    const tiePlateMat = new THREE.MeshStandardMaterial({
      color: '#1A1E26',
      metalness: 0.9,
      roughness: 0.4,
    });
    const ballastMat = new THREE.MeshStandardMaterial({
      color: '#222633',
      roughness: 0.96,
      metalness: 0.06,
    });

    /**
     * Builds a realistic railroad track segment with raised crushed-stone ballast bed,
     * wooden ties with steel plates, and polished steel rails.
     */
    const buildTrackSection = (startX, startZ, length, angle = 0) => {
      const segGroup = new THREE.Group();
      segGroup.position.set(startX, 0, startZ);
      segGroup.rotation.y = angle;

      // 1. Raised Ballast Gravel Embankment
      const ballastGeo = new THREE.BoxGeometry(4.4, 0.32, length);
      const ballast = new THREE.Mesh(ballastGeo, ballastMat);
      ballast.position.set(0, 0.16, 0);
      ballast.receiveShadow = true;
      segGroup.add(ballast);

      // 2. Wooden Sleepers & Steel Tie Plates
      const sleeperGeo = new THREE.BoxGeometry(3.3, 0.22, 0.52);
      const tiePlateGeo = new THREE.BoxGeometry(0.36, 0.04, 0.42);
      const sleeperSpacing = 1.15;
      const count = Math.floor(length / sleeperSpacing);

      for (let i = 0; i <= count; i++) {
        const tieZ = -length / 2 + i * sleeperSpacing;
        const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
        sleeper.position.set(0, 0.43, tieZ);
        sleeper.receiveShadow = true;
        sleeper.castShadow = true;
        segGroup.add(sleeper);

        // Left & Right steel tie plates under rails
        const plateL = new THREE.Mesh(tiePlateGeo, tiePlateMat);
        plateL.position.set(-1.1, 0.55, tieZ);
        const plateR = new THREE.Mesh(tiePlateGeo, tiePlateMat);
        plateR.position.set(1.1, 0.55, tieZ);
        segGroup.add(plateL, plateR);
      }

      // 3. Steel Rails with I-Profile (Rail Head + Base/Web)
      const railHeadGeo = new THREE.BoxGeometry(0.14, 0.12, length);
      const railWebGeo = new THREE.BoxGeometry(0.06, 0.24, length);

      // Left Rail
      const headL = new THREE.Mesh(railHeadGeo, railHeadMat);
      headL.position.set(-1.1, 0.72, 0);
      headL.castShadow = true;
      const webL = new THREE.Mesh(railWebGeo, railHeadMat);
      webL.position.set(-1.1, 0.58, 0);
      segGroup.add(headL, webL);

      // Right Rail
      const headR = new THREE.Mesh(railHeadGeo, railHeadMat);
      headR.position.set(1.1, 0.72, 0);
      headR.castShadow = true;
      const webR = new THREE.Mesh(railWebGeo, railHeadMat);
      webR.position.set(1.1, 0.58, 0);
      segGroup.add(headR, webR);

      tracksGroup.add(segGroup);
      return segGroup;
    };

    // Approach main track (Z: 28 down to junction at Z: 0)
    buildTrackSection(0, 14, 28);

    // 6. Smooth Engineered Turnout Geometry (Transition Spiral / Easement Curve)
    const turnoutControlPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.20, 0, -4.0),
      new THREE.Vector3(0.92, 0, -10.0),  // Frog crossing zone
      new THREE.Vector3(2.35, 0, -16.5), // Clearance point past straight line
      new THREE.Vector3(5.1, 0, -24.0),
      new THREE.Vector3(8.8, 0, -31.0),  // Siding body passing solitary worker
      new THREE.Vector3(13.2, 0, -38.0),
      new THREE.Vector3(17.2, 0, -44.0), // Terminal siding buffer / loop connection
    ];
    const turnoutSpline = new THREE.CatmullRomCurve3(turnoutControlPoints, false, 'catmullrom', 0.5);
    turnoutSplineRef.current = turnoutSpline;

    // 6a. Turnout Zone Shared Ballast Bed (Z: 0 to Z: -14)
    const turnoutBallastA = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.32, 4.8), ballastMat);
    turnoutBallastA.position.set(0.12, 0.16, -2.4);
    turnoutBallastA.receiveShadow = true;
    const turnoutBallastB = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.32, 5.0), ballastMat);
    turnoutBallastB.position.set(0.55, 0.16, -7.2);
    turnoutBallastB.receiveShadow = true;
    const turnoutBallastC = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.32, 4.8), ballastMat);
    turnoutBallastC.position.set(1.2, 0.16, -12.0);
    turnoutBallastC.receiveShadow = true;
    tracksGroup.add(turnoutBallastA, turnoutBallastB, turnoutBallastC);

    // 6b. Turnout Zone Timber Ties (Z: 0 to -14)
    const tiePlateGeo = new THREE.BoxGeometry(0.36, 0.04, 0.42);
    const slidePlateGeo = new THREE.BoxGeometry(2.4, 0.035, 0.38);
    const slidePlateMat = new THREE.MeshStandardMaterial({ color: '#4B5563', metalness: 0.95, roughness: 0.25 });

    const turnoutZSteps = [
      0, -1.15, -2.30, -3.45, -4.60, -5.75, -6.90, -8.05, -9.20, -10.35, -11.50, -12.65, -13.80,
    ];

    turnoutZSteps.forEach((zVal) => {
      const isHeadblock = Math.abs(zVal - -1.15) < 0.2 || Math.abs(zVal - -2.30) < 0.2;
      const progress = Math.min(Math.abs(zVal) / 44, 1);
      const xTurnout = turnoutSpline.getPoint(progress).x;

      let tieWidth;
      let tieCenterX;

      if (isHeadblock) {
        // Extra long headblock ties extending to X: -3.8 to support switch stand
        tieWidth = 5.8 + xTurnout;
        tieCenterX = -1.2 + xTurnout / 2;
      } else {
        tieWidth = 3.4 + xTurnout;
        tieCenterX = xTurnout / 2;
      }

      const tieGeo = new THREE.BoxGeometry(tieWidth, 0.22, 0.52);
      const tieMesh = new THREE.Mesh(tieGeo, sleeperMat);
      tieMesh.position.set(tieCenterX, 0.43, zVal);
      tieMesh.receiveShadow = true;
      tieMesh.castShadow = true;
      tracksGroup.add(tieMesh);

      // Steel tie plates under straight track
      const plateMainL = new THREE.Mesh(tiePlateGeo, tiePlateMat);
      plateMainL.position.set(-1.1, 0.55, zVal);
      const plateMainR = new THREE.Mesh(tiePlateGeo, tiePlateMat);
      plateMainR.position.set(1.1, 0.55, zVal);
      tracksGroup.add(plateMainL, plateMainR);

      // Steel tie plates under turnout track if separated
      if (xTurnout > 0.4) {
        const plateSpurL = new THREE.Mesh(tiePlateGeo, tiePlateMat);
        plateSpurL.position.set(xTurnout - 1.1, 0.55, zVal);
        const plateSpurR = new THREE.Mesh(tiePlateGeo, tiePlateMat);
        plateSpurR.position.set(xTurnout + 1.1, 0.55, zVal);
        tracksGroup.add(plateSpurL, plateSpurR);
      }

      // Polished steel slide plates (switch chairs) between Z: -1.0 and Z: -7.5
      if (zVal >= -7.2 && zVal <= -1.0) {
        const slideChair = new THREE.Mesh(slidePlateGeo, slidePlateMat);
        slideChair.position.set(0, 0.55, zVal);
        tracksGroup.add(slideChair);
      }
    });

    // 6c. Straight Track Continuation Beyond Turnout Zone (Z: -14 to -44)
    buildTrackSection(0, -29, 30);

    // Straight rails through turnout zone (Z: 0 to -14)
    const straightZoneHeadL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 14), railHeadMat);
    straightZoneHeadL.position.set(-1.1, 0.72, -7);
    straightZoneHeadL.castShadow = true;
    const straightZoneWebL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 14), railHeadMat);
    straightZoneWebL.position.set(-1.1, 0.58, -7);
    const straightZoneHeadR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 14), railHeadMat);
    straightZoneHeadR.position.set(1.1, 0.72, -7);
    straightZoneHeadR.castShadow = true;
    const straightZoneWebR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 14), railHeadMat);
    straightZoneWebR.position.set(1.1, 0.58, -7);
    tracksGroup.add(straightZoneHeadL, straightZoneWebL, straightZoneHeadR, straightZoneWebR);

    // 6d. Turnout Curved Siding Beyond Frog (Z: -14 to -44)
    const sidingSampleCount = 28;
    const sidingSleeperGeo = new THREE.BoxGeometry(3.3, 0.22, 0.52);
    const sidingBallastGeo = new THREE.BoxGeometry(4.4, 0.32, 1.35);

    for (let i = 0; i <= sidingSampleCount; i++) {
      const t = 0.32 + (i / sidingSampleCount) * 0.68;
      const pt = turnoutSpline.getPoint(t);
      const tangent = turnoutSpline.getTangent(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const yawAngle = Math.atan2(tangent.x, tangent.z);

      // Curved ballast segment
      const curvedBallast = new THREE.Mesh(sidingBallastGeo, ballastMat);
      curvedBallast.position.set(pt.x, 0.16, pt.z);
      curvedBallast.rotation.y = yawAngle;
      curvedBallast.receiveShadow = true;
      tracksGroup.add(curvedBallast);

      // Angled Sleeper
      const curvedSleeper = new THREE.Mesh(sidingSleeperGeo, sleeperMat);
      curvedSleeper.position.set(pt.x, 0.43, pt.z);
      curvedSleeper.rotation.y = yawAngle;
      curvedSleeper.receiveShadow = true;
      curvedSleeper.castShadow = true;
      tracksGroup.add(curvedSleeper);

      // Tie plates
      const plateL = new THREE.Mesh(tiePlateGeo, tiePlateMat);
      plateL.position.set(pt.x + normal.x * 1.1, 0.55, pt.z + normal.z * 1.1);
      plateL.rotation.y = yawAngle;
      const plateR = new THREE.Mesh(tiePlateGeo, tiePlateMat);
      plateR.position.set(pt.x - normal.x * 1.1, 0.55, pt.z - normal.z * 1.1);
      plateR.rotation.y = yawAngle;
      tracksGroup.add(plateL, plateR);
    }

    // 6e. Dual Smooth Continuous Polished Steel Rails Along Turnout Curve
    const turnoutRailPointsL = [];
    const turnoutRailPointsR = [];
    const railSampleTotal = 75;

    for (let i = 0; i <= railSampleTotal; i++) {
      const t = i / railSampleTotal;
      const pt = turnoutSpline.getPoint(t);
      const tangent = turnoutSpline.getTangent(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      turnoutRailPointsL.push(new THREE.Vector3(pt.x + normal.x * 1.1, 0.72, pt.z + normal.z * 1.1));
      turnoutRailPointsR.push(new THREE.Vector3(pt.x - normal.x * 1.1, 0.72, pt.z - normal.z * 1.1));
    }

    const turnoutRailCurveL = new THREE.CatmullRomCurve3(turnoutRailPointsL, false, 'catmullrom', 0.5);
    const turnoutRailCurveR = new THREE.CatmullRomCurve3(turnoutRailPointsR, false, 'catmullrom', 0.5);
    const turnoutRailGeoL = new THREE.TubeGeometry(turnoutRailCurveL, 85, 0.08, 8, false);
    const turnoutRailGeoR = new THREE.TubeGeometry(turnoutRailCurveR, 85, 0.08, 8, false);
    const turnoutRailMeshL = new THREE.Mesh(turnoutRailGeoL, railHeadMat);
    const turnoutRailMeshR = new THREE.Mesh(turnoutRailGeoR, railHeadMat);
    turnoutRailMeshL.castShadow = true;
    turnoutRailMeshR.castShadow = true;
    tracksGroup.add(turnoutRailMeshL, turnoutRailMeshR);

    // 6f. Turnout Frog (V-crossing) & Flared Guard Check Rails (Z: -8 to -12)
    const frogPointGeo = new THREE.BoxGeometry(0.24, 0.16, 2.8);
    const frogPoint = new THREE.Mesh(frogPointGeo, railHeadMat);
    frogPoint.position.set(0.92, 0.72, -10.0);
    tracksGroup.add(frogPoint);

    // Guard Check Rail on straight outer rail
    const checkRailGeo = new THREE.BoxGeometry(0.08, 0.14, 4.2);
    const checkRailStraight = new THREE.Mesh(checkRailGeo, railHeadMat);
    checkRailStraight.position.set(-0.85, 0.72, -10.0);
    tracksGroup.add(checkRailStraight);

    // Guard Check Rail on turnout outer rail
    const checkRailTurnoutPt = turnoutSpline.getPoint(10.0 / 44);
    const checkRailTurnout = new THREE.Mesh(checkRailGeo, railHeadMat);
    checkRailTurnout.position.set(checkRailTurnoutPt.x + 0.85, 0.72, -10.0);
    checkRailTurnout.rotation.y = 0.12;
    tracksGroup.add(checkRailTurnout);

    // 6g. Refined Loop Track System (Displayed ONLY for 'loop' dilemma scenario)
    const loopGroup = new THREE.Group();
    loopGroup.name = 'LoopTracks';
    loopGroup.visible = false;
    tracksGroup.add(loopGroup);
    loopGroupRef.current = loopGroup;

    const loopTerminalPt = turnoutSpline.getPoint(1.0);
    const loopControlPoints = [
      loopTerminalPt,
      new THREE.Vector3(18.2, 0, -47.0),
      new THREE.Vector3(16.5, 0, -53.5),
      new THREE.Vector3(8.5, 0, -58.0),
      new THREE.Vector3(-1.5, 0, -56.0),
      new THREE.Vector3(-4.8, 0, -50.0),
      new THREE.Vector3(0, 0, -44.0),
    ];
    const loopSpline = new THREE.CatmullRomCurve3(loopControlPoints, false, 'catmullrom', 0.5);

    const loopSampleCount = 38;
    const loopSleepersGeo = new THREE.BoxGeometry(3.3, 0.22, 0.52);
    const loopTiePlateGeo = new THREE.BoxGeometry(0.36, 0.04, 0.42);
    const loopBallastGeo = new THREE.BoxGeometry(4.4, 0.32, 1.4);

    const railPointsL = [];
    const railPointsR = [];

    for (let i = 0; i <= loopSampleCount; i++) {
      const t = i / loopSampleCount;
      const pt = loopSpline.getPoint(t);
      const tangent = loopSpline.getTangent(t);

      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const yawAngle = Math.atan2(tangent.x, tangent.z);

      const curvedBallast = new THREE.Mesh(loopBallastGeo, ballastMat);
      curvedBallast.position.set(pt.x, 0.16, pt.z);
      curvedBallast.rotation.y = yawAngle;
      curvedBallast.receiveShadow = true;
      loopGroup.add(curvedBallast);

      const curvedSleeper = new THREE.Mesh(loopSleepersGeo, sleeperMat);
      curvedSleeper.position.set(pt.x, 0.43, pt.z);
      curvedSleeper.rotation.y = yawAngle;
      curvedSleeper.castShadow = true;
      curvedSleeper.receiveShadow = true;
      loopGroup.add(curvedSleeper);

      const plateL = new THREE.Mesh(loopTiePlateGeo, tiePlateMat);
      plateL.position.set(pt.x + normal.x * 1.1, 0.55, pt.z + normal.z * 1.1);
      plateL.rotation.y = yawAngle;
      const plateR = new THREE.Mesh(loopTiePlateGeo, tiePlateMat);
      plateR.position.set(pt.x - normal.x * 1.1, 0.55, pt.z - normal.z * 1.1);
      plateR.rotation.y = yawAngle;
      loopGroup.add(plateL, plateR);

      railPointsL.push(new THREE.Vector3(pt.x + normal.x * 1.1, 0.72, pt.z + normal.z * 1.1));
      railPointsR.push(new THREE.Vector3(pt.x - normal.x * 1.1, 0.72, pt.z - normal.z * 1.1));
    }

    const railCurveL = new THREE.CatmullRomCurve3(railPointsL, false, 'catmullrom', 0.5);
    const railCurveR = new THREE.CatmullRomCurve3(railPointsR, false, 'catmullrom', 0.5);
    const railGeoL = new THREE.TubeGeometry(railCurveL, 64, 0.08, 8, false);
    const railGeoR = new THREE.TubeGeometry(railCurveR, 64, 0.08, 8, false);
    const loopRailMeshL = new THREE.Mesh(railGeoL, railHeadMat);
    const loopRailMeshR = new THREE.Mesh(railGeoR, railHeadMat);
    loopRailMeshL.castShadow = true;
    loopRailMeshR.castShadow = true;
    loopGroup.add(loopRailMeshL, loopRailMeshR);

    // 6h. Standard Buffer Stop / Bumper (Displayed for non-loop normal railway lines)
    const bufferStopGroup = new THREE.Group();
    const bumperPos = turnoutSpline.getPoint(1.0);
    const bumperTangent = turnoutSpline.getTangent(1.0);
    const bumperAngle = Math.atan2(-bumperTangent.x, -bumperTangent.z);
    bufferStopGroup.position.set(bumperPos.x, 0, bumperPos.z);
    bufferStopGroup.rotation.y = bumperAngle;
    tracksGroup.add(bufferStopGroup);
    bufferStopRef.current = bufferStopGroup;

    // Buffer Beam (Dark iron with red hazard warning plate)
    const bumperBeamGeo = new THREE.BoxGeometry(3.0, 0.45, 0.4);
    const bumperBeamMat = new THREE.MeshStandardMaterial({ color: '#8B1E1E', metalness: 0.7, roughness: 0.4 });
    const bumperBeam = new THREE.Mesh(bumperBeamGeo, bumperBeamMat);
    bumperBeam.position.set(0, 1.2, 0);
    bumperBeam.castShadow = true;
    bufferStopGroup.add(bumperBeam);

    // Buffer Warning Circles
    const diskGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 16);
    const diskMat = new THREE.MeshStandardMaterial({ color: '#EF4444', emissive: '#7F1D1D', roughness: 0.3 });
    const diskL = new THREE.Mesh(diskGeo, diskMat);
    diskL.rotation.x = Math.PI / 2;
    diskL.position.set(-1.0, 1.2, 0.22);
    const diskR = new THREE.Mesh(diskGeo, diskMat);
    diskR.rotation.x = Math.PI / 2;
    diskR.position.set(1.0, 1.2, 0.22);
    bufferStopGroup.add(diskL, diskR);

    // Heavy steel support struts
    const strutGeo = new THREE.BoxGeometry(0.2, 1.4, 0.2);
    const strutMat = new THREE.MeshStandardMaterial({ color: '#1F2937', metalness: 0.9, roughness: 0.3 });
    const strutL = new THREE.Mesh(strutGeo, strutMat);
    strutL.position.set(-1.1, 0.7, -0.4);
    strutL.rotation.x = -0.35;
    const strutR = new THREE.Mesh(strutGeo, strutMat);
    strutR.position.set(1.1, 0.7, -0.4);
    strutR.rotation.x = -0.35;
    bufferStopGroup.add(strutL, strutR);

    // 7. Mechanical Ground-Throw Switch Stand, Weighted Lever & Rotating Signal Mast
    const junctionGroup = new THREE.Group();
    junctionGroup.position.set(0, 0, 0);
    scene.add(junctionGroup);

    // Cast-iron Switch Stand Base (Firmly mounted onto the extended headblock ties at X: -2.8, Z: -1.72)
    const standMat = new THREE.MeshStandardMaterial({ color: '#1A1E29', metalness: 0.88, roughness: 0.32 });
    const standBaseGeo = new THREE.BoxGeometry(1.2, 0.14, 1.4);
    const standBase = new THREE.Mesh(standBaseGeo, standMat);
    standBase.position.set(-2.8, 0.54, -1.72);
    standBase.castShadow = true;
    standBase.receiveShadow = true;
    junctionGroup.add(standBase);

    // 4 Corner Hex Bolt Fasteners
    const hexBoltGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.08, 6);
    const hexBoltMat = new THREE.MeshStandardMaterial({ color: '#64748B', metalness: 0.9, roughness: 0.2 });
    [[-0.45, -0.55], [-0.45, 0.55], [0.45, -0.55], [0.45, 0.55]].forEach(([bx, bz]) => {
      const bolt = new THREE.Mesh(hexBoltGeo, hexBoltMat);
      bolt.position.set(-2.8 + bx, 0.63, -1.72 + bz);
      junctionGroup.add(bolt);
    });

    // Cast Gearbox Housing Pedestal
    const pedestalGeo = new THREE.BoxGeometry(0.55, 0.38, 0.65);
    const pedestal = new THREE.Mesh(pedestalGeo, standMat);
    pedestal.position.set(-2.8, 0.74, -1.72);
    pedestal.castShadow = true;
    junctionGroup.add(pedestal);

    // Quadrant Notched Guide Arc (Sector plate guide where lever locks into detents)
    const quadrantGeo = new THREE.TorusGeometry(0.52, 0.035, 8, 20, Math.PI * 0.75);
    const quadrantMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.92, roughness: 0.25 });
    const quadrantMesh = new THREE.Mesh(quadrantGeo, quadrantMat);
    quadrantMesh.rotation.y = Math.PI / 2;
    quadrantMesh.rotation.z = -Math.PI * 0.375;
    quadrantMesh.position.set(-2.8, 0.82, -1.72);
    junctionGroup.add(quadrantMesh);

    // Ground-Throw Weighted Switch Lever Assembly (Pivots across quadrant arc)
    const leverPivotGroup = new THREE.Group();
    leverPivotGroup.position.set(-2.8, 0.82, -1.72);
    leverPivotGroup.rotation.z = -0.72; // Default straight position
    junctionGroup.add(leverPivotGroup);
    leverRodRef.current = leverPivotGroup;

    // Lever Shaft
    const leverArmGeo = new THREE.CylinderGeometry(0.04, 0.045, 1.75, 8);
    const leverArmMat = new THREE.MeshStandardMaterial({ color: '#2B3042', metalness: 0.92, roughness: 0.25 });
    const leverArm = new THREE.Mesh(leverArmGeo, leverArmMat);
    leverArm.position.set(0, 0.78, 0);
    leverArm.castShadow = true;
    leverPivotGroup.add(leverArm);

    // Heavy Cast Iron Counterweight Teardrop / Ball (Provides tactile authentic heft)
    const counterweightGeo = new THREE.SphereGeometry(0.18, 14, 14);
    const counterweightMat = new THREE.MeshStandardMaterial({ color: '#161922', metalness: 0.9, roughness: 0.3 });
    const counterweight = new THREE.Mesh(counterweightGeo, counterweightMat);
    counterweight.position.set(0, 1.15, 0);
    counterweight.castShadow = true;
    leverPivotGroup.add(counterweight);

    // Safety Amber Fluted Grip Handle with Polished Brass Collar
    const handleGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.45, 12);
    const handleMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.28, metalness: 0.65 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0, 1.62, 0);
    leverPivotGroup.add(handle);

    const handleCollarGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.06, 12);
    const handleCollarMat = new THREE.MeshStandardMaterial({ color: '#EAB308', metalness: 0.95, roughness: 0.15 });
    const collar = new THREE.Mesh(handleCollarGeo, handleCollarMat);
    collar.position.set(0, 1.4, 0);
    leverPivotGroup.add(collar);

    // Mechanical Horizontal Throw Rod (Bridle Linkage running across ballast from stand to switch points)
    const throwRodGroup = new THREE.Group();
    throwRodGroup.position.set(0, 0.52, -1.4);
    junctionGroup.add(throwRodGroup);
    throwRodRef.current = throwRodGroup;

    const rodGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.7, 8);
    const rodMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.92, roughness: 0.3 });
    const throwRodMesh = new THREE.Mesh(rodGeo, rodMat);
    throwRodMesh.rotation.z = Math.PI / 2;
    throwRodMesh.position.set(-1.45, 0, 0);
    throwRodMesh.castShadow = true;
    throwRodGroup.add(throwRodMesh);

    // Switch Tie-Bar connecting the movable point blades
    const tieBarMesh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 0.12), tiePlateMat);
    tieBarMesh.position.set(0, 0.04, 0);
    tieBarMesh.castShadow = true;
    throwRodGroup.add(tieBarMesh);
    tieBarRef.current = tieBarMesh;

    // Movable Tapered Switch Point Blades (Sliding on steel slide plates)
    const pointBladeGeo = new THREE.BoxGeometry(0.09, 0.24, 6.4);
    const switchBladeL = new THREE.Mesh(pointBladeGeo, railHeadMat);
    switchBladeL.position.set(-0.98, 0.65, -4.6);
    switchBladeL.castShadow = true;
    junctionGroup.add(switchBladeL);
    switchPointLRef.current = switchBladeL;
    switchBladeRef.current = switchBladeL;

    const switchBladeR = new THREE.Mesh(pointBladeGeo, railHeadMat);
    switchBladeR.position.set(0.98, 0.65, -4.6);
    switchBladeR.castShadow = true;
    junctionGroup.add(switchBladeR);
    switchPointRRef.current = switchBladeR;

    // Rotating Vertical Signal Mast & 4-Lens Railroad Switch Lantern
    const switchMastGroup = new THREE.Group();
    switchMastGroup.position.set(-2.8, 0.85, -1.72);
    junctionGroup.add(switchMastGroup);
    switchMastRef.current = switchMastGroup;

    // Vertical Spindle Mast
    const mastShaftGeo = new THREE.CylinderGeometry(0.038, 0.038, 1.85, 10);
    const mastShaftMat = new THREE.MeshStandardMaterial({ color: '#1E232E', metalness: 0.9, roughness: 0.3 });
    const mastShaft = new THREE.Mesh(mastShaftGeo, mastShaftMat);
    mastShaft.position.set(0, 0.92, 0);
    mastShaft.castShadow = true;
    switchMastGroup.add(mastShaft);

    // Railroad Day-Target Banners
    // 1. Red Circular Stop/Straight Disc facing approaching trains (Z direction)
    const dayTargetDiscGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.025, 18);
    const dayTargetDiscMat = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.35, metalness: 0.1 });
    const dayTargetDisc = new THREE.Mesh(dayTargetDiscGeo, dayTargetDiscMat);
    dayTargetDisc.rotation.x = Math.PI / 2;
    dayTargetDisc.position.set(0, 1.45, 0);
    dayTargetDisc.castShadow = true;
    switchMastGroup.add(dayTargetDisc);

    // 2. Green Turnout Arrow/Chevron Banner facing at 90 degrees (X direction)
    const arrowTargetGeo = new THREE.BoxGeometry(0.55, 0.28, 0.025);
    const arrowTargetMat = new THREE.MeshStandardMaterial({ color: '#10B981', roughness: 0.35, metalness: 0.1 });
    const arrowTarget = new THREE.Mesh(arrowTargetGeo, arrowTargetMat);
    arrowTarget.rotation.y = Math.PI / 2;
    arrowTarget.position.set(0, 1.45, 0);
    arrowTarget.castShadow = true;
    switchMastGroup.add(arrowTarget);

    // Authentic 4-Lens Cast Railroad Switch Lantern Housing
    const lanternBodyGeo = new THREE.BoxGeometry(0.44, 0.50, 0.44);
    const lanternBodyMat = new THREE.MeshStandardMaterial({ color: '#0F1219', metalness: 0.88, roughness: 0.35 });
    const lanternBody = new THREE.Mesh(lanternBodyGeo, lanternBodyMat);
    lanternBody.position.set(0, 2.05, 0);
    lanternBody.castShadow = true;
    switchMastGroup.add(lanternBody);

    // Lantern Conical Ventilation Chimney Cap
    const cowlGeo = new THREE.ConeGeometry(0.24, 0.22, 10);
    const cowl = new THREE.Mesh(cowlGeo, lanternBodyMat);
    cowl.position.set(0, 2.38, 0);
    switchMastGroup.add(cowl);

    // 4 Optical Glass Bullseye Lenses:
    const redLensMat = new THREE.MeshStandardMaterial({
      color: '#EF4444',
      emissive: '#EF4444',
      emissiveIntensity: 3.5,
      roughness: 0.2,
    });
    const greenLensMat = new THREE.MeshStandardMaterial({
      color: '#10B981',
      emissive: '#10B981',
      emissiveIntensity: 3.5,
      roughness: 0.2,
    });

    const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 14);

    // Front/Back Red Lenses
    const lensRedFront = new THREE.Mesh(lensGeo, redLensMat);
    lensRedFront.rotation.x = Math.PI / 2;
    lensRedFront.position.set(0, 2.05, 0.23);
    const lensRedBack = new THREE.Mesh(lensGeo, redLensMat);
    lensRedBack.rotation.x = Math.PI / 2;
    lensRedBack.position.set(0, 2.05, -0.23);
    switchMastGroup.add(lensRedFront, lensRedBack);

    // Left/Right Green Lenses (90 degrees)
    const lensGreenL = new THREE.Mesh(lensGeo, greenLensMat);
    lensGreenL.rotation.z = Math.PI / 2;
    lensGreenL.position.set(0.23, 2.05, 0);
    const lensGreenR = new THREE.Mesh(lensGeo, greenLensMat);
    lensGreenR.rotation.z = Math.PI / 2;
    lensGreenR.position.set(-0.23, 2.05, 0);
    switchMastGroup.add(lensGreenL, lensGreenR);

    // Internal Lamp PointLight projecting warm optical illumination
    const lanternGlow = new THREE.PointLight('#EF4444', 3.5, 10, 1.5);
    lanternGlow.position.set(0, 2.05, 0.25);
    switchMastGroup.add(lanternGlow);
    signalLampRef.current = lanternGlow;

    // 8. Overhead Footbridge (Thomson 1976 Dilemma)
    const footbridgeGroup = new THREE.Group();
    footbridgeGroup.position.set(0, 0, 10); // Spans over approach track
    scene.add(footbridgeGroup);
    footbridgeMeshRef.current = footbridgeGroup;

    const bridgeDeckGeo = new THREE.BoxGeometry(15, 0.65, 3.8);
    const bridgeDeckMat = new THREE.MeshStandardMaterial({ color: '#1E2230', metalness: 0.65, roughness: 0.45 });
    const bridgeDeck = new THREE.Mesh(bridgeDeckGeo, bridgeDeckMat);
    bridgeDeck.position.set(0, 5.5, 0);
    bridgeDeck.castShadow = true;
    bridgeDeck.receiveShadow = true;
    footbridgeGroup.add(bridgeDeck);

    const bridgeRailingGeo = new THREE.BoxGeometry(15, 1.1, 0.12);
    const railingMat = new THREE.MeshStandardMaterial({ color: '#C59332', metalness: 0.8, roughness: 0.25 });
    const railingFront = new THREE.Mesh(bridgeRailingGeo, railingMat);
    railingFront.position.set(0, 6.35, 1.8);
    const railingBack = new THREE.Mesh(bridgeRailingGeo, railingMat);
    railingBack.position.set(0, 6.35, -1.8);
    footbridgeGroup.add(railingFront, railingBack);

    // Support pillars
    const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, 5.5, 10);
    const pillarL = new THREE.Mesh(pillarGeo, bridgeDeckMat);
    pillarL.position.set(-6.5, 2.75, 0);
    const pillarR = new THREE.Mesh(pillarGeo, bridgeDeckMat);
    pillarR.position.set(6.5, 2.75, 0);
    footbridgeGroup.add(pillarL, pillarR);

    // Heavy Bystander Figurine standing on footbridge
    const bystanderGroup = new THREE.Group();
    bystanderGroup.position.set(0, 5.8, 10);
    scene.add(bystanderGroup);
    bystanderGroupRef.current = bystanderGroup;

    // Bulky bystander body + heavy backpack
    const torsoGeo = new THREE.CylinderGeometry(0.52, 0.48, 1.15, 10);
    const torsoMat = new THREE.MeshStandardMaterial({ color: '#2563EB', roughness: 0.55 });
    const bystanderTorso = new THREE.Mesh(torsoGeo, torsoMat);
    bystanderTorso.position.y = 0.58;
    bystanderTorso.castShadow = true;
    bystanderGroup.add(bystanderTorso);

    const headGeo = new THREE.SphereGeometry(0.28, 14, 14);
    const headMat = new THREE.MeshStandardMaterial({ color: '#FCD34D', roughness: 0.45 });
    const bystanderHead = new THREE.Mesh(headGeo, headMat);
    bystanderHead.position.y = 1.42;
    bystanderGroup.add(bystanderHead);

    const backpackGeo = new THREE.BoxGeometry(0.72, 0.85, 0.5);
    const backpackMat = new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.65 });
    const backpack = new THREE.Mesh(backpackGeo, backpackMat);
    backpack.position.set(0, 0.72, -0.42);
    backpack.castShadow = true;
    bystanderGroup.add(backpack);

    // 9. Figurine Creation & Kinetic Physics Array Setup
    const victimsGroup = new THREE.Group();
    scene.add(victimsGroup);
    victimsGroupRef.current = victimsGroup;
    victimRecordsRef.current = [];

    const createFigurine = (x, z, label, colorHex = '#EF4444', category = 'straight', index = 0) => {
      const fig = new THREE.Group();
      fig.position.set(x, 0.7, z);

      // Pants / Legs
      const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.95, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: '#1F2937', roughness: 0.8 });
      const legL = new THREE.Mesh(legGeo, legMat);
      legL.position.set(-0.2, 0.48, 0);
      const legR = new THREE.Mesh(legGeo, legMat);
      legR.position.set(0.2, 0.48, 0);
      legL.castShadow = true;
      legR.castShadow = true;
      fig.add(legL, legR);

      // Vest / Hi-vis jacket
      const vestGeo = new THREE.CylinderGeometry(0.32, 0.3, 1.0, 8);
      const vestMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35 });
      const vest = new THREE.Mesh(vestGeo, vestMat);
      vest.position.set(0, 1.35, 0);
      vest.castShadow = true;
      fig.add(vest);

      // Head & Hardhat
      const workerHead = new THREE.Mesh(headGeo, headMat);
      workerHead.position.set(0, 2.05, 0);
      const hardhatGeo = new THREE.SphereGeometry(0.32, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2);
      const hardhatMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.2, roughness: 0.25 });
      const hardhat = new THREE.Mesh(hardhatGeo, hardhatMat);
      hardhat.position.set(0, 2.15, 0);
      fig.add(workerHead, hardhat);

      victimsGroup.add(fig);

      // Register into physics engine records
      const record = {
        mesh: fig,
        id: label,
        category,
        index,
        origPos: new THREE.Vector3(x, 0.7, z),
        pos: new THREE.Vector3(x, 0.7, z),
        vel: new THREE.Vector3(0, 0, 0),
        rotVel: new THREE.Vector3(0, 0, 0),
        isHit: false,
        isGrounded: false,
      };
      victimRecordsRef.current.push(record);
      return fig;
    };

    // Populate 5 Workers on Straight Track (Z from -24 to -34)
    for (let i = 0; i < 5; i++) {
      createFigurine(
        i % 2 === 0 ? -0.35 : 0.35,
        -24 - i * 2.5,
        `StraightWorker_${i}`,
        '#EF4444',
        'straight',
        i
      );
    }

    // Populate 1 Solitary Worker on Diverging Spur Track (Centered on the smooth turnout curve)
    const spurWorkerPt = turnoutSpline.getPoint(0.64);
    createFigurine(spurWorkerPt.x, spurWorkerPt.z, 'SpurWorker', '#3B82F6', 'spur', 0);

    // 10. Load 3D Locomotive Train Engine (GLTF with Procedural Fallback)
    const trolleyGroup = new THREE.Group();
    scene.add(trolleyGroup);
    trolleyGroupRef.current = trolleyGroup;
    trolleyGroup.position.set(0, 0.7, 20); // Starts on approach track in full view

    const loader = new GLTFLoader();
    loader.load(
      '/models/trolley.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.2, 1.2, 1.2);
        model.position.set(0, 0.05, 0);
        model.rotation.y = 0; // In Blender model, +Y is forward, mapped to -Z in Three.js when rotation.y = 0! Face front down the track!
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        trolleyGroup.add(model);
      },
      undefined,
      () => {
        // Procedural Locomotive Fallback Mesh
        const locoFallback = new THREE.Group();

        // Boiler Cylinder (Obsidian Green)
        const boilerGeo = new THREE.CylinderGeometry(0.95, 0.95, 4.8, 16);
        const boilerMat = new THREE.MeshStandardMaterial({ color: '#1B3528', metalness: 0.7, roughness: 0.3 });
        const boiler = new THREE.Mesh(boilerGeo, boilerMat);
        boiler.rotation.x = Math.PI / 2;
        boiler.position.set(0, 1.8, -0.6);
        boiler.castShadow = true;
        locoFallback.add(boiler);

        // Driver Cab at rear
        const cabGeo = new THREE.BoxGeometry(2.4, 2.6, 2.4);
        const cabMat = new THREE.MeshStandardMaterial({ color: '#14251D', metalness: 0.6, roughness: 0.4 });
        const cab = new THREE.Mesh(cabGeo, cabMat);
        cab.position.set(0, 2.2, 2.2);
        cab.castShadow = true;
        locoFallback.add(cab);

        // Smokestack with Brass Rim
        const stackGeo = new THREE.CylinderGeometry(0.24, 0.28, 1.1, 12);
        const stackMat = new THREE.MeshStandardMaterial({ color: '#0F1A14', metalness: 0.8, roughness: 0.3 });
        const stack = new THREE.Mesh(stackGeo, stackMat);
        stack.position.set(0, 3.1, -2.4);
        stack.castShadow = true;
        locoFallback.add(stack);

        // Cowcatcher Front Wedge
        const wedgeGeo = new THREE.ConeGeometry(1.3, 1.4, 4);
        const wedgeMat = new THREE.MeshStandardMaterial({ color: '#D97706', metalness: 0.8, roughness: 0.3 });
        const wedge = new THREE.Mesh(wedgeGeo, wedgeMat);
        wedge.rotation.x = Math.PI / 2;
        wedge.rotation.y = Math.PI / 4;
        wedge.position.set(0, 0.8, -3.6);
        wedge.castShadow = true;
        locoFallback.add(wedge);

        trolleyGroup.add(locoFallback);
      }
    );

    // Locomotive Headlamp Lens & High-Power Spotlight Beam
    const lampLensGeo = new THREE.SphereGeometry(0.26, 14, 14);
    const lampLensMat = new THREE.MeshStandardMaterial({
      color: '#FEF08A',
      emissive: '#FEF08A',
      emissiveIntensity: 4.5,
    });
    const lampLens = new THREE.Mesh(lampLensGeo, lampLensMat);
    lampLens.position.set(0, 2.2, -4.0);
    trolleyGroup.add(lampLens);

    const headlight = new THREE.SpotLight('#FFFBEB', 5.5, 45, Math.PI / 5.5, 0.35, 1.2);
    headlight.position.set(0, 2.2, -4.0);
    headlight.target.position.set(0, 0.5, -35);
    headlight.castShadow = true;
    trolleyGroup.add(headlight);
    trolleyGroup.add(headlight.target);

    // 11. Sparks Particle System (Friction & Collision Embers)
    const sparksCount = 140;
    const sparksGeo = new THREE.BufferGeometry();
    const sparksPos = new Float32Array(sparksCount * 3);
    const sparksVel = new Float32Array(sparksCount * 3);
    const sparksLife = new Float32Array(sparksCount);

    for (let i = 0; i < sparksCount; i++) {
      sparksPos[i * 3] = 0;
      sparksPos[i * 3 + 1] = -100; // Inactive below ground
      sparksPos[i * 3 + 2] = 0;
      sparksLife[i] = 0;
    }
    sparksGeo.setAttribute('position', new THREE.BufferAttribute(sparksPos, 3));

    const sparksMat = new THREE.PointsMaterial({
      color: '#FFB800',
      size: 0.45,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const sparksPoints = new THREE.Points(sparksGeo, sparksMat);
    scene.add(sparksPoints);
    sparksParticlesRef.current = {
      points: sparksPoints,
      geo: sparksGeo,
      pos: sparksPos,
      vel: sparksVel,
      life: sparksLife,
      count: sparksCount,
      emit: (x, y, z, count = 25, speedMul = 1) => {
        let spawned = 0;
        for (let i = 0; i < sparksCount && spawned < count; i++) {
          if (sparksLife[i] <= 0) {
            sparksPos[i * 3] = x + (Math.random() - 0.5) * 0.8;
            sparksPos[i * 3 + 1] = y + Math.random() * 0.4;
            sparksPos[i * 3 + 2] = z + (Math.random() - 0.5) * 0.8;

            sparksVel[i * 3] = (Math.random() - 0.5) * 14 * speedMul;
            sparksVel[i * 3 + 1] = (4 + Math.random() * 9) * speedMul;
            sparksVel[i * 3 + 2] = (Math.random() - 0.5) * 14 * speedMul;

            sparksLife[i] = 0.4 + Math.random() * 0.4;
            spawned++;
          }
        }
        sparksGeo.attributes.position.needsUpdate = true;
      },
    };

    // 12. Steam Smokestack Particle System (Expanding White Puffs)
    const steamCount = 50;
    const steamGeo = new THREE.BufferGeometry();
    const steamPos = new Float32Array(steamCount * 3);
    const steamVel = new Float32Array(steamCount * 3);
    const steamLife = new Float32Array(steamCount);
    for (let i = 0; i < steamCount; i++) {
      steamPos[i * 3 + 1] = -100;
      steamLife[i] = 0;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
    const steamMat = new THREE.PointsMaterial({
      color: '#E2E8F0',
      size: 1.2,
      transparent: true,
      opacity: 0.35,
      blending: THREE.NormalBlending,
    });
    const steamPoints = new THREE.Points(steamGeo, steamMat);
    scene.add(steamPoints);
    steamParticlesRef.current = {
      points: steamPoints,
      geo: steamGeo,
      pos: steamPos,
      vel: steamVel,
      life: steamLife,
      count: steamCount,
      emitTimer: 0,
    };

    // 13. Pointer Drag & Pinch Navigation (Orbit and zoom around scene)
    const activePointers = new Map();
    let initialPinchDist = null;
    let initialPinchRadius = null;

    const onPointerDown = (e) => {
      if (e.target.closest('button, input, a')) return;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      container.setPointerCapture?.(e.pointerId);

      if (activePointers.size === 1) {
        animStateRef.current.isDragging = true;
        animStateRef.current.dragStart = { x: e.clientX, y: e.clientY };
      } else if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        initialPinchRadius = animStateRef.current.cameraAngle.radius;
        animStateRef.current.isDragging = false;
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
          animStateRef.current.cameraAngle.radius = THREE.MathUtils.clamp(
            initialPinchRadius * ratio,
            20,
            95
          );
        }
        return;
      }

      if (animStateRef.current.isDragging && activePointers.size === 1) {
        const dx = e.clientX - animStateRef.current.dragStart.x;
        const dy = e.clientY - animStateRef.current.dragStart.y;
        animStateRef.current.dragStart = { x: e.clientX, y: e.clientY };

        animStateRef.current.cameraAngle.theta -= dx * 0.007;
        animStateRef.current.cameraAngle.phi = THREE.MathUtils.clamp(
          animStateRef.current.cameraAngle.phi - dy * 0.007,
          0.2,
          Math.PI / 2 - 0.05
        );
      }
    };

    const onPointerUp = (e) => {
      activePointers.delete(e.pointerId);
      container.releasePointerCapture?.(e.pointerId);
      if (activePointers.size < 2) {
        initialPinchDist = null;
      }
      if (activePointers.size === 0) {
        animStateRef.current.isDragging = false;
      }
    };

    const onPointerCancel = (e) => {
      activePointers.delete(e.pointerId);
      if (activePointers.size === 0) {
        animStateRef.current.isDragging = false;
        initialPinchDist = null;
      }
    };

    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        e.preventDefault();
        animStateRef.current.cameraAngle.radius = THREE.MathUtils.clamp(
          animStateRef.current.cameraAngle.radius + Math.sign(e.deltaY) * 3.5,
          20,
          95
        );
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerCancel);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 14. High-Performance Kinetic Animation Loop (60 FPS)
    let animationFrameId;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const state = animStateRef.current;

      // Animate Switch Mechanism: Lever, Spindle Mast, Throw Rod Linkage & Point Blades
      const isDiverted = state.isSwitchPulled;
      const targetLeverAngle = isDiverted ? 0.72 : -0.72;
      const targetMastAngle = isDiverted ? Math.PI / 2 : 0;
      const targetSlide = isDiverted ? 0.28 : 0;

      if (leverRodRef.current) {
        leverRodRef.current.rotation.z = THREE.MathUtils.lerp(
          leverRodRef.current.rotation.z,
          targetLeverAngle,
          delta * 8
        );
      }

      if (switchMastRef.current) {
        switchMastRef.current.rotation.y = THREE.MathUtils.lerp(
          switchMastRef.current.rotation.y,
          targetMastAngle,
          delta * 8
        );
      }

      if (throwRodRef.current) {
        throwRodRef.current.position.x = THREE.MathUtils.lerp(
          throwRodRef.current.position.x,
          targetSlide,
          delta * 8
        );
      }

      if (switchPointLRef.current) {
        switchPointLRef.current.position.x = THREE.MathUtils.lerp(
          switchPointLRef.current.position.x,
          -0.98 + targetSlide,
          delta * 8
        );
      }

      if (switchPointRRef.current) {
        switchPointRRef.current.position.x = THREE.MathUtils.lerp(
          switchPointRRef.current.position.x,
          0.98 + targetSlide,
          delta * 8
        );
      }

      if (signalLampRef.current) {
        const targetColor = isDiverted ? '#10B981' : '#EF4444';
        signalLampRef.current.color.set(targetColor);
      }

      // Footbridge Visibility based on scenario
      if (footbridgeMeshRef.current) {
        footbridgeMeshRef.current.visible = state.scenarioKey === 'footbridge';
      }

      // Loop Track & Buffer Stop visibility based on scenario
      if (loopGroupRef.current) {
        loopGroupRef.current.visible = state.scenarioKey === 'loop';
      }
      if (bufferStopRef.current) {
        bufferStopRef.current.visible = state.scenarioKey !== 'loop';
      }

      // Bystander Physics in Footbridge Dilemma
      if (bystanderGroupRef.current) {
        bystanderGroupRef.current.visible = state.scenarioKey === 'footbridge';

        if (state.scenarioKey === 'footbridge') {
          if (state.bystanderFallen) {
            // Animate falling from footbridge deck (Y: 5.8 down to track Y: 0.8)
            state.bystanderVelY -= 28 * delta;
            state.bystanderPosY += state.bystanderVelY * delta;
            if (state.bystanderPosY <= 0.8) {
              state.bystanderPosY = 0.8;
              state.bystanderVelY = 0;
              bystanderGroupRef.current.rotation.x = Math.PI / 2; // Lies on track
            } else {
              bystanderGroupRef.current.rotation.x += delta * 4;
            }
            bystanderGroupRef.current.position.set(0, state.bystanderPosY, state.bystanderPosZ);
          } else {
            bystanderGroupRef.current.position.set(0, 5.8, 10);
            bystanderGroupRef.current.rotation.set(0, 0, 0);
          }
        }
      }

      // Simulation Motion Dynamics & Kinetic Train Progress
      let currentTrainX = 0;
      let currentTrainZ = 20;

      if (state.simState === 'RUNNING' && trolleyGroupRef.current) {
        state.trolleyProgress += delta * 0.22 * state.speed;

        // Path Calculation: Start at Z: 20, travel to Z: -34 (54 units total)
        let posX = 0;
        let posZ = 20 - state.trolleyProgress * 54;
        let rotY = 0;

        if (state.scenarioKey === 'footbridge') {
          // If bystander was pushed, locomotive collides with bystander at Z ~ 10 and halts abruptly!
          if (state.isSwitchPulled && posZ <= 10.5) {
            posZ = 9.5;
            state.trolleyProgress = (20 - 9.5) / 54;
            state.simState = 'RESOLVED';
            setSimState('RESOLVED');
            // Emergency brake spark storm
            sparksParticlesRef.current.emit(0, 0.7, 9.5, 45, 1.5);
            state.shakeIntensity = 0.55;
          }
          posX = 0;
          rotY = 0;
        } else if (state.scenarioKey === 'loop') {
          // Loop Scenario Dynamics
          if (state.isSwitchPulled) {
            if (posZ > 0) {
              posX = 0;
              rotY = 0;
            } else if (turnoutSplineRef.current) {
              const u = Math.min(Math.abs(posZ) / 44, 0.65);
              const curvePt = turnoutSplineRef.current.getPoint(u);
              const curveTan = turnoutSplineRef.current.getTangent(u);
              posX = curvePt.x;
              posZ = curvePt.z;
              rotY = Math.atan2(-curveTan.x, -curveTan.z);

              if (u >= 0.64) {
                state.simState = 'RESOLVED';
                setSimState('RESOLVED');
              }
            }
          }
        } else {
          // Classic Switch or Autonomous Vehicle
          if (state.isSwitchPulled) {
            if (posZ > 0) {
              posX = 0;
              rotY = 0;
            } else if (turnoutSplineRef.current) {
              // Smoothly follow the engineered turnout easement curve
              const u = Math.min(Math.abs(posZ) / 44, 1.0);
              const curvePt = turnoutSplineRef.current.getPoint(u);
              const curveTan = turnoutSplineRef.current.getTangent(u);
              posX = curvePt.x;
              posZ = curvePt.z;
              rotY = Math.atan2(-curveTan.x, -curveTan.z);
            }
          } else {
            // Straight main line
            posX = 0;
            rotY = 0;
          }
        }

        currentTrainX = posX;
        currentTrainZ = posZ;

        trolleyGroupRef.current.position.set(posX, 0.7, posZ);
        trolleyGroupRef.current.rotation.y = rotY;

        // Emit Smokestack Steam while moving
        if (steamParticlesRef.current) {
          steamParticlesRef.current.emitTimer += delta;
          if (steamParticlesRef.current.emitTimer > 0.08) {
            steamParticlesRef.current.emitTimer = 0;
            const sp = steamParticlesRef.current;
            for (let i = 0; i < sp.count; i++) {
              if (sp.life[i] <= 0) {
                sp.pos[i * 3] = posX + (Math.random() - 0.5) * 0.3;
                sp.pos[i * 3 + 1] = 3.6 + Math.random() * 0.2;
                sp.pos[i * 3 + 2] = posZ - 2.6;

                sp.vel[i * 3] = (Math.random() - 0.5) * 0.8;
                sp.vel[i * 3 + 1] = 1.8 + Math.random() * 1.2;
                sp.vel[i * 3 + 2] = 2.5 + Math.random() * 1.5;

                sp.life[i] = 1.0;
                break;
              }
            }
          }
        }

        // Check if run completed
        if (state.trolleyProgress >= 1.0) {
          state.simState = 'RESOLVED';
          setSimState('RESOLVED');
        }
      } else if (trolleyGroupRef.current) {
        currentTrainX = trolleyGroupRef.current.position.x;
        currentTrainZ = trolleyGroupRef.current.position.z;
      }

      // Update Steam Particles
      if (steamParticlesRef.current) {
        const sp = steamParticlesRef.current;
        let steamNeedsUpdate = false;
        for (let i = 0; i < sp.count; i++) {
          if (sp.life[i] > 0) {
            sp.pos[i * 3] += sp.vel[i * 3] * delta;
            sp.pos[i * 3 + 1] += sp.vel[i * 3 + 1] * delta;
            sp.pos[i * 3 + 2] += sp.vel[i * 3 + 2] * delta;
            sp.life[i] -= delta * 0.85;
            steamNeedsUpdate = true;
          } else {
            sp.pos[i * 3 + 1] = -100;
          }
        }
        if (steamNeedsUpdate) sp.geo.attributes.position.needsUpdate = true;
      }

      // Update Sparks Particles
      if (sparksParticlesRef.current) {
        const spk = sparksParticlesRef.current;
        let sparksNeedsUpdate = false;
        for (let i = 0; i < spk.count; i++) {
          if (spk.life[i] > 0) {
            spk.pos[i * 3] += spk.vel[i * 3] * delta;
            spk.pos[i * 3 + 1] += spk.vel[i * 3 + 1] * delta;
            spk.pos[i * 3 + 2] += spk.vel[i * 3 + 2] * delta;
            spk.vel[i * 3 + 1] -= 24 * delta; // Gravity on sparks
            spk.life[i] -= delta;
            sparksNeedsUpdate = true;
          } else {
            spk.pos[i * 3 + 1] = -100;
          }
        }
        if (sparksNeedsUpdate) spk.geo.attributes.position.needsUpdate = true;
      }

      // 15. Real Kinetic Collision Physics with Workers
      const trainFrontZ = currentTrainZ - 3.8; // Cowcatcher extends ~3.8 ahead of origin
      const records = victimRecordsRef.current;

      for (let i = 0; i < records.length; i++) {
        const vic = records[i];

        // Check if active in this scenario
        const isActiveVictim =
          (vic.category === 'straight' && (!state.isSwitchPulled || state.scenarioKey === 'footbridge')) ||
          (vic.category === 'spur' && state.isSwitchPulled && state.scenarioKey !== 'footbridge');

        if (!vic.isHit && state.simState === 'RUNNING' && isActiveVictim) {
          const dx = Math.abs(vic.pos.x - currentTrainX);
          const dz = Math.abs(vic.pos.z - trainFrontZ);

          // Impact contact detected!
          if (dz < 1.3 && dx < 1.6) {
            vic.isHit = true;

            // Apply violent kinetic knockback impulse
            const side = vic.pos.x >= currentTrainX ? 1 : -1;
            vic.vel.x = side * (7 + Math.random() * 9) * state.speed;
            vic.vel.y = (8 + Math.random() * 6) * state.speed;
            vic.vel.z = -14 * (0.8 + Math.random() * 0.5) * state.speed;

            // Tumbling angular momentum
            vic.rotVel.set(
              (Math.random() - 0.5) * 22,
              (Math.random() - 0.5) * 16,
              (Math.random() - 0.5) * 22
            );

            // Spawn explosive impact sparks
            sparksParticlesRef.current.emit(vic.pos.x, 1.0, vic.pos.z, 28, 1.2);

            // Screen shake impulse
            state.shakeIntensity = Math.min(0.65, state.shakeIntensity + 0.35);
          }
        }

        // Integrate ragdoll / knockback physics for hit victims
        if (vic.isHit) {
          vic.pos.x += vic.vel.x * delta;
          vic.pos.y += vic.vel.y * delta;
          vic.pos.z += vic.vel.z * delta;

          // Gravity
          vic.vel.y -= 28 * delta;

          // Air drag
          vic.vel.x *= Math.pow(0.96, delta * 60);
          vic.vel.z *= Math.pow(0.96, delta * 60);

          // Rotation tumbling
          vic.mesh.rotation.x += vic.rotVel.x * delta;
          vic.mesh.rotation.y += vic.rotVel.y * delta;
          vic.mesh.rotation.z += vic.rotVel.z * delta;

          // Ground & Ballast Collision Bounce
          if (vic.pos.y <= 0.35) {
            vic.pos.y = 0.35;
            vic.vel.y = -vic.vel.y * 0.32; // restitution
            vic.vel.x *= 0.65; // ground friction
            vic.vel.z *= 0.65;
            vic.rotVel.multiplyScalar(0.7);
          }

          vic.mesh.position.copy(vic.pos);
        }
      }

      // 16. Camera Positioning & Screen Shake
      if (cameraRef.current) {
        if (state.cameraView === 'chase' && trolleyGroupRef.current) {
          const tPos = trolleyGroupRef.current.position;
          const chaseTarget = new THREE.Vector3(tPos.x, tPos.y + 4.2, tPos.z + 14);
          cameraRef.current.position.lerp(chaseTarget, delta * 6);
          cameraRef.current.lookAt(tPos.x, tPos.y + 1.8, tPos.z - 18);
        } else if (state.cameraView === 'lever') {
          const leverCamPos = new THREE.Vector3(-5.6, 3.4, 1.4);
          cameraRef.current.position.lerp(leverCamPos, delta * 6);
          cameraRef.current.lookAt(-2.2, 1.2, -1.72);
        } else {
          // Standard Overview with smooth orbit centered on the central dilemma
          const { theta, phi, radius } = state.cameraAngle;
          const targetX = 3.5 + radius * Math.sin(phi) * Math.sin(theta);
          const targetY = 1.0 + radius * Math.cos(phi);
          const targetZ = -22.0 + radius * Math.sin(phi) * Math.cos(theta);

          cameraRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), delta * 5);
          cameraRef.current.lookAt(3.5, 1.0, -22.0);
        }

        // Apply screen shake on collision
        if (state.shakeIntensity > 0.001) {
          const shakeX = (Math.random() - 0.5) * state.shakeIntensity;
          const shakeY = (Math.random() - 0.5) * state.shakeIntensity;
          cameraRef.current.position.x += shakeX;
          cameraRef.current.position.y += shakeY;
          state.shakeIntensity = Math.max(0, state.shakeIntensity - delta * 2.2);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 17. Resize Observer
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerCancel);
      container.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, []);

  /**
   * Reset Physics & Simulation to Station State
   */
  const handleResetSimulation = useCallback(() => {
    setSimState('IDLE');
    animStateRef.current.trolleyProgress = 0;
    animStateRef.current.simState = 'IDLE';
    animStateRef.current.shakeIntensity = 0;
    animStateRef.current.bystanderFallen = false;
    animStateRef.current.bystanderPosY = 5.8;
    animStateRef.current.bystanderVelY = 0;

    if (trolleyGroupRef.current) {
      trolleyGroupRef.current.position.set(0, 0.7, 20);
      trolleyGroupRef.current.rotation.y = 0;
    }

    if (bystanderGroupRef.current) {
      bystanderGroupRef.current.position.set(0, 5.8, 10);
      bystanderGroupRef.current.rotation.set(0, 0, 0);
    }

    // Reset all worker figurines to upright original positions
    victimRecordsRef.current.forEach((vic) => {
      vic.isHit = false;
      vic.isGrounded = false;
      vic.pos.copy(vic.origPos);
      vic.vel.set(0, 0, 0);
      vic.rotVel.set(0, 0, 0);
      vic.mesh.position.copy(vic.origPos);
      vic.mesh.rotation.set(0, 0, 0);
    });
  }, []);

  /**
   * Scenario Switching Handler
   */
  const handleSelectScenario = (key) => {
    setSelectedScenarioKey(key);
    animStateRef.current.scenarioKey = key;
    if (loopGroupRef.current) {
      loopGroupRef.current.visible = key === 'loop';
    }
    if (bufferStopRef.current) {
      bufferStopRef.current.visible = key !== 'loop';
    }
    setIsSwitchPulled(false);
    handleResetSimulation();
  };

  /**
   * Execute or Pause Runaway Simulation
   */
  const handleRunSimulation = () => {
    if (simState === 'IDLE') {
      setSimState('RUNNING');
      animStateRef.current.simState = 'RUNNING';

      // Log decision
      const action = isSwitchPulled ? scenario.defaultActionText : scenario.defaultInactionText;
      const saved = isSwitchPulled ? 5 : 1;
      const lost = isSwitchPulled ? 1 : 5;
      const net = saved - lost;

      setDecisionHistory((prev) => [
        {
          id: Date.now(),
          scenario: scenario.title,
          action,
          saved,
          lost,
          net,
        },
        ...prev.slice(0, 4),
      ]);

      recordConceptRun('trolley-problem', 'decision', {
        choice: isSwitchPulled ? 'divert' : 'inaction',
        scenario: scenario.title,
        livesSaved: saved,
      });
    } else if (simState === 'RUNNING') {
      setSimState('IDLE');
      animStateRef.current.simState = 'IDLE';
    } else if (simState === 'RESOLVED') {
      handleResetSimulation();
    }
  };

  return (
    <div className={styles.container}>
      {/* Header & Consequence Orientation */}
      <div className={styles.header}>
        <span className={styles.tagline}>Moral Calculus & Consequence Laboratory</span>
        <h2 className={styles.title}>The Trolley Problem: Conscience & Arithmetic</h2>
        <p className={styles.subtitle}>
          Inquire into the mathematical ethics of human consequence. Compare the clarity of net outcome optimization against the instinctive friction of direct physical harm.
        </p>
      </div>

      {/* Canonical Dilemma Scenarios */}
      <div className={styles.scenarioTabs}>
        {Object.entries(SCENARIOS).map(([key, sc]) => (
          <button
            key={key}
            className={`${styles.scenarioTab} ${selectedScenarioKey === key ? styles.scenarioTabActive : ''}`}
            onClick={() => handleSelectScenario(key)}
          >
            <div className={styles.tabTitle}>
              <span>{sc.title}</span>
              <span className={styles.tabYear}>{sc.year}</span>
            </div>
            <span className={styles.tabDesc}>{sc.desc}</span>
          </button>
        ))}
      </div>

      {/* 3D WebGL Orrery Viewport */}
      <div className={styles.viewportWrapper}>
        <div ref={mountRef} className={styles.canvasContainer} />

        {/* Top-Left Telemetry HUD */}
        <div className={styles.telemetryHud}>
          <div className={styles.hudHeader}>
            <span className={styles.hudBadge}>{scenario.philosopher}</span>
            <span className={styles.hudSpeed}>{simulationSpeed}× Velocity</span>
          </div>
          <span className={styles.hudDilemma}>{scenario.tagline}</span>
          <div className={styles.hudStatusRow}>
            <span
              className={`${styles.statusIndicator} ${
                simState === 'IDLE'
                  ? styles.indicatorIdle
                  : simState === 'RUNNING'
                  ? styles.indicatorRunning
                  : styles.indicatorResolved
              }`}
            />
            <span>
              {simState === 'IDLE'
                ? 'Ready at Station'
                : simState === 'RUNNING'
                ? 'Locomotive in Transit'
                : 'Consequence Realized'}
            </span>
          </div>
        </div>

        {/* Top-Right fMRI Neural Activity Monitor */}
        <div className={styles.fmriMonitor}>
          <div className={styles.fmriTitle}>
            <span>fMRI NEURAL TELEMETRY</span>
            <Icon name="atom" size={14} />
          </div>
          <div className={styles.neuralBarGroup}>
            <div className={styles.neuralBarItem}>
              <div className={styles.neuralLabelRow}>
                <span className={styles.dlPfcColor}>dlPFC (Math / Outcome)</span>
                <span>{scenario.dlPfcActivity}%</span>
              </div>
              <div className={styles.neuralTrack}>
                <div
                  className={styles.neuralFill}
                  style={{ width: `${scenario.dlPfcActivity}%`, background: 'var(--color-brand-light, #e5a93c)' }}
                />
              </div>
            </div>
            <div className={styles.neuralBarItem}>
              <div className={styles.neuralLabelRow}>
                <span className={styles.limbicColor}>Limbic (Visceral Aversion)</span>
                <span>{scenario.limbicActivity}%</span>
              </div>
              <div className={styles.neuralTrack}>
                <div
                  className={styles.neuralFill}
                  style={{ width: `${scenario.limbicActivity}%`, background: 'var(--color-text-secondary, #9ca3af)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Viewport Hint & Camera Controls */}
        <div className={styles.viewportBottomBar}>
          <div className={styles.camControls}>
            <button
              className={`${styles.camBtn} ${cameraView === 'overview' ? styles.camBtnActive : ''}`}
              onClick={() => setCameraView('overview')}
            >
              Overview
            </button>
            <button
              className={`${styles.camBtn} ${cameraView === 'chase' ? styles.camBtnActive : ''}`}
              onClick={() => setCameraView('chase')}
            >
              Chase Cam
            </button>
            <button
              className={`${styles.camBtn} ${cameraView === 'lever' ? styles.camBtnActive : ''}`}
              onClick={() => setCameraView('lever')}
            >
              Lever Station
            </button>
          </div>

          <div className={styles.interactionHint}>
            <span>Drag to rotate • Ctrl+Scroll to zoom</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Decision Dashboard */}
      <div className={styles.dashboard}>
        {/* Left: Moral Decision Control Center */}
        <div className={styles.decisionPanel}>
          <h3 className={styles.panelTitle}>
            <span>Action & Intervention Console</span>
            <span className={styles.tabYear}>{scenario.actionParity}</span>
          </h3>

          {/* Lever / Intervention Toggle */}
          <div className={styles.leverControlBox}>
            <div className={styles.leverInfo}>
              <span className={styles.leverLabel}>
                {isSwitchPulled ? scenario.defaultActionText : scenario.defaultInactionText}
              </span>
              <span className={styles.leverSub}>
                {isSwitchPulled
                  ? 'Active intervention redirects path: saves 5 workers, sacrifices 1'
                  : 'Passive inaction allows inertia: 5 workers struck on original course'}
              </span>
            </div>
            <button
              className={`${styles.leverToggleBtn} ${
                isSwitchPulled ? styles.leverDiverted : styles.leverStraight
              }`}
              onClick={() => setIsSwitchPulled(!isSwitchPulled)}
            >
              <Icon name={isSwitchPulled ? 'switch' : 'arrow-right'} size={16} />
              <span>{isSwitchPulled ? 'Diverted (Active)' : 'Main Line (Default)'}</span>
            </button>
          </div>

          {/* Execution Controls */}
          <div className={styles.actionButtons}>
            <Button
              variant="primary"
              size="lg"
              className={styles.launchBtn}
              onClick={handleRunSimulation}
            >
              <Icon name={simState === 'RUNNING' ? 'pause' : 'play'} size={18} />
              <span>
                {simState === 'IDLE'
                  ? 'Dispatch Runaway Locomotive'
                  : simState === 'RUNNING'
                  ? 'Pause Physics'
                  : 'Reset & Rerun Trial'}
              </span>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className={styles.resetBtn}
              onClick={handleResetSimulation}
            >
              <Icon name="refresh" size={16} />
              <span>Reset</span>
            </Button>
          </div>

          {/* Consequence Arithmetic Ledger */}
          <div className={styles.consequenceMatrix}>
            <div className={styles.matrixCard}>
              <span className={styles.matrixLabel}>Lives Preserved</span>
              <span className={`${styles.matrixVal} ${styles.valPositive}`}>
                {isSwitchPulled ? 5 : 1}
              </span>
              <span className={styles.matrixSub}>
                {isSwitchPulled ? '5 Workers Spared' : '1 Worker Spared'}
              </span>
            </div>

            <div className={styles.matrixCard}>
              <span className={styles.matrixLabel}>Casualties Borne</span>
              <span className={`${styles.matrixVal} ${styles.valNegative}`}>
                {isSwitchPulled ? 1 : 5}
              </span>
              <span className={styles.matrixSub}>
                {isSwitchPulled ? '1 Spur Casualty' : '5 Main Line Casualties'}
              </span>
            </div>

            <div className={styles.matrixCard}>
              <span className={styles.matrixLabel}>Net Welfare Balance</span>
              <span
                className={`${styles.matrixVal} ${
                  isSwitchPulled ? styles.valPositive : styles.valNegative
                }`}
              >
                {isSwitchPulled ? '+4 Lives' : '-4 Lives'}
              </span>
              <span className={styles.matrixSub}>
                {isSwitchPulled ? 'Aggregated Gain' : 'Deficit by Inertia'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Philosophical Consequence Analysis */}
        <div className={styles.analysisPanel}>
          <h3 className={styles.panelTitle}>
            <span>Ethical Consequence Analysis</span>
            <Icon name="network" size={16} />
          </h3>

          <div className={styles.consequenceSummaryBox}>
            <strong>Consequentialist Reality:</strong> {scenario.mechanismText}
          </div>

          {/* Decision History Log */}
          <div className={styles.historyList}>
            {decisionHistory.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: '#6B7280', fontStyle: 'italic' }}>
                No trials executed yet. Dispatch the locomotive to record outcomes.
              </span>
            ) : (
              decisionHistory.map((item) => (
                <div key={item.id} className={styles.historyItem}>
                  <span>{item.scenario}</span>
                  <span style={{ color: item.net > 0 ? '#10B981' : '#EF4444' }}>
                    {item.net > 0 ? `+${item.net} Net Lives` : `${item.net} Net Lives`}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Conscience & Calculus Guide Button */}
          <button className={styles.guideTrigger} onClick={() => setShowGuideModal(true)}>
            <span>Explore The Conscience & Calculus Guide</span>
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>

      {/* Pedagogical Conscience & Calculus Modal */}
      {showGuideModal && (
        <div className={styles.guideModalBackdrop} onClick={() => setShowGuideModal(false)}>
          <div className={styles.guideModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Conscience & Calculus: A Moral Examination</h3>
              <button className={styles.modalCloseBtn} onClick={() => setShowGuideModal(false)}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.guideSection}>
                <h4>1. The Supremacy of Outcomes</h4>
                <p>
                  Every ethical action leaves an indelible mark on reality. When five human beings stand on a rail line,
                  allowing them to perish through passive omission produces five tragedies just as real as if you caused them directly.
                  Minimizing net harm and maximizing total conscious flourishing remains the clearest mathematical compass available.
                </p>
              </div>

              <div className={styles.guideSection}>
                <h4>2. The Footbridge Paradox: Arithmetic vs. Touch</h4>
                <p>
                  Why do people readily flip the switch (90% support) but refuse to push the heavy man (90% reject), when both yield the exact same +4 net lives?
                  fMRI neuroimaging demonstrates that direct physical contact triggers ancient evolutionary limbic circuits designed to prevent violence within the tribe,
                  even when reason dictates that five families would be saved.
                </p>
              </div>

              <div className={styles.guideSection}>
                <h4>3. Autonomous Code in the Physical World</h4>
                <p>
                  Today, autonomous vehicles, intensive care triage boards, and power grid shedding algorithms encounter this exact problem at scale.
                  When algorithms make life-or-death decisions in milliseconds, pure outcome maximization provides the only objective, defensible standard for minimizing human tragedy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
