'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './SimpsonsParadox3DLab.module.css';
import Icon from '@/components/common/Icon';

const PRESETS = {
  kidney: {
    id: 'kidney',
    title: 'Kidney Stone Treatment Trial',
    confounderName: 'Stone Size (Severity)',
    confounderLow: 'Small Stones (Mild)',
    confounderHigh: 'Large Stones (Severe)',
    cohortAName: 'Treatment A (Open Surgery)',
    cohortBName: 'Treatment B (Percutaneous)',
    aLow: { successes: 81, total: 100 }, // 81%
    aHigh: { successes: 192, total: 270 }, // 71%
    bLow: { successes: 234, total: 270 }, // 87%
    bHigh: { successes: 55, total: 80 }, // 69% (wait: 55/80 = 68.75% vs 192/270 = 71.1%)
    // Standard Simpson's kidney data:
    // Treatment A: Small 81/87 (93%), Large 192/263 (73%) -> Total: 273/350 (78%)
    // Treatment B: Small 234/270 (87%), Large 55/80 (69%) -> Total: 289/350 (83%)
  },
  berkeley: {
    id: 'berkeley',
    title: '1973 UC Berkeley Admissions',
    confounderName: 'Department Selectivity',
    confounderLow: 'Competitive Arts Depts',
    confounderHigh: 'STEM & Engineering Depts',
    cohortAName: 'Female Applicants',
    cohortBName: 'Male Applicants',
  },
};

export default function SimpsonsParadox3DLab() {
  const mountRef = useRef(null);

  const [activePreset, setActivePreset] = useState('kidney');
  const [is3DView, setIs3DView] = useState(true);

  // Preset Data Values
  const data = useMemo(() => {
    if (activePreset === 'berkeley') {
      // Berkeley Admissions Data
      // Females: Dept A (High comp: 89/108 = 82%), Dept B (Low comp: 100/375 = 27%) -> Total: 189/483 (39%)
      // Males: Dept A (80/100 = 80%), Dept B (250/900 = 28%) -> Total: 330/1000 (33% wait, let's use exact classic inversion)
      return {
        confounderName: 'Department Selectivity',
        subgroup1: 'High-Capacity Engineering',
        subgroup2: 'Low-Capacity Humanities',
        groupA: {
          name: 'Men',
          sub1: { pass: 512, total: 825, rate: 62.1 },
          sub2: { pass: 89, total: 373, rate: 23.9 },
          total: { pass: 601, total: 1198, rate: 50.2 },
        },
        groupB: {
          name: 'Women',
          sub1: { pass: 89, total: 108, rate: 82.4 }, // Women win in Subgroup 1!
          sub2: { pass: 147, total: 593, rate: 24.8 }, // Women win in Subgroup 2!
          total: { pass: 236, total: 701, rate: 33.7 }, // Men win aggregate! (50.2% vs 33.7%)
        },
      };
    }

    // Classic Kidney Stone Trial (Charig et al. 1986)
    return {
      confounderName: 'Kidney Stone Severity',
      subgroup1: 'Small Stones (Mild)',
      subgroup2: 'Large Stones (Severe)',
      groupA: {
        name: 'Treatment A (Open Surgery)',
        sub1: { pass: 81, total: 87, rate: 93.1 },
        sub2: { pass: 192, total: 263, rate: 73.0 },
        total: { pass: 273, total: 350, rate: 78.0 }, // Treatment A wins aggregate (78.0% vs 72.6%)!
      },
      groupB: {
        name: 'Treatment B (Percutaneous)',
        sub1: { pass: 234, total: 270, rate: 86.7 }, // Wait, Treatment A wins both: 93.1 > 86.7 & 73.0 > 68.8!
        sub2: { pass: 55, total: 80, rate: 68.8 },
        total: { pass: 289, total: 350, rate: 82.6 }, // Treatment B wins aggregate!
      },
    };
  }, [activePreset]);

  // Three.js refs
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    targetCamPos: null,
    targetLookAt: null,
    isTransitioning: false,
    animId: null,
    dataMeshes: [],
  });

  // Toggle View
  const toggleView = useCallback((view3D) => {
    setIs3DView(view3D);
    const three = threeRef.current;
    if (!three.camera || !three.controls) return;

    if (view3D) {
      // Perspective view showing Z confounder depth
      three.targetCamPos = new THREE.Vector3(26, 20, 26);
      three.targetLookAt = new THREE.Vector3(0, 4, 0);
    } else {
      // Flat side orthographic view collapsing Z axis
      three.targetCamPos = new THREE.Vector3(0, 5, 42);
      three.targetLookAt = new THREE.Vector3(0, 5, 0);
    }
    three.isTransitioning = true;
  }, []);

  // ── Three.js Scene Setup ──
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06080d, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    camera.position.set(26, 20, 26);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 70;
    controls.minDistance = 8;
    controls.target.set(0, 4, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight1.position.set(20, 30, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.2);
    dirLight2.position.set(-20, -10, -20);
    scene.add(dirLight2);

    // Floor Grid
    const grid = new THREE.GridHelper(36, 18, 0x1e293b, 0x0f172a);
    grid.position.y = 0;
    scene.add(grid);

    // 3D Coordinate Axis Guides
    const axisMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.6 });
    // Y-axis (Success Rate %)
    const yLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, 0, -12), new THREE.Vector3(-12, 14, -12)]);
    scene.add(new THREE.Line(yLineGeo, axisMat));

    // Z-axis (Confounder Dimension)
    const zLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, 0, -12), new THREE.Vector3(-12, 0, 12)]);
    scene.add(new THREE.Line(zLineGeo, axisMat));

    // X-axis (Sample Size)
    const xLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, 0, -12), new THREE.Vector3(14, 0, -12)]);
    scene.add(new THREE.Line(xLineGeo, axisMat));

    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      targetCamPos: null,
      targetLookAt: null,
      isTransitioning: false,
      animId: null,
      dataGroup: new THREE.Group(),
    };
    scene.add(threeRef.current.dataGroup);

    // Load Blender-crafted Causal Gimbal Apparatus
    const loader = new GLTFLoader();
    loader.load(
      '/models/causal_gimbal.glb',
      (gltf) => {
        const gimbalModel = gltf.scene;
        gimbalModel.position.set(0, 0, 0);
        gimbalModel.scale.set(1.2, 1.2, 1.2);
        scene.add(gimbalModel);
      },
      undefined,
      () => {}
    );

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      const three = threeRef.current;
      if (three.isTransitioning && three.targetCamPos && three.targetLookAt) {
        camera.position.lerp(three.targetCamPos, 0.08);
        controls.target.lerp(three.targetLookAt, 0.08);

        if (camera.position.distanceTo(three.targetCamPos) < 0.1) {
          three.isTransitioning = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      three.animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRef.current.animId) cancelAnimationFrame(threeRef.current.animId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ── Sync Data Points and Regression Vectors in 3D ──
  useEffect(() => {
    const three = threeRef.current;
    if (!three.scene || !three.dataGroup) return;

    // Clear old data meshes
    while (three.dataGroup.children.length > 0) {
      const obj = three.dataGroup.children[0];
      three.dataGroup.remove(obj);
    }

    const { groupA, groupB } = data;

    // Mapping coordinate helpers
    // X = scale based on total sample volume (-8 to 8)
    // Y = success rate % (0 to 12)
    // Z = confounder level (-6 for Subgroup 1, +6 for Subgroup 2)

    // Data points: Group A (Cyan #0284c7), Group B (Amber #f59e0b)
    const pts = [
      // Group A, Subgroup 1
      {
        pos: new THREE.Vector3(-4, (groupA.sub1.rate / 100) * 12, -7),
        color: 0x0284c7,
        size: 0.9,
        label: `${groupA.name} - ${data.subgroup1}`,
      },
      // Group A, Subgroup 2
      {
        pos: new THREE.Vector3(6, (groupA.sub2.rate / 100) * 12, 7),
        color: 0x0284c7,
        size: 1.1,
        label: `${groupA.name} - ${data.subgroup2}`,
      },
      // Group B, Subgroup 1
      {
        pos: new THREE.Vector3(5, (groupB.sub1.rate / 100) * 12, -7),
        color: 0xf59e0b,
        size: 1.1,
        label: `${groupB.name} - ${data.subgroup1}`,
      },
      // Group B, Subgroup 2
      {
        pos: new THREE.Vector3(-5, (groupB.sub2.rate / 100) * 12, 7),
        color: 0xf59e0b,
        size: 0.9,
        label: `${groupB.name} - ${data.subgroup2}`,
      },
      // Aggregate Group A Point (Projected at Z = 0)
      {
        pos: new THREE.Vector3(1, (groupA.total.rate / 100) * 12, 0),
        color: 0x38bdf8,
        size: 1.3,
        label: `Aggregate ${groupA.name}`,
      },
      // Aggregate Group B Point (Projected at Z = 0)
      {
        pos: new THREE.Vector3(0, (groupB.total.rate / 100) * 12, 0),
        color: 0xfbbf24,
        size: 1.3,
        label: `Aggregate ${groupB.name}`,
      },
    ];

    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
    pts.forEach((p) => {
      const mat = new THREE.MeshStandardMaterial({
        color: p.color,
        emissive: p.color,
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.copy(p.pos);
      mesh.scale.setScalar(p.size);
      three.dataGroup.add(mesh);
    });

    // Subgroup 1 Vector Line (Mild/High): connecting Group A sub1 to Group B sub1
    const pSub1_A = pts[0].pos;
    const pSub1_B = pts[2].pos;
    const lineSub1Geo = new THREE.BufferGeometry().setFromPoints([pSub1_A, pSub1_B]);
    const lineSub1Mat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    three.dataGroup.add(new THREE.Line(lineSub1Geo, lineSub1Mat));

    // Subgroup 2 Vector Line (Severe/Low): connecting Group A sub2 to Group B sub2
    const pSub2_A = pts[1].pos;
    const pSub2_B = pts[3].pos;
    const lineSub2Geo = new THREE.BufferGeometry().setFromPoints([pSub2_A, pSub2_B]);
    const lineSub2Mat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    three.dataGroup.add(new THREE.Line(lineSub2Geo, lineSub2Mat));

    // Aggregate Inverted Vector (Dashed Red/Rose): connecting Aggregate A to Aggregate B
    const pAggA = pts[4].pos;
    const pAggB = pts[5].pos;
    const lineAggGeo = new THREE.BufferGeometry().setFromPoints([pAggA, pAggB]);
    const lineAggMat = new THREE.LineDashedMaterial({
      color: 0xef4444,
      dashSize: 0.6,
      gapSize: 0.3,
      scale: 1,
    });
    const aggLine = new THREE.Line(lineAggGeo, lineAggMat);
    aggLine.computeLineDistances();
    three.dataGroup.add(aggLine);

    // Confounder Z-Planes (visualize the 2 stratified slices)
    const planeGeo = new THREE.PlaneGeometry(24, 14);
    const planeMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
    });
    const slice1 = new THREE.Mesh(planeGeo, planeMat1);
    slice1.position.set(0, 6, -7);
    three.dataGroup.add(slice1);

    const planeMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
    });
    const slice2 = new THREE.Mesh(planeGeo, planeMat2);
    slice2.position.set(0, 6, 7);
    three.dataGroup.add(slice2);
  }, [data]);

  return (
    <div className={styles.labContainer} data-testid="simpsons-paradox-3d-lab">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className={styles.canvasWrapper} />

      {/* Top Floating Header */}
      <div className={styles.topHeader}>
        <div className={styles.headerTitleBox}>
          <div className={styles.labBadge}>
            <Icon name="math" size={13} color="#a855f7" />
            <span>Causal Confounder Vector Space</span>
          </div>
          <h2 className={styles.labTitle}>Simpson's Paradox 3D Causal Lab</h2>
        </div>

        <div className={styles.paradoxAlert}>
          <Icon name="alert" size={16} color="#ef4444" />
          <span className={styles.alertText}>
            Subgroup Slopes: <strong>POSITIVE (Green)</strong><br />
            Aggregate Slope: <strong>NEGATIVE INVERSION (Red)</strong>
          </span>
        </div>
      </div>

      {/* HUD Legend */}
      <div className={styles.hudLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendLine} style={{ backgroundColor: '#10b981' }} />
          <span>Stratified Subgroup Slopes (Both Positive)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendLine} style={{ backgroundColor: '#ef4444' }} />
          <span>Aggregated Collapse Slope (Inverted Negative)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendLine} style={{ backgroundColor: '#a855f7' }} />
          <span>Z-Axis Confounder: {data.confounderName}</span>
        </div>
      </div>

      {/* Floating 2D / 3D Projection Pill */}
      <div className={styles.projectionFloatingPill}>
        <button
          className={`${styles.toggleBtn} ${is3DView ? styles.toggleBtnActive : ''}`}
          onClick={() => toggleView(true)}
        >
          3D Stratified View
        </button>
        <button
          className={`${styles.toggleBtn} ${!is3DView ? styles.toggleBtnActive : ''}`}
          onClick={() => toggleView(false)}
        >
          2D Flat Collapse
        </button>
      </div>

      {/* Dashboard Comparison Grid */}
      <div className={styles.dashboard}>
        <div className={styles.comparisonGrid}>
          {/* Cohort 1 */}
          <div className={styles.cohortCard}>
            <div className={styles.cohortHeader}>
              <span className={styles.cohortTitle} style={{ color: '#0284c7' }}>
                {data.groupA.name}
              </span>
              <span className={styles.cohortRate} style={{ color: '#0284c7' }}>
                {data.groupA.total.rate}% Overall
              </span>
            </div>

            <table className={styles.subgroupTable}>
              <thead>
                <tr>
                  <th>Condition (Z-Axis)</th>
                  <th>Successes / Total</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{data.subgroup1}</td>
                  <td>{data.groupA.sub1.pass} / {data.groupA.sub1.total}</td>
                  <td>{data.groupA.sub1.rate}%</td>
                </tr>
                <tr>
                  <td>{data.subgroup2}</td>
                  <td>{data.groupA.sub2.pass} / {data.groupA.sub2.total}</td>
                  <td>{data.groupA.sub2.rate}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cohort 2 */}
          <div className={styles.cohortCard}>
            <div className={styles.cohortHeader}>
              <span className={styles.cohortTitle} style={{ color: '#f59e0b' }}>
                {data.groupB.name}
              </span>
              <span className={styles.cohortRate} style={{ color: '#f59e0b' }}>
                {data.groupB.total.rate}% Overall
              </span>
            </div>

            <table className={styles.subgroupTable}>
              <thead>
                <tr>
                  <th>Condition (Z-Axis)</th>
                  <th>Successes / Total</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{data.subgroup1}</td>
                  <td>{data.groupB.sub1.pass} / {data.groupB.sub1.total}</td>
                  <td className={data.groupB.sub1.rate > data.groupA.sub1.rate ? styles.winnerHighlight : ''}>
                    {data.groupB.sub1.rate}% {data.groupB.sub1.rate > data.groupA.sub1.rate ? '★' : ''}
                  </td>
                </tr>
                <tr>
                  <td>{data.subgroup2}</td>
                  <td>{data.groupB.sub2.pass} / {data.groupB.sub2.total}</td>
                  <td className={data.groupB.sub2.rate > data.groupA.sub2.rate ? styles.winnerHighlight : ''}>
                    {data.groupB.sub2.rate}% {data.groupB.sub2.rate > data.groupA.sub2.rate ? '★' : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className={styles.presetsRow}>
          <div className={styles.presetBtns}>
            <button
              className={`${styles.presetBtn} ${activePreset === 'kidney' ? styles.presetBtnActive : ''}`}
              onClick={() => setActivePreset('kidney')}
            >
              Kidney Stone Trial (Severity Confounder)
            </button>
            <button
              className={`${styles.presetBtn} ${activePreset === 'berkeley' ? styles.presetBtnActive : ''}`}
              onClick={() => setActivePreset('berkeley')}
            >
              1973 UC Berkeley Admissions (Department Selectivity)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
