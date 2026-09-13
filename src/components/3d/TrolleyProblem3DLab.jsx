'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './TrolleyProblem3DLab.module.css';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/common/Icon';

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
  const leverRodRef = useRef(null);
  const signalLampRef = useRef(null);
  const victimsGroupRef = useRef(null);
  const footbridgeMeshRef = useRef(null);
  const bystanderGroupRef = useRef(null);
  const sparksParticlesRef = useRef(null);
  const steamParticlesRef = useRef(null);

  // Victim physics records array
  const victimRecordsRef = useRef([]);

  const animStateRef = useRef({
    trolleyProgress: 0,
    isSwitchPulled: false,
    scenarioKey: 'switch',
    simState: 'IDLE',
    speed: 1,
    cameraView: 'overview',
    cameraAngle: { theta: 0.38, phi: 1.05, radius: 52 },
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

    // Straight line continuation track (Z: 0 down to Z: -44)
    buildTrackSection(0, -22, 44);

    // Diverging Spur Track (angles to the right, starts at junction Z: 0)
    buildTrackSection(8.4, -20.5, 46, -0.38);

    // Check Rails (Guard Rails) at Turnout Frog (Z: -7 to -12)
    const checkRailGeo = new THREE.BoxGeometry(0.08, 0.14, 4.5);
    const checkRailL = new THREE.Mesh(checkRailGeo, railHeadMat);
    checkRailL.position.set(-0.85, 0.72, -9.5);
    tracksGroup.add(checkRailL);

    // Loop Track geometry (connects spur back to main line behind straight victims)
    const loopCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(16.5, 0.72, -36),
      new THREE.Vector3(19, 0.72, -48),
      new THREE.Vector3(9, 0.72, -56),
      new THREE.Vector3(-4, 0.72, -52),
      new THREE.Vector3(0, 0.72, -44),
    ]);
    const loopGeo = new THREE.TubeGeometry(loopCurve, 50, 0.09, 8, false);
    const loopMeshL = new THREE.Mesh(loopGeo, railHeadMat);
    const loopMeshR = loopMeshL.clone();
    loopMeshR.position.x += 0.8;
    loopMeshL.position.x -= 0.8;
    const loopGroup = new THREE.Group();
    loopGroup.add(loopMeshL, loopMeshR);
    loopGroup.name = 'LoopTracks';
    tracksGroup.add(loopGroup);

    // 7. Mechanical Switch Turnout Mechanism & Signal Lantern
    const junctionGroup = new THREE.Group();
    junctionGroup.position.set(0, 0, 0);
    scene.add(junctionGroup);

    // Moving Switch Point Blade (swings to connect straight or spur)
    const bladeGeo = new THREE.BoxGeometry(0.12, 0.28, 7.8);
    const bladeMesh = new THREE.Mesh(bladeGeo, railHeadMat);
    bladeMesh.position.set(0.65, 0.65, -3.8);
    bladeMesh.castShadow = true;
    junctionGroup.add(bladeMesh);
    switchBladeRef.current = bladeMesh;

    // Switch Tie Bar connecting the movable points
    const tieBarGeo = new THREE.BoxGeometry(1.6, 0.08, 0.14);
    const tieBar = new THREE.Mesh(tieBarGeo, tiePlateMat);
    tieBar.position.set(0, 0.58, -1.2);
    junctionGroup.add(tieBar);

    // Switch Stand & Lever
    const leverStandGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.85, 10);
    const leverStandMat = new THREE.MeshStandardMaterial({ color: '#2B3042', metalness: 0.85, roughness: 0.35 });
    const leverStand = new THREE.Mesh(leverStandGeo, leverStandMat);
    leverStand.position.set(-2.8, 0.45, 0);
    leverStand.castShadow = true;
    junctionGroup.add(leverStand);

    // Lever Rod with Polished Brass Handle
    const leverRodGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8);
    const leverRodMat = new THREE.MeshStandardMaterial({ color: '#C59332', metalness: 0.95, roughness: 0.15 });
    const leverRod = new THREE.Mesh(leverRodGeo, leverRodMat);
    leverRod.position.set(0, 0.95, 0);
    leverRod.rotation.z = -0.38; // Default straight position
    leverStand.add(leverRod);
    leverRodRef.current = leverRod;

    const leverHandleGeo = new THREE.SphereGeometry(0.22, 14, 14);
    const leverHandleMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.25, metalness: 0.8 });
    const leverHandle = new THREE.Mesh(leverHandleGeo, leverHandleMat);
    leverHandle.position.set(0, 1.2, 0);
    leverRod.add(leverHandle);

    // Signal Lantern (Green = Diverted, Red = Straight/Danger)
    const lanternGeo = new THREE.BoxGeometry(0.55, 0.75, 0.55);
    const lanternMat = new THREE.MeshStandardMaterial({ color: '#161922', metalness: 0.85 });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.set(-2.8, 2.1, 0);
    lantern.castShadow = true;
    junctionGroup.add(lantern);

    const signalLightGeo = new THREE.SphereGeometry(0.2, 14, 14);
    const signalLightMat = new THREE.MeshStandardMaterial({
      color: '#EF4444',
      emissive: '#EF4444',
      emissiveIntensity: 3.0,
    });
    const signalLight = new THREE.Mesh(signalLightGeo, signalLightMat);
    signalLight.position.set(0, 0, 0.28);
    lantern.add(signalLight);
    signalLampRef.current = signalLight;

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

    // Populate 1 Solitary Worker on Diverging Spur Track (around X: 11.2, Z: -26.5)
    createFigurine(11.2, -26.5, 'SpurWorker', '#3B82F6', 'spur', 0);

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
        model.rotation.y = Math.PI; // Face cowcatcher forward along negative Z!
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

    // 13. Pointer Drag Navigation (Orbit around scene overview)
    const onPointerDown = (e) => {
      if (e.target.closest('button, input, a')) return;
      animStateRef.current.isDragging = true;
      animStateRef.current.dragStart = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!animStateRef.current.isDragging) return;
      const dx = e.clientX - animStateRef.current.dragStart.x;
      const dy = e.clientY - animStateRef.current.dragStart.y;
      animStateRef.current.dragStart = { x: e.clientX, y: e.clientY };

      animStateRef.current.cameraAngle.theta -= dx * 0.007;
      animStateRef.current.cameraAngle.phi = THREE.MathUtils.clamp(
        animStateRef.current.cameraAngle.phi - dy * 0.007,
        0.2,
        Math.PI / 2 - 0.05
      );
    };

    const onPointerUp = () => {
      animStateRef.current.isDragging = false;
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

      // Animate Switch Blade & Lever Rod based on isSwitchPulled
      if (switchBladeRef.current) {
        const targetBladeRot = state.isSwitchPulled ? -0.22 : 0;
        switchBladeRef.current.rotation.y = THREE.MathUtils.lerp(
          switchBladeRef.current.rotation.y,
          targetBladeRot,
          delta * 8
        );
      }

      if (leverRodRef.current) {
        const targetLeverAngle = state.isSwitchPulled ? 0.38 : -0.38;
        leverRodRef.current.rotation.z = THREE.MathUtils.lerp(
          leverRodRef.current.rotation.z,
          targetLeverAngle,
          delta * 8
        );
      }

      if (signalLampRef.current) {
        const targetColor = state.isSwitchPulled ? '#10B981' : '#EF4444';
        signalLampRef.current.material.color.set(targetColor);
        signalLampRef.current.material.emissive.set(targetColor);
      }

      // Footbridge Visibility based on scenario
      if (footbridgeMeshRef.current) {
        footbridgeMeshRef.current.visible = state.scenarioKey === 'footbridge';
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
            bystanderGroupRef.current.position.set(0, 5.8, 14);
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
            } else if (posZ > -32) {
              const u = Math.abs(posZ) / 32;
              posX = u * 13.5;
              rotY = -0.38;
            } else {
              // Collides with heavy loop worker and stops
              posX = 13.5;
              posZ = -32;
              state.simState = 'RESOLVED';
              setSimState('RESOLVED');
            }
          }
        } else {
          // Classic Switch or Autonomous Vehicle
          if (state.isSwitchPulled) {
            if (posZ > 0) {
              posX = 0;
              rotY = 0;
            } else {
              // Diverge onto spur track
              const spurDist = -posZ;
              posX = spurDist * 0.42;
              rotY = -0.38;
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
          const leverCamPos = new THREE.Vector3(-7.5, 4.8, 5);
          cameraRef.current.position.lerp(leverCamPos, delta * 6);
          cameraRef.current.lookAt(2, 1.2, -10);
        } else {
          // Standard Overview with smooth orbit
          const { theta, phi, radius } = state.cameraAngle;
          const targetX = radius * Math.sin(phi) * Math.sin(theta);
          const targetY = radius * Math.cos(phi);
          const targetZ = radius * Math.sin(phi) * Math.cos(theta);

          cameraRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), delta * 5);
          cameraRef.current.lookAt(2, 1.2, -6);
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
                  style={{ width: `${scenario.dlPfcActivity}%`, background: '#38BDF8' }}
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
                  style={{ width: `${scenario.limbicActivity}%`, background: '#F87171' }}
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
                  Why do people readily flip the switch (90% support) but refuse to push the heavy man (90% reject), when both yield the exact same $+4$ net lives?
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
