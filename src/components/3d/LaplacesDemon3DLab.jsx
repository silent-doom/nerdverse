'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './LaplacesDemon3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

// ── Physics Constants & Setup ──
const NUM_PARTICLES = 16;
const BOUNDS = 2.4;
const SIGMA = 10.0;
const RHO = 28.0;
const BETA = 8.0 / 3.0;

export default function LaplacesDemon3DLab() {
  const mountRef = useRef(null);

  // ── Experiment Modes: 'clockwork' | 'chaos' | 'quantum' ──
  const [activeMode, setActiveMode] = useState('clockwork');
  const modeRef = useRef('clockwork');

  // ── Clockwork Reversibility Controls ──
  const [isPlaying, setIsPlaying] = useState(true);
  const isPlayingRef = useRef(true);
  const [timeOffset, setTimeOffset] = useState(0); // -10s to +10s
  const timeOffsetRef = useRef(0);
  const [forecastLength, setForecastLength] = useState(3.0); // seconds
  const forecastLengthRef = useRef(3.0);

  // ── Chaos Butterfly Controls ──
  const [perturbation, setPerturbation] = useState(0.0001);
  const perturbationRef = useRef(0.0001);
  const [divergenceDist, setDivergenceDist] = useState(0.0);

  // ── Quantum Uncertainty Controls ──
  const [slitWidth, setSlitWidth] = useState(0.8); // delta x
  const slitWidthRef = useRef(0.8);
  const [uncertaintyRatio, setUncertaintyRatio] = useState(1.0);

  // ── Telemetry & Status ──
  const [determinismScore, setDeterminismScore] = useState(100);
  const [statusMessage, setStatusMessage] = useState('All particle coordinates known with infinite precision.');
  const [hasRecorded, setHasRecorded] = useState(false);

  // Sync refs
  useEffect(() => {
    modeRef.current = activeMode;
    if (activeMode === 'clockwork') {
      setDeterminismScore(100);
      setStatusMessage('All atomic coordinates & momenta known. Future and past completely reversible.');
    } else if (activeMode === 'chaos') {
      setDeterminismScore(42);
      setStatusMessage('Butterfly Effect Active: Infinitesimal rounding error produces exponential divergence.');
    } else if (activeMode === 'quantum') {
      setDeterminismScore(0);
      setStatusMessage('Heisenberg Limit: Squeezing position Δx explodes momentum uncertainty Δp.');
    }
  }, [activeMode]);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { timeOffsetRef.current = timeOffset; }, [timeOffset]);
  useEffect(() => { forecastLengthRef.current = forecastLength; }, [forecastLength]);
  useEffect(() => { perturbationRef.current = perturbation; }, [perturbation]);
  useEffect(() => { slitWidthRef.current = slitWidth; }, [slitWidth]);

  // Scene references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const astrolabeGroupRef = useRef(null);
  const demonEyeRef = useRef(null);
  const clockworkGroupRef = useRef(null);
  const chaosGroupRef = useRef(null);
  const quantumGroupRef = useRef(null);

  // Simulation state containers
  const particlesRef = useRef([]);
  const forecastLinesRef = useRef([]);
  const lorenzTrailARef = useRef([]);
  const lorenzTrailBRef = useRef([]);
  const lorenzLineARef = useRef(null);
  const lorenzLineBRef = useRef(null);
  const headAMeshRef = useRef(null);
  const headBMeshRef = useRef(null);
  const slitPlateTopRef = useRef(null);
  const slitPlateBottomRef = useRef(null);
  const laserMeshRef = useRef(null);
  const wavefrontRingsRef = useRef([]);
  const diffractionLinesRef = useRef([]);
  const probabilityLineRef = useRef(null);
  const quantumParticlesRef = useRef([]);

  // ── Initialize Simulation ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07080c);
    scene.fog = new THREE.FogExp2(0x07080c, 0.04);

    const width = mount.clientWidth;
    const height = mount.clientHeight || 560;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const amberLight = new THREE.PointLight(0xe5a93c, 3.5, 14);
    amberLight.position.set(0, 0.5, 0);
    scene.add(amberLight);

    const dirLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
    dirLight.position.set(4, 8, 5);
    scene.add(dirLight);

    // 4. Background Starfield / Cosmic Lattice
    const starGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 40;
      starPositions[i + 1] = (Math.random() - 0.5) * 40;
      starPositions[i + 2] = (Math.random() - 0.5) * 40;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x818cf8, size: 0.12, transparent: true, opacity: 0.6 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // ── 5. Astrolabe & Demon's Ocular Eye Core ──
    const astrolabeGroup = new THREE.Group();
    scene.add(astrolabeGroup);
    astrolabeGroupRef.current = astrolabeGroup;

    // Outer Brass Ring
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xdfa037,
      metalness: 0.88,
      roughness: 0.28,
      wireframe: false,
    });
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x181a24,
      metalness: 0.85,
      roughness: 0.4,
    });

    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.05, 16, 64), brassMat);
    astrolabeGroup.add(outerRing);

    const midRing = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.045, 16, 64), darkMetalMat);
    midRing.rotation.x = Math.PI / 4;
    astrolabeGroup.add(midRing);

    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.04, 16, 64), brassMat);
    innerRing.rotation.y = Math.PI / 3;
    astrolabeGroup.add(innerRing);

    // Central Demon Eye (The Supreme Intellect)
    const eyeGroup = new THREE.Group();
    astrolabeGroup.add(eyeGroup);
    demonEyeRef.current = eyeGroup;

    const coreGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffb834,
      emissive: 0xdf7e08,
      emissiveIntensity: 1.4,
      roughness: 0.2,
      metalness: 0.3,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    eyeGroup.add(coreMesh);

    // Ocular Iris / Pupil Aperture
    const irisRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.035, 16, 32), darkMetalMat);
    irisRing.rotation.x = Math.PI / 2;
    eyeGroup.add(irisRing);

    // ── 6. Mode Groups ──
    // Group 1: Clockwork Determinism
    const clockworkGroup = new THREE.Group();
    scene.add(clockworkGroup);
    clockworkGroupRef.current = clockworkGroup;

    // Glass/Lattice Boundary Box
    const boxGeo = new THREE.BoxGeometry(BOUNDS * 2, BOUNDS * 2, BOUNDS * 2);
    const boxWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(boxGeo),
      new THREE.LineBasicMaterial({ color: 0x272a38, transparent: true, opacity: 0.6 })
    );
    clockworkGroup.add(boxWire);

    // Particles and initial deterministic velocities
    const particles = [];
    const forecastLines = [];
    const pGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xe5a93c,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const mesh = new THREE.Mesh(pGeo, pMat);
      // Deterministic pseudo-random seed positions
      const angle = (i / NUM_PARTICLES) * Math.PI * 2;
      const radius = 0.8 + (i % 3) * 0.4;
      const initialPos = new THREE.Vector3(
        Math.cos(angle) * radius,
        ((i % 5) - 2) * 0.4,
        Math.sin(angle) * radius
      );
      const initialVel = new THREE.Vector3(
        Math.sin(angle * 2.3 + 0.4) * 0.9,
        Math.cos(angle * 1.7 + 0.8) * 0.7,
        Math.cos(angle * 2.3) * 0.9
      );
      mesh.position.copy(initialPos);
      clockworkGroup.add(mesh);

      // Trajectory forecast line
      const lineGeo = new THREE.BufferGeometry();
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.5,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      clockworkGroup.add(line);

      particles.push({
        mesh,
        initialPos: initialPos.clone(),
        initialVel: initialVel.clone(),
        pos: initialPos.clone(),
        vel: initialVel.clone(),
      });
      forecastLines.push(line);
    }
    particlesRef.current = particles;
    forecastLinesRef.current = forecastLines;

    // Group 2: Deterministic Chaos (Lorenz Attractor)
    const chaosGroup = new THREE.Group();
    chaosGroup.visible = false;
    scene.add(chaosGroup);
    chaosGroupRef.current = chaosGroup;

    // Lorenz Trails
    const MAX_POINTS = 1200;
    const trailAGeo = new THREE.BufferGeometry();
    const trailBGeo = new THREE.BufferGeometry();
    const trailAPos = new Float32Array(MAX_POINTS * 3);
    const trailBPos = new Float32Array(MAX_POINTS * 3);
    trailAGeo.setAttribute('position', new THREE.BufferAttribute(trailAPos, 3));
    trailBGeo.setAttribute('position', new THREE.BufferAttribute(trailBPos, 3));

    const lineMatA = new THREE.LineBasicMaterial({ color: 0xe5a93c, linewidth: 2 });
    const lineMatB = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const lineA = new THREE.Line(trailAGeo, lineMatA);
    const lineB = new THREE.Line(trailBGeo, lineMatB);
    chaosGroup.add(lineA);
    chaosGroup.add(lineB);
    lorenzLineARef.current = lineA;
    lorenzLineBRef.current = lineB;

    const headAGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const headAMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    const headA = new THREE.Mesh(headAGeo, headAMat);
    chaosGroup.add(headA);
    headAMeshRef.current = headA;

    const headBGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const headBMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const headB = new THREE.Mesh(headBGeo, headBMat);
    chaosGroup.add(headB);
    headBMeshRef.current = headB;

    // Group 3: Quantum Indeterminacy (Heisenberg Single-Slit Thought Experiment)
    const quantumGroup = new THREE.Group();
    quantumGroup.visible = false;
    scene.add(quantumGroup);
    quantumGroupRef.current = quantumGroup;

    // 3.1 Quantum Wave Source (Left Stage at x = -3.2)
    const emitterHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.45, 0.5, 24),
      new THREE.MeshStandardMaterial({ color: 0x181a24, metalness: 0.85, roughness: 0.35 })
    );
    emitterHousing.rotation.z = Math.PI / 2;
    emitterHousing.position.set(-3.2, 0, 0);
    quantumGroup.add(emitterHousing);

    const emitterLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.08, 24),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.8,
        roughness: 0.2,
      })
    );
    emitterLens.rotation.z = Math.PI / 2;
    emitterLens.position.set(-2.95, 0, 0);
    quantumGroup.add(emitterLens);

    // Incoming traveling quantum wavefront rings
    const wavefrontRings = [];
    for (let w = 0; w < 5; w++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.48, 0.018, 8, 32),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.45,
          wireframe: true,
        })
      );
      ring.rotation.y = Math.PI / 2;
      ring.position.set(-2.8 + w * 0.55, 0, 0);
      quantumGroup.add(ring);
      wavefrontRings.push(ring);
    }
    wavefrontRingsRef.current = wavefrontRings;

    // 3.2 Demon's Measurement Slit Blades & Caliper (Center at x = 0)
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x11131c,
      metalness: 0.92,
      roughness: 0.35,
    });
    const brassTrimMat = new THREE.MeshStandardMaterial({
      color: 0xdfa037,
      metalness: 0.88,
      roughness: 0.25,
    });

    const topBlade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 2.6), bladeMat);
    const bottomBlade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 2.6), bladeMat);
    const topTrim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 2.62), brassTrimMat);
    const bottomTrim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 2.62), brassTrimMat);
    topTrim.position.y = -1.1;
    bottomTrim.position.y = 1.1;
    topBlade.add(topTrim);
    bottomBlade.add(bottomTrim);

    topBlade.position.set(0, 1.1 + 0.4, 0);
    bottomBlade.position.set(0, -1.1 - 0.4, 0);
    quantumGroup.add(topBlade);
    quantumGroup.add(bottomBlade);
    slitPlateTopRef.current = topBlade;
    slitPlateBottomRef.current = bottomBlade;

    // Side support posts for slit apparatus
    const postMat = new THREE.MeshStandardMaterial({ color: 0x272a38, metalness: 0.8 });
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 12), postMat);
    postL.position.set(0, 0, -1.35);
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 12), postMat);
    postR.position.set(0, 0, 1.35);
    quantumGroup.add(postL);
    quantumGroup.add(postR);

    // Demon's Laser Inspection Probe (Demon observing position at the slit)
    const laserGeo = new THREE.CylinderGeometry(0.02, 0.4, 2.4, 16, 1, true);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.position.set(0, 1.2, 0);
    quantumGroup.add(laserMesh);
    laserMeshRef.current = laserMesh;

    // 3.3 Probabilistic Diffraction Fan Rays (x = 0 to x = 3.2)
    const NUM_FAN_RAYS = 17;
    const fanLines = [];
    for (let k = 0; k < NUM_FAN_RAYS; k++) {
      const lineGeo = new THREE.BufferGeometry();
      const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(3.2, 0, 0)];
      lineGeo.setFromPoints(pts);
      const isCenter = Math.abs(k - 8) <= 2;
      const lineMat = new THREE.LineBasicMaterial({
        color: isCenter ? 0x38bdf8 : 0x818cf8,
        transparent: true,
        opacity: isCenter ? 0.65 : 0.25,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      quantumGroup.add(line);
      fanLines.push(line);
    }
    diffractionLinesRef.current = fanLines;

    // 3.4 Future Horizon Detection Screen (Right Stage at x = 3.2)
    const detectorScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 3.4, 2.6),
      new THREE.MeshStandardMaterial({
        color: 0x0a0d16,
        metalness: 0.6,
        roughness: 0.5,
        transparent: true,
        opacity: 0.85,
      })
    );
    detectorScreen.position.set(3.2, 0, 0);
    quantumGroup.add(detectorScreen);

    const screenEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.06, 3.4, 2.6)),
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
    );
    detectorScreen.add(screenEdges);

    // Probability Density Curve Profile (|ψ(y)|² on detector screen at x = 3.16)
    const PROB_POINTS = 64;
    const probCurveGeo = new THREE.BufferGeometry();
    const probCurvePts = new Float32Array(PROB_POINTS * 3);
    probCurveGeo.setAttribute('position', new THREE.BufferAttribute(probCurvePts, 3));
    const probCurveMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 2,
    });
    const probCurveLine = new THREE.Line(probCurveGeo, probCurveMat);
    quantumGroup.add(probCurveLine);
    probabilityLineRef.current = probCurveLine;

    // 3.5 Quantum Flying Particles (Photons / Electrons)
    const QUANTUM_P_COUNT = 24;
    const qParticles = [];
    const qPGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const qPMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.6,
      roughness: 0.2,
    });

    for (let i = 0; i < QUANTUM_P_COUNT; i++) {
      const pMesh = new THREE.Mesh(qPGeo, qPMat.clone());
      quantumGroup.add(pMesh);
      qParticles.push({
        mesh: pMesh,
        progress: i / QUANTUM_P_COUNT,
        speed: 0.007 + (i % 5) * 0.0014,
        yOffset: (Math.random() - 0.5) * 0.18,
        zOffset: (Math.random() - 0.5) * 0.18,
        scatterAngleY: 0,
        scatterAngleZ: 0,
      });
    }
    quantumParticlesRef.current = qParticles;

    // ── Mouse Orbit Controls ──
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = Math.PI / 3;
    const cameraRadius = 7.8;

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

      sphericalTheta -= deltaX * 0.006;
      sphericalPhi = Math.max(0.2, Math.min(Math.PI - 0.2, sphericalPhi - deltaY * 0.006));

      camera.position.x = cameraRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = cameraRadius * Math.cos(sphericalPhi);
      camera.position.z = cameraRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 0, 0);
    };
    const onMouseUp = () => { isDragging = false; };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // ── Lorenz Dynamic State ──
    let lxA = 0.1, lyA = 0.0, lzA = 0.0;
    let lxB = 0.1 + perturbationRef.current, lyB = 0.0, lzB = 0.0;
    const trailPointsA = [];
    const trailPointsB = [];
    const dt = 0.008;

    // ── Animation Loop ──
    let animationId;
    let simClock = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate Astrolabe rings slowly
      if (astrolabeGroupRef.current) {
        astrolabeGroupRef.current.rotation.y += 0.003;
        astrolabeGroupRef.current.rotation.x = Math.sin(simClock * 0.5) * 0.08;
      }

      const currentMode = modeRef.current;

      // ── MODE 1: CLOCKWORK COSMOS ──
      if (currentMode === 'clockwork') {
        clockworkGroupRef.current.visible = true;
        chaosGroupRef.current.visible = false;
        quantumGroupRef.current.visible = false;

        if (astrolabeGroupRef.current) {
          astrolabeGroupRef.current.position.set(0, 0, 0);
          astrolabeGroupRef.current.scale.set(1, 1, 1);
        }

        if (isPlayingRef.current) {
          simClock += 0.016;
        }

        // Target effective time
        const effectiveTime = simClock + timeOffsetRef.current;
        const fl = forecastLengthRef.current;

        particlesRef.current.forEach((p, idx) => {
          // Analytical reversible bouncing mechanics
          // Position = initial + vel * t folded inside [-BOUNDS, +BOUNDS]
          const curX = calculateBouncedPos(p.initialPos.x, p.initialVel.x, effectiveTime);
          const curY = calculateBouncedPos(p.initialPos.y, p.initialVel.y, effectiveTime);
          const curZ = calculateBouncedPos(p.initialPos.z, p.initialVel.z, effectiveTime);
          p.mesh.position.set(curX, curY, curZ);

          // Forecast path line into future: from effectiveTime to effectiveTime + fl
          const line = forecastLinesRef.current[idx];
          const forecastPts = [];
          const steps = 14;
          for (let s = 0; s <= steps; s++) {
            const ft = effectiveTime + (s / steps) * fl;
            forecastPts.push(
              calculateBouncedPos(p.initialPos.x, p.initialVel.x, ft),
              calculateBouncedPos(p.initialPos.y, p.initialVel.y, ft),
              calculateBouncedPos(p.initialPos.z, p.initialVel.z, ft)
            );
          }
          line.geometry.setAttribute('position', new THREE.Float32BufferAttribute(forecastPts, 3));
          line.geometry.attributes.position.needsUpdate = true;
        });

        // Demon's Eye tracks average particle position
        if (demonEyeRef.current && particlesRef.current.length > 0) {
          const lead = particlesRef.current[0].mesh.position;
          demonEyeRef.current.lookAt(lead.x, lead.y, lead.z);
        }
      }

      // ── MODE 2: DETERMINISTIC CHAOS ──
      else if (currentMode === 'chaos') {
        clockworkGroupRef.current.visible = false;
        chaosGroupRef.current.visible = true;
        quantumGroupRef.current.visible = false;

        if (astrolabeGroupRef.current) {
          astrolabeGroupRef.current.position.set(0, 0, 0);
          astrolabeGroupRef.current.scale.set(1, 1, 1);
        }

        // Step Lorenz equations for Trajectory A & B
        for (let sub = 0; sub < 4; sub++) {
          const dxA = SIGMA * (lyA - lxA) * dt;
          const dyA = (lxA * (RHO - lzA) - lyA) * dt;
          const dzA = (lxA * lyA - BETA * lzA) * dt;
          lxA += dxA; lyA += dyA; lzA += dzA;

          const dxB = SIGMA * (lyB - lxB) * dt;
          const dyB = (lxB * (RHO - lzB) - lyB) * dt;
          const dzB = (lxB * lyB - BETA * lzB) * dt;
          lxB += dxB; lyB += dyB; lzB += dzB;

          // Scale for 3D visualization box
          const scale = 0.11;
          const pA = new THREE.Vector3(lxA * scale, (lzA - 25) * scale, lyA * scale);
          const pB = new THREE.Vector3(lxB * scale, (lzB - 25) * scale, lyB * scale);

          trailPointsA.push(pA);
          trailPointsB.push(pB);

          if (trailPointsA.length > MAX_POINTS) {
            trailPointsA.shift();
            trailPointsB.shift();
          }
        }

        // Update Line Geometries
        const ptsA = new Float32Array(trailPointsA.length * 3);
        const ptsB = new Float32Array(trailPointsB.length * 3);
        for (let i = 0; i < trailPointsA.length; i++) {
          ptsA[i * 3] = trailPointsA[i].x;
          ptsA[i * 3 + 1] = trailPointsA[i].y;
          ptsA[i * 3 + 2] = trailPointsA[i].z;

          ptsB[i * 3] = trailPointsB[i].x;
          ptsB[i * 3 + 1] = trailPointsB[i].y;
          ptsB[i * 3 + 2] = trailPointsB[i].z;
        }

        lorenzLineARef.current.geometry.setAttribute('position', new THREE.BufferAttribute(ptsA, 3));
        lorenzLineBRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(ptsB, 3));
        lorenzLineARef.current.geometry.attributes.position.needsUpdate = true;
        lorenzLineBRef.current.geometry.attributes.position.needsUpdate = true;

        if (trailPointsA.length > 0) {
          const lastA = trailPointsA[trailPointsA.length - 1];
          const lastB = trailPointsB[trailPointsB.length - 1];
          headAMeshRef.current.position.copy(lastA);
          headBMeshRef.current.position.copy(lastB);

          const dist = lastA.distanceTo(lastB);
          setDivergenceDist(+dist.toFixed(4));
        }
      }

      // ── MODE 3: QUANTUM UNCERTAINTY (HEISENBERG SINGLE-SLIT) ──
      else if (currentMode === 'quantum') {
        clockworkGroupRef.current.visible = false;
        chaosGroupRef.current.visible = false;
        quantumGroupRef.current.visible = true;

        if (astrolabeGroupRef.current) {
          // Smoothly elevate the Astrolabe & Demon Eye above the slit apparatus
          astrolabeGroupRef.current.position.set(0, 2.5, -0.8);
          astrolabeGroupRef.current.scale.set(0.7, 0.7, 0.7);
        }

        const sw = slitWidthRef.current;
        // Heisenberg momentum spread ~ hbar / (2 * deltaX)
        const pSpread = Math.max(0.35, 0.48 / sw);
        setUncertaintyRatio(+(pSpread * sw).toFixed(3));

        // 1. Move aperture blades according to sw
        if (slitPlateTopRef.current && slitPlateBottomRef.current) {
          slitPlateTopRef.current.position.y = 1.1 + sw / 2;
          slitPlateBottomRef.current.position.y = -1.1 - sw / 2;
        }

        // 2. Adjust Demon's laser probe cone onto the slit gap
        if (laserMeshRef.current) {
          laserMeshRef.current.scale.set(Math.max(0.35, sw * 1.1), 1, Math.max(0.35, sw * 1.1));
          laserMeshRef.current.material.opacity = 0.22 + Math.min(0.45, 0.2 / sw);
        }

        // 3. Move incoming wavefront rings toward the slit
        if (wavefrontRingsRef.current) {
          wavefrontRingsRef.current.forEach((ring, idx) => {
            const baseX = -3.0 + ((simClock * 1.3 + idx * 0.55) % 2.9);
            ring.position.x = baseX;
            ring.scale.set(1, Math.min(1.2, 0.4 + sw * 0.5), Math.min(1.2, 0.4 + sw * 0.5));
            const distFromSlit = Math.abs(baseX);
            ring.material.opacity = Math.max(0.1, 0.5 - distFromSlit * 0.1);
          });
        }

        // 4. Update Diffraction Fan Rays (Momentum Dispersion)
        const maxSpreadAngle = Math.min(1.18, 0.32 / sw);
        if (diffractionLinesRef.current) {
          diffractionLinesRef.current.forEach((line, k) => {
            const normalizedK = (k - 8) / 8; // -1 to +1
            const angleY = normalizedK * maxSpreadAngle;
            const targetY = 3.18 * Math.tan(angleY);
            const pts = [0, 0, 0, 3.18, targetY, 0];
            line.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
            line.geometry.attributes.position.needsUpdate = true;
            const intensity = Math.pow(Math.cos((Math.PI / 2) * normalizedK), 2);
            line.material.opacity = 0.12 + intensity * 0.48;
          });
        }

        // 5. Update Probability Density Curve on Detector Screen (x = 3.16)
        if (probabilityLineRef.current) {
          const PROB_PTS = 64;
          const pts = new Float32Array(PROB_PTS * 3);
          for (let i = 0; i < PROB_PTS; i++) {
            const yVal = -1.6 + (i / (PROB_PTS - 1)) * 3.2;
            const beta = (Math.PI * sw * yVal) / 0.55;
            const sinc = Math.abs(beta) < 0.001 ? 1.0 : Math.sin(beta) / beta;
            const intensity = sinc * sinc;
            pts[i * 3] = 3.16 - intensity * 0.85;
            pts[i * 3 + 1] = yVal;
            pts[i * 3 + 2] = 0;
          }
          probabilityLineRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(pts, 3));
          probabilityLineRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // 6. Animate Quantum Flying Particles
        if (quantumParticlesRef.current) {
          quantumParticlesRef.current.forEach((p) => {
            p.progress += p.speed;
            if (p.progress > 1.0) {
              p.progress = 0;
              const sample = (Math.random() - 0.5) * 2;
              p.scatterAngleY = sample * maxSpreadAngle * (Math.random() < 0.75 ? 0.7 : 1.0);
              p.scatterAngleZ = (Math.random() - 0.5) * maxSpreadAngle * 0.35;
            }

            const currentX = -3.2 + p.progress * 6.4;
            if (currentX < 0) {
              p.mesh.position.set(
                currentX,
                p.yOffset * (sw * 0.6),
                p.zOffset * (sw * 0.6)
              );
            } else {
              const distPastSlit = currentX;
              p.mesh.position.set(
                currentX,
                distPastSlit * Math.tan(p.scatterAngleY),
                distPastSlit * Math.tan(p.scatterAngleZ)
              );
            }
          });
        }

        // 7. Demon Eye gazes down at the slit measurement point
        if (demonEyeRef.current) {
          demonEyeRef.current.lookAt(0, 0, 0);
        }

        simClock += 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 560;
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

  // Calculate triangular folded position for reversible bounce
  const calculateBouncedPos = (init, vel, t) => {
    const raw = init + vel * t;
    const period = BOUNDS * 4;
    let mod = ((raw + BOUNDS) % period + period) % period;
    if (mod < BOUNDS * 2) {
      return mod - BOUNDS;
    } else {
      return BOUNDS * 3 - mod;
    }
  };

  // ── Reset or Trigger Telemetry Run ──
  const handleRecordRun = useCallback(() => {
    recordConceptRun('laplaces-demon', 'single', {
      mode: activeMode,
      determinismScore,
      timeOffset,
      perturbation,
      slitWidth,
      divergenceDist,
    });
    setHasRecorded(true);
    setTimeout(() => setHasRecorded(false), 2400);
  }, [activeMode, determinismScore, timeOffset, perturbation, slitWidth, divergenceDist]);

  return (
    <div className={styles.labContainer} data-testid="laplaces-demon-3d-lab">
      <div className={styles.canvasContainer}>
        {/* Top Floating Header */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="compass" size={13} />
              <span>Moral & Metaphysical Determinism</span>
            </div>
            <h2 className={styles.labTitle}>Laplace&apos;s Demon — The All-Seeing Intellect</h2>
          </div>

          <div
            className={`${styles.intellectScoreBox} ${
              determinismScore < 50 ? styles.intellectScoreBoxBroken : ''
            }`}
          >
            <span className={styles.intellectLabel}>Demon Predictability</span>
            <span
              className={`${styles.intellectValue} ${
                determinismScore < 50 ? styles.intellectValueBroken : ''
              }`}
            >
              {determinismScore}%
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className={styles.modeTabs}>
          <button
            type="button"
            className={`${styles.modeTab} ${activeMode === 'clockwork' ? styles.modeTabActive : ''}`}
            onClick={() => setActiveMode('clockwork')}
          >
            <Icon name="clock" size={14} />
            <span>1. Classical Clockwork (1814)</span>
          </button>
          <button
            type="button"
            className={`${styles.modeTab} ${activeMode === 'chaos' ? styles.modeTabActive : ''}`}
            onClick={() => setActiveMode('chaos')}
          >
            <Icon name="zap" size={14} />
            <span>2. Deterministic Chaos (1963)</span>
          </button>
          <button
            type="button"
            className={`${styles.modeTab} ${activeMode === 'quantum' ? styles.modeTabActive : ''}`}
            onClick={() => setActiveMode('quantum')}
          >
            <Icon name="atom" size={14} />
            <span>3. Quantum Uncertainty (1927)</span>
          </button>
        </div>

        {/* 3D WebGL Canvas */}
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Floating Stage Badges in Quantum Mode */}
        {activeMode === 'quantum' && (
          <div className={styles.quantumStageIndicators}>
            <div className={`${styles.quantumStageBadge} ${styles.stageHighlight}`}>
              <Icon name="atom" size={12} />
              <span>1. Coherent Wave Source</span>
            </div>
            <div className={`${styles.quantumStageBadge} ${styles.stageHighlightCenter}`}>
              <Icon name="compass" size={12} />
              <span>2. Demon Slit (Δx = {slitWidth.toFixed(2)} nm)</span>
            </div>
            <div className={`${styles.quantumStageBadge} ${styles.stageHighlightEnd}`}>
              <Icon name="zap" size={12} />
              <span>3. Momentum Scatter Fan (Δp)</span>
            </div>
          </div>
        )}

        {/* Floating Telemetry Badge */}
        <div className={styles.statusFloatingOverlay}>
          <div className={determinismScore > 50 ? styles.pulseDot : styles.pulseDotWarn} />
          <span>{statusMessage}</span>
        </div>
      </div>

      {/* Control Console */}
      <div className={styles.controlPanel}>
        {/* Mode 1: Clockwork Controls */}
        {activeMode === 'clockwork' && (
          <div className={styles.controlRow}>
            <div className={styles.sliderCard}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>Time Direction Scrub (Reversibility)</span>
                <span className={styles.sliderValue}>
                  {timeOffset > 0 ? `+${timeOffset.toFixed(1)}s (Future)` : timeOffset < 0 ? `${timeOffset.toFixed(1)}s (Past)` : '0.0s (Present)'}
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.2"
                value={timeOffset}
                onChange={(e) => setTimeOffset(parseFloat(e.target.value))}
                className={styles.rangeInput}
              />
              <p className={styles.sliderDesc}>
                Under classical Newtonian mechanics, differential equations are time-symmetric (t → -t). Dragging left reverses history with zero information loss.
              </p>
            </div>

            <div className={styles.sliderCard}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>Trajectory Forecast Horizon</span>
                <span className={styles.sliderValue}>{forecastLength.toFixed(1)}s ahead</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.5"
                value={forecastLength}
                onChange={(e) => setForecastLength(parseFloat(e.target.value))}
                className={styles.rangeInput}
              />
              <p className={styles.sliderDesc}>
                Demon computes exact future coordinate vectors. The golden trajectory cones reflect perfect deterministic certainty.
              </p>
            </div>
          </div>
        )}

        {/* Mode 2: Chaos Butterfly Controls */}
        {activeMode === 'chaos' && (
          <div className={styles.controlRow}>
            <div className={styles.sliderCard}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>Initial Perturbation (Δ₀)</span>
                <span className={styles.sliderValue}>{perturbation.toExponential(2)}</span>
              </div>
              <input
                type="range"
                min="0.00001"
                max="0.01"
                step="0.00005"
                value={perturbation}
                onChange={(e) => setPerturbation(parseFloat(e.target.value))}
                className={styles.rangeInput}
              />
              <p className={styles.sliderDesc}>
                Edward Lorenz showed that even with deterministic laws, two states differing by a rounding error at the 10th decimal place exponentially diverge (Δ(t) ~ Δ₀ · e^(λt)).
              </p>
            </div>

            <div className={styles.sliderCard}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>Phase-Space Trajectory Separation</span>
                <span className={styles.sliderValue} style={{ color: divergenceDist > 1.5 ? '#ef4444' : '#e5a93c' }}>
                  {divergenceDist.toFixed(3)} units
                </span>
              </div>
              <p className={styles.sliderDesc}>
                Golden trajectory vs Cyan trajectory. Initially identical, the two paths violently decouple into different wings of the strange attractor.
              </p>
            </div>
          </div>
        )}

        {/* Mode 3: Quantum Uncertainty Controls */}
        {activeMode === 'quantum' && (
          <>
            <div className={styles.presetContainer}>
              <span className={styles.presetLabel}>Demon Measurement Scenarios</span>
              <div className={styles.presetRow}>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${slitWidth <= 0.3 ? styles.presetBtnActive : ''}`}
                  onClick={() => setSlitWidth(0.20)}
                >
                  <Icon name="zap" size={13} />
                  <span>Pinpoint Position (Δx = 0.20 nm) → Momentum Explodes</span>
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${slitWidth > 0.6 && slitWidth < 1.0 ? styles.presetBtnActive : ''}`}
                  onClick={() => setSlitWidth(0.80)}
                >
                  <Icon name="compass" size={13} />
                  <span>Balanced State (Δx = 0.80 nm)</span>
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${slitWidth >= 1.5 ? styles.presetBtnActive : ''}`}
                  onClick={() => setSlitWidth(1.60)}
                >
                  <Icon name="layers" size={13} />
                  <span>Wide Slit (Δx = 1.60 nm) → Focused Beam, Unknown Origin</span>
                </button>
              </div>
            </div>

            <div className={styles.controlRow}>
              <div className={styles.sliderCard}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Demon Position Measurement Slit (Δx)</span>
                  <span className={styles.sliderValue}>{slitWidth.toFixed(2)} nm</span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="1.8"
                  step="0.05"
                  value={slitWidth}
                  onChange={(e) => setSlitWidth(parseFloat(e.target.value))}
                  className={styles.rangeInput}
                />
                <p className={styles.sliderDesc}>
                  Werner Heisenberg proved that Δx · Δp ≥ ℏ/2. Narrowing the measurement slit to pinpoint where a particle is obliterates knowledge of where it is going.
                </p>
              </div>

              <div className={styles.sliderCard}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Heisenberg Constant Product</span>
                  <span className={styles.sliderValue}>{uncertaintyRatio} ℏ</span>
                </div>
                <p className={styles.sliderDesc}>
                  At the quantum scale, precise initial conditions do not exist in nature. The Demon cannot compute the future because the input data physically does not exist.
                </p>
              </div>
            </div>

            <div className={styles.quantumInequalityBox}>
              <div className={styles.inequalityFormula}>
                Δx ({slitWidth.toFixed(2)} nm) · Δp ({(0.48 / slitWidth).toFixed(2)} ℏ/nm) ≥ ℏ/2
              </div>
              <div className={styles.inequalityExplain}>
                {slitWidth <= 0.3
                  ? '⚠️ Demon squeezed position: Δx is tightly pinned, but diffracted momentum Δp is wildly scattered. Future position on the screen is completely indeterminate.'
                  : slitWidth >= 1.4
                  ? 'ℹ️ Wide aperture: particles continue forward in a narrow beam, but the Demon has no precise starting position coordinate to begin computation.'
                  : '⚖️ Standard quantum diffraction: position uncertainty and momentum uncertainty balance according to wave mechanics.'}
              </div>
            </div>

            <div className={styles.quantumPedagogyGrid}>
              <div className={styles.pedagogyCard}>
                <span className={styles.pedagogyStep}>Act I · 1814 Clockwork</span>
                <h4 className={styles.pedagogyTitle}>Laplace&apos;s Assumption</h4>
                <p className={styles.pedagogyText}>
                  Assumed every atom in the universe has a simultaneously exact position (x) and momentum (p), like predictable clockwork billiard balls.
                </p>
              </div>
              <div className={styles.pedagogyCard}>
                <span className={styles.pedagogyStep}>Act II · 1963 Chaos</span>
                <h4 className={styles.pedagogyTitle}>The Butterfly Crack</h4>
                <p className={styles.pedagogyText}>
                  Showed that a rounding error at the 10th decimal place doubles exponentially. But Laplace could still argue: &quot;My Demon has infinite computing precision!&quot;
                </p>
              </div>
              <div className={styles.pedagogyCard}>
                <span className={styles.pedagogyStep}>Act III · 1927 Quantum</span>
                <h4 className={styles.pedagogyTitle}>The Fatal Guillotine</h4>
                <p className={styles.pedagogyText}>
                  Heisenberg proved nature does not possess simultaneous (x, p). Squeezing position explodes momentum. The initial data Laplace needs does not physically exist!
                </p>
              </div>
            </div>
          </>
        )}

        {/* Philosophical Insight Card */}
        <div className={styles.insightCard}>
          <strong>The Philosophical Dilemma:</strong> If Laplace was right, every crime, heroism, and thought was pre-ordained at the Big Bang, invalidating moral culpability. If quantum mechanics or chaos reigns, absolute determinism dies, yet pure randomness does not grant intentional free agency either.
        </div>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <div className={styles.actionBtnGroup}>
            {activeMode === 'clockwork' && (
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <Icon name={isPlaying ? 'pause' : 'play'} size={14} />
                <span>{isPlaying ? 'Freeze Determinism' : 'Resume Determinism'}</span>
              </button>
            )}

            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleRecordRun}
            >
              <Icon name="zap" size={14} />
              <span>Record Intellect Telemetry</span>
            </button>
          </div>

          {hasRecorded && (
            <span className={styles.actionFeedback}>
              <Icon name="check" size={14} />
              <span>State Run Recorded to Cloud Database</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
