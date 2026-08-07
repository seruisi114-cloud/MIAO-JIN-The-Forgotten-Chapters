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
      <mesh renderOrder={12}>
        <tubeGeometry args={[curve, 96, 0.052, 8, false]} />
        <meshBasicMaterial color={sanctuaryPalette.agedGold} transparent opacity={0.055} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <Line points={linePoints} color={sanctuaryPalette.agedGold} lineWidth={4.6} transparent opacity={0.055} />
      <Line points={linePoints} color={sanctuaryPalette.champagneGold} lineWidth={0.78} transparent opacity={0.56} />
      {[0, 1, 2, 3].map((index) => (
        <mesh
          key={index}
          ref={(node) => {
            pulseRefs.current[index] = node;
          }}
          renderOrder={18}
        >
          <sphereGeometry args={[index === 0 ? 0.038 : 0.022, 14, 14]} />
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

export function SanctuaryMelodyPaths({ skipIntro = false }: { skipIntro?: boolean }) {
  const rootRef = useRef<THREE.Group>(null);
  const elapsed = useRef(skipIntro ? 20 : 0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!rootRef.current) return;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 8.05, 9.35);
    rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, Math.max(0.001, reveal), 2.15, delta));
  });

  return (
    <group ref={rootRef} scale={skipIntro ? 1 : 0.001}>
      <MelodyPath
        delay={0.04}
        points={[
          [0, 1.58, 0.36],
          [-0.88, 1.46, 0.72],
          [-2.08, 1.24, 1.18],
          [-3.22, 1.12, 1.62],
          [-4.08, 1.16, 1.77],
        ]}
      />
      <MelodyPath
        delay={0.47}
        points={[
          [0, 1.54, 0.36],
          [0.92, 1.42, 0.72],
          [2.08, 1.22, 1.16],
          [3.24, 1.08, 1.56],
          [4.1, 1.16, 1.7],
        ]}
      />
    </group>
  );
}
