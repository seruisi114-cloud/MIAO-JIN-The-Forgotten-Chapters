"use client";

import { CSSProperties, useEffect, useMemo } from "react";
import { chapter01 } from "@/config/chapters";
import type { TransitionOrigin } from "./SacredTransitionOverlay";

type ChapterEntryTransitionProps = {
  stage: "approaching" | "portal";
  origin: TransitionOrigin;
  onPortalReached: () => void;
  onComplete: () => void;
};

type EntryParticleStyle = CSSProperties & {
  "--entry-angle": string;
  "--entry-distance": string;
  "--entry-delay": string;
  "--entry-size": string;
  "--entry-length": string;
};

type EntryStyle = CSSProperties & {
  "--entry-origin-x": string;
  "--entry-origin-y": string;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function ChapterEntryTransition({ stage, origin, onPortalReached, onComplete }: ChapterEntryTransitionProps) {
  const particles = useMemo(() => {
    const random = seededRandom(19060714);
    return Array.from({ length: 72 }, (_, index) => {
      const angle = random() * Math.PI * 2;
      return {
        id: index,
        style: {
          "--entry-angle": `${angle}rad`,
          "--entry-distance": `${28 + random() * 74}vmax`,
          "--entry-delay": `${0.38 + random() * 1.45}s`,
          "--entry-size": `${0.6 + random() * 1.8}px`,
          "--entry-length": `${0.8 + random() * 3.6}rem`,
        } as EntryParticleStyle,
      };
    });
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const portalTimer = window.setTimeout(onPortalReached, reducedMotion ? 720 : 2750);
    const completeTimer = window.setTimeout(onComplete, reducedMotion ? 1500 : 4600);
    return () => {
      window.clearTimeout(portalTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete, onPortalReached]);

  const style = {
    "--entry-origin-x": `${origin.x}%`,
    "--entry-origin-y": `${origin.y}%`,
  } as EntryStyle;

  return (
    <section className={`chapter-entry-transition chapter-entry-transition--${stage}`} style={style} aria-label={`正在进入《${chapter01.title}》`} role="status">
      <div className="chapter-entry-dim" aria-hidden="true" />
      <div className="chapter-entry-orbit" aria-hidden="true"><i /><i /><i /></div>
      <div className="chapter-entry-rush" aria-hidden="true">
        {particles.map((particle) => <i key={particle.id} style={particle.style} />)}
      </div>
      <div className="chapter-entry-portal" aria-hidden="true"><i /><i /><i /></div>
      <div className="chapter-entry-copy">
        <p>{chapter01.chapterLabel}</p>
        <span />
        <h1>《{chapter01.title}》</h1>
        <blockquote>
          {chapter01.poem.map((line) => <span key={line}>{line}</span>)}
        </blockquote>
        <small>正在进入《{chapter01.title}》……</small>
      </div>
    </section>
  );
}
