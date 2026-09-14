'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './ShipOfTheseus3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

const NUM_PLANKS = 20; // 10 port + 10 starboard curved hull strakes

export default function ShipOfTheseus3DLab() {
  const mountRef = useRef(null);

  // ── Experiment Controls ──
  const [replacementPct, setReplacementPct] = useState(0); // 0 - 100%
  const replacementPctRef = useRef(0);

  // Aristotle's Four Causes: 'material' | 'formal' | 'efficient' | 'final'
  const [activeCause, setActiveCause] = useState('material');
  const activeCauseRef = useRef('material');

  // Hobbes Identity Verdict: null | 'shipA' | 'shipB' | 'both' | 'neither'
  const [verdict, setVerdict] = useState('shipA');
  const [hasVoted, setHasVoted] = useState(false);

  // Sync refs
  useEffect(() => {
    replacementPctRef.current = replacementPct;
  }, [replacementPct]);

  useEffect(() => {
    activeCauseRef.current = activeCause;
  }, [activeCause]);

  // Three.js scene refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const waterMeshRef = useRef(null);
  const shipAGroupRef = useRef(null);
  const shipBGroupRef = useRef(null);
  const planksARef = useRef([]);
  const planksBRef = useRef([]);
  const oarsARef = useRef([]);
  const auraMeshRef = useRef(null);

  // ── Materials ──
  const matsRef = useRef({});

  // ── Initialize Scene ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x080c14);
    scene.fog = new THREE.FogExp2(0x080c14, 0.035);

    const width = mount.clientWidth;
    const height = mount.clientHeight || 580;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.8, 9.2);
    camera.lookAt(0, 0.4, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffecd2, 1.4);
    sunLight.position.set(6, 12, 6);
    scene.add(sunLight);

    const amberRimLight = new THREE.DirectionalLight(0xe5a93c, 1.0);
    amberRimLight.position.set(-8, 3, -6);
    scene.add(amberRimLight);

    // 4. Materials Setup
    const agedWoodMat = new THREE.MeshStandardMaterial({
      color: 0x3d2b1f, // Weathered dark timber
      roughness: 0.85,
      metalness: 0.1,
    });
    const newOakMat = new THREE.MeshStandardMaterial({
      color: 0xd49b38, // Radiant polished golden oak
      roughness: 0.35,
      metalness: 0.2,
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      roughness: 0.9,
    });
    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0xcd7f32,
      metalness: 0.8,
      roughness: 0.3,
    });
    const sailMat = new THREE.MeshStandardMaterial({
      color: 0xede8d0,
      roughness: 0.95,
      side: THREE.DoubleSide,
    });
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xe5a93c,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    matsRef.current = { agedWoodMat, newOakMat, stoneMat, bronzeMat, sailMat, wireframeMat, glowMat };

    // 5. Aegean Water Plane
    const waterGeo = new THREE.PlaneGeometry(36, 36, 64, 64);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0a192f,
      roughness: 0.15,
      metalness: 0.7,
      transparent: true,
      opacity: 0.88,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = -0.4;
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // 6. Ancient Athenian Stone Harbor Quay & Dry Dock Scaffolding
    const pierGeo = new THREE.BoxGeometry(8.2, 1.8, 14);
    const pierMesh = new THREE.Mesh(pierGeo, stoneMat);
    pierMesh.position.set(5.4, 0.4, 0);
    scene.add(pierMesh);

    // Stone Mooring Bollards along edge of Quay
    const bollardMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.8 });
    for (let b = -5; b <= 5; b += 2.5) {
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.5, 16), bollardMat);
      bollard.position.set(1.5, 1.45, b);
      scene.add(bollard);

      // Coiled hemp rope ring at base of bollard
      const ropeRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 8, 16), agedWoodMat);
      ropeRing.rotation.x = Math.PI / 2;
      ropeRing.position.set(1.5, 1.25, b);
      scene.add(ropeRing);
    }

    // Heavy Timber Dry Dock Cradles & Bilge Shores holding Ship B
    for (let i = -3.6; i <= 3.6; i += 1.2) {
      // Keel blocks
      const block = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.4), agedWoodMat);
      block.position.set(5.4, 1.28, i);
      scene.add(block);

      // Diagonal timber shores (bilge struts) on port and starboard
      const shoreL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8), agedWoodMat);
      shoreL.rotation.z = Math.PI / 5.2;
      shoreL.position.set(3.9, 1.65, i);
      scene.add(shoreL);

      const shoreR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8), agedWoodMat);
      shoreR.rotation.z = -Math.PI / 5.2;
      shoreR.position.set(6.9, 1.65, i);
      scene.add(shoreR);
    }

    // Ancient Shipwright Crane & Tackle
    const craneGroup = new THREE.Group();
    const cranePole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.4, 16), agedWoodMat);
    cranePole.position.set(8.2, 3.6, 3.4);
    craneGroup.add(cranePole);
    const craneArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.4, 16), agedWoodMat);
    craneArm.rotation.z = Math.PI / 3.6;
    craneArm.position.set(6.7, 5.4, 3.4);
    craneGroup.add(craneArm);
    scene.add(craneGroup);

    // Terracotta Amphorae Storage Vessels
    const amphoraMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 });
    for (let a = 0; a < 4; a++) {
      const amphora = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.09, 0.65, 12), amphoraMat);
      amphora.position.set(8.3 + (a % 2) * 0.3, 1.55, -2.8 + a * 0.45);
      scene.add(amphora);
    }

    // Bronze Fire Braziers on the Quay Corners
    const brazierMat = new THREE.MeshStandardMaterial({ color: 0x262626, metalness: 0.9, roughness: 0.3 });
    const brazierL = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.8, 16), brazierMat);
    brazierL.position.set(1.6, 1.6, 5.8);
    scene.add(brazierL);
    const brazierLight = new THREE.PointLight(0xf59e0b, 1.8, 9);
    brazierLight.position.set(1.6, 2.2, 5.8);
    scene.add(brazierLight);

    // ── 7. Grand Athenian Galley Generator ──
    const createShip = (isDryDock) => {
      const shipGroup = new THREE.Group();
      const planks = [];
      const oars = [];

      // 1. Keel Spine (Heavy curved centerline timber)
      const keelMat = agedWoodMat;
      const keel = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 7.8), keelMat);
      keel.position.y = 0.05;
      shipGroup.add(keel);

      // 2. Bow Stempost (Rising curved prow)
      const stemGeo = new THREE.CylinderGeometry(0.18, 0.22, 2.6, 16);
      const stem = new THREE.Mesh(stemGeo, keelMat);
      stem.rotation.x = Math.PI / 4.8;
      stem.position.set(0, 1.15, 4.3);
      shipGroup.add(stem);

      // Athenian Sacred Eye (Ophthalmos) on Bow (Port & Starboard)
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
      for (const side of [-1, 1]) {
        const eyeBase = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), eyeMat);
        eyeBase.rotation.y = (side * Math.PI) / 2;
        eyeBase.position.set(side * 0.26, 1.4, 4.2);
        shipGroup.add(eyeBase);

        const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), pupilMat);
        pupil.rotation.y = (side * Math.PI) / 2;
        pupil.position.set(side * 0.27, 1.4, 4.2);
        shipGroup.add(pupil);
      }

      // 3. Bronze Naval Ram (Embolos) at waterline
      const ramGroup = new THREE.Group();
      const ramCore = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.8, 16), bronzeMat);
      ramCore.rotation.x = -Math.PI / 2;
      ramCore.scale.set(1.15, 0.75, 1.0);
      ramGroup.add(ramCore);

      // Triple-cutting blades on ram
      const finH = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.8), bronzeMat);
      finH.position.z = 0.3;
      ramGroup.add(finH);

      const finV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.8), bronzeMat);
      finV.position.z = 0.3;
      ramGroup.add(finV);

      // Upper Auxiliary Ram (Proembolion)
      const proem = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.0, 12), bronzeMat);
      proem.rotation.x = -Math.PI / 2;
      proem.position.set(0, 0.65, -0.2);
      ramGroup.add(proem);

      ramGroup.position.set(0, 0.12, 4.75);
      shipGroup.add(ramGroup);

      // 4. Stern Aphlaston (Sweeping ornamental goose-neck tail)
      const aphlastonGroup = new THREE.Group();
      const aphlastonCurve = new THREE.Mesh(
        new THREE.TorusGeometry(1.5, 0.18, 12, 32, Math.PI * 0.65),
        keelMat
      );
      aphlastonCurve.rotation.y = Math.PI / 2;
      aphlastonCurve.position.set(0, 1.35, -4.1);
      aphlastonGroup.add(aphlastonCurve);

      // Decorative bronze finials
      for (let f = 0; f < 3; f++) {
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.2), bronzeMat);
        leaf.position.set(0, 2.5 + f * 0.25, -4.7 + f * 0.15);
        aphlastonGroup.add(leaf);
      }
      shipGroup.add(aphlastonGroup);

      // 5. Timber Main Deck
      const deck = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.14, 7.2), agedWoodMat);
      deck.position.set(0, 0.72, -0.1);
      shipGroup.add(deck);

      // Captain's Aft Quarterdeck & Helming Platform
      const aftDeck = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.3, 1.8), agedWoodMat);
      aftDeck.position.set(0, 0.95, -3.1);
      shipGroup.add(aftDeck);

      // 6. Transverse Structural Ribs
      for (let r = -3.2; r <= 3.2; r += 0.8) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 0.14), agedWoodMat);
        rib.position.set(0, 0.78, r);
        shipGroup.add(rib);
      }

      // 7. Raised Bulwarks (Gunwales)
      for (const side of [-1, 1]) {
        const bulwark = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 7.2), agedWoodMat);
        bulwark.position.set(side * 1.22, 1.15, -0.1);
        shipGroup.add(bulwark);
      }

      // 8. Modular Hull Planking (10 Port, 10 Starboard)
      // Conforming precisely to ancient Greek galley curvature
      for (let i = 0; i < 10; i++) {
        const t = i / 9; // 0 to 1 along length
        const zPos = -3.3 + t * 6.6;
        const beamFactor = Math.sqrt(Math.max(0.15, 1 - Math.pow(zPos / 4.2, 2)));
        const beamW = 1.25 * beamFactor;
        const pLength = 0.72;
        const tangentAngle = Math.atan2(-2 * (zPos / 17.64), 1);

        // Port Plank
        const portPlank = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, pLength), agedWoodMat.clone());
        portPlank.position.set(-beamW, 0.38, zPos);
        portPlank.rotation.y = tangentAngle;
        portPlank.rotation.z = -0.28;
        shipGroup.add(portPlank);
        planks.push(portPlank);

        // Starboard Plank
        const starPlank = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, pLength), agedWoodMat.clone());
        starPlank.position.set(beamW, 0.38, zPos);
        starPlank.rotation.y = -tangentAngle;
        starPlank.rotation.z = 0.28;
        shipGroup.add(starPlank);
        planks.push(starPlank);
      }

      // 9. Greek Hoplon Shields (6 Port, 6 Starboard)
      const shieldColors = [0xb45309, 0x1e3a8a, 0x991b1b, 0x065f46];
      for (let s = 0; s < 6; s++) {
        const zShield = -2.4 + s * 0.95;
        const beamFactor = Math.sqrt(Math.max(0.2, 1 - Math.pow(zShield / 4.2, 2)));
        const xPos = 1.28 * beamFactor;

        for (const side of [-1, 1]) {
          const shieldGroup = new THREE.Group();
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 12, 24), bronzeMat);
          shieldGroup.add(rim);

          const faceMat = new THREE.MeshStandardMaterial({
            color: shieldColors[s % shieldColors.length],
            roughness: 0.4,
            metalness: 0.2,
          });
          const face = new THREE.Mesh(new THREE.CircleGeometry(0.33, 24), faceMat);
          shieldGroup.add(face);

          const boss = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), bronzeMat);
          boss.scale.z = 0.5;
          boss.position.z = 0.04;
          shieldGroup.add(boss);

          shieldGroup.rotation.y = (side * Math.PI) / 2;
          shieldGroup.position.set(side * xPos, 1.25, zShield);
          shipGroup.add(shieldGroup);
        }
      }

      // 10. Rowing Oars (10 Port, 10 Starboard)
      if (!isDryDock) {
        for (let o = 0; o < 10; o++) {
          const zOar = -2.8 + o * 0.62;
          const beamFactor = Math.sqrt(Math.max(0.2, 1 - Math.pow(zOar / 4.2, 2)));
          const xOar = 1.32 * beamFactor;

          for (const side of [-1, 1]) {
            const oarGroup = new THREE.Group();
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 3.2, 12), agedWoodMat);
            shaft.position.y = -1.2;
            oarGroup.add(shaft);

            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.04), agedWoodMat);
            blade.position.y = -2.4;
            oarGroup.add(blade);

            oarGroup.position.set(side * xOar, 0.65, zOar);
            oarGroup.rotation.z = side * (Math.PI / 3.4);
            oarGroup.rotation.x = Math.PI / 16;
            shipGroup.add(oarGroup);
            oars.push({ group: oarGroup, defaultZ: oarGroup.rotation.z, defaultX: oarGroup.rotation.x, side, index: o });
          }
        }
      }

      // 11. Twin Steering Rudders (Pedalia)
      for (const side of [-1, 1]) {
        const rudderGroup = new THREE.Group();
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.4), agedWoodMat);
        shaft.position.y = -1.2;
        rudderGroup.add(shaft);

        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.4, 0.07), agedWoodMat);
        blade.position.set(0, -2.0, -0.15);
        rudderGroup.add(blade);

        const tiller = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), agedWoodMat);
        tiller.rotation.z = Math.PI / 2;
        tiller.position.set(side * -0.3, 0.3, 0);
        rudderGroup.add(tiller);

        rudderGroup.position.set(side * 0.95, 0.85, -3.8);
        rudderGroup.rotation.x = Math.PI / 8;
        rudderGroup.rotation.y = side * -0.2;
        shipGroup.add(rudderGroup);
      }

      // 12. Main Mast & Yardarm
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 6.2, 16), agedWoodMat);
      mast.position.set(0, 3.2, 0.4);
      shipGroup.add(mast);

      const yardarm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.8, 16), agedWoodMat);
      yardarm.rotation.z = Math.PI / 2;
      yardarm.position.set(0, 5.4, 0.45);
      shipGroup.add(yardarm);

      // 13. Billowing Linen Sail
      const sailGeo = new THREE.CylinderGeometry(2.4, 2.4, 3.4, 24, 8, true, -Math.PI * 0.35, Math.PI * 0.7);
      sailGeo.rotateY(Math.PI / 2);
      const sail = new THREE.Mesh(sailGeo, sailMat);
      sail.position.set(0, 3.8, 0.95);
      sail.scale.set(1.0, 1.0, 0.55);
      shipGroup.add(sail);

      // 14. Rigging Lines (Stays & Shrouds)
      const ropeMat = new THREE.LineBasicMaterial({ color: 0x1e222a, linewidth: 1.5, transparent: true, opacity: 0.7 });
      const forestayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 6.2, 0.4),
        new THREE.Vector3(0, 1.4, 4.3),
      ]);
      shipGroup.add(new THREE.Line(forestayGeo, ropeMat));

      const backstayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 6.2, 0.4),
        new THREE.Vector3(0, 1.6, -3.9),
      ]);
      shipGroup.add(new THREE.Line(backstayGeo, ropeMat));

      for (const side of [-1, 1]) {
        for (const offset of [-0.6, 0.6]) {
          const shroudGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 5.8, 0.4),
            new THREE.Vector3(side * 1.25, 1.1, 0.4 + offset),
          ]);
          shipGroup.add(new THREE.Line(shroudGeo, ropeMat));
        }
      }

      return { shipGroup, planks, oars };
    };

    // ── Build Ship A (Floating in Harbor) ──
    const shipAData = createShip(false);
    shipAData.shipGroup.position.set(-2.8, 0.18, 0);
    scene.add(shipAData.shipGroup);
    shipAGroupRef.current = shipAData.shipGroup;
    planksARef.current = shipAData.planks;
    oarsARef.current = shipAData.oars;

    // ── Build Ship B (Dry Dock on Pier) ──
    const shipBData = createShip(true);
    shipBData.shipGroup.position.set(5.4, 1.45, 0);
    scene.add(shipBData.shipGroup);
    shipBGroupRef.current = shipBData.shipGroup;
    planksBRef.current = shipBData.planks;

    // Initially Hide planks on Ship B until replacement begins
    shipBData.planks.forEach((p) => {
      p.visible = false;
    });

    // ── Final Cause Telos Aura ──
    const auraGeo = new THREE.SphereGeometry(3.6, 24, 24);
    const aura = new THREE.Mesh(auraGeo, glowMat);
    aura.position.set(-2.8, 1.8, 0);
    aura.visible = false;
    scene.add(aura);
    auraMeshRef.current = aura;

    // ── Mouse Orbit Controls ──
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0.3;
    let sphericalPhi = Math.PI / 3.2;
    const cameraRadius = 10.5;

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

      sphericalTheta -= deltaX * 0.005;
      sphericalPhi = Math.max(0.25, Math.min(Math.PI / 2 - 0.05, sphericalPhi - deltaY * 0.005));

      camera.position.x = cameraRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = Math.max(1.2, cameraRadius * Math.cos(sphericalPhi));
      camera.position.z = cameraRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(1.0, 0.6, 0);
    };
    const onMouseUp = () => { isDragging = false; };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // ── Animation Loop ──
    let animationId;
    let clock = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      clock += 0.02;

      // Water sine ripple displacement
      if (waterMeshRef.current) {
        const posAttr = waterMeshRef.current.geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const x = posAttr.getX(i);
          const z = posAttr.getZ(i);
          posAttr.setY(i, Math.sin(x * 0.6 + clock) * 0.08 + Math.cos(z * 0.6 + clock * 0.8) * 0.06);
        }
        posAttr.needsUpdate = true;
      }

      // Ship A gentle floating wave bob
      if (shipAGroupRef.current) {
        shipAGroupRef.current.position.y = 0.18 + Math.sin(clock * 1.3) * 0.08;
        shipAGroupRef.current.rotation.z = Math.sin(clock * 1.0) * 0.025;
        shipAGroupRef.current.rotation.x = Math.cos(clock * 0.75) * 0.015;
      }

      // Rhythmic rowing animation on Ship A's oars
      if (oarsARef.current) {
        oarsARef.current.forEach((oar) => {
          oar.group.rotation.z = oar.defaultZ + Math.sin(clock * 1.5 + oar.index * 0.18) * 0.06;
          oar.group.rotation.x = oar.defaultX + Math.cos(clock * 1.5 + oar.index * 0.18) * 0.04;
        });
      }

      // Final Cause aura pulse
      if (auraMeshRef.current && auraMeshRef.current.visible) {
        const s = 1 + Math.sin(clock * 2) * 0.08;
        auraMeshRef.current.scale.set(s, s, s);
      }

      // ── Update Planks by Replacement Percentage ──
      const pct = replacementPctRef.current;
      const numReplaced = Math.round((pct / 100) * NUM_PLANKS);
      const cause = activeCauseRef.current;

      const { agedWoodMat: aged, newOakMat: oak, wireframeMat: wire } = matsRef.current;

      // Ship A (In Water): First 'numReplaced' planks become New Golden Oak
      planksARef.current.forEach((plank, idx) => {
        if (cause === 'formal') {
          plank.material = wire;
        } else {
          plank.material = idx < numReplaced ? oak : aged;
        }
      });

      // Ship B (On Dry Dock): First 'numReplaced' planks appear using the Discarded Aged Wood!
      planksBRef.current.forEach((plank, idx) => {
        if (cause === 'formal') {
          plank.material = wire;
          plank.visible = idx < numReplaced;
        } else {
          plank.material = aged;
          plank.visible = idx < numReplaced;
        }
      });

      // Cause specific effects
      if (auraMeshRef.current) {
        auraMeshRef.current.visible = cause === 'final';
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 580;
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

  // ── Handle Verdict Vote & Telemetry Run ──
  const handleVote = useCallback((choice) => {
    setVerdict(choice);
    setHasVoted(true);
    recordConceptRun('ship-of-theseus', 'single', {
      choice,
      replacementPct,
      activeCause,
      shipAOriginalityPct: 100 - replacementPct,
      shipBOriginalityPct: replacementPct,
    });
    setTimeout(() => setHasVoted(false), 2400);
  }, [replacementPct, activeCause]);

  // Compute status summary
  const getStatusSummary = () => {
    if (replacementPct === 0) {
      return 'Year 0: Ship A is in harbor with 100% original timbers. Ship B is empty dry dock.';
    }
    if (replacementPct === 100) {
      return 'Year 100: Ship A has 0% original wood. Ship B is 100% reassembled original timbers.';
    }
    return `Year ${replacementPct}: Ship A has ${100 - replacementPct}% original wood; Ship B has ${replacementPct}% of the original timbers.`;
  };

  return (
    <div className={styles.labContainer} data-testid="ship-of-theseus-3d-lab">
      <div className={styles.canvasContainer}>
        {/* Top Floating Header */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="compass" size={13} />
              <span>Metaphysics of Identity & Persistence</span>
            </div>
            <h2 className={styles.labTitle}>Ship of Theseus — The Athenian Harbor</h2>
          </div>

          <div className={styles.statsCluster}>
            <div className={`${styles.statPill} ${replacementPct > 50 ? styles.statPillActive : ''}`}>
              <span className={styles.statLabel}>Ship A (Harbor) Original Wood</span>
              <span className={styles.statValue}>{100 - replacementPct}%</span>
            </div>
            <div className={`${styles.statPill} ${replacementPct > 50 ? styles.statPillActive : ''}`}>
              <span className={styles.statLabel}>Ship B (Dock) Rebuilt Wood</span>
              <span className={styles.statValue}>{replacementPct}%</span>
            </div>
          </div>
        </div>

        {/* Aristotle's Four Causes Tabs */}
        <div className={styles.causeTabs}>
          <button
            type="button"
            className={`${styles.causeTab} ${activeCause === 'material' ? styles.causeTabActive : ''}`}
            onClick={() => setActiveCause('material')}
          >
            <Icon name="atom" size={12} />
            <span>1. Material Cause (The Atoms)</span>
          </button>
          <button
            type="button"
            className={`${styles.causeTab} ${activeCause === 'formal' ? styles.causeTabActive : ''}`}
            onClick={() => setActiveCause('formal')}
          >
            <Icon name="code" size={12} />
            <span>2. Formal Cause (The Blueprint)</span>
          </button>
          <button
            type="button"
            className={`${styles.causeTab} ${activeCause === 'efficient' ? styles.causeTabActive : ''}`}
            onClick={() => setActiveCause('efficient')}
          >
            <Icon name="zap" size={12} />
            <span>3. Efficient Cause (Shipwrights)</span>
          </button>
          <button
            type="button"
            className={`${styles.causeTab} ${activeCause === 'final' ? styles.causeTabActive : ''}`}
            onClick={() => setActiveCause('final')}
          >
            <Icon name="star" size={12} />
            <span>4. Final Cause (Telos / Honor)</span>
          </button>
        </div>

        {/* 3D WebGL Canvas */}
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Ship In-Canvas Labels */}
        <div className={styles.shipLabelA}>
          <Icon name="compass" size={14} />
          <span>Ship A: Floating Galley (Continuous History)</span>
        </div>
        <div className={styles.shipLabelB}>
          <Icon name="box" size={14} />
          <span>Ship B: Hobbes Reconstructed (Original Matter)</span>
        </div>

        {/* Floating Telemetry Badge */}
        <div className={styles.statusFloatingOverlay}>
          <div className={styles.pulseDot} />
          <span>{getStatusSummary()}</span>
        </div>
      </div>

      {/* Control Console */}
      <div className={styles.controlPanel}>
        <div className={styles.controlRow}>
          {/* Timber Replacement Timeline Slider */}
          <div className={styles.sliderCard}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>Centuries of Maintenance (Plank Replacement)</span>
              <span className={styles.sliderValue}>
                {replacementPct}% Replaced (Year {replacementPct})
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={replacementPct}
              onChange={(e) => setReplacementPct(parseInt(e.target.value, 10))}
              className={styles.rangeInput}
            />
            <p className={styles.sliderDesc}>
              As time passes in Athens, rotten timbers on Ship A are replaced one-by-one with golden oak. Meanwhile, Hobbes collects the discarded original planks on the stone dock and reconstructs Ship B.
            </p>
          </div>

          {/* Hobbes Dilemma Verdict Voting Card */}
          <div className={styles.verdictCard}>
            <h4 className={styles.verdictTitle}>Which is the True Ship of Theseus?</h4>
            <div className={styles.verdictBtnGrid}>
              <button
                type="button"
                className={`${styles.verdictBtn} ${verdict === 'shipA' ? styles.verdictBtnActive : ''}`}
                onClick={() => handleVote('shipA')}
              >
                <strong>Ship A</strong>
                <span className={styles.btnSub}>Continuous Form & Service</span>
              </button>

              <button
                type="button"
                className={`${styles.verdictBtn} ${verdict === 'shipB' ? styles.verdictBtnActive : ''}`}
                onClick={() => handleVote('shipB')}
              >
                <strong>Ship B</strong>
                <span className={styles.btnSub}>Original Physical Substance</span>
              </button>

              <button
                type="button"
                className={`${styles.verdictBtn} ${verdict === 'both' ? styles.verdictBtnActive : ''}`}
                onClick={() => handleVote('both')}
              >
                <strong>Both Ships</strong>
                <span className={styles.btnSub}>Contextual Polysemy</span>
              </button>

              <button
                type="button"
                className={`${styles.verdictBtn} ${verdict === 'neither' ? styles.verdictBtnActive : ''}`}
                onClick={() => handleVote('neither')}
              >
                <strong>Neither Ship</strong>
                <span className={styles.btnSub}>Identity is a Human Construct</span>
              </button>
            </div>
          </div>
        </div>

        {/* Philosophical Insight Card */}
        <div className={styles.insightCard}>
          {activeCause === 'material' && (
            <span>
              <strong>Aristotle&apos;s Material Cause:</strong> An entity is defined by its constituent matter. If you subscribe to this view, Ship B (reassembled on the dry dock) is the authentic artifact, because it houses the exact atoms that carried Theseus.
            </span>
          )}
          {activeCause === 'formal' && (
            <span>
              <strong>Aristotle&apos;s Formal Cause:</strong> An entity is defined by its structure, arrangement, and design. Because Ship A never ceased being organized as a functional trireme, its identity remained continuous despite total atomic turnover.
            </span>
          )}
          {activeCause === 'efficient' && (
            <span>
              <strong>Aristotle&apos;s Efficient Cause:</strong> An entity is defined by the agency that created and maintained it. Ship A carries the unbroken lineage of Athenian civic maintenance across centuries of repair.
            </span>
          )}
          {activeCause === 'final' && (
            <span>
              <strong>Aristotle&apos;s Final Cause (Telos):</strong> An entity is defined by its ultimate purpose. Ship A retains the civic function of honoring the heroic voyage of Theseus for the people of Athens.
            </span>
          )}
        </div>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <div className={styles.actionBtnGroup}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setReplacementPct(0)}
            >
              <Icon name="rotate-ccw" size={14} />
              <span>Reset to Year 0</span>
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setReplacementPct(100)}
            >
              <Icon name="zap" size={14} />
              <span>Jump to Year 100 (Total Replacement)</span>
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => handleVote(verdict || 'shipA')}
            >
              <Icon name="check" size={14} />
              <span>Submit Metaphysical Verdict</span>
            </button>
          </div>

          {hasVoted && (
            <span className={styles.actionFeedback}>
              <Icon name="check" size={14} />
              <span>Verdict Registered to Cloud Telemetry</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
