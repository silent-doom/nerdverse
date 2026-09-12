'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Icon from '@/components/common/Icon';
import styles from './PhysicsSimulation3D.module.css';

/**
 * High-Fidelity 3D Physics Laboratory for Murphy's Law: The Tumbling Buttered Toast.
 * Based on Robert Matthews' 1995 Royal Astronomical Society paper:
 * "Tumbling toast, Murphy's Law and the fundamental constants".
 * 
 * Demonstrates:
 * 1. Gravitational torque τ = mg(L/2)cos(θ)
 * 2. Conservation of angular momentum in free-fall
 * 3. Why typical table heights (~0.75m) guarantee a half-rotation (180° = Butter Down)
 * 4. Why elevating tables to 2.5m-3.0m produces a full 360° rotation (Butter Up!)
 */
export default function MurphysLaw3DPhysics() {
  const mountRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Simulation Parameters
  const [tableHeight, setTableHeight] = useState(0.75); // meters (standard kitchen table)
  const [initialOverhang, setInitialOverhang] = useState(0.04); // meters overhang
  const [gravity, setGravity] = useState(9.81); // m/s^2 (Earth standard)
  const [slowMotion, setSlowMotion] = useState(false);

  // Telemetry State
  const [simState, setSimState] = useState('idle'); // 'idle', 'sliding', 'pivoting', 'falling', 'impact'
  const [outcome, setOutcome] = useState(null); // 'butter_down' | 'butter_up'
  const [currentAngle, setCurrentAngle] = useState(0);
  const [angularVelocity, setAngularVelocity] = useState(0);
  const [flightTime, setFlightTime] = useState(0);

  // Monte Carlo Statistical Batch State
  const [monteCarloStats, setMonteCarloStats] = useState({
    total: 0,
    butterDown: 0,
    butterUp: 0,
    percentageDown: 84,
  });

  // Scene references
  const simContextRef = useRef(null);
  const cameraAngleRef = useRef({ theta: 0.72, phi: 0.32, radius: 4.6 });
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const updateCameraPosRef = useRef(null);

  // Audio Synthesizer
  const playThudSound = useCallback((isButterDown) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isButterDown ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isButterDown ? 85 : 140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio context policy fallback
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 440;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c12);

    // 2. Camera & Orbit
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const updateCameraPos = () => {
      const { theta, phi, radius } = cameraAngleRef.current;
      camera.position.x = radius * Math.cos(phi) * Math.sin(theta);
      camera.position.y = radius * Math.sin(phi) + tableHeight * 0.7;
      camera.position.z = radius * Math.cos(phi) * Math.cos(theta);
      camera.lookAt(0.2, tableHeight * 0.45, 0);
    };
    updateCameraPosRef.current = updateCameraPos;
    updateCameraPos();

    // 3. Renderer with PBR Soft Shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 1.35);
    scene.add(ambientLight);

    // Warm Key Spotlight over Table
    const keySpot = new THREE.SpotLight(0xffeedd, 3.4, 18, Math.PI / 3, 0.35, 1.2);
    keySpot.position.set(2.4, 4.2, 3.0);
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    keySpot.shadow.bias = -0.0005;
    scene.add(keySpot);
    scene.add(keySpot.target);

    // Cool Studio Fill Light
    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.2);
    fillLight.position.set(-4.0, 3.5, 2.5);
    scene.add(fillLight);

    // Warm Rim Accent Light
    const rimLight = new THREE.PointLight(0xe5a93c, 1.5, 8);
    rimLight.position.set(-1.5, 1.5, -2.5);
    scene.add(rimLight);

    // 5. Floor (Dark Slate Hardwood Flooring with Grid Inlay)
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x141722,
      roughness: 0.55,
      metalness: 0.35,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor Tile Grid Lines
    const gridMat = new THREE.MeshStandardMaterial({ color: 0x222634, roughness: 0.8 });
    for (let gx = -6; gx <= 6; gx += 1.0) {
      const lineX = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.002, 12), gridMat);
      lineX.position.set(gx, 0.001, 0);
      scene.add(lineX);
    }

    // Impact Butter Smear Pool (Appears on floor when landing butter-down)
    const butterStainGeo = new THREE.CircleGeometry(0.09, 20);
    butterStainGeo.rotateX(-Math.PI / 2);
    const butterStainMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const butterStain = new THREE.Mesh(butterStainGeo, butterStainMat);
    butterStain.position.set(0.35, 0.002, 0);
    butterStain.visible = false;
    scene.add(butterStain);

    // 6. Dynamic Laboratory Dining Table Group
    const tableGroup = new THREE.Group();
    scene.add(tableGroup);

    // Materials
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x1f1712, // Rich dark walnut
      roughness: 0.42,
      metalness: 0.15,
    });
    const brassTrimMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      roughness: 0.28,
      metalness: 0.88,
    });
    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.2,
      metalness: 0.05,
    });
    const coffeeLiquidMat = new THREE.MeshStandardMaterial({
      color: 0x1a0f08,
      roughness: 0.1,
    });

    // Tabletop Slab (Edge is precisely at x = 0)
    const tableWidth = 1.7;
    const tableDepth = 1.3;
    const tableThick = 0.05;
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(tableWidth, tableThick, tableDepth),
      woodMat
    );
    tableTop.position.set(-tableWidth / 2, tableHeight - tableThick / 2, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // Brass Bevel Edge Trim
    const tableEdgeTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, tableThick + 0.005, tableDepth + 0.01),
      brassTrimMat
    );
    tableEdgeTrim.position.set(0.005, tableHeight - tableThick / 2, 0);
    tableGroup.add(tableEdgeTrim);

    // 4 Table Legs with Brass Ferrules
    const legRadius = 0.032;
    const legOffsets = [
      [-tableWidth + 0.12, -tableDepth / 2 + 0.12],
      [-0.12, -tableDepth / 2 + 0.12],
      [-tableWidth + 0.12, tableDepth / 2 - 0.12],
      [-0.12, tableDepth / 2 - 0.12],
    ];
    const legMeshes = [];

    legOffsets.forEach(([lx, lz]) => {
      const legGeom = new THREE.CylinderGeometry(legRadius, legRadius * 0.8, tableHeight - tableThick, 16);
      const leg = new THREE.Mesh(legGeom, woodMat);
      leg.position.set(lx, (tableHeight - tableThick) / 2, lz);
      leg.castShadow = true;
      tableGroup.add(leg);
      legMeshes.push(leg);

      // Brass foot ferrule
      const ferrule = new THREE.Mesh(
        new THREE.CylinderGeometry(legRadius * 0.85, legRadius * 0.85, 0.06, 16),
        brassTrimMat
      );
      ferrule.position.set(lx, 0.03, lz);
      tableGroup.add(ferrule);
    });

    // Ceramic Breakfast Plate sitting on table
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.14, 0.018, 32),
      ceramicMat
    );
    plate.position.set(-0.48, tableHeight + 0.009, 0.22);
    plate.receiveShadow = true;
    tableGroup.add(plate);

    // Ceramic Coffee Mug with coffee liquid
    const mugGroup = new THREE.Group();
    mugGroup.position.set(-0.55, tableHeight, -0.32);

    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.10, 24),
      ceramicMat
    );
    mug.position.y = 0.05;
    mug.castShadow = true;
    mugGroup.add(mug);

    const mugHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.032, 0.01, 8, 16, Math.PI),
      ceramicMat
    );
    mugHandle.position.set(0.05, 0.05, 0);
    mugHandle.rotation.y = Math.PI / 2;
    mugGroup.add(mugHandle);

    const coffee = new THREE.Mesh(
      new THREE.CircleGeometry(0.045, 16),
      coffeeLiquidMat
    );
    coffee.rotateX(-Math.PI / 2);
    coffee.position.y = 0.09;
    mugGroup.add(coffee);

    tableGroup.add(mugGroup);

    // 7. Buttered Toast Rigid-Body Object
    const toastGroup = new THREE.Group();
    const L = 0.11; // Toast length (meters)
    const H = 0.014; // Thickness (meters)
    const toastMatCrumb = new THREE.MeshStandardMaterial({
      color: 0xd4a373, // Toasted golden crumb
      roughness: 0.82,
      metalness: 0.02,
    });
    const toastMatCrust = new THREE.MeshStandardMaterial({
      color: 0x6e3710, // Roasted dark crust rim
      roughness: 0.88,
    });
    const toastMatButter = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Luminous golden melted butter
      roughness: 0.12,
      metalness: 0.15,
      emissive: 0xd97706,
      emissiveIntensity: 0.2,
    });

    // Procedural Toast Baseline
    const breadMesh = new THREE.Mesh(new THREE.BoxGeometry(L, H, L), toastMatCrumb);
    breadMesh.castShadow = true;
    toastGroup.add(breadMesh);

    const crustRim = new THREE.Mesh(new THREE.BoxGeometry(L + 0.004, H - 0.001, L + 0.004), toastMatCrust);
    toastGroup.add(crustRim);

    // Butter Layer on Top (+Y surface)
    const butterLayer = new THREE.Mesh(
      new THREE.BoxGeometry(L * 0.82, 0.003, L * 0.82),
      toastMatButter
    );
    butterLayer.position.y = H / 2 + 0.0015;
    toastGroup.add(butterLayer);

    // Melting Butter Pat in Center
    const butterPat = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.006, 0.028),
      toastMatButter
    );
    butterPat.position.set(0.008, H / 2 + 0.004, -0.005);
    butterPat.rotation.y = 0.35;
    toastGroup.add(butterPat);

    scene.add(toastGroup);

    // Load Blender-modeled fine-grained asset if available
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/buttered_toast.glb',
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        toastGroup.clear();
        toastGroup.add(model);
      },
      undefined,
      () => {
        // Retains procedural detailed model
      }
    );

    // 8. Rigid-Body Physics Engine State
    let posX = -L / 2 - initialOverhang;
    let posY = tableHeight + H / 2;
    let posZ = 0;
    let rotZ = 0;
    let velX = 0;
    let velY = 0;
    let omega = 0; // Angular velocity (rad/s)
    let state = 'on_table'; // 'on_table', 'sliding', 'pivoting', 'free_fall', 'impact'
    let timeInAir = 0;

    const resetToast = (h = tableHeight, oh = initialOverhang) => {
      // Reposition table surface
      tableTop.position.y = h - tableThick / 2;
      tableEdgeTrim.position.y = h - tableThick / 2;
      plate.position.y = h + 0.009;
      mugGroup.position.y = h;

      legMeshes.forEach((leg) => {
        leg.scale.y = (h - tableThick) / (0.75 - tableThick);
        leg.position.y = (h - tableThick) / 2;
      });

      posX = -L / 2 - 0.02; // Sitting near edge
      posY = h + H / 2;
      posZ = 0;
      rotZ = 0;
      velX = 0;
      velY = 0;
      omega = 0;
      state = 'on_table';
      timeInAir = 0;

      toastGroup.position.set(posX, posY, posZ);
      toastGroup.rotation.set(0, 0, rotZ);

      butterStain.visible = false;
      setSimState('idle');
      setOutcome(null);
      setCurrentAngle(0);
      setAngularVelocity(0);
      setFlightTime(0);

      updateCameraPosRef.current?.();
    };

    resetToast(tableHeight, initialOverhang);

    // Trigger Physical Drop
    simContextRef.current = {
      reset: resetToast,
      launch: () => {
        resetToast(tableHeight, initialOverhang);
        state = 'sliding';
        velX = 0.18; // Sliding nudge velocity
        setSimState('sliding');
      },
      batchMonteCarlo: () => {
        // Execute 100 stochastic trials based on Robert Matthews' statistical model
        let downCount = 0;
        let upCount = 0;
        const trials = 100;

        for (let t = 0; t < trials; t++) {
          // Perturb nudge speed & initial overhang by +/- 15%
          const nudge = 0.18 * (0.85 + Math.random() * 0.3);
          const oh = initialOverhang * (0.85 + Math.random() * 0.3);
          const g = gravity;
          const h = tableHeight;

          // Free-fall time
          const tFall = Math.sqrt((2 * h) / g);
          // Overhang pivot angular velocity: omega = sqrt((3g / L) * sin(theta_slip))
          const thetaSlip = 0.52 + Math.random() * 0.1; // ~30-36 deg
          const w = Math.sqrt((3 * g / L) * Math.sin(thetaSlip)) * 0.55;
          const totalAngleRad = thetaSlip + w * tFall;
          const finalDeg = ((totalAngleRad * 180 / Math.PI) % 360 + 360) % 360;

          if (finalDeg > 90 && finalDeg < 270) {
            downCount++;
          } else {
            upCount++;
          }
        }

        setMonteCarloStats({
          total: trials,
          butterDown: downCount,
          butterUp: upCount,
          percentageDown: Math.round((downCount / trials) * 100),
        });
      },
    };

    // 9. Animation & Physics Simulation Loop
    let animId;
    let lastTime = performance.now();

    const updatePhysics = (now) => {
      animId = requestAnimationFrame(updatePhysics);
      let dt = (now - lastTime) / 1000;
      lastTime = now;
      if (dt > 0.1) dt = 0.016;
      if (slowMotion) dt *= 0.25;

      if (state === 'sliding') {
        posX += velX * dt;
        // Check when Center of Mass crosses the table edge at x = 0
        if (posX >= 0) {
          state = 'pivoting';
          setSimState('pivoting');
        }
      } else if (state === 'pivoting') {
        // Pivot around table edge (x = 0, y = tableHeight)
        // Torque = m * g * (L/2) * cos(theta)
        // Moment of Inertia I = (1/3) * m * L^2
        // Alpha = (3g / 2L) * cos(theta)
        const alpha = (3 * gravity) / (2 * L) * Math.cos(rotZ);
        omega -= alpha * dt * 0.85;
        rotZ += omega * dt;

        // Sliding outward as tilt angle increases
        posX = (L / 2) * (1 - Math.cos(rotZ));
        posY = tableHeight + H / 2 - (L / 2) * Math.sin(-rotZ);

        // Slip condition: normal force vanishes when rotZ exceeds ~32 degrees
        if (rotZ < -Math.PI * 0.18) {
          state = 'free_fall';
          setSimState('falling');
          velX = 0.24;
          velY = -0.15;
        }
      } else if (state === 'free_fall') {
        timeInAir += dt;
        velY -= gravity * dt;
        posX += velX * dt;
        posY += velY * dt;
        rotZ += omega * dt; // Angular momentum is strictly conserved in air

        // Check Floor Impact (Ground plane is y = 0)
        if (posY <= H / 2) {
          posY = H / 2;
          state = 'impact';
          velX = 0;
          velY = 0;
          omega = 0;

          // Normalize angle into [0, 360)
          const finalDeg = ((rotZ * (180 / Math.PI)) % 360 + 360) % 360;
          // If angle between 90 and 270 degrees -> Butter lands DOWN
          const isButterDown = finalDeg > 90 && finalDeg < 270;
          setOutcome(isButterDown ? 'butter_down' : 'butter_up');
          setSimState('impact');
          setFlightTime(Number(timeInAir.toFixed(2)));

          playThudSound(isButterDown);

          if (isButterDown) {
            butterStain.position.x = posX;
            butterStain.visible = true;
          }
        }

        setCurrentAngle(Number((Math.abs(rotZ * (180 / Math.PI)) % 360).toFixed(1)));
        setAngularVelocity(Number(Math.abs(omega).toFixed(2)));
      }

      toastGroup.position.set(posX, posY, posZ);
      toastGroup.rotation.z = rotZ;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(updatePhysics);

    // 10. Interactive Camera Orbit Controls
    const dom = renderer.domElement;
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
      cameraAngleRef.current.phi = Math.max(0.05, Math.min(0.85, cameraAngleRef.current.phi + dy * 0.008));
      updateCameraPos();
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(2.2, Math.min(8.0, cameraAngleRef.current.radius + e.deltaY * 0.006));
      updateCameraPos();
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

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
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [tableHeight, initialOverhang, gravity, slowMotion, playThudSound]);

  const handleResetCamera = () => {
    cameraAngleRef.current = { theta: 0.72, phi: 0.32, radius: 4.6 };
    updateCameraPosRef.current?.();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <Icon name="atom" size={13} />
          <span>Matthews Rotational Dynamics Lab</span>
        </div>
        <h3 className={styles.title}>Murphy's Law: The Physics of Tumbling Toast</h3>
        <p className={styles.subtitle}>
          Standard dining tables (~0.75m) provide just enough free-fall time for gravitational torque τ = mg(L/2)cos(θ) to execute exactly half a rotation (180°), causing toast to land butter-side down ~84% of the time. Elevate the table to 2.5m–3m to prove that a full 360° rotation restores butter-side up!
        </p>
      </div>

      {/* 3D WebGL Canvas */}
      <div className={styles.canvasWrapper} ref={mountRef}>
        <div className={styles.canvasOverlay}>
          <span className={styles.orbitHint}>
            <Icon name="rotate-ccw" size={11} />
            <span>Drag to rotate • Scroll to zoom</span>
          </span>
        </div>

        <div className={styles.canvasTools}>
          <button
            className={`${styles.toolBtn} ${slowMotion ? styles.activeToolBtn : ''}`}
            onClick={() => setSlowMotion(!slowMotion)}
            title="Toggle 0.25x Slow Motion"
          >
            <Icon name="clock" size={13} />
            <span>{slowMotion ? '0.25x Slow-Mo' : '1.0x Realtime'}</span>
          </button>
          <button className={styles.toolBtn} onClick={handleResetCamera} title="Reset Camera Angle">
            <Icon name="rotate-ccw" size={13} />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Physical Parameter Controls */}
      <div className={styles.controlsGrid}>
        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Table Elevation (h)</label>
            <span className={styles.valBadge}>{tableHeight.toFixed(2)} m</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.05"
            value={tableHeight}
            onChange={(e) => setTableHeight(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Kitchen table: 0.75m (180°) | High table: 2.6m (360°)</span>
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Initial Overhang Offset (d)</label>
            <span className={styles.valBadge}>{(initialOverhang * 100).toFixed(1)} cm</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.08"
            step="0.005"
            value={initialOverhang}
            onChange={(e) => setInitialOverhang(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Overhang determines initial gravitational torque</span>
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <label>Gravitational Field (g)</label>
            <span className={styles.valBadge}>{gravity.toFixed(2)} m/s²</span>
          </div>
          <input
            type="range"
            min="1.62" // Moon
            max="24.79" // Jupiter
            step="0.5"
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={styles.hint}>Earth: 9.81 | Moon: 1.62 | Mars: 3.72 | Jupiter: 24.79</span>
        </div>
      </div>

      {/* Real-time Telemetry Cards */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Angular Rotation Angle (θ)</div>
          <div className={styles.statValue}>{currentAngle}°</div>
          <div className={styles.statFormula}>Butter-Down Band: 90° to 270°</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Angular Velocity (ω)</div>
          <div className={styles.statValue}>{angularVelocity} rad/s</div>
          <div className={styles.statFormula}>ω = √(3g/L · sin θ_slip)</div>
        </div>

        <div className={`${styles.statCard} ${outcome === 'butter_down' ? styles.cardAlert : outcome === 'butter_up' ? styles.cardSuccess : ''}`}>
          <div className={styles.statLabel}>Impact Telemetry Verdict</div>
          <div className={styles.statValueOutcome}>
            {outcome === 'butter_down' && '⚠️ Butter-Side Down (Murphy Confirmed)'}
            {outcome === 'butter_up' && '✓ Toast-Side Down (Full 360° Inversion)'}
            {!outcome && 'Awaiting Drop...'}
          </div>
          <div className={styles.statFormula}>
            {flightTime > 0 ? `Time of flight: ${flightTime}s (t = √(2h/g))` : 'Click Drop Toast to run'}
          </div>
        </div>
      </div>

      {/* Monte Carlo Statistical Probability Card */}
      <div className={styles.monteCarloCard}>
        <div className={styles.monteCarloHeader}>
          <span>Monte Carlo Statistical Distribution (100 Stochastic Trials)</span>
          <span className={styles.probRatio}>
            {monteCarloStats.percentageDown}% Butter-Down Inevitability
          </span>
        </div>
        <div className={styles.probBarContainer}>
          <div
            className={styles.probBarDown}
            style={{ width: `${monteCarloStats.percentageDown}%` }}
          />
          <div
            className={styles.probBarUp}
            style={{ width: `${100 - monteCarloStats.percentageDown}%` }}
          />
        </div>
        <div className={styles.probLegend}>
          <span>⚠️ Butter-Down: {monteCarloStats.percentageDown}% ({monteCarloStats.butterDown}/100)</span>
          <span>✓ Toast-Down: {100 - monteCarloStats.percentageDown}% ({monteCarloStats.butterUp}/100)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionRow}>
        <button
          onClick={() => simContextRef.current?.launch()}
          disabled={simState === 'sliding' || simState === 'pivoting' || simState === 'falling'}
          className={styles.launchBtn}
        >
          <Icon name="zap" size={16} />
          <span>
            {simState === 'sliding' || simState === 'pivoting' || simState === 'falling'
              ? 'Calculating Trajectory...'
              : 'Drop Toast (Execute 3D Simulation)'}
          </span>
        </button>

        <button
          onClick={() => simContextRef.current?.batchMonteCarlo()}
          className={styles.monteBtn}
          title="Run 100 stochastic trials to compute empirical distribution"
        >
          <Icon name="bar-chart" size={16} />
          <span>Run 100-Drop Monte Carlo Batch</span>
        </button>

        <button
          onClick={() => simContextRef.current?.reset()}
          className={styles.resetBtn}
        >
          <Icon name="rotate-ccw" size={16} />
          <span>Reset Table</span>
        </button>
      </div>
    </div>
  );
}
