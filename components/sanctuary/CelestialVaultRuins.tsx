"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function CelestialVaultRuins({ reducedMotion }: { reducedMotion: boolean }) {
  const relicsRef = useRef<THREE.Group>(null);
  const runesRef = useRef<THREE.Group>(null);
  const fragments = useMemo(() => {
    const random = seededRandom(1907719);
    return Array.from({ length: 18 }, (_, index) => ({
      position: [
        (random() - 0.5) * 10.8,
        1.05 + random() * 4.8,
        -4.8 + random() * 5.6,
      ] as [number, number, number],
      rotation: [random() * Math.PI, random() * Math.PI, random() * Math.PI] as [number, number, number],
      scale: [0.04 + random() * 0.08, 0.12 + random() * 0.34, 0.025 + random() * 0.055] as [number, number, number],
      gold: index % 5 === 0,
    }));
  }, []);

  useFrame(({ clock }, delta) => {
    if (reducedMotion) return;
    if (relicsRef.current) {
      relicsRef.current.rotation.y += delta * 0.0018;
      relicsRef.current.position.y = Math.sin(clock.elapsedTime * 0.09) * 0.035;
    }
    if (runesRef.current) runesRef.current.rotation.y -= delta * 0.006;
  });

  return (
    <group>
      <group position={[0, 0.1, -4.55]}>
        {[-4.35, 4.35].map((x) => (
          <group key={x} position={[x, 2.35, 0]}>
            <mesh>
              <cylinderGeometry args={[0.16, 0.25, 4.7, 20]} />
              <meshPhysicalMaterial color="#222b3e" roughness={0.66} metalness={0.16} emissive="#263957" emissiveIntensity={0.12} transparent opacity={0.64} />
            </mesh>
            <mesh position={[0, 2.28, 0]}>
              <cylinderGeometry args={[0.34, 0.17, 0.2, 24]} />
              <meshStandardMaterial color="#3d4659" roughness={0.7} emissive="#5f523a" emissiveIntensity={0.08} transparent opacity={0.52} />
            </mesh>
            <mesh position={[0, -2.27, 0]}>
              <cylinderGeometry args={[0.36, 0.47, 0.2, 24]} />
              <meshStandardMaterial color="#293143" roughness={0.74} transparent opacity={0.62} />
            </mesh>
          </group>
        ))}

        <mesh position={[0, 3.9, 0]} rotation={[0, 0, 0.1]}>
          <torusGeometry args={[4.35, 0.055, 8, 112, Math.PI * 0.78]} />
          <meshStandardMaterial color="#5f5542" emissive="#a88d59" emissiveIntensity={0.12} roughness={0.76} metalness={0.32} transparent opacity={0.42} />
        </mesh>
        <mesh position={[0.32, 3.95, -0.04]} rotation={[0, 0, Math.PI + 0.08]}>
          <torusGeometry args={[4.05, 0.018, 8, 96, Math.PI * 0.69]} />
          <meshBasicMaterial color="#c1a66f" transparent opacity={0.25} depthWrite={false} />
        </mesh>

        {[-2.65, -1.32, 0, 1.32, 2.65].map((x, index) => (
          <Line
            key={x}
            points={[[x, 0.2, 0.08], [x * 1.18, 2.6, -0.02], [x * 0.7, 5.2 - Math.abs(x) * 0.16, -0.12]]}
            color={index === 2 ? "#9fb1cf" : "#a78d5d"}
            lineWidth={index === 2 ? 0.38 : 0.3}
            transparent
            opacity={index === 2 ? 0.19 : 0.23}
          />
        ))}
      </group>

      <group ref={runesRef} position={[0, 3.35, -2.8]} rotation={[Math.PI / 2.5, 0, 0]}>
        {Array.from({ length: 24 }, (_, index) => {
          const angle = index / 24 * Math.PI * 2;
          const radius = index % 3 === 0 ? 3.95 : 4.08;
          return (
            <group key={index} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]} rotation={[0, 0, angle]}>
              <mesh>
                <boxGeometry args={[index % 4 === 0 ? 0.2 : 0.08, 0.012, 0.018]} />
                <meshBasicMaterial color="#bda26d" transparent opacity={index % 4 === 0 ? 0.34 : 0.2} depthWrite={false} />
              </mesh>
              {index % 4 === 0 ? (
                <mesh position={[0, 0.09, 0]}>
                  <ringGeometry args={[0.025, 0.038, 12]} />
                  <meshBasicMaterial color="#d0bd91" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
              ) : null}
            </group>
          );
        })}
      </group>

      <group ref={relicsRef}>
        {fragments.map((fragment, index) => (
          <mesh key={index} position={fragment.position} rotation={fragment.rotation} scale={fragment.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={fragment.gold ? "#64573e" : "#273043"}
              emissive={fragment.gold ? "#92794d" : "#253a5a"}
              emissiveIntensity={fragment.gold ? 0.12 : 0.07}
              roughness={0.82}
              metalness={fragment.gold ? 0.3 : 0.1}
              transparent
              opacity={fragment.gold ? 0.55 : 0.44}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
