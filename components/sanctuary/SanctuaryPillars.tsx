"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BrokenCelestialRing } from "./BrokenCelestialRing";
import { createSanctuaryMarbleTexture } from "./SanctuaryMarbleTexture";

export function SanctuaryPillars({ skipIntro = false }: { skipIntro?: boolean }) {
  const edgeRef = useRef<THREE.Group>(null);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const marbleTexture = useMemo(() => createSanctuaryMarbleTexture(19.07), []);

  useEffect(() => () => marbleTexture.dispose(), [marbleTexture]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 9.05, 10.05);
    edgeRef.current?.traverse((object) => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return;
      const material = object.material as THREE.Material & { opacity?: number };
      if (material.userData.baseOpacity === undefined && material.opacity !== undefined) material.userData.baseOpacity = material.opacity;
      if (material.opacity !== undefined) material.opacity = THREE.MathUtils.damp(material.opacity, (material.userData.baseOpacity as number) * reveal, 1.6, delta);
    });
  });

  return (
    <group ref={edgeRef}>
      {Array.from({ length: 13 }, (_, index) => {
        const angle = index / 12 * Math.PI;
        const x = Math.cos(angle) * 6.0;
        const z = -Math.sin(angle) * 6.0;
        const depthOpacity = 0.74 + Math.abs(index - 6) / 6 * 0.2;
        const scale = 0.94 + Math.abs(index - 6) / 6 * 0.05;
        return (
          <group key={index} position={[x, 1.62 + Math.sin(index * 1.7) * 0.035, z]} scale={scale}>
            <mesh castShadow>
              <cylinderGeometry args={[0.21, 0.27, 3.28, 32]} />
              <meshPhysicalMaterial map={marbleTexture} bumpMap={marbleTexture} bumpScale={0.022} color="#485268" roughness={0.54} metalness={0.12} clearcoat={0.14} emissive="#26354e" emissiveIntensity={0.12} transparent opacity={depthOpacity} />
            </mesh>
            <mesh position={[0, -1.57, 0]}>
              <cylinderGeometry args={[0.38, 0.48, 0.2, 32]} />
              <meshStandardMaterial map={marbleTexture} color="#3c4352" roughness={0.62} transparent opacity={depthOpacity} />
            </mesh>
            <mesh position={[0, 1.58, 0]}>
              <cylinderGeometry args={[0.43, 0.22, 0.2, 32]} />
              <meshStandardMaterial map={marbleTexture} color="#4a4d57" roughness={0.58} transparent opacity={depthOpacity} />
            </mesh>
            <group>
              {[-1.42, 1.42].map((y) => (
                <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.27, 0.014, 8, 40]} />
                  <meshBasicMaterial color="#b29a69" transparent opacity={0.44} depthWrite={false} />
                </mesh>
              ))}
              <Line points={[[0.198, -1.38, 0.065], [0.156, 1.38, 0.065]]} color="#c0a873" lineWidth={0.46} transparent opacity={0.34} />
              <Line points={[[-0.198, -1.38, 0.035], [-0.156, 1.38, 0.035]]} color="#aeb8ca" lineWidth={0.35} transparent opacity={0.18} />
            </group>
          </group>
        );
      })}
      <BrokenCelestialRing />
    </group>
  );
}
