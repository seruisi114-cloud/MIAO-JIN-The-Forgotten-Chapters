"use client";

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

export function SanctuaryParticles({ reducedMotion, skipIntro = false }: { reducedMotion: boolean; skipIntro?: boolean }) {
  const rootRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const fragmentRef = useRef<THREE.Group>(null);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const initialFragmentScale = skipIntro ? 1 : 0.001;
  const positions = useMemo(() => {
    const random = seededRandom(7192026);
    const values = new Float32Array(84 * 3);
    for (let index = 0; index < 84; index += 1) {
      const offset = index * 3;
      const angle = random() * Math.PI * 2;
      const radius = 0.8 + random() * 5.1;
      values[offset] = Math.cos(angle) * radius;
      values[offset + 1] = 0.18 + random() * 3.6;
      values[offset + 2] = Math.sin(angle) * radius;
    }
    return values;
  }, []);

  const fragments = useMemo(() => {
    const random = seededRandom(8112026);
    return Array.from({ length: 12 }, (_, index) => ({
      position: [
        (random() - 0.5) * 7.4,
        0.45 + random() * 2.9,
        (random() - 0.5) * 6.4,
      ] as [number, number, number],
      rotation: [random() * Math.PI, random() * Math.PI, random() * Math.PI] as [number, number, number],
      scale: 0.45 + random() * 0.75,
      gold: index % 4 === 0,
    }));
  }, []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 9.85, 10.75);
    if (materialRef.current) materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, reveal * 0.34, 1.7, delta);
    if (fragmentRef.current) fragmentRef.current.scale.setScalar(THREE.MathUtils.damp(fragmentRef.current.scale.x, Math.max(0.001, reveal), 1.6, delta));
    if (reducedMotion) return;
    if (rootRef.current) {
      rootRef.current.rotation.y += delta * 0.006;
      rootRef.current.position.y = Math.sin(performance.now() * 0.00012) * 0.025;
    }
    if (fragmentRef.current) fragmentRef.current.rotation.y += delta * 0.004;
  });

  return (
    <group>
      <points ref={rootRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={materialRef} color="#b69d6d" size={0.024} sizeAttenuation transparent opacity={skipIntro ? 0.34 : 0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <group ref={fragmentRef} scale={initialFragmentScale}>
        {fragments.map((fragment, index) => (
          <mesh key={index} position={fragment.position} rotation={fragment.rotation} scale={fragment.scale}>
            <boxGeometry args={[0.025, 0.11, 0.018]} />
            <meshStandardMaterial color={fragment.gold ? "#66583f" : "#252c38"} emissive={fragment.gold ? "#8f7850" : "#26344a"} emissiveIntensity={0.08} roughness={0.8} metalness={0.18} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
