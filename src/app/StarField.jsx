'use client';

import { useEffect, useRef } from 'react';
import styles from './page.module.css';

/**
 * Animated star field background for the hero section.
 * Uses Canvas API for performant particle rendering.
 */
export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initStars();
    };

    const initStars = () => {
      const count = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 8000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.1,
        speed: Math.random() * 0.0005 + 0.0002,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.speed + star.phase) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${alpha})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    animationId = requestAnimationFrame(draw);

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.starfield} aria-hidden="true" />;
}
