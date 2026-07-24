"use client";

import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { DreamLake } from "./DreamLake";
import { GoldenMelodyTrails } from "./GoldenMelodyTrails";
import { LunarDustHalo } from "./LunarDustHalo";
import { MoonFireflies } from "./MoonFireflies";
import { MoonlitDepthLayers } from "./MoonlitDepthLayers";
import { MoonlitMemoryVeil } from "./MoonlitMemoryVeil";
import { MoonlightPath } from "./MoonlightPath";

type MoonlitAtmosphereProps = {
  playing: boolean;
};

type MelodyDustStyle = CSSProperties & {
  "--melody-y": string;
  "--melody-delay": string;
  "--melody-duration": string;
  "--melody-playing-duration": string;
  "--melody-size": string;
  "--melody-drift": string;
  "--melody-drift-reverse": string;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function MoonlitAtmosphere({ playing }: MoonlitAtmosphereProps) {
  const atmosphereRef = useRef<HTMLDivElement>(null);
  const melodyDust = useMemo(() => {
    const random = seededRandom(19071926);

    return Array.from({ length: 28 }, (_, id) => {
      const duration = 15 + random() * 8;
      const drift = -14 + random() * 28;
      return {
        id,
        side: id % 2 === 0 ? "left" : "right",
        style: {
          "--melody-y": `${18 + random() * 58}%`,
          "--melody-delay": `${-random() * 18}s`,
          "--melody-duration": `${duration}s`,
          "--melody-playing-duration": `${duration * 0.86}s`,
          "--melody-size": `${0.8 + random() * 1.4}px`,
          "--melody-drift": `${drift}px`,
          "--melody-drift-reverse": `${-drift}px`,
        } as MelodyDustStyle,
      };
    });
  }, []);

  useEffect(() => {
    const layer = atmosphereRef.current;
    if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const move = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      layer.style.setProperty("--moonlit-parallax-x", `${x * 14}px`);
      layer.style.setProperty("--moonlit-parallax-y", `${y * 9}px`);
      layer.style.setProperty("--moonlit-parallax-soft-x", `${x * 5}px`);
      layer.style.setProperty("--moonlit-parallax-soft-y", `${y * 3}px`);
      layer.style.setProperty("--moonlit-parallax-reverse-x", `${x * -3}px`);
      layer.style.setProperty("--moonlit-parallax-reverse-y", `${y * -2}px`);
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div ref={atmosphereRef} className={`moonlit-atmosphere${playing ? " is-playing" : ""}`} aria-hidden="true">
      <div className="moonlit-galaxy-bands">
        <i /><i />
      </div>
      <div className="moonlit-distant-bodies">
        <i className="moonlit-distant-body moonlit-distant-body--one" />
        <i className="moonlit-distant-body moonlit-distant-body--two" />
        <i className="moonlit-distant-body moonlit-distant-body--three" />
      </div>

      <LunarDustHalo playing={playing} />
      <MoonlitDepthLayers playing={playing} />
      <MoonlightPath />
      <DreamLake />
      <GoldenMelodyTrails playing={playing} />
      <MoonFireflies playing={playing} />
      <MoonlitMemoryVeil playing={playing} />

      <div className="moonlit-melody-dust">
        {melodyDust.map((particle) => (
          <i
            key={particle.id}
            className={`moonlit-melody-particle moonlit-melody-particle--${particle.side}`}
            style={particle.style}
          />
        ))}
      </div>

      <div className="moonlit-horizon-lights">
        <i /><i /><i /><i />
      </div>
      <div className="moonlit-parallax-mist">
        <i /><i /><i />
      </div>
    </div>
  );
}
