"use client";

import { CSSProperties, useMemo } from "react";

export type TransitionOrigin = {
  x: number;
  y: number;
};

type SacredTransitionOverlayProps = {
  phase: "covering" | "releasing" | "returning";
  origin: TransitionOrigin;
};

type OverlayStyle = CSSProperties & {
  "--sacred-origin-x": string;
  "--sacred-origin-y": string;
};

export function SacredTransitionOverlay({ phase, origin }: SacredTransitionOverlayProps) {
  const dust = useMemo(() => Array.from({ length: 24 }, (_, index) => ({
    id: index,
    angle: index / 24 * Math.PI * 2 + (index % 3) * 0.12,
    distance: 42 + (index % 7) * 13,
    delay: 1.45 + (index % 6) * 0.11,
  })), []);
  const style = {
    "--sacred-origin-x": `${origin.x}%`,
    "--sacred-origin-y": `${origin.y}%`,
  } as OverlayStyle;

  return (
    <div className={`sacred-transition-overlay sacred-transition-overlay--${phase}`} style={style} aria-hidden="true">
      <i className="sacred-transition-seep" />
      <i className="sacred-transition-bloom" />
      <span className="sacred-transition-dust">
        {dust.map((particle) => (
          <i
            key={particle.id}
            style={{
              "--sacred-dust-x": `${Math.cos(particle.angle) * particle.distance}px`,
              "--sacred-dust-y": `${Math.sin(particle.angle) * particle.distance}px`,
              "--sacred-dust-delay": `${particle.delay}s`,
            } as CSSProperties}
          />
        ))}
      </span>
    </div>
  );
}
