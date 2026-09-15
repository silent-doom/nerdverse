'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './RedQueen3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

// Biological Sound Synthesizer
function playBioSound(type = 'pulse', freq = 340) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'mutation') {
      // Shimmering chime on genetic mutation
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'infection') {
      // Low discordant thud on cell infection
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else {
      // Cellular metabolic pulse
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch {
    // Audio context may require user gesture
  }
}

export default function RedQueen3DLab() {
  const mountRef = useRef(null);

  // ── Mode: 'armsRace' | 'costOfSex' | 'cheetahGazelle' ──
  const [activeMode, setActiveMode] = useState('armsRace');
  const modeRef = useRef('armsRace');

  // ── Mode 1 & General Co-evolution Controls ──
  const [hostMutationRate, setHostMutationRate] = useState(65); // 0 - 100%
  const [pathogenVirulence, setPathogenVirulence] = useState(60); // 0 - 100%
  const [isPlaying, setIsPlaying] = useState(true);
  const [generation, setGeneration] = useState(1);

  // ── Mode 2: Asexual Monoculture vs Sexual Recombination ──
  const [reproStrategy, setReproStrategy] = useState('sexual'); // 'asexual' | 'sexual'
  const reproRef = useRef('sexual');

  // ── Mode 3: Predator vs Prey Agility ──
  const [predatorSpeed, setPredatorSpeed] = useState(70);
  const [preyAgility, setPreyAgility] = useState(70);

  // ── Telemetry & Evolutionary Metrics ──
  const [relativeVelocity, setRelativeVelocity] = useState(0.0); // 0.0 = locked in place (Red Queen equilibrium)
  const [infectionRate, setInfectionRate] = useState(38); // 0 - 100%
  const [immuneDiversity, setImmuneDiversity] = useState(88); // 0 - 100%
  const [hasRecorded, setHasRecorded] = useState(false);

  // Sync refs for Three.js animation loop
  const isPlayingRef = useRef(isPlaying);
  const hostMutationRef = useRef(hostMutationRate);
  const pathogenVirulenceRef = useRef(pathogenVirulence);
  const predatorSpeedRef = useRef(predatorSpeed);
  const preyAgilityRef = useRef(preyAgility);

  useEffect(() => { modeRef.current = activeMode; }, [activeMode]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { hostMutationRef.current = hostMutationRate; }, [hostMutationRate]);
  useEffect(() => { pathogenVirulenceRef.current = pathogenVirulence; }, [pathogenVirulence]);
  useEffect(() => { reproRef.current = reproStrategy; }, [reproStrategy]);
  useEffect(() => { predatorSpeedRef.current = predatorSpeed; }, [predatorSpeed]);
  useEffect(() => { preyAgilityRef.current = preyAgility; }, [preyAgility]);

  // Recalculate evolutionary dynamics when parameters shift
  useEffect(() => {
    if (activeMode === 'costOfSex') {
      if (reproStrategy === 'asexual') {
        setImmuneDiversity(10);
        setInfectionRate(92);
        setRelativeVelocity(-1.8); // Falling behind
      } else {
        setImmuneDiversity(94);
        setInfectionRate(24);
        setRelativeVelocity(0.0); // Equilibrium
      }
    } else {
      const vDiff = (hostMutationRate - pathogenVirulence) / 25;
      setRelativeVelocity(Number(vDiff.toFixed(2)));
      const infect = Math.max(10, Math.min(95, Math.round(50 + (pathogenVirulence - hostMutationRate) * 0.6)));
      setInfectionRate(infect);
      setImmuneDiversity(Math.round(hostMutationRate * 0.9 + 10));
    }
  }, [activeMode, hostMutationRate, pathogenVirulence, reproStrategy]);

  // Three.js object references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const hostGroupRef = useRef(null);
  const pathogenGroupRef = useRef(null);
  const treadmillRef = useRef(null);
  const predatorMeshRef = useRef(null);
  const preyMeshRef = useRef(null);

  // ── Step Forward 1 Generation ──
  const stepGeneration = useCallback(() => {
    setGeneration(g => g + 1);
    playBioSound('mutation', 440 + Math.random() * 200);

    // Random host spike mutation trigger
    if (hostGroupRef.current) {
      hostGroupRef.current.children.forEach(cell => {
        if (cell.material && cell.material.color) {
          if (reproRef.current === 'asexual') {
            cell.material.color.setHex(0x38bdf8); // Monoculture clone
          } else {
            const colors = [0x38bdf8, 0x10b981, 0xa855f7, 0xf59e0b, 0xf43f5e];
            cell.material.color.setHex(colors[Math.floor(Math.random() * colors.length)]);
          }
        }
      });
    }
  }, []);

  // Trigger Telemetry Record
  const handleRecordRun = useCallback(async () => {
    await recordConceptRun('red-queen-hypothesis', 'single', {
      mode: activeMode,
      hostMutationRate,
      pathogenVirulence,
      reproStrategy,
      infectionRate,
    });
    setHasRecorded(true);
    setTimeout(() => setHasRecorded(false), 2400);
  }, [activeMode, hostMutationRate, pathogenVirulence, reproStrategy, infectionRate]);

  // ── Three.js Scene Setup ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 560;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0610);
    scene.fog = new THREE.FogExp2(0x0a0610, 0.02);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 5.2, 9.5);
    camera.lookAt(0, 0.4, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    if (renderer.shadowMap) renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Cinematic Biological Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf43f5e, 1.8);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const cyanRim = new THREE.DirectionalLight(0x38bdf8, 1.4);
    cyanRim.position.set(-6, 6, -4);
    scene.add(cyanRim);

    const bioGlow = new THREE.PointLight(0xa855f7, 2.0, 15);
    bioGlow.position.set(0, 1.5, 0);
    scene.add(bioGlow);

    // ── 4. The Red Queen Treadmill Floor ──
    const treadmillGeo = new THREE.PlaneGeometry(16, 8, 32, 16);
    const treadmillMat = new THREE.MeshStandardMaterial({
      color: 0x140d1e,
      roughness: 0.5,
      metalness: 0.7,
      wireframe: false,
    });
    const treadmill = new THREE.Mesh(treadmillGeo, treadmillMat);
    treadmill.rotation.x = -Math.PI / 2;
    treadmill.position.y = -0.01;
    scene.add(treadmill);
    treadmillRef.current = treadmill;

    // Treadmill Grid Track Lines
    const gridHelper = new THREE.GridHelper(16, 16, 0xf43f5e, 0x27142b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // ── 5. Host Organisms (Bioluminescent Cells with Receptor Spikes) ──
    const hostGroup = new THREE.Group();
    scene.add(hostGroup);
    hostGroupRef.current = hostGroup;

    const cellGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const spikeGeo = new THREE.ConeGeometry(0.08, 0.28, 8);

    const hostPositions = [
      [-1.8, 0.8, 0],
      [0, 0.9, 0.4],
      [1.8, 0.8, -0.2],
      [-0.9, 1.4, -0.6],
      [1.0, 1.5, 0.5]
    ];

    const hostPalette = [0x38bdf8, 0x10b981, 0xa855f7, 0xf59e0b, 0xf43f5e];

    hostPositions.forEach(([hx, hy, hz], idx) => {
      const cellMat = new THREE.MeshStandardMaterial({
        color: hostPalette[idx % hostPalette.length],
        emissive: hostPalette[idx % hostPalette.length],
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.4,
      });
      const cell = new THREE.Mesh(cellGeo, cellMat);
      cell.position.set(hx, hy, hz);

      // Add receptor spikes around cell surface
      for (let s = 0; s < 10; s++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const spike = new THREE.Mesh(spikeGeo, cellMat);
        spike.position.set(
          0.58 * Math.sin(phi) * Math.cos(theta),
          0.58 * Math.sin(phi) * Math.sin(theta),
          0.58 * Math.cos(phi)
        );
        spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), spike.position.clone().normalize());
        cell.add(spike);
      }
      hostGroup.add(cell);
    });

    // ── 6. Mutating Parasite Swarm (Viral Bacteriophages) ──
    const pathogenGroup = new THREE.Group();
    scene.add(pathogenGroup);
    pathogenGroupRef.current = pathogenGroup;

    const virusGeo = new THREE.IcosahedronGeometry(0.12, 1);
    const virusMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8,
    });

    const virusCount = 36;
    for (let v = 0; v < virusCount; v++) {
      const virus = new THREE.Mesh(virusGeo, virusMat);
      virus.position.set(
        (Math.random() - 0.5) * 6,
        0.4 + Math.random() * 2.2,
        (Math.random() - 0.5) * 4
      );
      pathogenGroup.add(virus);
    }

    // ── 7. Predator vs Prey Runners (Mode 3 Cheetah & Gazelle) ──
    const predatorGeo = new THREE.ConeGeometry(0.35, 1.1, 16);
    const predatorMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.7 });
    const predator = new THREE.Mesh(predatorGeo, predatorMat);
    predator.rotation.z = -Math.PI / 2;
    predator.position.set(-2.4, 0.7, 1.8);
    predator.visible = false;
    scene.add(predator);
    predatorMeshRef.current = predator;

    const preyGeo = new THREE.ConeGeometry(0.3, 0.95, 16);
    const preyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.7 });
    const prey = new THREE.Mesh(preyGeo, preyMat);
    prey.rotation.z = -Math.PI / 2;
    prey.position.set(0.6, 0.7, 1.8);
    prey.visible = false;
    scene.add(prey);
    preyMeshRef.current = prey;

    // ── Mouse Drag Orbit Controls ──
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = Math.PI / 2;
    let sphericalPhi = 0.48;
    const radius = 9.8;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = (e.clientX - prevMouseX) * 0.005;
      const dy = (e.clientY - prevMouseY) * 0.005;

      sphericalTheta -= dx;
      sphericalPhi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, sphericalPhi + dy));

      camera.position.x = radius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = radius * Math.cos(sphericalPhi);
      camera.position.z = radius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 0.4, 0);

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => { isDragging = false; };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

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

    // ── Animation Loop ──
    let animationId;
    let lastTime = performance.now();

    const animate = (time) => {
      animationId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const currentMode = modeRef.current;

      // Mode Visibility Toggles
      if (predatorMeshRef.current && preyMeshRef.current) {
        predatorMeshRef.current.visible = (currentMode === 'cheetahGazelle');
        preyMeshRef.current.visible = (currentMode === 'cheetahGazelle');
      }

      // 1. Treadmill movement (Shows "Running to Stay in Place")
      if (treadmillRef.current && gridHelper) {
        const speed = isPlayingRef.current ? 1.5 : 0;
        gridHelper.position.z = (gridHelper.position.z + delta * speed) % 1.0;
      }

      // 2. Cellular Organism Hover & Spikes Rotation
      if (hostGroupRef.current) {
        hostGroupRef.current.visible = (currentMode !== 'cheetahGazelle');
        hostGroupRef.current.children.forEach((cell, idx) => {
          cell.position.y += Math.sin(time * 0.002 + idx) * 0.0015;
          cell.rotation.y += delta * 0.4;
          cell.rotation.x += delta * 0.2;
        });
      }

      // 3. Mutating Virus Swarm Orbiting
      if (pathogenGroupRef.current) {
        pathogenGroupRef.current.visible = (currentMode !== 'cheetahGazelle');
        const virulenceFactor = (pathogenVirulenceRef.current || 60) / 50;
        pathogenGroupRef.current.children.forEach((virus, idx) => {
          const angle = time * 0.001 * virulenceFactor + idx;
          const radiusOrbit = 2.2 + (idx % 3) * 0.8;
          virus.position.x = Math.sin(angle) * radiusOrbit;
          virus.position.z = Math.cos(angle) * radiusOrbit;
          virus.position.y = 0.8 + Math.sin(time * 0.003 + idx) * 0.6;
          virus.rotation.x += delta * 2;
          virus.rotation.y += delta * 2;
        });
      }

      // 4. Mode 3 Cheetah vs Gazelle Dynamics
      if (currentMode === 'cheetahGazelle' && predatorMeshRef.current && preyMeshRef.current) {
        const predSpd = (predatorSpeedRef.current || 70) / 70;
        const preySpd = (preyAgilityRef.current || 70) / 70;
        const relativeGap = 3.0 + (preySpd - predSpd) * 1.5;

        preyMeshRef.current.position.x = -0.5 + relativeGap / 2;
        predatorMeshRef.current.position.x = -0.5 - relativeGap / 2;

        preyMeshRef.current.position.y = 0.7 + Math.abs(Math.sin(time * 0.008 * preySpd)) * 0.25;
        predatorMeshRef.current.position.y = 0.7 + Math.abs(Math.sin(time * 0.008 * predSpd)) * 0.25;
      }

      renderer.render(scene, camera);
    };

    animationId = requestAnimationFrame(animate);

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

  return (
    <div
      className={styles.labContainer}
      aria-label="The Red Queen Hypothesis 3D Interactive Lab"
      data-testid="red-queen-3d-lab"
    >
      {/* Canvas Area */}
      <div className={styles.canvasContainer}>
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Top HUD */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="atom" size={13} />
              Leigh Van Valen 1973 Evolutionary Engine
            </div>
            <h2 className={styles.labTitle}>The Red Queen Hypothesis</h2>
          </div>

          <div className={styles.statsCluster}>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Generation</span>
              <span className={`${styles.statValue} ${styles.statValueCyan}`}>Gen #{generation}</span>
            </div>
            <div className={`${styles.statPill} ${infectionRate > 75 ? styles.statPillCrisis : ''}`}>
              <span className={styles.statLabel}>Infection Threat</span>
              <span className={`${styles.statValue} ${styles.statValueRose}`}>{infectionRate}% Vulnerable</span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Immune Diversity Index</span>
              <span className={`${styles.statValue} ${styles.statValueEmerald}`}>{immuneDiversity}% Polymorphic</span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Relative Velocity (Δv)</span>
              <span className={`${styles.statValue} ${styles.statValueCyan}`}>
                {relativeVelocity === 0 ? '0.0 (Treadmill Lock)' : `${relativeVelocity > 0 ? '+' : ''}${relativeVelocity}`}
              </span>
            </div>
          </div>
        </div>

        {/* Treadmill HUD */}
        <div className={styles.treadmillHUD}>
          <div className={styles.treadmillInfo}>
            <div className={styles.treadmillTitle}>
              <Icon name="repeat" size={14} />
              The Evolutionary Treadmill (Running to Stay in Place)
            </div>
            <div className={styles.treadmillDesc}>
              {activeMode === 'armsRace' && (
                <span>Hosts mutate receptor spikes to avoid infection; parasites mutate antigen keys to breach defenses. Extinction probability remains constant over millions of years.</span>
              )}
              {activeMode === 'costOfSex' && (
                <span>Asexual clones reproduce 2× faster but create a genetic monoculture. Mutating parasites wipe out 100% of clones, explaining why sexual reproduction evolved!</span>
              )}
              {activeMode === 'cheetahGazelle' && (
                <span>Faster cheetahs select for faster gazelles. Both species run twice as fast as their ancestors, yet the catch rate stays locked at 50%.</span>
              )}
            </div>
          </div>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={stepGeneration}
            aria-label="Step Generation"
          >
            <Icon name="chevron-right" size={14} />
            Step Generation (+1)
          </button>
        </div>
      </div>

      {/* Primary Control Deck */}
      <div className={styles.controlDeck}>
        {/* Navigation Tabs */}
        <div className={styles.tabsRow} role="tablist">
          <button
            type="button"
            className={`${styles.tabBtn} ${activeMode === 'armsRace' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveMode('armsRace')}
            role="tab"
            aria-selected={activeMode === 'armsRace'}
          >
            <Icon name="shield" size={14} />
            1. Host-Parasite Arms Race
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeMode === 'costOfSex' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveMode('costOfSex')}
            role="tab"
            aria-selected={activeMode === 'costOfSex'}
          >
            <Icon name="users" size={14} />
            2. The Mystery of Sex (Clones vs Diversity)
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeMode === 'cheetahGazelle' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveMode('cheetahGazelle')}
            role="tab"
            aria-selected={activeMode === 'cheetahGazelle'}
          >
            <Icon name="zap" size={14} />
            3. Cheetah vs Gazelle Locomotion
          </button>
        </div>

        {/* Tab 1: Host-Parasite Arms Race */}
        {activeMode === 'armsRace' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Host Immune Mutation Rate</span>
                <span className={styles.sliderValue}>{hostMutationRate}% Speed</span>
              </div>
              <div className={styles.sliderBox}>
                <div className={styles.sliderHeader}>
                  <span>Stagnant Immune System</span>
                  <span>Rapid Allele Shuffling</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={hostMutationRate}
                  onChange={(e) => setHostMutationRate(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Host Mutation Rate"
                />
              </div>

              <div className={styles.cardHeader} style={{ marginTop: '12px' }}>
                <span>Parasite Virulence & Adaptation</span>
                <span className={styles.sliderValue}>{pathogenVirulence}% Adapt</span>
              </div>
              <div className={styles.sliderBox}>
                <div className={styles.sliderHeader}>
                  <span>Mild Pathogen</span>
                  <span>Hyper-Mutating Virus</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={pathogenVirulence}
                  onChange={(e) => setPathogenVirulence(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Pathogen Virulence"
                />
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Van Valen&apos;s Law of Extinction (1973)</span>
                <span className={styles.cardSubtitle}>Constant Extinction Risk</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0 }}>
                  A species does not become more immune to extinction as it gets older. Because its competitors, predators, and pathogens are also evolving, its relative adaptive fitness remains constant:
                </p>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #f43f5e' }}>
                  <em>&ldquo;Now, here, you see, it takes all the running you can do, to keep in the same place.&rdquo;</em>
                  <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>— The Red Queen to Alice, Through the Looking-Glass</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: The Two-Fold Cost of Sex */}
        {activeMode === 'costOfSex' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Select Reproduction Strategy</span>
                <span className={styles.cardSubtitle}>The Evolutionary Paradox of Sex</span>
              </div>
              <div className={styles.reproSelector}>
                <div
                  className={`${styles.reproCard} ${reproStrategy === 'asexual' ? styles.reproCardActive : ''}`}
                  onClick={() => setReproStrategy('asexual')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.reproTitle}>Asexual Clones (2× Reproduction)</div>
                  <div className={styles.reproDesc}>
                    Fastest growth, but 100% identical receptor coat. Once a virus mutates the master key, the entire colony collapses.
                  </div>
                </div>

                <div
                  className={`${styles.reproCard} ${reproStrategy === 'sexual' ? styles.reproCardActive : ''}`}
                  onClick={() => setReproStrategy('sexual')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.reproTitle}>Sexual Recombination (Diversity)</div>
                  <div className={styles.reproDesc}>
                    Costs 50% fitness (males don&apos;t bear offspring), but creates diverse polymorphic surface locks that defeat pandemic extinction.
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Antibiotic & Oncology Relevance</span>
                <span className={styles.cardSubtitle}>Modern Red Queen Dynamics</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                Every time medical science introduces a new antibiotic or chemotherapy, bacteria and cancer cells evolve beta-lactamase enzymes or drug-efflux pumps. Medical pharmacology is permanently running on the Red Queen treadmill.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Cheetah vs Gazelle */}
        {activeMode === 'cheetahGazelle' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Predator Velocity vs Prey Agility</span>
                <span className={styles.cardSubtitle}>Co-Adaptive Escalation</span>
              </div>
              <div className={styles.sliderBox}>
                <div className={styles.sliderHeader}>
                  <span>Cheetah Acceleration: {predatorSpeed} km/h</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={predatorSpeed}
                  onChange={(e) => setPredatorSpeed(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Predator Speed"
                />
              </div>

              <div className={styles.sliderBox} style={{ marginTop: '10px' }}>
                <div className={styles.sliderHeader}>
                  <span>Gazelle Evasion Agility: {preyAgility} km/h</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={preyAgility}
                  onChange={(e) => setPreyAgility(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Prey Agility"
                />
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Locomotion Equivalence</span>
                <span className={styles.cardSubtitle}>Zero Net Darwinian Gain</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                Over evolutionary epochs, cheetahs became the fastest land mammals on Earth, while Thomson&apos;s gazelles developed equal speed and high-G turning. Both species expended enormous energy evolving, yet the predator capture rate remains unchanged.
              </p>
            </div>
          </div>
        )}

        {/* Action Controls Bar */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className={`${styles.primaryBtn} ${!isPlaying ? styles.paused : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            <Icon name={isPlaying ? 'pause' : 'play'} size={15} />
            {isPlaying ? 'Pause Coevolution' : 'Resume Coevolution'}
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={stepGeneration}
            aria-label="Advance Generation"
          >
            <Icon name="refresh" size={15} />
            Step Generation (+1)
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleRecordRun}
            aria-label="Record Evolutionary Telemetry"
          >
            <Icon name="check" size={15} />
            {hasRecorded ? 'Telemetry Synchronized!' : 'Record Evolutionary Telemetry'}
          </button>
        </div>
      </div>
    </div>
  );
}
