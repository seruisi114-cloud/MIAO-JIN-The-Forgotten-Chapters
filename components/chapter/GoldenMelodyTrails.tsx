type GoldenMelodyTrailsProps = {
  playing: boolean;
};

const trails = [
  "M-40 390 C170 330 275 400 505 350 C650 318 760 250 1040 300",
  "M-30 470 C180 430 305 370 515 390 C720 410 820 350 1030 375",
  "M-20 290 C180 260 340 320 510 345 C680 372 855 325 1020 235",
  "M1000 505 C810 470 700 430 540 385 C350 330 210 360 0 440",
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
