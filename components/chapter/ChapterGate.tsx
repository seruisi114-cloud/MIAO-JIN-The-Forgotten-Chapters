"use client";

import { CSSProperties, useEffect, useMemo } from "react";
import { chapter01 } from "@/config/chapters";

type ChapterGateProps = {
  onMusicCue: () => Promise<void>;
  onComplete: () => void;
};

type GateDustStyle = CSSProperties & {
  "--gate-x": string;
  "--gate-y": string;
  "--gate-delay": string;
  "--gate-size": string;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function ChapterGate({ onMusicCue, onComplete }: ChapterGateProps) {
  const dust = useMemo(() => {
    const random = seededRandom(7190601);
    return Array.from({ length: 48 }, (_, index) => {
      const angle = random() * Math.PI * 2;
      const radius = 12 + random() * 44;
      return {
        id: index,
        style: {
          "--gate-x": `${Math.cos(angle) * radius}vw`,
          "--gate-y": `${Math.sin(angle) * radius}vh`,
          "--gate-delay": `${random() * 1.25}s`,
          "--gate-size": `${0.6 + random() * 1.3}px`,
        } as GateDustStyle,
      };
    });
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const musicTimer = window.setTimeout(() => void onMusicCue(), reducedMotion ? 220 : 2700);
    const completeTimer = window.setTimeout(onComplete, reducedMotion ? 950 : 5000);
    return () => {
      window.clearTimeout(musicTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete, onMusicCue]);

  return (
    <section className="chapter-gate" aria-label={`${chapter01.chapterLabel}正在开启`} role="status">
      <div className="chapter-gate-space" aria-hidden="true" />
      <div className="chapter-gate-light" aria-hidden="true"><i /><i /><i /></div>
      <div className="chapter-gate-dust" aria-hidden="true">
        {dust.map((particle) => <i key={particle.id} style={particle.style} />)}
      </div>
      <div className="chapter-gate-copy">
        <p>{chapter01.chapterLabel}</p>
        <span />
        <h1>《{chapter01.title}》</h1>
        <small>正在开启</small>
      </div>
    </section>
  );
}
