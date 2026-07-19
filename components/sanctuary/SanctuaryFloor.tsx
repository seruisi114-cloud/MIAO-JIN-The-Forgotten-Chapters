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
  const constellations = useMemo(
    () => [
      [[-4.4, 0.032, -1.1], [-3.35, 0.032, -2.3], [-2.2, 0.032, -1.8], [-1.25, 0.032, -3.65]],
      [[1.4, 0.032, -3.75], [2.05, 0.032, -2.35], [3.4, 0.032, -2.7], [4.3, 0.032, -1.35]],
      [[-4.45, 0.032, 1.15], [-3.4, 0.032, 2.65], [-1.9, 0.032, 3.75]],
      [[1.7, 0.032, 3.85], [3.0, 0.032, 2.7], [4.45, 0.032, 1.3]],
    ] as Array<Array<[number, number, number]>>,
    [],
  );

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
        <meshPhysicalMaterial map={marbleTexture} bumpMap={marbleTexture} bumpScale={0.018} color="#182235" roughness={0.34} metalness={0.32} clearcoat={0.3} clearcoatRoughness={0.66} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6.26, 128]} />
        <meshPhysicalMaterial map={marbleTexture} bumpMap={marbleTexture} bumpScale={0.012} color="#1b2940" roughness={0.4} metalness={0.22} clearcoat={0.26} clearcoatRoughness={0.58} emissive="#111d35" emissiveIntensity={0.18} />
      </mesh>

      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.25, 96]} />
        <meshBasicMaterial color="#d9dce1" transparent opacity={0.028} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <group ref={mapRef} scale={initialMapScale}>
        {[
          { radius: 2.2, start: 0.25, length: Math.PI * 1.52, opacity: 0.46 },
          { radius: 3.48, start: -0.42, length: Math.PI * 1.34, opacity: 0.36 },
          { radius: 5.72, start: 0.72, length: Math.PI * 1.18, opacity: 0.3 },
          { radius: 4.86, start: 2.65, length: Math.PI * 0.52, opacity: 0.2 },
        ].map((arc, index) => (
          <Line key={index} points={arcPoints(arc.radius, arc.start, arc.length)} color="#bda36e" lineWidth={0.76 - index * 0.1} transparent opacity={arc.opacity} />
        ))}

        {constellations.map((points, index) => (
          <group key={index}>
            <Line points={points} color="#a99365" lineWidth={0.5} transparent opacity={0.3} />
            {points.map((point, pointIndex) => (
              <mesh key={pointIndex} position={point} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.018, 0.035, 18]} />
                <meshBasicMaterial color="#cdb57e" transparent opacity={0.56} depthWrite={false} />
              </mesh>
            ))}
          </group>
        ))}

        {Array.from({ length: 48 }, (_, index) => {
          const angle = index / 48 * Math.PI * 2;
          return (
            <mesh key={index} position={[Math.cos(angle) * 6.03, 0.035, Math.sin(angle) * 6.03]} rotation={[-Math.PI / 2, 0, -angle]}>
              <boxGeometry args={[index % 4 === 0 ? 0.13 : 0.052, 0.008, 0.008]} />
              <meshBasicMaterial color="#c0a66e" transparent opacity={index % 4 === 0 ? 0.58 : 0.3} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
