"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createMoonGlowTexture } from "./ReliquaryTextures";
import { sanctuaryPalette } from "./visualSystem";

type MusicBoxAwakeningProps = {
  active: boolean;
  hovered: boolean;
};

function createRisingDust() {
  const positions = new Float32Array(32 * 3);
  const seeds = new Float32Array(32 * 4);

  for (let index = 0; index < 32; index += 1) {
    const angle = index * 2.399963;
    const radius = 0.14 + ((index * 17) % 29) / 29 * 1.12;
    const height = ((index * 11) % 31) / 31 * 2.9;
    const speed = 0.2 + ((index * 7) % 13) / 13 * 0.2;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = 0.12 + height;
    positions[index * 3 + 2] = Math.sin(angle) * radius * 0.56;
    seeds.set([angle, radius, height, speed], index * 4);
  }

  return { positions, seeds };
}

export function MusicBoxAwakening({ active, hovered }: MusicBoxAwakeningProps) {
  const beamOuterRef = useRef<THREE.MeshBasicMaterial>(null);
  const beamInnerRef = useRef<THREE.MeshBasicMaterial>(null);
  const coreRef = useRef<THREE.SpriteMaterial>(null);
  const dustRef = useRef<THREE.Points>(null);
  const dustMaterialRef = useRef<THREE.PointsMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const elapsed = useRef(0);
  const glowTexture = useMemo(() => createMoonGlowTexture(), []);
  const dust = useMemo(() => createRisingDust(), []);

  useEffect(() => () => glowTexture.dispose(), [glowTexture]);

  useFrame(({ clock }, delta) => {
    elapsed.current = THREE.MathUtils.clamp(
      elapsed.current + (active ? delta : -delta * 1.7),
      0,
      4.8,
    );

    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 0.48, 2.15);
    const hoverReveal = active ? 1 : hovered ? 0.16 : 0.025;
    const intensity = Math.max(reveal, hoverReveal);

    if (beamOuterRef.current) {
      beamOuterRef.current.opacity = THREE.MathUtils.damp(
        beamOuterRef.current.opacity,
        active ? 0.082 : 0,
        2.2,
        delta,
      );
    }
    if (beamInnerRef.current) {
      beamInnerRef.current.opacity = THREE.MathUtils.damp(
        beamInnerRef.current.opacity,
        active ? 0.14 : 0,
        2.5,
        delta,
      );
    }
    if (coreRef.current) {
      coreRef.current.opacity = THREE.MathUtils.damp(
        coreRef.current.opacity,
        active ? 0.66 : hovered ? 0.14 : 0.035,
        2.4,
        delta,
      );
    }
    if (dustMaterialRef.current) {
      dustMaterialRef.current.opacity = THREE.MathUtils.damp(
        dustMaterialRef.current.opacity,
        active ? 0.76 : hovered ? 0.18 : 0.045,
        2,
        delta,
      );
    }
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.damp(
        lightRef.current.intensity,
        active ? 5.8 : hovered ? 1.1 : 0.16,
        2.2,
        delta,
      );
    }

    const geometry = dustRef.current?.geometry;
    const attribute = geometry?.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (attribute) {
      const values = attribute.array as Float32Array;
      for (let index = 0; index < 32; index += 1) {
        const angle = dust.seeds[index * 4];
        const radius = dust.seeds[index * 4 + 1];
        const baseHeight = dust.seeds[index * 4 + 2];
        const speed = dust.seeds[index * 4 + 3];
        const rise = active ? (baseHeight + elapsed.current * speed) % 3.1 : baseHeight * 0.12;
        values[index * 3] = Math.cos(angle + clock.elapsedTime * 0.08) * radius * (0.72 + reveal * 0.28);
        values[index * 3 + 1] = 0.12 + rise;
        values[index * 3 + 2] = Math.sin(angle + clock.elapsedTime * 0.06) * radius * 0.56;
      }
      attribute.needsUpdate = true;
    }

    if (dustRef.current) {
      dustRef.current.scale.setScalar(0.82 + intensity * 0.18);
    }
  });

  return (
    <group position={[0, 0.96, 0.02]}>
      <pointLight ref={lightRef} color="#dce8f2" intensity={0.16} distance={7.5} decay={1.85} position={[0, 0.34, 0.08]} />

      <sprite position={[0, 0.34, 0.08]} scale={[2.25, 1.35, 1]}>
        <spriteMaterial ref={coreRef} map={glowTexture} color="#dbe8f4" transparent opacity={0.035} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      <mesh position={[0, 2.34, 0.02]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.48, 3.45, 64, 1, true]} />
        <meshBasicMaterial ref={beamOuterRef} color="#b9cde3" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 2.12, 0.02]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.72, 2.96, 64, 1, true]} />
        <meshBasicMaterial ref={beamInnerRef} color={sanctuaryPalette.moonWhite} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>

      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust.positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={dustMaterialRef}
          color={sanctuaryPalette.champagneGold}
          size={0.027}
          sizeAttenuation
          transparent
          opacity={0.045}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
