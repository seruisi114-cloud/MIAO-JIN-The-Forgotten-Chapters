"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export function ArchiveOrbitField({ reducedMotion }: { reducedMotion: boolean }) {
  const rootRef = useRef<THREE.Group>(null);
  const lightsRef = useRef<THREE.Group>(null);
  const paths = useMemo(() => [
    new THREE.EllipseCurve(0, 0, 6.8, 2.8, 0.18, Math.PI * 1.62, false, 0.08).getPoints(96).map(({ x, y }) => [x, 2.5 + y * 0.28, -3.8 + y] as [number, number, number]),
    new THREE.EllipseCurve(0, 0, 5.6, 2.1, Math.PI * 0.88, Math.PI * 2.28, false, -0.16).getPoints(82).map(({ x, y }) => [x, 3.5 + y * 0.18, -4.9 + y * 0.62] as [number, number, number]),
  ], []);

  useFrame(({ clock }, delta) => {
    if (rootRef.current && !reducedMotion) rootRef.current.rotation.y += delta * 0.0028;
    if (lightsRef.current && !reducedMotion) {
      lightsRef.current.children.forEach((child, index) => {
        const angle = clock.elapsedTime * (0.04 + index * 0.008) + index * 2.1;
        child.position.set(Math.cos(angle) * (5.7 + index * 0.45), 2.15 + Math.sin(angle * 1.4) * 0.72, -3.2 + Math.sin(angle) * 1.8);
      });
    }
  });

  return (
    <group ref={rootRef}>
      {paths.map((path, index) => (
        <Line key={index} points={path} color={index === 0 ? "#b79a61" : "#6f86a8"} lineWidth={index === 0 ? 0.36 : 0.28} transparent opacity={index === 0 ? 0.28 : 0.17} />
      ))}
      <group ref={lightsRef}>
        {[0, 1, 2].map((index) => (
          <mesh key={index}>
            <sphereGeometry args={[index === 0 ? 0.035 : 0.025, 12, 12]} />
            <meshBasicMaterial color={index === 1 ? "#dce5ef" : "#d0b579"} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 4.85, -4.2]} rotation={[1.25, 0.08, 0.1]} scale={[1, 0.72, 1]}>
        <torusGeometry args={[5.9, 0.018, 8, 160, Math.PI * 1.38]} />
        <meshBasicMaterial color="#a78c59" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh position={[0.5, 4.55, -4.55]} rotation={[1.34, -0.18, Math.PI + 0.2]} scale={[1, 0.69, 1]}>
        <torusGeometry args={[5.15, 0.008, 8, 140, Math.PI * 0.94]} />
        <meshBasicMaterial color="#c1ab78" transparent opacity={0.13} depthWrite={false} />
      </mesh>
    </group>
  );
}
