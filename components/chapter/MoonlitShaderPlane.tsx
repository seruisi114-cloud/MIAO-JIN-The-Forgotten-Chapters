"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { moonlitSceneFragmentShader, moonlitSceneVertexShader } from "@/three/shaders/moonlitStarSea";

type MoonlitShaderPlaneProps = {
  playing: boolean;
  reducedMotion: boolean;
};

export function MoonlitShaderPlane({ playing, reducedMotion }: MoonlitShaderPlaneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPlaying: { value: 0 },
    uAspect: { value: 1 },
    uPointer: { value: new THREE.Vector2() },
    uCameraFloat: { value: new THREE.Vector2() },
  }), []);

  useFrame(({ clock, pointer }, delta) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uTime.value += delta * (reducedMotion ? 0.12 : 1);
    material.uniforms.uPlaying.value = THREE.MathUtils.damp(material.uniforms.uPlaying.value, playing ? 1 : 0, 1.4, delta);
    material.uniforms.uAspect.value = size.width / Math.max(size.height, 1);
    material.uniforms.uPointer.value.lerp(reducedMotion ? new THREE.Vector2() : pointer, 1 - Math.exp(-delta * 1.25));
    const driftX = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.11) * 0.0024;
    const driftY = reducedMotion ? 0 : Math.cos(clock.elapsedTime * 0.085) * 0.0032;
    material.uniforms.uCameraFloat.value.x = THREE.MathUtils.damp(material.uniforms.uCameraFloat.value.x, driftX, 0.8, delta);
    material.uniforms.uCameraFloat.value.y = THREE.MathUtils.damp(material.uniforms.uCameraFloat.value.y, driftY, 0.8, delta);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={moonlitSceneVertexShader}
        fragmentShader={moonlitSceneFragmentShader}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
