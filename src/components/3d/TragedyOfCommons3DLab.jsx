'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './TragedyOfCommons3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

// Pastoral Sound Synthesizer
function playPastoralSound(type = 'cowbell') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'cowbell') {
      // Hollow metallic cowbell chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'collapse') {
      // Dull low rumbling wind on ecological collapse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'ostrom') {
      // Uplifting harmonic chord for sustainable balance
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + 0.35);
      });
    }
  } catch {
    // User audio gesture required
  }
}

export default function TragedyOfCommons3DLab() {
  const mountRef = useRef(null);

  // ── Tab: 'hardin' (1968 Open Access) | 'ostrom' (1990 Polycentric Governance) | 'modernCommons' ──
  const [activeTab, setActiveTab] = useState('hardin');

  // ── Simulation Parameters ──
  const [herdCount, setHerdCount] = useState(40); // 10 to 100 cows
  const [carryingCapacity] = useState(50); // Sustainable limit = 50 cows
  const [pastureBiomass, setPastureBiomass] = useState(82); // 0 - 100%
  const [farmerPrivateProfit, setFarmerPrivateProfit] = useState(40); // Arbitrary profit units
  const [collectiveHealth, setCollectiveHealth] = useState('Healthy & Productive');
  const [isPlaying, setIsPlaying] = useState(true);

  // ── Elinor Ostrom Governance Toggles (Mode 2) ──
  const [quotaEnabled, setQuotaEnabled] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);

  // ── Modern Commons Case Studies (Mode 3) ──
  const [modernDomain, setModernDomain] = useState('fishery'); // 'fishery' | 'carbon' | 'aquifer'

  // Telemetry state
  const [hasRecorded, setHasRecorded] = useState(false);

  // Sync refs for Three.js animation loop
  const herdCountRef = useRef(herdCount);
  const biomassRef = useRef(pastureBiomass);
  const isPlayingRef = useRef(isPlaying);
  const activeTabRef = useRef(activeTab);

  useEffect(() => { herdCountRef.current = herdCount; }, [herdCount]);
  useEffect(() => { biomassRef.current = pastureBiomass; }, [pastureBiomass]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  // Recalculate Pasture Biomass & Health Dynamics
  useEffect(() => {
    let effectiveHerd = herdCount;

    if (activeTab === 'ostrom') {
      if (quotaEnabled) effectiveHerd = Math.min(effectiveHerd, 35);
    }

    // Logistic carrying capacity ratio
    const loadRatio = effectiveHerd / carryingCapacity;

    let targetBiomass;
    if (loadRatio <= 0.7) {
      targetBiomass = 95;
    } else if (loadRatio <= 1.0) {
      targetBiomass = Math.round(95 - (loadRatio - 0.7) * 70); // 95 -> 74%
    } else if (loadRatio <= 1.4) {
      targetBiomass = Math.round(74 - (loadRatio - 1.0) * 110); // 74 -> 30%
    } else {
      targetBiomass = Math.max(5, Math.round(30 - (loadRatio - 1.4) * 45)); // Down to 5%
    }

    // Ostrom rotation boost
    if (activeTab === 'ostrom' && rotationEnabled) {
      targetBiomass = Math.min(100, targetBiomass + 18);
    }

    setPastureBiomass(targetBiomass);

    // Private Profit vs Collective Health
    const perCowYield = targetBiomass / 100;
    const profit = Math.round(effectiveHerd * perCowYield * 1.2);
    setFarmerPrivateProfit(profit);

    if (targetBiomass > 75) {
      setCollectiveHealth('Sustainable Equilibrium');
    } else if (targetBiomass > 45) {
      setCollectiveHealth('Overgrazing Warning');
    } else if (targetBiomass > 20) {
      setCollectiveHealth('Ecological Degradation');
    } else {
      setCollectiveHealth('Complete Soil Erosion (Tragedy)');
    }
  }, [herdCount, carryingCapacity, activeTab, quotaEnabled, rotationEnabled]);

  // Add 1 Cow to Herd (The Marginal +1 Utility Action)
  const addCow = useCallback(() => {
    playPastoralSound('cowbell');
    setHerdCount(c => Math.min(100, c + 5));
  }, []);

  // Reduce Herd
  const removeCow = useCallback(() => {
    setHerdCount(c => Math.max(10, c - 5));
  }, []);

  // Reset to Pristine Commons
  const resetCommons = useCallback(() => {
    setHerdCount(30);
    setPastureBiomass(92);
    setQuotaEnabled(false);
    setRotationEnabled(false);
    setMonitoringEnabled(false);
  }, []);

  // Record Telemetry Run
  const handleRecordRun = useCallback(async () => {
    await recordConceptRun('tragedy-of-the-commons', 'single', {
      tab: activeTab,
      herdCount,
      pastureBiomass,
      farmerPrivateProfit,
      collectiveHealth,
      quotaEnabled,
      rotationEnabled,
    });
    setHasRecorded(true);
    setTimeout(() => setHasRecorded(false), 2400);
  }, [activeTab, herdCount, pastureBiomass, farmerPrivateProfit, collectiveHealth, quotaEnabled, rotationEnabled]);

  // ── Three.js Scene Setup ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 560;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a141e);
    scene.fog = new THREE.FogExp2(0x0a141e, 0.025);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 7.5, 12);
    camera.lookAt(0, 0.5, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    if (renderer.shadowMap) renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Golden Sunlight
    const sunLight = new THREE.DirectionalLight(0xfef08a, 2.0);
    sunLight.position.set(10, 14, 8);
    scene.add(sunLight);

    // Soft Blue Sky Hemispheric Light
    const skyLight = new THREE.HemisphereLight(0x38bdf8, 0x166534, 0.6);
    scene.add(skyLight);

    // ── 4. Dynamic English Village Pasture Terrain ──
    const terrainGeo = new THREE.PlaneGeometry(24, 20, 32, 32);
    // Add gentle undulating topography
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      pos.setZ(i, Math.sin(u * 0.3) * 0.4 + Math.cos(v * 0.3) * 0.3);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x166534, // Default lush emerald green
      roughness: 0.8,
      metalness: 0.1,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // ── 5. Wooden Perimeter Fence ──
    const fenceGroup = new THREE.Group();
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const railGeo = new THREE.BoxGeometry(2.4, 0.08, 0.04);

    // Create a perimeter boundary box
    for (let x = -10; x <= 10; x += 2.2) {
      [-8, 8].forEach(z => {
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(x, 0.45, z);
        fenceGroup.add(post);

        const rail1 = new THREE.Mesh(railGeo, postMat);
        rail1.position.set(x + 1.1, 0.6, z);
        fenceGroup.add(rail1);
        const rail2 = new THREE.Mesh(railGeo, postMat);
        rail2.position.set(x + 1.1, 0.3, z);
        fenceGroup.add(rail2);
      });
    }
    scene.add(fenceGroup);

    // ── 6. Village Stone Well in Center ──
    const wellGroup = new THREE.Group();
    wellGroup.position.set(0, 0, 0);

    const stoneRingGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.65, 16, 1, true);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const stoneRing = new THREE.Mesh(stoneRingGeo, stoneMat);
    stoneRing.position.y = 0.32;
    wellGroup.add(stoneRing);

    // Water inside well
    const waterGeo = new THREE.CircleGeometry(0.68, 16);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.8 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.25;
    wellGroup.add(water);

    // Wooden Roof Posts
    const roofPostGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4);
    const roofPost1 = new THREE.Mesh(roofPostGeo, postMat);
    roofPost1.position.set(-0.6, 0.85, 0);
    const roofPost2 = new THREE.Mesh(roofPostGeo, postMat);
    roofPost2.position.set(0.6, 0.85, 0);
    wellGroup.add(roofPost1);
    wellGroup.add(roofPost2);

    // Gabled Well Roof
    const roofGeo = new THREE.ConeGeometry(0.9, 0.5, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 1.7;
    roof.rotation.y = Math.PI / 4;
    wellGroup.add(roof);

    scene.add(wellGroup);

    // ── 7. Rustic Barn / Hay Silo on Edge ──
    const barnGroup = new THREE.Group();
    barnGroup.position.set(-8.5, 0, -6);

    const barnBodyGeo = new THREE.BoxGeometry(3.2, 2.2, 2.4);
    const barnBodyMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 });
    const barnBody = new THREE.Mesh(barnBodyGeo, barnBodyMat);
    barnBody.position.y = 1.1;
    barnGroup.add(barnBody);

    const barnRoofGeo = new THREE.ConeGeometry(2.4, 1.2, 4);
    const barnRoofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const barnRoof = new THREE.Mesh(barnRoofGeo, barnRoofMat);
    barnRoof.position.y = 2.7;
    barnRoof.rotation.y = Math.PI / 4;
    barnGroup.add(barnRoof);

    // Silo Cylinder
    const siloGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.2, 16);
    const siloMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.3 });
    const silo = new THREE.Mesh(siloGeo, siloMat);
    silo.position.set(2.4, 1.6, 0);
    barnGroup.add(silo);

    scene.add(barnGroup);

    // ── 8. Cattle Herd Instancing / Procedural Cows ──
    const cattleGroup = new THREE.Group();
    scene.add(cattleGroup);

    const cows = [];
    const createCow = (index) => {
      const cow = new THREE.Group();

      // Body
      const bodyGeo = new THREE.BoxGeometry(0.7, 0.45, 1.0);
      const isBlackWhite = index % 2 === 0;
      const cowMat = new THREE.MeshStandardMaterial({
        color: isBlackWhite ? 0xe2e8f0 : 0x78350f,
        roughness: 0.6,
      });
      const body = new THREE.Mesh(bodyGeo, cowMat);
      body.position.y = 0.55;
      cow.add(body);

      // Head
      const headGeo = new THREE.BoxGeometry(0.32, 0.32, 0.4);
      const head = new THREE.Mesh(headGeo, cowMat);
      head.position.set(0, 0.65, 0.65);
      cow.add(head);

      // Horns
      const hornGeo = new THREE.ConeGeometry(0.04, 0.15, 6);
      const hornMat = new THREE.MeshStandardMaterial({ color: 0xfde68a });
      const hornL = new THREE.Mesh(hornGeo, hornMat);
      hornL.position.set(-0.16, 0.85, 0.6);
      hornL.rotation.z = -0.3;
      const hornR = new THREE.Mesh(hornGeo, hornMat);
      hornR.position.set(0.16, 0.85, 0.6);
      hornR.rotation.z = 0.3;
      cow.add(hornL);
      cow.add(hornR);

      // 4 Legs
      const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
      [
        [-0.25, 0.2, -0.35],
        [0.25, 0.2, -0.35],
        [-0.25, 0.2, 0.35],
        [0.25, 0.2, 0.35],
      ].forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        cow.add(leg);
      });

      // Scatter position in meadow
      const angle = (index * 0.45) % (Math.PI * 2);
      const radius = 2.5 + ((index * 1.3) % 6.5);
      cow.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
      cow.rotation.y = Math.random() * Math.PI * 2;

      cattleGroup.add(cow);
      return { cow, head, baseRotY: cow.rotation.y };
    };

    // Pre-create 60 cow entities
    for (let i = 0; i < 60; i++) {
      cows.push(createCow(i));
    }

    // Window Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ── Mouse Drag Orbit Controls ──
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let camAngleY = 0;
    let camAngleX = 0.3;

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

      camAngleY -= deltaX * 0.005;
      camAngleX = Math.max(0.1, Math.min(0.8, camAngleX + deltaY * 0.005));
    };

    const onMouseUp = () => { isDragging = false; };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // ── Animation Loop ──
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Camera Orbit Positioning
      const distance = 14;
      camera.position.x = Math.sin(camAngleY) * Math.cos(camAngleX) * distance;
      camera.position.z = Math.cos(camAngleY) * Math.cos(camAngleX) * distance;
      camera.position.y = Math.sin(camAngleX) * distance + 2.0;
      camera.lookAt(0, 0.8, 0);

      // Dynamic Pasture Color based on current Biomass
      const bio = biomassRef.current;
      let rCol, gCol, bCol;
      if (bio > 70) {
        // Lush Emerald Green
        const factor = (bio - 70) / 30;
        rCol = 0.08 + (1 - factor) * 0.25;
        gCol = 0.5 + factor * 0.25;
        bCol = 0.2;
      } else if (bio > 30) {
        // Yellowish Green to Khaki Brown
        const factor = (bio - 30) / 40;
        rCol = 0.65 - factor * 0.32;
        gCol = 0.45 + factor * 0.15;
        bCol = 0.1;
      } else {
        // Parched Dusty Mud & Desert
        const factor = bio / 30;
        rCol = 0.38 + factor * 0.2;
        gCol = 0.2 + factor * 0.15;
        bCol = 0.08;
      }
      terrainMat.color.setRGB(rCol, gCol, bCol);

      // Active Cows based on herdCount
      const visibleCows = Math.min(cows.length, Math.round(herdCountRef.current * 0.6));
      cows.forEach((item, idx) => {
        const isVisible = idx < visibleCows;
        item.cow.visible = isVisible;

        if (isVisible) {
          // Bob head to graze
          item.head.position.y = 0.55 + Math.sin(time * 2 + idx) * 0.1;
          item.cow.position.x += Math.sin(time * 0.4 + idx) * 0.003;
        }
      });

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
      aria-label="Tragedy of the Commons 3D Interactive Laboratory"
      data-testid="tragedy-of-commons-3d-lab"
    >
      {/* 3D Canvas Container */}
      <div className={styles.canvasContainer}>
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Top Header & Telemetry Cluster */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="sun" size={13} />
              Garrett Hardin 1968 &bull; Elinor Ostrom 1990
            </div>
            <h2 className={styles.labTitle}>Tragedy of the Commons</h2>
          </div>

          <div className={styles.statsCluster}>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Village Herd Size</span>
              <span className={`${styles.statValue} ${styles.statValueCyan}`}>{herdCount} Cattle</span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Pasture Biomass</span>
              <span className={`${styles.statValue} ${pastureBiomass > 60 ? styles.statValueEmerald : pastureBiomass > 30 ? styles.statValueAmber : styles.statValueRose}`}>
                {pastureBiomass}% Regrowth
              </span>
            </div>
            <div className={`${styles.statPill} ${pastureBiomass < 25 ? styles.statPillCrisis : ''}`}>
              <span className={styles.statLabel}>Commons State</span>
              <span className={`${styles.statValue} ${pastureBiomass > 70 ? styles.statValueEmerald : pastureBiomass > 35 ? styles.statValueAmber : styles.statValueRose}`}>
                {collectiveHealth}
              </span>
            </div>
          </div>
        </div>

        {/* Biomass Regrowth HUD Overlay */}
        <div className={styles.biomassHUD}>
          <div className={styles.biomassGaugeBox}>
            <div className={styles.biomassHeader}>
              <span>Pasture Ecological Health (Carrying Capacity K = 50)</span>
              <span>{pastureBiomass}%</span>
            </div>
            <div className={styles.progressBarBg}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${pastureBiomass}%`,
                  backgroundColor: pastureBiomass > 70 ? '#10b981' : pastureBiomass > 35 ? '#f59e0b' : '#f43f5e',
                }}
              />
            </div>
          </div>

          <div className={styles.hudMeta}>
            <div className={styles.carryingPill}>
              Private Utility: +{farmerPrivateProfit} Gold
            </div>
            <div className={styles.carryingPill}>
              Shared Cost: -{Math.max(0, Math.round((herdCount - carryingCapacity) * 2.5))}% Erosion
            </div>
          </div>
        </div>
      </div>

      {/* Primary Control Deck */}
      <div className={styles.controlDeck}>
        {/* Navigation Tabs */}
        <div className={styles.tabsRow} role="tablist">
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'hardin' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('hardin')}
            role="tab"
            aria-selected={activeTab === 'hardin'}
          >
            <Icon name="users" size={14} />
            1. Hardin&apos;s 1968 Unmanaged Commons
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'ostrom' ? styles.tabBtnActive : ''}`}
            onClick={() => {
              setActiveTab('ostrom');
              playPastoralSound('ostrom');
            }}
            role="tab"
            aria-selected={activeTab === 'ostrom'}
          >
            <Icon name="shield" size={14} />
            2. Ostrom&apos;s 1990 Polycentric Governance (Nobel Prize)
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'modernCommons' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('modernCommons')}
            role="tab"
            aria-selected={activeTab === 'modernCommons'}
          >
            <Icon name="globe" size={14} />
            3. Global Commons: Fisheries &amp; Carbon Sinks
          </button>
        </div>

        {/* Tab 1: Hardin's Unmanaged Commons */}
        {activeTab === 'hardin' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Herdsman Marginal Incentive</span>
                <span className={styles.cardSubtitle}>The Logic of Depletion</span>
              </div>

              <div className={styles.sliderBox}>
                <div className={styles.sliderHeader}>
                  <span>Total Village Herd: {herdCount} Cattle</span>
                  <span className={styles.sliderValue}>{herdCount > carryingCapacity ? 'OVER CAPACITY' : 'SUSTAINABLE'}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={herdCount}
                  onChange={(e) => setHerdCount(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Village Herd Size Slider"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={addCow}
                  aria-label="Add Another Cow (+1 Utility)"
                >
                  <Icon name="plus" size={14} />
                  Add Another Cow (+1)
                </button>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={removeCow}
                  aria-label="Remove Cattle"
                >
                  <Icon name="minus" size={14} />
                  Reduce Herd (-5)
                </button>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>The Asymmetry of Externalities</span>
                <span className={styles.cardSubtitle}>Why Freedom Brings Ruin</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                When a herdsman adds an extra cow, he captures <strong>100% of the private economic profit</strong> from selling the animal.
                However, the cost of the overgrazed pasture is distributed equally among all fifty village farmers (<strong>-1/50th</strong> per farmer).
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #f43f5e' }}>
                <em>&ldquo;Ruin is the destination toward which all men rush, more or less freely, in a world that is fundamentally limited.&rdquo;</em>
                <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>— Garrett Hardin, Science (1968)</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Elinor Ostrom's Polycentric Governance */}
        {activeTab === 'ostrom' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Community Self-Governance Rules</span>
                <span className={styles.cardSubtitle}>Elinor Ostrom Nobel Model</span>
              </div>

              <div className={styles.policyList}>
                <div
                  className={`${styles.policyItem} ${quotaEnabled ? styles.policyItemActive : ''}`}
                  onClick={() => setQuotaEnabled(!quotaEnabled)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.policyInfo}>
                    <span className={styles.policyName}>1. Community Grazing Quota</span>
                    <span className={styles.policyDesc}>Caps total herd at 35 cattle to protect root systems</span>
                  </div>
                  <div className={`${styles.policySwitch} ${quotaEnabled ? styles.policySwitchActive : ''}`}>
                    <div className={styles.policySwitchKnob} />
                  </div>
                </div>

                <div
                  className={`${styles.policyItem} ${rotationEnabled ? styles.policyItemActive : ''}`}
                  onClick={() => setRotationEnabled(!rotationEnabled)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.policyInfo}>
                    <span className={styles.policyName}>2. Pasture Sector Rotation</span>
                    <span className={styles.policyDesc}>Resting sectors allows soil &amp; seeds to recover (+18% biomass)</span>
                  </div>
                  <div className={`${styles.policySwitch} ${rotationEnabled ? styles.policySwitchActive : ''}`}>
                    <div className={styles.policySwitchKnob} />
                  </div>
                </div>

                <div
                  className={`${styles.policyItem} ${monitoringEnabled ? styles.policyItemActive : ''}`}
                  onClick={() => setMonitoringEnabled(!monitoringEnabled)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.policyInfo}>
                    <span className={styles.policyName}>3. Peer Inspection &amp; Graduated Fines</span>
                    <span className={styles.policyDesc}>Community monitors penalize clandestine overgrazers</span>
                  </div>
                  <div className={`${styles.policySwitch} ${monitoringEnabled ? styles.policySwitchActive : ''}`}>
                    <div className={styles.policySwitchKnob} />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Disproving the False Dichotomy</span>
                <span className={styles.cardSubtitle}>Beyond State Tyranny &amp; Privatization</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                For decades, economists insisted that only total state coercion or private corporate fences could prevent tragedy.
                Elinor Ostrom studied centuries-old Swiss alpine pastures and Japanese common forests, proving that <strong>trust, localized rules, and mutual accountability</strong> enable communities to sustainably govern common-pool resources indefinitely without centralized intervention.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Modern Macro Commons */}
        {activeTab === 'modernCommons' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Select Depletable Global Commons</span>
                <span className={styles.cardSubtitle}>21st-Century Externalities</span>
              </div>

              <div className={styles.scenarioSelector}>
                <div
                  className={`${styles.scenarioBtn} ${modernDomain === 'fishery' ? styles.scenarioBtnActive : ''}`}
                  onClick={() => setModernDomain('fishery')}
                  role="button"
                  tabIndex={0}
                >
                  <Icon name="anchor" size={16} />
                  <span style={{ fontSize: '11.5px', fontWeight: 700 }}>Ocean Fisheries</span>
                </div>
                <div
                  className={`${styles.scenarioBtn} ${modernDomain === 'carbon' ? styles.scenarioBtnActive : ''}`}
                  onClick={() => setModernDomain('carbon')}
                  role="button"
                  tabIndex={0}
                >
                  <Icon name="cloud" size={16} />
                  <span style={{ fontSize: '11.5px', fontWeight: 700 }}>Atmosphere Sink</span>
                </div>
                <div
                  className={`${styles.scenarioBtn} ${modernDomain === 'aquifer' ? styles.scenarioBtnActive : ''}`}
                  onClick={() => setModernDomain('aquifer')}
                  role="button"
                  tabIndex={0}
                >
                  <Icon name="droplet" size={16} />
                  <span style={{ fontSize: '11.5px', fontWeight: 700 }}>Groundwater Aquifer</span>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', marginTop: '6px' }}>
                {modernDomain === 'fishery' && (
                  <span>Factory trawlers scrape international sea floors. If one country halts overfishing, rivals harvest the rest. Solution: Tradable catch shares.</span>
                )}
                {modernDomain === 'carbon' && (
                  <span>Emitting carbon yields private industrial profit, while climate disruption is externalized globally. Solution: Pigouvian carbon taxes.</span>
                )}
                {modernDomain === 'aquifer' && (
                  <span>Agricultural wells pump fossil aquifers faster than rainwater recharge. Solution: Polycentric watershed management boards.</span>
                )}
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Institutional Engineering</span>
                <span className={styles.cardSubtitle}>Aligning Private Profit with Public Survival</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                The Tragedy of the Commons is not an inevitable law of human nature; it is a symptom of incomplete institutional design.
                By internalizing environmental externalities, societies turn destructive zero-sum looting into positive-sum regeneration.
              </p>
            </div>
          </div>
        )}

        {/* Global Action Row */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={resetCommons}
            aria-label="Reset Commons"
          >
            <Icon name="rotate-ccw" size={15} />
            Reset Meadow
          </button>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleRecordRun}
            aria-label="Record Commons Telemetry"
          >
            <Icon name="check" size={15} />
            {hasRecorded ? 'Ecological Run Logged!' : 'Record Commons Telemetry'}
          </button>
        </div>
      </div>
    </div>
  );
}
