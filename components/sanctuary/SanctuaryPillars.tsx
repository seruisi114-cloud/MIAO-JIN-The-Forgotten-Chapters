"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createSanctuaryMarbleTexture } from "./SanctuaryMarbleTexture";
import { sanctuaryPalette } from "./visualSystem";

export function SanctuaryPillars({ skipIntro = false }: { skipIntro?: boolean }) {
  const edgeRef = useRef<THREE.Group>(null);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const marbleTexture = useMemo(() => createSanctuaryMarbleTexture(19.07), []);

  useEffect(() => () => marbleTexture.dispose(), [marbleTexture]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 3.1, 4.45);
    edgeRef.current?.traverse((object) => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return;
      const material = object.material as THREE.Material & { opacity?: number };
      if (material.userData.baseOpacity === undefined && material.opacity !== undefined) material.userData.baseOpacity = material.opacity;
      if (material.opacity !== undefined) material.opacity = THREE.MathUtils.damp(material.opacity, (material.userData.baseOpacity as number) * reveal, 1.6, delta);
    });
  });

  return (
    <group ref={edgeRef}>
      {Array.from({ length: 11 }, (_, index) => {
        const angle = index / 10 * Math.PI;
        const x = Math.cos(angle) * 6.0;
        const z = -Math.sin(angle) * 6.0;
        const depthOpacity = 0.6 + Math.abs(index - 5) / 5 * 0.2;
        const scale = 0.96 + Math.abs(index - 5) / 5 * 0.04;
        return (
          <group key={index} position={[x, 1.94, z]} scale={scale}>
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.29, 3.92, 32]} />
              <meshPhysicalMaterial map={marbleTexture} bumpMap={marbleTexture} bumpScale={0.022} color={sanctuaryPalette.obsidianLift} roughness={0.54} metalness={0.12} clearcoat={0.14} emissive={sanctuaryPalette.deepIndigo} emissiveIntensity={0.1} transparent opacity={depthOpacity} />
            </mesh>
            <mesh position={[0, -1.91, 0]}>
              <cylinderGeometry args={[0.38, 0.48, 0.2, 32]} />
              <meshStandardMaterial map={marbleTexture} color={sanctuaryPalette.obsidianLift} roughness={0.62} transparent opacity={depthOpacity} />
            </mesh>
            <mesh position={[0, 1.92, 0]}>
              <cylinderGeometry args={[0.43, 0.22, 0.2, 32]} />
              <meshStandardMaterial map={marbleTexture} color={sanctuaryPalette.obsidianLift} roughness={0.58} transparent opacity={depthOpacity} />
            </mesh>
            <group>
              {[-1.74, 1.74].map((y) => (
                <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.27, 0.014, 8, 40]} />
                  <meshBasicMaterial color={sanctuaryPalette.agedGold} transparent opacity={0.4} depthWrite={false} />
                </mesh>
              ))}
              <Line points={[[0.205, -1.66, 0.065], [0.16, 1.66, 0.065]]} color={sanctuaryPalette.champagneGold} lineWidth={0.42} transparent opacity={0.3} />
              <Line points={[[-0.205, -1.66, 0.035], [-0.16, 1.66, 0.035]]} color={sanctuaryPalette.moonBlue} lineWidth={0.32} transparent opacity={0.14} />
            </group>
          </group>
        );
      })}
    </group>
  );
}
