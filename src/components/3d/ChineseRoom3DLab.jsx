'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import styles from './ChineseRoom3DLab.module.css';
import Icon from '@/components/common/Icon';
import { recordConceptRun } from '@/lib/supabase/conceptRuns';

// Sound effects synthesizer
function playRoomSound(freq = 400, type = 'sine', duration = 0.08, volume = 0.1) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio context may require user gesture
  }
}

// Preset Queries
const SAMPLE_QUERIES = [
  {
    id: 'love',
    chinese: '你理解爱吗？',
    english: 'Do you understand love?',
    ruleMatched: 'IF tokens [0x4F60] + [0x7406] + [0x827E] THEN ASSEMBLE tokens [0x611F, 0x60C5, 0x795E, 0x7ECF]',
    responseChinese: '爱是多巴胺与神经递质的高阶映射。',
    responseEnglish: 'Love is a higher-order mapping of dopamine and neurotransmitters.',
  },
  {
    id: 'mind',
    chinese: '机器能拥有真正的意识吗？',
    english: 'Can machines possess true consciousness?',
    ruleMatched: 'IF tokens [0x673A] + [0x5668] + [0x610F] THEN ASSEMBLE tokens [0x8BED, 0x6CD5, 0x4E0D, 0x7B49]',
    responseChinese: '语法变换不等同于主观语义感知。',
    responseEnglish: 'Syntactic transformation is not equivalent to subjective semantic qualia.',
  },
  {
    id: 'autumn',
    chinese: '请写一首关于秋天的绝句。',
    english: 'Compose a classical quatrain on autumn.',
    ruleMatched: 'IF tokens [0x79CB] + [0x5929] + [0x8BD7] THEN ASSEMBLE stanza [0x843D, 0x53F6, 0x5BD2, 0x6C34]',
    responseChinese: '落叶随霜尽，寒江绕客愁。',
    responseEnglish: 'Fallen leaves vanish with frost; cold rivers wrap around traveler sorrow.',
  }
];

export default function ChineseRoom3DLab() {
  const mountRef = useRef(null);

  // ── State ──
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'perspective' | 'dilemma'
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [pipelineStep, setPipelineStep] = useState(0); // 0: Idle, 1: Slip inserted, 2: Book consulted, 3: Tiles fetched, 4: Output delivered
  const [perspective, setPerspective] = useState('inside'); // 'inside' (Syntax) | 'outside' (Semantics) | 'systems' (Whole Room)
  const [userVote, setUserVote] = useState(null);
  const [hasRecorded, setHasRecorded] = useState(false);

  // Telemetry ref
  const perspectiveRef = useRef('inside');
  const pipelineStepRef = useRef(0);

  useEffect(() => { perspectiveRef.current = perspective; }, [perspective]);
  useEffect(() => { pipelineStepRef.current = pipelineStep; }, [pipelineStep]);

  // Three.js object references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const querySlipMeshRef = useRef(null);
  const responseTrayMeshRef = useRef(null);
  const rulebookMeshRef = useRef(null);
  const neuralNetGroupRef = useRef(null);
  const bankerLampLightRef = useRef(null);

  // Current Query
  const currentQuery = SAMPLE_QUERIES[activeQueryIndex];

  // Pipeline Step Handler
  const advanceStep = useCallback(() => {
    setPipelineStep((prev) => {
      const next = (prev + 1) % 5;
      if (next === 1) playRoomSound(300, 'triangle', 0.15, 0.12); // Paper slip in
      if (next === 2) playRoomSound(440, 'sine', 0.1, 0.1);      // Book flip
      if (next === 3) playRoomSound(520, 'square', 0.08, 0.08);  // Tile clack
      if (next === 4) {
        playRoomSound(660, 'sine', 0.25, 0.15); // Output chime
        if (!hasRecorded) {
          setHasRecorded(true);
          recordConceptRun('chinese-room', {
            mode: 'thought-experiment',
            perspective: perspectiveRef.current,
            queryId: currentQuery.id
          }).catch(() => {});
        }
      }
      return next;
    });
  }, [currentQuery.id, hasRecorded]);

  const resetPipeline = useCallback(() => {
    setPipelineStep(0);
  }, []);

  // ── Initialize Three.js Scene ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 560;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0812);
    scene.fog = new THREE.FogExp2(0x0a0812, 0.032);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 10.5);
    camera.lookAt(0, 0.8, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Warm Banker's Lamp Light (Inside Room)
    const bankerLight = new THREE.SpotLight(0xfef08a, 4.5, 12, Math.PI / 4, 0.35, 1);
    bankerLight.position.set(-1.8, 3.2, 0);
    bankerLight.target.position.set(-1.8, 0.5, 0);
    scene.add(bankerLight);
    scene.add(bankerLight.target);
    bankerLampLightRef.current = bankerLight;

    // Cool Exterior Evaluator Light (Outside Room)
    const exteriorLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    exteriorLight.position.set(6, 6, 4);
    scene.add(exteriorLight);

    // Subtle Amber Rim
    const amberRim = new THREE.DirectionalLight(0xf59e0b, 0.8);
    amberRim.position.set(-6, 4, -4);
    scene.add(amberRim);

    // ── 4. Architecture: The Cutaway Room ──
    // Floor
    const floorGeo = new THREE.PlaneGeometry(16, 12);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x14111d, roughness: 0.65, metalness: 0.2 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.01;
    scene.add(floorMesh);

    // Dividing Soundproof Wall (Between Inside and Outside)
    const wallGeo = new THREE.BoxGeometry(0.5, 5, 8);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x241d30, roughness: 0.8, metalness: 0.1 });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0.6, 2.5, 0);
    scene.add(wallMesh);

    // Input Slot Frame (Left/Front)
    const slotFrameMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.3 });
    const inputSlotGeo = new THREE.BoxGeometry(0.6, 0.2, 1.2);
    const inputSlotMesh = new THREE.Mesh(inputSlotGeo, slotFrameMat);
    inputSlotMesh.position.set(0.6, 1.8, 1.8);
    scene.add(inputSlotMesh);

    // Output Slot Frame (Right/Back)
    const outputSlotGeo = new THREE.BoxGeometry(0.6, 0.2, 1.2);
    const outputSlotMesh = new THREE.Mesh(outputSlotGeo, slotFrameMat);
    outputSlotMesh.position.set(0.6, 1.8, -1.8);
    scene.add(outputSlotMesh);

    // ── 5. Inside the Room Furnishings ──
    // Mahogany Desk
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x3d2013, roughness: 0.5, metalness: 0.1 });
    const deskTopGeo = new THREE.BoxGeometry(3.2, 0.12, 1.8);
    const deskTopMesh = new THREE.Mesh(deskTopGeo, deskMat);
    deskTopMesh.position.set(-1.8, 1.2, 0);
    scene.add(deskTopMesh);

    // Desk Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2);
    const legPositions = [
      [-3.2, 0.6, -0.7],
      [-0.4, 0.6, -0.7],
      [-3.2, 0.6, 0.7],
      [-0.4, 0.6, 0.7]
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, deskMat);
      leg.position.set(lx, ly, lz);
      scene.add(leg);
    });

    // Brass Banker's Lamp
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 });
    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), brassMat);
    lampStem.position.set(-2.6, 1.5, -0.4);
    scene.add(lampStem);

    const shadeMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3, metalness: 0.4 });
    const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 0.18, 16), shadeMat);
    lampShade.rotation.z = Math.PI / 2;
    lampShade.position.set(-2.6, 1.8, -0.4);
    scene.add(lampShade);

    // Rulebooks Shelf (Giant English Rules for Symbol Transformation)
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 0.7 });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.4, 0.6), shelfMat);
    shelf.position.set(-4.6, 1.7, 0);
    scene.add(shelf);

    // Book bindings on shelf
    const bookColors = [0xb91c1c, 0x1d4ed8, 0x047857, 0x7c3aed, 0xb45309];
    for (let b = 0; b < 12; b++) {
      const bMat = new THREE.MeshStandardMaterial({ color: bookColors[b % bookColors.length], roughness: 0.6 });
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, 0.45), bMat);
      book.position.set(-4.6 + (b % 4) * 0.2 - 0.3, 0.6 + Math.floor(b / 4) * 1.0, 0);
      scene.add(book);
    }

    // Open Rulebook on desk
    const openBookMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });
    const openBook = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.05, 0.5), openBookMat);
    openBook.position.set(-1.8, 1.28, -0.2);
    scene.add(openBook);
    rulebookMeshRef.current = openBook;

    // Filing Cabinets (Chinese Character Baskets / Memory)
    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x4a3b32, roughness: 0.6, metalness: 0.2 });
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 2.4), cabinetMat);
    cabinet.position.set(-3.2, 1.1, -2.8);
    scene.add(cabinet);

    // ── 6. Interactive Paper Slip (Incoming Query) ──
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
    const querySlip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.75), paperMat);
    querySlip.position.set(0.6, 1.8, 1.8);
    scene.add(querySlip);
    querySlipMeshRef.current = querySlip;

    // ── 7. Interactive Response Output Tray (Outgoing Answers) ──
    const trayMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });
    const responseTray = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.9), trayMat);
    responseTray.position.set(0.6, 1.8, -1.8);
    scene.add(responseTray);
    responseTrayMeshRef.current = responseTray;

    // ── 8. Systems Reply: Holographic Neural / CPU Net ──
    const neuralGroup = new THREE.Group();
    scene.add(neuralGroup);
    neuralNetGroupRef.current = neuralGroup;

    // Build holographic wireframe links interconnecting the room components
    const netPoints = [
      new THREE.Vector3(0.6, 1.8, 1.8),   // Input slot
      new THREE.Vector3(-1.8, 1.3, 0),    // Desk / CPU
      new THREE.Vector3(-4.6, 2.0, 0),    // Rulebook / Program
      new THREE.Vector3(-3.2, 1.1, -2.8), // Cabinet / Memory
      new THREE.Vector3(0.6, 1.8, -1.8)   // Output slot
    ];
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints(netPoints);
    const netLine = new THREE.Line(lineGeo, lineMat);
    neuralGroup.add(netLine);

    // Floating particles along network
    const netParticleGeo = new THREE.BufferGeometry();
    const netCount = 40;
    const netPos = new Float32Array(netCount * 3);
    for (let i = 0; i < netCount * 3; i += 3) {
      netPos[i] = -4.5 + Math.random() * 5.5;
      netPos[i + 1] = 0.5 + Math.random() * 2.8;
      netPos[i + 2] = -3 + Math.random() * 5;
    }
    netParticleGeo.setAttribute('position', new THREE.BufferAttribute(netPos, 3));
    const netParticleMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.1, transparent: true, opacity: 0.8 });
    neuralGroup.add(new THREE.Points(netParticleGeo, netParticleMat));

    // ── Resize Observer ──
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ── Animation Loop ──
    let animationFrameId;
    const targetCameraPos = new THREE.Vector3();
    const targetCameraLookAt = new THREE.Vector3();

    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);

      // Camera Perspective Blending
      const currentPersp = perspectiveRef.current;
      if (currentPersp === 'inside') {
        // Operator view inside the room
        targetCameraPos.set(-2.2, 2.5, 4.2);
        targetCameraLookAt.set(-2.0, 1.2, 0);
      } else if (currentPersp === 'outside') {
        // Outside Chinese scholar view
        targetCameraPos.set(4.2, 2.8, 3.8);
        targetCameraLookAt.set(0.6, 1.8, 0);
      } else {
        // Systems View (Grand cutaway angle)
        targetCameraPos.set(0, 5.5, 10.5);
        targetCameraLookAt.set(-1.0, 1.5, 0);
      }

      camera.position.lerp(targetCameraPos, 0.04);
      camera.lookAt(targetCameraLookAt);

      // Pipeline Animation
      const step = pipelineStepRef.current;
      if (querySlipMeshRef.current) {
        if (step === 0) {
          querySlipMeshRef.current.position.set(1.5, 2.0, 1.8);
        } else if (step === 1) {
          // Slide in through slot onto desk
          querySlipMeshRef.current.position.lerp(new THREE.Vector3(-1.4, 1.28, 0.3), 0.08);
        } else {
          querySlipMeshRef.current.position.set(-1.4, 1.28, 0.3);
        }
      }

      if (responseTrayMeshRef.current) {
        if (step < 3) {
          responseTrayMeshRef.current.position.set(-1.8, 1.28, -0.4);
        } else if (step === 3) {
          // Assembled tiles waiting on desk
          responseTrayMeshRef.current.position.lerp(new THREE.Vector3(-1.0, 1.4, -1.0), 0.08);
        } else if (step === 4) {
          // Slide out through output slot
          responseTrayMeshRef.current.position.lerp(new THREE.Vector3(1.8, 1.8, -1.8), 0.08);
        }
      }

      // Pulse neural net in systems mode
      if (neuralNetGroupRef.current) {
        neuralNetGroupRef.current.visible = (currentPersp === 'systems');
        if (currentPersp === 'systems') {
          neuralNetGroupRef.current.rotation.y = Math.sin(time * 0.001) * 0.05;
        }
      }

      // Banker lamp subtle filament flicker
      if (bankerLampLightRef.current) {
        bankerLampLightRef.current.intensity = 4.3 + Math.sin(time * 0.01) * 0.15;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className={styles.labContainer}
      aria-label="The Chinese Room 3D Interactive Lab"
      data-testid="chinese-room-3d-lab"
    >
      {/* Canvas Area */}
      <div className={styles.canvasContainer}>
        <div ref={mountRef} className={styles.canvasWrapper} />

        {/* Top HUD */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.labBadge}>
              <Icon name="cpu" size={13} />
              John Searle&apos;s 1980 Epistemic Test
            </div>
            <h2 className={styles.labTitle}>The Chinese Room</h2>
          </div>

          <div className={styles.statsCluster}>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Internal Understanding</span>
              <span className={`${styles.statValue} ${styles.statValueRed}`}>0% (Pure Syntax)</span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>External Comprehension</span>
              <span className={`${styles.statValue} ${styles.statValueGold}`}>100% (Passed Turing Test)</span>
            </div>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>Pipeline Stage</span>
              <span className={`${styles.statValue} ${styles.statValueCyan}`}>Step {pipelineStep} / 4</span>
            </div>
          </div>
        </div>

        {/* Perspective Badge */}
        <div className={styles.perspectiveBadge}>
          <Icon name="eye" size={13} />
          {perspective === 'inside'
            ? 'Operator Perspective: Pure Syntax (S₁ → S₂)'
            : perspective === 'outside'
            ? 'External Evaluator: Apparent Semantics (Fluency)'
            : 'The Systems Reply: Integrated Architecture'}
        </div>

        {/* Pipeline Step HUD */}
        <div className={styles.pipelineHUD}>
          <div className={styles.pipelineStepInfo}>
            <div className={styles.pipelineStepTitle}>
              <Icon name="chevron-right" size={14} />
              {pipelineStep === 0 && 'Ready: Query Prepared Outside'}
              {pipelineStep === 1 && 'Step 1: Chinese Query Slipped Into Room'}
              {pipelineStep === 2 && 'Step 2: Operator Consults English Rulebook'}
              {pipelineStep === 3 && 'Step 3: Character Tiles Retrieved From Cabinet'}
              {pipelineStep === 4 && 'Step 4: Output Delivered Outside (Turing Pass)'}
            </div>
            <div className={styles.pipelineStepDesc}>
              {pipelineStep === 0 && `Question outside: "${currentQuery.chinese}" (${currentQuery.english})`}
              {pipelineStep === 1 && 'The operator receives unfamiliar squiggles. To him, they are meaningless shapes.'}
              {pipelineStep === 2 && currentQuery.ruleMatched}
              {pipelineStep === 3 && 'The operator mechanically matches tiles without knowing the English definition of either word.'}
              {pipelineStep === 4 && `Result: "${currentQuery.responseChinese}" (${currentQuery.responseEnglish})`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={advanceStep}
              aria-label="Advance Pipeline Step"
            >
              <Icon name="play" size={14} />
              {pipelineStep === 4 ? 'Loop Next Query' : 'Advance Next Step'}
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={resetPipeline}
              aria-label="Reset Pipeline"
            >
              <Icon name="refresh" size={14} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Primary Control Deck */}
      <div className={styles.controlDeck}>
        {/* Navigation Tabs */}
        <div className={styles.tabsRow} role="tablist">
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'pipeline' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('pipeline')}
            role="tab"
            aria-selected={activeTab === 'pipeline'}
          >
            <Icon name="play" size={14} />
            1. The Translation Pipeline
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'perspective' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('perspective')}
            role="tab"
            aria-selected={activeTab === 'perspective'}
          >
            <Icon name="eye" size={14} />
            2. Syntax vs Semantics Perspectives
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'dilemma' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('dilemma')}
            role="tab"
            aria-selected={activeTab === 'dilemma'}
          >
            <Icon name="award" size={14} />
            3. The Fatal Question (Poll)
          </button>
        </div>

        {/* Tab 1: Translation Pipeline */}
        {activeTab === 'pipeline' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Select Question Slip to Feed Room</span>
                <span className={styles.cardSubtitle}>Real Chinese Colloquialisms</span>
              </div>
              <div className={styles.queryList}>
                {SAMPLE_QUERIES.map((q, idx) => (
                  <button
                    key={q.id}
                    type="button"
                    className={`${styles.queryBtn} ${activeQueryIndex === idx ? styles.queryBtnActive : ''}`}
                    onClick={() => {
                      setActiveQueryIndex(idx);
                      setPipelineStep(0);
                    }}
                  >
                    <span className={styles.queryText}>{q.chinese}</span>
                    <span className={styles.queryTranslation}>{q.english}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Searle&apos;s Core Epistemic Argument</span>
                <span className={styles.cardSubtitle}>Why Software Cannot Consciously Understand</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0 }}>
                  <strong>Premise 1:</strong> Digital computer programs are purely formal and syntactic (symbol manipulations based on rules).
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Premise 2:</strong> Human conscious minds have genuine semantic contents (subjective meaning and understanding).
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Conclusion:</strong> Syntax alone is neither constitutive of nor sufficient for semantics. Therefore, <em>Strong AI is false</em>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Perspectives Toggle */}
        {activeTab === 'perspective' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Switch Camera Perspective</span>
                <span className={styles.cardSubtitle}>Inspect the Phenomenological Divide</span>
              </div>
              <div className={styles.actionRow}>
                <button
                  type="button"
                  className={`${styles.secondaryBtn} ${perspective === 'inside' ? styles.primaryBtn : ''}`}
                  onClick={() => setPerspective('inside')}
                >
                  <Icon name="user" size={14} />
                  Inside Room (Operator: Pure Syntax)
                </button>
                <button
                  type="button"
                  className={`${styles.secondaryBtn} ${perspective === 'outside' ? styles.primaryBtn : ''}`}
                  onClick={() => setPerspective('outside')}
                >
                  <Icon name="globe" size={14} />
                  Outside Room (Evaluator: Semantics)
                </button>
                <button
                  type="button"
                  className={`${styles.secondaryBtn} ${perspective === 'systems' ? styles.primaryBtn : ''}`}
                  onClick={() => setPerspective('systems')}
                >
                  <Icon name="cpu" size={14} />
                  Systems View (Whole Room as Computer)
                </button>
              </div>
            </div>

            <div className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span>Perspective Analysis</span>
                <span className={styles.cardSubtitle}>
                  {perspective === 'inside' ? 'The Internal Disconnect' : perspective === 'outside' ? 'The Behavioral Illusion' : 'The Functionalist Counter'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
                {perspective === 'inside' && (
                  <p style={{ margin: 0 }}>
                    Inside the room, the human operator has no awareness of Chinese grammar or vocabulary. To him, the symbols are merely geometric shapes. The entire calculation is mechanical symbol-shuffling without comprehension.
                  </p>
                )}
                {perspective === 'outside' && (
                  <p style={{ margin: 0 }}>
                    From the exterior, the answers are sublime, witty, and poetically insightful. Any external observer would swear a sentient Chinese philosopher lives inside the room.
                  </p>
                )}
                {perspective === 'systems' && (
                  <p style={{ margin: 0 }}>
                    <strong>The Systems Reply:</strong> Critics argue that while the operator alone does not understand Chinese, the entire system—operator, rulebook, cabinet, and input/output slots combined—does understand.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Dilemma & Interactive Poll */}
        {activeTab === 'dilemma' && (
          <div className={styles.controlsGrid}>
            <div className={styles.controlCard} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.cardHeader}>
                <span>Does the Chinese Room genuinely understand Chinese?</span>
                <span className={styles.cardSubtitle}>Cast your philosophical vote</span>
              </div>
              <div className={styles.pollGrid}>
                <div
                  className={`${styles.pollCard} ${userVote === 'searle' ? styles.pollCardSelected : ''}`}
                  onClick={() => setUserVote('searle')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.pollTitle}>No: Syntax ≠ Semantics (John Searle)</div>
                  <div className={styles.pollDesc}>
                    Manipulating tokens without intentional grounding can never yield genuine understanding. Minds require biological causal powers.
                  </div>
                  <div className={styles.pollPct}>54% Consensus</div>
                </div>

                <div
                  className={`${styles.pollCard} ${userVote === 'systems' ? styles.pollCardSelected : ''}`}
                  onClick={() => setUserVote('systems')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.pollTitle}>Yes: The Systems Reply (Functionalism)</div>
                  <div className={styles.pollDesc}>
                    The operator is just the CPU; the rulebook is the program; the room is the mind. The integrated system understands.
                  </div>
                  <div className={styles.pollPct}>31% Consensus</div>
                </div>

                <div
                  className={`${styles.pollCard} ${userVote === 'robot' ? styles.pollCardSelected : ''}`}
                  onClick={() => setUserVote('robot')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.pollTitle}>Only With Embodiment (The Robot Reply)</div>
                  <div className={styles.pollDesc}>
                    Symbols only gain meaning when linked to physical sensory cameras, microphones, and robotic motors interacting with the real world.
                  </div>
                  <div className={styles.pollPct}>11% Consensus</div>
                </div>

                <div
                  className={`${styles.pollCard} ${userVote === 'illusion' ? styles.pollCardSelected : ''}`}
                  onClick={() => setUserVote('illusion')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.pollTitle}>Understanding Is an Illusion (Dennett)</div>
                  <div className={styles.pollDesc}>
                    Human understanding is also just trillions of non-understanding neurons shuffling electrochemical signals.
                  </div>
                  <div className={styles.pollPct}>4% Consensus</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
