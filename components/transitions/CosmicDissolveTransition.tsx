"use client";

import { CSSProperties, useEffect, useMemo } from "react";
import { chapter01 } from "@/config/chapters";

export type TransitionOrigin = {
  x: number;
  y: number;
};

type CosmicDissolveMode = "entering" | "forming" | "returning";

type CosmicDissolveTransitionProps = {
  mode: CosmicDissolveMode;
  origin: TransitionOrigin;
  onCovered?: () => void;
  onComplete?: () => void;
};

type DissolveStyle = CSSProperties & {
  "--dissolve-origin-x": string;
  "--dissolve-origin-y": string;
};

type DustStyle = CSSProperties & {
  "--dissolve-angle": string;
  "--dissolve-distance": string;
  "--dissolve-delay": string;
  "--dissolve-duration": string;
  "--dissolve-size": string;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function CosmicDissolveTransition({
  mode,
  origin,
  onCovered,
  onComplete,
}: CosmicDissolveTransitionProps) {
  const dust = useMemo(() => {
    const random = seededRandom(260724);

    return Array.from({ length: 56 }, (_, id) => ({
      id,
      tone: id % 7 === 0 ? "moon" : id % 3 === 0 ? "blue" : "gold",
      style: {
        "--dissolve-angle": `${random() * 360}deg`,
        "--dissolve-distance": `${18 + random() * 68}vmax`,
        "--dissolve-delay": `${random() * 0.46}s`,
        "--dissolve-duration": `${0.86 + random() * 0.56}s`,
        "--dissolve-size": `${0.7 + random() * 2.2}px`,
      } as DustStyle,
    }));
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (mode === "entering" && onCovered) {
      const timer = window.setTimeout(onCovered, reducedMotion ? 360 : 1320);
      return () => window.clearTimeout(timer);
    }

    if (mode === "forming" && onComplete) {
      const timer = window.setTimeout(onComplete, reducedMotion ? 420 : 1280);
      return () => window.clearTimeout(timer);
    }
  }, [mode, onComplete, onCovered]);

  const style = {
    "--dissolve-origin-x": `${origin.x}%`,
    "--dissolve-origin-y": `${origin.y}%`,
  } as DissolveStyle;

  return (
    <section
      className={`cosmic-dissolve cosmic-dissolve--${mode}`}
      style={style}
      aria-label={mode === "returning" ? "正在返回星穹圣殿" : `正在进入《${chapter01.title}》`}
      role="status"
    >
      <div className="cosmic-dissolve__veil" aria-hidden="true" />
      <div className="cosmic-dissolve__core" aria-hidden="true"><i /><i /></div>
      <div className="cosmic-dissolve__dust" aria-hidden="true">
        {dust.map((particle) => (
          <i
            key={particle.id}
            className={`cosmic-dissolve__particle cosmic-dissolve__particle--${particle.tone}`}
            style={particle.style}
          />
        ))}
      </div>
      {mode !== "returning" ? (
        <div className="cosmic-dissolve__copy">
          <p>{chapter01.chapterLabel}</p>
          <span />
          <h1>《{chapter01.title}》</h1>
          <small>{mode === "forming" ? "星尘正在重塑梦境" : "正在开启篇章"}</small>
        </div>
      ) : null}
    </section>
  );
}
