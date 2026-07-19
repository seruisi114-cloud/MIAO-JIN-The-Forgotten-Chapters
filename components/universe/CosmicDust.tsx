"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { dustFragmentShader, dustVertexShader } from "@/three/shaders/dust";

type CosmicDustProps = {
  reducedMotion: boolean;
  awakened: boolean;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1103515245 + 12345) >>> 0;
    return state / 4294967296;
  };
}

function createDustGeometry(count: number, seed: number, foreground: boolean) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (random() - 0.5) * (foreground ? 10 : 17);
    positions[offset + 1] = (random() - 0.5) * (foreground ? 6 : 9);
    positions[offset + 2] = foreground ? 0.35 - random() * 4.4 : -3 - random() * 12;

    const ancientGold = random() < (foreground ? 0.14 : 0.07);
    if (ancientGold) {
      colors[offset] = 0.52;
      colors[offset + 1] = 0.42;
      colors[offset + 2] = 0.25;
    } else {
      const shade = 0.58 + random() * 0.18;
      colors[offset] = shade;
      colors[offset + 1] = shade * 1.01;
      colors[offset + 2] = shade * 1.07;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export function CosmicDust({ reducedMotion, awakened }: CosmicDustProps) {
  const middleRef = useRef<THREE.Points>(null);
  const foregroundRef = useRef<THREE.Points>(null);
  const middleMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const foregroundMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const viewport = useThree((state) => state.viewport);
  const wakeTime = useRef(0);
  const middleGeometry = useMemo(() => createDustGeometry(620, 70103, false), []);
  const foregroundGeometry = useMemo(() => createDustGeometry(105, 31117, true), []);
  const middleUniforms = useMemo(() => ({ uPointer: { value: new THREE.Vector2() }, uGravity: { value: 0 }, uSize: { value: 0.75 }, uOpacity: { value: 0.22 } }), []);
  const foregroundUniforms = useMemo(() => ({ uPointer: { value: new THREE.Vector2() }, uGravity: { value: 0 }, uSize: { value: 1.35 }, uOpacity: { value: 0.34 } }), []);

  useFrame(({ pointer }, delta) => {
    const smoothing = 1 - Math.exp(-delta * 1.8);
    if (awakened) wakeTime.current = Math.min(5.5, wakeTime.current + delta);
    else wakeTime.current = 0;
    const reveal = awakened ? THREE.MathUtils.smoothstep(wakeTime.current, 3.4, 5.0) : 0;
    const pointerWorld = new THREE.Vector2(pointer.x * viewport.width * 0.5, pointer.y * viewport.height * 0.5);

    if (middleMaterialRef.current) {
      middleMaterialRef.current.uniforms.uPointer.value.lerp(pointerWorld, smoothing);
      middleMaterialRef.current.uniforms.uGravity.value = reducedMotion ? 0 : 0.32;
      middleMaterialRef.current.uniforms.uOpacity.value = THREE.MathUtils.damp(middleMaterialRef.current.uniforms.uOpacity.value, THREE.MathUtils.lerp(0.18, 0.4, reveal), 0.75, delta);
    }
    if (foregroundMaterialRef.current) {
      foregroundMaterialRef.current.uniforms.uPointer.value.lerp(pointerWorld, smoothing);
      foregroundMaterialRef.current.uniforms.uGravity.value = reducedMotion ? 0 : 0.72;
      foregroundMaterialRef.current.uniforms.uOpacity.value = THREE.MathUtils.damp(foregroundMaterialRef.current.uniforms.uOpacity.value, THREE.MathUtils.lerp(0.24, 0.58, reveal), 0.75, delta);
    }
    if (reducedMotion) return;

    if (middleRef.current) {
      middleRef.current.position.x = THREE.MathUtils.lerp(middleRef.current.position.x, pointer.x * 0.06, smoothing);
      middleRef.current.position.y = THREE.MathUtils.lerp(middleRef.current.position.y, pointer.y * 0.04, smoothing);
      middleRef.current.rotation.z += delta * 0.0007;
    }

    if (foregroundRef.current) {
      foregroundRef.current.position.x = THREE.MathUtils.lerp(foregroundRef.current.position.x, pointer.x * 0.16, smoothing);
      foregroundRef.current.position.y = THREE.MathUtils.lerp(foregroundRef.current.position.y, pointer.y * 0.1, smoothing);
    }
  });

  return (
    <>
      <points ref={middleRef} geometry={middleGeometry} frustumCulled={false} renderOrder={1}>
        <shaderMaterial ref={middleMaterialRef} uniforms={middleUniforms} vertexShader={dustVertexShader} fragmentShader={dustFragmentShader} transparent vertexColors depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points ref={foregroundRef} geometry={foregroundGeometry} frustumCulled={false} renderOrder={2}>
        <shaderMaterial ref={foregroundMaterialRef} uniforms={foregroundUniforms} vertexShader={dustVertexShader} fragmentShader={dustFragmentShader} transparent vertexColors depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}
