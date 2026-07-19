"use client";

import { Line } from "@react-three/drei";

type AltarConnectionsProps = {
  chapterPositions: Array<[number, number, number]>;
  activeIndex: number | null;
};

export function AltarConnections({ chapterPositions, activeIndex }: AltarConnectionsProps) {
  return (
    <group>
      {chapterPositions.map((position, index) => (
        <Line
          key={`${position.join("-")}-${index}`}
          points={[[0, 0.105, 0], [position[0] * 0.84, 0.075, position[2] * 0.84]]}
          color="#ad9566"
          lineWidth={activeIndex === index + 1 ? 0.78 : 0.52}
          transparent
          opacity={activeIndex === index + 1 ? 0.58 : 0.23}
        />
      ))}
    </group>
  );
}
