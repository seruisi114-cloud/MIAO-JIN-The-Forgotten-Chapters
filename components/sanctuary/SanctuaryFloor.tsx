"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createSanctuaryMarbleTexture } from "./SanctuaryMarbleTexture";

function arcPoints(radius: number, start: number, length: number, segments = 54) {
  return Array.from({ length: segments }, (_, index) => {
    const angle = start + index / (segments - 1) * length;
    return [Math.cos(angle) * radius, 0.025, Math.sin(angle) * radius] as [number, number, number];
  });
}

export function SanctuaryFloor({ skipIntro = false }: { skipIntro?: boolean }) {
  const mapRef = useRef<THREE.Group>(null);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const initialMapScale = skipIntro ? 1 : 0.04;
  const marbleTexture = useMemo(() => createSanctuaryMarbleTexture(7.19, true), []);

  useEffect(() => () => marbleTexture.dispose(), [marbleTexture]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!mapRef.current) return;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 4.9, 6.35);
    const targetScale = 0.04 + reveal * 0.96;
    mapRef.current.scale.setScalar(THREE.MathUtils.damp(mapRef.current.scale.x, targetScale, 2, delta));
  });

  return (
    <group>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[6.28, 6.58, 0.38, 128]} />
        <meshPhysicalMaterial map={marbleTexture} bumpMap={marbleTexture} bumpScale={0.018} color="#0c111a" roughness={0.5} metalness={0.24} clearcoat={0.22} clearcoatRoughness={0.72} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6.26, 128]} />
        <meshPhysicalMaterial map={marbleTexture} bumpMap={marbleTexture} bumpScale={0.012} color="#111722" roughness={0.46} metalness={0.18} clearcoat={0.3} clearcoatRoughness={0.62} emissive="#111827" emissiveIntensity={0.05} />
      </mesh>

      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.25, 96]} />
        <meshBasicMaterial color="#d9dce1" transparent opacity={0.028} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <group ref={mapRef} scale={initialMapScale}>
        {[
          { radius: 2.3, start: 0.42, length: Math.PI * 1.18, opacity: 0.3 },
          { radius: 5.74, start: 2.62, length: Math.PI * 0.52, opacity: 0.2 },
        ].map((arc, index) => (
          <Line key={index} points={arcPoints(arc.radius, arc.start, arc.length)} color="#b59a68" lineWidth={0.52 - index * 0.08} transparent opacity={arc.opacity} />
        ))}
      </group>
    </group>
  );
}
