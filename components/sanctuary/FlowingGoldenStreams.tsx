"use client";

type FlowingGoldenStreamsProps = {
  activeIndex: number | null;
};

const streams = [
  { index: 0, path: "M500 420 C493 356 519 278 500 172", echo: "M496 420 C520 348 470 278 504 172", duration: "15s" },
  { index: 1, path: "M500 420 C428 406 354 338 250 304", echo: "M500 424 C416 375 352 369 250 300", duration: "13s" },
  { index: 2, path: "M500 420 C572 406 646 338 750 304", echo: "M500 424 C584 375 648 369 750 300", duration: "14s" },
  { index: 3, path: "M500 420 C466 472 402 506 348 568", echo: "M497 420 C450 454 420 532 352 570", duration: "16s" },
  { index: 4, path: "M500 420 C534 472 598 506 652 568", echo: "M503 420 C550 454 580 532 648 570", duration: "17s" },
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
          <circle className="golden-stream-destination" cx={stream.index === 0 ? 500 : stream.index === 1 ? 250 : stream.index === 2 ? 750 : stream.index === 3 ? 348 : 652} cy={stream.index === 0 ? 172 : stream.index < 3 ? 304 : 568} r="2.2" />
        </g>
      ))}
    </svg>
  );
}
