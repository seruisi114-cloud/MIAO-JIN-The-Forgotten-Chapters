"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createSanctuaryMarbleTexture } from "./SanctuaryMarbleTexture";
import { sanctuaryPalette } from "./visualSystem";

function arcPoints(radius: number, start: number, length: number, segments = 54) {
  return Array.from({ length: segments }, (_, index) => {
    const angle = start + index / (segments - 1) * length;
    return [Math.cos(angle) * radius, 0.025, Math.sin(angle) * radius] as [number, number, number];
  });
}

function petalPoints(rotation: number, radius = 2.12, segments = 42) {
  return Array.from({ length: segments }, (_, index) => {
    const progress = index / (segments - 1);
    const length = (progress - 0.5) * radius * 2;
    const width = Math.sin(progress * Math.PI) * 0.38;
    const x = Math.cos(rotation) * length - Math.sin(rotation) * width;
    const z = Math.sin(rotation) * length + Math.cos(rotation) * width;
    return [x, 0.03, z] as [number, number, number];
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
        <meshPhysicalMaterial map={marbleTexture} bumpMap={marbleTexture} bumpScale={0.018} color={sanctuaryPalette.obsidian} roughness={0.5} metalness={0.24} clearcoat={0.22} clearcoatRoughness={0.72} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6.26, 128]} />
        <meshPhysicalMaterial map={marbleTexture} bumpMap={marbleTexture} bumpScale={0.012} color={sanctuaryPalette.obsidianLift} roughness={0.46} metalness={0.18} clearcoat={0.3} clearcoatRoughness={0.62} emissive={sanctuaryPalette.deepIndigo} emissiveIntensity={0.05} />
      </mesh>

      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.25, 96]} />
          <meshBasicMaterial color={sanctuaryPalette.moonWhite} transparent opacity={0.028} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <group ref={mapRef} scale={initialMapScale}>
        {[
          { radius: 2.3, start: 0.42, length: Math.PI * 1.18, opacity: 0.34 },
          { radius: 4.18, start: 3.34, length: Math.PI * 0.72, opacity: 0.18 },
          { radius: 5.74, start: 2.62, length: Math.PI * 0.52, opacity: 0.22 },
          { radius: 5.92, start: -0.1, length: Math.PI * 0.46, opacity: 0.12 },
        ].map((arc, index) => (
          <Line key={index} points={arcPoints(arc.radius, arc.start, arc.length)} color={sanctuaryPalette.champagneGold} lineWidth={Math.max(0.24, 0.58 - index * 0.08)} transparent opacity={arc.opacity} />
        ))}
        {[0, Math.PI / 2].map((rotation) => (
          <Line key={rotation} points={petalPoints(rotation)} color={sanctuaryPalette.agedGold} lineWidth={0.34} transparent opacity={0.18} />
        ))}
        <mesh position={[0, 0.034, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.24, 0.255, 64]} />
          <meshBasicMaterial color={sanctuaryPalette.champagneGold} transparent opacity={0.32} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
