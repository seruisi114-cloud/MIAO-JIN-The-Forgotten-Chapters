"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const segments = [
  { radius: 4.72, start: 0.12, arc: 0.64, z: 0.02 },
  { radius: 4.76, start: 1.03, arc: 0.43, z: -0.04 },
  { radius: 4.7, start: 1.73, arc: 0.7, z: 0.05 },
  { radius: 4.78, start: 2.72, arc: 0.31, z: -0.02 },
  { radius: 4.73, start: 3.38, arc: 0.58, z: 0.03 },
  { radius: 4.79, start: 4.31, arc: 0.46, z: -0.05 },
  { radius: 4.71, start: 5.12, arc: 0.72, z: 0.01 },
];

export function BrokenCelestialRing() {
  const rootRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (rootRef.current) rootRef.current.rotation.z += delta * 0.0045;
  });

  return (
    <group ref={rootRef} position={[0, 4.05, -0.35]} rotation={[Math.PI / 2.22, 0.08, -0.08]}>
      {segments.map((segment, index) => (
        <mesh key={index} position={[0, 0, segment.z]} rotation={[0, 0, segment.start]}>
          <torusGeometry args={[segment.radius, index % 3 === 0 ? 0.024 : 0.012, 8, 72, segment.arc]} />
          <meshStandardMaterial color="#75684f" emissive="#9d865a" emissiveIntensity={0.14} roughness={0.78} metalness={0.34} transparent opacity={0.42} />
        </mesh>
      ))}
      {Array.from({ length: 18 }, (_, index) => {
        const angle = index / 18 * Math.PI * 2 + 0.12;
        if (index % 4 === 2) return null;
        return (
          <mesh key={index} position={[Math.cos(angle) * 4.72, Math.sin(angle) * 4.72, 0.055]} rotation={[0, 0, angle]}>
            <boxGeometry args={[index % 3 === 0 ? 0.14 : 0.075, 0.012, 0.014]} />
            <meshBasicMaterial color="#b19a6b" transparent opacity={0.3} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}
