"use client";

import { CSSProperties, useMemo } from "react";

const inscription = "此处收藏着被遗忘的篇章。";

type DustStyle = CSSProperties & {
  "--dust-x": string;
  "--dust-y": string;
  "--dust-delay": string;
};

type CharacterStyle = CSSProperties & {
  "--inscription-index": number;
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

  return (
    <div className={`inscription-layer${awakened ? " inscription-layer--awakened" : ""}`}>
      <div className="inscription-dust" aria-hidden="true">
        {dust.map((particle) => (
          <i key={particle.id} style={particle.style} />
        ))}
      </div>
      <p className="inscription-text" aria-label={inscription}>
        {Array.from(inscription).map((character, index) => (
          <span
            className="inscription-character"
            aria-hidden="true"
            key={`${character}-${index}`}
            style={{ "--inscription-index": index } as CharacterStyle}
          >
            {character}
          </span>
        ))}
      </p>
      <span className="inscription-rule" aria-hidden="true" />
    </div>
  );
}
