"use client";

import { CSSProperties, useEffect, useMemo, useRef } from "react";

type MoonFirefliesProps = {
  playing: boolean;
};

type FireflyStyle = CSSProperties & {
  "--firefly-x": string;
  "--firefly-y": string;
  "--firefly-size": string;
  "--firefly-delay": string;
  "--firefly-duration": string;
  "--firefly-drift-x": string;
  "--firefly-drift-y": string;
  "--firefly-push-x": string;
  "--firefly-push-y": string;
};

type Firefly = {
  id: number;
  x: number;
  y: number;
  tone: "moon" | "gold" | "blue";
  style: FireflyStyle;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function MoonFireflies({ playing }: MoonFirefliesProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const fireflies = useMemo<Firefly[]>(() => {
    const random = seededRandom(7192026);
    return Array.from({ length: 30 }, (_, id) => {
      const x = 27 + random() * 48;
      const y = 40 + random() * 34;
      const tone = id % 6 === 0 ? "blue" : id % 3 === 0 ? "gold" : "moon";
      return {
        id,
        x,
        y,
        tone,
        style: {
          "--firefly-x": `${x}%`,
          "--firefly-y": `${y}%`,
          "--firefly-size": `${2.8 + random() * 4.8}px`,
          "--firefly-delay": `${-random() * 12}s`,
          "--firefly-duration": `${8 + random() * 7}s`,
          "--firefly-drift-x": `${-10 + random() * 20}px`,
          "--firefly-drift-y": `${-8 - random() * 16}px`,
          "--firefly-push-x": "0px",
          "--firefly-push-y": "0px",
        },
      };
    });
  }, []);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const particles = Array.from(field.querySelectorAll<HTMLElement>(".moon-firefly"));
    const move = (event: PointerEvent) => {
      const rect = field.getBoundingClientRect();
      particles.forEach((particle, index) => {
        const firefly = fireflies[index];
        const particleX = rect.left + rect.width * firefly.x / 100;
        const particleY = rect.top + rect.height * firefly.y / 100;
        const dx = particleX - event.clientX;
        const dy = particleY - event.clientY;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const strength = Math.max(0, 1 - distance / 175) * 20;
        particle.style.setProperty("--firefly-push-x", `${dx / distance * strength}px`);
        particle.style.setProperty("--firefly-push-y", `${dy / distance * strength}px`);
      });
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [fireflies]);

  const connectionPairs = [[0, 4], [2, 7], [4, 9], [6, 12], [9, 14], [12, 17], [15, 19], [18, 23], [21, 27], [24, 29]];

  return (
    <div ref={fieldRef} className={`moon-fireflies${playing ? " is-playing" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {connectionPairs.map(([from, to]) => (
          <line key={`${from}-${to}`} x1={fireflies[from].x} y1={fireflies[from].y} x2={fireflies[to].x} y2={fireflies[to].y} />
        ))}
      </svg>
      {fireflies.map((firefly) => (
        <i key={firefly.id} className={`moon-firefly moon-firefly--${firefly.tone}`} style={firefly.style}>
          <span />
        </i>
      ))}
    </div>
  );
}
