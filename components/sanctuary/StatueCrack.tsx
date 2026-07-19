"use client";

export function StatueCrack() {
  return (
    <div className="statue-crack" aria-hidden="true">
      <svg viewBox="0 0 72 150" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="statue-crack-soft" x="-80%" y="-30%" width="260%" height="160%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
          <linearGradient id="statue-crack-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#b99b62" stopOpacity="0.16" />
            <stop offset="0.46" stopColor="#f1eee3" stopOpacity="0.95" />
            <stop offset="1" stopColor="#c8aa70" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <g className="statue-crack-glow" filter="url(#statue-crack-soft)">
          <path d="M38 8 L31 31 L40 50 L32 74 L37 93 L29 117 L34 143" />
        </g>
        <g className="statue-crack-core">
          <path d="M38 8 L31 31 L40 50 L32 74 L37 93 L29 117 L34 143" />
          <path d="M32 74 L18 66 L9 52" />
          <path d="M37 93 L51 84 L63 69" />
          <path d="M31 31 L20 24 L15 13" />
          <path d="M29 117 L17 127 L12 140" />
          <path d="M40 50 L51 44 L59 34" />
        </g>
        <g className="statue-crack-fragments">
          <path d="M18 62 l-4 7 7-2 z" />
          <path d="M52 79 l7 3-5 5 z" />
          <path d="M21 120 l-5 4 6 2 z" />
          <path d="M47 44 l5-4 1 6 z" />
        </g>
      </svg>
    </div>
  );
}
