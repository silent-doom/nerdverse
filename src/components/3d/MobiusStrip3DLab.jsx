'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Icon from '@/components/common/Icon';
import VisualizationGuideHUD from '@/components/interactive/VisualizationGuideHUD';
import styles from './MobiusStrip3DLab.module.css';

// Audio Synthesizer for Topological Clicks & Chimes
class MobiusAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.lastPlay = 0;
  }

  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playStep() {
    if (this.isMuted || !this.ctx) return;
    const nowMs = performance.now();
    if (nowMs - this.lastPlay < 90) return;
    this.lastPlay = nowMs;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.025);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // AudioContext policy suppression fallback
    }
  }

  playChime(frequency = 587.33, duration = 0.25) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio fallback
    }
  }

  playSnip() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio fallback
    }
  }
}

const audioEngine = new MobiusAudioEngine();

/**
 * Anatomically authentic 3D Ant (Formicidae)
 */
function createAuthenticAntMesh() {
  const antRoot = new THREE.Group();

  // Photorealistic chitin materials with subtle sub-surface scattering and clearcoat sheen
  const chitinDarkMat = new THREE.MeshStandardMaterial({
    color: 0x180f0a,
    roughness: 0.28,
    metalness: 0.05,
  });

  const chitinThoraxMat = new THREE.MeshStandardMaterial({
    color: 0x3a170b, // Rich mahogany / burgundy-chestnut typical of Formica rufa
    roughness: 0.35,
    metalness: 0.03,
  });

  const chitinGlossMat = new THREE.MeshStandardMaterial({
    color: 0x100804, // Polished high-sheen mirror cuticle on gaster tergites
    roughness: 0.16,
    metalness: 0.08,
  });

  const chitinAmberMat = new THREE.MeshStandardMaterial({
    color: 0x5e2712, // Translucent amber chitin for joint sockets, tarsi, antennal scape
    roughness: 0.42,
    metalness: 0.02,
  });

  const eyeGlossMat = new THREE.MeshStandardMaterial({
    color: 0x030303,
    roughness: 0.05,
    metalness: 0.4,
  });

  const mandibleMat = new THREE.MeshStandardMaterial({
    color: 0x240e05,
    roughness: 0.26,
    metalness: 0.04,
  });

  const toothMat = new THREE.MeshStandardMaterial({
    color: 0x4a1c09,
    roughness: 0.22,
    metalness: 0.02,
  });

  const bodyGroup = new THREE.Group();
  antRoot.add(bodyGroup);

  // ==========================================
  // 1. HEAD (Caput)
  // Heart-shaped cranium, compound eyes, mandibles, geniculate antennae
  // ==========================================
  const headGroup = new THREE.Group();
  headGroup.position.set(0.24, 0.10, 0);

  // Posterior Occipital Lobes
  const occiputGeo = new THREE.SphereGeometry(0.085, 14, 14);
  occiputGeo.scale(1.15, 0.85, 1.1);
  const occiput = new THREE.Mesh(occiputGeo, chitinDarkMat);
  headGroup.add(occiput);

  // Anterior Frons & Clypeus
  const clypeusGeo = new THREE.ConeGeometry(0.065, 0.10, 10);
  clypeusGeo.rotateZ(-Math.PI / 2);
  clypeusGeo.scale(0.85, 1, 1);
  const clypeus = new THREE.Mesh(clypeusGeo, chitinDarkMat);
  clypeus.position.set(0.07, -0.015, 0);
  headGroup.add(clypeus);

  // Lateral Compound Eyes (convex faceted ellipsoids)
  [-1, 1].forEach((side) => {
    const eyeGeo = new THREE.SphereGeometry(0.03, 12, 12);
    eyeGeo.scale(1.1, 1.35, 0.65);
    const eye = new THREE.Mesh(eyeGeo, eyeGlossMat);
    eye.position.set(0.02, 0.035, side * 0.075);
    eye.rotation.set(side * 0.15, side * 0.35, 0.1);
    headGroup.add(eye);
  });

  // Curved Mandibles with Serrated Cutting Denticles
  const mandibleL = new THREE.Group();
  const mandibleR = new THREE.Group();

  [{ grp: mandibleL, side: 1 }, { grp: mandibleR, side: -1 }].forEach(({ grp, side }) => {
    grp.position.set(0.12, -0.035, side * 0.028);

    // Main curved blade
    const bladeGeo = new THREE.ConeGeometry(0.016, 0.09, 8);
    bladeGeo.scale(0.5, 1, 1.2);
    const blade = new THREE.Mesh(bladeGeo, mandibleMat);
    blade.position.set(0.04, 0, side * 0.01);
    blade.rotation.set(side * 0.45, side * 0.25, -Math.PI / 2 + 0.3);
    grp.add(blade);

    // Masticatory denticles (serrated teeth)
    for (let t = 0; t < 4; t++) {
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.012, 4), toothMat);
      tooth.position.set(0.02 + t * 0.015, -0.005, side * (0.018 - t * 0.004));
      tooth.rotation.set(0, 0, -Math.PI / 2);
      grp.add(tooth);
    }

    headGroup.add(grp);
  });

  // Geniculate (Elbowed) Antennae (Scape + Pedicel + Flagellum)
  const antennaL = new THREE.Group();
  const antennaR = new THREE.Group();

  [{ grp: antennaL, side: 1 }, { grp: antennaR, side: -1 }].forEach(({ grp, side }) => {
    grp.position.set(0.065, 0.045, side * 0.032);

    // Torulus (Antennal socket)
    const torulus = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 8), chitinAmberMat);
    grp.add(torulus);

    // Scape (Long basal segment angled upward and forward)
    const scapeGeo = new THREE.CylinderGeometry(0.0045, 0.0035, 0.16, 8);
    const scape = new THREE.Mesh(scapeGeo, chitinAmberMat);
    scape.position.set(0.06, 0.05, side * 0.022);
    scape.rotation.set(side * 0.35, -0.2, -0.75);
    grp.add(scape);

    // Pedicel (Elbow hinge)
    const pedicel = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 8, 8), chitinAmberMat);
    pedicel.position.set(0.12, 0.10, side * 0.042);
    grp.add(pedicel);

    // Funiculus / Flagellum (Segmented feeler pointing downward toward the substrate to palpate)
    const flagellumGeo = new THREE.CylinderGeometry(0.004, 0.002, 0.18, 8);
    const flagellum = new THREE.Mesh(flagellumGeo, chitinDarkMat);
    flagellum.position.set(0.19, 0.04, side * 0.065);
    flagellum.rotation.set(side * 0.15, -0.35, 0.55);
    grp.add(flagellum);

    // Sensory tip club
    const club = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 6, 6), chitinAmberMat);
    club.position.set(0.25, -0.02, side * 0.08);
    grp.add(club);

    headGroup.add(grp);
  });

  bodyGroup.add(headGroup);

  // Cervix (Flexible Neck)
  const neckGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.04, 8);
  neckGeo.rotateZ(Math.PI / 2);
  const neck = new THREE.Mesh(neckGeo, chitinAmberMat);
  neck.position.set(0.15, 0.09, 0);
  bodyGroup.add(neck);

  // ==========================================
  // 2. THORAX (Mesosoma / Alitrunk)
  // Pronotum, Mesonotum, Metanotum/Propodeum
  // ==========================================
  const thoraxGroup = new THREE.Group();

  const pronotum = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 14), chitinThoraxMat);
  pronotum.scale.set(1.05, 0.88, 0.82);
  pronotum.position.set(0.10, 0.095, 0);

  const mesonotum = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 14), chitinThoraxMat);
  mesonotum.scale.set(1.15, 0.95, 0.76);
  mesonotum.position.set(0.00, 0.105, 0);

  const propodeum = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 14), chitinThoraxMat);
  propodeum.scale.set(0.95, 0.85, 0.74);
  propodeum.position.set(-0.09, 0.088, 0);

  // Ventral thoracic sternite keel
  const sternum = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 8), chitinThoraxMat);
  sternum.rotation.z = Math.PI / 2;
  sternum.position.set(0.00, 0.045, 0);

  thoraxGroup.add(pronotum, mesonotum, propodeum, sternum);
  bodyGroup.add(thoraxGroup);

  // ==========================================
  // 3. PETIOLE (The Iconic Formicine Waist)
  // Thin pedicel stem with upright squamiform node / scale
  // ==========================================
  const petioleGroup = new THREE.Group();
  petioleGroup.position.set(-0.16, 0.08, 0);

  const pedicelStem = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.06, 8), chitinAmberMat);
  pedicelStem.rotation.z = Math.PI / 2;

  const scaleGeo = new THREE.CylinderGeometry(0.038, 0.03, 0.02, 12);
  scaleGeo.scale(0.35, 1.4, 0.9);
  const petioleScale = new THREE.Mesh(scaleGeo, chitinDarkMat);
  petioleScale.position.set(0, 0.035, 0);

  petioleGroup.add(pedicelStem, petioleScale);
  bodyGroup.add(petioleGroup);

  // ==========================================
  // 4. GASTER (Segmented Teardrop Abdomen)
  // Tergites I, II, III, IV, and terminal acidopore
  // ==========================================
  const gasterGroup = new THREE.Group();
  gasterGroup.position.set(-0.20, 0.08, 0);

  const gastI = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 14), chitinDarkMat);
  gastI.scale.set(0.9, 0.85, 0.8);
  gastI.position.set(-0.05, 0.01, 0);

  const gastII = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 16), chitinGlossMat);
  gastII.scale.set(1.2, 0.95, 0.88);
  gastII.position.set(-0.14, 0.01, 0);

  const gastIII = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.065, 0.11, 14), chitinDarkMat);
  gastIII.rotation.z = Math.PI / 2 + 0.12;
  gastIII.position.set(-0.25, -0.01, 0);

  const gastIV = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.12, 14), chitinDarkMat);
  gastIV.rotation.z = Math.PI / 2 + 0.22;
  gastIV.position.set(-0.35, -0.03, 0);

  // Terminal acidopore nozzle
  const acidopore = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.03, 8), chitinAmberMat);
  acidopore.rotation.z = Math.PI / 2 + 0.22;
  acidopore.position.set(-0.41, -0.045, 0);

  gasterGroup.add(gastI, gastII, gastIII, gastIV, acidopore);
  bodyGroup.add(gasterGroup);

  // ==========================================
  // 5. HEXAPOD ARTICULATED LIMBS (6 Legs)
  // All attach to ventral mesosoma with Coxa -> Trochanter -> Femur -> Tibia -> Tarsus
  // ==========================================
  const legConfigs = [
    // Prothoracic (Forelegs) - shorter, angled forward
    { id: 'L1', origin: [0.09, 0.04, 0.038], side: 1, baseAngleY: 0.52, femurLen: 0.20, tibiaLen: 0.23, tarsusLen: 0.13, basePitch: 0.65, baseTibiaPitch: 0.95 },
    { id: 'R1', origin: [0.09, 0.04, -0.038], side: -1, baseAngleY: -0.52, femurLen: 0.20, tibiaLen: 0.23, tarsusLen: 0.13, basePitch: 0.65, baseTibiaPitch: 0.95 },
    // Mesothoracic (Midlegs) - medium length, lateral stance
    { id: 'L2', origin: [0.00, 0.04, 0.045], side: 1, baseAngleY: 0.0, femurLen: 0.22, tibiaLen: 0.26, tarsusLen: 0.14, basePitch: 0.72, baseTibiaPitch: 1.05 },
    { id: 'R2', origin: [0.00, 0.04, -0.045], side: -1, baseAngleY: 0.0, femurLen: 0.22, tibiaLen: 0.26, tarsusLen: 0.14, basePitch: 0.72, baseTibiaPitch: 1.05 },
    // Metathoracic (Hindlegs) - longest, angled backward for driving propulsion
    { id: 'L3', origin: [-0.08, 0.04, 0.040], side: 1, baseAngleY: -0.61, femurLen: 0.26, tibiaLen: 0.31, tarsusLen: 0.16, basePitch: 0.80, baseTibiaPitch: 1.15 },
    { id: 'R3', origin: [-0.08, 0.04, -0.040], side: -1, baseAngleY: 0.61, femurLen: 0.26, tibiaLen: 0.31, tarsusLen: 0.16, basePitch: 0.80, baseTibiaPitch: 1.15 },
  ];

  const legRigs = [];

  legConfigs.forEach((cfg) => {
    // 1. Coxa (rotates horizontally in yaw during sweep)
    const coxaGroup = new THREE.Group();
    coxaGroup.position.set(...cfg.origin);
    coxaGroup.rotation.y = cfg.baseAngleY;

    const coxaMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.010, 0.05, 8), chitinAmberMat);
    coxaMesh.rotation.x = cfg.side * 0.5;
    coxaGroup.add(coxaMesh);

    // Trochanter joint bead
    const trochanter = new THREE.Mesh(new THREE.SphereGeometry(0.010, 8, 8), chitinAmberMat);
    trochanter.position.set(0, 0.015, cfg.side * 0.025);
    coxaGroup.add(trochanter);

    // 2. Femur Group (angles UP and OUT to form the elevated knee)
    const femurGroup = new THREE.Group();
    femurGroup.position.copy(trochanter.position);

    const femurGeo = new THREE.CylinderGeometry(0.011, 0.007, cfg.femurLen, 8);
    const femurMesh = new THREE.Mesh(femurGeo, chitinThoraxMat);
    femurMesh.position.set(0, cfg.femurLen * 0.45, cfg.side * cfg.femurLen * 0.35);
    femurMesh.rotation.set(cfg.side * cfg.basePitch, 0, 0);
    femurGroup.add(femurMesh);

    // Knee joint (femorotibial hinge)
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.010, 8, 8), chitinAmberMat);
    knee.position.set(0, cfg.femurLen * 0.85, cfg.side * cfg.femurLen * 0.70);
    femurGroup.add(knee);

    // 3. Tibia Group (angles DOWN and OUT towards substrate)
    const tibiaGroup = new THREE.Group();
    tibiaGroup.position.copy(knee.position);

    const tibiaGeo = new THREE.CylinderGeometry(0.007, 0.004, cfg.tibiaLen, 8);
    const tibiaMesh = new THREE.Mesh(tibiaGeo, chitinDarkMat);
    tibiaMesh.position.set(0, -cfg.tibiaLen * 0.45, cfg.side * cfg.tibiaLen * 0.32);
    tibiaMesh.rotation.set(cfg.side * -cfg.baseTibiaPitch, 0, 0);
    tibiaGroup.add(tibiaMesh);

    // Calcar / Tibial spur
    const spur = new THREE.Mesh(new THREE.ConeGeometry(0.003, 0.018, 4), chitinAmberMat);
    spur.position.set(0, -cfg.tibiaLen * 0.85, cfg.side * cfg.tibiaLen * 0.60);
    spur.rotation.set(cfg.side * -0.4, 0, 0);
    tibiaGroup.add(spur);

    // 4. Tarsus Foot (Multi-segmented foot resting on the paper)
    const tarsusGroup = new THREE.Group();
    tarsusGroup.position.set(0, -cfg.tibiaLen * 0.90, cfg.side * cfg.tibiaLen * 0.62);

    // Basitarsus
    const basitarsusGeo = new THREE.CylinderGeometry(0.004, 0.003, cfg.tarsusLen * 0.5, 6);
    const basitarsus = new THREE.Mesh(basitarsusGeo, chitinAmberMat);
    basitarsus.position.set(0.02, -0.01, cfg.side * 0.02);
    basitarsus.rotation.set(cfg.side * -0.2, 0, -Math.PI / 2 + 0.3);
    tarsusGroup.add(basitarsus);

    // Distal tarsomeres
    const tarsomeresGeo = new THREE.CylinderGeometry(0.003, 0.002, cfg.tarsusLen * 0.4, 6);
    const tarsomeres = new THREE.Mesh(tarsomeresGeo, chitinAmberMat);
    tarsomeres.position.set(0.05, -0.015, cfg.side * 0.035);
    tarsomeres.rotation.set(cfg.side * -0.1, 0, -Math.PI / 2 + 0.1);
    tarsusGroup.add(tarsomeres);

    // Pretarsal Dual Claws (ungues gripping the paper)
    [-1, 1].forEach((clawSide) => {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.0025, 0.012, 4), chitinDarkMat);
      claw.position.set(0.07, -0.02, cfg.side * (0.04 + clawSide * 0.006));
      claw.rotation.set(clawSide * 0.3, 0, -Math.PI / 2 - 0.4);
      tarsusGroup.add(claw);
    });

    tibiaGroup.add(tarsusGroup);
    femurGroup.add(tibiaGroup);
    coxaGroup.add(femurGroup);
    thoraxGroup.add(coxaGroup);

    legRigs.push({
      id: cfg.id,
      side: cfg.side,
      coxaGroup,
      femurGroup,
      tibiaGroup,
      tarsusGroup,
      baseAngleY: cfg.baseAngleY,
      basePitch: cfg.basePitch,
      baseTibiaPitch: cfg.baseTibiaPitch,
    });
  });

  // Normal Vector Arrow (perpendicular indicator)
  const arrowDir = new THREE.Vector3(0, 1, 0);
  const arrowOrigin = new THREE.Vector3(0, 0.24, 0);
  const normalArrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 0.70, 0x38bdf8, 0.14, 0.07);
  normalArrow.name = 'normalArrow';
  antRoot.add(normalArrow);

  // Scaled to authentic physical proportions relative to paper strip (width 1.35)
  antRoot.scale.set(0.72, 0.72, 0.72);
  antRoot.userData = {
    bodyGroup,
    headGroup,
    gasterGroup,
    antennaL,
    antennaR,
    mandibleL,
    mandibleR,
    legRigs,
  };
  return antRoot;
}

/**
 * Creates 3D Scissor Blades Tool for Mode 2
 */
function createScissorsMesh() {
  const group = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.95,
    roughness: 0.15,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Classic red handles
    roughness: 0.4,
    metalness: 0.1,
  });
  const pivotMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2,
  });

  // Pivot screw
  const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12), pivotMat);
  pivot.rotation.x = Math.PI / 2;
  group.add(pivot);

  // Arm 1 (blade + handle, pivots around Z)
  const arm1 = new THREE.Group();
  const blade1 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.75, 4), steelMat);
  blade1.scale.set(0.2, 1, 1);
  blade1.position.set(0.36, 0, 0.02);
  blade1.rotation.z = -Math.PI / 2;
  arm1.add(blade1);

  const loopGeo1 = new THREE.TorusGeometry(0.14, 0.035, 8, 24);
  const handle1 = new THREE.Mesh(loopGeo1, handleMat);
  handle1.position.set(-0.32, 0, 0.02);
  arm1.add(handle1);
  group.add(arm1);

  // Arm 2 (blade + handle, pivots around Z)
  const arm2 = new THREE.Group();
  const blade2 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.75, 4), steelMat);
  blade2.scale.set(0.2, 1, 1);
  blade2.position.set(0.36, 0, -0.02);
  blade2.rotation.z = -Math.PI / 2;
  arm2.add(blade2);

  const loopGeo2 = new THREE.TorusGeometry(0.14, 0.035, 8, 24);
  const handle2 = new THREE.Mesh(loopGeo2, handleMat);
  handle2.position.set(-0.32, 0, -0.02);
  arm2.add(handle2);
  group.add(arm2);

  group.userData = { arm1, arm2 };
  group.scale.set(0.7, 0.7, 0.7);
  return group;
}

/**
 * Creates high-resolution archival paper texture with genuine thought experiment annotations
 */
function createCardstockTexture(theme = 'parchment') {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const isParchment = theme === 'parchment';

  // Base background (authentic cream vellum / dark slate)
  ctx.fillStyle = isParchment ? '#faf6eb' : '#141b2b';
  ctx.fillRect(0, 0, 1024, 128);

  // Paper fiber texture
  ctx.fillStyle = isParchment ? 'rgba(0, 0, 0, 0.025)' : 'rgba(255, 255, 255, 0.02)';
  for (let i = 0; i < 5000; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 128;
    ctx.fillRect(rx, ry, 1.2, 1.2);
  }

  // Edge margin guidelines
  ctx.strokeStyle = isParchment ? 'rgba(100, 116, 139, 0.35)' : 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  if (typeof ctx.strokeRect === 'function') {
    ctx.strokeRect(0, 10, 1024, 108);
  }

  // Millimeter coordinate tick marks
  for (let x = 0; x < 1024; x += 16) {
    const isMajor = x % 64 === 0;
    const tickH = isMajor ? 12 : 6;
    ctx.strokeStyle = isParchment
      ? isMajor
        ? 'rgba(71, 85, 105, 0.5)'
        : 'rgba(148, 163, 184, 0.3)'
      : isMajor
      ? 'rgba(56, 189, 248, 0.5)'
      : 'rgba(56, 189, 248, 0.2)';
    if (typeof ctx.beginPath === 'function') {
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, 10 + tickH);
      ctx.moveTo(x, 118);
      ctx.lineTo(x, 118 - tickH);
      ctx.stroke();
    }
  }

  // Centerline dashed guide for Ant path
  ctx.strokeStyle = isParchment ? 'rgba(185, 28, 28, 0.35)' : 'rgba(239, 68, 68, 0.35)';
  if (typeof ctx.setLineDash === 'function') {
    ctx.setLineDash([8, 8]);
  }
  ctx.lineWidth = 1.5;
  if (typeof ctx.beginPath === 'function') {
    ctx.beginPath();
    ctx.moveTo(0, 64);
    ctx.lineTo(1024, 64);
    ctx.stroke();
  }
  if (typeof ctx.setLineDash === 'function') {
    ctx.setLineDash([]);
  }

  // Historical Thought Experiment Annotations
  if (typeof ctx.fillText === 'function') {
    ctx.fillStyle = isParchment ? '#475569' : '#94a3b8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('MÖBIUS (1858) · START [SIDE A]', 16, 32);
    ctx.fillText('180° DEVELOPABLE TWIST ➔', 320, 32);
    ctx.fillText('INVERTED FLIP [SIDE B]', 540, 32);
    ctx.fillText('720° CIRCUIT RETURN ➔', 800, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

/**
 * Mathematical developable curve with physical paper relaxation
 */
function getCenterlinePoint(u, R, hSag = 0.35) {
  const x = R * Math.cos(u);
  const y = R * Math.sin(u);
  const z = hSag * Math.sin(2 * u); // Developable saddle deflection of twisted paper
  return new THREE.Vector3(x, y, z);
}

function getCenterlineTangent(u, R, hSag = 0.35) {
  const dx = -R * Math.sin(u);
  const dy = R * Math.cos(u);
  const dz = 2 * hSag * Math.cos(2 * u);
  return new THREE.Vector3(dx, dy, dz).normalize();
}

function getRulingVector(u, k, tangent) {
  const halfU = (k * u) / 2;
  const g0 = new THREE.Vector3(
    Math.cos(halfU) * Math.cos(u),
    Math.cos(halfU) * Math.sin(u),
    Math.sin(halfU)
  );
  // Orthogonalize against tangent to enforce strict isometric paper developability
  const proj = tangent.clone().multiplyScalar(g0.dot(tangent));
  return g0.sub(proj).normalize();
}

/**
 * Builds authentic 3D Paper Ribbon with true physical thickness (d = 0.04)
 * Produces front face, back face, and cut paper side rims!
 */
function buildPhysicalPaperStripGeometry(R, w, d, k, hSag = 0.35, vMin = -w / 2, vMax = w / 2, uMax = 2 * Math.PI, offsetDisplacement = 0) {
  const uSegs = 140;
  const vSegs = 8;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Helper to add quad
  function addQuad(i1, i2, i3, i4) {
    indices.push(i1, i2, i4);
    indices.push(i2, i3, i4);
  }

  let vertOffset = 0;

  // 1. Top Paper Face (t = +d/2)
  const topStart = vertOffset;
  for (let i = 0; i <= uSegs; i++) {
    const u = (i / uSegs) * uMax;
    const c = getCenterlinePoint(u, R, hSag);
    const tu = getCenterlineTangent(u, R, hSag);
    const g = getRulingVector(u, k, tu);
    const n = new THREE.Vector3().crossVectors(tu, g).normalize();

    for (let j = 0; j <= vSegs; j++) {
      const v = vMin + (j / vSegs) * (vMax - vMin);
      const pt = c.clone()
        .addScaledVector(g, v)
        .addScaledVector(n, d / 2 + offsetDisplacement * Math.sin(u));

      positions.push(pt.x, pt.y, pt.z);
      normals.push(n.x, n.y, n.z);
      uvs.push(i / uSegs, j / vSegs);
      vertOffset++;
    }
  }

  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
      const row1 = topStart + i * (vSegs + 1) + j;
      const row2 = topStart + (i + 1) * (vSegs + 1) + j;
      addQuad(row1, row2, row2 + 1, row1 + 1);
    }
  }

  // 2. Bottom Paper Face (t = -d/2)
  const botStart = vertOffset;
  for (let i = 0; i <= uSegs; i++) {
    const u = (i / uSegs) * uMax;
    const c = getCenterlinePoint(u, R, hSag);
    const tu = getCenterlineTangent(u, R, hSag);
    const g = getRulingVector(u, k, tu);
    const n = new THREE.Vector3().crossVectors(tu, g).normalize();

    for (let j = 0; j <= vSegs; j++) {
      const v = vMin + (j / vSegs) * (vMax - vMin);
      const pt = c.clone()
        .addScaledVector(g, v)
        .addScaledVector(n, -d / 2 + offsetDisplacement * Math.sin(u));

      positions.push(pt.x, pt.y, pt.z);
      normals.push(-n.x, -n.y, -n.z);
      uvs.push(i / uSegs, j / vSegs);
      vertOffset++;
    }
  }

  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
      const row1 = botStart + i * (vSegs + 1) + j;
      const row2 = botStart + (i + 1) * (vSegs + 1) + j;
      // Invert winding for downward normal
      addQuad(row1, row1 + 1, row2 + 1, row2);
    }
  }

  // 3. Left Cut Paper Edge (v = vMin)
  const leftStart = vertOffset;
  for (let i = 0; i <= uSegs; i++) {
    const u = (i / uSegs) * uMax;
    const c = getCenterlinePoint(u, R, hSag);
    const tu = getCenterlineTangent(u, R, hSag);
    const g = getRulingVector(u, k, tu);
    const n = new THREE.Vector3().crossVectors(tu, g).normalize();

    // Top point
    const pTop = c.clone().addScaledVector(g, vMin).addScaledVector(n, d / 2);
    positions.push(pTop.x, pTop.y, pTop.z);
    normals.push(-g.x, -g.y, -g.z);
    uvs.push(i / uSegs, 0);

    // Bottom point
    const pBot = c.clone().addScaledVector(g, vMin).addScaledVector(n, -d / 2);
    positions.push(pBot.x, pBot.y, pBot.z);
    normals.push(-g.x, -g.y, -g.z);
    uvs.push(i / uSegs, 1);
    vertOffset += 2;
  }

  for (let i = 0; i < uSegs; i++) {
    const i1 = leftStart + i * 2;
    const i2 = leftStart + (i + 1) * 2;
    addQuad(i1, i1 + 1, i2 + 1, i2);
  }

  // 4. Right Cut Paper Edge (v = vMax)
  const rightStart = vertOffset;
  for (let i = 0; i <= uSegs; i++) {
    const u = (i / uSegs) * uMax;
    const c = getCenterlinePoint(u, R, hSag);
    const tu = getCenterlineTangent(u, R, hSag);
    const g = getRulingVector(u, k, tu);
    const n = new THREE.Vector3().crossVectors(tu, g).normalize();

    // Top point
    const pTop = c.clone().addScaledVector(g, vMax).addScaledVector(n, d / 2);
    positions.push(pTop.x, pTop.y, pTop.z);
    normals.push(g.x, g.y, g.z);
    uvs.push(i / uSegs, 0);

    // Bottom point
    const pBot = c.clone().addScaledVector(g, vMax).addScaledVector(n, -d / 2);
    positions.push(pBot.x, pBot.y, pBot.z);
    normals.push(g.x, g.y, g.z);
    uvs.push(i / uSegs, 1);
    vertOffset += 2;
  }

  for (let i = 0; i < uSegs; i++) {
    const i1 = rightStart + i * 2;
    const i2 = rightStart + (i + 1) * 2;
    addQuad(i1, i2, i2 + 1, i1 + 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

/**
 * Builds the authentic single continuous ribbon of length 4*PI for Midline Cut.
 * Parameter U runs from 0 to 4*PI (total circumference 2L).
 * Has true paper thickness d, top face, bottom face, and edge rims.
 */
function buildSingleDoubleLengthLoopGeometry(R, w, d, hSag = 0.32, separationProgress = 0.0) {
  const uSegs = 200;
  const vSegs = 4;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  function addQuad(i1, i2, i3, i4) {
    indices.push(i1, i2, i4);
    indices.push(i2, i3, i4);
  }

  let vertOffset = 0;
  const gap = 0.02 + separationProgress * 0.38;
  const halfW = w / 2 - gap;

  // 1. Top Face (t = +d/2)
  const topStart = vertOffset;
  for (let i = 0; i <= uSegs; i++) {
    const U = (i / uSegs) * 4 * Math.PI;
    let baseU, side;
    if (U <= 2 * Math.PI) {
      baseU = U;
      side = 1;
    } else {
      baseU = U - 2 * Math.PI;
      side = -1;
    }

    const c = getCenterlinePoint(baseU, R, hSag);
    const tu = getCenterlineTangent(baseU, R, hSag);
    const g = getRulingVector(baseU, 1, tu);
    const n = new THREE.Vector3().crossVectors(tu, g).normalize();

    const unfoldDispN = side * separationProgress * 0.75 * Math.sin(U / 2);
    const unfoldDispG = side * separationProgress * 0.40 * Math.cos(U / 2);

    for (let j = 0; j <= vSegs; j++) {
      const fracV = j / vSegs;
      const v = side * (gap + fracV * halfW);
      const pt = c.clone()
        .addScaledVector(g, v + unfoldDispG)
        .addScaledVector(n, d / 2 + unfoldDispN);

      positions.push(pt.x, pt.y, pt.z);
      normals.push(n.x, n.y, n.z);
      uvs.push(i / uSegs, j / vSegs);
      vertOffset++;
    }
  }

  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
      const row1 = topStart + i * (vSegs + 1) + j;
      const row2 = topStart + (i + 1) * (vSegs + 1) + j;
      addQuad(row1, row2, row2 + 1, row1 + 1);
    }
  }

  // 2. Bottom Face (t = -d/2)
  const botStart = vertOffset;
  for (let i = 0; i <= uSegs; i++) {
    const U = (i / uSegs) * 4 * Math.PI;
    let baseU, side;
    if (U <= 2 * Math.PI) {
      baseU = U;
      side = 1;
    } else {
      baseU = U - 2 * Math.PI;
      side = -1;
    }

    const c = getCenterlinePoint(baseU, R, hSag);
    const tu = getCenterlineTangent(baseU, R, hSag);
    const g = getRulingVector(baseU, 1, tu);
    const n = new THREE.Vector3().crossVectors(tu, g).normalize();

    const unfoldDispN = side * separationProgress * 0.75 * Math.sin(U / 2);
    const unfoldDispG = side * separationProgress * 0.40 * Math.cos(U / 2);

    for (let j = 0; j <= vSegs; j++) {
      const fracV = j / vSegs;
      const v = side * (gap + fracV * halfW);
      const pt = c.clone()
        .addScaledVector(g, v + unfoldDispG)
        .addScaledVector(n, -d / 2 + unfoldDispN);

      positions.push(pt.x, pt.y, pt.z);
      normals.push(-n.x, -n.y, -n.z);
      uvs.push(i / uSegs, j / vSegs);
      vertOffset++;
    }
  }

  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
      const row1 = botStart + i * (vSegs + 1) + j;
      const row2 = botStart + (i + 1) * (vSegs + 1) + j;
      addQuad(row1, row1 + 1, row2 + 1, row2);
    }
  }

  // 3. Cut inner rim (j = 0)
  const innerStart = vertOffset;
  for (let i = 0; i <= uSegs; i++) {
    const U = (i / uSegs) * 4 * Math.PI;
    let baseU, side;
    if (U <= 2 * Math.PI) {
      baseU = U;
      side = 1;
    } else {
      baseU = U - 2 * Math.PI;
      side = -1;
    }

    const c = getCenterlinePoint(baseU, R, hSag);
    const tu = getCenterlineTangent(baseU, R, hSag);
    const g = getRulingVector(baseU, 1, tu);
    const n = new THREE.Vector3().crossVectors(tu, g).normalize();

    const unfoldDispN = side * separationProgress * 0.75 * Math.sin(U / 2);
    const unfoldDispG = side * separationProgress * 0.40 * Math.cos(U / 2);

    const v = side * gap;
    const pTop = c.clone().addScaledVector(g, v + unfoldDispG).addScaledVector(n, d / 2 + unfoldDispN);
    const pBot = c.clone().addScaledVector(g, v + unfoldDispG).addScaledVector(n, -d / 2 + unfoldDispN);

    positions.push(pTop.x, pTop.y, pTop.z);
    normals.push(-side * g.x, -side * g.y, -side * g.z);
    uvs.push(i / uSegs, 0);

    positions.push(pBot.x, pBot.y, pBot.z);
    normals.push(-side * g.x, -side * g.y, -side * g.z);
    uvs.push(i / uSegs, 1);
    vertOffset += 2;
  }

  for (let i = 0; i < uSegs; i++) {
    const i1 = innerStart + i * 2;
    const i2 = innerStart + (i + 1) * 2;
    addQuad(i1, i1 + 1, i2 + 1, i2);
  }

  // 4. Natural outer rim (j = vSegs)
  const outerStart = vertOffset;
  for (let i = 0; i <= uSegs; i++) {
    const U = (i / uSegs) * 4 * Math.PI;
    let baseU, side;
    if (U <= 2 * Math.PI) {
      baseU = U;
      side = 1;
    } else {
      baseU = U - 2 * Math.PI;
      side = -1;
    }

    const c = getCenterlinePoint(baseU, R, hSag);
    const tu = getCenterlineTangent(baseU, R, hSag);
    const g = getRulingVector(baseU, 1, tu);
    const n = new THREE.Vector3().crossVectors(tu, g).normalize();

    const unfoldDispN = side * separationProgress * 0.75 * Math.sin(U / 2);
    const unfoldDispG = side * separationProgress * 0.40 * Math.cos(U / 2);

    const v = side * (gap + halfW);
    const pTop = c.clone().addScaledVector(g, v + unfoldDispG).addScaledVector(n, d / 2 + unfoldDispN);
    const pBot = c.clone().addScaledVector(g, v + unfoldDispG).addScaledVector(n, -d / 2 + unfoldDispN);

    positions.push(pTop.x, pTop.y, pTop.z);
    normals.push(side * g.x, side * g.y, side * g.z);
    uvs.push(i / uSegs, 0);

    positions.push(pBot.x, pBot.y, pBot.z);
    normals.push(side * g.x, side * g.y, side * g.z);
    uvs.push(i / uSegs, 1);
    vertOffset += 2;
  }

  for (let i = 0; i < uSegs; i++) {
    const i1 = outerStart + i * 2;
    const i2 = outerStart + (i + 1) * 2;
    addQuad(i1, i2, i2 + 1, i1 + 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds the two physically interlinked loops for One-Third Offset Cut:
 * Loop 1: Narrow Möbius strip (L length, 1 half-twist)
 * Loop 2: Double-length loop (2L length, 4 half-twists)
 * Linked together like chain links!
 */
function buildInterlockedOffsetLoopsGeometry(R, w, d, hSag = 0.32, separationProgress = 0.0) {
  // Loop 1: Inner Möbius strip between v = -w/6 and w/6
  const geoMobius = buildPhysicalPaperStripGeometry(
    R, w, d, 1, hSag,
    -w / 6 + 0.015, w / 6 - 0.015, 2 * Math.PI, separationProgress * 0.45
  );

  // Loop 2: Double-length outer loop (width w/3), threading through Loop 1
  const uSegs = 200;
  const vSegs = 4;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  function addQuad(i1, i2, i3, i4) {
    indices.push(i1, i2, i4);
    indices.push(i2, i3, i4);
  }

  let vertOffset = 0;
  const gap = 0.03 + separationProgress * 0.35;

  const topStart = vertOffset;
  for (let i = 0; i <= uSegs; i++) {
    const U = (i / uSegs) * 4 * Math.PI;
    let baseU, side;
    if (U <= 2 * Math.PI) {
      baseU = U;
      side = 1;
    } else {
      baseU = U - 2 * Math.PI;
      side = -1;
    }

    const c = getCenterlinePoint(baseU, R, hSag);
    const tu = getCenterlineTangent(baseU, R, hSag);
    const g = getRulingVector(baseU, 1, tu);
    const n = new THREE.Vector3().crossVectors(tu, g).normalize();

    // Pulls in -Z / -Y to demonstrate topological chain-link interlock
    const unfoldDispN = -side * separationProgress * 0.65 * Math.sin(U / 2);
    const unfoldDispG = -side * separationProgress * 0.35 * Math.cos(U / 2);

    for (let j = 0; j <= vSegs; j++) {
      const fracV = j / vSegs;
      const v = side * (w / 6 + gap + fracV * (w / 2 - (w / 6 + gap)));
      const pt = c.clone()
        .addScaledVector(g, v + unfoldDispG)
        .addScaledVector(n, d / 2 + unfoldDispN);

      positions.push(pt.x, pt.y, pt.z);
      normals.push(n.x, n.y, n.z);
      uvs.push(i / uSegs, j / vSegs);
      vertOffset++;
    }
  }

  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
      const row1 = topStart + i * (vSegs + 1) + j;
      const row2 = topStart + (i + 1) * (vSegs + 1) + j;
      addQuad(row1, row2, row2 + 1, row1 + 1);
    }
  }

  // Bottom face for loop 2
  const botStart = vertOffset;
  for (let i = 0; i <= uSegs; i++) {
    const U = (i / uSegs) * 4 * Math.PI;
    let baseU, side;
    if (U <= 2 * Math.PI) {
      baseU = U;
      side = 1;
    } else {
      baseU = U - 2 * Math.PI;
      side = -1;
    }

    const c = getCenterlinePoint(baseU, R, hSag);
    const tu = getCenterlineTangent(baseU, R, hSag);
    const g = getRulingVector(baseU, 1, tu);
    const n = new THREE.Vector3().crossVectors(tu, g).normalize();

    const unfoldDispN = -side * separationProgress * 0.65 * Math.sin(U / 2);
    const unfoldDispG = -side * separationProgress * 0.35 * Math.cos(U / 2);

    for (let j = 0; j <= vSegs; j++) {
      const fracV = j / vSegs;
      const v = side * (w / 6 + gap + fracV * (w / 2 - (w / 6 + gap)));
      const pt = c.clone()
        .addScaledVector(g, v + unfoldDispG)
        .addScaledVector(n, -d / 2 + unfoldDispN);

      positions.push(pt.x, pt.y, pt.z);
      normals.push(-n.x, -n.y, -n.z);
      uvs.push(i / uSegs, j / vSegs);
      vertOffset++;
    }
  }

  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
      const row1 = botStart + i * (vSegs + 1) + j;
      const row2 = botStart + (i + 1) * (vSegs + 1) + j;
      addQuad(row1, row1 + 1, row2 + 1, row2);
    }
  }

  const geoDouble = new THREE.BufferGeometry();
  geoDouble.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geoDouble.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geoDouble.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geoDouble.setIndex(indices);
  geoDouble.computeVertexNormals();

  return { geoMobius, geoDouble };
}

export default function MobiusStrip3DLab() {
  const mountRef = useRef(null);

  // Mode: 'ant' (Traversal & Ink) | 'scissors' (Cutting Paradox) | 'topology' (Manifold Parameters)
  const [activeMode, setActiveMode] = useState('ant');

  // Surface Material Theme: 'parchment' (Archival Cardstock) | 'titanium' (Matte Slate)
  const [surfaceTheme, setSurfaceTheme] = useState('parchment');

  // Mode 1: Ant Traversal State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [traversalU, setTraversalU] = useState(0.0);
  const [showNormalVector, setShowNormalVector] = useState(true);
  const [cameraFollowAnt, setCameraFollowAnt] = useState(false);

  // Mode 2: Scissors Paradox State
  const [cutType, setCutType] = useState('midline');
  const [cutProgress, setCutProgress] = useState(0.0);
  const [separationProgress, setSeparationProgress] = useState(0.0);
  const [isAutoCutting, setIsAutoCutting] = useState(false);
  const [userPrediction, setUserPrediction] = useState(null);

  // Mode 3: Topology Parameters
  const [halfTwists, setHalfTwists] = useState(1);
  const [ribbonRadius, setRibbonRadius] = useState(3.4);
  const [ribbonWidth, setRibbonWidth] = useState(1.4);
  const [isWireframe, setIsWireframe] = useState(false);
  const [showNormalGrid, setShowNormalGrid] = useState(false);

  // Paper physical properties
  const paperThickness = 0.038; // 380 micron heavy archival drafting paper
  const paperSag = 0.32; // Realistic out-of-plane developable saddle deflection

  // Global settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // Three.js Scene References
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const antMeshRef = useRef(null);
  const scissorsMeshRef = useRef(null);
  const stripMeshRef = useRef(null);
  const tapeMeshRef = useRef(null);
  const inkLineMeshRef = useRef(null);
  const cutGroupRef = useRef(null);
  const normalGridGroupRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const circuitMilestoneRef = useRef({ halfCompleted: false, fullCompleted: false });

  // Sync Audio Mute
  useEffect(() => {
    audioEngine.isMuted = !soundEnabled;
  }, [soundEnabled]);

  // Telemetry Calculations
  const telemetry = useMemo(() => {
    const k = activeMode === 'topology' ? halfTwists : 1;
    const R = ribbonRadius;
    const u = traversalU;

    const c = getCenterlinePoint(u, R, paperSag);
    const tu = getCenterlineTangent(u, R, paperSag);
    const g = getRulingVector(u, k, tu);
    const n = new THREE.Vector3().crossVectors(tu, g).normalize();

    const twistAngleDeg = ((u / 2) * (180 / Math.PI)) % 360;
    const arcLengthTraveled = u * R;
    const loopNumber = u < 2 * Math.PI ? 1 : 2;
    const isApparentSideA = loopNumber === 1;

    const isEvenTwist = k % 2 === 0;
    const sidesCount = isEvenTwist ? 2 : 1;
    const boundaryCount = isEvenTwist ? 2 : 1;
    const orientable = isEvenTwist ? 'Orientable' : 'Non-Orientable';

    return {
      nx: n.x.toFixed(3),
      ny: n.y.toFixed(3),
      nz: n.z.toFixed(3),
      twistAngleDeg: twistAngleDeg.toFixed(1),
      arcLengthTraveled: arcLengthTraveled.toFixed(2),
      totalDoubleLength: (4 * Math.PI * R).toFixed(2),
      loopNumber,
      sideName: isApparentSideA ? 'Side A (Apparent Exterior)' : 'Side B (Apparent Interior / Inverted)',
      chirality: loopNumber === 1 ? 'Right-Handed (+)' : 'Left-Handed (-) (Inverted)',
      sidesCount,
      boundaryCount,
      orientable,
      eulerChar: 0,
    };
  }, [traversalU, halfTwists, ribbonRadius, activeMode]);

  // Handle Play/Pause
  const handleTogglePlay = useCallback(() => {
    audioEngine.init();
    setIsPlaying((prev) => !prev);
  }, []);

  // Reset Ant Journey
  const handleResetJourney = useCallback(() => {
    setTraversalU(0.0);
    circuitMilestoneRef.current = { halfCompleted: false, fullCompleted: false };
    if (audioEngine) audioEngine.playStep();
  }, []);

  // Rebuild Physical Paper Möbius Strip Mesh with Taped Seam & True Thickness
  const rebuildStripMesh = useCallback(() => {
    if (!sceneRef.current) return;

    if (stripMeshRef.current) {
      sceneRef.current.remove(stripMeshRef.current);
      stripMeshRef.current.geometry.dispose();
      stripMeshRef.current = null;
    }
    if (tapeMeshRef.current) {
      sceneRef.current.remove(tapeMeshRef.current);
      tapeMeshRef.current = null;
    }
    if (cutGroupRef.current) {
      sceneRef.current.remove(cutGroupRef.current);
      cutGroupRef.current = null;
    }
    if (normalGridGroupRef.current) {
      sceneRef.current.remove(normalGridGroupRef.current);
      normalGridGroupRef.current = null;
    }

    const R = ribbonRadius;
    const w = ribbonWidth;
    const d = paperThickness;
    const k = activeMode === 'topology' ? halfTwists : 1;
    const isParchment = surfaceTheme === 'parchment';
    const cardTexture = createCardstockTexture(surfaceTheme);

    // Mode 2: Scissors Paradox Meshes with Physical Paper Realism
    if (activeMode === 'scissors') {
      const group = new THREE.Group();

      if (cutProgress < 1.0) {
        // Cut in progress or at start: Render base intact strip
        const baseGeo = buildPhysicalPaperStripGeometry(R, w, d, 1, paperSag, -w / 2, w / 2, 2 * Math.PI, 0);
        const baseMat = new THREE.MeshPhysicalMaterial({
          map: cardTexture,
          color: isParchment ? 0xfaf6eb : 0x1e293b,
          roughness: isParchment ? 0.65 : 0.35,
          metalness: isParchment ? 0.02 : 0.25,
          clearcoat: isParchment ? 0.12 : 0.35,
          clearcoatRoughness: 0.4,
          wireframe: isWireframe,
        });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        group.add(baseMesh);

        // 3D Guideline and Incision Seam
        const totalU = cutProgress * 4 * Math.PI;
        const lineSegs = 140;
        const linePositions = [];
        const cutPositions = [];

        for (let i = 0; i <= lineSegs; i++) {
          const curU = (i / lineSegs) * (4 * Math.PI);
          let baseU, curV;
          if (curU <= 2 * Math.PI) {
            baseU = curU;
            curV = cutType === 'midline' ? 0 : -w / 6;
          } else {
            baseU = curU - 2 * Math.PI;
            curV = cutType === 'midline' ? 0 : w / 6;
          }

          const c = getCenterlinePoint(baseU, R, paperSag);
          const tu = getCenterlineTangent(baseU, R, paperSag);
          const g = getRulingVector(baseU, 1, tu);
          const n = new THREE.Vector3().crossVectors(tu, g).normalize();
          const pt = c.clone().addScaledVector(g, curV).addScaledVector(n, d / 2 + 0.008);

          if (curU <= totalU) {
            cutPositions.push(pt.x, pt.y, pt.z);
          } else {
            linePositions.push(pt.x, pt.y, pt.z);
          }
        }

        // Active incision slit (red incision line where scissors cut)
        if (cutPositions.length >= 6) {
          const cutGeo = new THREE.BufferGeometry();
          cutGeo.setAttribute('position', new THREE.Float32BufferAttribute(cutPositions, 3));
          const cutMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 });
          const cutLine = new THREE.Line(cutGeo, cutMat);
          group.add(cutLine);
        }

        // Dotted guideline ahead of scissors
        if (linePositions.length >= 6) {
          const guideGeo = new THREE.BufferGeometry();
          guideGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
          const guideMat = new THREE.LineDashedMaterial({
            color: 0x94a3b8,
            dashSize: 0.15,
            gapSize: 0.08,
          });
          const guideLine = new THREE.Line(guideGeo, guideMat);
          guideLine.computeLineDistances();
          group.add(guideLine);
        }
      } else {
        // Cut is COMPLETE (cutProgress === 1.0)
        if (cutType === 'midline') {
          // ONE SINGLE continuous loop of double length (4*PI) and 4 half-twists!
          const singleGeo = buildSingleDoubleLengthLoopGeometry(R, w, d, paperSag, separationProgress);
          const singleMat = new THREE.MeshPhysicalMaterial({
            map: cardTexture,
            color: isParchment ? 0xfaf6eb : 0x1e293b,
            roughness: isParchment ? 0.65 : 0.35,
            metalness: isParchment ? 0.02 : 0.25,
            clearcoat: isParchment ? 0.2 : 0.4,
            wireframe: isWireframe,
            side: THREE.DoubleSide,
          });
          const singleMesh = new THREE.Mesh(singleGeo, singleMat);
          singleMesh.castShadow = true;
          singleMesh.receiveShadow = true;
          group.add(singleMesh);
        } else {
          // ONE-THIRD CUT: TWO interlocked loops (one thin Mobius + one double loop)
          const { geoMobius, geoDouble } = buildInterlockedOffsetLoopsGeometry(R, w, d, paperSag, separationProgress);

          const matMobius = new THREE.MeshPhysicalMaterial({
            map: cardTexture,
            color: 0xf59e0b,
            roughness: 0.5,
            metalness: 0.1,
            clearcoat: 0.2,
            wireframe: isWireframe,
            side: THREE.DoubleSide,
          });
          const meshMobius = new THREE.Mesh(geoMobius, matMobius);
          meshMobius.castShadow = true;

          const matDouble = new THREE.MeshPhysicalMaterial({
            map: cardTexture,
            color: 0x38bdf8,
            roughness: 0.5,
            metalness: 0.1,
            clearcoat: 0.2,
            wireframe: isWireframe,
            side: THREE.DoubleSide,
          });
          const meshDouble = new THREE.Mesh(geoDouble, matDouble);
          meshDouble.castShadow = true;

          group.add(meshMobius, meshDouble);
        }
      }

      cutGroupRef.current = group;
      sceneRef.current.add(group);
      return;
    }

    // Default & Ant & Topology Modes: Canonical Single Developable Paper Strip
    const geometry = buildPhysicalPaperStripGeometry(R, w, d, k, paperSag, -w / 2, w / 2, 2 * Math.PI, 0);

    const material = new THREE.MeshPhysicalMaterial({
      map: cardTexture,
      color: isParchment ? 0xfaf6eb : 0x1e293b,
      roughness: isParchment ? 0.65 : 0.35,
      metalness: isParchment ? 0.02 : 0.25,
      clearcoat: isParchment ? 0.12 : 0.35,
      clearcoatRoughness: 0.4,
      wireframe: isWireframe,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    stripMeshRef.current = mesh;
    sceneRef.current.add(mesh);

    // ── Physical Taped Seam Joint (August Möbius 1858 adhesive joint) ──
    const tapeGroup = new THREE.Group();
    const tapeGeo = new THREE.PlaneGeometry(0.24, w * 1.05);
    const tapeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.75, // Semi-transparent cellophane tape
      opacity: 0.8,
      transparent: true,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
    });
    const tape = new THREE.Mesh(tapeGeo, tapeMat);

    // Position tape at u = 0 across the seam
    const c0 = getCenterlinePoint(0, R, paperSag);
    const tu0 = getCenterlineTangent(0, R, paperSag);
    const g0 = getRulingVector(0, k, tu0);
    const n0 = new THREE.Vector3().crossVectors(tu0, g0).normalize();

    tape.position.copy(c0).addScaledVector(n0, d / 2 + 0.006);
    tape.lookAt(tape.position.clone().add(n0));
    tape.rotateZ(Math.PI / 2);
    tapeGroup.add(tape);

    tapeMeshRef.current = tapeGroup;
    sceneRef.current.add(tapeGroup);

    // Normal Grid Overlay in Topology Mode
    if (activeMode === 'topology' && showNormalGrid) {
      const normalGroup = new THREE.Group();
      for (let i = 0; i < 140; i += 10) {
        const u = (i / 140) * 2 * Math.PI;
        const c = getCenterlinePoint(u, R, paperSag);
        const tu = getCenterlineTangent(u, R, paperSag);
        const g = getRulingVector(u, k, tu);
        const n = new THREE.Vector3().crossVectors(tu, g).normalize();

        for (let j = 0; j <= 8; j += 4) {
          const v = -w / 2 + (j / 8) * w;
          const pos = c.clone().addScaledVector(g, v).addScaledVector(n, d / 2);
          const arrow = new THREE.ArrowHelper(n, pos, 0.35, 0x38bdf8, 0.08, 0.04);
          normalGroup.add(arrow);
        }
      }
      normalGridGroupRef.current = normalGroup;
      sceneRef.current.add(normalGroup);
    }
  }, [
    ribbonRadius,
    ribbonWidth,
    paperThickness,
    paperSag,
    halfTwists,
    activeMode,
    isWireframe,
    showNormalGrid,
    cutType,
    cutProgress,
    separationProgress,
    surfaceTheme,
  ]);

  // Build / Update Realistic Red Fountain-Pen Ink Trail on Paper Surface
  const updateInkTrailMesh = useCallback(() => {
    if (!sceneRef.current) return;

    if (inkLineMeshRef.current) {
      sceneRef.current.remove(inkLineMeshRef.current);
      inkLineMeshRef.current.geometry.dispose();
      inkLineMeshRef.current = null;
    }

    if (activeMode !== 'ant' || traversalU <= 0.02) return;

    const R = ribbonRadius;
    const d = paperThickness;
    const k = 1;
    const pointsCount = Math.max(12, Math.floor((traversalU / (4 * Math.PI)) * 360));
    const points = [];

    for (let i = 0; i <= pointsCount; i++) {
      const u = (i / pointsCount) * traversalU;
      const c = getCenterlinePoint(u, R, paperSag);
      const tu = getCenterlineTangent(u, R, paperSag);
      const g = getRulingVector(u, k, tu);
      const n = new THREE.Vector3().crossVectors(tu, g).normalize();

      // Sit directly on top of paper surface with microscopic offset to eliminate z-fighting
      const pos = c.clone().addScaledVector(n, d / 2 + 0.008);
      points.push(pos);
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, pointsCount, 0.024, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // Liquid fountain pen crimson
      roughness: 0.25,
      metalness: 0.1,
    });

    const inkMesh = new THREE.Mesh(tubeGeo, tubeMat);
    inkLineMeshRef.current = inkMesh;
    sceneRef.current.add(inkMesh);
  }, [traversalU, ribbonRadius, paperThickness, paperSag, activeMode]);

  // Position Ant Probe & Scissors along Ribbon Surface
  const updateAntAndScissors = useCallback(() => {
    const R = ribbonRadius;
    const d = paperThickness;
    const k = 1;

    // 1. Ant Placement in Mode 1
    if (antMeshRef.current) {
      if (activeMode !== 'ant') {
        antMeshRef.current.visible = false;
      } else {
        antMeshRef.current.visible = true;
        const u = traversalU;

        const c = getCenterlinePoint(u, R, paperSag);
        const tu = getCenterlineTangent(u, R, paperSag);
        const g = getRulingVector(u, k, tu);
        const n = new THREE.Vector3().crossVectors(tu, g).normalize();

        // Position feet directly on paper top face
        const antPos = c.clone().addScaledVector(n, d / 2 + 0.004);
        antMeshRef.current.position.copy(antPos);

        // Authentic Biomechanical Orientation Frame:
        // Local +X = Tangent Forward (tu)
        // Local +Y = Surface Normal Up (n)
        // Local +Z = Lateral Left across width (tu x n)
        const lateral = new THREE.Vector3().crossVectors(tu, n).normalize();
        const rotMatrix = new THREE.Matrix4();
        rotMatrix.makeBasis(tu, n, lateral);
        antMeshRef.current.setRotationFromMatrix(rotMatrix);

        // True Biomechanical Alternating Tripod Gait Kinematics
        const { bodyGroup, headGroup, gasterGroup, antennaL, antennaR, mandibleL, mandibleR, legRigs } = antMeshRef.current.userData || {};

        if (legRigs && legRigs.length === 6) {
          // Physical stride frequency calibrated to ground travel speed (eliminates slipping)
          const gaitPhase = u * 48;
          const sweepAmp = 0.26;

          // Tripod A: L1 (idx 0), R2 (idx 3), L3 (idx 4)
          // Tripod B: R1 (idx 1), L2 (idx 2), R3 (idx 5)
          const tripods = [
            { indices: [0, 3, 4], phase: gaitPhase },
            { indices: [1, 2, 5], phase: gaitPhase + Math.PI },
          ];

          tripods.forEach(({ indices, phase }) => {
            const psi = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
            const isStance = psi <= Math.PI;

            indices.forEach((idx) => {
              const rig = legRigs[idx];
              if (!rig) return;

              if (isStance) {
                // Stance Phase: Foot firmly planted on paper, leg pushes backward relative to body
                const p = psi / Math.PI;
                const sweep = Math.cos(p * Math.PI) * sweepAmp;

                rig.coxaGroup.rotation.y = rig.baseAngleY + sweep;
                rig.femurGroup.rotation.z = 0;
                rig.femurGroup.rotation.x = rig.side * rig.basePitch;
                rig.tibiaGroup.rotation.x = rig.side * -rig.baseTibiaPitch;
              } else {
                // Swing Phase: Smooth parabolic lift and forward protraction (zero velocity shock)
                const s = (psi - Math.PI) / Math.PI;
                const sweep = -Math.cos(s * Math.PI) * sweepAmp;
                const lift = Math.pow(Math.sin(s * Math.PI), 2) * 0.42;

                rig.coxaGroup.rotation.y = rig.baseAngleY + sweep;
                rig.femurGroup.rotation.z = -lift * 0.65;
                rig.femurGroup.rotation.x = rig.side * (rig.basePitch - lift * 0.45);
                rig.tibiaGroup.rotation.x = rig.side * (-rig.baseTibiaPitch + lift * 0.55);
              }
            });
          });

          // Organic Body Kinematics (Thoracic yaw sway, vertical heave, and roll)
          if (bodyGroup) {
            bodyGroup.rotation.y = Math.sin(gaitPhase) * 0.035;
            bodyGroup.position.y = Math.sin(gaitPhase * 2) * 0.007;
            bodyGroup.rotation.x = Math.sin(gaitPhase) * 0.016;
          }

          // Head stabilization towards forward horizon
          if (headGroup) {
            headGroup.rotation.y = -Math.sin(gaitPhase) * 0.02;
          }

          // Gaster inertial lag and physiological breathing bob
          if (gasterGroup) {
            gasterGroup.rotation.y = Math.sin(gaitPhase - 0.75) * 0.055;
            gasterGroup.rotation.z = Math.sin(gaitPhase * 2 - 0.5) * 0.035;
          }

          // Active Sensory Antennae Palpation (tactile surface probing)
          const timeSec = performance.now() / 1000;
          if (antennaL && antennaR) {
            antennaL.rotation.y = Math.sin(timeSec * 5.2) * 0.15 + 0.12;
            antennaL.rotation.z = Math.sin(timeSec * 9.8) * 0.16 - 0.22;
            antennaR.rotation.y = -Math.cos(timeSec * 5.5) * 0.15 - 0.12;
            antennaR.rotation.z = Math.cos(timeSec * 10.2) * 0.16 - 0.22;
          }

          // Subtle Mandible Micro-Flexion
          if (mandibleL && mandibleR) {
            mandibleL.rotation.z = -0.3 + Math.sin(timeSec * 2.8) * 0.04;
            mandibleR.rotation.z = 0.3 - Math.sin(timeSec * 2.8) * 0.04;
          }
        }

        const arrow = antMeshRef.current.getObjectByName('normalArrow');
        if (arrow) {
          arrow.visible = showNormalVector;
        }

        if (cameraFollowAnt && cameraRef.current && controlsRef.current) {
          // Dynamic chase camera directly behind the ant's back looking forward along the strip
          const camOffset = n.clone().multiplyScalar(1.6).add(tu.clone().multiplyScalar(-2.6));
          cameraRef.current.position.copy(antMeshRef.current.position).add(camOffset);
          const lookAhead = antMeshRef.current.position.clone().addScaledVector(tu, 0.9);
          controlsRef.current.target.copy(lookAhead);
          controlsRef.current.update();
        }
      }
    }

    // 2. Scissors Tool Placement in Mode 2
    if (scissorsMeshRef.current) {
      if (activeMode !== 'scissors' || cutProgress >= 1.0) {
        scissorsMeshRef.current.visible = false;
      } else {
        scissorsMeshRef.current.visible = true;
        const totalU = cutProgress * 4 * Math.PI;
        let baseU, vOffset;
        if (totalU <= 2 * Math.PI) {
          baseU = totalU;
          vOffset = cutType === 'midline' ? 0 : -ribbonWidth / 6;
        } else {
          baseU = totalU - 2 * Math.PI;
          vOffset = cutType === 'midline' ? 0 : ribbonWidth / 6;
        }

        const c = getCenterlinePoint(baseU, R, paperSag);
        const tu = getCenterlineTangent(baseU, R, paperSag);
        const g = getRulingVector(baseU, k, tu);
        const n = new THREE.Vector3().crossVectors(tu, g).normalize();

        const scissorPos = c.clone()
          .addScaledVector(g, vOffset)
          .addScaledVector(n, d / 2 + 0.08);

        scissorsMeshRef.current.position.copy(scissorPos);

        const dir = tu.clone().normalize();
        const up = n.clone().normalize();
        const right = new THREE.Vector3().crossVectors(dir, up).normalize();

        const rotMatrix = new THREE.Matrix4();
        rotMatrix.makeBasis(dir, up, right);
        scissorsMeshRef.current.setRotationFromMatrix(rotMatrix);

        if (scissorsMeshRef.current.userData) {
          const { arm1, arm2 } = scissorsMeshRef.current.userData;
          if (arm1 && arm2) {
            const snipAngle = isAutoCutting
              ? (Math.sin(performance.now() * 0.018) * 0.5 + 0.5) * 0.16 + 0.04
              : 0.06;
            arm1.rotation.z = snipAngle;
            arm2.rotation.z = -snipAngle;
          }
        }
      }
    }
  }, [
    traversalU,
    cutProgress,
    cutType,
    ribbonRadius,
    ribbonWidth,
    paperThickness,
    paperSag,
    activeMode,
    showNormalVector,
    cameraFollowAnt,
    isAutoCutting,
  ]);

  // Setup Three.js WebGL Scene with Studio Lighting & Pedestal
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, -9.2, 7.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 25;
    controls.minDistance = 2.5;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    // ── Neutral Photographic Studio Lighting ──
    const ambientLight = new THREE.AmbientLight(0xf1f5f9, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.0);
    keyLight.position.set(10, 15, 12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 30;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.9);
    fillLight.position.set(-10, 8, -8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 12, -12);
    scene.add(rimLight);

    const bounceLight = new THREE.DirectionalLight(0x94a3b8, 0.4);
    bounceLight.position.set(0, -10, 0);
    scene.add(bounceLight);



    // Ant Explorer Probe
    const ant = createAuthenticAntMesh();
    antMeshRef.current = ant;
    scene.add(ant);

    // Scissors Tool
    const scissors = createScissorsMesh();
    scissors.visible = false;
    scissorsMeshRef.current = scissors;
    scene.add(scissors);

    // Initial Mesh Build
    rebuildStripMesh();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    rebuildStripMesh();
  }, [rebuildStripMesh]);

  useEffect(() => {
    updateAntAndScissors();
    updateInkTrailMesh();
  }, [updateAntAndScissors, updateInkTrailMesh]);

  // Animation Loop
  useEffect(() => {
    const animate = (time) => {
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.autoRotateSpeed = 1.0;
        controlsRef.current.update();
      }

      if (activeMode === 'ant' && isPlaying) {
        setTraversalU((prevU) => {
          const step = delta * playbackSpeed * 0.75;
          let nextU = prevU + step;

          audioEngine.playStep();

          if (prevU < 2 * Math.PI && nextU >= 2 * Math.PI) {
            if (!circuitMilestoneRef.current.halfCompleted) {
              audioEngine.playChime(440, 0.3);
              circuitMilestoneRef.current.halfCompleted = true;
            }
          }

          if (nextU >= 4 * Math.PI) {
            nextU = 4 * Math.PI;
            setIsPlaying(false);
            if (!circuitMilestoneRef.current.fullCompleted) {
              audioEngine.playChime(880, 0.45);
              circuitMilestoneRef.current.fullCompleted = true;
            }
          }

          return nextU;
        });
      }

      if (activeMode === 'scissors' && isAutoCutting) {
        setCutProgress((prev) => {
          const step = delta * playbackSpeed * 0.12;
          const next = prev + step;

          if (prev < 0.5 && next >= 0.5) {
            audioEngine.playChime(520, 0.4);
          }

          if (next >= 1.0) {
            setIsAutoCutting(false);
            setSeparationProgress(0.35);
            audioEngine.playSnip();
            return 1.0;
          }

          if (Math.floor(next * 24) > Math.floor(prev * 24)) {
            audioEngine.playSnip();
          }

          return next;
        });
      }

      // Real-time organic sensory palpation & respiration on every frame
      if (antMeshRef.current && antMeshRef.current.visible) {
        const { antennaL, antennaR, mandibleL, mandibleR } = antMeshRef.current.userData || {};
        const timeSec = time / 1000;
        if (antennaL && antennaR) {
          antennaL.rotation.y = Math.sin(timeSec * 5.2) * 0.15 + 0.12;
          antennaL.rotation.z = Math.sin(timeSec * 9.8) * 0.16 - 0.22;
          antennaR.rotation.y = -Math.cos(timeSec * 5.5) * 0.15 - 0.12;
          antennaR.rotation.z = Math.cos(timeSec * 10.2) * 0.16 - 0.22;
        }
        if (mandibleL && mandibleR) {
          mandibleL.rotation.z = -0.3 + Math.sin(timeSec * 2.8) * 0.04;
          mandibleR.rotation.z = 0.3 - Math.sin(timeSec * 2.8) * 0.04;
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeMode, isPlaying, isAutoCutting, playbackSpeed, autoRotate]);

  return (
    <div className={styles.labContainer} data-testid="mobius-strip-3d-lab">
      {/* ── Top Dedicated Laboratory Header ── */}
      <header className={styles.labHeader}>
        <div className={styles.headerTitleBox}>
          <div className={styles.labBadge}>
            <Icon name="zap" size={12} />
            <span>Listing &amp; Möbius (1858) · Non-Orientable Manifold</span>
          </div>
          <h2 className={styles.headerTitle}>Möbius Strip Interactive Laboratory</h2>
          <p className={styles.headerSubtitle}>
            Empirical 3D simulation of one-sided topology, normal vector inversion, and cutting paradoxes.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={`${styles.actionBtn} ${soundEnabled ? styles.actionBtnActive : ''}`}
            onClick={() => {
              audioEngine.init();
              setSoundEnabled((prev) => !prev);
            }}
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            <Icon name={soundEnabled ? 'volume-2' : 'volume-x'} size={16} />
          </button>

          <button
            className={`${styles.actionBtn} ${autoRotate ? styles.actionBtnActive : ''}`}
            onClick={() => setAutoRotate((prev) => !prev)}
            title="Auto-Rotate Camera"
          >
            <Icon name="refresh-cw" size={16} />
          </button>

          <button
            className={`${styles.actionBtn} ${guideOpen ? styles.actionBtnActive : ''}`}
            onClick={() => setGuideOpen((prev) => !prev)}
            title="Interactive Lab Guide"
          >
            <Icon name="help-circle" size={16} />
          </button>
        </div>
      </header>

      {/* ── Mode Selection Navigation Bar ── */}
      <div className={styles.modeBar}>
        <button
          className={`${styles.modeTab} ${activeMode === 'ant' ? styles.modeTabActive : ''}`}
          onClick={() => {
            setActiveMode('ant');
            audioEngine.init();
          }}
        >
          <Icon name="compass" size={15} />
          <span>The Ant&apos;s 720° Journey</span>
        </button>

        <button
          className={`${styles.modeTab} ${activeMode === 'scissors' ? styles.modeTabActive : ''}`}
          onClick={() => {
            setActiveMode('scissors');
            audioEngine.init();
            audioEngine.playSnip();
          }}
        >
          <Icon name="scissors" size={15} />
          <span>The Scissors Paradox</span>
        </button>

        <button
          className={`${styles.modeTab} ${activeMode === 'topology' ? styles.modeTabActive : ''}`}
          onClick={() => {
            setActiveMode('topology');
            audioEngine.init();
          }}
        >
          <Icon name="sliders" size={15} />
          <span>Topological Manifold Sandbox</span>
        </button>

        {/* Surface Material Theme Toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          <button
            className={`${styles.pillBtn} ${surfaceTheme === 'parchment' ? styles.pillBtnActive : ''}`}
            onClick={() => setSurfaceTheme('parchment')}
            title="Archival Cardstock Paper"
          >
            Parchment
          </button>
          <button
            className={`${styles.pillBtn} ${surfaceTheme === 'titanium' ? styles.pillBtnActive : ''}`}
            onClick={() => setSurfaceTheme('titanium')}
            title="Matte Titanium Slate"
          >
            Titanium
          </button>
        </div>
      </div>

      {/* ── Main 3D Canvas Viewport ── */}
      <div className={styles.canvasContainer}>

        {/* Floating Telemetry Box */}
        <div className={styles.floatingTelemetry}>
          {activeMode === 'scissors' ? (
            <div className={styles.telemetryCard}>
              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Scissors Cut Arc</span>
                <span className={`${styles.telemetryValue} ${styles.telemetryValueCyan}`}>
                  {(cutProgress * 4 * Math.PI * ribbonRadius).toFixed(2)} / {(4 * Math.PI * ribbonRadius).toFixed(2)} m
                </span>
              </div>

              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Cutting Circuit</span>
                <span className={`${styles.telemetryValue} ${styles.telemetryValueAmber}`}>
                  {cutProgress < 0.5
                    ? `Lap 1 of 2 (${(cutProgress * 720).toFixed(0)}° / 360°)`
                    : cutProgress < 1.0
                    ? `Lap 2 of 2 (${(cutProgress * 720).toFixed(0)}° / 720°)`
                    : 'Cut Complete (720°)'}
                </span>
              </div>

              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Active Surface Face</span>
                <span className={styles.telemetryValue}>
                  {cutProgress < 0.5 ? 'Side A (Outer Surface)' : cutProgress < 1.0 ? 'Side B (Inverted Face)' : 'Fully Bisected'}
                </span>
              </div>

              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Paper Topology</span>
                <span className={`${styles.telemetryValue} ${cutProgress < 1.0 ? styles.telemetryValueCyan : styles.telemetryValueEmerald}`}>
                  {cutProgress < 1.0
                    ? '1 Continuous Piece (Not Split)'
                    : cutType === 'midline'
                    ? '1 Single Double-Length Ribbon'
                    : '2 Interlocked Chain Links'}
                </span>
              </div>

              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Resulting Half-Twists</span>
                <span className={`${styles.telemetryValue} ${styles.telemetryValueEmerald}`}>
                  {cutType === 'midline' ? '4 Half-Twists (720°)' : '1 Möbius (180°) + 1 Double (720°)'}
                </span>
              </div>

              <div className={styles.statusIndicator}>
                <div
                  className={`${styles.statusDot} ${
                    cutProgress < 1.0
                      ? cutProgress < 0.5
                        ? styles.statusDotCyan
                        : styles.statusDotCrimson
                      : styles.statusDotEmerald
                  }`}
                />
                <span>
                  {cutProgress === 0
                    ? 'Scissors ready at taped seam (u = 0)'
                    : cutProgress < 0.5
                    ? 'Lap 1: Slicing outer surface'
                    : cutProgress < 1.0
                    ? 'Lap 2: Slicing inverted surface'
                    : cutType === 'midline'
                    ? 'Result: Single 2L orientable loop'
                    : 'Result: Two physically linked rings'}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.telemetryCard}>
              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Traversal Arc Length</span>
                <span className={`${styles.telemetryValue} ${styles.telemetryValueCyan}`}>
                  {telemetry.arcLengthTraveled} / {telemetry.totalDoubleLength} m
                </span>
              </div>

              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Normal Vector (n̂)</span>
                <span className={styles.telemetryValue}>
                  ({telemetry.nx}, {telemetry.ny}, {telemetry.nz})
                </span>
              </div>

              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Twist Angle (u/2)</span>
                <span className={`${styles.telemetryValue} ${styles.telemetryValueAmber}`}>
                  {telemetry.twistAngleDeg}°
                </span>
              </div>

              <div className={styles.telemetryRow}>
                <span className={styles.telemetryLabel}>Loop Circuit</span>
                <span className={styles.telemetryValue}>
                  Loop {telemetry.loopNumber} of 2 ({((traversalU / (4 * Math.PI)) * 100).toFixed(0)}%)
                </span>
              </div>

              <div className={styles.statusIndicator}>
                <div
                  className={`${styles.statusDot} ${
                    telemetry.loopNumber === 1 ? styles.statusDotCyan : styles.statusDotCrimson
                  }`}
                />
                <span>{telemetry.sideName}</span>
              </div>

              <div className={styles.statusIndicator}>
                <div className={`${styles.statusDot} ${styles.statusDotEmerald}`} />
                <span>Chirality: {telemetry.chirality}</span>
              </div>
            </div>
          )}
        </div>

        {/* Floating Gizmo Hint */}
        <div className={styles.gizmoHint}>
          <Icon name="compass" size={12} />
          <span>Left-Drag: Orbit · Right-Drag: Pan · Scroll: Zoom</span>
        </div>

        {/* Three.js Canvas Mount */}
        <div ref={mountRef} className={styles.canvasWrapper} />
      </div>

      {/* ── Context-Sensitive Bottom Controls ── */}
      <div className={styles.controlsPanel}>
        {/* Mode 1: Ant 720° Traversal Controls */}
        {activeMode === 'ant' && (
          <>
            <div className={styles.primaryControlRow}>
              <div className={styles.playbackButtonGroup}>
                <button className={styles.playBtn} onClick={handleTogglePlay}>
                  <Icon name={isPlaying ? 'pause' : 'play'} size={15} />
                  <span>{isPlaying ? 'Pause Crawl' : 'Start Ant Crawl'}</span>
                </button>

                <button className={styles.secondaryBtn} onClick={handleResetJourney}>
                  <Icon name="rotate-ccw" size={14} />
                  <span>Reset Origin</span>
                </button>

                <button
                  className={`${styles.secondaryBtn} ${showNormalVector ? styles.actionBtnActive : ''}`}
                  onClick={() => setShowNormalVector((prev) => !prev)}
                >
                  <Icon name="compass" size={14} />
                  <span>{showNormalVector ? 'Hide Normal Vector' : 'Show Normal Vector'}</span>
                </button>

                <button
                  className={`${styles.secondaryBtn} ${cameraFollowAnt ? styles.actionBtnActive : ''}`}
                  onClick={() => setCameraFollowAnt((prev) => !prev)}
                >
                  <Icon name="eye" size={14} />
                  <span>{cameraFollowAnt ? 'Follow Cam: Active' : 'Follow Ant'}</span>
                </button>
              </div>

              {/* Scrubber Slider */}
              <div className={styles.timelineScrubber}>
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineLabel}>Manual Circuit Scrubber (0° to 720°)</span>
                  <span className={styles.timelineValue}>{((traversalU / (4 * Math.PI)) * 720).toFixed(0)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={4 * Math.PI}
                  step="0.02"
                  value={traversalU}
                  onChange={(e) => {
                    setTraversalU(parseFloat(e.target.value));
                    audioEngine.init();
                  }}
                  className={styles.sliderTrack}
                />
              </div>
            </div>

            <div className={styles.paradoxBanner}>
              <div className={styles.paradoxIcon}>
                <Icon name="info" size={18} />
              </div>
              <div>
                <div className={styles.paradoxHeading}>The 720° Topological Return Paradox</div>
                Notice the overlapping taped joint at the origin (<em>u</em> = 0) where Möbius joined the 180°-twisted paper band.
                After crawling one complete spatial circle (2π<em>R</em>), the ant returns to the exact seam, but its normal vector has rotated by exactly 180°—placing it upside down on what intuition calls the &ldquo;other side&rdquo;. It must crawl a second full circuit (4π<em>R</em>, 720°) to return right-side up! The red ink trail coats the entire paper ribbon without ever crossing an edge.
              </div>
            </div>
          </>
        )}

        {/* Mode 2: Scissors Paradox Controls */}
        {activeMode === 'scissors' && (
          <>
            {/* Step 1: The Prediction Challenge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <Icon name="help-circle" size={14} />
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Thought Experiment Challenge:</span>
                <span style={{ color: '#f8fafc' }}>
                  {cutType === 'midline'
                    ? 'What happens when you cut a Möbius strip down the center?'
                    : 'What happens with a 1/3 offset cut?'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {cutType === 'midline' ? (
                  <>
                    <button
                      className={`${styles.pillBtn} ${userPrediction === 'two_loops' ? styles.pillBtnActive : ''}`}
                      onClick={() => {
                        setUserPrediction('two_loops');
                        audioEngine.playStep();
                      }}
                    >
                      2 Separate Loops (Intuition)
                    </button>
                    <button
                      className={`${styles.pillBtn} ${userPrediction === 'one_loop' ? styles.pillBtnActive : ''}`}
                      onClick={() => {
                        setUserPrediction('one_loop');
                        audioEngine.playStep();
                      }}
                    >
                      1 Single Double-Length Loop
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`${styles.pillBtn} ${userPrediction === 'offset_disconnected' ? styles.pillBtnActive : ''}`}
                      onClick={() => {
                        setUserPrediction('offset_disconnected');
                        audioEngine.playStep();
                      }}
                    >
                      2 Disconnected Loops
                    </button>
                    <button
                      className={`${styles.pillBtn} ${userPrediction === 'offset_interlocked' ? styles.pillBtnActive : ''}`}
                      onClick={() => {
                        setUserPrediction('offset_interlocked');
                        audioEngine.playStep();
                      }}
                    >
                      2 Interlocked Chain Links
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Primary Control Row */}
            <div className={styles.primaryControlRow}>
              {/* Cut Selector Pills */}
              <div className={styles.pillGroup}>
                <button
                  className={`${styles.pillBtn} ${cutType === 'midline' ? styles.pillBtnActive : ''}`}
                  onClick={() => {
                    setCutType('midline');
                    setUserPrediction(null);
                    audioEngine.playSnip();
                  }}
                >
                  Midline Cut (Center 1/2)
                </button>
                <button
                  className={`${styles.pillBtn} ${cutType === 'offset' ? styles.pillBtnActive : ''}`}
                  onClick={() => {
                    setCutType('offset');
                    setUserPrediction(null);
                    audioEngine.playSnip();
                  }}
                >
                  One-Third Offset Cut (1/3 Edge)
                </button>
              </div>

              {/* Scissor Actions */}
              <div className={styles.playbackButtonGroup}>
                <button
                  className={styles.playBtn}
                  onClick={() => {
                    audioEngine.init();
                    if (cutProgress >= 1.0) {
                      setCutProgress(0.0);
                      setSeparationProgress(0.0);
                    }
                    setIsAutoCutting((prev) => !prev);
                  }}
                >
                  <Icon name={isAutoCutting ? 'pause' : 'scissors'} size={15} />
                  <span>{isAutoCutting ? 'Pause Cutting' : cutProgress >= 1.0 ? 'Re-Snip Ribbon' : 'Auto-Cut Ribbon (720°)'}</span>
                </button>

                <button
                  className={styles.secondaryBtn}
                  onClick={() => {
                    audioEngine.init();
                    audioEngine.playSnip();
                    setIsAutoCutting(false);
                    setCutProgress((prev) => {
                      const next = Math.min(1.0, prev + 15 / 720);
                      if (next >= 1.0 && separationProgress === 0) {
                        setSeparationProgress(0.35);
                      }
                      return next;
                    });
                  }}
                  title="Snip ahead 15°"
                >
                  <Icon name="scissors" size={14} />
                  <span>Snip (+15°)</span>
                </button>

                <button
                  className={styles.secondaryBtn}
                  onClick={() => {
                    audioEngine.init();
                    setIsAutoCutting(false);
                    setCutProgress(0.0);
                    setSeparationProgress(0.0);
                  }}
                >
                  <Icon name="rotate-ccw" size={14} />
                  <span>Reset Band</span>
                </button>
              </div>

              {/* Scrubber 1: Cut Completion */}
              <div className={styles.timelineScrubber}>
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineLabel}>Scissors Cut Completion</span>
                  <span className={styles.timelineValue}>
                    {(cutProgress * 100).toFixed(0)}% ({(cutProgress * 720).toFixed(0)}° / 720°)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.01"
                  value={cutProgress}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCutProgress(val);
                    if (val >= 1.0 && separationProgress === 0) {
                      setSeparationProgress(0.35);
                    }
                    audioEngine.playSnip();
                  }}
                  className={styles.sliderTrack}
                />
              </div>

              {/* Scrubber 2: Unfold / Separation Displacement */}
              <div className={styles.timelineScrubber}>
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineLabel}>Unfold / Separation Displacement</span>
                  <span className={styles.timelineValue}>{(separationProgress * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.02"
                  value={separationProgress}
                  onChange={(e) => setSeparationProgress(parseFloat(e.target.value))}
                  className={styles.sliderTrack}
                />
              </div>
            </div>

            {/* Dynamic Educational Paradox Banner */}
            <div className={styles.paradoxBanner}>
              <div className={styles.paradoxIcon}>
                <Icon name="scissors" size={18} />
              </div>
              <div>
                <div className={styles.paradoxHeading}>
                  {cutType === 'midline'
                    ? 'Center Cut Result: ONE Single Double-Length Ribbon (4 Half-Twists)'
                    : '1/3 Cut Result: TWO Interlocked Rings (1 Möbius + 1 Double-Length Loop)'}
                </div>

                {/* Dynamic Stage Commentary */}
                {cutProgress === 0 ? (
                  <span>
                    <strong>Step 1 (Start):</strong> The scissors are positioned at the taped seam (<em>u</em> = 0). Click <strong>Auto-Cut Ribbon (720°)</strong> or click <strong>Snip (+15°)</strong> to begin slicing down the midline.
                  </span>
                ) : cutProgress < 0.48 ? (
                  <span>
                    <strong>Lap 1 in Progress (0° to 360°):</strong> The scissors are cutting along Side A. Notice the red incision seam opening behind the blades.
                  </span>
                ) : cutProgress >= 0.48 && cutProgress < 0.55 ? (
                  <span style={{ color: '#38bdf8' }}>
                    <strong>The 360° Milestone Paradox!</strong> The scissors have traveled a full 360° circle back to the taped seam, yet the paper has <strong>NOT separated</strong>! Because the strip has a 180° twist, the scissors are now cutting the opposite side of the sheet. Slicing must continue for another 360° (720° total) to reach the initial puncture!
                  </span>
                ) : cutProgress < 1.0 ? (
                  <span>
                    <strong>Lap 2 in Progress (360° to 720°):</strong> The scissors are slicing the remaining paper on Side B. Once they reach 720°, the cut will finally meet the starting hole!
                  </span>
                ) : (
                  <span>
                    {cutType === 'midline' ? (
                      <>
                        <strong>The Cut is Complete (720°):</strong> Unlike a standard cylinder which falls into two independent rings, the single-sided Möbius strip produces <strong>ONE single continuous loop</strong> of twice the length (2<em>L</em> = 4π<em>R</em>), half the width, with <strong>four half-twists (720°)</strong>. Drag the <strong>Unfold / Separation Displacement</strong> slider above to relax the ribbon and verify its single continuous perimeter!
                      </>
                    ) : (
                      <>
                        <strong>The Cut is Complete (720°):</strong> Cutting at 1/3 offset produces <strong>two physically interlocked rings</strong>: one narrow Möbius strip of length <em>L</em> (180° twist) linked through a double-length ribbon of length 2<em>L</em> (720° twist) like chain links! Drag the <strong>Unfold</strong> slider to pull them in opposite directions.
                      </>
                    )}
                  </span>
                )}

                {/* User prediction feedback */}
                {userPrediction && cutProgress >= 0.5 && (
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
                    {userPrediction === 'two_loops' && (
                      <span>Your prediction: <em>2 Separate Loops</em>. Intuitively expected, but topology defies everyday intuition—it remained a single continuous loop!</span>
                    )}
                    {userPrediction === 'one_loop' && (
                      <span>Your prediction: <em>1 Single Double-Length Loop</em>. Spot on! You anticipated the 720° non-orientable topological return.</span>
                    )}
                    {userPrediction === 'offset_disconnected' && (
                      <span>Your prediction: <em>2 Disconnected Loops</em>. In reality, the loops cannot be pulled apart—they are topologically linked!</span>
                    )}
                    {userPrediction === 'offset_interlocked' && (
                      <span>Your prediction: <em>2 Interlocked Chain Links</em>. Exactly right! The linking number between the two components is 1.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Mode 3: Topological Parameters Grid */}
        {activeMode === 'topology' && (
          <>
            <div className={styles.parameterGrid}>
              <div className={styles.paramCard}>
                <div className={styles.paramHeader}>
                  <span className={styles.paramTitle}>Half-Twists (k)</span>
                  <span className={styles.paramVal}>
                    {halfTwists} ({halfTwists % 2 === 1 ? 'Möbius / Non-Orientable' : 'Cylinder / Orientable'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={halfTwists}
                  onChange={(e) => {
                    setHalfTwists(parseInt(e.target.value, 10));
                    audioEngine.init();
                  }}
                  className={styles.sliderTrack}
                />
              </div>

              <div className={styles.paramCard}>
                <div className={styles.paramHeader}>
                  <span className={styles.paramTitle}>Major Radius (R)</span>
                  <span className={styles.paramVal}>{ribbonRadius.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="5.0"
                  step="0.2"
                  value={ribbonRadius}
                  onChange={(e) => setRibbonRadius(parseFloat(e.target.value))}
                  className={styles.sliderTrack}
                />
              </div>

              <div className={styles.paramCard}>
                <div className={styles.paramHeader}>
                  <span className={styles.paramTitle}>Ribbon Width (w)</span>
                  <span className={styles.paramVal}>{ribbonWidth.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="2.4"
                  step="0.1"
                  value={ribbonWidth}
                  onChange={(e) => setRibbonWidth(parseFloat(e.target.value))}
                  className={styles.sliderTrack}
                />
              </div>

              <div className={styles.paramCard}>
                <div className={styles.paramHeader}>
                  <span className={styles.paramTitle}>Display Options</span>
                  <span className={styles.paramVal}>Visual Shaders</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    className={`${styles.pillBtn} ${isWireframe ? styles.pillBtnActive : ''}`}
                    onClick={() => setIsWireframe((prev) => !prev)}
                  >
                    Wireframe
                  </button>
                  <button
                    className={`${styles.pillBtn} ${showNormalGrid ? styles.pillBtnActive : ''}`}
                    onClick={() => setShowNormalGrid((prev) => !prev)}
                  >
                    Normal Grid
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.paradoxBanner}>
              <div className={styles.paradoxIcon}>
                <Icon name="database" size={18} />
              </div>
              <div>
                <div className={styles.paradoxHeading}>Topological Invariant: χ = 0</div>
                For any half-twist integer <em>k</em>, the Euler characteristic is χ = <em>V</em> - <em>E</em> + <em>F</em> = 0. When <em>k</em> is odd (1, 3), the manifold has strictly <strong>1 boundary component</strong> and <strong>1 side</strong>. When <em>k</em> is even (0, 2, 4), the manifold is orientable with <strong>2 boundaries</strong> and <strong>2 sides</strong>.
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Guided HUD Walkthrough ── */}
      <VisualizationGuideHUD
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Möbius Strip Laboratory Guide"
        steps={[
          {
            title: '1. The Ant & The Ink Trail',
            desc: 'Start the Ant Crawl in Mode 1. Observe how the red ink stylus coats both the "outside" and "inside" continuously. After 360° of spatial rotation, the ant is upside down with normal vector flipped.',
          },
          {
            title: '2. The 720° Full Return',
            desc: 'The ant must complete two full circuits (720°, 4πR) to return right-side up. This proves non-orientability: you cannot define a global outward normal vector on the surface.',
          },
          {
            title: '3. The Scissors Midline Cut',
            desc: 'Switch to Mode 2 and trigger the Midline Cut. Drag the Unfold Slider. Unlike a cylinder which cuts into 2 loops, a Möbius strip cuts into ONE single double-length ribbon with 4 half-twists!',
          },
          {
            title: '4. The 1/3 Offset Cut Paradox',
            desc: 'Try the 1/3 Offset Cut. The cut produces two physically interlinked loops: one thin Möbius loop linked through a longer 2-sided ribbon like chain links.',
          },
        ]}
      />
    </div>
  );
}
