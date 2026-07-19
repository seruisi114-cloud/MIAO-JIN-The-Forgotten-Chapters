"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { guardianParticleFragmentShader, guardianParticleVertexShader } from "@/three/shaders/memoryGuardian";

type MemoryGuardianParticlesProps = {
  awakened: boolean;
  hovered: boolean;
  activating: boolean;
  index: number;
};

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function MemoryGuardianParticles({ awakened, hovered, activating, index }: MemoryGuardianParticlesProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const particleCount = awakened ? 58 : 18;
  const geometry = useMemo(() => {
    const random = seededRandom(1147 + index * 7919);
    const positions = new Float32Array(particleCount * 3);
    const seeds = new Float32Array(particleCount);
    const tones = new Float32Array(particleCount);
    for (let particle = 0; particle < particleCount; particle += 1) {
      const offset = particle * 3;
      const height = 0.32 + random() * 1.48;
      const radius = awakened ? 0.14 + random() * 0.54 : 0.22 + random() * 0.4;
      const angle = random() * Math.PI * 2;
      positions[offset] = Math.cos(angle) * radius;
      positions[offset + 1] = height;
      positions[offset + 2] = Math.sin(angle) * radius * 0.65;
      seeds[particle] = random();
      tones[particle] = awakened ? random() : 0.2 + random() * 0.2;
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    result.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    result.setAttribute("aTone", new THREE.BufferAttribute(tones, 1));
    return result;
  }, [awakened, index, particleCount]);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uEnergy: { value: 0 },
    uAwakened: { value: awakened ? 1 : 0 },
    uPixelRatio: { value: 1 },
  }), [awakened]);

  useFrame(({ gl }, delta) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uTime.value += delta;
    material.uniforms.uEnergy.value = THREE.MathUtils.damp(
      material.uniforms.uEnergy.value,
      activating ? 1 : hovered ? 0.56 : awakened ? 0.2 : 0.02,
      2.1,
      delta,
    );
    material.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.5);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={guardianParticleVertexShader}
        fragmentShader={guardianParticleFragmentShader}
        transparent
        depthWrite={false}
        blending={awakened ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}
