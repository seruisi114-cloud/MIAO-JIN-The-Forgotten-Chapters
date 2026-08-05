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

export function SanctuaryParticles({ skipIntro = false }: { skipIntro?: boolean }) {
  const rootRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const particleField = useMemo(() => {
    const random = seededRandom(7192026);
    const values = new Float32Array(52 * 3);
    const colors = new Float32Array(52 * 3);
    const palette = [new THREE.Color("#b59b69"), new THREE.Color("#c9d2dc"), new THREE.Color("#566982")];
    for (let index = 0; index < 52; index += 1) {
      const offset = index * 3;
      const angle = random() * Math.PI * 2;
      const radius = 0.75 + Math.pow(random(), 0.72) * 6.2;
      values[offset] = Math.cos(angle) * radius;
      values[offset + 1] = 0.15 + random() * 4.35;
      values[offset + 2] = Math.sin(angle) * radius * (0.72 + random() * 0.4);
      const color = palette[index % palette.length].clone().multiplyScalar(0.68 + random() * 0.32);
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
    }
    return { positions: values, colors };
  }, []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 9.85, 10.75);
    if (materialRef.current) materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, reveal * 0.2, 1.7, delta);
  });

  return (
    <group>
      <points ref={rootRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particleField.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[particleField.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={materialRef} vertexColors size={0.024} sizeAttenuation transparent opacity={skipIntro ? 0.2 : 0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}
