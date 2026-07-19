"use client";

import gsap from "gsap";
import { CSSProperties, useLayoutEffect, useMemo, useRef } from "react";

type TitleRevealProps = {
  settled: boolean;
  exiting?: boolean;
  onEnter?: () => void;
};

type TitleDustStyle = CSSProperties & {
  "--title-dust-x": string;
  "--title-dust-y": string;
  "--title-dust-delay": string;
  "--title-dust-size": string;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function TitleReveal({ settled, exiting = false, onEnter }: TitleRevealProps) {
  const rootRef = useRef<HTMLElement>(null);
  const dust = useMemo(() => {
    const random = seededRandom(190719);
    return Array.from({ length: 58 }, (_, index) => ({
      id: index,
      style: {
        "--title-dust-x": `${(random() - 0.5) * 48}rem`,
        "--title-dust-y": `${(random() - 0.5) * 18}rem`,
        "--title-dust-delay": `${random() * 2.4}s`,
        "--title-dust-size": `${0.7 + random() * 1.35}px`,
      } as TitleDustStyle,
    }));
  }, []);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      const timeline = gsap.timeline();

      timeline.fromTo(
        ".title-name",
        { opacity: 0, y: 13, filter: "blur(15px)", letterSpacing: "0.72em" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          letterSpacing: "0.42em",
          duration: reducedMotion ? 0.5 : 3.4,
          ease: "power2.out",
        },
      );
      timeline.fromTo(
        ".title-ornament",
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 0.62, duration: reducedMotion ? 0.35 : 2.1, ease: "power1.inOut" },
        reducedMotion ? "<" : "<0.75",
      );
      timeline.fromTo(
        ".title-subtitle",
        { opacity: 0, y: 9, filter: "blur(9px)", letterSpacing: "0.34em" },
        { opacity: 1, y: 0, filter: "blur(0px)", letterSpacing: "0.24em", duration: reducedMotion ? 0.4 : 2.4, ease: "power1.out" },
        reducedMotion ? "<" : "<0.55",
      );
      timeline.fromTo(
        ".title-poem",
        { opacity: 0, y: 7, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: reducedMotion ? 0.4 : 2.2, ease: "power1.out" },
        reducedMotion ? "<" : "<0.85",
      );
    }, rootRef);

    return () => context.revert();
  }, []);

  useLayoutEffect(() => {
    if (!exiting || !rootRef.current) return;
    gsap.to(rootRef.current, {
      opacity: 0,
      scale: 1.018,
      filter: "blur(8px)",
      duration: 1.8,
      ease: "power1.inOut",
    });
  }, [exiting]);

  return (
    <section ref={rootRef} className={`title-reveal${settled ? " title-reveal--settled" : ""}`} aria-label="MIAO JIN — The Forgotten Chapters">
      <div className="title-dust" aria-hidden="true">
        {dust.map((particle) => (
          <i key={particle.id} style={particle.style} />
        ))}
      </div>
      <h1 className="title-name">MIAO JIN</h1>
      <span className="title-ornament" aria-hidden="true">
        <i />
      </span>
      <p className="title-subtitle">The Forgotten Chapters</p>
      <p className="title-poem">每一个旋律，都藏着一个被遗忘的梦。</p>
      {onEnter ? (
        <button className="sanctuary-enter" type="button" onClick={onEnter}>
          <span>进入星穹圣殿</span>
          <i aria-hidden="true" />
        </button>
      ) : null}
    </section>
  );
}
