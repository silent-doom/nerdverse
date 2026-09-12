'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * High-End 3D Interactive Gyroscopic Spacetime Core & Particle Singularity.
 * Features PBR metallic gimbal rings, dynamic gravitational mouse physics,
 * luminous quantum energy core, and interactive particle shockwaves.
 */
export default function SpacetimeHeroCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090c);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 12, 38);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const primaryLight = new THREE.PointLight(0xff5722, 2.5, 50); // Solar Vermillion light
    primaryLight.position.set(0, 0, 0);
    scene.add(primaryLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00e5ff, 1.8); // Electric Cyan rim
    cyanRimLight.position.set(20, 25, 20);
    scene.add(cyanRimLight);

    const goldFillLight = new THREE.DirectionalLight(0xffb300, 1.0);
    goldFillLight.position.set(-20, -10, -20);
    scene.add(goldFillLight);

    // ── Central Luminous Singularity Core ──
    const coreGeo = new THREE.IcosahedronGeometry(2.2, 4);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff5722,
      emissive: 0xff5722,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const innerSphereGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const innerSphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    core.add(innerSphere);

    // ── Gyroscopic Spacetime Gimbal Rings (PBR Metallic) ──
    const rings = [];
    const ringConfigs = [
      { radius: 4.2, tube: 0.08, color: 0xff5722, speedX: 0.4, speedY: 0.8, speedZ: 0.2 },
      { radius: 6.0, tube: 0.06, color: 0x00e5ff, speedX: -0.5, speedY: 0.3, speedZ: 0.6 },
      { radius: 8.2, tube: 0.05, color: 0xffb300, speedX: 0.3, speedY: -0.6, speedZ: 0.4 },
      { radius: 10.8, tube: 0.04, color: 0x8e94a5, speedX: 0.2, speedY: 0.4, speedZ: -0.5 },
    ];

    ringConfigs.forEach((cfg) => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 64);
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        metalness: 0.85,
        roughness: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      rings.push({ mesh, ...cfg });
    });

    // ── Orbiting Quantum Theory Particles ──
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = [];
    const particleDistances = [];
    const particleAngles = [];

    for (let i = 0; i < particleCount; i++) {
      const r = 3.5 + Math.random() * 18;
      const angle = Math.random() * Math.PI * 2;
      const heightOffset = (Math.random() - 0.5) * 6;

      particlePositions[i * 3] = Math.cos(angle) * r;
      particlePositions[i * 3 + 1] = heightOffset;
      particlePositions[i * 3 + 2] = Math.sin(angle) * r;

      particleDistances.push(r);
      particleAngles.push(angle);
      particleSpeeds.push((0.2 + Math.random() * 0.6) * (Math.random() > 0.5 ? 1 : -1));
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 1.8,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Mouse & Interaction Physics ──
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let shockwaveRadius = 0;
    let isShockwaveActive = false;

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const onClick = () => {
      shockwaveRadius = 1.0;
      isShockwaveActive = true;
    };

    window.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    // ── Animation Loop ──
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Singularity core pulse
      const scale = 1 + Math.sin(elapsed * 3) * 0.08;
      core.scale.set(scale, scale, scale);
      core.rotation.y = elapsed * 0.8;
      core.rotation.x = elapsed * 0.4;

      // Rotate gyroscopic rings
      rings.forEach((ring) => {
        ring.mesh.rotation.x += ring.speedX * delta;
        ring.mesh.rotation.y += ring.speedY * delta;
        ring.mesh.rotation.z += ring.speedZ * delta;
      });

      // Update particle accretion disk
      const posArray = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        particleAngles[i] += particleSpeeds[i] * delta * 0.8;
        let r = particleDistances[i];

        // Shockwave expansion
        if (isShockwaveActive && Math.abs(r - shockwaveRadius) < 2.5) {
          r += Math.sin((r - shockwaveRadius) * 2) * 1.2;
        }

        posArray[i * 3] = Math.cos(particleAngles[i]) * r;
        posArray[i * 3 + 1] += Math.sin(elapsed * 2 + r) * 0.01;
        posArray[i * 3 + 2] = Math.sin(particleAngles[i]) * r;
      }
      particleGeo.attributes.position.needsUpdate = true;

      if (isShockwaveActive) {
        shockwaveRadius += delta * 18;
        if (shockwaveRadius > 24) isShockwaveActive = false;
      }

      // Parallax camera inertia
      camera.position.x = mouse.x * 10;
      camera.position.y = 12 + mouse.y * 6;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'auto',
        cursor: 'crosshair',
        overflow: 'hidden',
      }}
    />
  );
}
