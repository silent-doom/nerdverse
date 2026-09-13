'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './TrolleyProblem3DLab.module.css';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/common/Icon';

/**
 * Scenario Presets & Moral Calculus Specifications
 */
const SCENARIOS = {
  switch: {
    id: 'switch',
    title: 'The Classic Switch',
    year: '1967',
    philosopher: 'Philippa Foot',
    tagline: 'Standard Switch Turnout',
    desc: 'Runaway trolley heads toward 5 trapped railworkers. Pulling the switch diverts it onto a side track with 1 worker.',
    straightVictims: 5,
    divertVictims: 1,
    defaultActionText: 'Pull Lever to Divert',
    defaultInactionText: 'Keep Main Line (Do Not Pull)',
    mechanismText: 'Diverting routes the train away from 5 workers. The solitary worker is struck as a foreseen consequence of redirecting harm.',
    actionParity: 'Active Intervention (+4 Net Lives)',
    utilitarianScore: 4, // +4 lives
    dlPfcActivity: 85,
    limbicActivity: 25,
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
    desc: 'No side track exists. Standing on a footbridge over the rails beside a heavy bystander, pushing him halts the trolley before striking 5 workers.',
    straightVictims: 5,
    divertVictims: 1,
    defaultActionText: 'Push Heavy Bystander',
    defaultInactionText: 'Refrain From Pushing',
    mechanismText: 'Pushing the bystander converts a conscious human body into an instrumental mechanical brake. The math is +4 lives, but tactile violence triggers intense emotional revulsion.',
    actionParity: 'Physical Sacrifice (+4 Net Lives)',
    utilitarianScore: 4,
    dlPfcActivity: 52,
    limbicActivity: 92,
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
    mechanismText: 'Unlike the classic switch, the single worker is not collateral: his physical bulk is the necessary impact barrier that prevents the trolley from circling back to kill the 5.',
    actionParity: 'Instrumental Collision (+4 Net Lives)',
    utilitarianScore: 4,
    dlPfcActivity: 78,
    limbicActivity: 68,
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
    mechanismText: 'Machine ethics in compiled binary: sparing 5 pedestrians at the cost of the vehicle occupant, weighing consumer duty against aggregate life preservation.',
    actionParity: 'Algorithmic Optimization (+4 Net Lives)',
    utilitarianScore: 4,
    dlPfcActivity: 95,
    limbicActivity: 15,
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

  // Refs for 60fps loop and 3D objects
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const trolleyGroupRef = useRef(null);
  const switchBladeRef = useRef(null);
  const leverRodRef = useRef(null);
  const signalLampRef = useRef(null);
  const victimsGroupRef = useRef(null);
  const footbridgeMeshRef = useRef(null);
  const bystanderMeshRef = useRef(null);

  const animStateRef = useRef({
    trolleyProgress: 0, // 0 to 1 along track
    isSwitchPulled: false,
    scenarioKey: 'switch',
    simState: 'IDLE',
    speed: 1,
    cameraView: 'overview',
    cameraAngle: { theta: 0.35, phi: 0.85, radius: 48 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
  });

  // Keep animStateRef synchronized with React states
  useEffect(() => {
    animStateRef.current.isSwitchPulled = isSwitchPulled;
  }, [isSwitchPulled]);

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
   * Three.js Scene Setup & Render Loop
   */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#08090C');
    scene.fog = new THREE.FogExp2('#08090C', 0.012);
    sceneRef.current = scene;

    // 2. Camera Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 300);
    camera.position.set(0, 32, 45);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight('#1E2230', 1.8);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight('#FFFBEB', 2.8);
    mainSun.position.set(25, 45, 20);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 1024;
    mainSun.shadow.mapSize.height = 1024;
    mainSun.shadow.bias = -0.001;
    scene.add(mainSun);

    const amberFill = new THREE.PointLight('#E5A93C', 3.5, 40);
    amberFill.position.set(-10, 8, 5);
    scene.add(amberFill);

    const blueBacklight = new THREE.DirectionalLight('#38BDF8', 1.2);
    blueBacklight.position.set(-20, 20, -25);
    scene.add(blueBacklight);

    // 5. Ground Ballast & Environment
    const groundGeo = new THREE.PlaneGeometry(160, 160, 16, 16);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#0D0F14',
      roughness: 0.88,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle Grid on Ballast
    const gridHelper = new THREE.GridHelper(140, 35, '#232736', '#141722');
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // 6. Build Rail Tracks (Main Line + Diverging Spur + Loop)
    const tracksGroup = new THREE.Group();
    scene.add(tracksGroup);

    const railMat = new THREE.MeshStandardMaterial({ color: '#8E94A5', metalness: 0.85, roughness: 0.35 });
    const sleeperMat = new THREE.MeshStandardMaterial({ color: '#271E18', roughness: 0.9, metalness: 0.05 });

    // Helper: Add straight track section
    const buildStraightTrack = (startX, startZ, length, angle = 0) => {
      const segGroup = new THREE.Group();
      segGroup.position.set(startX, 0, startZ);
      segGroup.rotation.y = angle;

      const sleeperGeo = new THREE.BoxGeometry(3.2, 0.22, 0.6);
      const railGeo = new THREE.BoxGeometry(0.12, 0.28, length);

      // Sleepers
      const sleeperSpacing = 1.4;
      const count = Math.floor(length / sleeperSpacing);
      for (let i = 0; i <= count; i++) {
        const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
        sleeper.position.set(0, 0.11, -length / 2 + i * sleeperSpacing);
        sleeper.receiveShadow = true;
        segGroup.add(sleeper);
      }

      // Left Rail
      const railL = new THREE.Mesh(railGeo, railMat);
      railL.position.set(-1.1, 0.3, 0);
      railL.castShadow = true;
      segGroup.add(railL);

      // Right Rail
      const railR = new THREE.Mesh(railGeo, railMat);
      railR.position.set(1.1, 0.3, 0);
      railR.castShadow = true;
      segGroup.add(railR);

      tracksGroup.add(segGroup);
      return segGroup;
    };

    // Main approach track (from Z: 35 to Z: 0)
    buildStraightTrack(0, 18, 36);

    // Main continuation track (straight ahead, Z: 0 to Z: -42)
    buildStraightTrack(0, -21, 42);

    // Diverging Spur Track (angles to the right, starts at junction Z=0)
    // Diverges at ~28 degrees
    buildStraightTrack(7.8, -19, 44, -0.42);

    // Loop Track geometry (connects spur back to main line behind straight victims)
    const loopCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(15, 0.3, -36),
      new THREE.Vector3(18, 0.3, -48),
      new THREE.Vector3(8, 0.3, -56),
      new THREE.Vector3(-4, 0.3, -52),
      new THREE.Vector3(0, 0.3, -42),
    ]);
    const loopGeo = new THREE.TubeGeometry(loopCurve, 40, 0.08, 6, false);
    const loopMeshL = new THREE.Mesh(loopGeo, railMat);
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

    // Moving Switch Blade Rail (swings to connect straight or spur)
    const bladeGeo = new THREE.BoxGeometry(0.12, 0.28, 7.5);
    const bladeMesh = new THREE.Mesh(bladeGeo, railMat);
    bladeMesh.position.set(0.6, 0.3, -3.5);
    bladeMesh.castShadow = true;
    junctionGroup.add(bladeMesh);
    switchBladeRef.current = bladeMesh;

    // Switch Stand & Lever
    const leverStandGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.8, 8);
    const leverStandMat = new THREE.MeshStandardMaterial({ color: '#2B3042', metalness: 0.8, roughness: 0.4 });
    const leverStand = new THREE.Mesh(leverStandGeo, leverStandMat);
    leverStand.position.set(-2.6, 0.4, 0);
    junctionGroup.add(leverStand);

    // Lever Rod with Amber handle
    const leverRodGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8);
    const leverRodMat = new THREE.MeshStandardMaterial({ color: '#C59332', metalness: 0.9, roughness: 0.2 });
    const leverRod = new THREE.Mesh(leverRodGeo, leverRodMat);
    leverRod.position.set(0, 0.9, 0);
    leverRod.rotation.z = -0.38; // Default straight position
    leverStand.add(leverRod);
    leverRodRef.current = leverRod;

    const leverHandleGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const leverHandleMat = new THREE.MeshStandardMaterial({ color: '#E5A93C', roughness: 0.3 });
    const leverHandle = new THREE.Mesh(leverHandleGeo, leverHandleMat);
    leverHandle.position.set(0, 1.1, 0);
    leverRod.add(leverHandle);

    // Signal Lantern (Green = Diverted, Red = Straight/Danger)
    const lanternGeo = new THREE.BoxGeometry(0.5, 0.7, 0.5);
    const lanternMat = new THREE.MeshStandardMaterial({ color: '#161922', metalness: 0.8 });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.set(-2.6, 2.0, 0);
    junctionGroup.add(lantern);

    const signalLightGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const signalLightMat = new THREE.MeshStandardMaterial({
      color: '#EF4444',
      emissive: '#EF4444',
      emissiveIntensity: 2.5,
    });
    const signalLight = new THREE.Mesh(signalLightGeo, signalLightMat);
    signalLight.position.set(0, 0, 0.26);
    lantern.add(signalLight);
    signalLampRef.current = signalLight;

    // 8. Overhead Footbridge (Thomson 1976 Dilemma)
    const footbridgeGroup = new THREE.Group();
    footbridgeGroup.position.set(0, 0, 14); // Spans over approach track
    scene.add(footbridgeGroup);
    footbridgeMeshRef.current = footbridgeGroup;

    const bridgeDeckGeo = new THREE.BoxGeometry(14, 0.6, 3.5);
    const bridgeDeckMat = new THREE.MeshStandardMaterial({ color: '#1E2230', metalness: 0.6, roughness: 0.5 });
    const bridgeDeck = new THREE.Mesh(bridgeDeckGeo, bridgeDeckMat);
    bridgeDeck.position.set(0, 5.5, 0);
    bridgeDeck.castShadow = true;
    bridgeDeck.receiveShadow = true;
    footbridgeGroup.add(bridgeDeck);

    const bridgeRailingGeo = new THREE.BoxGeometry(14, 1.0, 0.1);
    const railingMat = new THREE.MeshStandardMaterial({ color: '#C59332', metalness: 0.7, roughness: 0.3 });
    const railingFront = new THREE.Mesh(bridgeRailingGeo, railingMat);
    railingFront.position.set(0, 6.3, 1.6);
    const railingBack = new THREE.Mesh(bridgeRailingGeo, railingMat);
    railingBack.position.set(0, 6.3, -1.6);
    footbridgeGroup.add(railingFront, railingBack);

    // Support pillars
    const pillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 5.5, 8);
    const pillarL = new THREE.Mesh(pillarGeo, bridgeDeckMat);
    pillarL.position.set(-6, 2.75, 0);
    const pillarR = new THREE.Mesh(pillarGeo, bridgeDeckMat);
    pillarR.position.set(6, 2.75, 0);
    footbridgeGroup.add(pillarL, pillarR);

    // Heavy Bystander Figurine standing on footbridge
    const bystanderGroup = new THREE.Group();
    bystanderGroup.position.set(0, 5.8, 0);
    footbridgeGroup.add(bystanderGroup);
    bystanderMeshRef.current = bystanderGroup;

    // Bulky bystander body + heavy backpack
    const torsoGeo = new THREE.CylinderGeometry(0.48, 0.45, 1.1, 10);
    const torsoMat = new THREE.MeshStandardMaterial({ color: '#3B82F6', roughness: 0.6 });
    const bystanderTorso = new THREE.Mesh(torsoGeo, torsoMat);
    bystanderTorso.position.y = 0.55;
    bystanderTorso.castShadow = true;
    bystanderGroup.add(bystanderTorso);

    const headGeo = new THREE.SphereGeometry(0.26, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: '#FCD34D', roughness: 0.5 });
    const bystanderHead = new THREE.Mesh(headGeo, headMat);
    bystanderHead.position.y = 1.35;
    bystanderGroup.add(bystanderHead);

    const backpackGeo = new THREE.BoxGeometry(0.65, 0.75, 0.45);
    const backpackMat = new THREE.MeshStandardMaterial({ color: '#D97706', roughness: 0.7 });
    const backpack = new THREE.Mesh(backpackGeo, backpackMat);
    backpack.position.set(0, 0.65, -0.4);
    bystanderGroup.add(backpack);

    // 9. Victims / Workers Figures on Tracks
    const victimsGroup = new THREE.Group();
    scene.add(victimsGroup);
    victimsGroupRef.current = victimsGroup;

    const createFigurine = (x, z, label, colorHex = '#EF4444') => {
      const fig = new THREE.Group();
      fig.position.set(x, 0, z);

      // Legs/Pants
      const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.9, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: '#1F2937', roughness: 0.8 });
      const legL = new THREE.Mesh(legGeo, legMat);
      legL.position.set(-0.2, 0.45, 0);
      const legR = new THREE.Mesh(legGeo, legMat);
      legR.position.set(0.2, 0.45, 0);
      fig.add(legL, legR);

      // Vest / Hi-vis jacket
      const vestGeo = new THREE.CylinderGeometry(0.32, 0.3, 0.95, 8);
      const vestMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
      const vest = new THREE.Mesh(vestGeo, vestMat);
      vest.position.set(0, 1.25, 0);
      vest.castShadow = true;
      fig.add(vest);

      // Hardhat / Head
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0, 1.9, 0);
      const hardhatGeo = new THREE.SphereGeometry(0.3, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const hardhatMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.2, roughness: 0.3 });
      const hardhat = new THREE.Mesh(hardhatGeo, hardhatMat);
      hardhat.position.set(0, 2.0, 0);
      fig.add(head, hardhat);

      victimsGroup.add(fig);
      return fig;
    };

    // Populate 5 Workers on Straight Track (Z from -24 to -34)
    for (let i = 0; i < 5; i++) {
      createFigurine((i % 2 === 0 ? -0.35 : 0.35), -24 - i * 2.5, `StraightWorker_${i}`, '#EF4444');
    }

    // Populate 1 Solitary Worker on Diverging Spur Track (around X: 11, Z: -26)
    createFigurine(11.2, -26.5, 'SpurWorker', '#3B82F6');

    // 10. Load 3D Trolley (via GLTFLoader with procedural fallback)
    const trolleyGroup = new THREE.Group();
    scene.add(trolleyGroup);
    trolleyGroupRef.current = trolleyGroup;
    trolleyGroup.position.set(0, 0, 32);

    const loader = new GLTFLoader();
    loader.load(
      '/models/trolley.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.4, 1.4, 1.4);
        model.rotation.y = Math.PI; // Face forward along negative Z
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
        // Procedural Fallback Mesh if GLB fails to load
        const bodyGeo = new THREE.BoxGeometry(2.4, 2.2, 5.4);
        const bodyMat = new THREE.MeshStandardMaterial({ color: '#D97706', metalness: 0.6, roughness: 0.3 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.7;
        body.castShadow = true;
        trolleyGroup.add(body);

        const lampGeo = new THREE.SphereGeometry(0.3, 12, 12);
        const lampMat = new THREE.MeshStandardMaterial({ color: '#FEF08A', emissive: '#FEF08A', emissiveIntensity: 3 });
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.set(0, 1.8, -2.75);
        trolleyGroup.add(lamp);
      }
    );

    // Trolley Headlight Spotlight beam
    const headlight = new THREE.SpotLight('#FEF08A', 4.5, 35, Math.PI / 6, 0.4, 1.2);
    headlight.position.set(0, 2.2, -2.5);
    headlight.target.position.set(0, 0, -25);
    trolleyGroup.add(headlight);
    trolleyGroup.add(headlight.target);

    // 11. Pointer Drag Navigation (Orbit around scene)
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
        0.15,
        Math.PI / 2 - 0.05
      );
    };

    const onPointerUp = () => {
      animStateRef.current.isDragging = false;
    };

    const onWheel = (e) => {
      // Natural scroll preservation: only zoom if Ctrl/Cmd/Shift is held or pinch gesture
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        e.preventDefault();
        animStateRef.current.cameraAngle.radius = THREE.MathUtils.clamp(
          animStateRef.current.cameraAngle.radius + Math.sign(e.deltaY) * 3,
          18,
          90
        );
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 12. Animation Loop (60 FPS)
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
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

      // Simulation Motion Dynamics
      if (state.simState === 'RUNNING' && trolleyGroupRef.current) {
        state.trolleyProgress += delta * 0.22 * state.speed;

        // Path Calculation
        let posX = 0;
        let posZ = 32 - state.trolleyProgress * 64;
        let rotY = 0;

        if (state.scenarioKey === 'footbridge') {
          // If bystander was pushed, trolley halts abruptly right before workers!
          if (state.isSwitchPulled && state.trolleyProgress >= 0.48) {
            state.trolleyProgress = 0.48;
            state.simState = 'RESOLVED';
            setSimState('RESOLVED');
          }
          posX = 0;
          posZ = 32 - state.trolleyProgress * 64;
          rotY = 0;
        } else if (state.scenarioKey === 'loop') {
          // Loop Scenario Dynamics
          if (state.isSwitchPulled) {
            if (posZ > 0) {
              posX = 0;
            } else if (posZ > -32) {
              const u = Math.abs(posZ) / 32;
              posX = u * 13;
              rotY = -0.42;
            } else {
              // Collides with single loop worker and grinds to halt!
              posX = 13;
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
              // Diverge onto spur
              const spurDist = -posZ;
              posX = spurDist * 0.42;
              rotY = -0.42;
            }
          } else {
            // Straight main line
            posX = 0;
            rotY = 0;
          }
        }

        trolleyGroupRef.current.position.set(posX, 0, posZ);
        trolleyGroupRef.current.rotation.y = rotY;

        // Check if run completed
        if (state.trolleyProgress >= 1.0) {
          state.simState = 'RESOLVED';
          setSimState('RESOLVED');
        }
      }

      // Camera Positioning Modes
      if (cameraRef.current) {
        if (state.cameraView === 'chase' && trolleyGroupRef.current) {
          const tPos = trolleyGroupRef.current.position;
          const chaseTarget = new THREE.Vector3(tPos.x, tPos.y + 3.5, tPos.z + 12);
          cameraRef.current.position.lerp(chaseTarget, delta * 5);
          cameraRef.current.lookAt(tPos.x, tPos.y + 1.5, tPos.z - 15);
        } else if (state.cameraView === 'lever') {
          const leverCamPos = new THREE.Vector3(-6.5, 4.5, 4);
          cameraRef.current.position.lerp(leverCamPos, delta * 5);
          cameraRef.current.lookAt(2, 1, -10);
        } else {
          // Standard Orbit Overview
          const { theta, phi, radius } = state.cameraAngle;
          const targetX = radius * Math.sin(phi) * Math.sin(theta);
          const targetY = radius * Math.cos(phi);
          const targetZ = radius * Math.sin(phi) * Math.cos(theta);

          cameraRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), delta * 5);
          cameraRef.current.lookAt(3, 1, -10);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 13. Resize Observer
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
   * Scenario Switching Handler
   */
  const handleSelectScenario = (key) => {
    setSelectedScenarioKey(key);
    setIsSwitchPulled(false);
    handleResetSimulation();
  };

  /**
   * Reset Simulation to Initial Track State
   */
  const handleResetSimulation = useCallback(() => {
    setSimState('IDLE');
    animStateRef.current.trolleyProgress = 0;
    animStateRef.current.simState = 'IDLE';

    if (trolleyGroupRef.current) {
      trolleyGroupRef.current.position.set(0, 0, 32);
      trolleyGroupRef.current.rotation.y = 0;
    }
  }, []);

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
      {/* Header & Philosophical Orientation */}
      <div className={styles.header}>
        <span className={styles.tagline}>Moral Calculus & Consequence Laboratory</span>
        <h2 className={styles.title}>The Trolley Problem: Conscience & Arithmetic</h2>
        <p className={styles.subtitle}>
          Inquire into the mathematical ethics of human consequence. Compare the clarity of outcome optimization against the instinctive friction of direct physical harm.
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
                ? 'Runaway in Transit'
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
                  ? 'Dispatch Runaway Trolley'
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
                No trials executed yet. Dispatch the trolley to record outcomes.
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
