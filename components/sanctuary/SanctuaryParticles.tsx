"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sanctuaryMotion, sanctuaryPalette } from "./visualSystem";

export function SanctuaryParticles({ skipIntro = false }: { skipIntro?: boolean }) {
  const rootRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const particleField = useMemo(() => {
    const count = 42;
    const values = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const gold = new THREE.Color(sanctuaryPalette.champagneGold);
    const moon = new THREE.Color(sanctuaryPalette.moonWhite);
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      const progress = (index % 14) / 13;
      const lane = Math.floor(index / 14) - 1;
      const direction = lane === 0 ? 0 : lane;
      const arc = Math.sin(progress * Math.PI);
      values[offset] = direction === 0 ? Math.sin(index * 2.1) * 0.46 : direction * progress * 4.1 + Math.sin(index * 1.7) * 0.18;
      values[offset + 1] = 0.42 + arc * (direction === 0 ? 2.65 : 1.08) + (index % 3) * 0.08;
      values[offset + 2] = -1.2 + progress * 3.5 + Math.cos(index * 1.3) * 0.18;
      const color = (index % 5 === 0 ? moon : gold).clone().multiplyScalar(0.68 + arc * 0.25);
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
    }
    return { positions: values, colors };
  }, []);

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 9.85, 10.75);
    if (materialRef.current) {
      const breathe = 0.17 + Math.sin(clock.elapsedTime * sanctuaryMotion.breathe) * 0.025;
      materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, reveal * breathe, 1.7, delta);
    }
  });

  return (
    <group>
      <points ref={rootRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particleField.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[particleField.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={materialRef} vertexColors size={0.026} sizeAttenuation transparent opacity={skipIntro ? 0.17 : 0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}
