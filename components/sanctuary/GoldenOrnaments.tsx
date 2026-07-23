"use client";

type GoldenOrnamentsProps = {
  activeIndex: number | null;
};

const haloPositions = [
  { index: 1, x: 250, y: 474, radius: 78 },
  { index: 2, x: 500, y: 236, radius: 74 },
  { index: 3, x: 750, y: 438, radius: 72 },
];

export function GoldenOrnaments({ activeIndex }: GoldenOrnamentsProps) {
  return (
    <svg className="golden-ornaments sanctuary-art-layer" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id="ornament-soft-gold" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <g className="ornament-sky-stars">
        {[
          [132, 122], [204, 82], [318, 132], [407, 76], [592, 96], [682, 142], [812, 88], [884, 156], [91, 272], [921, 248],
        ].map(([x, y], index) => (
          <g key={index} transform={`translate(${x} ${y})`}>
            <line x1="-5" y1="0" x2="5" y2="0" />
            <line x1="0" y1="-4" x2="0" y2="4" />
            <circle r={index % 3 === 0 ? 1.25 : 0.8} />
          </g>
        ))}
      </g>
      <g className="ornament-archive-vault">
        <ellipse cx="500" cy="352" rx="188" ry="92" />
        <ellipse cx="500" cy="352" rx="156" ry="72" />
        <path d="M316 352 C352 292 648 292 684 352" />
        <path d="M344 378 C402 424 598 424 656 378" />
        <path d="M500 272 L500 250 M382 302 L368 282 M618 302 L632 282" />
        <path d="M322 354 L300 354 M678 354 L700 354" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((index) => {
          const angle = index / 12 * Math.PI * 2;
          const x = 500 + Math.cos(angle) * 173;
          const y = 352 + Math.sin(angle) * 82;
          return <circle key={index} cx={x} cy={y} r={index % 3 === 0 ? 1.8 : 1.1} />;
        })}
      </g>
      <g className="ornament-relic-script">
        {Array.from({ length: 15 }, (_, index) => {
          const x = 274 + index * 32.3;
          const high = index % 4 === 0;
          return (
            <g key={index} transform={`translate(${x} 116)`}>
              <line x1="0" y1={high ? "-8" : "-5"} x2="0" y2={high ? "8" : "5"} />
              <line x1={high ? "-5" : "-3"} y1="0" x2={high ? "5" : "3"} y2="0" />
              {index % 3 === 0 ? <circle r="2.2" /> : null}
            </g>
          );
        })}
      </g>
      <g className="ornament-energy-veils">
        <path d="M92 420 C215 350 306 454 414 393 S665 338 908 420" pathLength="1" />
        <path d="M74 452 C226 510 322 395 456 458 S714 500 926 438" pathLength="1" />
        <path d="M148 388 C274 322 354 398 432 366 S676 316 852 390" pathLength="1" />
      </g>
      <g className="ornament-pillar-glints">
        {[112, 176, 238, 302, 365, 635, 698, 762, 824, 888].map((x, index) => (
          <g key={x} opacity={0.22 + (index % 3) * 0.05}>
            <line x1={x} y1="218" x2={x + (index % 2 ? 3 : -3)} y2="470" />
            <line x1={x - 7} y1="250" x2={x + 7} y2="250" />
          </g>
        ))}
        <path d="M120 202 C225 145 340 152 420 176" />
        <path d="M580 176 C660 152 775 145 880 202" />
        <path d="M200 170 C267 124 327 127 376 143" />
        <path d="M624 143 C673 127 733 124 800 170" />
      </g>
      <g className="ornament-outer-arc">
        <path d="M92 548 C170 650 830 650 908 548" />
        <path d="M128 530 C220 603 780 603 872 530" />
        <path d="M184 556 C285 621 715 621 816 556" />
        <path d="M241 582 C338 626 662 626 759 582" />
        {Array.from({ length: 25 }, (_, index) => {
          const x = 118 + index * 31.8;
          return <line key={index} x1={x} y1="588" x2={x + (index % 4 === 0 ? 0 : 2)} y2={index % 4 === 0 ? "601" : "595"} />;
        })}
      </g>
      <g className="ornament-floor-chart">
        <path d="M204 522 C298 472 386 460 500 468 C614 460 702 472 796 522" />
        <path d="M252 548 C338 514 420 505 500 510 C580 505 662 514 748 548" />
        <path d="M168 490 C288 430 380 432 500 447 C620 432 712 430 832 490" />
        <path d="M308 472 L347 436 L386 452 L420 414 L462 438" />
        <path d="M538 438 L580 414 L614 452 L653 436 L692 472" />
        <path d="M230 518 L260 498 M770 518 L740 498 M350 584 L366 565 M650 584 L634 565" />
        {[220, 276, 332, 388, 444, 500, 556, 612, 668, 724, 780].map((x, index) => (
          <g key={x}>
            <line x1={x} y1={560 + Math.abs(index - 5) * 3} x2={x + (index % 2 ? 3 : -3)} y2={570 + Math.abs(index - 5) * 3} />
            {index % 2 === 0 && <circle cx={x} cy={544 + Math.abs(index - 5) * 2} r="1.4" />}
          </g>
        ))}
      </g>
      <g className="ornament-altar-seal">
        <ellipse className="ornament-altar-glow" cx="500" cy="422" rx="126" ry="39" />
        <ellipse cx="500" cy="422" rx="104" ry="32" />
        <ellipse cx="500" cy="422" rx="78" ry="23" />
        <ellipse cx="500" cy="422" rx="52" ry="15" />
        <path d="M410 420 L386 420 M590 420 L614 420 M500 390 L500 378" />
        {Array.from({ length: 16 }, (_, index) => {
          const angle = index / 16 * Math.PI * 2;
          const x1 = 500 + Math.cos(angle) * 111;
          const y1 = 422 + Math.sin(angle) * 34;
          const x2 = 500 + Math.cos(angle) * (index % 4 === 0 ? 121 : 117);
          const y2 = 422 + Math.sin(angle) * (index % 4 === 0 ? 38 : 36);
          return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
        <circle className="ornament-altar-node ornament-altar-node--one" cx="500" cy="388" r="1.8" />
        <circle className="ornament-altar-node ornament-altar-node--two" cx="604" cy="422" r="1.4" />
        <circle className="ornament-altar-node ornament-altar-node--three" cx="420" cy="438" r="1.2" />
      </g>
      {haloPositions.map((halo) => (
        <g key={halo.index} className={`ornament-halo ornament-halo--${halo.index}${activeIndex === halo.index ? " is-active" : ""}`}>
          <path d={`M${halo.x - halo.radius} ${halo.y} A${halo.radius} ${halo.radius * 0.72} 0 0 1 ${halo.x + halo.radius} ${halo.y}`} />
          <path d={`M${halo.x - halo.radius * 0.72} ${halo.y + 5} A${halo.radius * 0.72} ${halo.radius * 0.5} 0 0 1 ${halo.x + halo.radius * 0.72} ${halo.y + 5}`} />
          <path d={`M${halo.x - halo.radius * 0.46} ${halo.y - halo.radius * 0.51} A${halo.radius * 0.62} ${halo.radius * 0.68} 0 0 1 ${halo.x + halo.radius * 0.18} ${halo.y - halo.radius * 0.66}`} />
          <line x1={halo.x - halo.radius - 20} y1={halo.y + 13} x2={halo.x - halo.radius - 3} y2={halo.y + 13} />
          <line x1={halo.x + halo.radius + 3} y1={halo.y + 13} x2={halo.x + halo.radius + 20} y2={halo.y + 13} />
          <path d={`M${halo.x - 3} ${halo.y + 18} L${halo.x} ${halo.y + 15} L${halo.x + 3} ${halo.y + 18} L${halo.x} ${halo.y + 21} Z`} />
          <circle cx={halo.x} cy={halo.y - halo.radius * 0.45} r="1.8" />
          {Array.from({ length: 7 }, (_, index) => {
            const angle = Math.PI + index / 6 * Math.PI;
            const x1 = halo.x + Math.cos(angle) * (halo.radius + 2);
            const y1 = halo.y + Math.sin(angle) * (halo.radius * 0.72 + 2);
            const x2 = halo.x + Math.cos(angle) * (halo.radius + (index % 3 === 0 ? 9 : 6));
            const y2 = halo.y + Math.sin(angle) * (halo.radius * 0.72 + (index % 3 === 0 ? 7 : 5));
            return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>
      ))}
    </svg>
  );
}
