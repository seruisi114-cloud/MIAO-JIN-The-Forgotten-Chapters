"use client";

import gsap from "gsap";
import { CSSProperties, useLayoutEffect, useMemo, useRef } from "react";

type SanctuaryTransitionProps = {
  onComplete: () => void;
};

type FlightDustStyle = CSSProperties & {
  "--flight-x": string;
  "--flight-y": string;
  "--flight-delay": string;
  "--flight-size": string;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function SanctuaryTransition({ onComplete }: SanctuaryTransitionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dust = useMemo(() => {
    const random = seededRandom(240719);
    return Array.from({ length: 52 }, (_, index) => {
      const angle = random() * Math.PI * 2;
      const radius = 32 + random() * 65;
      return {
        id: index,
        style: {
          "--flight-x": `${Math.cos(angle) * radius}vw`,
          "--flight-y": `${Math.sin(angle) * radius}vh`,
          "--flight-delay": `${0.7 + random() * 2.7}s`,
          "--flight-size": `${0.7 + random() * 1.3}px`,
        } as FlightDustStyle,
      };
    });
  }, []);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ onComplete });
      timeline.fromTo(".sanctuary-transition-dark", { opacity: 0 }, { opacity: 0.96, duration: reducedMotion ? 0.35 : 1.8, ease: "power1.inOut" });
      timeline.fromTo(".sanctuary-transition-core", { opacity: 0, scale: 0.35 }, { opacity: 0.68, scale: 1, duration: reducedMotion ? 0.3 : 2.4, ease: "power2.out" }, "<0.55");
      timeline.to({}, { duration: reducedMotion ? 0.6 : 2.15 });
      timeline.to(rootRef.current, { opacity: 0, duration: reducedMotion ? 0.4 : 1.4, ease: "power1.inOut" });
    }, rootRef);

    return () => context.revert();
  }, [onComplete]);

  return (
    <div ref={rootRef} className="sanctuary-transition" aria-hidden="true">
      <div className="sanctuary-transition-dark" />
      <div className="sanctuary-transition-core" />
      <div className="sanctuary-transition-dust">
        {dust.map((particle) => (
          <i key={particle.id} style={particle.style} />
        ))}
      </div>
    </div>
  );
}
