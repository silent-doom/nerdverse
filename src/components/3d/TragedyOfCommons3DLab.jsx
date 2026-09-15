'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './TragedyOfCommons3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

// ── Pastoral Sound Synthesizer ──
function playPastoralSound(type = 'bell') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'bell') {
      // Warm brass pastoral sheep bell chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } else if (type === 'collapse') {
      // Deep ominous erosion rumble
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(35, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'ostrom') {
      // Harmonic major chord for community balance
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
    // Audio gesture required
  }
}

// ── Realistic Procedural Fallbacks (Guarantees NO blocky cubes even if GLB delays) ──
function createProceduralSheep() {
  const group = new THREE.Group();
  group.name = 'ProceduralSheep';

  const woolMat = new THREE.MeshStandardMaterial({ color: 0xf1efe7, roughness: 0.9 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.7 });
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.6 });

  // Fluffy Woolly Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.46, 12, 12), woolMat);
  body.scale.set(1.25, 0.95, 0.95);
  body.position.set(0, 0.62, 0);
  body.castShadow = true;
  group.add(body);

  // Wool tufts around flank
  [
    [0.2, 0.72, 0.2],
    [-0.2, 0.72, -0.2],
    [0.0, 0.78, 0.0],
  ].forEach(([tx, ty, tz]) => {
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), woolMat);
    tuft.position.set(tx, ty, tz);
    group.add(tuft);
  });

  // Dark Suffolk Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), darkMat);
  head.position.set(0.48, 0.76, 0);
  head.scale.set(1.1, 0.8, 0.8);
  head.castShadow = true;
  group.add(head);

  // Grazing Muzzle
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.22, 8), darkMat);
  muzzle.rotation.z = -Math.PI / 3;
  muzzle.position.set(0.62, 0.68, 0);
  group.add(muzzle);

  // Drooping ears
  [-0.14, 0.14].forEach((ez) => {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.22, 6), darkMat);
    ear.rotation.x = ez * 3.5;
    ear.position.set(0.45, 0.76, ez);
    group.add(ear);
  });

  // Curled Horns
  [-0.12, 0.12].forEach((hz) => {
    const horn = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 12, Math.PI), hornMat);
    horn.rotation.y = hz > 0 ? 0.3 : -0.3;
    horn.rotation.x = Math.PI / 2;
    horn.position.set(0.44, 0.86, hz);
    group.add(horn);
  });

  // 4 Slender Legs with Hooves
  [
    [0.28, 0.18],
    [0.28, -0.18],
    [-0.28, 0.18],
    [-0.28, -0.18],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.42, 6), darkMat);
    leg.position.set(lx, 0.21, lz);
    leg.castShadow = true;
    group.add(leg);
  });

  return { group, head, muzzle };
}

export default function TragedyOfCommons3DLab() {
  const mountRef = useRef(null);

  // ── Tab: 'hardin' (1968 Open Access) | 'ostrom' (1990 Polycentric Governance) | 'modernCommons' ──
  const [activeTab, setActiveTab] = useState('hardin');

  // ── Livestock Species Preference: 'mixed' | 'sheep' | 'goat' ──
  const [livestockType, setLivestockType] = useState('mixed');
  const livestockTypeRef = useRef('mixed');

  // ── Camera Preset: 'panoramic' | 'flockLevel' | 'ostromSectors' | 'orbit' ──
  const [cameraPreset, setCameraPreset] = useState('panoramic');
  const cameraPresetRef = useRef('panoramic');

  // ── Simulation Parameters ──
  const [herdCount, setHerdCount] = useState(40); // 10 to 100 animals
  const [carryingCapacity] = useState(50); // Sustainable threshold = 50
  const [pastureBiomass, setPastureBiomass] = useState(82); // 0 - 100%
  const [farmerPrivateProfit, setFarmerPrivateProfit] = useState(40); // Profit units
  const [collectiveHealth, setCollectiveHealth] = useState('Healthy & Productive');
  const [isPlaying] = useState(true);

  // ── Elinor Ostrom Governance Toggles (Mode 2) ──
  const [quotaEnabled, setQuotaEnabled] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);

  // ── Modern Commons Case Studies (Mode 3) ──
  const [modernDomain, setModernDomain] = useState('fishery');

  // Telemetry state
  const [hasRecorded, setHasRecorded] = useState(false);

  // Sync refs for Three.js animation loop
  const herdCountRef = useRef(herdCount);
  const biomassRef = useRef(pastureBiomass);
  const activeTabRef = useRef(activeTab);
  const rotationRef = useRef(rotationEnabled);

  useEffect(() => { herdCountRef.current = herdCount; }, [herdCount]);
  useEffect(() => { biomassRef.current = pastureBiomass; }, [pastureBiomass]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { rotationRef.current = rotationEnabled; }, [rotationEnabled]);
  useEffect(() => { livestockTypeRef.current = livestockType; }, [livestockType]);
  useEffect(() => { cameraPresetRef.current = cameraPreset; }, [cameraPreset]);

  // Recalculate Pasture Biomass & Health Dynamics
  useEffect(() => {
    let effectiveHerd = herdCount;

    if (activeTab === 'ostrom') {
      if (quotaEnabled) effectiveHerd = Math.min(effectiveHerd, 35);
    }

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

    if (activeTab === 'ostrom' && rotationEnabled) {
      targetBiomass = Math.min(100, targetBiomass + 18);
    }

    setPastureBiomass(targetBiomass);

    const perAnimalYield = targetBiomass / 100;
    const profit = Math.round(effectiveHerd * perAnimalYield * 1.2);
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

  // Add 1 Cow / Livestock (The Marginal +1 Utility Action)
  const addCow = useCallback(() => {
    playPastoralSound('bell');
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
      livestockType,
    });
    setHasRecorded(true);
    setTimeout(() => setHasRecorded(false), 2400);
  }, [activeTab, herdCount, pastureBiomass, farmerPrivateProfit, collectiveHealth, quotaEnabled, rotationEnabled, livestockType]);

  // ── Three.js Scene Setup ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 580;

    // 1. Scene & Pastoral Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c131a);
    scene.fog = new THREE.FogExp2(0x0c131a, 0.022);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 7.8, 13.5);
    camera.lookAt(0, 0.6, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    if (renderer.shadowMap) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    mount.appendChild(renderer.domElement);

    // 3. Realistic Sunlight & Pastoral Sky
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.55);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 2.2);
    sunLight.position.set(12, 16, 9);
    sunLight.castShadow = true;
    if (sunLight.shadow) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 40;
      sunLight.shadow.bias = -0.0005;
    }
    scene.add(sunLight);

    const skyLight = new THREE.HemisphereLight(0x7dd3fc, 0x166534, 0.6);
    scene.add(skyLight);

    // ── 4. Dynamic Undulating English Commons Meadow ──
    const terrainGeo = new THREE.PlaneGeometry(28, 24, 40, 40);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      // Natural gentle pastoral hills and grazing knolls
      pos.setZ(i, Math.sin(u * 0.22) * 0.45 + Math.cos(v * 0.25) * 0.35 + Math.sin(u * 0.6 + v * 0.4) * 0.12);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.85,
      metalness: 0.05,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // ── 5. Wildflowers & Lush Clover System ──
    const flowerCount = 180;
    const flowerGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const flowerMatYellow = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 });
    const flowerMatWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    const flowerGroup = new THREE.Group();

    for (let i = 0; i < flowerCount; i++) {
      const isYellow = i % 2 === 0;
      const flower = new THREE.Mesh(flowerGeo, isYellow ? flowerMatYellow : flowerMatWhite);
      const angle = Math.random() * Math.PI * 2;
      const dist = 2.0 + Math.random() * 8.5;
      flower.position.set(Math.sin(angle) * dist, 0.15, Math.cos(angle) * dist);
      flowerGroup.add(flower);
    }
    scene.add(flowerGroup);

    // ── 6. Village Stone Well & Water Trough (The Central Commons Resource) ──
    const wellGroup = new THREE.Group();
    wellGroup.position.set(0, 0, 0);

    const stoneRingGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.7, 16, 1, true);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const stoneRing = new THREE.Mesh(stoneRingGeo, stoneMat);
    stoneRing.position.y = 0.35;
    stoneRing.castShadow = true;
    wellGroup.add(stoneRing);

    // Water Surface
    const waterGeo = new THREE.CircleGeometry(0.82, 16);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.85 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.28;
    wellGroup.add(water);

    // Timber Roof Structure
    const postMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.85 });
    const roofPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6), postMat);
    roofPost1.position.set(-0.7, 0.95, 0);
    roofPost1.castShadow = true;
    const roofPost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6), postMat);
    roofPost2.position.set(0.7, 0.95, 0);
    roofPost2.castShadow = true;
    wellGroup.add(roofPost1);
    wellGroup.add(roofPost2);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.65, 4), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }));
    roof.position.y = 1.95;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    wellGroup.add(roof);

    scene.add(wellGroup);

    // ── 7. Perimeter Dry-Stone Fencing ──
    const fenceGroup = new THREE.Group();
    const postGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.0, 8);
    const railGeo = new THREE.BoxGeometry(2.4, 0.09, 0.05);

    for (let x = -11; x <= 11; x += 2.4) {
      [-9.5, 9.5].forEach(z => {
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(x, 0.5, z);
        fenceGroup.add(post);

        const r1 = new THREE.Mesh(railGeo, postMat);
        r1.position.set(x + 1.2, 0.65, z);
        fenceGroup.add(r1);
        const r2 = new THREE.Mesh(railGeo, postMat);
        r2.position.set(x + 1.2, 0.35, z);
        fenceGroup.add(r2);
      });
    }
    scene.add(fenceGroup);

    // ── 8. Elinor Ostrom Rotational Paddock Fences (Toggled on Ostrom Mode) ──
    const ostromFenceGroup = new THREE.Group();
    // Cross fences dividing meadow into 4 sustainable rotating sectors
    for (let x = -9; x <= 9; x += 2.2) {
      if (Math.abs(x) > 1.2) {
        const crossRail = new THREE.Mesh(railGeo, postMat);
        crossRail.position.set(x, 0.45, 0);
        ostromFenceGroup.add(crossRail);
      }
    }
    for (let z = -8; z <= 8; z += 2.2) {
      if (Math.abs(z) > 1.2) {
        const crossRail = new THREE.Mesh(railGeo, postMat);
        crossRail.rotation.y = Math.PI / 2;
        crossRail.position.set(0, 0.45, z);
        ostromFenceGroup.add(crossRail);
      }
    }
    ostromFenceGroup.visible = false;
    scene.add(ostromFenceGroup);

    // ── 9. Authentic Sculpted 3D Livestock (Sheep & Goats) ──
    const livestockFlockGroup = new THREE.Group();
    scene.add(livestockFlockGroup);

    const flockEntities = [];
    const gltfLoader = new GLTFLoader();
    let sheepMasterScene = null;
    let goatMasterScene = null;

    // A. Pre-load real Blender models
    gltfLoader.load(
      '/models/sheep.glb',
      (gltf) => {
        sheepMasterScene = gltf.scene;
        sheepMasterScene.traverse((c) => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
          }
        });
        updateFlockModels();
      },
      undefined,
      (err) => console.warn('Using procedural sheep fallback:', err?.message || err)
    );

    gltfLoader.load(
      '/models/goat.glb',
      (gltf) => {
        goatMasterScene = gltf.scene;
        goatMasterScene.traverse((c) => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
          }
        });
        updateFlockModels();
      },
      undefined,
      (err) => console.warn('Using procedural goat fallback:', err?.message || err)
    );

    // Create 60 flock animals
    for (let i = 0; i < 60; i++) {
      const container = new THREE.Group();

      // Natural grazing cluster distribution around the meadow
      const angle = (i * 0.38) + (Math.sin(i) * 0.2);
      const radius = 2.4 + ((i * 1.25) % 7.2);
      container.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
      container.rotation.y = (i * 1.7) % (Math.PI * 2);

      // Default procedural fallback animal
      const proc = createProceduralSheep();
      container.add(proc.group);

      livestockFlockGroup.add(container);

      flockEntities.push({
        container,
        currentModel: proc.group,
        headObj: proc.head,
        baseX: container.position.x,
        baseZ: container.position.z,
        baseRotY: container.rotation.y,
        walkPhase: Math.random() * Math.PI * 2,
        chewSpeed: 1.5 + Math.random() * 1.5,
        species: i % 2 === 0 ? 'sheep' : 'goat',
      });
    }

    // Function to hot-swap procedural fallbacks with authentic Blender GLB scenes
    function updateFlockModels() {
      flockEntities.forEach((item, idx) => {
        const type = livestockTypeRef.current;
        const wantGoat = type === 'goat' || (type === 'mixed' && idx % 2 !== 0);

        if (wantGoat && goatMasterScene) {
          containerSwap(item, goatMasterScene.clone(true), 0.72);
        } else if (!wantGoat && sheepMasterScene) {
          containerSwap(item, sheepMasterScene.clone(true), 0.85);
        }
      });
    }

    function containerSwap(item, newModel, scale) {
      if (item.currentModel) {
        item.container.remove(item.currentModel);
      }
      newModel.scale.set(scale, scale, scale);
      newModel.position.set(0, 0, 0);
      item.container.add(newModel);
      item.currentModel = newModel;

      // Find head bone or head mesh for grazing animation
      let foundHead = null;
      newModel.traverse((child) => {
        if (!foundHead && (child.name.toLowerCase().includes('head') || child.name.toLowerCase().includes('neck'))) {
          foundHead = child;
        }
      });
      item.headObj = foundHead;
    }

    // ── Mouse Drag Orbit Controls ──
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let camAngleY = 0;
    let camAngleX = 0.32;
    let distance = 15.0;

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
      camAngleX = Math.max(0.08, Math.min(0.85, camAngleX + deltaY * 0.005));
    };

    const onMouseUp = () => { isDragging = false; };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ── Animation Loop ──
    let animationId;
    let lastTime = performance.now();

    const animate = (now) => {
      animationId = requestAnimationFrame(animate);
      const currentTime = typeof now === 'number' ? now : performance.now();
      const time = currentTime * 0.001;

      // 1. Camera Preset Coordinates
      const preset = cameraPresetRef.current;
      if (preset === 'panoramic') {
        // High village drone view showing the whole meadow
        camera.position.set(0, 8.2, 13.5);
        camera.lookAt(0, 0.8, 0);
      } else if (preset === 'flockLevel') {
        // Intimate ground level among grazing livestock
        camera.position.set(3.5, 1.4, 4.8);
        camera.lookAt(0, 0.8, 0);
      } else if (preset === 'ostromSectors') {
        // Perspective highlighting rotational paddocks
        camera.position.set(7.5, 9.5, 9.0);
        camera.lookAt(0, 0.4, 0);
      } else if (preset === 'orbit') {
        // Free user orbit
        camera.position.x = Math.sin(camAngleY) * Math.cos(camAngleX) * distance;
        camera.position.z = Math.cos(camAngleY) * Math.cos(camAngleX) * distance;
        camera.position.y = Math.sin(camAngleX) * distance + 2.0;
        camera.lookAt(0, 0.8, 0);
      }

      // 2. Ostrom Sector Fences Visibility
      if (ostromFenceGroup) {
        ostromFenceGroup.visible = (activeTabRef.current === 'ostrom' && rotationRef.current);
      }

      // 3. Dynamic Pasture Color & Erosion Degradation
      const bio = biomassRef.current;
      let rCol, gCol, bCol;
      if (bio > 70) {
        // Lush Emerald Green English Pasture
        const factor = (bio - 70) / 30;
        rCol = 0.08 + (1 - factor) * 0.22;
        gCol = 0.48 + factor * 0.24;
        bCol = 0.18;
      } else if (bio > 30) {
        // Yellowing Overgrazed / Trampled Soil
        const factor = (bio - 30) / 40;
        rCol = 0.62 - factor * 0.32;
        gCol = 0.42 + factor * 0.14;
        bCol = 0.12;
      } else {
        // Parched Cracked Desert Mud (The Tragedy)
        const factor = bio / 30;
        rCol = 0.36 + factor * 0.18;
        gCol = 0.20 + factor * 0.12;
        bCol = 0.09;
      }
      terrainMat.color.setRGB(rCol, gCol, bCol);

      // Water Trough clarity reflects commons health
      if (waterMat) {
        if (bio > 50) {
          waterMat.color.setHex(0x0284c7); // Clear blue
        } else {
          waterMat.color.setHex(0x713f12); // Muddy dried-up silt
        }
      }

      // Wildflowers wither as overgrazing strips vegetation
      if (flowerGroup) {
        flowerGroup.visible = bio > 40;
        flowerGroup.position.y = (bio - 40) * 0.004;
      }

      // 4. Live Grazing Behaviors across Flock
      const visibleAnimals = Math.min(flockEntities.length, Math.round(herdCountRef.current * 0.6));
      flockEntities.forEach((item, idx) => {
        const isVisible = idx < visibleAnimals;
        item.container.visible = isVisible;

        if (isVisible) {
          // Slow organic wandering steps
          const wanderX = Math.sin(time * 0.3 + item.walkPhase) * 0.15;
          const wanderZ = Math.cos(time * 0.35 + item.walkPhase) * 0.15;
          item.container.position.x = item.baseX + wanderX;
          item.container.position.z = item.baseZ + wanderZ;

          // Head grazing down to grass + rhythmic chewing
          const grazeCycle = Math.sin(time * item.chewSpeed + idx);
          if (item.headObj) {
            item.headObj.position.y = (item.headObj.position.y || 0.6) + grazeCycle * 0.008;
            item.headObj.rotation.x = Math.sin(time * 1.2 + idx) * 0.12;
            item.headObj.rotation.z = Math.sin(time * item.chewSpeed * 2) * 0.04;
          }

          // In crisis / soil erosion, animals exhibit hunger lethargy
          if (bio < 25) {
            item.container.position.y = -0.05; // Slightly crouched
          } else {
            item.container.position.y = 0;
          }
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
            <div className={styles.labQuote}>
              &ldquo;Freedom in a commons brings ruin to all.&rdquo; &mdash; Garrett Hardin
            </div>
          </div>

          <div className={styles.statsCluster}>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Village Herd Size</span>
              <span className={`${styles.statValue} ${styles.statValueCyan}`}>{herdCount} Cattle</span>
            </div>

            <div className={styles.statPill}>
              <span className={styles.statLabel}>Active Livestock</span>
              <span className={`${styles.statValue} ${styles.statValueEmerald}`}>
                {Math.round(herdCount * 0.6)} Grazing ({livestockType})
              </span>
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

        {/* View & Flock Selector Bar */}
        <div className={styles.viewControlsBar}>
          <div className={styles.viewBtnGroup}>
            <span className={styles.viewGroupLabel}>Camera:</span>
            <button
              type="button"
              className={`${styles.viewBtn} ${cameraPreset === 'panoramic' ? styles.viewBtnActive : ''}`}
              onClick={() => setCameraPreset('panoramic')}
            >
              Village Panoramic
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${cameraPreset === 'flockLevel' ? styles.viewBtnActive : ''}`}
              onClick={() => setCameraPreset('flockLevel')}
            >
              Flock Level
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${cameraPreset === 'ostromSectors' ? styles.viewBtnActive : ''}`}
              onClick={() => setCameraPreset('ostromSectors')}
            >
              Ostrom Paddocks
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${cameraPreset === 'orbit' ? styles.viewBtnActive : ''}`}
              onClick={() => setCameraPreset('orbit')}
            >
              3D Orbit
            </button>
          </div>

          <div className={styles.viewBtnGroup}>
            <span className={styles.viewGroupLabel}>Livestock:</span>
            <button
              type="button"
              className={`${styles.viewBtn} ${livestockType === 'mixed' ? styles.viewBtnActive : ''}`}
              onClick={() => setLivestockType('mixed')}
            >
              Sheep &amp; Goats
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${livestockType === 'sheep' ? styles.viewBtnActive : ''}`}
              onClick={() => setLivestockType('sheep')}
            >
              Suffolk Sheep
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${livestockType === 'goat' ? styles.viewBtnActive : ''}`}
              onClick={() => setLivestockType('goat')}
            >
              Alpine Goats
            </button>
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
                When a herdsman adds an extra animal, he captures <strong>100% of the private economic profit</strong> from selling the wool, milk, or meat.
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
                    <span className={styles.policyDesc}>Caps total herd at 35 livestock to protect root systems</span>
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
