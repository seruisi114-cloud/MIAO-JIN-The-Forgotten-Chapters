"use client";

import type { CSSProperties } from "react";

const runes = [
  { x: 168, y: 244, glyph: "◇", delay: "-2s", duration: "19s" },
  { x: 248, y: 172, glyph: "⋮", delay: "-8s", duration: "23s" },
  { x: 354, y: 116, glyph: "△", delay: "-4s", duration: "21s" },
  { x: 646, y: 116, glyph: "⌁", delay: "-12s", duration: "24s" },
  { x: 752, y: 172, glyph: "◇", delay: "-5s", duration: "20s" },
  { x: 832, y: 244, glyph: "⋰", delay: "-14s", duration: "26s" },
  { x: 204, y: 478, glyph: "⌇", delay: "-10s", duration: "22s" },
  { x: 796, y: 478, glyph: "△", delay: "-1s", duration: "25s" },
];

export function ArchiveRunesLayer() {
  return (
    <svg className="archive-runes-layer sanctuary-art-layer" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id="archive-rune-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <path id="archive-rune-orbit-a" d="M146 405 C208 220 366 124 500 134 C650 122 806 224 854 405" />
        <path id="archive-rune-orbit-b" d="M188 472 C324 556 676 556 812 472" />
      </defs>
      <g className="archive-rune-traces">
        <use href="#archive-rune-orbit-a" />
        <use href="#archive-rune-orbit-b" />
      </g>
      {runes.map((rune, index) => (
        <g key={`${rune.x}-${rune.y}`} className={`archive-rune archive-rune--${index % 3}`} style={{ "--rune-delay": rune.delay, "--rune-duration": rune.duration } as CSSProperties} transform={`translate(${rune.x} ${rune.y})`}>
          <circle r="8" />
          <text textAnchor="middle" dominantBaseline="central">{rune.glyph}</text>
        </g>
      ))}
      <circle className="archive-rune-mote archive-rune-mote--a" r="1.6">
        <animateMotion dur="23s" repeatCount="indefinite"><mpath href="#archive-rune-orbit-a" /></animateMotion>
      </circle>
      <circle className="archive-rune-mote archive-rune-mote--b" r="1.2">
        <animateMotion begin="-9s" dur="26s" repeatCount="indefinite"><mpath href="#archive-rune-orbit-b" /></animateMotion>
      </circle>
    </svg>
  );
}
