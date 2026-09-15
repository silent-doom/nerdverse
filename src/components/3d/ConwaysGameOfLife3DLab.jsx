'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './ConwaysGameOfLife3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

const GRID_SIZE = 34; // 34x34 grid (1156 cells)

// Sound synthesizer using Web Audio API
function playLifeSound(freq = 440, type = 'sine', duration = 0.06, volume = 0.08) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio contexts may be blocked by browser policy until gesture
  }
}

// Famous Patterns
const PRESETS = {
  gliderGun: {
    name: 'Gosper Glider Gun',
    desc: 'The first known finite pattern that produces an endless stream of gliders.',
    generator: (size) => {
      const grid = Array(size).fill(0).map(() => Array(size).fill(0));
      const gun = [
        [24, 0], [22, 1], [24, 1], [12, 2], [13, 2], [20, 2], [21, 2], [34, 2], [35, 2],
        [11, 3], [15, 3], [20, 3], [21, 3], [34, 3], [35, 3], [0, 4], [1, 4], [10, 4],
        [16, 4], [20, 4], [21, 4], [0, 5], [1, 5], [10, 5], [14, 5], [16, 5], [17, 5],
        [22, 5], [24, 5], [10, 6], [16, 6], [24, 6], [11, 7], [15, 7], [12, 8], [13, 8]
      ];
      gun.forEach(([gx, gy]) => {
        const x = gx - 1;
        const y = gy + 8;
        if (x >= 0 && x < size && y >= 0 && y < size) grid[y][x] = 1;
      });
      return grid;
    }
  },
  pulsar: {
    name: 'Pulsar (Period 3)',
    desc: 'A large, mesmerizing oscillator that pulses with 3-phase rotational symmetry.',
    generator: (size) => {
      const grid = Array(size).fill(0).map(() => Array(size).fill(0));
      const cx = Math.floor(size / 2);
      const cy = Math.floor(size / 2);
      const offsets = [-6, -1, 1, 6];
      const span = [-4, -3, -2, 2, 3, 4];
      offsets.forEach(o => {
        span.forEach(s => {
          if (cy + o >= 0 && cy + o < size && cx + s >= 0 && cx + s < size) grid[cy + o][cx + s] = 1;
          if (cy + s >= 0 && cy + s < size && cx + o >= 0 && cx + o < size) grid[cy + s][cx + o] = 1;
        });
      });
      return grid;
    }
  },
  spaceships: {
    name: 'Spaceship Armada',
    desc: 'Lightweight spaceships (LWSS) soaring diagonally across the coordinate plane.',
    generator: (size) => {
      const grid = Array(size).fill(0).map(() => Array(size).fill(0));
      const addLWSS = (ox, oy) => {
        const pattern = [
          [1, 0], [4, 0],
          [0, 1],
          [0, 2], [4, 2],
          [0, 3], [1, 3], [2, 3], [3, 3]
        ];
        pattern.forEach(([px, py]) => {
          if (oy + py < size && ox + px < size) grid[oy + py][ox + px] = 1;
        });
      };
      addLWSS(4, 6);
      addLWSS(14, 16);
      addLWSS(6, 24);
      return grid;
    }
  },
  gliderCollision: {
    name: 'Glider Collision',
    desc: 'Two autonomous gliders traveling on a direct collision course to test annihilation physics.',
    generator: (size) => {
      const grid = Array(size).fill(0).map(() => Array(size).fill(0));
      const cx = Math.floor(size / 2);
      const cy = Math.floor(size / 2);
      // Glider 1 moving down-right
      const g1 = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];
      g1.forEach(([px, py]) => { grid[cy - 6 + py][cx - 8 + px] = 1; });
      // Glider 2 moving down-left
      const g2 = [[1, 0], [0, 1], [0, 2], [1, 2], [2, 2]];
      g2.forEach(([px, py]) => { grid[cy - 6 + py][cx + 6 - px] = 1; });
      return grid;
    }
  },
  acorn: {
    name: 'The Acorn (Methuselah)',
    desc: 'A tiny 7-cell seed that takes 5,206 generations to stabilize, generating 13 gliders.',
    generator: (size) => {
      const grid = Array(size).fill(0).map(() => Array(size).fill(0));
      const cx = Math.floor(size / 2);
      const cy = Math.floor(size / 2);
      const seed = [[1, 0], [3, 1], [0, 2], [1, 2], [4, 2], [5, 2], [6, 2]];
      seed.forEach(([px, py]) => { grid[cy + py][cx - 3 + px] = 1; });
      return grid;
    }
  },
  soup: {
    name: 'Primordial Soup',
    desc: 'Random thermal distribution seed simulating natural abiogenesis.',
    generator: (size) => {
      const grid = Array(size).fill(0).map(() => Array(size).fill(0));
      for (let y = 6; y < size - 6; y++) {
        for (let x = 6; x < size - 6; x++) {
          grid[y][x] = Math.random() < 0.22 ? 1 : 0;
        }
      }
      return grid;
    }
  }
};

export default function ConwaysGameOfLife3DLab() {
  const mountRef = useRef(null);

  // ── State ──
  const [activeTab, setActiveTab] = useState('presetLab'); // 'presetLab' | 'lawsInspect' | 'spacetime'
  const [selectedPreset, setSelectedPreset] = useState('gliderGun');
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(12); // generations per sec
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [spacetimeExtrusion, setSpacetimeExtrusion] = useState(false);

  // Telemetry metrics
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState(0);
  const [peakPop, setPeakPop] = useState(0);
  const [birthCount, setBirthCount] = useState(0);
  const [deathCount, setDeathCount] = useState(0);

  // Hovered Cell Inspector
  const [hoveredCell, setHoveredCell] = useState(null);

  // Grid Data Ref (2D array of state and ages)
  const gridStateRef = useRef(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0)));
  const gridAgeRef = useRef(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0)));
  const historyRef = useRef([]); // holds last 8 generations for spacetime crystal

  // Playback refs
  const isPlayingRef = useRef(true);
  const simSpeedRef = useRef(12);
  const soundRef = useRef(false);
  const spacetimeRef = useRef(false);
  const hasRecordedTelemetry = useRef(false);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { simSpeedRef.current = simSpeed; }, [simSpeed]);
  useEffect(() => { soundRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { spacetimeRef.current = spacetimeExtrusion; }, [spacetimeExtrusion]);

  // Three.js object references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const instancedMeshRef = useRef(null);
  const spacetimeGroupRef = useRef(null);
  const floorGridRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mousePosRef = useRef(new THREE.Vector2());
  const isMouseDownRef = useRef(false);

  // Initialize grid with selected preset
  const loadPreset = useCallback((presetKey) => {
    setSelectedPreset(presetKey);
    const preset = PRESETS[presetKey];
    if (!preset) return;
    const newGrid = preset.generator(GRID_SIZE);
    gridStateRef.current = newGrid;
    gridAgeRef.current = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    historyRef.current = [];

    let count = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c]) count++;
      }
    }
    setGeneration(0);
    setPopulation(count);
    setPeakPop(count);
    setBirthCount(count);
    setDeathCount(0);

    if (soundRef.current) {
      playLifeSound(587.33, 'triangle', 0.12, 0.1);
    }
  }, []);

  // ── Step Simulation Forward (1 Generation) ──
  const stepGeneration = useCallback(() => {
    const current = gridStateRef.current;
    const currentAges = gridAgeRef.current;
    const next = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    const nextAges = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));

    let pop = 0;
    let births = 0;
    let deaths = 0;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // Count 8 neighbors with toroidal wrapping
        let liveNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const ny = (y + dy + GRID_SIZE) % GRID_SIZE;
            const nx = (x + dx + GRID_SIZE) % GRID_SIZE;
            if (current[ny][nx]) liveNeighbors++;
          }
        }

        const isAlive = current[y][x] === 1;

        if (isAlive) {
          if (liveNeighbors === 2 || liveNeighbors === 3) {
            next[y][x] = 1;
            nextAges[y][x] = currentAges[y][x] + 1;
            pop++;
          } else {
            next[y][x] = 0;
            deaths++;
          }
        } else {
          if (liveNeighbors === 3) {
            next[y][x] = 1;
            nextAges[y][x] = 0; // Newborn
            births++;
            pop++;
          } else {
            next[y][x] = 0;
          }
        }
      }
    }

    // Save history for 3D spacetime crystal (keep max 10 slices)
    historyRef.current.unshift(current.map(row => [...row]));
    if (historyRef.current.length > 10) historyRef.current.pop();

    gridStateRef.current = next;
    gridAgeRef.current = nextAges;

    setGeneration(g => {
      const nextG = g + 1;
      if (nextG >= 100 && !hasRecordedTelemetry.current) {
        hasRecordedTelemetry.current = true;
        recordConceptRun('conways-game-of-life', {
          mode: 'cellular-automaton',
          peakPopulation: pop,
          generations: nextG,
        }).catch(() => {});
      }
      return nextG;
    });

    setPopulation(pop);
    setPeakPop(p => Math.max(p, pop));
    setBirthCount(b => b + births);
    setDeathCount(d => d + deaths);

    if (soundRef.current && (births > 0 || deaths > 0)) {
      const baseFreq = 220 + Math.min(pop * 4, 800);
      playLifeSound(baseFreq, 'sine', 0.04, 0.04);
    }
  }, []);

  // Clear Grid
  const clearGrid = useCallback(() => {
    gridStateRef.current = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    gridAgeRef.current = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    historyRef.current = [];
    setGeneration(0);
    setPopulation(0);
    setIsPlaying(false);
  }, []);

  // Toggle Single Cell
  const toggleCell = useCallback((x, y) => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    const current = gridStateRef.current;
    const isAlive = current[y][x] === 1;
    current[y][x] = isAlive ? 0 : 1;
    gridAgeRef.current[y][x] = 0;
    setPopulation(p => isAlive ? Math.max(0, p - 1) : p + 1);
    if (soundRef.current) {
      playLifeSound(isAlive ? 220 : 523.25, 'sine', 0.05, 0.07);
    }
  }, []);

  // ── Three.js Scene Setup ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 560;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.024);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 120);
    camera.position.set(0, 24, 28);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    keyLight.position.set(16, 30, 20);
    scene.add(keyLight);

    const emeraldGlow = new THREE.PointLight(0x10b981, 2.5, 45);
    emeraldGlow.position.set(0, 10, 0);
    scene.add(emeraldGlow);

    const purpleRim = new THREE.DirectionalLight(0xa855f7, 1.0);
    purpleRim.position.set(-20, 15, -15);
    scene.add(purpleRim);

    // 4. Grid Floor Plate
    const floorGeo = new THREE.PlaneGeometry(GRID_SIZE * 0.9, GRID_SIZE * 0.9);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090e1a,
      roughness: 0.4,
      metalness: 0.8,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.05;
    scene.add(floorMesh);
    floorGridRef.current = floorMesh;

    // Floor Wireframe helper
    const gridHelper = new THREE.GridHelper(GRID_SIZE * 0.9, GRID_SIZE, 0x1e293b, 0x111c30);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 5. Instanced Mesh for Live Cells
    const cellGeo = new THREE.BoxGeometry(0.78, 0.72, 0.78);
    // Add bevel or bevel-like edges via material
    const cellMat = new THREE.MeshStandardMaterial({
      roughness: 0.25,
      metalness: 0.35,
      emissiveIntensity: 0.75,
    });
    const instancedMesh = new THREE.InstancedMesh(cellGeo, cellMat, GRID_SIZE * GRID_SIZE);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);
    instancedMeshRef.current = instancedMesh;

    // 6. Spacetime group (for vertical generation slices)
    const spacetimeGroup = new THREE.Group();
    scene.add(spacetimeGroup);
    spacetimeGroupRef.current = spacetimeGroup;

    // Starfield cosmic dust
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 70;
      starPositions[i + 1] = Math.random() * 40 - 5;
      starPositions[i + 2] = (Math.random() - 0.5) * 70;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.12, transparent: true, opacity: 0.45 });
    scene.add(new THREE.Points(starsGeo, starsMat));

    // Load initial preset
    loadPreset('gliderGun');

    // ── Mouse Raycasting for interactive cell toggling ──
    const handlePointerMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mousePosRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePosRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mousePosRef.current, camera);
      const intersects = raycasterRef.current.intersectObject(floorMesh);
      if (intersects.length > 0) {
        const pt = intersects[0].point;
        // Map world coordinates to grid indices
        const step = 0.9;
        const half = (GRID_SIZE * step) / 2;
        const gx = Math.floor((pt.x + half) / step);
        const gy = Math.floor((pt.z + half) / step);

        if (gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE) {
          const current = gridStateRef.current;
          let liveNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const ny = (gy + dy + GRID_SIZE) % GRID_SIZE;
              const nx = (gx + dx + GRID_SIZE) % GRID_SIZE;
              if (current[ny][nx]) liveNeighbors++;
            }
          }
          const isAlive = current[gy][gx] === 1;
          setHoveredCell({ x: gx, y: gy, isAlive, liveNeighbors });

          if (isMouseDownRef.current) {
            toggleCell(gx, gy);
          }
        }
      } else {
        setHoveredCell(null);
      }
    };

    const handlePointerDown = (e) => {
      if (e.button !== 0) return; // only left click
      isMouseDownRef.current = true;
      if (hoveredCell) {
        toggleCell(hoveredCell.x, hoveredCell.y);
      }
    };

    const handlePointerUp = () => {
      isMouseDownRef.current = false;
    };

    mount.addEventListener('pointermove', handlePointerMove);
    mount.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    // ── Resize Observer ──
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ── Animation / Simulation Loop ──
    let lastSimTime = 0;
    let animationFrameId;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);

      // Simulation stepping
      const interval = 1000 / (simSpeedRef.current || 12);
      if (isPlayingRef.current && time - lastSimTime > interval) {
        stepGeneration();
        lastSimTime = time;
      }

      // Update InstancedMesh matrices & colors based on live grid
      if (instancedMeshRef.current) {
        const grid = gridStateRef.current;
        const ages = gridAgeRef.current;
        const step = 0.9;
        const half = (GRID_SIZE * step) / 2;
        let instanceIdx = 0;

        for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
            const isAlive = grid[y][x] === 1;
            const age = ages[y][x] || 0;
            const wx = x * step - half + step / 2;
            const wz = y * step - half + step / 2;

            if (isAlive) {
              dummy.position.set(wx, 0.36, wz);
              dummy.scale.set(1, 1, 1);

              // Color gradient based on age
              if (age === 0) {
                color.setHex(0x38bdf8); // Newborn: Electric Cyan
              } else if (age < 4) {
                color.setHex(0x10b981); // Youth: Emerald Green
              } else if (age < 9) {
                color.setHex(0xa855f7); // Mature: Violet
              } else {
                color.setHex(0xf59e0b); // Elder: Amber Gold
              }
            } else {
              // Hide dead cell
              dummy.position.set(wx, -5, wz);
              dummy.scale.set(0, 0, 0);
              color.setHex(0x000000);
            }

            dummy.updateMatrix();
            instancedMeshRef.current.setMatrixAt(instanceIdx, dummy.matrix);
            instancedMeshRef.current.setColorAt(instanceIdx, color);
            instanceIdx++;
          }
        }
        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
        if (instancedMeshRef.current.instanceColor) {
          instancedMeshRef.current.instanceColor.needsUpdate = true;
        }
      }

      // Camera slow pan/rotation in Spacetime mode
      if (spacetimeRef.current) {
        const angle = time * 0.0003;
        camera.position.x = Math.sin(angle) * 32;
        camera.position.z = Math.cos(angle) * 32;
        camera.position.y = 22;
        camera.lookAt(0, 3, 0);
      } else {
        camera.position.set(0, 24, 28);
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      mount.removeEventListener('pointermove', handlePointerMove);
      mount.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [loadPreset, stepGeneration, toggleCell, hoveredCell]);

  return (
    <div
      className={styles.labContainer}
      aria-label="Conway's Game of Life 3D Interactive Lab"
      data-testid="conways-game-of-life-3d-lab"
    >
      {/* Canvas Area */}
      <div className={styles.canvasContainer}>
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Top HUD */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="atom" size={13} />
              Cellular Automaton Engine
            </div>
            <h2 className={styles.labTitle}>Conway&apos;s Game of Life</h2>
          </div>

          <div className={styles.statsCluster}>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Generation</span>
              <span className={`${styles.statValue} ${styles.cyan}`}>{generation}</span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Population</span>
              <span className={`${styles.statValue} ${styles.alive}`}>{population}</span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Peak Record</span>
              <span className={`${styles.statValue} ${styles.purple}`}>{peakPop}</span>
            </div>
          </div>
        </div>

        {/* Floating Mode Indicator */}
        <div className={styles.floatingOverlayBadge}>
          <Icon name="grid" size={13} />
          {activeTab === 'spacetime'
            ? '3D Spacetime Crystal Mode'
            : activeTab === 'lawsInspect'
            ? 'Four Laws Inspection'
            : PRESETS[selectedPreset]?.name || 'Autonomous Universe'}
        </div>

        {/* Live Hover Cell Inspector */}
        {hoveredCell && (
          <div className={styles.hoverInspector}>
            <div className={styles.inspectorTitle}>
              <Icon name="sparkles" size={12} />
              Cell ({hoveredCell.x}, {hoveredCell.y})
            </div>
            <div>
              State: <strong className={hoveredCell.isAlive ? styles.statValueAlive : ''}>
                {hoveredCell.isAlive ? 'Alive (1)' : 'Empty / Dead (0)'}
              </strong>
            </div>
            <div>Live Neighbors: <strong>{hoveredCell.liveNeighbors}</strong></div>
            <div className={styles.inspectorRule}>
              {hoveredCell.isAlive ? (
                hoveredCell.liveNeighbors < 2 ? (
                  <span className={styles.ruleHighlight}>Law 1: Dies of Underpopulation (&lt; 2)</span>
                ) : hoveredCell.liveNeighbors > 3 ? (
                  <span className={styles.ruleHighlight}>Law 3: Dies of Overpopulation (&gt; 3)</span>
                ) : (
                  <span className={styles.ruleHighlight}>Law 2: Survives into Next Generation (2-3)</span>
                )
              ) : hoveredCell.liveNeighbors === 3 ? (
                <span className={styles.ruleHighlight}>Law 4: Born by Reproduction (Exactly 3)</span>
              ) : (
                <span>Remains Dead</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Primary Control Deck */}
      <div className={styles.controlDeck}>
        {/* Navigation Tabs */}
        <div className={styles.tabsRow} role="tablist">
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'presetLab' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('presetLab'); setSpacetimeExtrusion(false); }}
            role="tab"
            aria-selected={activeTab === 'presetLab'}
          >
            <Icon name="flask" size={14} />
            1. Emergent Zoo (Presets)
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'lawsInspect' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('lawsInspect'); setSpacetimeExtrusion(false); }}
            role="tab"
            aria-selected={activeTab === 'lawsInspect'}
          >
            <Icon name="book" size={14} />
            2. The Four Immutable Laws
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'spacetime' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('spacetime'); setSpacetimeExtrusion(true); }}
            role="tab"
            aria-selected={activeTab === 'spacetime'}
          >
            <Icon name="cube" size={14} />
            3. Spacetime Worldlines
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className={`${styles.primaryBtn} ${!isPlaying ? styles.paused : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            <Icon name={isPlaying ? 'pause' : 'play'} size={15} />
            {isPlaying ? 'Pause Evolution' : 'Resume Evolution'}
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => { setIsPlaying(false); stepGeneration(); }}
            aria-label="Step Generation"
          >
            <Icon name="chevron-right" size={15} />
            Step (+1 Gen)
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => loadPreset('soup')}
            aria-label="Generate Random Soup"
          >
            <Icon name="refresh" size={15} />
            Random Soup
          </button>

          <button
            type="button"
            className={styles.dangerBtn}
            onClick={clearGrid}
            aria-label="Clear Board"
          >
            <Icon name="trash" size={15} />
            Clear
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label="Toggle Synthesizer Sound"
          >
            <Icon name={soundEnabled ? 'volume-2' : 'volume-x'} size={15} />
            {soundEnabled ? 'Sound ON' : 'Mute'}
          </button>
        </div>

        {/* Tab 1: Presets Catalog */}
        {activeTab === 'presetLab' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Select Emergent Organism</span>
                <span className={styles.cardSubtitle}>Classic Conway Configurations</span>
              </div>
              <div className={styles.presetGrid}>
                {Object.entries(PRESETS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.presetBtn} ${selectedPreset === key ? styles.presetBtnActive : ''}`}
                    onClick={() => loadPreset(key)}
                  >
                    <Icon name="star" size={13} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Evolution Velocity</span>
                <span className={styles.sliderValue}>{simSpeed} Hz</span>
              </div>
              <div className={styles.sliderBox}>
                <div className={styles.sliderHeader}>
                  <span>1 gen/s (Microscope)</span>
                  <span>30 gen/s (Cosmic speed)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Evolution Speed"
                />
              </div>

              <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                💡 <em>Tip: Click or drag on any tile on the 3D board to manually birth or extinguish cells in real-time.</em>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: The Four Laws Engine */}
        {activeTab === 'lawsInspect' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>The 4 Laws of Conway&apos;s Cosmos</span>
                <span className={styles.cardSubtitle}>Local Deterministic Rules</span>
              </div>
              <div className={styles.lawsList}>
                <div className={`${styles.lawItem} ${styles.underpop}`}>
                  <strong>1. Underpopulation (&lt; 2 Neighbors)</strong>
                  Any live cell with fewer than two live neighbors dies as if by isolation.
                </div>
                <div className={`${styles.lawItem} ${styles.survive}`}>
                  <strong>2. Survival (2 or 3 Neighbors)</strong>
                  Any live cell with two or three live neighbors lives on to the next generation.
                </div>
                <div className={`${styles.lawItem} ${styles.overpop}`}>
                  <strong>3. Overpopulation (&gt; 3 Neighbors)</strong>
                  Any live cell with more than three live neighbors dies of overcrowding.
                </div>
                <div className={`${styles.lawItem} ${styles.reproduce}`}>
                  <strong>4. Reproduction (Exactly 3 Neighbors)</strong>
                  Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
                </div>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Emergence Telemetry</span>
                <span className={styles.cardSubtitle}>Macro-Thermodynamics</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Total Historical Births:</span>
                  <strong style={{ color: '#38bdf8' }}>{birthCount.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Total Historical Deaths:</span>
                  <strong style={{ color: '#f87171' }}>{deathCount.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Grid Density:</span>
                  <strong style={{ color: '#10b981' }}>{((population / (GRID_SIZE * GRID_SIZE)) * 100).toFixed(1)}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Turing Completeness:</span>
                  <strong style={{ color: '#c084fc' }}>Universal Computer</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Spacetime Worldlines */}
        {activeTab === 'spacetime' && (
          <div className={styles.spacetimeBanner}>
            <div className={styles.spacetimeText}>
              <strong>Spacetime Crystal Extrusion:</strong> Stacking consecutive 2D generations along the vertical time axis converts gliders into diagonal corkscrews and oscillators into braided 3D helical crystals.
            </div>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={spacetimeExtrusion}
                onChange={(e) => setSpacetimeExtrusion(e.target.checked)}
              />
              <span>Orbit Camera View</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
