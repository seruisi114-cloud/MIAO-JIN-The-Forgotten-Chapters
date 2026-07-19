"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { memoryGuardianFragmentShader, memoryGuardianVertexShader } from "@/three/shaders/memoryGuardian";
import { MemoryGuardianParticles } from "@/components/sanctuary/MemoryGuardianParticles";

type MoonlitGuardianEchoProps = {
  playing: boolean;
  reducedMotion: boolean;
};

const echoProfile = [
  new THREE.Vector2(0.025, 0),
  new THREE.Vector2(0.31, 0.02),
  new THREE.Vector2(0.38, 0.12),
  new THREE.Vector2(0.3, 0.34),
  new THREE.Vector2(0.24, 0.76),
  new THREE.Vector2(0.34, 0.98),
  new THREE.Vector2(0.22, 1.21),
  new THREE.Vector2(0.13, 1.45),
  new THREE.Vector2(0.025, 1.55),
];

export function MoonlitGuardianEcho({ playing, reducedMotion }: MoonlitGuardianEchoProps) {
  const rootRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.MeshBasicMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAwakened: { value: 1 },
    uFormation: { value: 1 },
    uHover: { value: 0.18 },
    uActivation: { value: 0 },
    uOpacity: { value: 0.12 },
  }), []);

  useFrame(({ clock }, delta) => {
    const energy = playing ? 0.82 : 0.14;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime * (reducedMotion ? 0.2 : 1);
      materialRef.current.uniforms.uActivation.value = THREE.MathUtils.damp(materialRef.current.uniforms.uActivation.value, energy, 1.4, delta);
      materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.damp(materialRef.current.uniforms.uOpacity.value, playing ? 0.17 : 0.09, 1.2, delta);
    }
    if (rootRef.current) {
      rootRef.current.position.y = -0.245 + Math.sin(clock.elapsedTime * 0.28) * (reducedMotion ? 0.001 : 0.004);
      rootRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.11) * (reducedMotion ? 0.003 : 0.022);
    }
    if (haloRef.current) {
      haloRef.current.rotation.z += delta * (playing ? 0.065 : 0.018);
      haloRef.current.scale.setScalar(THREE.MathUtils.damp(haloRef.current.scale.x, playing ? 1.12 : 1, 1.2, delta));
    }
    if (coreRef.current) {
      const pulse = 0.12 + (playing ? 0.11 : 0.035) * (0.5 + Math.sin(clock.elapsedTime * (playing ? 1.1 : 0.52)) * 0.5);
      coreRef.current.opacity = THREE.MathUtils.damp(coreRef.current.opacity, pulse, 1.8, delta);
    }
  });

  return (
    <group ref={rootRef} position={[0.18, -0.245, 0.12]} scale={0.105} renderOrder={2}>
      <mesh>
        <latheGeometry args={[echoProfile, 56]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={memoryGuardianVertexShader}
          fragmentShader={memoryGuardianFragmentShader}
          transparent
          depthTest={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, 1.32, 0]} rotation={[-0.18, 0, -0.05]} scale={[0.68, 1.08, 0.65]}>
        <capsuleGeometry args={[0.13, 0.18, 10, 24]} />
        <meshBasicMaterial color="#b7c9dd" transparent opacity={playing ? 0.12 : 0.055} depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={haloRef} position={[0, 1.02, -0.12]} rotation={[0, 0, 0.4]}>
        <torusGeometry args={[0.59, 0.012, 8, 88, Math.PI * 1.48]} />
        <meshBasicMaterial color="#c9b27d" transparent opacity={playing ? 0.19 : 0.07} depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0.94, 0.25]}>
        <sphereGeometry args={[0.065, 20, 20]} />
        <meshBasicMaterial ref={coreRef} color="#edf2f2" transparent opacity={0.12} depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <MemoryGuardianParticles awakened hovered={false} activating={playing} index={11} />
    </group>
  );
}
