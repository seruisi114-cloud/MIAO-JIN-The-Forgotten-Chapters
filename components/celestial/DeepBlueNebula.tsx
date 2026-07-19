"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { nebulaFragmentShader, nebulaVertexShader } from "@/three/shaders/nebula";

type DeepBlueNebulaProps = {
  reducedMotion: boolean;
  awakened: boolean;
};

export function DeepBlueNebula({ reducedMotion, awakened }: DeepBlueNebulaProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const wakeTime = useRef(0);
  const viewport = useThree((state) => state.viewport);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMotion: { value: reducedMotion ? 0 : 1 },
      uAwaken: { value: 0 },
    }),
    [reducedMotion],
  );

  useFrame(({ clock }, delta) => {
    if (materialRef.current) {
      if (awakened) wakeTime.current = Math.min(5.5, wakeTime.current + delta);
      else wakeTime.current = 0;
      const reveal = awakened ? THREE.MathUtils.smoothstep(wakeTime.current, 1.75, 3.25) : 0;
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
      materialRef.current.uniforms.uAwaken.value = THREE.MathUtils.damp(materialRef.current.uniforms.uAwaken.value, reveal, 0.65, delta);
    }
  });

  return (
    <mesh position={[0, 0, -0.5]} scale={[viewport.width * 1.12, viewport.height * 1.12, 1]} renderOrder={-2}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={nebulaVertexShader}
        fragmentShader={nebulaFragmentShader}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
