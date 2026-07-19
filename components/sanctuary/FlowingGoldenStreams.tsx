"use client";

type FlowingGoldenStreamsProps = {
  activeIndex: number | null;
};

const streams = [
  { index: 1, x: 230, y: 246, path: "M500 420 C410 386 342 292 230 246", echo: "M500 425 C404 364 334 318 230 242", duration: "15s" },
  { index: 2, x: 770, y: 246, path: "M500 420 C590 386 658 292 770 246", echo: "M500 425 C596 364 666 318 770 242", duration: "16s" },
  { index: 3, x: 500, y: 618, path: "M500 420 C476 486 524 548 500 618", echo: "M495 420 C532 486 470 552 505 618", duration: "17s" },
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
