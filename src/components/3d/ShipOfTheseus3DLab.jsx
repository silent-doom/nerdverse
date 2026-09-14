'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './ShipOfTheseus3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

const NUM_PLANKS = 14; // 7 port + 7 starboard

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

    // 6. Stone Harbor Pier & Dry Dock Scaffolding (Right Side)
    const pierGeo = new THREE.BoxGeometry(7, 1.4, 12);
    const pierMesh = new THREE.Mesh(pierGeo, stoneMat);
    pierMesh.position.set(4.8, 0.3, 0);
    scene.add(pierMesh);

    // Dry Dock Wood Cradles on Pier
    for (let i = -3; i <= 3; i += 1.5) {
      const cradle = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 0.3), agedWoodMat);
      cradle.position.set(4.5, 1.05, i);
      scene.add(cradle);
    }

    // Harbor Crane Mast
    const cranePole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.2), agedWoodMat);
    cranePole.position.set(6.8, 2.8, 2.5);
    scene.add(cranePole);
    const craneArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2), agedWoodMat);
    craneArm.rotation.z = Math.PI / 4;
    craneArm.position.set(5.7, 4.2, 2.5);
    scene.add(craneArm);

    // ── 7. Ship Helper Generator ──
    const createShip = (isDryDock) => {
      const shipGroup = new THREE.Group();
      const planks = [];

      // Keel & Base Spine
      const keelGeo = new THREE.BoxGeometry(0.3, 0.4, 5.2);
      const keel = new THREE.Mesh(keelGeo, agedWoodMat);
      keel.position.y = 0;
      shipGroup.add(keel);

      // Curved Bow / Prow Ram
      const prowGeo = new THREE.ConeGeometry(0.4, 1.4, 8);
      prowGeo.rotateX(-Math.PI / 3);
      const prow = new THREE.Mesh(prowGeo, bronzeMat);
      prow.position.set(0, 0.4, 2.9);
      shipGroup.add(prow);

      // Curved Stern
      const sternGeo = new THREE.TorusGeometry(0.8, 0.15, 8, 16, Math.PI / 2);
      sternGeo.rotateY(Math.PI / 2);
      const stern = new THREE.Mesh(sternGeo, agedWoodMat);
      stern.position.set(0, 0.7, -2.6);
      shipGroup.add(stern);

      // Central Mast & Yardarm
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.8), agedWoodMat);
      mast.position.set(0, 1.9, 0.2);
      shipGroup.add(mast);

      const yardarm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.8), agedWoodMat);
      yardarm.rotation.z = Math.PI / 2;
      yardarm.position.set(0, 3.2, 0.2);
      shipGroup.add(yardarm);

      // Sail
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.0), sailMat);
      sail.position.set(0, 2.2, 0.25);
      shipGroup.add(sail);

      // Modular Hull Planks (7 Port, 7 Starboard)
      for (let i = 0; i < 7; i++) {
        const zPos = (i - 3) * 0.7;

        // Port Plank
        const pGeo = new THREE.BoxGeometry(0.12, 0.35, 0.65);
        const portPlank = new THREE.Mesh(pGeo, agedWoodMat.clone());
        portPlank.position.set(-0.75, 0.3, zPos);
        portPlank.rotation.z = -0.3;
        shipGroup.add(portPlank);
        planks.push(portPlank);

        // Starboard Plank
        const starPlank = new THREE.Mesh(pGeo, agedWoodMat.clone());
        starPlank.position.set(0.75, 0.3, zPos);
        starPlank.rotation.z = 0.3;
        shipGroup.add(starPlank);
        planks.push(starPlank);
      }

      // Oars along sides (if floating)
      if (!isDryDock) {
        for (let i = -2; i <= 2; i += 1.0) {
          const oarL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.0), agedWoodMat);
          oarL.rotation.z = Math.PI / 3;
          oarL.position.set(-1.3, -0.1, i);
          shipGroup.add(oarL);

          const oarR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.0), agedWoodMat);
          oarR.rotation.z = -Math.PI / 3;
          oarR.position.set(1.3, -0.1, i);
          shipGroup.add(oarR);
        }
      }

      return { shipGroup, planks };
    };

    // ── Build Ship A (Floating in Harbor) ──
    const shipAData = createShip(false);
    shipAData.shipGroup.position.set(-2.4, 0.15, 0);
    scene.add(shipAData.shipGroup);
    shipAGroupRef.current = shipAData.shipGroup;
    planksARef.current = shipAData.planks;

    // ── Build Ship B (Dry Dock on Pier) ──
    const shipBData = createShip(true);
    shipBData.shipGroup.position.set(4.5, 1.3, 0);
    scene.add(shipBData.shipGroup);
    shipBGroupRef.current = shipBData.shipGroup;
    planksBRef.current = shipBData.planks;

    // Initially Hide planks on Ship B until replacement begins
    shipBData.planks.forEach((p) => {
      p.visible = false;
    });

    // ── Final Cause Telos Aura ──
    const auraGeo = new THREE.SphereGeometry(3.2, 24, 24);
    const aura = new THREE.Mesh(auraGeo, glowMat);
    aura.position.set(-2.4, 1.5, 0);
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
        shipAGroupRef.current.position.y = 0.15 + Math.sin(clock * 1.4) * 0.07;
        shipAGroupRef.current.rotation.z = Math.sin(clock * 1.1) * 0.025;
        shipAGroupRef.current.rotation.x = Math.cos(clock * 0.8) * 0.015;
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
              step="7"
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
