"use client";

import { CSSProperties, useMemo } from "react";

type MoonlitMemoryVeilProps = {
  playing: boolean;
};

type MemoryMoteStyle = CSSProperties & {
  "--memory-x": string;
  "--memory-y": string;
  "--memory-size": string;
  "--memory-depth": string;
  "--memory-opacity": string;
  "--memory-playing-opacity": string;
  "--memory-delay": string;
  "--memory-duration": string;
  "--memory-drift-x": string;
  "--memory-drift-y": string;
  "--memory-blur": string;
  "--memory-playing-blur": string;
};

const memoryThreads = [
  "M-80 430 C130 355 248 438 430 376 C602 317 746 278 1080 345",
  "M-60 508 C164 472 290 420 474 445 C654 469 824 409 1060 456",
  "M18 336 C178 302 337 326 487 374 C660 430 835 360 1025 275",
];

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function MoonlitMemoryVeil({ playing }: MoonlitMemoryVeilProps) {
  const motes = useMemo(() => {
    const random = seededRandom(260719);

    return Array.from({ length: 26 }, (_, id) => {
      const depth = 0.35 + random() * 0.65;
      return {
        id,
        tone: id % 5 === 0 ? "gold" : id % 3 === 0 ? "blue" : "moon",
        style: {
          "--memory-x": `${3 + random() * 94}%`,
          "--memory-y": `${18 + random() * 72}%`,
          "--memory-size": `${1.2 + depth * 3.8}px`,
          "--memory-depth": `${depth}`,
          "--memory-opacity": `${0.16 + depth * 0.26}`,
          "--memory-playing-opacity": `${0.3 + depth * 0.42}`,
          "--memory-delay": `${-random() * 16}s`,
          "--memory-duration": `${13 + random() * 12}s`,
          "--memory-drift-x": `${-22 + random() * 44}px`,
          "--memory-drift-y": `${-10 - random() * 28}px`,
          "--memory-blur": `${(1 - depth) * 1.1}px`,
          "--memory-playing-blur": `${(1 - depth) * 0.8}px`,
        } as MemoryMoteStyle,
      };
    });
  }, []);

  return (
    <div className={`moonlit-memory-veil${playing ? " is-playing" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1000 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="memory-thread-gold" x1="0" x2="1">
            <stop offset="0" stopColor="#c8aa6b" stopOpacity="0" />
            <stop offset="0.44" stopColor="#dbc28a" stopOpacity=".42" />
            <stop offset="0.72" stopColor="#9db4d6" stopOpacity=".2" />
            <stop offset="1" stopColor="#9db4d6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {memoryThreads.map((path, index) => (
          <g key={path}>
            <path className="moonlit-memory-thread moonlit-memory-thread--ghost" d={path} />
            <path
              className={`moonlit-memory-thread moonlit-memory-thread--pulse moonlit-memory-thread--${index + 1}`}
              d={path}
              stroke="url(#memory-thread-gold)"
            />
          </g>
        ))}
      </svg>
      <div className="moonlit-memory-motes">
        {motes.map((mote) => (
          <i
            key={mote.id}
            className={`moonlit-memory-mote moonlit-memory-mote--${mote.tone}`}
            style={mote.style}
          />
        ))}
      </div>
      <div className="moonlit-lens-haze"><i /><i /></div>
    </div>
  );
}
