"use client";

import { useEffect, useRef } from "react";
import { GoldenMelodyTrails } from "./GoldenMelodyTrails";
import { MoonFireflies } from "./MoonFireflies";
import { MoonlitDepthLayers } from "./MoonlitDepthLayers";

type MoonlitAtmosphereProps = {
  playing: boolean;
};

export function MoonlitAtmosphere({ playing }: MoonlitAtmosphereProps) {
  const atmosphereRef = useRef<HTMLDivElement>(null);

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
      <MoonlitDepthLayers playing={playing} />
      <GoldenMelodyTrails playing={playing} />
      <MoonFireflies playing={playing} />
    </div>
  );
}
