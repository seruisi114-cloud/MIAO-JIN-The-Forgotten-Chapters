"use client";

import gsap from "gsap";
import { CSSProperties, useLayoutEffect, useMemo, useRef } from "react";

const inscription = "此处收藏着被遗忘的篇章。";

type DustStyle = CSSProperties & {
  "--dust-x": string;
  "--dust-y": string;
  "--dust-delay": string;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

type CinematicInscriptionProps = {
  awakened: boolean;
};

export function CinematicInscription({ awakened }: CinematicInscriptionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dust = useMemo(() => {
    const random = seededRandom(8120719);
    return Array.from({ length: 46 }, (_, index) => ({
      id: index,
      style: {
        "--dust-x": `${(random() - 0.5) * 44}rem`,
        "--dust-y": `${(random() - 0.5) * 15}rem`,
        "--dust-delay": `${random() * 1.3}s`,
      } as DustStyle,
    }));
  }, []);

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const context = gsap.context(() => {
      if (mediaQuery.matches) {
        gsap.set(".inscription-character", { opacity: 1, filter: "blur(0px)", y: 0 });
        return;
      }

      const timeline = gsap.timeline({ delay: 0.85 });
      timeline.fromTo(
        ".inscription-character",
        { opacity: 0, filter: "blur(12px)", y: 7, letterSpacing: "0.42em" },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          letterSpacing: "0.2em",
          duration: 2.6,
          stagger: 0.075,
          ease: "power2.out",
        },
      );
      timeline.fromTo(
        ".inscription-rule",
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 0.48, duration: 2.2, ease: "power1.inOut" },
        "<0.65",
      );
    }, rootRef);

    return () => context.revert();
  }, []);

  useLayoutEffect(() => {
    if (!awakened || !rootRef.current) return;
    gsap.to(rootRef.current, { opacity: 0, y: -8, filter: "blur(7px)", duration: 1.2, ease: "power1.inOut" });
  }, [awakened]);

  return (
    <div ref={rootRef} className="inscription-layer">
      <div className="inscription-dust" aria-hidden="true">
        {dust.map((particle) => (
          <i key={particle.id} style={particle.style} />
        ))}
      </div>
      <p className="inscription-text" aria-label={inscription}>
        {Array.from(inscription).map((character, index) => (
          <span className="inscription-character" aria-hidden="true" key={`${character}-${index}`}>
            {character}
          </span>
        ))}
      </p>
      <span className="inscription-rule" aria-hidden="true" />
    </div>
  );
}
