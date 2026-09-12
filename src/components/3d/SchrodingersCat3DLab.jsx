'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './SchrodingersCat3DLab.module.css';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/common/Icon';

/**
 * High-fidelity 3D WebGL Quantum Simulation Laboratory for Schrödinger's Cat.
 * Features full physical apparatus in 3D:
 * - Sealed Obsidian steel chamber with rotatable 3D camera
 * - Articulated 3D cat with alive breathing/tail animations & ground-state collapse
 * - Radioactive isotope core emitting quantum sparks
 * - Geiger counter with needle deflection & Web Audio synthesized clicks
 * - Trip hammer & glass vial
 * - X-Ray / Quantum Peeking mode into the superposition
 * - Variable elapsed time & decay probability curve (P = 1 - e^(-lambda*t))
 * - Copenhagen wave collapse vs. Everett Many-Worlds multiverse branching
 * - Trial statistical counter tracking empirical frequency
 */
export default function SchrodingersCat3DLab() {
  const mountRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Simulation State
  const [boxState, setBoxState] = useState('sealed'); // 'sealed', 'measuring', 'alive', 'dead'
  const [xrayMode, setXrayMode] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(30); // half-life is 30 mins -> 50%
  const [interpretation, setInterpretation] = useState('copenhagen'); // 'copenhagen' | 'many-worlds'
  const [trials, setTrials] = useState({ total: 0, alive: 0, dead: 0 });
  const [audioEnabled, setAudioEnabled] = useState(true);

  // 3D Scene Refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const doorGroupRef = useRef(null);
  const catGroupRef = useRef(null);
  const catAliveMeshRef = useRef(null);
  const catDeadMeshRef = useRef(null);
  const coreMeshRef = useRef(null);
  const sparksRef = useRef(null);
  const geigerNeedleRef = useRef(null);
  const hammerRef = useRef(null);
  const vialFluidRef = useRef(null);
  const chamberWallsRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const updateCameraPosRef = useRef(null);

  // Camera Orbit State
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: 0.35, phi: 0.22, radius: 13.5 });

  // Calculate theoretical decay probability: P(decay) = 1 - (0.5)^(t / t_half)
  // Half-life is 30 minutes
  const halfLife = 30;
  const decayProb = Math.min(0.99, Math.max(0.01, 1 - Math.pow(0.5, elapsedMinutes / halfLife)));
  const aliveProb = 1 - decayProb;

  // Synthesize realistic Geiger click via Web Audio API
  const playGeigerClick = useCallback(() => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const bufferSize = ctx.sampleRate * 0.003; // 3ms click
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 3200 + Math.random() * 800;
      filter.Q.value = 3.0;
      const gain = ctx.createGain();
      gain.gain.value = 0.45;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch {
      // Audio fallback without crash
    }
  }, [audioEnabled]);

  // Synthesize mechanical latch clink sound
  const playLatchSound = useCallback(() => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // audio fallback
    }
  }, [audioEnabled]);

  // Periodic random Geiger clicks based on decay probability
  useEffect(() => {
    if (boxState !== 'sealed' && boxState !== 'measuring') return;
    const interval = setInterval(() => {
      if (Math.random() < decayProb * 0.85) {
        playGeigerClick();
        if (geigerNeedleRef.current) {
          geigerNeedleRef.current.rotation.z = -0.4 - Math.random() * 0.8;
          setTimeout(() => {
            if (geigerNeedleRef.current) geigerNeedleRef.current.rotation.z = -0.2;
          }, 150);
        }
      }
    }, 450);
    return () => clearInterval(interval);
  }, [boxState, decayProb, playGeigerClick]);

  // Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 460;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090C);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    cameraRef.current = camera;
    const updateCameraPos = () => {
      const { theta, phi, radius } = cameraAngleRef.current;
      camera.position.x = radius * Math.cos(phi) * Math.sin(theta);
      camera.position.y = radius * Math.sin(phi) + 1.2;
      camera.position.z = radius * Math.cos(phi) * Math.cos(theta);
      camera.lookAt(0, 0.5, 0);
    };
    updateCameraPosRef.current = updateCameraPos;
    updateCameraPos();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    mainLight.position.set(8, 12, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    fillLight.position.set(-6, 8, 8);
    scene.add(fillLight);

    const interiorLight = new THREE.PointLight(0xfff8ee, 2.8, 12);
    interiorLight.position.set(0, 1.8, 0);
    scene.add(interiorLight);

    // 5. Build The Chamber Box
    const chamberWalls = [];
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1d28,
      roughness: 0.55,
      metalness: 0.35,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0,
    });

    const boxWidth = 7;
    const boxHeight = 4.8;
    const boxDepth = 5.6;

    // Outer laboratory base plate
    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.3, 9),
      new THREE.MeshStandardMaterial({ color: 0x0e1017, roughness: 0.7, metalness: 0.6 })
    );
    basePlate.position.y = -boxHeight / 2 - 0.15;
    basePlate.receiveShadow = true;
    scene.add(basePlate);

    // Wall creation helper
    const addWall = (w, h, d, x, y, z) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMaterial.clone());
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      chamberWalls.push(mesh);
      return mesh;
    };

    // Floor, Ceiling, Back, Left, Right
    addWall(boxWidth, 0.25, boxDepth, 0, -boxHeight / 2, 0);
    addWall(boxWidth, 0.25, boxDepth, 0, boxHeight / 2, 0);
    addWall(boxWidth, boxHeight, 0.25, 0, 0, -boxDepth / 2);
    addWall(0.25, boxHeight, boxDepth, -boxWidth / 2, 0, 0);
    addWall(0.25, boxHeight, boxDepth, boxWidth / 2, 0, 0);

    // Golden Chamber Frame Trim (Perimeter Border only, leaving doorway hollow)
    const trimT = 0.15;
    const trimD = 0.2;
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xe5a93c, roughness: 0.3, metalness: 0.9 });

    const topTrim = new THREE.Mesh(new THREE.BoxGeometry(boxWidth + trimT * 2, trimT, trimD), frameMat);
    topTrim.position.set(0, boxHeight / 2 + trimT / 2, boxDepth / 2);
    scene.add(topTrim);

    const botTrim = new THREE.Mesh(new THREE.BoxGeometry(boxWidth + trimT * 2, trimT, trimD), frameMat);
    botTrim.position.set(0, -boxHeight / 2 - trimT / 2, boxDepth / 2);
    scene.add(botTrim);

    const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(trimT, boxHeight, trimD), frameMat);
    leftTrim.position.set(-boxWidth / 2 - trimT / 2, 0, boxDepth / 2);
    scene.add(leftTrim);

    const rightTrim = new THREE.Mesh(new THREE.BoxGeometry(trimT, boxHeight, trimD), frameMat);
    rightTrim.position.set(boxWidth / 2 + trimT / 2, 0, boxDepth / 2);
    scene.add(rightTrim);

    chamberWallsRef.current = chamberWalls;

    // 6. The Hinged Door (Openable)
    const doorGroup = new THREE.Group();
    doorGroup.position.set(-boxWidth / 2, 0, boxDepth / 2); // hinge on left

    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(boxWidth, boxHeight - 0.1, 0.22),
      new THREE.MeshStandardMaterial({
        color: 0x1f2330,
        roughness: 0.5,
        metalness: 0.3,
        transparent: true,
        opacity: 1.0,
      })
    );
    doorMesh.position.set(boxWidth / 2, 0, 0);
    doorMesh.castShadow = true;
    doorGroup.add(doorMesh);
    chamberWalls.push(doorMesh);

    // Warning Radiation Symbol on Door Face
    const radRing = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.65, 32),
      new THREE.MeshStandardMaterial({ color: 0xe5a93c, side: THREE.DoubleSide })
    );
    radRing.position.set(boxWidth / 2, 0.2, 0.13);
    doorGroup.add(radRing);

    const radCenter = new THREE.Mesh(
      new THREE.CircleGeometry(0.25, 32),
      new THREE.MeshStandardMaterial({ color: 0xe5a93c, side: THREE.DoubleSide })
    );
    radCenter.position.set(boxWidth / 2, 0.2, 0.131);
    doorGroup.add(radCenter);

    // Brass Lock Latch
    const lockMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.8, 0.25),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.9 })
    );
    lockMesh.position.set(boxWidth - 0.3, 0, 0.14);
    doorGroup.add(lockMesh);

    scene.add(doorGroup);
    doorGroupRef.current = doorGroup;

    // 7. Internal Apparatus: The Radioactive Isotope Atom
    const isotopeGroup = new THREE.Group();
    isotopeGroup.position.set(-2, -0.6, -1.2);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.65, 0.8, 24),
      new THREE.MeshStandardMaterial({ color: 0x222634, metalness: 0.8, roughness: 0.4 })
    );
    pedestal.position.y = -0.4;
    isotopeGroup.add(pedestal);

    // Glowing Core
    const coreMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.35, 2),
      new THREE.MeshStandardMaterial({
        color: 0xe5a93c,
        emissive: 0xe5a93c,
        emissiveIntensity: 0.9,
        roughness: 0.1,
      })
    );
    coreMesh.position.y = 0.3;
    isotopeGroup.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // Orbiting particle sparks
    const sparkCount = 45;
    const sparkGeom = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      const radius = 0.55 + Math.random() * 0.45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      sparkPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      sparkPositions[i * 3 + 1] = 0.3 + radius * Math.sin(phi) * Math.sin(theta);
      sparkPositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({ color: 0xfef08a, size: 0.08, transparent: true, opacity: 0.85 });
    const sparkPoints = new THREE.Points(sparkGeom, sparkMat);
    isotopeGroup.add(sparkPoints);
    sparksRef.current = sparkPoints;

    scene.add(isotopeGroup);

    // 8. Internal Apparatus: The Geiger Counter
    const geigerGroup = new THREE.Group();
    geigerGroup.position.set(-2, 0.8, -1.2);

    const geigerBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.9, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1f2330, metalness: 0.7, roughness: 0.3 })
    );
    geigerGroup.add(geigerBox);

    // Gauge Dial
    const dialPlate = new THREE.Mesh(
      new THREE.CircleGeometry(0.3, 24),
      new THREE.MeshBasicMaterial({ color: 0xf3f4f6 })
    );
    dialPlate.position.set(0, 0.05, 0.31);
    geigerGroup.add(dialPlate);

    // Needle
    const needleGeom = new THREE.BoxGeometry(0.04, 0.26, 0.02);
    needleGeom.translate(0, 0.12, 0);
    const needle = new THREE.Mesh(needleGeom, new THREE.MeshBasicMaterial({ color: 0xd97706 }));
    needle.position.set(0, -0.05, 0.32);
    needle.rotation.z = -0.2;
    geigerGroup.add(needle);
    geigerNeedleRef.current = needle;

    scene.add(geigerGroup);

    // 9. Internal Apparatus: The Trip Hammer & Glass Vial of Poison
    const poisonGroup = new THREE.Group();
    poisonGroup.position.set(-0.6, -1.2, -1.2);

    // Glass Flask
    const flaskGeom = new THREE.CylinderGeometry(0.2, 0.38, 0.7, 16);
    const flaskMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
    });
    const flask = new THREE.Mesh(flaskGeom, flaskMat);
    flask.position.y = 0.35;
    poisonGroup.add(flask);

    // Poison Liquid Fluid
    const fluidGeom = new THREE.CylinderGeometry(0.18, 0.35, 0.45, 16);
    const fluidMat = new THREE.MeshStandardMaterial({ color: 0xe5a93c, roughness: 0.2, emissive: 0xd97706, emissiveIntensity: 0.3 });
    const fluid = new THREE.Mesh(fluidGeom, fluidMat);
    fluid.position.y = 0.25;
    poisonGroup.add(fluid);
    vialFluidRef.current = fluid;

    // Mechanical Hammer
    const hammerArmGeom = new THREE.BoxGeometry(0.08, 0.75, 0.08);
    hammerArmGeom.translate(0, -0.35, 0);
    const hammerHeadGeom = new THREE.BoxGeometry(0.3, 0.15, 0.2);
    hammerHeadGeom.translate(0, -0.7, 0);

    const hammerGroup = new THREE.Group();
    hammerGroup.position.set(0, 1.4, 0);
    const hammerArm = new THREE.Mesh(hammerArmGeom, new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.9 }));
    const hammerHead = new THREE.Mesh(hammerHeadGeom, new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 }));
    hammerGroup.add(hammerArm);
    hammerGroup.add(hammerHead);
    hammerGroup.rotation.z = -Math.PI / 4; // ready to strike
    poisonGroup.add(hammerGroup);
    hammerRef.current = hammerGroup;

    scene.add(poisonGroup);

    // 10. The 3D Cat Model (Articulated Compound Geometry)
    const catGroup = new THREE.Group();
    catGroup.position.set(1.4, -1.1, 0.2);

    // Helper for building the 3D Cat
    const createCatMesh = (isDeadPose = false) => {
      const catSubGroup = new THREE.Group();
      const catColor = isDeadPose ? 0x475569 : 0xe5a93c;
      const catMat = new THREE.MeshStandardMaterial({
        color: catColor,
        roughness: 0.6,
        metalness: 0.1,
      });

      if (!isDeadPose) {
        // ALIVE POSE (Sitting upright, alert)
        // Torso
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.65, 1.1, 8, 16), catMat);
        body.position.set(0, 0.7, 0);
        body.rotation.z = 0.15;
        body.castShadow = true;
        catSubGroup.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), catMat);
        head.position.set(0.1, 1.7, 0.1);
        head.castShadow = true;
        catSubGroup.add(head);

        // Ears
        const earGeom = new THREE.ConeGeometry(0.2, 0.38, 4);
        const earLeft = new THREE.Mesh(earGeom, catMat);
        earLeft.position.set(-0.25, 2.2, 0.1);
        earLeft.rotation.z = 0.2;
        const earRight = new THREE.Mesh(earGeom, catMat);
        earRight.position.set(0.4, 2.2, 0.1);
        earRight.rotation.z = -0.2;
        catSubGroup.add(earLeft);
        catSubGroup.add(earRight);

        // Eyes (Bright alert amber/ivory)
        const eyeGeom = new THREE.SphereGeometry(0.08, 12, 12);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x08090c });
        const eyeLeft = new THREE.Mesh(eyeGeom, eyeMat);
        eyeLeft.position.set(-0.1, 1.8, 0.55);
        const eyeRight = new THREE.Mesh(eyeGeom, eyeMat);
        eyeRight.position.set(0.3, 1.8, 0.55);
        catSubGroup.add(eyeLeft);
        catSubGroup.add(eyeRight);

        // Paws
        const pawGeom = new THREE.SphereGeometry(0.22, 12, 12);
        const pawLeft = new THREE.Mesh(pawGeom, catMat);
        pawLeft.position.set(-0.25, 0.15, 0.6);
        const pawRight = new THREE.Mesh(pawGeom, catMat);
        pawRight.position.set(0.3, 0.15, 0.6);
        catSubGroup.add(pawLeft);
        catSubGroup.add(pawRight);

        // Animated Tail
        const tailCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0.2, -0.5),
          new THREE.Vector3(0.3, 0.6, -1.0),
          new THREE.Vector3(0.5, 1.1, -1.1),
        ]);
        const tailMesh = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 16, 0.12, 8, false), catMat);
        tailMesh.name = 'tail';
        catSubGroup.add(tailMesh);
      } else {
        // DEAD / GROUND STATE POSE (Curled peacefully on side asleep)
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.65, 1.2, 8, 16), catMat);
        body.position.set(0, 0.35, 0);
        body.rotation.z = Math.PI / 2;
        body.rotation.x = 0.4;
        body.castShadow = true;
        catSubGroup.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), catMat);
        head.position.set(-0.95, 0.35, 0.3);
        catSubGroup.add(head);

        const earLeft = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.3, 4), catMat);
        earLeft.position.set(-1.1, 0.7, 0.3);
        catSubGroup.add(earLeft);

        // Closed eyes (lines)
        const closedEyeGeom = new THREE.BoxGeometry(0.12, 0.03, 0.03);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1f2330 });
        const eye1 = new THREE.Mesh(closedEyeGeom, eyeMat);
        eye1.position.set(-0.9, 0.38, 0.75);
        catSubGroup.add(eye1);
      }

      return catSubGroup;
    };

    const aliveMesh = createCatMesh(false);
    const deadMesh = createCatMesh(true);
    catGroup.add(aliveMesh);
    catGroup.add(deadMesh);

    catAliveMeshRef.current = aliveMesh;
    catDeadMeshRef.current = deadMesh;
    catGroupRef.current = catGroup;
    scene.add(catGroup);

    // 11. Animation Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Spin & pulse radioactive core
      if (coreMeshRef.current) {
        coreMeshRef.current.rotation.y += delta * 1.2;
        coreMeshRef.current.rotation.x += delta * 0.8;
      }

      // Orbit particles
      if (sparksRef.current) {
        sparksRef.current.rotation.y += delta * 0.9;
      }

      // Tail swish & cat subtle breathing
      if (catAliveMeshRef.current && catAliveMeshRef.current.visible) {
        const tail = catAliveMeshRef.current.getObjectByName('tail');
        if (tail) {
          tail.rotation.y = Math.sin(time * 3) * 0.25;
        }
        catAliveMeshRef.current.position.y = Math.sin(time * 2.2) * 0.02;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 12. Pointer Controls for Camera Orbit
    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevPointerRef.current.x;
      const dy = e.clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };

      cameraAngleRef.current.theta -= dx * 0.008;
      cameraAngleRef.current.phi = Math.max(-0.2, Math.min(1.1, cameraAngleRef.current.phi + dy * 0.008));
      updateCameraPos();
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(6, Math.min(20, cameraAngleRef.current.radius + e.deltaY * 0.015));
      updateCameraPos();
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 460;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      if (container && renderer.domElement) {
        container.innerHTML = '';
      }
      renderer.dispose();
    };
  }, []);

  // Update Visuals based on Box State & X-Ray Mode
  useEffect(() => {
    // 1. Chamber Wall Opacity (Solid vs. X-Ray Quantum Peeking)
    if (chamberWallsRef.current) {
      chamberWallsRef.current.forEach((mesh) => {
        mesh.material.opacity = xrayMode ? 0.15 : 1.0;
        mesh.material.depthWrite = !xrayMode;
        mesh.material.needsUpdate = true;
      });
    }

    // 2. Door Open Angle & Decal Opacity
    if (doorGroupRef.current) {
      if (boxState === 'sealed') {
        doorGroupRef.current.rotation.y = 0; // Closed
      } else if (boxState === 'measuring') {
        doorGroupRef.current.rotation.y = Math.PI * 0.4; // Half open unlatching
      } else {
        doorGroupRef.current.rotation.y = Math.PI * 0.92; // Fully swung open flush against side wall
      }

      doorGroupRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity = xrayMode ? 0.15 : 1.0;
          child.material.depthWrite = !xrayMode;
          child.material.needsUpdate = true;
        }
      });
    }

    // 3. Superposition vs Collapsed Cat Visualization
    if (catAliveMeshRef.current && catDeadMeshRef.current) {
      if (boxState === 'sealed' || boxState === 'measuring') {
        // In Superposition: Both states are active / blended (Quantum superposition)
        catAliveMeshRef.current.visible = true;
        catDeadMeshRef.current.visible = xrayMode; // In X-Ray mode, show the dual phantom state!
        catAliveMeshRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = xrayMode ? 0.65 : 1.0;
          }
        });
        catDeadMeshRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = 0.45;
          }
        });
      } else if (boxState === 'alive') {
        // Collapsed ALIVE
        catAliveMeshRef.current.visible = true;
        catDeadMeshRef.current.visible = false;
        catAliveMeshRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
        });
        // Reset hammer
        if (hammerRef.current) hammerRef.current.rotation.z = -Math.PI / 4;
      } else if (boxState === 'dead') {
        // Collapsed DEAD
        catAliveMeshRef.current.visible = false;
        catDeadMeshRef.current.visible = true;
        catDeadMeshRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
        });
        // Hammer strikes
        if (hammerRef.current) hammerRef.current.rotation.z = 0;
      }
    }
  }, [boxState, xrayMode]);

  // Handle Measurement Trigger (Open Chamber)
  const handleMeasure = () => {
    if (boxState !== 'sealed') return;
    playLatchSound();
    setBoxState('measuring');

    setTimeout(() => {
      // Quantum RNG based on calculated exponential decay probability
      const roll = Math.random();
      const isAlive = roll > decayProb;

      setBoxState(isAlive ? 'alive' : 'dead');
      setTrials((prev) => ({
        total: prev.total + 1,
        alive: prev.alive + (isAlive ? 1 : 0),
        dead: prev.dead + (!isAlive ? 1 : 0),
      }));

      if (!isAlive) {
        playGeigerClick();
      }
    }, 900);
  };

  // Reset Experiment to Sealed Superposition
  const handleReset = () => {
    playLatchSound();
    setBoxState('sealed');
  };

  // Reset Camera Viewport to Default Front Perspective
  const handleResetCamera = () => {
    cameraAngleRef.current = { theta: 0.35, phi: 0.22, radius: 13.5 };
    if (updateCameraPosRef.current) {
      updateCameraPosRef.current();
    }
  };

  return (
    <div className={styles.container}>
      {/* Simulation Header */}
      <div className={styles.header}>
        <div className={styles.tagline}>Quantum Thought Experiment Lab</div>
        <h2 className={styles.title}>Schrödinger's Cat 3D Chamber</h2>
        <p className={styles.subtitle}>
          Rotate the 3D chamber, configure the radioactive decay half-life, peek inside via X-Ray superposition, and trigger observation to collapse the wave function.
        </p>
      </div>

      {/* Main 3D Viewport & HUD Overlay */}
      <div className={styles.viewportWrapper}>
        <div ref={mountRef} className={styles.canvasContainer} />

        {/* 3D Viewport Hint & Camera Reset */}
        <div className={styles.cameraHint}>
          <Icon name="compass" size={13} />
          <span>Drag to rotate • Scroll to zoom</span>
          <button
            type="button"
            className={styles.resetCamBtn}
            onClick={handleResetCamera}
            title="Reset camera to default front view"
          >
            <Icon name="rotate-ccw" size={11} />
            <span>Reset View</span>
          </button>
        </div>

        {/* Live Quantum State Badge HUD */}
        <div className={styles.statusHud}>
          <div className={styles.statusLabel}>CHAMBER STATE:</div>
          <div className={`${styles.statusValue} ${styles[boxState]}`}>
            {boxState === 'sealed' && 'SUPERPOSITION | |Ψ⟩ = α|Alive⟩ + β|Dead⟩'}
            {boxState === 'measuring' && 'DECOHERENCE COLLAPSING...'}
            {boxState === 'alive' && 'MEASURED: ALIVE (Eigenstate |1⟩)'}
            {boxState === 'dead' && 'MEASURED: COLLAPSED (Eigenstate |0⟩)'}
          </div>
        </div>

        {/* Quick Viewport Controls */}
        <div className={styles.viewportControls}>
          <button
            className={`${styles.viewBtn} ${xrayMode ? styles.activeViewBtn : ''}`}
            onClick={() => setXrayMode(!xrayMode)}
            title="Toggle Quantum Peeking (X-Ray view into sealed superposition)"
          >
            <Icon name={xrayMode ? 'eye-off' : 'eye'} size={14} />
            <span>{xrayMode ? 'Solid Chamber' : 'Quantum X-Ray View'}</span>
          </button>

          <button
            className={`${styles.viewBtn} ${audioEnabled ? styles.activeViewBtn : ''}`}
            onClick={() => setAudioEnabled(!audioEnabled)}
            title="Toggle Geiger Counter Clicks"
          >
            <Icon name={audioEnabled ? 'volume-2' : 'volume-x'} size={14} />
            <span>{audioEnabled ? 'Geiger Audio ON' : 'Mute Geiger'}</span>
          </button>
        </div>
      </div>

      {/* Many-Worlds Multiverse Branch Modal/View if active */}
      {interpretation === 'many-worlds' && (boxState === 'alive' || boxState === 'dead') && (
        <div className={styles.manyWorldsBanner}>
          <div className={styles.branchHeader}>
            <Icon name="network" size={18} />
            <span>Everett Many-Worlds Branch Detected</span>
          </div>
          <div className={styles.branchesGrid}>
            <div className={`${styles.branchCard} ${boxState === 'alive' ? styles.activeBranch : ''}`}>
              <div className={styles.branchTitle}>Universe Branch α (Your Observation)</div>
              <div className={styles.branchOutcome}>Cat is ALIVE</div>
              <p className={styles.branchDesc}>The radioactive isotope did not decay. The observer entangles with the living timeline.</p>
            </div>
            <div className={`${styles.branchCard} ${boxState === 'dead' ? styles.activeBranch : ''}`}>
              <div className={styles.branchTitle}>Universe Branch β (Parallel Reality)</div>
              <div className={styles.branchOutcome}>Cat is COLLAPSED</div>
              <p className={styles.branchDesc}>In an identical parallel universe, the hammer tripped. Both realities exist simultaneously.</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Controls & Telemetry Dashboard */}
      <div className={styles.dashboard}>
        {/* Left Column: Experiment Controls */}
        <div className={styles.controlPanel}>
          <h4 className={styles.panelTitle}>Chamber Controls</h4>

          {/* Primary Action Button */}
          <div className={styles.primaryActionRow}>
            {boxState === 'sealed' ? (
              <Button size="lg" variant="primary" onClick={handleMeasure} className={styles.actionBtn}>
                <Icon name="eye" size={18} />
                <span>Open Chamber (Measure)</span>
              </Button>
            ) : (
              <Button size="lg" variant="secondary" onClick={handleReset} disabled={boxState === 'measuring'} className={styles.actionBtn}>
                <Icon name="rotate-ccw" size={18} />
                <span>Reseal Chamber (Reset Superposition)</span>
              </Button>
            )}
          </div>

          {/* Half-life Elapsed Time Slider */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabelRow}>
              <span>Elapsed Exposure Time: <strong>{elapsedMinutes} mins</strong></span>
              <span className={styles.halfLifeNotice}>Half-Life: {halfLife}m</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={elapsedMinutes}
              disabled={boxState !== 'sealed'}
              onChange={(e) => setElapsedMinutes(Number(e.target.value))}
              className={styles.timeSlider}
            />
            <div className={styles.sliderScale}>
              <span>0m (100% Alive)</span>
              <span>30m (50/50)</span>
              <span>90m (87% Decayed)</span>
            </div>
          </div>

          {/* Interpretation Switcher */}
          <div className={styles.interpretationRow}>
            <div className={styles.controlLabel}>Quantum Interpretation:</div>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${interpretation === 'copenhagen' ? styles.toggleActive : ''}`}
                onClick={() => setInterpretation('copenhagen')}
              >
                Copenhagen Collapse
              </button>
              <button
                className={`${styles.toggleBtn} ${interpretation === 'many-worlds' ? styles.toggleActive : ''}`}
                onClick={() => setInterpretation('many-worlds')}
              >
                Many-Worlds (Multiverse)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Quantum Probability & Telemetry HUD */}
        <div className={styles.telemetryPanel}>
          <h4 className={styles.panelTitle}>Quantum Telemetry</h4>

          {/* Probability Bar */}
          <div className={styles.probGauge}>
            <div className={styles.gaugeHeader}>
              <span>Wave Amplitude |ψ|²</span>
              <span>P(Alive): {(aliveProb * 100).toFixed(1)}% | P(Dead): {(decayProb * 100).toFixed(1)}%</span>
            </div>
            <div className={styles.gaugeTrack}>
              <div className={styles.gaugeAlive} style={{ width: `${aliveProb * 100}%` }} />
              <div className={styles.gaugeDead} style={{ width: `${decayProb * 100}%` }} />
            </div>
          </div>

          {/* Apparatus Telemetry Grid */}
          <div className={styles.telemetryGrid}>
            <div className={styles.telemetryCard}>
              <div className={styles.telemetryNum}>{(decayProb * 100).toFixed(0)}%</div>
              <div className={styles.telemetryLabel}>Decay Probability</div>
            </div>
            <div className={styles.telemetryCard}>
              <div className={styles.telemetryNum}>{trials.total}</div>
              <div className={styles.telemetryLabel}>Total Runs Tested</div>
            </div>
            <div className={styles.telemetryCard}>
              <div className={styles.telemetryNum}>{trials.alive}</div>
              <div className={styles.telemetryLabel}>Alive Outcomes</div>
            </div>
            <div className={styles.telemetryCard}>
              <div className={styles.telemetryNum}>{trials.dead}</div>
              <div className={styles.telemetryLabel}>Dead Outcomes</div>
            </div>
          </div>

          {/* Empirical vs Theoretical Ratio */}
          {trials.total > 0 && (
            <div className={styles.empiricalStat}>
              <span>Empirical Observed Ratio: <strong>{((trials.alive / trials.total) * 100).toFixed(1)}% Alive</strong></span>
              <span className={styles.lawNotice}>(Converges with higher N trials)</span>
            </div>
          )}
        </div>
      </div>

      {/* Educational Pedagogical Takeaway */}
      <div className={styles.pedagogyCard}>
        <div className={styles.pedagogyHeader}>
          <Icon name="compass" size={16} />
          <span>Why Schrödinger Proposed This Paradox</span>
        </div>
        <p>
          Erwin Schrödinger did not write this thought experiment because he believed macroscopic cats could actually be alive and dead at the same time. He constructed it to highlight what he considered the <strong>fundamental absurdity</strong> of the Copenhagen Interpretation: if subatomic particles genuinely stay in indefinite superpositions, when exactly does quantum indefiniteness stop and macroscopic reality begin?
        </p>
      </div>
    </div>
  );
}
