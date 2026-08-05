type GoldenMelodyTrailsProps = {
  playing: boolean;
};

const trails = [
  "M-40 390 C170 330 275 400 505 350 C650 318 760 250 1040 300",
  "M-25 535 C170 500 305 455 490 468 C650 480 790 420 1025 450",
];

export function GoldenMelodyTrails({ playing }: GoldenMelodyTrailsProps) {
  return (
    <svg className={`golden-melody-trails${playing ? " is-playing" : ""}`} viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
      {trails.map((path, index) => (
        <g key={path}>
          <path className="golden-melody-trail-base" d={path} />
          <path className={`golden-melody-trail-pulse golden-melody-trail-pulse--${index + 1}`} d={path} />
        </g>
      ))}
    </svg>
  );
}
