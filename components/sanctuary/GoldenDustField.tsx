"use client";

import { useEffect, useRef } from "react";

type DustParticle = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
  drift: number;
  phase: number;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function GoldenDustField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const random = seededRandom(7192026);
    const pointer = { x: -1000, y: -1000 };
    let clickWave = { x: -1000, y: -1000, radius: 0, strength: 0 };
    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;
    let animationFrame = 0;
    let particles: DustParticle[] = [];

    const createParticles = () => {
      particles = Array.from({ length: reducedMotion ? 36 : 74 }, () => ({
        x: random() * width,
        y: random() * height,
        radius: 0.24 + random() * 0.66,
        alpha: 0.1 + random() * 0.24,
        speed: 0.035 + random() * 0.11,
        drift: (random() - 0.5) * 0.055,
        phase: random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    const onPointerDown = (event: PointerEvent) => {
      clickWave = { x: event.clientX, y: event.clientY, radius: 0, strength: 1 };
    };

    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      if (clickWave.strength > 0.005) {
        clickWave.radius += reducedMotion ? 5 : 9;
        clickWave.strength *= 0.955;
        context.beginPath();
        context.arc(clickWave.x, clickWave.y, clickWave.radius, 0, Math.PI * 2);
        context.strokeStyle = `rgba(218, 223, 232, ${clickWave.strength * 0.08})`;
        context.lineWidth = 0.7;
        context.stroke();
      }

      particles.forEach((particle) => {
        if (!reducedMotion) {
          particle.y -= particle.speed;
          particle.x += Math.sin(frame * 0.0028 + particle.phase) * 0.025 + particle.drift;
          const pointerX = particle.x - pointer.x;
          const pointerY = particle.y - pointer.y;
          const pointerDistance = Math.hypot(pointerX, pointerY);
          if (pointerDistance < 105 && pointerDistance > 0.1) {
            const force = (1 - pointerDistance / 105) * 0.22;
            particle.x += pointerX / pointerDistance * force;
            particle.y += pointerY / pointerDistance * force;
          }
          const waveX = particle.x - clickWave.x;
          const waveY = particle.y - clickWave.y;
          const waveDistance = Math.hypot(waveX, waveY);
          if (Math.abs(waveDistance - clickWave.radius) < 38 && waveDistance > 0.1) {
            const force = clickWave.strength * 1.6;
            particle.x += waveX / waveDistance * force;
            particle.y += waveY / waveDistance * force;
          }
        }
        if (particle.y < -8) particle.y = height + 8;
        if (particle.x < -8) particle.x = width + 8;
        if (particle.x > width + 8) particle.x = -8;

        const glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 4.5);
        glow.addColorStop(0, `rgba(214, 188, 126, ${particle.alpha})`);
        glow.addColorStop(0.28, `rgba(180, 150, 91, ${particle.alpha * 0.42})`);
        glow.addColorStop(1, "rgba(151, 123, 73, 0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * 4.5, 0, Math.PI * 2);
        context.fill();
      });

      context.globalCompositeOperation = "source-over";
      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return <canvas ref={canvasRef} className="golden-dust-field sanctuary-art-layer" aria-hidden="true" />;
}
