"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type PlanetRingsProps = {
  texture: THREE.Texture;
  awakened: boolean;
  rotation?: [number, number, number];
  opacity?: number;
};

export function PlanetRings({ texture, awakened, rotation = [1.18, 0.2, 0.14], opacity = 0.34 }: PlanetRingsProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, opacity * (awakened ? 1 : 0.14), 0.72, delta);
  });

  return (
    <mesh rotation={rotation} renderOrder={-1}>
      <ringGeometry args={[1.2, 1.72, 256, 16]} />
      <meshStandardMaterial ref={materialRef} map={texture} color="#a99a7d" roughness={0.92} metalness={0.06} transparent opacity={opacity * 0.14} side={THREE.DoubleSide} depthWrite={false} alphaTest={0.018} />
    </mesh>
  );
}
