"use client";

import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { rippleFragmentShader, rippleVertexShader } from "@/three/shaders/ripple";

type SpaceRippleProps = {
  reducedMotion: boolean;
};

export function SpaceRipple({ reducedMotion }: SpaceRippleProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const targetPointer = useRef(new THREE.Vector2(0.5, 0.5));
  const currentPointer = useRef(new THREE.Vector2(0.5, 0.5));
  const targetStrength = useRef(0);
  const pulse = useRef(-1);
  const viewport = useThree((state) => state.viewport);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uAspect: { value: 1 },
      uPulse: { value: -1 },
    }),
    [],
  );

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (reducedMotion || !event.uv) return;
    targetPointer.current.copy(event.uv);
    targetStrength.current = Math.min(targetStrength.current + 0.22, 0.72);
  };

  const handlePointerLeave = () => {
    targetStrength.current = 0;
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (reducedMotion || !event.uv) return;
    targetPointer.current.copy(event.uv);
    pulse.current = 0;
    targetStrength.current = 0.8;
  };

  useFrame(({ clock }, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const smoothing = 1 - Math.exp(-delta * 8);
    currentPointer.current.lerp(targetPointer.current, smoothing);
    targetStrength.current *= Math.exp(-delta * 1.18);
    if (pulse.current >= 0) {
      pulse.current += delta * 0.42;
      if (pulse.current > 1.1) pulse.current = -1;
    }

    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uPointer.value.copy(currentPointer.current);
    material.uniforms.uStrength.value = THREE.MathUtils.lerp(
      material.uniforms.uStrength.value,
      reducedMotion ? 0 : targetStrength.current,
      smoothing,
    );
    material.uniforms.uAspect.value = viewport.width / Math.max(viewport.height, 0.001);
    material.uniforms.uPulse.value = pulse.current;
  });

  return (
    <mesh
      position={[0, 0, 0.25]}
      scale={[viewport.width * 1.05, viewport.height * 1.05, 1]}
      renderOrder={4}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={rippleVertexShader}
        fragmentShader={rippleFragmentShader}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
