'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import Icon from '@/components/common/Icon';
import Button from '@/components/ui/Button/Button';
import styles from './PhysicsSimulation3D.module.css';

const THEORIES = [
  {
    id: 'novikov',
    title: '1. Novikov Self-Consistency',
    principle: 'Deterministic Closed Loop',
    description: 'Any intervention in the past was already part of history. The probability of an inconsistent timeline is identically zero.',
    outcome: 'Intervention probability: 0% paradox. Your action inadvertently causes the exact ancestral meeting. Causal loop is 100% invariant.',
    stability: 100,
    color: '#34d399',
    icon: 'check',
  },
  {
    id: 'many-worlds',
    title: '2. Many-Worlds Branching',
    principle: 'Everettian Quantum Multiverse',
    description: 'Entering the past bifurcates the universal wave function. Grandfather is eliminated in Timeline B; Timeline A remains untouched.',
    outcome: 'Zero paradox. Timeline bifurcates into orthogonal Hilbert branches. Traveler becomes a temporal castaway in Branch B.',
    stability: 100,
    color: '#60a5fa',
    icon: 'network',
  },
  {
    id: 'hawking',
    title: '3. Chronology Protection',
    principle: 'Quantum Vacuum Instability',
    description: 'Virtual vacuum fluctuations circulating through the wormhole build up infinite stress-energy (T_μν → ∞), crushing the throat.',
    outcome: 'Backwards time travel physically prohibited. Wormhole collapses into a black hole before event horizon can be crossed.',
    stability: 100,
    color: '#e5a93c',
    icon: 'alert',
  },
  {
    id: 'classical',
    title: '4. Classical Paradox (Oscillation)',
    principle: 'Marty McFly Causal Limit Cycle',
    description: 'Grandfather eliminated → parent never born → traveler ceases to exist → nobody travels back → grandfather survives → infinite oscillation.',
    outcome: 'Critical Causal Singularity! System enters continuous existence/non-existence feedback oscillation. Stability drops to 0%.',
    stability: 0,
    color: '#ef4444',
    icon: 'refresh',
  },
];

export default function GrandfatherSpacetime3D() {
  const mountRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Simulation State
  const [simMode, setSimMode] = useState('lineage'); // 'lineage' or 'polchinski'
  const [selectedTheory, setSelectedTheory] = useState('novikov');
  const [showInstructions, setShowInstructions] = useState(true);
  const [interventionState, setInterventionState] = useState('idle'); // 'idle', 'traveling', 'resolving', 'oscillating'
  const [targetYear, setTargetYear] = useState(1950);
  const [billiardMode, setBilliardMode] = useState('grazing'); // 'grazing' or 'headon'
  const [telemetry, setTelemetry] = useState({
    stability: 100,
    grandfatherVitality: 100,
    parentVitality: 100,
    travelerVitality: 100,
    cycleCount: 0,
    statusText: 'Timeline in coherent steady-state geodesic.',
  });

  const activeTheory = THEORIES.find((t) => t.id === selectedTheory);

  // Web Audio Synthesizer for Time Travel & Paradox Sounds
  const playSound = useCallback((type) => {
    try {
      if (typeof window === 'undefined') return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (type === 'portal') {
        // Sci-Fi resonant whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.45);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.85);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.85);
      } else if (type === 'paradox_alert') {
        // Urgent warning pulse
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'loop_lock') {
        // Harmonic golden chime
        [330, 440, 660].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.6);
        });
      } else if (type === 'clack') {
        // Billiard ball impact clack
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch {
      // AudioContext policy fallback
    }
  }, []);

  // Execution trigger
  const handleExecuteAction = useCallback(() => {
    if (interventionState === 'traveling') return;

    if (simMode === 'lineage') {
      playSound('portal');
      setInterventionState('traveling');

      setTimeout(() => {
        if (selectedTheory === 'classical') {
          playSound('paradox_alert');
          setInterventionState('oscillating');
        } else if (selectedTheory === 'novikov') {
          playSound('loop_lock');
          setInterventionState('resolving');
        } else if (selectedTheory === 'many-worlds') {
          playSound('loop_lock');
          setInterventionState('resolving');
        } else if (selectedTheory === 'hawking') {
          playSound('paradox_alert');
          setInterventionState('resolving');
        }
      }, 1200);
    } else {
      // Polchinski Ball Mode
      playSound('clack');
      setInterventionState('traveling');
      setTimeout(() => {
        playSound('clack');
        setInterventionState('resolving');
      }, 1400);
    }
  }, [interventionState, simMode, selectedTheory, playSound]);

  // Reset experiment
  const handleReset = useCallback(() => {
    setInterventionState('idle');
    setTelemetry({
      stability: 100,
      grandfatherVitality: 100,
      parentVitality: 100,
      travelerVitality: 100,
      cycleCount: 0,
      statusText: 'Timeline in coherent steady-state geodesic.',
    });
  }, []);

  // Keyboard controls (Space to execute, R to reset, 1-4 for theories)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleExecuteAction();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      } else if (e.code === 'Digit1') {
        setSelectedTheory('novikov');
      } else if (e.code === 'Digit2') {
        setSelectedTheory('many-worlds');
      } else if (e.code === 'Digit3') {
        setSelectedTheory('hawking');
      } else if (e.code === 'Digit4') {
        setSelectedTheory('classical');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExecuteAction, handleReset]);

  // Three.js Render Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth;
    const height = 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080a0f);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 9.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Orbit Drag state
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let cameraAngle = { theta: 0, phi: 0.45, radius: 10.5 };

    const updateCamera = () => {
      camera.position.x = cameraAngle.radius * Math.sin(cameraAngle.theta) * Math.cos(cameraAngle.phi);
      camera.position.y = cameraAngle.radius * Math.sin(cameraAngle.phi);
      camera.position.z = cameraAngle.radius * Math.cos(cameraAngle.theta) * Math.cos(cameraAngle.phi);
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };
      cameraAngle.theta -= dx * 0.008;
      cameraAngle.phi = Math.max(0.1, Math.min(1.4, cameraAngle.phi + dy * 0.008));
      updateCamera();
    };
    const onPointerUp = () => {
      isDragging = false;
    };
    const onWheel = (e) => {
      e.preventDefault();
      cameraAngle.radius = Math.max(6, Math.min(18, cameraAngle.radius + e.deltaY * 0.015));
      updateCamera();
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Scene Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe5a93c, 1.2);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    // Spacetime Grid Floor (Minkowski coordinates)
    const gridHelper = new THREE.GridHelper(16, 24, 0x222638, 0x141724);
    gridHelper.position.y = -2.5;
    scene.add(gridHelper);

    // ──────────────────────────────────────────────────────────────────────────
    // MODE A: LINEAGE & CAUSAL PARADOX STAGE
    // ──────────────────────────────────────────────────────────────────────────
    const lineageGroup = new THREE.Group();
    scene.add(lineageGroup);

    // 1. Generation Nodes
    const grandfatherPos = new THREE.Vector3(-2.8, -1.5, 0);
    const parentPos = new THREE.Vector3(0, 0, 0);
    const travelerPos = new THREE.Vector3(2.8, 1.5, 0);

    const createGenNode = (pos, color, labelText) => {
      const group = new THREE.Group();
      group.position.copy(pos);

      // Core sphere
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 24, 20),
        new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.45,
          roughness: 0.3,
          metalness: 0.6,
        })
      );
      group.add(sphere);

      // Outer aura ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.48, 0.025, 12, 32),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.6 })
      );
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      return { group, sphere, ring };
    };

    const gfNode = createGenNode(grandfatherPos, 0x10b981, 'Grandfather (1950)');
    const parentNode = createGenNode(parentPos, 0x3b82f6, 'Parent (1975)');
    const travelerNode = createGenNode(travelerPos, 0xe5a93c, 'Traveler (2026)');

    lineageGroup.add(gfNode.group);
    lineageGroup.add(parentNode.group);
    lineageGroup.add(travelerNode.group);

    // 2. Primary Worldline Tube (Original History: Grandfather → Parent → Traveler)
    const worldlineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.8, -1.5, 0),
      new THREE.Vector3(-1.4, -0.7, 0.2),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.4, 0.7, -0.2),
      new THREE.Vector3(2.8, 1.5, 0),
    ]);
    const worldlineMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const worldlineMesh = new THREE.Mesh(
      new THREE.TubeGeometry(worldlineCurve, 48, 0.07, 12, false),
      worldlineMat
    );
    lineageGroup.add(worldlineMesh);

    // 3. Wormhole Throat Conduit (2026 → 1950)
    const wormholeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.8, 1.5, 0),
      new THREE.Vector3(1.8, 2.4, -1.8),
      new THREE.Vector3(0, 1.2, -2.6),
      new THREE.Vector3(-1.8, -0.4, -1.8),
      new THREE.Vector3(-2.8, -1.5, 0),
    ]);
    const wormholeMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.6,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const wormholeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(wormholeCurve, 64, 0.16, 16, false),
      wormholeMat
    );
    lineageGroup.add(wormholeMesh);

    // Wormhole Mouth Rings
    const mouthFuture = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.045, 16, 32),
      new THREE.MeshBasicMaterial({ color: 0xe5a93c })
    );
    mouthFuture.position.copy(travelerPos);
    mouthFuture.lookAt(1.8, 2.4, -1.8);
    lineageGroup.add(mouthFuture);

    const mouthPast = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.045, 16, 32),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    );
    mouthPast.position.copy(grandfatherPos);
    mouthPast.lookAt(-1.8, -0.4, -1.8);
    lineageGroup.add(mouthPast);

    // 4. Chrono Traveler Probe Particle
    const probeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const probeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), probeMat);
    probeMesh.visible = false;
    lineageGroup.add(probeMesh);

    // Alternate Many-Worlds Branch Tube (Timeline B)
    const branchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.8, -1.5, 0),
      new THREE.Vector3(-1.2, -0.4, 1.8),
      new THREE.Vector3(0.5, 0.6, 2.6),
      new THREE.Vector3(2.2, 1.6, 3.2),
    ]);
    const branchMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xdb2777,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0,
    });
    const branchMesh = new THREE.Mesh(
      new THREE.TubeGeometry(branchCurve, 40, 0.06, 12, false),
      branchMat
    );
    lineageGroup.add(branchMesh);

    // 5. Novikov Golden Möbius Ring Loop
    const mobiusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.8, -1.5, 0),
      new THREE.Vector3(-1.0, -1.8, 1.2),
      new THREE.Vector3(0, -0.6, 0.6),
      new THREE.Vector3(1.2, 0.5, 0.8),
      new THREE.Vector3(2.8, 1.5, 0),
      new THREE.Vector3(1.8, 2.4, -1.8),
      new THREE.Vector3(0, 1.2, -2.6),
      new THREE.Vector3(-1.8, -0.4, -1.8),
      new THREE.Vector3(-2.8, -1.5, 0),
    ]);
    const mobiusMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0,
    });
    const mobiusMesh = new THREE.Mesh(
      new THREE.TubeGeometry(mobiusCurve, 64, 0.08, 12, true),
      mobiusMat
    );
    lineageGroup.add(mobiusMesh);

    // ──────────────────────────────────────────────────────────────────────────
    // MODE B: POLCHINSKI'S BILLIARD BALL WORMHOLE STAGE
    // ──────────────────────────────────────────────────────────────────────────
    const billiardGroup = new THREE.Group();
    billiardGroup.visible = false;
    scene.add(billiardGroup);

    // Pool Table Bed
    const tableGeo = new THREE.BoxGeometry(8.2, 0.3, 5.2);
    const feltMat = new THREE.MeshStandardMaterial({
      color: 0x0f2b1d,
      roughness: 0.8,
      metalness: 0.1,
    });
    const tableMesh = new THREE.Mesh(tableGeo, feltMat);
    tableMesh.position.y = -0.15;
    billiardGroup.add(tableMesh);

    // Wooden Cushion Rails
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x3d2314,
      roughness: 0.4,
      metalness: 0.3,
    });
    const railNorth = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.4, 0.25), railMat);
    railNorth.position.set(0, 0.15, -2.6);
    billiardGroup.add(railNorth);

    const railSouth = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.4, 0.25), railMat);
    railSouth.position.set(0, 0.15, 2.6);
    billiardGroup.add(railSouth);

    const railWest = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, 5.2), railMat);
    railWest.position.set(-4.15, 0.15, 0);
    billiardGroup.add(railWest);

    const railEast = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, 5.2), railMat);
    railEast.position.set(4.15, 0.15, 0);
    billiardGroup.add(railEast);

    // Wormhole Mouths on Billiard Table
    // Mouth A: Past Exit (Left)
    const mouthAPos = new THREE.Vector3(-2.6, 0.02, 0.8);
    const mouthAMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.04, 32),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    );
    mouthAMesh.position.copy(mouthAPos);
    billiardGroup.add(mouthAMesh);

    // Mouth B: Future Entrance (Right)
    const mouthBPos = new THREE.Vector3(2.6, 0.02, -0.8);
    const mouthBMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.04, 32),
      new THREE.MeshBasicMaterial({ color: 0x9333ea })
    );
    mouthBMesh.position.copy(mouthBPos);
    billiardGroup.add(mouthBMesh);

    // Younger Ball (Shooting toward Mouth B)
    const ballYoungMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.1,
    });
    const ballYoung = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 20), ballYoungMat);
    ballYoung.position.set(-1.0, 0.2, 1.8);
    billiardGroup.add(ballYoung);

    // Older Ball (Emerging from Mouth A)
    const ballOldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.2,
      transparent: true,
      opacity: 0,
    });
    const ballOld = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 20), ballOldMat);
    ballOld.position.copy(mouthAPos);
    ballOld.position.y = 0.2;
    billiardGroup.add(ballOld);

    // ──────────────────────────────────────────────────────────────────────────
    // ANIMATION LOOP & SIMULATION SOLVER
    // ──────────────────────────────────────────────────────────────────────────
    let animId;
    let clock = new THREE.Clock();
    let travelProgress = 0;
    let oscillationTimer = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Visibility based on Sim Mode
      lineageGroup.visible = simMode === 'lineage';
      billiardGroup.visible = simMode === 'polchinski';

      if (simMode === 'lineage') {
        // Subtle ambient pulsing of generation nodes
        gfNode.ring.rotation.z += 0.02;
        parentNode.ring.rotation.z += 0.02;
        travelerNode.ring.rotation.z += 0.02;
        mouthFuture.rotation.z += 0.03;
        mouthPast.rotation.z += 0.03;

        // Dynamics according to Intervention State
        if (interventionState === 'idle') {
          probeMesh.visible = false;
          worldlineMat.opacity = 0.85;
          branchMat.opacity = 0;
          mobiusMat.opacity = 0;
          gfNode.sphere.material.color.setHex(0x10b981);
          parentNode.sphere.material.color.setHex(0x3b82f6);
          travelerNode.sphere.material.color.setHex(0xe5a93c);
        } else if (interventionState === 'traveling') {
          // Probe jumps from 2026 back through wormhole curve down to 1950
          probeMesh.visible = true;
          travelProgress = Math.min(1, travelProgress + delta * 0.8);
          const pt = wormholeCurve.getPoint(travelProgress);
          probeMesh.position.copy(pt);
          wormholeMat.opacity = 0.95;
        } else if (interventionState === 'resolving') {
          probeMesh.visible = false;
          travelProgress = 0;

          if (selectedTheory === 'novikov') {
            // Predestination loop locked into unbroken golden ribbon
            mobiusMat.opacity = Math.min(0.95, mobiusMat.opacity + delta * 1.5);
            worldlineMat.opacity = 0.35;
            gfNode.sphere.material.color.setHex(0xf59e0b);
            travelerNode.sphere.material.color.setHex(0xf59e0b);
          } else if (selectedTheory === 'many-worlds') {
            // Timeline bifurcates into pink/cyan branches
            branchMat.opacity = Math.min(0.9, branchMat.opacity + delta * 1.5);
            worldlineMat.opacity = 0.6;
          } else if (selectedTheory === 'hawking') {
            // Wormhole collapses
            wormholeMat.opacity = Math.max(0.1, wormholeMat.opacity - delta * 2.0);
            worldlineMat.opacity = 0.85;
          }
        } else if (interventionState === 'oscillating') {
          // Classical Paradox Limit-Cycle: Grandfather dies → Traveler fades → Grandfather returns → Traveler returns
          oscillationTimer += delta * 2.5;
          const cyclePhase = Math.sin(oscillationTimer);

          if (cyclePhase > 0) {
            // Elimination phase: Grandfather dead, traveler fading out
            gfNode.sphere.material.color.setHex(0xef4444);
            parentNode.sphere.material.color.setHex(0x475569);
            travelerNode.sphere.material.color.setHex(0x475569);
            travelerNode.sphere.material.opacity = 0.2;
            worldlineMat.opacity = 0.15;
          } else {
            // Restoration phase: Grandfather survives, traveler restored
            gfNode.sphere.material.color.setHex(0x10b981);
            parentNode.sphere.material.color.setHex(0x3b82f6);
            travelerNode.sphere.material.color.setHex(0xe5a93c);
            travelerNode.sphere.material.opacity = 1.0;
            worldlineMat.opacity = 0.85;
          }
        }
      } else {
        // Polchinski Ball Mode Animation
        if (interventionState === 'traveling') {
          // Ball rolling toward Mouth B
          travelProgress = Math.min(1, travelProgress + delta * 0.75);

          // Younger ball moves from start (-1, 1.8) toward (1.2, 0.4)
          ballYoung.position.x = -1.0 + travelProgress * 2.2;
          ballYoung.position.z = 1.8 - travelProgress * 1.4;

          // Older ball emerges from Mouth A (-2.6, 0.8) toward intercept
          ballOldMat.opacity = Math.min(1, travelProgress * 2);
          ballOld.position.x = mouthAPos.x + travelProgress * 3.8;
          ballOld.position.z = mouthAPos.z - travelProgress * 0.4;
        } else if (interventionState === 'resolving') {
          if (billiardMode === 'grazing') {
            // Novikov glancing collision: Deflection angle is subtle and enters Mouth B
            ballYoung.position.x = Math.min(mouthBPos.x, ballYoung.position.x + delta * 1.2);
            ballYoung.position.z = Math.max(mouthBPos.z, ballYoung.position.z - delta * 0.5);
            ballOld.position.x += delta * 1.4;
            ballOld.position.z += delta * 0.2;
          } else {
            // Head-On paradox collision: Younger ball knocked off course, older ball dissolves
            ballYoung.position.x += delta * 0.4;
            ballYoung.position.z += delta * 2.2; // deflected away from Mouth B!
            ballOldMat.opacity = Math.max(0, ballOldMat.opacity - delta * 2);
          }
        } else {
          // Reset
          travelProgress = 0;
          ballYoung.position.set(-1.0, 0.2, 1.8);
          ballOld.position.copy(mouthAPos);
          ballOld.position.y = 0.2;
          ballOldMat.opacity = 0;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [simMode, selectedTheory, interventionState, billiardMode]);

  return (
    <div className={styles.container}>
      {/* Simulation Header */}
      <div className={styles.header}>
        <div className={styles.badge}>
          <Icon name="atom" size={13} color="var(--color-brand-primary)" />
          <span>Spacetime Causality Lab</span>
        </div>
        <h3 className={styles.title}>Grandfather Paradox: Causal Resolution Engine</h3>
        <p className={styles.subtitle}>
          Rotate the 3D Minkowski manifold, test how backward time travel interacts with ancestral lineages, and witness how modern physics resolves the grandfather paradox.
        </p>
      </div>

      {/* Dual Simulation Mode Switcher */}
      <div className={styles.modeTabs}>
        <button
          className={`${styles.modeTab} ${simMode === 'lineage' ? styles.activeModeTab : ''}`}
          onClick={() => {
            setSimMode('lineage');
            handleReset();
          }}
        >
          <Icon name="users" size={14} />
          <span>Mode A: Causal Lineage Engine (Barjavel Paradox)</span>
        </button>
        <button
          className={`${styles.modeTab} ${simMode === 'polchinski' ? styles.activeModeTab : ''}`}
          onClick={() => {
            setSimMode('polchinski');
            handleReset();
          }}
        >
          <Icon name="zap" size={14} />
          <span>Mode B: Polchinski's Billiard Wormhole (Physics Model)</span>
        </button>
      </div>

      {/* 3D Viewport with HUD Overlays */}
      <div className={styles.canvasWrapper}>
        <div ref={mountRef} className={styles.canvasMount} />

        {/* Orbit Hint */}
        <div className={styles.canvasOverlay}>
          <div className={styles.orbitHint}>
            <Icon name="compass" size={13} />
            <span>Drag to rotate 4D manifold • Scroll to zoom</span>
          </div>

          {/* Collapsible Experiment Guide HUD */}
          <div className={styles.instructionCard}>
            <div className={styles.instructionHeader}>
              <div className={styles.instructionTitle}>
                <Icon name="help-circle" size={13} />
                <span>Experiment Guide</span>
              </div>
              <button
                type="button"
                className={styles.instructionToggle}
                onClick={() => setShowInstructions(!showInstructions)}
                title={showInstructions ? 'Minimize guide' : 'Expand guide'}
              >
                {showInstructions ? 'Hide' : 'Show'}
              </button>
            </div>

            {showInstructions && (
              <ul className={styles.instructionList}>
                {simMode === 'lineage' ? (
                  <>
                    <li>
                      <span>1.</span>
                      <span><strong>Spacetime Worldlines:</strong> Green node is Grandfather <span className={styles.keyBadge}>1950</span>, Blue is Parent <span className={styles.keyBadge}>1975</span>, Amber is Traveler <span className={styles.keyBadge}>2026</span>. The purple conduit is the retrocausal wormhole.</span>
                    </li>
                    <li>
                      <span>2.</span>
                      <span><strong>Execute Intervention:</strong> Click <strong>Execute Temporal Intervention</strong> or press <span className={styles.keyBadge}>Space</span> to voyage backward and attempt to alter history.</span>
                    </li>
                    <li>
                      <span>3.</span>
                      <span><strong>Compare Theories:</strong> Switch theories (<span className={styles.keyBadge}>1 – 4</span>) to observe Novikov loop-locking, Everett Multiverse branching, or Classical McFly oscillation!</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <span>1.</span>
                      <span><strong>The Setup:</strong> Billiard ball rolls toward Future Wormhole Mouth B; emerges in the past from Mouth A on a collision course with its younger self.</span>
                    </li>
                    <li>
                      <span>2.</span>
                      <span><strong>Novikov Grazing:</strong> The exiting ball delivers a glancing blow <span className={styles.keyBadge}>2.5°</span> that deflects the younger ball <em>just enough</em> to enter Mouth B and exit to deliver that exact blow!</span>
                    </li>
                    <li>
                      <span>3.</span>
                      <span><strong>Paradox Head-On:</strong> Older ball strikes younger ball head-on, deflecting it away from Mouth B. Without entering, the older ball vanishes in a paradox singularity!</span>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Mode A Controls: Theory Selector */}
      {simMode === 'lineage' && (
        <div className={styles.theoriesContainer}>
          {THEORIES.map((theory) => (
            <button
              key={theory.id}
              onClick={() => {
                setSelectedTheory(theory.id);
                handleReset();
              }}
              className={`${styles.theoryCardBtn} ${selectedTheory === theory.id ? styles.activeTheoryCard : ''}`}
              style={{ '--theory-accent': theory.color }}
            >
              <div className={styles.theoryTitleRow}>
                <Icon name={theory.icon} size={14} color={theory.color} />
                <span>{theory.title}</span>
              </div>
              <div className={styles.theorySubtitle}>{theory.principle}</div>
            </button>
          ))}
        </div>
      )}

      {/* Mode B Controls: Collision Type */}
      {simMode === 'polchinski' && (
        <div className={styles.theoriesContainer}>
          <button
            onClick={() => {
              setBilliardMode('grazing');
              handleReset();
            }}
            className={`${styles.theoryCardBtn} ${billiardMode === 'grazing' ? styles.activeTheoryCard : ''}`}
            style={{ '--theory-accent': '#34d399' }}
          >
            <div className={styles.theoryTitleRow}>
              <Icon name="check" size={14} color="#34d399" />
              <span>Novikov Self-Consistent Grazing Strike</span>
            </div>
            <div className={styles.theorySubtitle}>Glancing 2.5° deflection maintains 100% causal consistency</div>
          </button>

          <button
            onClick={() => {
              setBilliardMode('headon');
              handleReset();
            }}
            className={`${styles.theoryCardBtn} ${billiardMode === 'headon' ? styles.activeTheoryCard : ''}`}
            style={{ '--theory-accent': '#ef4444' }}
          >
            <div className={styles.theoryTitleRow}>
              <Icon name="alert" size={14} color="#ef4444" />
              <span>Head-On Paradoxical Collision</span>
            </div>
            <div className={styles.theorySubtitle}>Ball knocks younger self away → never enters wormhole → paradox!</div>
          </button>
        </div>
      )}

      {/* Dynamic Telemetry & Paradox Status Cards */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Temporal Stability Index</div>
          <div
            className={styles.statValue}
            style={{
              color:
                selectedTheory === 'classical' && interventionState === 'oscillating'
                  ? '#ef4444'
                  : activeTheory.color,
            }}
          >
            {selectedTheory === 'classical' && interventionState === 'oscillating' ? '0% (PARADOX)' : '100%'}
          </div>
          <div className={styles.stabilityMeter}>
            <div
              className={styles.stabilityFill}
              style={{
                width:
                  selectedTheory === 'classical' && interventionState === 'oscillating'
                    ? '10%'
                    : '100%',
                backgroundColor:
                  selectedTheory === 'classical' && interventionState === 'oscillating'
                    ? '#ef4444'
                    : activeTheory.color,
              }}
            />
          </div>
          <div className={styles.statFormula}>
            {selectedTheory === 'classical' && interventionState === 'oscillating'
              ? 'Temporal Limit-Cycle in Progress'
              : 'Lorentzian Geodesic Invariant'}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Causal Topology Status</div>
          <div className={styles.statValueOutcome}>
            {simMode === 'lineage' ? (
              interventionState === 'idle'
                ? 'Coherent Steady-State'
                : interventionState === 'traveling'
                ? 'Transversing Chrono Wormhole...'
                : selectedTheory === 'novikov'
                ? 'Möbius Loop Locked (0% Paradox)'
                : selectedTheory === 'many-worlds'
                ? 'Timeline Bifurcated (Branch B)'
                : selectedTheory === 'hawking'
                ? 'Wormhole Crushed by Vacuum'
                : 'Causal Singularity Detected!'
            ) : (
              interventionState === 'idle'
                ? 'Ready for Ball Launch'
                : interventionState === 'traveling'
                ? 'Ball In Flight to Mouth B'
                : billiardMode === 'grazing'
                ? 'Novikov Grazing Collision Verified'
                : 'Polchinski Paradox: Ball Vanished'
            )}
          </div>
          <div className={styles.statFormula}>
            {simMode === 'lineage' ? activeTheory.principle : 'Polchinski-Thorne Billiard Metric'}
          </div>
        </div>
      </div>

      {/* Classical Oscillation Alert Banner */}
      {simMode === 'lineage' && selectedTheory === 'classical' && interventionState === 'oscillating' && (
        <div className={styles.oscillationAlert}>
          <Icon name="alert" size={18} color="#ef4444" />
          <span>
            <strong>TEMPORAL FEEDBACK OSCILLATION ACTIVE:</strong> Grandfather elimination causes traveler to fade out. Without traveler, grandfather survives, causing traveler to rematerialize. Infinite limit-cycle detected!
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actionRow}>
        <button
          onClick={handleExecuteAction}
          disabled={interventionState === 'traveling'}
          className={styles.launchBtn}
        >
          <Icon name="zap" size={16} />
          <span>
            {interventionState === 'traveling'
              ? 'Traversing Wormhole...'
              : simMode === 'lineage'
              ? 'Execute Temporal Intervention (Space)'
              : 'Launch Billiard Ball (Space)'}
          </span>
        </button>

        <button onClick={handleReset} className={styles.resetBtn}>
          <Icon name="rotate-ccw" size={16} />
          <span>Reset Continuum (R)</span>
        </button>
      </div>
    </div>
  );
}
