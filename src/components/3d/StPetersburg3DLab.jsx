'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './StPetersburg3DLab.module.css';
import Icon from '@/components/common/Icon';

export default function StPetersburg3DLab() {
  const mountRef = useRef(null);

  // Game state
  const [streak, setStreak] = useState(0);
  const [payout, setPayout] = useState(2);
  const [isFlipping, setIsFlipping] = useState(false);
  const [lastOutcome, setLastOutcome] = useState(null); // 'HEADS' | 'TAILS' | null
  const [isGameOver, setIsGameOver] = useState(false);

  // Monte Carlo batch simulation stats
  const [batchStats, setBatchStats] = useState(null);

  // Three.js refs
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    coinMesh: null,
    towerGroup: null,
    isAnimatingFlip: false,
    flipProgress: 0,
    flipTargetOutcome: 'HEADS',
    animId: null,
  });

  // Start new single-player game
  const resetGame = useCallback(() => {
    setStreak(0);
    setPayout(2);
    setLastOutcome(null);
    setIsGameOver(false);

    const three = threeRef.current;
    if (three.towerGroup) {
      while (three.towerGroup.children.length > 0) {
        three.towerGroup.remove(three.towerGroup.children[0]);
      }
    }
  }, []);

  // Single Coin Flip
  const flipCoin = useCallback(() => {
    if (isFlipping || isGameOver) return;

    setIsFlipping(true);
    const isHeads = Math.random() < 0.5;
    const outcome = isHeads ? 'HEADS' : 'TAILS';

    const three = threeRef.current;
    three.flipProgress = 0;
    three.flipTargetOutcome = outcome;
    three.isAnimatingFlip = true;

    setTimeout(() => {
      setIsFlipping(false);
      setLastOutcome(outcome);

      if (isHeads) {
        const nextStreak = streak + 1;
        const nextPayout = Math.pow(2, nextStreak + 1);
        setStreak(nextStreak);
        setPayout(nextPayout);

        // Add block to 3D payout tower
        if (three.towerGroup) {
          const blockHeight = 0.8;
          const blockGeo = new THREE.BoxGeometry(2.2, blockHeight, 2.2);
          const blockMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.45,
            metalness: 0.8,
            roughness: 0.2,
          });
          const block = new THREE.Mesh(blockGeo, blockMat);
          block.position.set(5, nextStreak * blockHeight - blockHeight / 2, 0);
          three.towerGroup.add(block);
        }
      } else {
        setIsGameOver(true);
      }
    }, 900);
  }, [isFlipping, isGameOver, streak]);

  // Run 1,000 Trial Monte Carlo Batch
  const runBatchSimulation = useCallback(() => {
    const trials = 1000;
    let totalWinnings = 0;
    let maxStreak = 0;
    const payouts = [];

    for (let i = 0; i < trials; i++) {
      let currentStreak = 0;
      while (Math.random() < 0.5 && currentStreak < 45) {
        currentStreak++;
      }
      if (currentStreak > maxStreak) maxStreak = currentStreak;

      const trialPayout = Math.pow(2, currentStreak + 1);
      totalWinnings += trialPayout;
      payouts.push(trialPayout);
    }

    payouts.sort((a, b) => a - b);
    const medianPayout = payouts[Math.floor(trials / 2)];
    const meanPayout = Math.round(totalWinnings / trials);

    setBatchStats({
      trials,
      maxStreak,
      meanPayout,
      medianPayout,
      totalWinnings,
      lossAt25Ticket: Math.round(trials * 25 - totalWinnings),
    });
  }, []);

  // ── Three.js Scene Setup ──
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080704, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    camera.position.set(16, 15, 20);

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
    controls.maxDistance = 50;
    controls.minDistance = 6;
    controls.target.set(2, 3, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xf59e0b, 2.0);
    dirLight1.position.set(10, 25, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xfde047, 1.2);
    dirLight2.position.set(-10, -5, -10);
    scene.add(dirLight2);

    // Stage Grid & Pedestal
    const grid = new THREE.GridHelper(26, 14, 0x78350f, 0x292524);
    grid.position.y = 0;
    scene.add(grid);

    // Casino Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(3.5, 4.0, 0.6, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4, metalness: 0.8 });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(-3, 0.3, 0);
    scene.add(pedestal);

    // Golden Coin Mesh
    const coinGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.22, 36);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.2,
      metalness: 0.95,
      roughness: 0.15,
    });
    const coinMesh = new THREE.Mesh(coinGeo, coinMat);
    coinMesh.position.set(-3, 0.72, 0);
    scene.add(coinMesh);

    // Tower Group
    const towerGroup = new THREE.Group();
    scene.add(towerGroup);

    // Load Blender-crafted St. Petersburg Coin Model
    const loader = new GLTFLoader();
    loader.load(
      '/models/st_petersburg_coin.glb',
      (gltf) => {
        const model = gltf.scene;
        model.position.set(-3, 0.72, 0);
        model.scale.set(1.0, 1.0, 1.0);
        scene.remove(coinMesh);
        scene.remove(pedestal);
        scene.add(model);
        threeRef.current.coinMesh = model;
      },
      undefined,
      () => {
        // Keeps procedural fallback
      }
    );

    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      coinMesh,
      towerGroup,
      isAnimatingFlip: false,
      flipProgress: 0,
      flipTargetOutcome: 'HEADS',
      animId: null,
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
      controls.update();

      const three = threeRef.current;
      if (three.isAnimatingFlip && three.coinMesh) {
        three.flipProgress += 0.035;

        // Upward parabolic vault
        const jumpHeight = Math.sin(three.flipProgress * Math.PI) * 5.0;
        three.coinMesh.position.y = 0.72 + jumpHeight;

        // Rapid coin rotation
        three.coinMesh.rotation.x += 0.35;
        three.coinMesh.rotation.z += 0.15;

        if (three.flipProgress >= 1.0) {
          three.isAnimatingFlip = false;
          three.coinMesh.position.y = 0.72;
          three.coinMesh.rotation.set(three.flipTargetOutcome === 'HEADS' ? 0 : Math.PI, 0, 0);
        }
      }

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

  return (
    <div className={styles.labContainer} data-testid="st-petersburg-3d-lab">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className={styles.canvasWrapper} />

      {/* Top Floating Header */}
      <div className={styles.topHeader}>
        <div className={styles.headerTitleBox}>
          <div className={styles.labBadge}>
            <Icon name="trophy" size={13} color="#f59e0b" />
            <span>Geometric Progression Casino</span>
          </div>
          <h2 className={styles.labTitle}>St. Petersburg Paradox 3D Lab</h2>
        </div>

        <div className={styles.payoutDisplay}>
          <span className={styles.payoutLabel}>Current Round Payout</span>
          <span className={styles.payoutValue}>${payout.toLocaleString()}</span>
        </div>
      </div>

      {/* Streak HUD */}
      <div className={styles.streakHud}>
        <span className={styles.streakLabel}>Consecutive Heads Streak</span>
        <span className={styles.streakValue}>{streak} FLIPS (2^{streak + 1})</span>
      </div>

      {/* Interactive Action Overlay */}
      <div className={styles.coinActionOverlay}>
        <div className={styles.actionButtonGroup}>
          {!isGameOver ? (
            <button
              className={styles.flipBtn}
              onClick={flipCoin}
              disabled={isFlipping}
            >
              <Icon name="rotate-ccw" size={16} />
              <span>{isFlipping ? 'Flipping...' : streak === 0 ? 'Start Game (Flip Coin)' : 'Continue Streak (Flip Again)'}</span>
            </button>
          ) : (
            <button className={styles.flipBtn} onClick={resetGame}>
              <Icon name="refresh" size={16} />
              <span>Game Over · Final Payout: ${payout} · Play Again</span>
            </button>
          )}

          <button
            className={styles.secondaryActionBtn}
            onClick={runBatchSimulation}
            disabled={isFlipping}
          >
            <Icon name="zap" size={14} color="#f59e0b" />
            <span>Run 1,000-Trial Monte Carlo</span>
          </button>
        </div>
      </div>

      {/* Dashboard Comparison Grid */}
      <div className={styles.dashboard}>
        <div className={styles.mathComparisonGrid}>
          {/* Card 1: Linear Expected Value */}
          <div className={styles.mathCard}>
            <span className={styles.mathCardTitle} style={{ color: '#ef4444' }}>
              Theoretical Expected Return E(X)
            </span>
            <span className={styles.mathCardValue} style={{ color: '#ef4444' }}>
              +∞ (Infinite Dollars)
            </span>
            <p className={styles.mathCardDesc}>
              Sum of infinite terms (1/2·$2 + 1/4·$4 + 1/8·$8...) = 1 + 1 + 1... diverges to infinity. Classical theory says pay any price!
            </p>
          </div>

          {/* Card 2: Bernoulli Logarithmic Utility */}
          <div className={styles.mathCard}>
            <span className={styles.mathCardTitle} style={{ color: '#10b981' }}>
              Daniel Bernoulli's Utility U = ln(W)
            </span>
            <span className={styles.mathCardValue} style={{ color: '#10b981' }}>
              ~$20 - $25 Willingness to Pay
            </span>
            <p className={styles.mathCardDesc}>
              Accounting for diminishing marginal returns on wealth resolves the paradox and matches real-world human rationality.
            </p>
          </div>

          {/* Card 3: Global Bankroll Bound */}
          <div className={styles.mathCard}>
            <span className={styles.mathCardTitle} style={{ color: '#38bdf8' }}>
              Global Liquid Wealth Cap ($100T)
            </span>
            <span className={styles.mathCardValue} style={{ color: '#38bdf8' }}>
              ~$47 Max Real Expectation
            </span>
            <p className={styles.mathCardDesc}>
              No casino has infinite wealth. The casino goes bankrupt after 47 heads, collapsing theoretical infinity to $47.
            </p>
          </div>
        </div>

        {/* Monte Carlo Results Display */}
        {batchStats && (
          <div className={styles.batchSummaryRow}>
            <div className={styles.batchStat}>
              <span className={styles.batchStatLabel}>Simulated Games</span>
              <span className={styles.batchStatVal}>{batchStats.trials.toLocaleString()}</span>
            </div>

            <div className={styles.batchStat}>
              <span className={styles.batchStatLabel}>Longest Streak</span>
              <span className={styles.batchStatVal}>{batchStats.maxStreak} Heads</span>
            </div>

            <div className={styles.batchStat}>
              <span className={styles.batchStatLabel}>Mean Payout</span>
              <span className={styles.batchStatVal}>${batchStats.meanPayout}</span>
            </div>

            <div className={styles.batchStat}>
              <span className={styles.batchStatLabel}>Median Payout</span>
              <span className={styles.batchStatVal}>${batchStats.medianPayout}</span>
            </div>

            <div className={styles.batchStat}>
              <span className={styles.batchStatLabel}>Net Loss if Ticket = $25</span>
              <span className={styles.batchStatVal} style={{ color: '#f87171' }}>
                -${batchStats.lossAt25Ticket.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
