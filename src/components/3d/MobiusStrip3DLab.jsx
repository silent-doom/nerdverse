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

  const chitinDarkMat = new THREE.MeshStandardMaterial({
    color: 0x140e0b,
    roughness: 0.35,
    metalness: 0.04,
  });

  const chitinAmberMat = new THREE.MeshStandardMaterial({
    color: 0x2e170e,
    roughness: 0.4,
    metalness: 0.02,
  });

  const eyeGlossMat = new THREE.MeshStandardMaterial({
    color: 0x060606,
    roughness: 0.08,
    metalness: 0.1,
  });

  const bodyGroup = new THREE.Group();
  antRoot.add(bodyGroup);

  // 1. Head (Caput)
  const headGroup = new THREE.Group();
  headGroup.position.set(0.32, 0.12, 0);

  const craniumGeo = new THREE.SphereGeometry(0.12, 16, 16);
  craniumGeo.scale(1.25, 0.85, 0.95);
  const cranium = new THREE.Mesh(craniumGeo, chitinDarkMat);
  headGroup.add(cranium);

  const clypeusGeo = new THREE.ConeGeometry(0.06, 0.08, 8);
  clypeusGeo.rotateZ(-Math.PI / 2);
  const clypeus = new THREE.Mesh(clypeusGeo, chitinDarkMat);
  clypeus.position.set(0.14, -0.02, 0);
  headGroup.add(clypeus);

  // Compound Eyes
  [-1, 1].forEach((side) => {
    const eyeGeo = new THREE.SphereGeometry(0.038, 12, 12);
    eyeGeo.scale(1.1, 1.25, 0.7);
    const eye = new THREE.Mesh(eyeGeo, eyeGlossMat);
    eye.position.set(0.04, 0.04, side * 0.09);
    eye.rotation.y = side * 0.35;
    headGroup.add(eye);
  });

  // Mandibles
  const mandibleGeo = new THREE.ConeGeometry(0.022, 0.11, 8);
  [-1, 1].forEach((side) => {
    const mandible = new THREE.Mesh(mandibleGeo, chitinDarkMat);
    mandible.position.set(0.16, -0.04, side * 0.035);
    mandible.rotation.set(side * 0.25, side * 0.35, -Math.PI / 2 + 0.35);
    headGroup.add(mandible);
  });

  // Geniculate Antennae
  const antennaL = new THREE.Group();
  const antennaR = new THREE.Group();

  [{ grp: antennaL, side: 1 }, { grp: antennaR, side: -1 }].forEach(({ grp, side }) => {
    grp.position.set(0.08, 0.06, side * 0.038);

    const scapeGeo = new THREE.CylinderGeometry(0.006, 0.005, 0.19, 6);
    const scape = new THREE.Mesh(scapeGeo, chitinAmberMat);
    scape.position.set(0.07, 0.06, side * 0.025);
    scape.rotation.set(side * 0.3, -0.2, -0.75);
    grp.add(scape);

    const funiculusGeo = new THREE.CylinderGeometry(0.005, 0.003, 0.22, 6);
    const funiculus = new THREE.Mesh(funiculusGeo, chitinAmberMat);
    funiculus.position.set(0.19, 0.11, side * 0.065);
    funiculus.rotation.set(side * 0.15, -0.4, 0.45);
    grp.add(funiculus);

    headGroup.add(grp);
  });

  bodyGroup.add(headGroup);

  // 2. Thorax (Mesosoma)
  const thoraxGroup = new THREE.Group();

  const pronotum = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 14), chitinDarkMat);
  pronotum.scale.set(1.0, 0.88, 0.82);
  pronotum.position.set(0.15, 0.11, 0);

  const mesonotum = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), chitinDarkMat);
  mesonotum.scale.set(1.2, 0.95, 0.78);
  mesonotum.position.set(0.03, 0.12, 0);

  const propodeum = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 14), chitinDarkMat);
  propodeum.scale.set(1.0, 0.88, 0.78);
  propodeum.position.set(-0.09, 0.1, 0);

  thoraxGroup.add(pronotum, mesonotum, propodeum);
  bodyGroup.add(thoraxGroup);

  // 3. Petiole
  const petioleGroup = new THREE.Group();
  petioleGroup.position.set(-0.17, 0.09, 0);

  const pedicelStem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 8), chitinDarkMat);
  pedicelStem.rotation.z = Math.PI / 2;
  const petioleScale = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 6), chitinDarkMat);
  petioleScale.position.set(0, 0.04, 0);
  petioleGroup.add(pedicelStem, petioleScale);
  bodyGroup.add(petioleGroup);

  // 4. Gaster (Segmented Abdomen)
  const gasterGroup = new THREE.Group();
  gasterGroup.position.set(-0.21, 0.09, 0);

  const gastI = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), chitinDarkMat);
  gastI.scale.set(1.0, 0.9, 0.85);
  gastI.position.set(-0.06, 0.01, 0);

  const gastII = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), chitinDarkMat);
  gastII.scale.set(1.25, 0.95, 0.9);
  gastII.position.set(-0.17, 0.01, 0);

  const gastIII = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.2, 14), chitinDarkMat);
  gastIII.rotation.z = Math.PI / 2 + 0.18;
  gastIII.position.set(-0.32, -0.02, 0);

  gasterGroup.add(gastI, gastII, gastIII);
  bodyGroup.add(gasterGroup);

  // 5. Hexapod Articulated Limbs
  const legConfigs = [
    { id: 'L1', origin: [0.15, 0.06, 0.07], side: 1, baseAngleY: 0.45, femurLen: 0.24, tibiaLen: 0.28, basePitch: 0.7 },
    { id: 'R1', origin: [0.15, 0.06, -0.07], side: -1, baseAngleY: -0.45, femurLen: 0.24, tibiaLen: 0.28, basePitch: 0.7 },
    { id: 'L2', origin: [0.03, 0.06, 0.08], side: 1, baseAngleY: 0.0, femurLen: 0.26, tibiaLen: 0.30, basePitch: 0.8 },
    { id: 'R2', origin: [0.03, 0.06, -0.08], side: -1, baseAngleY: 0.0, femurLen: 0.26, tibiaLen: 0.30, basePitch: 0.8 },
    { id: 'L3', origin: [-0.07, 0.06, 0.07], side: 1, baseAngleY: -0.55, femurLen: 0.28, tibiaLen: 0.34, basePitch: 0.9 },
    { id: 'R3', origin: [-0.07, 0.06, -0.07], side: -1, baseAngleY: 0.55, femurLen: 0.28, tibiaLen: 0.34, basePitch: 0.9 },
  ];

  const legRigs = [];

  legConfigs.forEach((cfg) => {
    const coxaGroup = new THREE.Group();
    coxaGroup.position.set(...cfg.origin);
    coxaGroup.rotation.y = cfg.baseAngleY;

    const coxaMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.06, 6), chitinAmberMat);
    coxaMesh.rotation.x = cfg.side * 0.5;
    coxaGroup.add(coxaMesh);

    const femurGroup = new THREE.Group();
    femurGroup.position.set(0, 0.02, cfg.side * 0.03);

    const femurGeo = new THREE.CylinderGeometry(0.013, 0.009, cfg.femurLen, 6);
    const femurMesh = new THREE.Mesh(femurGeo, chitinDarkMat);
    femurMesh.position.set(0, cfg.femurLen * 0.45, cfg.side * cfg.femurLen * 0.4);
    femurMesh.rotation.set(cfg.side * cfg.basePitch, 0, 0);
    femurGroup.add(femurMesh);

    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), chitinAmberMat);
    knee.position.set(0, cfg.femurLen * 0.85, cfg.side * cfg.femurLen * 0.75);
    femurGroup.add(knee);

    const tibiaGroup = new THREE.Group();
    tibiaGroup.position.copy(knee.position);

    const tibiaGeo = new THREE.CylinderGeometry(0.009, 0.005, cfg.tibiaLen, 6);
    const tibiaMesh = new THREE.Mesh(tibiaGeo, chitinDarkMat);
    tibiaMesh.position.set(0, -cfg.tibiaLen * 0.45, cfg.side * cfg.tibiaLen * 0.35);
    tibiaMesh.rotation.set(cfg.side * -0.65, 0, 0);
    tibiaGroup.add(tibiaMesh);

    const tarsusMesh = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.05, 6), chitinAmberMat);
    tarsusMesh.position.set(0, -cfg.tibiaLen * 0.9, cfg.side * cfg.tibiaLen * 0.65);
    tarsusMesh.rotation.set(cfg.side * -0.2, 0, 0);
    tibiaGroup.add(tarsusMesh);

    femurGroup.add(tibiaGroup);
    coxaGroup.add(femurGroup);
    bodyGroup.add(coxaGroup);

    legRigs.push({
      id: cfg.id,
      side: cfg.side,
      coxaGroup,
      femurGroup,
      tibiaGroup,
      baseAngleY: cfg.baseAngleY,
      basePitch: cfg.basePitch,
    });
  });

  // Normal Vector Arrow
  const arrowDir = new THREE.Vector3(0, 1, 0);
  const arrowOrigin = new THREE.Vector3(0, 0.28, 0);
  const normalArrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 0.75, 0x38bdf8, 0.16, 0.08);
  normalArrow.name = 'normalArrow';
  antRoot.add(normalArrow);

  antRoot.scale.set(0.9, 0.9, 0.9);
  antRoot.userData = {
    bodyGroup,
    headGroup,
    gasterGroup,
    antennaL,
    antennaR,
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
  const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12), pivotMat);
  pivot.rotation.x = Math.PI / 2;
  group.add(pivot);

  // Blade 1
  const blade1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.8, 4), steelMat);
  blade1.scale.set(0.2, 1, 1);
  blade1.position.set(0.38, 0.05, 0.02);
  blade1.rotation.z = -Math.PI / 2 + 0.15;
  group.add(blade1);

  // Blade 2
  const blade2 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.8, 4), steelMat);
  blade2.scale.set(0.2, 1, 1);
  blade2.position.set(0.38, -0.05, -0.02);
  blade2.rotation.z = -Math.PI / 2 - 0.15;
  group.add(blade2);

  // Handle 1 (loop)
  const loopGeo1 = new THREE.TorusGeometry(0.16, 0.04, 8, 24);
  const handle1 = new THREE.Mesh(loopGeo1, handleMat);
  handle1.position.set(-0.35, 0.14, 0);
  group.add(handle1);

  // Handle 2 (loop)
  const loopGeo2 = new THREE.TorusGeometry(0.16, 0.04, 8, 24);
  const handle2 = new THREE.Mesh(loopGeo2, handleMat);
  handle2.position.set(-0.35, -0.14, 0);
  group.add(handle2);

  group.scale.set(0.75, 0.75, 0.75);
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

    // Mode 2: Scissors Paradox Meshes with Physical Paper Thickness
    if (activeMode === 'scissors') {
      const group = new THREE.Group();
      const cutAngleLimit = Math.max(0.1, cutProgress * 2 * Math.PI);

      if (cutType === 'midline') {
        const gap = 0.03 + separationProgress * 0.35;
        const unfoldStretch = separationProgress * 1.5;

        // Sub-strip 1: Left Paper Half
        const geoLeft = buildPhysicalPaperStripGeometry(
          R, w, d, k, paperSag,
          -w / 2, -gap, cutAngleLimit, unfoldStretch
        );
        const matLeft = new THREE.MeshPhysicalMaterial({
          color: 0x3b82f6,
          roughness: 0.5,
          metalness: 0.05,
          clearcoat: 0.1,
          wireframe: isWireframe,
        });
        const meshLeft = new THREE.Mesh(geoLeft, matLeft);
        meshLeft.castShadow = true;

        // Sub-strip 2: Right Paper Half
        const geoRight = buildPhysicalPaperStripGeometry(
          R, w, d, k, paperSag,
          gap, w / 2, cutAngleLimit, -unfoldStretch
        );
        const matRight = new THREE.MeshPhysicalMaterial({
          color: 0xf59e0b,
          roughness: 0.5,
          metalness: 0.05,
          clearcoat: 0.1,
          wireframe: isWireframe,
        });
        const meshRight = new THREE.Mesh(geoRight, matRight);
        meshRight.castShadow = true;

        group.add(meshLeft, meshRight);
      } else {
        const gap = 0.04 + separationProgress * 0.4;
        const interlinkOffset = separationProgress * 0.85;

        // Thin loop
        const geoThin = buildPhysicalPaperStripGeometry(
          R, w, d, k, paperSag,
          -w / 2, -w / 6, cutAngleLimit, interlinkOffset
        );
        const matThin = new THREE.MeshPhysicalMaterial({
          color: 0xeab308,
          roughness: 0.45,
          metalness: 0.08,
          clearcoat: 0.1,
          wireframe: isWireframe,
        });
        const meshThin = new THREE.Mesh(geoThin, matThin);
        meshThin.castShadow = true;

        // Thick double loop
        const geoThick = buildPhysicalPaperStripGeometry(
          R, w, d, k, paperSag,
          -w / 6 + gap, w / 2, cutAngleLimit, -interlinkOffset
        );
        const matThick = new THREE.MeshPhysicalMaterial({
          color: 0x10b981,
          roughness: 0.45,
          metalness: 0.08,
          clearcoat: 0.1,
          wireframe: isWireframe,
        });
        const meshThick = new THREE.Mesh(geoThick, matThick);
        meshThick.castShadow = true;

        group.add(meshThin, meshThick);
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
        const antPos = c.clone().addScaledVector(n, d / 2 + 0.02);
        antMeshRef.current.position.copy(antPos);

        // Orientation Frame: X=g (ruling), Y=n (normal), Z=tu (tangent forward)
        const rotMatrix = new THREE.Matrix4();
        rotMatrix.makeBasis(g, n, tu);
        antMeshRef.current.setRotationFromMatrix(rotMatrix);

        // True Biomechanical Tripod Gait Kinematics
        const { bodyGroup, gasterGroup, antennaL, antennaR, legRigs } = antMeshRef.current.userData || {};

        if (legRigs && legRigs.length === 6) {
          const gaitPhase = u * 24; // Realistic scurrying step frequency

          // Tripod A: L1 (index 0), R2 (index 3), L3 (index 4)
          // Tripod B: R1 (index 1), L2 (index 2), R3 (index 5)
          const tripods = [
            { indices: [0, 3, 4], phase: gaitPhase },
            { indices: [1, 2, 5], phase: gaitPhase + Math.PI },
          ];

          tripods.forEach(({ indices, phase }) => {
            const swingCycle = Math.sin(phase);
            const stanceCycle = Math.cos(phase);
            const isSwing = swingCycle >= 0;

            indices.forEach((idx) => {
              const rig = legRigs[idx];
              if (!rig) return;

              // 1. Coxa Protraction / Retraction (horizontal stepping sweep)
              rig.coxaGroup.rotation.y = rig.baseAngleY + (stanceCycle * 0.22);

              // 2. Femur Elevation & Knee Flexion
              if (isSwing) {
                // Lift leg off paper during swing
                const lift = swingCycle * 0.35;
                rig.femurGroup.rotation.z = -lift * 0.5;
                rig.femurGroup.rotation.x = rig.side * (rig.basePitch - lift * 0.6);
                rig.tibiaGroup.rotation.x = rig.side * (-0.65 + lift * 0.4);
              } else {
                // Planted firmly on paper during stance
                rig.femurGroup.rotation.z = 0;
                rig.femurGroup.rotation.x = rig.side * rig.basePitch;
                rig.tibiaGroup.rotation.x = rig.side * -0.65;
              }
            });
          });

          // Organic Body Motion (Wobble & Heave)
          if (bodyGroup) {
            bodyGroup.rotation.y = Math.sin(gaitPhase) * 0.04;
            bodyGroup.position.y = Math.abs(Math.sin(gaitPhase)) * 0.012;
            bodyGroup.rotation.z = Math.sin(gaitPhase) * 0.025;
          }

          // Antennae active sensory palpation
          if (antennaL && antennaR) {
            const timeSec = performance.now() / 1000;
            antennaL.rotation.y = Math.sin(timeSec * 7) * 0.16 + 0.1;
            antennaL.rotation.z = Math.cos(timeSec * 8) * 0.12;
            antennaR.rotation.y = -Math.cos(timeSec * 7.5) * 0.16 - 0.1;
            antennaR.rotation.z = Math.sin(timeSec * 8.5) * 0.12;
          }

          // Gaster inertia / breathing
          if (gasterGroup) {
            gasterGroup.rotation.x = Math.sin(gaitPhase - 0.6) * 0.04;
          }
        }

        const arrow = antMeshRef.current.getObjectByName('normalArrow');
        if (arrow) {
          arrow.visible = showNormalVector;
        }

        if (cameraFollowAnt && cameraRef.current && controlsRef.current) {
          const camOffset = n.clone().multiplyScalar(2.6).add(tu.clone().multiplyScalar(-3.2));
          cameraRef.current.position.copy(antMeshRef.current.position).add(camOffset);
          controlsRef.current.target.copy(antMeshRef.current.position);
          controlsRef.current.update();
        }
      }
    }

    // 2. Scissors Tool Placement in Mode 2
    if (scissorsMeshRef.current) {
      if (activeMode !== 'scissors') {
        scissorsMeshRef.current.visible = false;
      } else {
        scissorsMeshRef.current.visible = true;
        const u = cutProgress * 2 * Math.PI;

        const c = getCenterlinePoint(u, R, paperSag);
        const tu = getCenterlineTangent(u, R, paperSag);
        const g = getRulingVector(u, k, tu);
        const n = new THREE.Vector3().crossVectors(tu, g).normalize();

        const vOffset = cutType === 'midline' ? 0 : -ribbonWidth / 6;
        const scissorPos = c.clone()
          .addScaledVector(g, vOffset)
          .addScaledVector(n, d / 2 + 0.15);

        scissorsMeshRef.current.position.copy(scissorPos);

        const rotMatrix = new THREE.Matrix4();
        rotMatrix.makeBasis(g, n, tu);
        scissorsMeshRef.current.setRotationFromMatrix(rotMatrix);
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
  ]);

  // Setup Three.js WebGL Scene with Studio Lighting & Pedestal
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, -8.0, 6.2);
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

    // ── Studio Measurement Pedestal ──
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.y = -2.8;

    const turntableGeo = new THREE.CylinderGeometry(5.2, 5.4, 0.15, 64);
    const turntableMat = new THREE.MeshStandardMaterial({
      color: 0x0f1422,
      roughness: 0.6,
      metalness: 0.3,
    });
    const turntable = new THREE.Mesh(turntableGeo, turntableMat);
    turntable.receiveShadow = true;
    pedestalGroup.add(turntable);

    [1.5, 2.5, 3.5, 4.5].forEach((radius) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.015, radius + 0.015, 64);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x334155,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.08;
      pedestalGroup.add(ring);
    });

    const shadowGeo = new THREE.PlaneGeometry(10, 10);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.position.y = 0.085;
    shadowPlane.receiveShadow = true;
    pedestalGroup.add(shadowPlane);

    scene.add(pedestalGroup);

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

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeMode, isPlaying, playbackSpeed, autoRotate]);

  return (
    <div className={styles.labContainer} data-testid="mobius-strip-3d-lab">
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
        {/* Top Header Floating Overlay */}
        <div className={styles.topHeader}>
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
        </div>

        {/* Floating Telemetry Box */}
        <div className={styles.floatingTelemetry}>
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
                Notice the overlapping taped joint at the origin ($u = 0$) where Möbius joined the 180°-twisted paper band.
                After crawling one complete spatial circle ($2\pi R$), the ant returns to the exact seam, but its normal vector has rotated by exactly $180^\circ$—placing it upside down on what intuition calls the &ldquo;other side&rdquo;. It must crawl a second full circuit ($4\pi R$, $720^\circ$) to return right-side up! The red ink trail coats the entire paper ribbon without ever crossing an edge.
              </div>
            </div>
          </>
        )}

        {/* Mode 2: Scissors Paradox Controls */}
        {activeMode === 'scissors' && (
          <>
            <div className={styles.primaryControlRow}>
              <div className={styles.pillGroup}>
                <button
                  className={`${styles.pillBtn} ${cutType === 'midline' ? styles.pillBtnActive : ''}`}
                  onClick={() => {
                    setCutType('midline');
                    setCutProgress(1.0);
                    audioEngine.playSnip();
                  }}
                >
                  Midline Cut (Center 1/2)
                </button>
                <button
                  className={`${styles.pillBtn} ${cutType === 'offset' ? styles.pillBtnActive : ''}`}
                  onClick={() => {
                    setCutType('offset');
                    setCutProgress(1.0);
                    audioEngine.playSnip();
                  }}
                >
                  One-Third Offset Cut (1/3 Edge)
                </button>
              </div>

              <div className={styles.timelineScrubber}>
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineLabel}>Scissors Cut Completion</span>
                  <span className={styles.timelineValue}>{(cutProgress * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={cutProgress}
                  onChange={(e) => {
                    setCutProgress(parseFloat(e.target.value));
                    audioEngine.playSnip();
                  }}
                  className={styles.sliderTrack}
                />
              </div>

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
                {cutType === 'midline' ? (
                  <span>
                    Watch the red scissors blade slice through the physical paper ribbon. Unlike a cylinder which cuts into 2 loops, cutting down the centerline produces <strong>one single continuous loop</strong> of double length ($2L$), half width, with <strong>four half-twists ($720^\circ$)</strong>.
                  </span>
                ) : (
                  <span>
                    Cutting at a 1/3 offset produces <strong>two physically interlinked rings</strong>: one thin Möbius strip of length $L$ linked through a longer two-sided ribbon of length $2L$, forming a topological chain link!
                  </span>
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
                  <span className={styles.paramTitle}>Half-Twists ($k$)</span>
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
                  <span className={styles.paramTitle}>Major Radius ($R$)</span>
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
                  <span className={styles.paramTitle}>Ribbon Width ($w$)</span>
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
                <div className={styles.paradoxHeading}>Topological Invariants: &chi; = 0</div>
                For any half-twist integer $k$, the Euler characteristic is $\chi = V - E + F = 0$. When $k$ is odd (1,
                3), the manifold has strictly <strong>1 boundary component</strong> and <strong>1 side</strong>. When{' '}
                $k$ is even (0, 2, 4), the manifold is orientable with <strong>2 boundaries</strong> and{' '}
                <strong>2 sides</strong>.
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
