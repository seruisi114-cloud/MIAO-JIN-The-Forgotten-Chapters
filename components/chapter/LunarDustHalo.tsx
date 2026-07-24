"use client";

import { CSSProperties, useMemo } from "react";

type LunarDustHaloProps = {
  playing: boolean;
};

type LunarDustStyle = CSSProperties & {
  "--lunar-angle": string;
  "--lunar-radius": string;
  "--lunar-size": string;
  "--lunar-delay": string;
  "--lunar-duration": string;
  "--lunar-opacity": string;
  "--lunar-playing-duration": string;
  "--lunar-playing-opacity": string;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function LunarDustHalo({ playing }: LunarDustHaloProps) {
  const lunarDust = useMemo(() => {
    const random = seededRandom(240726);

    return Array.from({ length: 24 }, (_, id) => {
      const duration = 17 + random() * 15;
      const opacity = 0.22 + random() * 0.42;

      return {
        id,
        tone: id % 6 === 0 ? "gold" : id % 3 === 0 ? "blue" : "moon",
        style: {
          "--lunar-angle": `${random() * 360}deg`,
          "--lunar-radius": `${48 + random() * 56}px`,
          "--lunar-size": `${0.8 + random() * 2.4}px`,
          "--lunar-delay": `${-random() * 18}s`,
          "--lunar-duration": `${duration}s`,
          "--lunar-opacity": `${opacity}`,
          "--lunar-playing-duration": `${duration * 0.82}s`,
          "--lunar-playing-opacity": `${Math.min(0.92, opacity + 0.22)}`,
        } as LunarDustStyle,
      };
    });
  }, []);

  return (
    <div className={`lunar-dust-halo${playing ? " is-playing" : ""}`} aria-hidden="true">
      <div className="lunar-atmospheric-rings"><i /><i /><i /></div>
      <div className="lunar-dust-orbit">
        {lunarDust.map((dust) => (
          <i
            key={dust.id}
            className={`lunar-dust lunar-dust--${dust.tone}`}
            style={dust.style}
          />
        ))}
      </div>
      <div className="lunar-dust-veil"><i /><i /></div>
    </div>
  );
}
