'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './FermiParadox3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

// Drake Equation default parameters (Modern consensus baseline)
const DEFAULT_DRAKE = {
  rStar: 2.0,       // Star formation rate (stars/yr)
  fPlanets: 1.0,    // Fraction with planets (0 - 1)
  nHabitable: 0.2,  // Habitable planets per star
  fLife: 0.2,       // Fraction where life arises (0 - 1)
  fIntel: 0.2,      // Fraction evolving intelligence (0 - 1)
  fComm: 0.2,       // Fraction developing communications (0 - 1)
  lifetime: 10000,  // Communicative longevity L (years)
};

const SCENARIOS = [
  {
    id: 'standard',
    name: 'Cosmic Baseline',
    color: '#E5A93C',
    desc: 'Moderate parameters; Drake predicts dozens of communicative cultures in the Milky Way.',
    values: { rStar: 2.0, fPlanets: 1.0, nHabitable: 0.2, fLife: 0.2, fIntel: 0.2, fComm: 0.2, lifetime: 10000 },
  },
  {
    id: 'rare-earth',
    name: 'The Great Filter Behind (Rare Earth)',
    color: '#38BDF8',
    desc: 'Abiogenesis or eukaryotic leaps are near-impossible. Earth is alone in the spiral arm.',
    values: { rStar: 2.0, fPlanets: 0.8, nHabitable: 0.05, fLife: 0.001, fIntel: 0.01, fComm: 0.05, lifetime: 5000 },
  },
  {
    id: 'filter-ahead',
    name: 'The Great Filter Ahead (Doomsday)',
    color: '#F87171',
    desc: 'Life is common, but technological societies self-destruct via nuclear/AI catastrophe (L < 200 yrs).',
    values: { rStar: 2.5, fPlanets: 1.0, nHabitable: 0.3, fLife: 0.5, fIntel: 0.3, fComm: 0.5, lifetime: 150 },
  },
  {
    id: 'sagan-optimist',
    name: 'Sagan Optimism (Dyson Swarms)',
    color: '#34D399',
    desc: 'Enlightened civilizations survive millions of years, constructing galactic megastructures.',
    values: { rStar: 3.0, fPlanets: 1.0, nHabitable: 0.4, fLife: 0.6, fIntel: 0.5, fComm: 0.5, lifetime: 500000 },
  },
];

export default function FermiParadox3DLab() {
  const mountRef = useRef(null);

  // Drake parameters
  const [drake, setDrake] = useState(DEFAULT_DRAKE);
  const [activeScenario, setActiveScenario] = useState('standard');

  // Colonization Epoch simulation (0 to 500 Million Years)
  const [epochMyr, setEpochMyr] = useState(0);
  const epochMyrRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [colonizedCount, setColonizedCount] = useState(1);

  // Sync refs
  useEffect(() => {
    epochMyrRef.current = epochMyr;
  }, [epochMyr]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Calculated Drake value N
  const calculatedN = useMemo(() => {
    const n =
      drake.rStar *
      drake.fPlanets *
      drake.nHabitable *
      drake.fLife *
      drake.fIntel *
      drake.fComm *
      drake.lifetime;
    return n >= 100 ? Math.round(n) : +n.toFixed(2);
  }, [drake]);

  // Three.js scene refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const starsGeometryRef = useRef(null);
  const starColorsRef = useRef(null);
  const starDataRef = useRef([]);
  const expansionSpheresRef = useRef([]);

  // Handle scenario preset selection
  const applyScenario = (scId) => {
    const sc = SCENARIOS.find((s) => s.id === scId);
    if (!sc) return;
    setActiveScenario(scId);
    setDrake(sc.values);

    // Record telemetry run
    recordConceptRun('fermi-paradox', 'single', {
      scenario: scId,
      calculatedN:
        sc.values.rStar *
        sc.values.fPlanets *
        sc.values.nHabitable *
        sc.values.fLife *
        sc.values.fIntel *
        sc.values.fComm *
        sc.values.lifetime,
      lifetime: sc.values.lifetime,
      epochMyr: epochMyrRef.current,
    });
  };

  // Three.js scene setup
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 800;
    const height = currentMount.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06070a);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 18, 26);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const coreLight = new THREE.PointLight(0xffd580, 4, 30);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // 5. Generate Volumetric 3D Spiral Galaxy (Milky Way)
    const STAR_COUNT = 9000;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starColors = new Float32Array(STAR_COUNT * 3);
    const starsData = [];

    // 4 logarithmic spiral arms + core bulge
    const ARMS = 4;
    const ARM_OFFSET = (2 * Math.PI) / ARMS;

    for (let i = 0; i < STAR_COUNT; i++) {
      const isBulge = i < 1500;
      let x, y, z;
      let r, theta;

      if (isBulge) {
        // Spherical Gaussian core
        const u = Math.random();
        r = Math.pow(u, 2.5) * 3.5;
        theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.cos(phi) * 0.45;
        z = r * Math.sin(phi) * Math.sin(theta);
      } else {
        // Spiral arms: r = a * exp(b * theta)
        const armIndex = i % ARMS;
        const distFromCenter = Math.pow(Math.random(), 1.5) * 12 + 1.2;
        r = distFromCenter;
        theta = Math.log(r / 1.0) * 2.2 + armIndex * ARM_OFFSET;

        // Dispersion jitter
        const spreadR = (Math.random() - 0.5) * (0.8 + r * 0.15);
        const spreadAngle = (Math.random() - 0.5) * (0.5 / r);
        const spreadY = (Math.random() - 0.5) * (1.2 * Math.exp(-r * 0.08));

        x = (r + spreadR) * Math.cos(theta + spreadAngle);
        y = spreadY;
        z = (r + spreadR) * Math.sin(theta + spreadAngle);
      }

      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;

      // Base color: Core = warm amber/gold, Arms = subtle cosmic cyan/white
      const isWarmCore = isBulge || r < 3.0;
      const rCol = isWarmCore ? 1.0 : 0.7 + Math.random() * 0.2;
      const gCol = isWarmCore ? 0.8 : 0.85 + Math.random() * 0.15;
      const bCol = isWarmCore ? 0.4 : 1.0;

      starColors[i * 3] = rCol;
      starColors[i * 3 + 1] = gCol;
      starColors[i * 3 + 2] = bCol;

      starsData.push({
        x,
        y,
        z,
        r,
        baseColor: [rCol, gCol, bCol],
        isColonized: false,
      });
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starsGeometryRef.current = starGeo;
    starColorsRef.current = starColors;
    starDataRef.current = starsData;

    const starMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 6. Earth Position Marker (Orion Spur ~7.5 units out)
    const earthPos = new THREE.Vector3(6.5, 0.1, 3.8);
    const earthMarkerGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const earthMarkerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const earthMarker = new THREE.Mesh(earthMarkerGeo, earthMarkerMat);
    earthMarker.position.copy(earthPos);
    scene.add(earthMarker);

    // Earth Beacon Ring
    const beaconRingGeo = new THREE.RingGeometry(0.4, 0.48, 32);
    const beaconRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const beaconRing = new THREE.Mesh(beaconRingGeo, beaconRingMat);
    beaconRing.rotation.x = Math.PI / 2;
    earthMarker.add(beaconRing);

    // 7. Load Von Neumann Probe 3D Asset
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/von_neumann_probe.glb',
      (gltf) => {
        const probeModel = gltf.scene;
        probeModel.scale.set(0.35, 0.35, 0.35);
        probeModel.position.set(earthPos.x + 0.8, earthPos.y + 0.4, earthPos.z + 0.5);
        scene.add(probeModel);
      },
      undefined,
      () => {
        // Fallback procedural beacon already loaded
      }
    );

    // 8. 4 Seed Civilizations Spawning Colonization Waves
    const SEED_CIVILIZATIONS = [
      { origin: earthPos.clone(), startEpoch: 0 },
      { origin: new THREE.Vector3(-5.8, -0.2, 4.2), startEpoch: 30 },
      { origin: new THREE.Vector3(4.5, 0.2, -6.0), startEpoch: 80 },
      { origin: new THREE.Vector3(-6.2, 0.1, -4.5), startEpoch: 120 },
    ];
    expansionSpheresRef.current = SEED_CIVILIZATIONS;

    // 9. Orbit Dragging
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = 0.55;

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= dx * 0.006;
      sphericalPhi = Math.max(0.1, Math.min(1.4, sphericalPhi + dy * 0.006));

      const radius = 28.0;
      camera.position.x = radius * Math.sin(sphericalTheta) * Math.sin(sphericalPhi);
      camera.position.y = radius * Math.cos(sphericalPhi);
      camera.position.z = radius * Math.cos(sphericalTheta) * Math.sin(sphericalPhi);
      camera.lookAt(0, 0, 0);
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    currentMount.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 10. Animation Loop
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      // Slowly rotate galaxy for cinematic motion
      starPoints.rotation.y += 0.0006;

      // Handle epoch time playback
      if (isPlayingRef.current) {
        setEpochMyr((prev) => {
          const next = prev + dt * 25; // 25 Myr per second
          if (next >= 500) {
            setIsPlaying(false);
            return 500;
          }
          return next;
        });
      }

      // Update Colonization Wave Fronts
      const currentEpoch = epochMyrRef.current;
      const colors = starColorsRef.current;
      const stars = starDataRef.current;
      let colonizedCountTally = 0;

      if (colors && stars.length > 0) {
        const vWave = 0.04; // Expansion speed in scene units per Myr

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          let isWithinWave = false;

          for (let c = 0; c < SEED_CIVILIZATIONS.length; c++) {
            const civ = SEED_CIVILIZATIONS[c];
            if (currentEpoch >= civ.startEpoch) {
              const radius = (currentEpoch - civ.startEpoch) * vWave;
              const dx = s.x - civ.origin.x;
              const dy = s.y - civ.origin.y;
              const dz = s.z - civ.origin.z;
              const distSq = dx * dx + dy * dy + dz * dz;

              if (distSq < radius * radius) {
                isWithinWave = true;
                break;
              }
            }
          }

          if (isWithinWave) {
            colonizedCountTally++;
            // Glow bright radiant gold / amber (#F59E0B)
            colors[i * 3] = 0.96;
            colors[i * 3 + 1] = 0.65;
            colors[i * 3 + 2] = 0.12;
          } else {
            // Revert to original stellar baseline color
            colors[i * 3] = s.baseColor[0];
            colors[i * 3 + 1] = s.baseColor[1];
            colors[i * 3 + 2] = s.baseColor[2];
          }
        }

        starsGeometryRef.current.attributes.color.needsUpdate = true;
        setColonizedCount(colonizedCountTally);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={styles.labContainer} data-testid="fermi-paradox-lab">
      <div className={styles.canvasContainer}>
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Top Header Floating Telemetry */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="compass" size={13} color="#E5A93C" />
              <span>Cosmology & Astrobiology Laboratory</span>
            </div>
            <h2 className={styles.labTitle}>The Fermi Paradox 3D Galactic Orrery</h2>
          </div>

          <div className={styles.drakeDisplay}>
            <span className={styles.drakeLabel}>Drake Communicative Civilizations (N)</span>
            <span className={styles.drakeValue}>{calculatedN}</span>
          </div>
        </div>

        {/* Active Hypothesis Status Pill */}
        <div className={styles.hudFilterPill}>
          <span
            className={styles.filterDot}
            style={{
              backgroundColor: SCENARIOS.find((s) => s.id === activeScenario)?.color || '#E5A93C',
              boxShadow: `0 0 10px ${SCENARIOS.find((s) => s.id === activeScenario)?.color || '#E5A93C'}`,
            }}
          />
          <span>{SCENARIOS.find((s) => s.id === activeScenario)?.name}</span>
        </div>

        {/* Bottom Colonization Epoch Slider & Wavefront Dock */}
        <div className={styles.epochDock}>
          <div className={styles.epochControls}>
            <button className={styles.playBtn} onClick={() => setIsPlaying(!isPlaying)}>
              <Icon name={isPlaying ? 'pause' : 'play'} size={13} />
              <span>{isPlaying ? 'Pause Epoch' : 'Simulate Colonization'}</span>
            </button>

            <div className={styles.epochSliderBox}>
              <div className={styles.epochLabelRow}>
                <span>Cosmic Epoch: {Math.round(epochMyr)} Million Years</span>
                <span>Max: 500 Myr</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="2"
                value={epochMyr}
                onChange={(e) => setEpochMyr(Number(e.target.value))}
                className={styles.epochSlider}
              />
            </div>
          </div>

          <div className={styles.colonizedBadge}>
            <Icon name="atom" size={13} />
            <span>Colonized Systems: {colonizedCount.toLocaleString()} / 9,000</span>
          </div>
        </div>
      </div>

      {/* Dashboard Panel */}
      <div className={styles.dashboard}>
        {/* Scenario Presets Selector */}
        <div className={styles.scenarioRow}>
          <span className={styles.scenarioTitle}>Great Filter Scenarios:</span>
          <div className={styles.scenarioChips}>
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                className={`${styles.scenarioChip} ${activeScenario === sc.id ? styles.scenarioChipActive : ''}`}
                onClick={() => applyScenario(sc.id)}
              >
                <span>{sc.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Drake Equation Parameters Grid */}
        <div className={styles.drakeGrid}>
          <div className={styles.drakeCard}>
            <div className={styles.drakeHeader}>
              <span className={styles.drakeParamSymbol}>R*</span>
              <span className={styles.drakeParamVal}>{drake.rStar} stars/yr</span>
            </div>
            <span className={styles.drakeParamDesc}>Average rate of star formation in Milky Way</span>
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.1"
              value={drake.rStar}
              onChange={(e) => setDrake({ ...drake, rStar: Number(e.target.value) })}
              className={styles.drakeSlider}
            />
          </div>

          <div className={styles.drakeCard}>
            <div className={styles.drakeHeader}>
              <span className={styles.drakeParamSymbol}>f_p</span>
              <span className={styles.drakeParamVal}>{(drake.fPlanets * 100).toFixed(0)}%</span>
            </div>
            <span className={styles.drakeParamDesc}>Fraction of stars hosting planetary systems</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={drake.fPlanets}
              onChange={(e) => setDrake({ ...drake, fPlanets: Number(e.target.value) })}
              className={styles.drakeSlider}
            />
          </div>

          <div className={styles.drakeCard}>
            <div className={styles.drakeHeader}>
              <span className={styles.drakeParamSymbol}>n_e</span>
              <span className={styles.drakeParamVal}>{drake.nHabitable} planets</span>
            </div>
            <span className={styles.drakeParamDesc}>Habitable zone planets per star with planets</span>
            <input
              type="range"
              min="0.02"
              max="1.5"
              step="0.02"
              value={drake.nHabitable}
              onChange={(e) => setDrake({ ...drake, nHabitable: Number(e.target.value) })}
              className={styles.drakeSlider}
            />
          </div>

          <div className={styles.drakeCard}>
            <div className={styles.drakeHeader}>
              <span className={styles.drakeParamSymbol}>f_l</span>
              <span className={styles.drakeParamVal}>{(drake.fLife * 100).toFixed(1)}%</span>
            </div>
            <span className={styles.drakeParamDesc}>Fraction of habitable worlds where life emerges</span>
            <input
              type="range"
              min="0.001"
              max="1.0"
              step="0.01"
              value={drake.fLife}
              onChange={(e) => setDrake({ ...drake, fLife: Number(e.target.value) })}
              className={styles.drakeSlider}
            />
          </div>

          <div className={styles.drakeCard}>
            <div className={styles.drakeHeader}>
              <span className={styles.drakeParamSymbol}>f_i</span>
              <span className={styles.drakeParamVal}>{(drake.fIntel * 100).toFixed(1)}%</span>
            </div>
            <span className={styles.drakeParamDesc}>Fraction of life-bearing worlds evolving intelligence</span>
            <input
              type="range"
              min="0.001"
              max="1.0"
              step="0.01"
              value={drake.fIntel}
              onChange={(e) => setDrake({ ...drake, fIntel: Number(e.target.value) })}
              className={styles.drakeSlider}
            />
          </div>

          <div className={styles.drakeCard}>
            <div className={styles.drakeHeader}>
              <span className={styles.drakeParamSymbol}>f_c</span>
              <span className={styles.drakeParamVal}>{(drake.fComm * 100).toFixed(1)}%</span>
            </div>
            <span className={styles.drakeParamDesc}>Fraction developing detectable radio/laser signals</span>
            <input
              type="range"
              min="0.001"
              max="1.0"
              step="0.01"
              value={drake.fComm}
              onChange={(e) => setDrake({ ...drake, fComm: Number(e.target.value) })}
              className={styles.drakeSlider}
            />
          </div>

          <div className={styles.drakeCard}>
            <div className={styles.drakeHeader}>
              <span className={styles.drakeParamSymbol}>L</span>
              <span className={styles.drakeParamVal}>{drake.lifetime.toLocaleString()} yrs</span>
            </div>
            <span className={styles.drakeParamDesc}>Communicative longevity of advanced civilizations</span>
            <input
              type="range"
              min="100"
              max="1000000"
              step="1000"
              value={drake.lifetime}
              onChange={(e) => setDrake({ ...drake, lifetime: Number(e.target.value) })}
              className={styles.drakeSlider}
            />
          </div>
        </div>

        {/* Astrobiological Summary Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Galactic Transit Time (0.01c)</span>
            <span className={styles.statVal} style={{ color: '#E5A93C' }}>
              ~50 Myr
            </span>
            <span className={styles.statDesc}>0.36% of galactic age (13.6 Gyr)</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Stars In Simulation</span>
            <span className={styles.statVal} style={{ color: '#F9FAFB' }}>
              9,000
            </span>
            <span className={styles.statDesc}>Sampled across 4 logarithmic arms</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>The Paradoxical Crux</span>
            <span className={styles.statVal} style={{ color: calculatedN > 100 ? '#F87171' : '#34D399' }}>
              {calculatedN > 100 ? 'Deep Contradiction' : 'Rare Solitude'}
            </span>
            <span className={styles.statDesc}>
              {calculatedN > 100
                ? 'High N predicts total colonization, yet skies are silent'
                : 'Silence aligns with extreme biological filters'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
