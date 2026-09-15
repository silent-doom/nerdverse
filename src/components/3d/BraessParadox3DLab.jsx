'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './BraessParadox3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

// Traffic Audio Synthesizer
function playTrafficSound(type = 'toggle') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'toggle') {
      // Hydraulic gate / bridge construction latch
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'horn') {
      // Vintage commuter car horn on gridlock
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(370, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'chime') {
      // Flow restored harmonic chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // User audio gesture required
  }
}

export default function BraessParadox3DLab() {
  const mountRef = useRef(null);

  // ── Tab: 'diamond' (1968 Network) | 'caseStudies' (Real-World) | 'beyondCars' (Packets & Grids) ──
  const [activeTab, setActiveTab] = useState('diamond');

  // ── Network Simulation State ──
  const [isBypassOpen, setIsBypassOpen] = useState(false);
  const [commuterCount, setCommuterCount] = useState(4000); // 1000 to 5000 cars

  // ── Calculated Commute Metrics ──
  const [commuteTime, setCommuteTime] = useState(65); // Minutes
  const [priceOfAnarchy, setPriceOfAnarchy] = useState(1.0); // 1.0 = optimal, > 1.0 = wasteful
  const [activeRouteText, setActiveRouteText] = useState('Dual Balanced Equilibrium (50% / 50%)');
  const [hasRecorded, setHasRecorded] = useState(false);

  // ── Real-World Case Studies ──
  const [selectedCase, setSelectedCase] = useState('seoul'); // 'seoul' | 'nyc' | 'stuttgart'

  // Sync refs for Three.js animation loop
  const bypassRef = useRef(isBypassOpen);
  const commutersRef = useRef(commuterCount);

  useEffect(() => { bypassRef.current = isBypassOpen; }, [isBypassOpen]);
  useEffect(() => { commutersRef.current = commuterCount; }, [commuterCount]);

  // Recalculate Braess Network Commute Times
  useEffect(() => {
    const N = commuterCount;

    if (!isBypassOpen) {
      // Bypass CLOSED: 50% on Route 1 (S -> A -> D), 50% on Route 2 (S -> B -> D)
      // Route 1: (N/2)/100 + 45 = N/200 + 45
      // Route 2: 45 + (N/2)/100 = 45 + N/200
      const duration = Math.round(N / 200 + 45);
      setCommuteTime(duration);
      setPriceOfAnarchy(1.0);
      setActiveRouteText('Dual Route 50/50 Balanced Flow (Social Optimum)');
    } else {
      // Bypass OPEN: Every selfish driver chooses S -> A -> B -> D
      // S -> A: N / 100
      // A -> B: 0 min (Bypass)
      // B -> D: N / 100
      // Total = 2 * (N / 100) = N / 50
      const duration = Math.round((N / 100) * 2);
      setCommuteTime(duration);

      const optimalDuration = Math.round(N / 200 + 45);
      const poa = Number((duration / optimalDuration).toFixed(2));
      setPriceOfAnarchy(poa);
      setActiveRouteText('All 100% Funneled Into Bypass (Nash Gridlock Trap)');
    }
  }, [isBypassOpen, commuterCount]);

  // Toggle Bypass Switch
  const toggleBypass = useCallback(() => {
    setIsBypassOpen(prev => {
      const next = !prev;
      if (next) {
        playTrafficSound('horn');
      } else {
        playTrafficSound('chime');
      }
      return next;
    });
  }, []);

  // Record Telemetry
  const handleRecordRun = useCallback(async () => {
    playTrafficSound('toggle');
    await recordConceptRun('braess-paradox', 'single', {
      tab: activeTab,
      isBypassOpen,
      commuterCount,
      commuteTime,
      priceOfAnarchy,
    });
    setHasRecorded(true);
    setTimeout(() => setHasRecorded(false), 2400);
  }, [activeTab, isBypassOpen, commuterCount, commuteTime, priceOfAnarchy]);

  // ── Three.js Scene Setup ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 560;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c16);
    scene.fog = new THREE.FogExp2(0x080c16, 0.025);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 9.5, 13.5);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    if (renderer.shadowMap) renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    mainLight.position.set(8, 12, 6);
    scene.add(mainLight);

    const orangeFill = new THREE.PointLight(0xf59e0b, 1.5, 20);
    orangeFill.position.set(0, 3, 0);
    scene.add(orangeFill);

    // ── 4. Ground Grid & Water Canyon ──
    const groundGeo = new THREE.PlaneGeometry(28, 20);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0c1220, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(28, 28, 0x1e293b, 0x111827);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // River Gorge between North and South
    const riverGeo = new THREE.PlaneGeometry(24, 2.8);
    const riverMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.6 });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, 0.02, 0);
    scene.add(river);

    // ── 5. Diamond Network Nodes (S, D, A, B) ──
    const nodes = {
      S: new THREE.Vector3(-6.5, 0.4, 0),    // Suburb (Origin)
      D: new THREE.Vector3(6.5, 0.4, 0),     // Downtown (Destination)
      A: new THREE.Vector3(0, 0.4, -4.8),    // North Junction
      B: new THREE.Vector3(0, 0.4, 4.8),     // South Junction
    };

    const createHub = (pos, name, color, labelText) => {
      const hubGroup = new THREE.Group();
      hubGroup.position.copy(pos);

      // Pedestal
      const baseGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.4, 16);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      hubGroup.add(base);

      // Glowing Beacon Core
      const beaconGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 0.45;
      hubGroup.add(beacon);

      // Pillar / Building spire for Downtown
      if (name === 'D') {
        const spireGeo = new THREE.BoxGeometry(0.5, 2.0, 0.5);
        const spireMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.y = 1.4;
        hubGroup.add(spire);
      }

      scene.add(hubGroup);
      return hubGroup;
    };

    createHub(nodes.S, 'S', 0x10b981, 'Origin (Suburb)');
    createHub(nodes.D, 'D', 0x38bdf8, 'Downtown (CBD)');
    createHub(nodes.A, 'A', 0xa855f7, 'Node A (North)');
    createHub(nodes.B, 'B', 0xf59e0b, 'Node B (South)');

    // ── 6. Road Ribbons Builder ──
    const createRoad = (start, end, color = 0x334155, isHighway = false) => {
      const distance = start.distanceTo(end);
      const roadGeo = new THREE.BoxGeometry(0.6, 0.08, distance);
      const roadMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.6,
        metalness: 0.3,
      });
      const road = new THREE.Mesh(roadGeo, roadMat);

      const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      road.position.copy(midPoint);
      road.lookAt(end);

      scene.add(road);
      return road;
    };

    // 4 Primary Segments:
    // S -> A: Congestion bridge (T/100)
    const roadSA = createRoad(nodes.S, nodes.A, 0x475569);
    // A -> D: Highway (45m)
    const roadAD = createRoad(nodes.A, nodes.D, 0x1e293b, true);
    // S -> B: Highway (45m)
    const roadSB = createRoad(nodes.S, nodes.B, 0x1e293b, true);
    // B -> D: Congestion bridge (T/100)
    const roadBD = createRoad(nodes.B, nodes.D, 0x475569);

    // ── 7. The Super-Bypass Highway (A -> B) ──
    const bypassGeo = new THREE.BoxGeometry(0.75, 0.12, nodes.A.distanceTo(nodes.B));
    const bypassMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const bypassMesh = new THREE.Mesh(bypassGeo, bypassMat);
    const midAB = new THREE.Vector3().addVectors(nodes.A, nodes.B).multiplyScalar(0.5);
    bypassMesh.position.copy(midAB);
    bypassMesh.lookAt(nodes.B);
    scene.add(bypassMesh);

    // Bypass Suspension Tower Cables
    const cableGeo = new THREE.CylinderGeometry(0.04, 0.04, 9.6);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.set(0, 2.5, 0);
    cable.rotation.x = Math.PI / 2;
    scene.add(cable);

    // ── 8. Vehicle Particles (Cars flowing along paths) ──
    const vehiclesGroup = new THREE.Group();
    scene.add(vehiclesGroup);

    const vehicleCount = 64;
    const vehicles = [];

    const carGeo = new THREE.BoxGeometry(0.24, 0.14, 0.42);
    const carMatNorth = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.5 });
    const carMatSouth = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 0.5 });
    const carMatBypass = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 0.8 });

    for (let i = 0; i < vehicleCount; i++) {
      const car = new THREE.Mesh(carGeo, i % 2 === 0 ? carMatNorth : carMatSouth);
      vehiclesGroup.add(car);
      vehicles.push({
        mesh: car,
        progress: (i / vehicleCount),
        routeType: i % 2 === 0 ? 'north' : 'south', // 'north' | 'south' | 'bypass'
      });
    }

    // Window Resize
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
    let camAngleX = 0.5;

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
      camAngleX = Math.max(0.2, Math.min(0.85, camAngleX + deltaY * 0.005));
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

      // Camera Orbit Position
      const dist = 16.5;
      camera.position.x = Math.sin(camAngleY) * Math.cos(camAngleX) * dist;
      camera.position.z = Math.cos(camAngleY) * Math.cos(camAngleX) * dist;
      camera.position.y = Math.sin(camAngleX) * dist + 2.0;
      camera.lookAt(0, 0.4, 0);

      // Bypass Visual Appearance
      const bypassOpen = bypassRef.current;
      bypassMesh.visible = bypassOpen;
      cable.visible = bypassOpen;

      if (bypassOpen) {
        bypassMat.opacity = 0.7 + Math.sin(time * 4) * 0.2;
      }

      // Move Vehicle Particles
      // When bypass is open, traffic moves significantly slower due to severe congestion
      const baseSpeed = bypassOpen ? 0.08 : 0.18;

      vehicles.forEach((v) => {
        v.progress = (v.progress + delta * baseSpeed) % 1.0;

        let currentPos = new THREE.Vector3();
        let targetLook = new THREE.Vector3();

        if (!bypassOpen) {
          // 50% North: S -> A -> D
          if (v.routeType === 'north') {
            v.mesh.material = carMatNorth;
            if (v.progress < 0.5) {
              const t = v.progress / 0.5;
              currentPos.lerpVectors(nodes.S, nodes.A, t);
              targetLook.copy(nodes.A);
            } else {
              const t = (v.progress - 0.5) / 0.5;
              currentPos.lerpVectors(nodes.A, nodes.D, t);
              targetLook.copy(nodes.D);
            }
          } else {
            // 50% South: S -> B -> D
            v.mesh.material = carMatSouth;
            if (v.progress < 0.5) {
              const t = v.progress / 0.5;
              currentPos.lerpVectors(nodes.S, nodes.B, t);
              targetLook.copy(nodes.B);
            } else {
              const t = (v.progress - 0.5) / 0.5;
              currentPos.lerpVectors(nodes.B, nodes.D, t);
              targetLook.copy(nodes.D);
            }
          }
        } else {
          // 100% Funneled Into Bypass: S -> A -> B -> D
          v.mesh.material = carMatBypass;
          if (v.progress < 0.35) {
            const t = v.progress / 0.35;
            currentPos.lerpVectors(nodes.S, nodes.A, t);
            targetLook.copy(nodes.A);
          } else if (v.progress < 0.65) {
            const t = (v.progress - 0.35) / 0.3;
            currentPos.lerpVectors(nodes.A, nodes.B, t);
            targetLook.copy(nodes.B);
          } else {
            const t = (v.progress - 0.65) / 0.35;
            currentPos.lerpVectors(nodes.B, nodes.D, t);
            targetLook.copy(nodes.D);
          }
        }

        currentPos.y += 0.2;
        v.mesh.position.copy(currentPos);
        v.mesh.lookAt(targetLook);
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
      aria-label="Braess's Paradox 3D Interactive Laboratory"
      data-testid="braess-paradox-3d-lab"
    >
      {/* 3D Canvas Area */}
      <div className={styles.canvasContainer}>
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Top Header & Telemetry Cluster */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="zap" size={13} />
              Dietrich Braess 1968 &bull; Decentralized Network Paradox
            </div>
            <h2 className={styles.labTitle}>Braess&apos;s Paradox</h2>
          </div>

          <div className={styles.statsCluster}>
            <div className={`${styles.statPill} ${isBypassOpen ? styles.statPillCrisis : ''}`}>
              <span className={styles.statLabel}>Average Commute Time</span>
              <span className={`${styles.statValue} ${isBypassOpen ? styles.statValueRose : styles.statValueEmerald}`}>
                {commuteTime} Minutes
              </span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Price of Anarchy (PoA)</span>
              <span className={`${styles.statValue} ${priceOfAnarchy > 1 ? styles.statValueRose : styles.statValueCyan}`}>
                {priceOfAnarchy}&times; {priceOfAnarchy > 1 ? '(Inefficient)' : '(Optimal)'}
              </span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Bypass Highway Status</span>
              <span className={`${styles.statValue} ${isBypassOpen ? styles.statValueRose : styles.statValueEmerald}`}>
                {isBypassOpen ? 'OPEN (Gridlock)' : 'CLOSED (Smooth Flow)'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Network HUD Overlay */}
        <div className={styles.networkHUD}>
          <div className={styles.bypassToggleBox}>
            <button
              type="button"
              className={`${styles.bypassBtn} ${isBypassOpen ? styles.bypassBtnOpen : styles.bypassBtnClosed}`}
              onClick={toggleBypass}
              aria-label={isBypassOpen ? 'Close Bypass Highway' : 'Open Bypass Highway'}
            >
              <Icon name={isBypassOpen ? 'alert-triangle' : 'shield'} size={15} />
              {isBypassOpen ? 'Demolish / Close Bypass (Restore 65m)' : 'Open New Super-Bypass Highway (0 min)'}
            </button>
          </div>

          <div className={styles.networkLegend}>
            <div className={styles.legendItem}>
              <div className={styles.legendDotNorth} />
              <span>Route 1: S &rarr; A &rarr; D</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDotSouth} />
              <span>Route 2: S &rarr; B &rarr; D</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDotBypass} />
              <span>Bypass: S &rarr; A &rarr; B &rarr; D</span>
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
            className={`${styles.tabBtn} ${activeTab === 'diamond' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('diamond')}
            role="tab"
            aria-selected={activeTab === 'diamond'}
          >
            <Icon name="grid" size={14} />
            1. The 1968 Diamond Road Network
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'caseStudies' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('caseStudies')}
            role="tab"
            aria-selected={activeTab === 'caseStudies'}
          >
            <Icon name="globe" size={14} />
            2. Real-World Road Demolitions (Seoul &amp; NYC)
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'beyondCars' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('beyondCars')}
            role="tab"
            aria-selected={activeTab === 'beyondCars'}
          >
            <Icon name="cpu" size={14} />
            3. Internet Packets &amp; Power Grids
          </button>
        </div>

        {/* Tab 1: Diamond Network */}
        {activeTab === 'diamond' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Traffic Volume Control</span>
                <span className={styles.cardSubtitle}>Decentralized Commuter Load</span>
              </div>

              <div className={styles.sliderBox}>
                <div className={styles.sliderHeader}>
                  <span>Total Commuters: {commuterCount} Cars</span>
                  <span className={styles.sliderValue}>{commuteTime} Min Average</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="5000"
                  step="500"
                  value={commuterCount}
                  onChange={(e) => setCommuterCount(Number(e.target.value))}
                  className={styles.rangeInput}
                  aria-label="Commuter Volume Slider"
                />
              </div>

              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
                  Network Routing Equilibrium:
                </div>
                <table className={styles.routeTable}>
                  <thead>
                    <tr>
                      <th>Route Path</th>
                      <th>Formula</th>
                      <th>Travel Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={!isBypassOpen ? styles.routeActiveRow : ''}>
                      <td>Route 1 (S &rarr; A &rarr; D)</td>
                      <td>T/100 + 45 min</td>
                      <td>{Math.round(commuterCount / 200 + 45)} min</td>
                    </tr>
                    <tr className={!isBypassOpen ? styles.routeActiveRow : ''}>
                      <td>Route 2 (S &rarr; B &rarr; D)</td>
                      <td>45 + T/100 min</td>
                      <td>{Math.round(commuterCount / 200 + 45)} min</td>
                    </tr>
                    <tr className={isBypassOpen ? styles.routeActiveRow : ''}>
                      <td>Bypass (S &rarr; A &rarr; B &rarr; D)</td>
                      <td>T/100 + 0 + T/100 min</td>
                      <td>{Math.round((commuterCount / 100) * 2)} min</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>The Paradoxical Mechanism</span>
                <span className={styles.cardSubtitle}>Why Building Roads Increases Traffic</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                When the 0-minute bypass between A and B is opened, route S &rarr; A &rarr; B &rarr; D becomes the <strong>strictly dominant strategy</strong> for every individual rational commuter.
                Because no single driver can unilaterally benefit by choosing the 45-minute highway, all drivers funnel into the bypass—overwhelming both bridge choke-points and surging commute durations from <strong>65 min to 80 min for everyone</strong>!
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, display: 'block' }}>The Price of Anarchy</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Decentralized selfish routing costs the city {priceOfAnarchy > 1 ? '+23% wasted human hours' : '0% extra delay'}.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Real-World Case Studies */}
        {activeTab === 'caseStudies' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Documented Historical Paradoxes</span>
                <span className={styles.cardSubtitle}>When Closing Roads Unclogged Cities</span>
              </div>

              <div className={styles.caseGrid}>
                <div
                  className={`${styles.caseCard} ${selectedCase === 'seoul' ? styles.caseCardActive : ''}`}
                  onClick={() => setSelectedCase('seoul')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.caseTitle}>🇰🇷 Seoul, South Korea (2003)</div>
                  <div className={styles.caseDesc}>
                    Demolishing a 6-lane elevated highway across downtown Seoul restored Cheonggyecheon stream, lowered city temperatures by 3.6&deg;C, and sped up traffic flow!
                  </div>
                </div>

                <div
                  className={`${styles.caseCard} ${selectedCase === 'nyc' ? styles.caseCardActive : ''}`}
                  onClick={() => setSelectedCase('nyc')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.caseTitle}>🗽 New York City (Earth Day 1990)</div>
                  <div className={styles.caseDesc}>
                    Closing Manhattan&apos;s congested 42nd Street was predicted to cause catastrophic gridlock; instead, midtown traffic speeds increased substantially.
                  </div>
                </div>

                <div
                  className={`${styles.caseCard} ${selectedCase === 'stuttgart' ? styles.caseCardActive : ''}`}
                  onClick={() => setSelectedCase('stuttgart')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.caseTitle}>🇩🇪 Stuttgart, Germany (1969)</div>
                  <div className={styles.caseDesc}>
                    A major newly constructed thoroughfare paralyzed the municipal road network; the city had to permanently tear it back up to restore equilibrium.
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Urban Planning Implications</span>
                <span className={styles.cardSubtitle}>Beyond Induced Demand</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                Braess&apos;s Paradox goes beyond standard induced demand. It reveals that the physical geometry of decentralized networks can create systemic equilibrium traps where added capacity acts like an attractor sink that destroys global throughput.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Beyond Cars */}
        {activeTab === 'beyondCars' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Cross-Domain Network Invariance</span>
                <span className={styles.cardSubtitle}>Internet Packets &amp; Power Lines</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: '#131b2a', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#f1f5f9' }}>🌐 Internet Packet Routing (OSPF / BGP)</div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                    When internet routers use distributed shortest-path algorithms, deploying a new high-speed optical trunkline can cause routers to divert all packets through it, saturating buffer queues and degrading global web latency.
                  </div>
                </div>

                <div style={{ background: '#131b2a', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#f1f5f9' }}>⚡ Electric AC Power Grids</div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                    Adding a low-impedance high-voltage transmission line alters alternating current phase angles across neighboring circuits, unexpectedly overloading distant transformers and triggering regional blackout cascades.
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>The Algorithmic Solution</span>
                <span className={styles.cardSubtitle}>Centralized Telemetry &amp; Congestion Pricing</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                Because uncoordinated individual actors naturally fall into Nash equilibrium traps, decentralized networks can only achieve optimal efficiency through centralized routing telemetry (like dynamic GPS re-routing) or congestion toll pricing that aligns private marginal cost with the social optimum.
              </p>
            </div>
          </div>
        )}

        {/* Global Action Row */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => {
              setIsBypassOpen(false);
              setCommuterCount(4000);
            }}
            aria-label="Reset Road Network"
          >
            <Icon name="rotate-ccw" size={15} />
            Reset Network
          </button>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleRecordRun}
            aria-label="Record Routing Telemetry"
          >
            <Icon name="check" size={15} />
            {hasRecorded ? 'Routing Logged!' : 'Record Routing Telemetry'}
          </button>
        </div>
      </div>
    </div>
  );
}
