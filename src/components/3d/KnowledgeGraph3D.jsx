'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import styles from './KnowledgeGraph3D.module.css';
import Icon from '@/components/common/Icon';
import {
  DOMAIN_CLUSTERS,
  GRAPH_NODES,
  GRAPH_LINKS,
  getNodeById,
  getConnectedNodes,
  getNodesByDomain,
  searchGraphNodes,
} from '@/data/knowledgeGraphData';

// Canvas texture helper for crisp 3D sprite labels
function createLabelSprite(text, colorHex, isHighlighted = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 70;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 300, 70);

  // Background pill
  ctx.fillStyle = isHighlighted ? 'rgba(15, 23, 42, 0.95)' : 'rgba(10, 14, 23, 0.8)';
  ctx.strokeStyle = isHighlighted ? '#38bdf8' : colorHex;
  ctx.lineWidth = isHighlighted ? 3 : 1.5;

  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(8, 8, 284, 54, 8);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillRect(8, 8, 284, 54);
    ctx.strokeRect(8, 8, 284, 54);
  }

  // Label text
  ctx.font = 'bold 18px Inter, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(text, 150, 35);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(7.5, 1.8, 1);
  return sprite;
}

export default function KnowledgeGraph3D({ initialNodeSlug = null }) {
  const mountRef = useRef(null);

  // Interaction & UI state
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [activeDomain, setActiveDomain] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isTopDownView, setIsTopDownView] = useState(false);
  const [showHalos, setShowHalos] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Three.js object references across renders
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    nodeMeshes: new Map(),
    nodeSprites: new Map(),
    edgeLines: [],
    domainHalos: [],
    pulseRing: null,
    energyParticles: [],
    targetCamPos: null,
    targetLookAt: null,
    isTransitioning: false,
    animId: null,
  });

  // Selected node connections
  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    return getConnectedNodes(selectedNode.id);
  }, [selectedNode]);

  // Handle Search Input
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 1) {
      setSearchResults(searchGraphNodes(val));
    } else {
      setSearchResults([]);
    }
  };

  // Focus and frame target node in 3D
  const focusNodeIn3D = useCallback((node) => {
    setSelectedNode(node);
    setSearchQuery('');
    setSearchResults([]);

    const three = threeRef.current;
    if (!three.camera || !three.controls) return;

    const [nx, ny, nz] = node.coords;
    three.targetLookAt = new THREE.Vector3(nx, ny, nz);
    three.targetCamPos = new THREE.Vector3(nx + 14, ny + 8, nz + 16);
    three.isTransitioning = true;
  }, []);

  // Reset Camera View
  const resetCameraView = useCallback(() => {
    const three = threeRef.current;
    if (!three.camera || !three.controls) return;

    setSelectedNode(null);
    setActiveDomain('all');
    setIsTopDownView(false);

    three.targetLookAt = new THREE.Vector3(0, 4, 0);
    three.targetCamPos = new THREE.Vector3(35, 28, 48);
    three.isTransitioning = true;
  }, []);

  // Toggle 2D / 3D View
  const toggleTopDownView = useCallback(() => {
    const three = threeRef.current;
    if (!three.camera || !three.controls) return;

    setIsTopDownView((prev) => {
      const next = !prev;
      if (next) {
        three.targetLookAt = new THREE.Vector3(0, 0, 0);
        three.targetCamPos = new THREE.Vector3(0, 75, 0.1);
      } else {
        three.targetLookAt = new THREE.Vector3(0, 4, 0);
        three.targetCamPos = new THREE.Vector3(35, 28, 48);
      }
      three.isTransitioning = true;
      return next;
    });
  }, []);

  // Handle initial node focus on mount
  useEffect(() => {
    if (initialNodeSlug) {
      const node = getNodeById(initialNodeSlug);
      if (node) {
        focusNodeIn3D(node);
      }
    }
  }, [initialNodeSlug, focusNodeIn3D]);

  // Filter by Domain
  const handleDomainFilter = useCallback((domainId) => {
    setActiveDomain(domainId);
    setSelectedNode(null);

    const three = threeRef.current;
    if (!three.camera || !three.controls) return;

    if (domainId === 'all') {
      three.targetLookAt = new THREE.Vector3(0, 4, 0);
      three.targetCamPos = new THREE.Vector3(35, 28, 48);
      three.isTransitioning = true;
    } else {
      const cluster = DOMAIN_CLUSTERS[domainId];
      if (cluster) {
        const [cx, cy, cz] = cluster.center;
        three.targetLookAt = new THREE.Vector3(cx, cy, cz);
        three.targetCamPos = new THREE.Vector3(cx + 18, cy + 12, cz + 20);
        three.isTransitioning = true;
      }
    }
  }, []);

  // ── Three.js Scene Setup ──
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06080d, 0.008);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(35, 28, 48);

    // 2. WebGL Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch {
      // Fallback for test environments without full WebGL context
      return;
    }

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 140;
    controls.minDistance = 6;
    controls.target.set(0, 4, 0);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight1.position.set(20, 40, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 1.2);
    dirLight2.position.set(-20, -20, -20);
    scene.add(dirLight2);

    // 5. Starfield & Cosmic Dust
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 220;
      starPositions[i + 1] = (Math.random() - 0.5) * 160;
      starPositions[i + 2] = (Math.random() - 0.5) * 220;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.6,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 6. Coordinate Grid
    const grid = new THREE.GridHelper(100, 36, 0x1e293b, 0x0f172a);
    grid.position.y = -22;
    grid.material.transparent = true;
    grid.material.opacity = 0.4;
    scene.add(grid);

    // 7. Domain Cluster Halos & Anchors
    const domainHalos = [];
    Object.values(DOMAIN_CLUSTERS).forEach((cluster) => {
      const clusterGroup = new THREE.Group();
      clusterGroup.position.set(...cluster.center);

      // Rotating wireframe ring
      const ringGeo = new THREE.TorusGeometry(cluster.radius * 0.7, 0.1, 8, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(cluster.color),
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      });
      const haloMesh = new THREE.Mesh(ringGeo, ringMat);
      haloMesh.rotation.x = Math.PI / 2;
      clusterGroup.add(haloMesh);

      // Domain billboard tag
      const domainSprite = createLabelSprite(cluster.name, cluster.color, false);
      domainSprite.position.set(0, cluster.radius * 0.75, 0);
      domainSprite.scale.set(9, 2.1, 1);
      clusterGroup.add(domainSprite);

      scene.add(clusterGroup);
      domainHalos.push({ group: clusterGroup, mesh: haloMesh, id: cluster.id });
    });

    // 8. Nodes Creation
    const nodeMeshes = new Map();
    const nodeSprites = new Map();
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const glowGeo = new THREE.SphereGeometry(1.4, 16, 16);

    GRAPH_NODES.forEach((node) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(...node.coords);

      const domain = DOMAIN_CLUSTERS[node.domain] || { color: '#38BDF8' };
      const baseRadius = node.importance * 0.95;

      // Inner Core Mesh
      const coreMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(domain.color),
        emissive: new THREE.Color(domain.color),
        emissiveIntensity: 0.45,
        roughness: 0.2,
        metalness: 0.3,
      });
      const coreMesh = new THREE.Mesh(sphereGeo, coreMat);
      coreMesh.scale.setScalar(baseRadius);
      coreMesh.userData = { node };
      nodeGroup.add(coreMesh);

      // Outer Glow Shell
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(domain.color),
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.scale.setScalar(baseRadius);
      nodeGroup.add(glowMesh);

      // Floating Title Sprite
      const labelSprite = createLabelSprite(node.title, domain.color, false);
      labelSprite.position.set(0, baseRadius + 1.4, 0);
      nodeGroup.add(labelSprite);

      scene.add(nodeGroup);
      nodeMeshes.set(node.id, { group: nodeGroup, core: coreMesh, glow: glowMesh, node });
      nodeSprites.set(node.id, labelSprite);
    });

    // 9. Active Node Selection Pulse Ring
    const pulseRingGeo = new THREE.RingGeometry(1.6, 2.0, 32);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRing.visible = false;
    scene.add(pulseRing);

    // 10. Links / Semantic Edges
    const edgeLines = [];
    const energyParticles = [];

    GRAPH_LINKS.forEach((link, idx) => {
      const srcNode = getNodeById(link.source);
      const tgtNode = getNodeById(link.target);
      if (!srcNode || !tgtNode) return;

      const p1 = new THREE.Vector3(...srcNode.coords);
      const p2 = new THREE.Vector3(...tgtNode.coords);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.25,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);

      // Energy photon traveling along edge
      const photonGeo = new THREE.SphereGeometry(0.22, 8, 8);
      const photonMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.85,
      });
      const photon = new THREE.Mesh(photonGeo, photonMat);
      photon.visible = false;
      scene.add(photon);

      edgeLines.push({
        line,
        mat: lineMat,
        link,
        source: link.source,
        target: link.target,
        weight: link.weight,
        p1,
        p2,
      });

      energyParticles.push({
        mesh: photon,
        p1,
        p2,
        t: (idx * 0.15) % 1,
        speed: 0.006 + (link.weight * 0.005),
        active: false,
      });
    });

    // Save references to ref object
    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      nodeMeshes,
      nodeSprites,
      edgeLines,
      domainHalos,
      pulseRing,
      energyParticles,
      targetCamPos: null,
      targetLookAt: null,
      isTransitioning: false,
      animId: null,
    };

    // 11. Raycaster for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes = Array.from(nodeMeshes.values()).map((item) => item.core);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hitNode = intersects[0].object.userData.node;
        setHoveredNode(hitNode);
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        container.style.cursor = 'pointer';
      } else {
        setHoveredNode(null);
        container.style.cursor = 'grab';
      }
    };

    const handlePointerDown = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes = Array.from(nodeMeshes.values()).map((item) => item.core);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hitNode = intersects[0].object.userData.node;
        focusNodeIn3D(hitNode);
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);

    // 12. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 13. Animation Loop
    let lastTime = performance.now();
    const animate = (currentTime) => {
      const time = currentTime ? currentTime * 0.001 : performance.now() * 0.001;
      const delta = (currentTime ? currentTime - lastTime : 16.6) * 0.001;
      lastTime = currentTime || performance.now();

      // Camera interpolation tweening
      const three = threeRef.current;
      if (three.isTransitioning && three.targetCamPos && three.targetLookAt) {
        camera.position.lerp(three.targetCamPos, 0.08);
        controls.target.lerp(three.targetLookAt, 0.08);

        if (camera.position.distanceTo(three.targetCamPos) < 0.1 &&
            controls.target.distanceTo(three.targetLookAt) < 0.1) {
          three.isTransitioning = false;
        }
      }

      controls.update();

      // Rotate domain halos slowly
      domainHalos.forEach(({ mesh }) => {
        mesh.rotation.z += 0.003;
      });

      // Animate energy pulses along edges
      energyParticles.forEach((ep) => {
        if (ep.active) {
          ep.t = (ep.t + ep.speed) % 1;
          ep.mesh.position.lerpVectors(ep.p1, ep.p2, ep.t);
          ep.mesh.visible = true;
        } else {
          ep.mesh.visible = false;
        }
      });

      // Animate selected pulse ring
      if (pulseRing.visible) {
        pulseRing.lookAt(camera.position);
        const pulseScale = 1 + 0.15 * Math.sin(time * 4);
        pulseRing.scale.set(pulseScale, pulseScale, 1);
      }

      renderer.render(scene, camera);
      three.animId = requestAnimationFrame(animate);
    };

    animate();

    // 14. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);

      if (threeRef.current.animId) {
        cancelAnimationFrame(threeRef.current.animId);
      }

      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [focusNodeIn3D]);

  // ── Sync Visual States with UI Filters & Selection ──
  useEffect(() => {
    const three = threeRef.current;
    if (!three.nodeMeshes || !three.edgeLines) return;

    const activeNodeId = selectedNode?.id || hoveredNode?.id;

    // 1. Update Nodes & Labels Opacity
    three.nodeMeshes.forEach(({ group, core, glow, node }, id) => {
      const isSelected = selectedNode?.id === id;
      const isHovered = hoveredNode?.id === id;
      const isDomainMatch = activeDomain === 'all' || node.domain === activeDomain;

      let isConnected = false;
      if (activeNodeId) {
        const conns = getConnectedNodes(activeNodeId);
        isConnected = conns.some((c) => c.node.id === id);
      }

      const isDirectlyRelevant = !activeNodeId ? isDomainMatch : (id === activeNodeId || isConnected);

      // Core mesh emissive intensity
      if (isSelected || isHovered) {
        core.material.emissiveIntensity = 0.9;
        glow.material.opacity = 0.5;
        group.scale.setScalar(1.2);
      } else if (isDirectlyRelevant) {
        core.material.emissiveIntensity = 0.45;
        glow.material.opacity = 0.18;
        group.scale.setScalar(1.0);
      } else {
        core.material.emissiveIntensity = 0.08;
        glow.material.opacity = 0.04;
        group.scale.setScalar(0.85);
      }

      // Sprite Label Visibility
      const sprite = three.nodeSprites.get(id);
      if (sprite) {
        sprite.visible = showLabels && (isDirectlyRelevant || isSelected || isHovered);
      }
    });

    // 2. Pulse Ring on Selected Node
    if (selectedNode && three.pulseRing) {
      const [nx, ny, nz] = selectedNode.coords;
      three.pulseRing.position.set(nx, ny, nz);
      three.pulseRing.visible = true;
    } else if (three.pulseRing) {
      three.pulseRing.visible = false;
    }

    // 3. Update Edges Opacity and Flowing Photons
    three.edgeLines.forEach(({ line, mat, source, target, weight }, idx) => {
      const isEdgeActive = activeNodeId && (source === activeNodeId || target === activeNodeId);
      const isDomainActive = activeDomain === 'all' ||
        (getNodeById(source)?.domain === activeDomain && getNodeById(target)?.domain === activeDomain);

      const ep = three.energyParticles[idx];

      if (isEdgeActive) {
        mat.color.setHex(0x38bdf8);
        mat.opacity = 0.9;
        if (ep) ep.active = true;
      } else if (!activeNodeId && isDomainActive) {
        mat.color.setHex(0x64748b);
        mat.opacity = 0.25;
        if (ep) ep.active = false;
      } else {
        mat.color.setHex(0x334155);
        mat.opacity = 0.05;
        if (ep) ep.active = false;
      }
    });

    // 4. Domain Halos Visibility
    if (three.domainHalos) {
      three.domainHalos.forEach(({ group, id }) => {
        group.visible = showHalos && (activeDomain === 'all' || activeDomain === id);
      });
    }

    // 5. Controls Auto-Rotate
    if (three.controls) {
      three.controls.autoRotate = autoRotate;
    }
  }, [selectedNode, hoveredNode, activeDomain, showHalos, showLabels, autoRotate]);

  return (
    <div className={styles.graphContainer} data-testid="knowledge-graph-3d">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className={styles.canvasWrapper} />

      {/* Top HUD: Search & Domain Filters */}
      <div className={styles.topHud}>
        <div className={styles.hudRow}>
          {/* Connected Papers Style Concept Search Bar */}
          <div className={styles.searchBoxContainer}>
            <div className={styles.searchInputWrapper}>
              <Icon name="search" size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search ideas, paradoxes, or domains..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown */}
            {searchResults.length > 0 && (
              <ul className={styles.searchDropdown}>
                {searchResults.map((node) => {
                  const domain = DOMAIN_CLUSTERS[node.domain] || { color: '#38bdf8' };
                  return (
                    <li
                      key={node.id}
                      className={styles.searchItem}
                      onClick={() => focusNodeIn3D(node)}
                    >
                      <span className={styles.searchItemTitle}>{node.title}</span>
                      <span
                        className={styles.searchItemDomain}
                        style={{
                          backgroundColor: `${domain.color}22`,
                          color: domain.color,
                          border: `1px solid ${domain.color}44`,
                        }}
                      >
                        {node.domain}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Domain Filter Pills */}
          <div className={styles.domainFilters}>
            <button
              className={`${styles.domainChip} ${activeDomain === 'all' ? styles.domainChipActive : ''}`}
              onClick={() => handleDomainFilter('all')}
            >
              All Domains
            </button>
            {Object.values(DOMAIN_CLUSTERS).map((cluster) => {
              const isActive = activeDomain === cluster.id;
              return (
                <button
                  key={cluster.id}
                  className={`${styles.domainChip} ${isActive ? styles.domainChipActive : ''}`}
                  onClick={() => handleDomainFilter(cluster.id)}
                >
                  <span className={styles.domainDot} style={{ backgroundColor: cluster.color }} />
                  {cluster.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Quick Actions Dock */}
      <div className={styles.quickActionsDock}>
        <button
          className={styles.actionBtn}
          onClick={resetCameraView}
          title="Reset Camera Orientation"
        >
          <Icon name="refresh" size={14} />
          <span>Reset</span>
        </button>

        <div className={styles.actionDivider} />

        <button
          className={`${styles.actionBtn} ${isTopDownView ? styles.actionBtnActive : ''}`}
          onClick={toggleTopDownView}
          title="Toggle 2D Top-Down / 3D Perspective"
        >
          <Icon name="layers" size={14} />
          <span>{isTopDownView ? '3D Orbit' : '2D Top-Down'}</span>
        </button>

        <button
          className={`${styles.actionBtn} ${autoRotate ? styles.actionBtnActive : ''}`}
          onClick={() => setAutoRotate(!autoRotate)}
          title="Toggle Ambient Auto-Rotation"
        >
          <Icon name="rotate-ccw" size={14} />
          <span>Spin</span>
        </button>

        <div className={styles.actionDivider} />

        <button
          className={`${styles.actionBtn} ${showHalos ? styles.actionBtnActive : ''}`}
          onClick={() => setShowHalos(!showHalos)}
          title="Toggle Domain Nebulas"
        >
          <Icon name="atom" size={14} />
          <span>Auras</span>
        </button>

        <button
          className={`${styles.actionBtn} ${showLabels ? styles.actionBtnActive : ''}`}
          onClick={() => setShowLabels(!showLabels)}
          title="Toggle Node Text Labels"
        >
          <Icon name={showLabels ? 'eye' : 'eye-off'} size={14} />
          <span>Labels</span>
        </button>
      </div>

      {/* Bottom Right Interaction Hint */}
      <div className={styles.hintBadge}>
        <span>Drag to orbit · Scroll to zoom · Click node to inspect</span>
      </div>

      {/* Hover Tooltip in 3D Space */}
      {hoveredNode && !selectedNode && (
        <div
          className={styles.nodeHoverTooltip}
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <span className={styles.tooltipTitle}>{hoveredNode.title}</span>
          <span className={styles.tooltipSubtitle}>{hoveredNode.domainName} · Click to inspect</span>
        </div>
      )}

      {/* Connected Papers Style Detailed Inspection Drawer */}
      {selectedNode && (
        <div className={styles.inspectorDrawer} data-testid="inspector-drawer">
          <div className={styles.inspectorHeader}>
            <div className={styles.headerBadges}>
              {(() => {
                const domain = DOMAIN_CLUSTERS[selectedNode.domain] || { color: '#38bdf8' };
                return (
                  <span
                    className={styles.domainBadge}
                    style={{
                      backgroundColor: `${domain.color}22`,
                      color: domain.color,
                      border: `1px solid ${domain.color}44`,
                    }}
                  >
                    <Icon name={domain.icon || 'atom'} size={13} color={domain.color} />
                    {selectedNode.domainName}
                  </span>
                );
              })()}
              <span className={styles.difficultyBadge}>{selectedNode.difficulty}</span>
              <span className={styles.difficultyBadge}>{selectedNode.year}</span>
            </div>

            <button
              className={styles.closeBtn}
              onClick={() => setSelectedNode(null)}
              aria-label="Close Inspector"
            >
              <Icon name="close" size={16} />
            </button>
          </div>

          <div className={styles.inspectorBody}>
            <h2 className={styles.conceptTitle}>{selectedNode.title}</h2>

            {/* Spatial & Epistemic Telemetry Grid */}
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>3D Vector</span>
                <span className={styles.metaValue}>
                  [{selectedNode.coords.join(', ')}]
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Impact Score</span>
                <span className={styles.metaValue}>{selectedNode.citationsScore}/100</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Reading Time</span>
                <span className={styles.metaValue}>{selectedNode.readTime} min</span>
              </div>
            </div>

            {/* Direct Interactive 3D Lab or Concept Deep Dive CTA Button */}
            <div className={styles.labCtaContainer}>
              {selectedNode.hasInteractiveLab ? (
                <Link
                  href={selectedNode.interactivePath}
                  className={styles.labCtaBtn}
                >
                  <Icon name="zap" size={18} color="#0B0F19" />
                  <span>Launch 3D Interactive Lab</span>
                </Link>
              ) : (
                <Link
                  href={`/concepts/${selectedNode.slug}`}
                  className={styles.articleCtaBtn}
                >
                  <Icon name="layers" size={16} color="#38BDF8" />
                  <span>Read Concept Deep Dive</span>
                </Link>
              )}
            </div>

            {/* Core Abstract & Conundrum */}
            <div className={styles.abstractBox}>
              <h3 className={styles.sectionHeading}>Abstract & Epistemic Core</h3>
              <p className={styles.abstractText}>{selectedNode.summary}</p>
            </div>

            {/* Paradox Anatomy */}
            <div className={styles.paradoxBox}>
              <h3 className={styles.paradoxHeading}>The Paradox Conundrum</h3>
              <p className={styles.paradoxText}>{selectedNode.paradoxCore}</p>
            </div>

            {/* Cross-Domain Intellectual Bridge */}
            <div className={styles.bridgeBox}>
              <h3 className={styles.bridgeHeading}>Cross-Domain Bridge</h3>
              <p className={styles.bridgeText}>{selectedNode.crossDomainBridge}</p>
            </div>

            {/* Connected Ideas (Connected Papers Signature Section) */}
            <div className={styles.connectionsSection}>
              <div className={styles.connectionsTitleRow}>
                <h3 className={styles.sectionHeading}>Direct Intellectual Kinship</h3>
                <span className={styles.connectionsCount}>{connectedNodes.length} Linked Ideas</span>
              </div>

              <div className={styles.connectionsList}>
                {connectedNodes.map(({ node: connNode, weight, rationale }) => {
                  return (
                    <div
                      key={connNode.id}
                      className={styles.connectionCard}
                      onClick={() => focusNodeIn3D(connNode)}
                    >
                      <div className={styles.connectionCardHeader}>
                        <span className={styles.connNodeTitle}>{connNode.title}</span>
                        <span className={styles.similarityPill}>
                          {Math.round(weight * 100)}% Similarity
                        </span>
                      </div>
                      <p className={styles.connRationale}>{rationale}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
