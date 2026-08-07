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
  const relicRef = useRef<THREE.Group>(null);
  const relicMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
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

    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 0.56, 2.72);
    const hoverReveal = active ? 1 : hovered ? 0.16 : 0.025;
    const intensity = Math.max(reveal, hoverReveal);

    if (beamOuterRef.current) {
      beamOuterRef.current.opacity = THREE.MathUtils.damp(
        beamOuterRef.current.opacity,
        active ? reveal * 0.13 : 0,
        2.2,
        delta,
      );
    }
    if (beamInnerRef.current) {
      beamInnerRef.current.opacity = THREE.MathUtils.damp(
        beamInnerRef.current.opacity,
        active ? reveal * 0.23 : 0,
        2.5,
        delta,
      );
    }
    if (coreRef.current) {
      coreRef.current.opacity = THREE.MathUtils.damp(
        coreRef.current.opacity,
        active ? reveal * 0.86 : hovered ? 0.14 : 0.035,
        2.4,
        delta,
      );
    }
    if (dustMaterialRef.current) {
      dustMaterialRef.current.opacity = THREE.MathUtils.damp(
        dustMaterialRef.current.opacity,
        active ? reveal * 0.82 : hovered ? 0.18 : 0.045,
        2,
        delta,
      );
    }
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.damp(
        lightRef.current.intensity,
        active ? 0.16 + reveal * 8.2 : hovered ? 1.1 : 0.16,
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
    if (relicRef.current) {
      relicRef.current.visible = active || hovered;
      relicRef.current.position.y = THREE.MathUtils.damp(relicRef.current.position.y, 0.06 + reveal * 0.9, 2.25, delta);
      relicRef.current.scale.setScalar(THREE.MathUtils.damp(relicRef.current.scale.x, active ? 0.14 + reveal * 0.86 : hovered ? 0.14 : 0.06, 2.2, delta));
      relicRef.current.rotation.y = THREE.MathUtils.damp(relicRef.current.rotation.y, active ? 0.18 : 0, 1.1, delta);
    }
    if (relicMaterialRef.current) {
      relicMaterialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        relicMaterialRef.current.emissiveIntensity,
        active ? 0.5 + reveal * 1.3 : hovered ? 0.24 : 0.08,
        2.2,
        delta,
      );
    }
  });

  return (
    <group position={[0, 0.96, 0.02]}>
      <pointLight ref={lightRef} color="#dce8f2" intensity={0.16} distance={7.5} decay={1.85} position={[0, 0.34, 0.08]} />

      <sprite position={[0, 0.34, 0.08]} scale={[2.25, 1.35, 1]}>
        <spriteMaterial ref={coreRef} map={glowTexture} color="#dbe8f4" transparent opacity={0.035} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      <group ref={relicRef} position={[0, 0.06, 0.08]} scale={0.06} visible={false}>
        <mesh>
          <sphereGeometry args={[0.18, 48, 32]} />
          <meshStandardMaterial
            ref={relicMaterialRef}
            color={sanctuaryPalette.warmMoon}
            roughness={0.28}
            metalness={0.02}
            emissive="#8daed2"
            emissiveIntensity={0.08}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0.28, -0.36]}>
          <torusGeometry args={[0.3, 0.009, 8, 64, Math.PI * 0.72]} />
          <meshStandardMaterial color={sanctuaryPalette.champagneGold} roughness={0.42} metalness={0.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2, Math.PI + 0.28, -0.36]}>
          <torusGeometry args={[0.3, 0.009, 8, 64, Math.PI * 0.72]} />
          <meshStandardMaterial color={sanctuaryPalette.champagneGold} roughness={0.42} metalness={0.9} />
        </mesh>
      </group>

      <mesh position={[0, 2.34, 0.02]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.62, 3.45, 64, 1, true]} />
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
