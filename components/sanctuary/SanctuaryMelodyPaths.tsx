"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sanctuaryMotion, sanctuaryPalette } from "./visualSystem";

type MelodyPathProps = {
  points: [number, number, number][];
  delay: number;
};

function MelodyPath({ points, delay }: MelodyPathProps) {
  const pulseRefs = useRef<Array<THREE.Mesh | null>>([]);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)), false, "catmullrom", 0.42),
    [points],
  );
  const linePoints = useMemo(
    () => curve.getPoints(80).map((point) => [point.x, point.y, point.z] as [number, number, number]),
    [curve],
  );

  useFrame(({ clock }) => {
    pulseRefs.current.forEach((pulse, index) => {
      if (!pulse) return;
      const progress = (clock.elapsedTime * sanctuaryMotion.flow + delay + index * 0.34) % 1;
      const point = curve.getPointAt(progress);
      pulse.position.copy(point);
      const breath = 0.74 + Math.sin(progress * Math.PI) * 0.36;
      pulse.scale.setScalar(breath);
    });
  });

  return (
    <group>
      <Line points={linePoints} color={sanctuaryPalette.agedGold} lineWidth={2.8} transparent opacity={0.075} />
      <Line points={linePoints} color={sanctuaryPalette.champagneGold} lineWidth={0.62} transparent opacity={0.48} />
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(node) => {
            pulseRefs.current[index] = node;
          }}
          renderOrder={18}
        >
          <sphereGeometry args={[index === 0 ? 0.035 : 0.024, 14, 14]} />
          <meshBasicMaterial
            color={index === 2 ? sanctuaryPalette.moonWhite : sanctuaryPalette.champagneGold}
            transparent
            opacity={index === 0 ? 0.82 : 0.58}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

export function SanctuaryMelodyPaths() {
  return (
    <group>
      <MelodyPath
        delay={0.04}
        points={[
          [0, 1.46, -1.2],
          [-0.92, 1.28, -0.42],
          [-2.16, 0.86, 0.76],
          [-3.34, 0.62, 1.76],
          [-4.15, 0.46, 2.42],
        ]}
      />
      <MelodyPath
        delay={0.47}
        points={[
          [0, 1.42, -1.18],
          [0.96, 1.22, -0.36],
          [2.12, 0.88, 0.66],
          [3.32, 0.66, 1.32],
          [4.22, 0.58, 1.72],
        ]}
      />
    </group>
  );
}
