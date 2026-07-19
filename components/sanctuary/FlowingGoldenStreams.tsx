"use client";

type FlowingGoldenStreamsProps = {
  activeIndex: number | null;
};

const streams = [
  { index: 1, x: 500, y: 170, path: "M500 420 C472 336 528 252 500 170", echo: "M493 420 C526 338 474 252 507 170", duration: "16s" },
  { index: 2, x: 255, y: 392, path: "M500 420 C418 388 340 430 255 392", echo: "M500 426 C412 408 344 372 255 398", duration: "17s" },
  { index: 3, x: 745, y: 392, path: "M500 420 C582 388 660 430 745 392", echo: "M500 426 C588 408 656 372 745 398", duration: "18s" },
];

export function FlowingGoldenStreams({ activeIndex }: FlowingGoldenStreamsProps) {
  return (
    <svg className="flowing-golden-streams sanctuary-art-layer" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sanctuary-stream-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8f7952" stopOpacity="0" />
          <stop offset="0.46" stopColor="#c8ad76" stopOpacity="0.7" />
          <stop offset="1" stopColor="#917a52" stopOpacity="0.12" />
        </linearGradient>
        <filter id="sanctuary-stream-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      {streams.map((stream) => (
        <g key={stream.index} className={`golden-stream${activeIndex === stream.index ? " is-active" : ""}`}>
          <path className="golden-stream-echo" d={stream.echo} pathLength="1" />
          <path className="golden-stream-glow" d={stream.path} pathLength="1" />
          <path id={`sanctuary-stream-${stream.index}`} className="golden-stream-core" d={stream.path} pathLength="1" />
          <circle className="golden-stream-pulse" r="2.1">
            <animateMotion dur={stream.duration} repeatCount="indefinite" rotate="auto">
              <mpath href={`#sanctuary-stream-${stream.index}`} />
            </animateMotion>
          </circle>
          <circle className="golden-stream-pulse golden-stream-pulse--small" r="1.2">
            <animateMotion begin="-6s" dur={stream.duration} repeatCount="indefinite" rotate="auto">
              <mpath href={`#sanctuary-stream-${stream.index}`} />
            </animateMotion>
          </circle>
          <circle className="golden-stream-pulse golden-stream-pulse--ghost" r="0.8">
            <animateMotion begin="-10s" dur={stream.duration} repeatCount="indefinite" rotate="auto">
              <mpath href={`#sanctuary-stream-${stream.index}`} />
            </animateMotion>
          </circle>
          <circle className="golden-stream-destination" cx={stream.x} cy={stream.y} r="2.2" />
        </g>
      ))}
    </svg>
  );
}
