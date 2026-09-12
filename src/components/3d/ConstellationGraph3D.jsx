'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import { concepts } from '@/data/concepts';
import Icon from '@/components/common/Icon';
import styles from './ConstellationGraph3D.module.css';

/**
 * Dribbble-Grade 3D Interactive Synaptic Knowledge Constellation.
 * Features PBR crystalline geodes, 3D curved Bezier conduits with traveling photon pulses,
 * smooth camera damping, and futuristic sci-fi telemetry HUD.
 */
export default function ConstellationGraph3D() {
  const mountRef = useRef(null);
  const [activeNode, setActiveNode] = useState(concepts[0]);
  const [hoveredNode, setHoveredNode] = useState(null);

  const activeNodeRef = useRef(activeNode);
  activeNodeRef.current = activeNode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 560;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090c);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 16, 42);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff5722, 2.0, 60);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const cyanLight = new THREE.DirectionalLight(0x00e5ff, 1.5);
    cyanLight.position.set(20, 30, 20);
    scene.add(cyanLight);

    // ── Category Color Tokens ──
    const catColors = {
      physics: 0x00e5ff,
      philosophy: 0xff5722,
      math: 0xffb300,
      psychology: 0xff1744,
      cs: 0x00e676,
    };

    // ── 3D Multi-Layer Crystalline Nodes ──
    const nodes = [];
    const nodeMeshes = [];
    const nodeCount = concepts.length;

    concepts.forEach((concept, i) => {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 15 + (i % 2) * 5;
      const x = Math.cos(angle) * radius;
      const y = ((i % 3) - 1) * 6;
      const z = Math.sin(angle) * radius;

      const colorHex = catColors[concept.category] || 0xff5722;
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(x, y, z);

      // Core Crystalline Geode
      const coreGeo = new THREE.OctahedronGeometry(1.6, 2);
      const coreMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.6,
        roughness: 0.15,
        metalness: 0.9,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.userData = { concept, id: concept.id };
      nodeGroup.add(coreMesh);

      // Floating Orbital Halo Ring
      const ringGeo = new THREE.TorusGeometry(2.4, 0.05, 12, 36);
      ringGeo.rotateX(Math.PI / 2 + (i % 2) * 0.5);
      const ringMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        metalness: 0.8,
        roughness: 0.2,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      nodeGroup.add(ringMesh);

      // Micro Satellite Orbiter
      const satGeo = new THREE.SphereGeometry(0.25, 12, 12);
      const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.position.set(2.4, 0, 0);
      ringMesh.add(satMesh);

      scene.add(nodeGroup);
      nodes.push({ concept, position: new THREE.Vector3(x, y, z), group: nodeGroup, core: coreMesh, ring: ringMesh });
      nodeMeshes.push(coreMesh);
    });

    // ── Curved 3D Bezier Data Conduits & Traveling Pulses ──
    const curves = [];
    const pulses = [];

    nodes.forEach((source) => {
      source.concept.relatedSlugs?.forEach((relSlug) => {
        const target = nodes.find((n) => n.concept.slug === relSlug);
        if (target) {
          // Compute curved midpoint
          const mid = new THREE.Vector3().addVectors(source.position, target.position).multiplyScalar(0.5);
          mid.y += 3.5; // Arch conduit upward

          const curve = new THREE.QuadraticBezierCurve3(source.position, mid, target.position);
          curves.push(curve);

          // Line Geometry
          const points = curve.getPoints(32);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({
            color: 0x353b4f,
            transparent: true,
            opacity: 0.45,
          });
          const line = new THREE.Line(lineGeo, lineMat);
          scene.add(line);

          // Traveling Photon Pulse along curve
          const pulseGeo = new THREE.SphereGeometry(0.2, 8, 8);
          const pulseMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
          const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
          scene.add(pulseMesh);

          pulses.push({
            curve,
            mesh: pulseMesh,
            progress: Math.random(),
            speed: 0.25 + Math.random() * 0.35,
          });
        }
      });
    });

    // ── Cosmic Background Dust ──
    const dustCount = 300;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 140;
      dustPos[i + 1] = (Math.random() - 0.5) * 70;
      dustPos[i + 2] = (Math.random() - 0.5) * 140;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0x5d6377, size: 1.4 });
    scene.add(new THREE.Points(dustGeo, dustMat));

    // ── Interaction & Camera Damping ──
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let spherical = { radius: 42, theta: 0, phi: Math.PI / 3 };
    let targetCameraPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3(0, 0, 0);
    let currentLookAt = new THREE.Vector3(0, 0, 0);

    const updateSphericalCamera = () => {
      targetCameraPos.set(
        spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta),
        spherical.radius * Math.cos(spherical.phi),
        spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
      );
    };
    updateSphericalCamera();

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = e.clientX - prevMouse.x;
        const deltaY = e.clientY - prevMouse.y;

        spherical.theta -= deltaX * 0.006;
        spherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, spherical.phi - deltaY * 0.006));

        prevMouse = { x: e.clientX, y: e.clientY };
        updateSphericalCamera();
      }

      // Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        const hovered = intersects[0].object.userData.concept;
        setHoveredNode(hovered);
        container.style.cursor = 'pointer';
      } else {
        setHoveredNode(null);
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      container.style.cursor = 'grab';
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        const clickedConcept = intersects[0].object.userData.concept;
        setActiveNode(clickedConcept);

        // Focus camera toward clicked node
        const targetNodeObj = nodes.find((n) => n.concept.id === clickedConcept.id);
        if (targetNodeObj) {
          targetLookAt.copy(targetNodeObj.position);
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    // ── Animation Loop ──
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Gentle auto-rotation when idle
      if (!isDragging) {
        spherical.theta += 0.001;
        updateSphericalCamera();
      }

      // Smooth camera interpolation
      camera.position.lerp(targetCameraPos, 0.05);
      currentLookAt.lerp(targetLookAt, 0.05);
      camera.lookAt(currentLookAt);

      // Rotate node crystals and orbital rings
      nodes.forEach((n) => {
        n.core.rotation.y += 0.015;
        n.core.rotation.x += 0.008;
        n.ring.rotation.z += 0.02;

        const isCurrentActive = n.concept.id === activeNodeRef.current?.id;
        const scale = isCurrentActive ? 1.25 + Math.sin(elapsed * 4) * 0.05 : 1.0;
        n.group.scale.set(scale, scale, scale);
      });

      // Animate traveling photon pulses along Bezier conduits
      pulses.forEach((p) => {
        p.progress = (p.progress + p.speed * delta) % 1;
        const pos = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pos);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={styles.graphContainer}>
      <div className={styles.canvasWrapper} ref={mountRef}>
        {/* Top HUD Controls */}
        <div className={styles.canvasOverlay}>
          <div className={styles.overlayPill}>
            <Icon name="network" size={13} color="var(--color-brand-primary)" />
            <span>3D Synaptic Constellation • Click Node to Focus</span>
          </div>
          {hoveredNode && (
            <div className={styles.hoverTooltip}>
              <span className={styles.hoverDot} />
              <span>{hoveredNode.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sci-Fi Telemetry Panel */}
      {activeNode && (
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarBadge}>
              <Icon name="atom" size={12} color="var(--color-brand-primary)" />
              <span>Focused Node</span>
            </div>
            <span className={styles.nodeHash}>ID: 0x{activeNode.id.padStart(4, '0')}</span>
          </div>

          <h2 className={styles.sidebarTitle}>{activeNode.title}</h2>
          <p className={styles.sidebarDesc}>{activeNode.summary}</p>

          <div className={styles.connectionsBox}>
            <div className={styles.connHeader}>
              <Icon name="layers" size={13} color="var(--color-brand-primary)" />
              <span>Synaptic Connections ({activeNode.relatedSlugs?.length || 0})</span>
            </div>
            <div className={styles.connList}>
              {activeNode.relatedSlugs?.map((relSlug) => {
                const rel = concepts.find((c) => c.slug === relSlug);
                if (!rel) return null;
                return (
                  <button
                    key={rel.id}
                    onClick={() => setActiveNode(rel)}
                    className={styles.connBtn}
                  >
                    <Icon name="arrow-right" size={14} color="var(--color-brand-primary)" />
                    <span className={styles.connName}>{rel.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Link href={`/concepts/${activeNode.slug}`} className={styles.launchBtn}>
            <Icon name="zap" size={16} />
            <span>Launch Dedicated 3D Lab</span>
          </Link>
        </div>
      )}
    </div>
  );
}
