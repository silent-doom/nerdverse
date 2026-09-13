'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './SolarSystemHeroCanvas.module.css';

// ── Planetary Telemetry Data ──
const PLANET_DATA = [
  {
    name: 'Mercury',
    symbol: '☿',
    type: 'Terrestrial',
    au: '0.39 AU',
    period: '87.97 days',
    velocity: '47.36 km/s',
    orbitRadius: 5.2,
    radius: 0.38,
    speed: 1.6,
    spinSpeed: 0.002, // 58.6-day slow rotation
    color: 0xa8a29e,
    tilt: 0.03,
    moonsList: 'None (0)',
    moons: [],
    desc: 'Smallest terrestrial planet; experiences dramatic 600°C swings between blisteringly hot day and frozen night.',
  },
  {
    name: 'Venus',
    symbol: '♀',
    type: 'Terrestrial',
    au: '0.72 AU',
    period: '224.7 days',
    velocity: '35.02 km/s',
    orbitRadius: 7.6,
    radius: 0.62,
    speed: 1.18,
    spinSpeed: -0.001, // 243-day slow retrograde rotation
    color: 0xfde047,
    tilt: 3.1, // retrograde
    moonsList: 'None (0)',
    moons: [],
    desc: 'Runaway greenhouse atmosphere shrouded in opaque sulfuric acid clouds, with surface temperatures hot enough to melt lead.',
  },
  {
    name: 'Earth',
    symbol: '♁',
    type: 'Habitable Terrestrial',
    au: '1.00 AU',
    period: '365.25 days',
    velocity: '29.78 km/s',
    orbitRadius: 10.4,
    radius: 0.70,
    speed: 1.0,
    spinSpeed: 0.018, // 24-hour rotation
    color: 0x3b82f6,
    tilt: 0.41,
    moonsList: 'Moon / Luna (1)',
    moons: [
      { name: 'Luna', radius: 0.20, dist: 1.4, speed: 0.045, color: 0xd1d5db },
    ],
    desc: 'The Pale Blue Dot; supports liquid water oceans, an active dynamic magnetosphere, and a thriving biosphere.',
  },
  {
    name: 'Mars',
    symbol: '♂',
    type: 'Terrestrial',
    au: '1.52 AU',
    period: '686.98 days',
    velocity: '24.07 km/s',
    orbitRadius: 13.5,
    radius: 0.48,
    speed: 0.8,
    spinSpeed: 0.017, // 24.6-hour rotation
    color: 0xef4444,
    tilt: 0.44,
    moonsList: 'Phobos & Deimos (2)',
    moons: [
      { name: 'Phobos', radius: 0.09, dist: 0.9, speed: 0.075, color: 0x9ca3af },
      { name: 'Deimos', radius: 0.07, dist: 1.35, speed: 0.045, color: 0x6b7280 },
    ],
    desc: 'The Red Planet; home to Olympus Mons, massive volcanic shields, and frozen polar carbon dioxide/water ice caps.',
  },
  {
    name: 'Jupiter',
    symbol: '♃',
    type: 'Gas Giant',
    au: '5.20 AU',
    period: '11.86 years',
    velocity: '13.07 km/s',
    orbitRadius: 22.0,
    radius: 1.55,
    speed: 0.44,
    spinSpeed: 0.042, // Rapid 9.9-hour rotation (fastest in solar system)
    color: 0xf59e0b,
    tilt: 0.05,
    isJovian: true,
    moonsList: 'Io, Europa, Ganymede (95 total)',
    moons: [
      { name: 'Io', radius: 0.18, dist: 2.4, speed: 0.060, color: 0xfbbf24 },
      { name: 'Europa', radius: 0.16, dist: 3.2, speed: 0.044, color: 0xe0f2fe },
      { name: 'Ganymede', radius: 0.24, dist: 4.1, speed: 0.032, color: 0x94a3b8 },
    ],
    desc: 'Largest planet in the solar system; features dynamic alternating zonal cloud belts and the centuries-old Great Red Spot storm.',
  },
  {
    name: 'Saturn',
    symbol: '♄',
    type: 'Gas Giant (Rings)',
    au: '9.58 AU',
    period: '29.45 years',
    velocity: '9.69 km/s',
    orbitRadius: 28.5,
    radius: 1.30,
    speed: 0.32,
    spinSpeed: 0.038, // 10.7-hour fast rotation
    color: 0xfef08a,
    tilt: 0.47,
    hasRings: true,
    moonsList: 'Titan & Enceladus (146 total)',
    moons: [
      { name: 'Enceladus', radius: 0.12, dist: 3.1, speed: 0.055, color: 0xf8fafc },
      { name: 'Titan', radius: 0.24, dist: 4.4, speed: 0.034, color: 0xf59e0b },
    ],
    desc: 'Spectacular planetary ring system spanning 282,000 km, composed of billions of water-ice particles and silicates.',
  },
  {
    name: 'Uranus',
    symbol: '♅',
    type: 'Ice Giant',
    au: '19.22 AU',
    period: '84.02 years',
    velocity: '6.81 km/s',
    orbitRadius: 34.5,
    radius: 0.95,
    speed: 0.22,
    spinSpeed: -0.022, // 17.2-hour retrograde rotation on 98° tilted side
    color: 0x67e8f9,
    tilt: 1.71, // 98 deg tilt
    moonsList: 'Titania & Oberon (28 total)',
    moons: [
      { name: 'Titania', radius: 0.16, dist: 1.8, speed: 0.045, color: 0xcbd5e1 },
      { name: 'Oberon', radius: 0.15, dist: 2.5, speed: 0.032, color: 0x94a3b8 },
    ],
    desc: 'Ice giant tilted 98° on its side, rolling through space around the Sun like a colossal cosmic billiard ball.',
  },
  {
    name: 'Neptune',
    symbol: '♆',
    type: 'Ice Giant',
    au: '30.05 AU',
    period: '164.8 years',
    velocity: '5.43 km/s',
    orbitRadius: 40.5,
    radius: 0.90,
    speed: 0.17,
    spinSpeed: 0.024, // 16.1-hour rotation
    color: 0x3b82f6,
    tilt: 0.49,
    moonsList: 'Triton & Proteus (16 total)',
    moons: [
      { name: 'Proteus', radius: 0.11, dist: 1.6, speed: 0.052, color: 0x64748b },
      { name: 'Triton', radius: 0.22, dist: 2.4, speed: -0.036, color: 0xfbcfe8 }, // retrograde orbit!
    ],
    desc: 'Most distant major planet; deep ultramarine methane atmosphere whipped by supersonic winds exceeding 2,100 km/h.',
  },
];

// Procedural texture generators for planets to achieve instant load with zero network delay
function createPlanetTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  switch (type) {
    case 'sun': {
      const grad = ctx.createRadialGradient(256, 128, 10, 256, 128, 256);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.2, '#FFFBEB');
      grad.addColorStop(0.5, '#F59E0B');
      grad.addColorStop(0.85, '#D97706');
      grad.addColorStop(1, '#92400E');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);
      // Corona flares
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const r = Math.random() * 12 + 2;
        ctx.fillStyle = `rgba(255, 235, 180, ${Math.random() * 0.35 + 0.1})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'mercury': {
      ctx.fillStyle = '#8C857B';
      ctx.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#6D675F' : '#A8A29A';
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 8 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'venus': {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#EAD5A5');
      grad.addColorStop(0.3, '#E2C288');
      grad.addColorStop(0.7, '#C9A368');
      grad.addColorStop(1, '#EAD5A5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);
      // Acid cloud streaks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let y = 0; y < 256; y += 12) {
        ctx.fillRect(0, y + Math.sin(y * 0.1) * 8, 512, 4);
      }
      break;
    }
    case 'earth': {
      ctx.fillStyle = '#1D4ED8'; // Deep blue ocean
      ctx.fillRect(0, 0, 512, 256);
      // Continents
      ctx.fillStyle = '#15803D';
      const continents = [
        [100, 70, 70, 45], [120, 160, 55, 60], [290, 80, 80, 50],
        [320, 150, 60, 50], [420, 160, 45, 40]
      ];
      continents.forEach(([cx, cy, rw, rh]) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, 0.2, 0, Math.PI * 2);
        ctx.fill();
      });
      // Cloud swirls
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 35 + 15, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'mars': {
      ctx.fillStyle = '#C2410C'; // Red basalt
      ctx.fillRect(0, 0, 512, 256);
      // Dark maria
      ctx.fillStyle = '#7C2D12';
      ctx.beginPath();
      ctx.ellipse(256, 128, 140, 60, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Polar Ice Caps
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, 512, 14);
      ctx.fillRect(0, 242, 512, 14);
      break;
    }
    case 'jupiter': {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#C97A3E');
      grad.addColorStop(0.2, '#E2C29D');
      grad.addColorStop(0.35, '#8C4318');
      grad.addColorStop(0.5, '#F5EDE0');
      grad.addColorStop(0.65, '#A35324');
      grad.addColorStop(0.8, '#D8A47F');
      grad.addColorStop(1, '#8C4318');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);
      // Great Red Spot
      ctx.fillStyle = '#B91C1C';
      ctx.beginPath();
      ctx.ellipse(360, 165, 34, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'saturn': {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#E5D0A1');
      grad.addColorStop(0.3, '#FDF6E2');
      grad.addColorStop(0.6, '#D6BD8A');
      grad.addColorStop(0.8, '#C4A870');
      grad.addColorStop(1, '#E5D0A1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);
      break;
    }
    case 'uranus': {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#A5F3FC');
      grad.addColorStop(0.5, '#67E8F9');
      grad.addColorStop(1, '#06B6D4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);
      break;
    }
    case 'neptune': {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#1E40AF');
      grad.addColorStop(0.4, '#2563EB');
      grad.addColorStop(0.7, '#1D4ED8');
      grad.addColorStop(1, '#1E3A8A');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);
      // Great Dark Spot & Methane Clouds
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(180, 110, 26, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(160, 126, 40, 3);
      break;
    }
    default:
      ctx.fillStyle = '#AAAAAA';
      ctx.fillRect(0, 0, 512, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Saturn Rings Texture Generator
function createSaturnRingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.08, 'rgba(196, 168, 112, 0.2)');
  grad.addColorStop(0.25, 'rgba(235, 214, 168, 0.85)');
  grad.addColorStop(0.52, 'rgba(214, 189, 138, 0.9)');
  grad.addColorStop(0.58, 'rgba(0, 0, 0, 0.05)'); // Cassini Division!
  grad.addColorStop(0.62, 'rgba(200, 175, 125, 0.8)');
  grad.addColorStop(0.88, 'rgba(180, 155, 105, 0.6)');
  grad.addColorStop(0.96, 'rgba(140, 115, 75, 0.15)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function SolarSystemHeroCanvas({ onInteractionStateChange, isTextDimmed }) {
  const mountRef = useRef(null);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [hudPos, setHudPos] = useState({ x: 0, y: 0 });
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showOrbits, setShowOrbits] = useState(true);
  const [focusedPlanet, setFocusedPlanet] = useState(null);

  const onInteractionStateChangeRef = useRef(onInteractionStateChange);
  useEffect(() => {
    onInteractionStateChangeRef.current = onInteractionStateChange;
  }, [onInteractionStateChange]);

  const isTextDimmedRef = useRef(isTextDimmed);
  useEffect(() => {
    isTextDimmedRef.current = isTextDimmed;
  }, [isTextDimmed]);

  // Mutable refs for real-time 60fps loop
  const animStateRef = useRef({
    speedMultiplier: 1,
    isPaused: false,
    focusedPlanet: null,
    cameraAngle: { theta: 0.22, phi: 0.72, radius: 52 },
    targetCamPos: new THREE.Vector3(10, 38, 34),
    targetLookAt: new THREE.Vector3(0, -1, 0),
    currentLookAt: new THREE.Vector3(0, -1, 0),
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    mouseParallax: { x: 0, y: 0 },
  });

  // Sync state to refs
  useEffect(() => {
    animStateRef.current.speedMultiplier = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    animStateRef.current.isPaused = isPaused;
  }, [isPaused]);

  useEffect(() => {
    animStateRef.current.focusedPlanet = focusedPlanet;
  }, [focusedPlanet]);

  const handleResetCamera = useCallback(() => {
    setFocusedPlanet(null);
    animStateRef.current.focusedPlanet = null;
    animStateRef.current.cameraAngle = { theta: 0.22, phi: 0.72, radius: 52 };
    animStateRef.current.targetLookAt.set(0, -1, 0);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isVisible = true;
    let animationFrameId;

    // ── 1. Scene, Camera, Renderer ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090C);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1200);
    camera.position.set(10, 38, 34);
    camera.lookAt(0, -1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // ── 2. Dynamic Deep Space Starfield ──
    const starCount = 1600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 200 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi);
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      // Warm Amber / Gold / Azure / White Stellar Variations
      const tint = Math.random();
      if (tint > 0.8) {
        // Scholarly Amber star
        starColors[i * 3] = 0.95;
        starColors[i * 3 + 1] = 0.72;
        starColors[i * 3 + 2] = 0.35;
      } else if (tint > 0.6) {
        // Cyan / Blue star
        starColors[i * 3] = 0.45;
        starColors[i * 3 + 1] = 0.75;
        starColors[i * 3 + 2] = 1.0;
      } else {
        // Pure White / Silver
        starColors[i * 3] = 0.9;
        starColors[i * 3 + 1] = 0.92;
        starColors[i * 3 + 2] = 0.98;
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // ── 3. The Sun (Sol) & Multi-Octave Coronal Radiance ──
    const sunGroup = new THREE.Group();
    scene.add(sunGroup);

    // Sun Sphere
    const sunGeo = new THREE.SphereGeometry(3.0, 48, 48);
    const sunTex = createPlanetTexture('sun');
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTex,
      color: 0xFFFBEB,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // Dynamic Coronal Atmospheric Halo
    const coronaGeo = new THREE.SphereGeometry(3.6, 32, 32);
    const coronaMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.96, 0.62, 0.15, 1.0) * intensity * 1.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    sunGroup.add(coronaMesh);

    // Solar Light Source (Omnidirectional Radiant PointLight)
    const sunLight = new THREE.PointLight(0xFFF7ED, 5.0, 180, 0.7);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Subtle Ambient Fill Light (Ensures night sides of planets maintain vibrant aesthetic visibility)
    const ambientLight = new THREE.AmbientLight(0x40485C, 1.4);
    scene.add(ambientLight);

    // ── 4. Planetary Systems Creation ──
    const planets = [];
    const orbitLines = [];
    const interactiveHitboxes = [];

    PLANET_DATA.forEach((data) => {
      // Planet System Group that orbits the Sun at orbitRadius
      const planetGroup = new THREE.Group();
      scene.add(planetGroup);

      // Keplerian Orbit Ring Path
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,
        data.orbitRadius, data.orbitRadius,
        0, 2 * Math.PI,
        false,
        0
      );
      const orbitPoints = orbitCurve.getPoints(128);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitMat = new THREE.LineBasicMaterial({
        color: 0xE5A93C,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      scene.add(orbitLine);
      orbitLines.push(orbitLine);

      // Planet Sphere Mesh with Emissive Celestial Tint (Axial tilt aligned)
      const pGeo = new THREE.SphereGeometry(data.radius, 32, 32);
      const pTex = createPlanetTexture(data.name.toLowerCase());
      const pMat = new THREE.MeshStandardMaterial({
        map: pTex,
        roughness: data.isJovian ? 0.4 : 0.75,
        metalness: 0.1,
        emissive: new THREE.Color(data.color),
        emissiveIntensity: 0.18,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.rotation.z = data.tilt;
      planetGroup.add(pMesh);

      // Scientifically accurate: ONLY Saturn has a spectacular planetary ring system!
      if (data.hasRings) {
        const ringGeo = new THREE.RingGeometry(data.radius * 1.35, data.radius * 2.8, 64);
        ringGeo.rotateX(Math.PI / 2);
        const ringTex = createSaturnRingTexture();
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          roughness: 0.4,
          metalness: 0.1,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        pMesh.add(ringMesh);
      }

      // Moon System (Earth, Mars, Jupiter, Saturn, Uranus, Neptune)
      const moonObjects = [];
      if (data.moons && data.moons.length > 0) {
        const moonSystemPivot = new THREE.Group();
        // For Uranus, match moons to its severe 98° axial tilt
        if (data.name === 'Uranus') {
          moonSystemPivot.rotation.z = data.tilt;
        }
        planetGroup.add(moonSystemPivot);

        data.moons.forEach((m) => {
          // Subtle moon orbit trajectory ring
          const mOrbitCurve = new THREE.EllipseCurve(0, 0, m.dist, m.dist, 0, 2 * Math.PI, false, 0);
          const mPoints = mOrbitCurve.getPoints(48);
          const mOrbitGeo = new THREE.BufferGeometry().setFromPoints(
            mPoints.map((pt) => new THREE.Vector3(pt.x, 0, pt.y))
          );
          const mOrbitMat = new THREE.LineBasicMaterial({
            color: 0xCBD5E1,
            transparent: true,
            opacity: 0.14,
          });
          const mOrbitLine = new THREE.Line(mOrbitGeo, mOrbitMat);
          moonSystemPivot.add(mOrbitLine);

          // Moon Sphere Mesh
          const mGeo = new THREE.SphereGeometry(m.radius, 16, 16);
          const mMat = new THREE.MeshStandardMaterial({
            color: m.color,
            roughness: 0.8,
            metalness: 0.05,
          });
          const mMesh = new THREE.Mesh(mGeo, mMat);
          const mInitAngle = Math.random() * Math.PI * 2;
          mMesh.position.set(Math.cos(mInitAngle) * m.dist, 0, Math.sin(mInitAngle) * m.dist);
          moonSystemPivot.add(mMesh);

          moonObjects.push({
            ...m,
            angle: mInitAngle,
            mesh: mMesh,
          });
        });
      }

      // Invisible Raycasting Hitbox for effortless hover detection
      const hitRadius = Math.max(data.radius * 2.2, 1.4);
      const hitGeo = new THREE.SphereGeometry(hitRadius, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { planetData: data, planetMesh: pMesh, orbitLine: orbitLine, group: planetGroup };
      planetGroup.add(hitMesh);
      interactiveHitboxes.push(hitMesh);

      const initialAngle = Math.random() * Math.PI * 2;
      planetGroup.position.set(
        Math.cos(initialAngle) * data.orbitRadius,
        0,
        Math.sin(initialAngle) * data.orbitRadius
      );

      planets.push({
        ...data,
        group: planetGroup,
        mesh: pMesh,
        moons: moonObjects,
        angle: initialAngle,
        orbitLine,
      });
    });

    // ── 5. Asteroid Belt (InstancedMesh) ──
    const asteroidCount = 1200;
    const asteroidGeo = new THREE.DodecahedronGeometry(0.12, 0);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0x857F78,
      roughness: 0.9,
      metalness: 0.1,
    });
    const asteroidBelt = new THREE.InstancedMesh(asteroidGeo, asteroidMat, asteroidCount);
    const dummy = new THREE.Object3D();
    const asteroidData = [];

    for (let i = 0; i < asteroidCount; i++) {
      const dist = 16.5 + Math.random() * 2.8; // Between Mars (13.5) and Jupiter (22.0)
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.55 + Math.random() * 0.15) * 0.006;
      const yOffset = (Math.random() - 0.5) * 1.6;
      const scale = 0.5 + Math.random() * 1.2;

      asteroidData.push({ dist, angle, speed, yOffset, scale });
      dummy.position.set(Math.cos(angle) * dist, yOffset, Math.sin(angle) * dist);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      asteroidBelt.setMatrixAt(i, dummy.matrix);
    }
    asteroidBelt.instanceMatrix.needsUpdate = true;
    scene.add(asteroidBelt);

    // ── 6. Mouse Interaction & Raycasting ──
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Subtle ambient gyroscopic camera parallax
      animStateRef.current.mouseParallax.x = (e.clientX / window.innerWidth - 0.5) * 3.5;
      animStateRef.current.mouseParallax.y = (e.clientY / window.innerHeight - 0.5) * 2.0;

      // Raycasting for planet tooltips
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveHitboxes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const pData = hit.userData.planetData;
        setHoveredPlanet(pData);
        setHudPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        container.style.cursor = 'pointer';

        // Highlight hovered orbit
        orbitLines.forEach((l) => (l.material.opacity = 0.14));
        if (hit.userData.orbitLine) {
          hit.userData.orbitLine.material.opacity = 0.55;
        }
      } else {
        setHoveredPlanet(null);
        container.style.cursor = animStateRef.current.isDragging ? 'grabbing' : 'grab';
        orbitLines.forEach((l) => (l.material.opacity = 0.14));
      }

      // Drag to rotate camera
      if (animStateRef.current.isDragging) {
        const deltaX = e.clientX - animStateRef.current.dragStart.x;
        const deltaY = e.clientY - animStateRef.current.dragStart.y;
        animStateRef.current.dragStart = { x: e.clientX, y: e.clientY };

        animStateRef.current.cameraAngle.theta -= deltaX * 0.005;
        animStateRef.current.cameraAngle.phi = THREE.MathUtils.clamp(
          animStateRef.current.cameraAngle.phi + deltaY * 0.005,
          0.1,
          Math.PI / 2 - 0.05
        );
      }
    };

    const onPointerDown = (e) => {
      // Don't drag if clicking buttons or links
      if (e.target.closest('button, a')) return;
      animStateRef.current.isDragging = true;
      animStateRef.current.dragStart = { x: e.clientX, y: e.clientY };
      if (onInteractionStateChangeRef.current) {
        onInteractionStateChangeRef.current(true);
      }
    };

    const onPointerUp = (e) => {
      animStateRef.current.isDragging = false;

      // Check click on planet to focus
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveHitboxes, false);
      if (intersects.length > 0) {
        const pData = intersects[0].object.userData.planetData;
        setFocusedPlanet(pData);
        if (onInteractionStateChangeRef.current) {
          onInteractionStateChangeRef.current(true);
        }
      }
    };

    const onWheel = (e) => {
      const rect = container.getBoundingClientRect();
      const inHero = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      if (!inHero) return;

      // Allow natural page scrolling!
      // Only zoom the 3D Orrery when:
      // 1. User holds Ctrl / Cmd / Shift (standard web canvas & map navigation pattern)
      // 2. User performs a trackpad pinch gesture (browsers send e.ctrlKey = true)
      const isZoomIntent = e.ctrlKey || e.metaKey || e.shiftKey;

      if (!isZoomIntent) {
        // Do NOT prevent default: let the browser scroll down the page naturally!
        return;
      }

      e.preventDefault();
      const zoomDelta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) * 0.08, 4.0);
      animStateRef.current.cameraAngle.radius = THREE.MathUtils.clamp(
        animStateRef.current.cameraAngle.radius + zoomDelta,
        14,
        95
      );
      if (onInteractionStateChangeRef.current) {
        onInteractionStateChangeRef.current(true);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('wheel', onWheel, { passive: false });

    // ── 7. Resize Observer ──
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── 8. Viewport Intersection Observer (Zero CPU when scrolled away) ──
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    // ── 9. Render & Keplerian Physics Animation Loop ──
    let lastTime = performance.now();
    let moonAngle = 0;

    const animate = (timestamp) => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const now = timestamp || performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const speed = animStateRef.current.isPaused ? 0 : animStateRef.current.speedMultiplier;

      // Sun rotation & corona pulse
      sunMesh.rotation.y += 0.003;
      const time = now * 0.001;
      coronaMesh.scale.setScalar(1.0 + Math.sin(time * 2.5) * 0.03);

      // Planets orbital & axial rotation
      planets.forEach((p) => {
        // Orbit around the Sun
        p.angle += (p.speed * 0.008 * speed);
        p.group.position.x = Math.cos(p.angle) * p.orbitRadius;
        p.group.position.z = Math.sin(p.angle) * p.orbitRadius;

        // Realistic axial day/night spin
        const spinFactor = animStateRef.current.isPaused ? 0 : (speed === 0 ? 0 : Math.max(speed, 0.4));
        p.mesh.rotation.y += (p.spinSpeed || 0.015) * spinFactor;

        // Moons revolving around parent planet
        if (p.moons && p.moons.length > 0) {
          p.moons.forEach((m) => {
            m.angle += m.speed * (animStateRef.current.isPaused ? 0 : speed);
            m.mesh.position.x = Math.cos(m.angle) * m.dist;
            m.mesh.position.z = Math.sin(m.angle) * m.dist;
          });
        }
      });

      // Asteroid belt orbital motion
      if (!animStateRef.current.isPaused) {
        for (let i = 0; i < asteroidCount; i++) {
          const ast = asteroidData[i];
          ast.angle += ast.speed * speed;
          dummy.position.set(
            Math.cos(ast.angle) * ast.dist,
            ast.yOffset + Math.sin(ast.angle * 3) * 0.2,
            Math.sin(ast.angle) * ast.dist
          );
          dummy.rotation.y += 0.01;
          dummy.scale.setScalar(ast.scale);
          dummy.updateMatrix();
          asteroidBelt.setMatrixAt(i, dummy.matrix);
        }
        asteroidBelt.instanceMatrix.needsUpdate = true;
      }

      // Orbit lines visibility toggle
      orbitLines.forEach((l) => (l.visible = showOrbits));

      // Camera positioning (Smooth Lerp)
      const currentTarget = animStateRef.current.focusedPlanet;
      if (currentTarget) {
        // Focus on selected planet (view from sunward side so planet is fully illuminated against stars)
        const targetPlanetObj = planets.find((p) => p.name === currentTarget.name);
        if (targetPlanetObj) {
          const targetWorldPos = new THREE.Vector3();
          targetPlanetObj.mesh.getWorldPosition(targetWorldPos);

          const planetDir = targetWorldPos.clone().normalize();
          const camDist = Math.max(targetPlanetObj.radius * (targetPlanetObj.hasRings ? 7.5 : 5.0), 4.2);
          const camPos = targetWorldPos.clone()
            .sub(planetDir.clone().multiplyScalar(camDist))
            .add(new THREE.Vector3(0, targetPlanetObj.radius * 1.8 + 1.0, 0));

          animStateRef.current.targetCamPos.copy(camPos);
          animStateRef.current.targetLookAt.copy(targetWorldPos);
        }
      } else {
        // Default Orrery View with Spherical Angles & Parallax
        const { theta, phi, radius } = animStateRef.current.cameraAngle;
        const px = animStateRef.current.mouseParallax.x;
        const py = animStateRef.current.mouseParallax.y;

        const camX = radius * Math.sin(phi) * Math.sin(theta) + px;
        const camY = radius * Math.cos(phi) + py;
        const camZ = radius * Math.sin(phi) * Math.cos(theta);

        animStateRef.current.targetCamPos.set(camX, camY, camZ);
        animStateRef.current.targetLookAt.set(0, -1, 0);
      }

      // Smooth camera interpolation
      camera.position.lerp(animStateRef.current.targetCamPos, 0.06);
      animStateRef.current.currentLookAt.lerp(animStateRef.current.targetLookAt, 0.06);
      camera.lookAt(animStateRef.current.currentLookAt);

      renderer.render(scene, camera);
    };

    animate();

    // ── 10. Clean-up on unmount ──
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);

      // Dispose geometries & textures
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [showOrbits]);

  return (
    <div className={styles.container} ref={mountRef}>
      {/* Central Radial Vignette for Hero Text Contrast (Dims in Space Mode) */}
      <div className={`${styles.vignette} ${isTextDimmed ? styles.vignetteClear : ''}`} />

      {/* Planet Quick-Selection Navigation Toolbar */}
      <div className={styles.planetBar}>
        <span className={styles.planetBarLabel}>Planets:</span>
        {PLANET_DATA.map((p) => (
          <button
            key={p.name}
            className={`${styles.planetPill} ${focusedPlanet?.name === p.name ? styles.planetPillActive : ''}`}
            onClick={() => {
              setFocusedPlanet(p);
              if (onInteractionStateChangeRef.current) {
                onInteractionStateChangeRef.current(true);
              }
            }}
            title={`Focus ${p.name} (${p.type})`}
          >
            <span className={styles.planetPillSymbol}>{p.symbol}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Floating Planet Telemetry HUD Tooltip */}
      {hoveredPlanet && (
        <div
          className={styles.planetHud}
          style={{
            left: `${hudPos.x}px`,
            top: `${hudPos.y}px`,
          }}
        >
          <div className={styles.hudHeader}>
            <span className={styles.hudTitle}>
              <span>{hoveredPlanet.symbol}</span>
              <span>{hoveredPlanet.name}</span>
            </span>
            <span className={styles.hudBadge}>{hoveredPlanet.type}</span>
          </div>
          <div className={styles.hudGrid}>
            <span className={styles.hudLabel}>Semi-Major Axis:</span>
            <span className={styles.hudValue}>{hoveredPlanet.au}</span>
            <span className={styles.hudLabel}>Orbital Period:</span>
            <span className={styles.hudValue}>{hoveredPlanet.period}</span>
            <span className={styles.hudLabel}>Velocity:</span>
            <span className={styles.hudValue}>{hoveredPlanet.velocity}</span>
            <span className={styles.hudLabel}>Moons:</span>
            <span className={styles.hudValue}>{hoveredPlanet.moonsList}</span>
            <span className={styles.hudLabel}>Click:</span>
            <span className={styles.hudValue} style={{ color: '#E5A93C' }}>Focus Camera</span>
          </div>
        </div>
      )}

      {/* Dedicated Focused Planet Mission Card (Top-Right) */}
      {focusedPlanet && (
        <div className={styles.focusCard}>
          <div className={styles.focusHeader}>
            <div>
              <span className={styles.focusSymbol}>{focusedPlanet.symbol}</span>
              <h4 className={styles.focusName}>{focusedPlanet.name}</h4>
            </div>
            <span className={styles.hudBadge}>{focusedPlanet.type}</span>
          </div>
          <p className={styles.focusDesc}>{focusedPlanet.desc}</p>
          <div className={styles.focusStats}>
            <div>
              <span className={styles.focusLabel}>Distance from Sun</span>
              <span className={styles.focusVal}>{focusedPlanet.au}</span>
            </div>
            <div>
              <span className={styles.focusLabel}>Orbital Velocity</span>
              <span className={styles.focusVal}>{focusedPlanet.velocity}</span>
            </div>
            <div>
              <span className={styles.focusLabel}>Orbital Period</span>
              <span className={styles.focusVal}>{focusedPlanet.period}</span>
            </div>
            <div>
              <span className={styles.focusLabel}>Known Moons</span>
              <span className={styles.focusVal}>{focusedPlanet.moonsList}</span>
            </div>
          </div>
          <button className={styles.focusCloseBtn} onClick={handleResetCamera}>
            ← Back to Solar System View
          </button>
        </div>
      )}

      {/* Interactive Drag Hint */}
      <div className={styles.interactiveHint}>
        <div className={styles.hintDot} />
        <span>
          {isTextDimmed
            ? 'Space View: Drag to rotate • Pinch / Ctrl+Scroll or +/- to zoom • Click planet to track'
            : '3D Orrery: Drag to rotate • Pinch / Ctrl+Scroll or +/- to zoom • Click planet to track'}
        </span>
      </div>

      {/* Floating Orrery Dashboard Controls */}
      <div className={styles.controlsBar}>
        <button
          className={`${styles.controlBtn} ${isPaused ? styles.controlBtnActive : ''}`}
          onClick={() => setIsPaused(!isPaused)}
          title={isPaused ? 'Resume Orbits' : 'Pause Orbits'}
        >
          {isPaused ? '▶ Play' : '⏸ Pause'}
        </button>

        <div className={styles.divider} />

        {/* Speed Multipliers (Balanced observation pacing, removed 20x) */}
        <div className={styles.speedGroup}>
          {[0.5, 1, 2, 5].map((multiplier) => (
            <button
              key={multiplier}
              className={`${styles.speedBtn} ${speedMultiplier === multiplier ? styles.speedBtnActive : ''}`}
              onClick={() => {
                setSpeedMultiplier(multiplier);
                setIsPaused(false);
              }}
            >
              {multiplier}×
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        {/* Manual Zoom Buttons */}
        <button
          className={styles.controlBtn}
          onClick={() => {
            animStateRef.current.cameraAngle.radius = THREE.MathUtils.clamp(
              animStateRef.current.cameraAngle.radius - 8,
              14,
              95
            );
            if (onInteractionStateChangeRef.current) {
              onInteractionStateChangeRef.current(true);
            }
          }}
          title="Zoom In (+)"
        >
          +
        </button>
        <button
          className={styles.controlBtn}
          onClick={() => {
            animStateRef.current.cameraAngle.radius = THREE.MathUtils.clamp(
              animStateRef.current.cameraAngle.radius + 8,
              14,
              95
            );
            if (onInteractionStateChangeRef.current) {
              onInteractionStateChangeRef.current(true);
            }
          }}
          title="Zoom Out (−)"
        >
          −
        </button>

        <div className={styles.divider} />

        {/* Toggle Orbit Trajectories */}
        <button
          className={`${styles.controlBtn} ${showOrbits ? styles.controlBtnActive : ''}`}
          onClick={() => setShowOrbits(!showOrbits)}
          title="Toggle Orbit Trajectory Lines"
        >
          Orbits
        </button>

        {/* Cinematic Space View / Dim Text Toggle */}
        <button
          className={`${styles.controlBtn} ${isTextDimmed ? styles.controlBtnActive : ''}`}
          onClick={() => {
            if (onInteractionStateChangeRef.current) {
              onInteractionStateChangeRef.current(!isTextDimmed);
            }
          }}
          title={isTextDimmed ? 'Restore Hero Text' : 'Fade Hero Text for Unobstructed View'}
        >
          {isTextDimmed ? '👁 Show Text' : '👁 Space View'}
        </button>

        {/* Reset Camera View button */}
        <button
          className={styles.controlBtn}
          onClick={handleResetCamera}
          title="Reset Camera to Solar System View"
        >
          ↺ Reset View
        </button>
      </div>
    </div>
  );
}
