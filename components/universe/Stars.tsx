"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { starsFragmentShader, starsVertexShader } from "@/three/shaders/stars";

type StarsProps = {
  reducedMotion: boolean;
  awakened: boolean;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function gaussian(random: () => number) {
  const first = Math.max(random(), 0.0001);
  const second = random();
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(Math.PI * 2 * second);
}

function createStarGeometry(count: number, seed: number, middleLayer: boolean) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const clusters = [
    new THREE.Vector2(-5.8, 2.2),
    new THREE.Vector2(4.9, -1.7),
    new THREE.Vector2(1.8, 3.9),
  ];

  for (let index = 0; index < count; index += 1) {
    const clustered = random() < (middleLayer ? 0.46 : 0.62);
    const cluster = clusters[Math.floor(random() * clusters.length)];
    let x = clustered ? cluster.x + gaussian(random) * 2.8 : (random() - 0.5) * 24;
    let y = clustered ? cluster.y + gaussian(random) * 1.45 : (random() - 0.5) * 12;
    const inDarkLane = Math.abs(y + x * 0.17) < 1.05 && x > -3.5 && x < 5.5;
    if (inDarkLane && random() < 0.86) {
      x += random() < 0.5 ? -5.5 : 5.5;
      y += gaussian(random) * 0.7;
    }

    const offset = index * 3;
    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = middleLayer ? -3.5 - random() * 8.5 : -12 - random() * 23;
    const warmth = random();
    colors[offset] = 0.52 + warmth * 0.18;
    colors[offset + 1] = 0.56 + warmth * 0.15;
    colors[offset + 2] = 0.64 + warmth * 0.09;
    sizes[index] = middleLayer ? 1.35 + Math.pow(random(), 3) * 2.8 : 0.7 + random() * 1.15;
    phases[index] = random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  return geometry;
}

export function Stars({ reducedMotion, awakened }: StarsProps) {
  const farRef = useRef<THREE.Points>(null);
  const middleRef = useRef<THREE.Points>(null);
  const farMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const middleMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const wakeTime = useRef(0);
  const pixelRatio = useThree((state) => state.gl.getPixelRatio());

  const farGeometry = useMemo(() => createStarGeometry(920, 19260817, false), []);
  const middleGeometry = useMemo(() => createStarGeometry(92, 4700719, true), []);
  const farUniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uOpacity: { value: 0.5 } }), [pixelRatio]);
  const middleUniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uOpacity: { value: 0.38 } }), [pixelRatio]);

  useFrame(({ clock }, delta) => {
    const time = reducedMotion ? 0 : clock.elapsedTime;
    if (awakened) wakeTime.current = Math.min(5.5, wakeTime.current + delta);
    else wakeTime.current = 0;
    const reveal = awakened ? THREE.MathUtils.smoothstep(wakeTime.current, 3.2, 4.9) : 0;
    if (farMaterialRef.current) farMaterialRef.current.uniforms.uTime.value = time;
    if (middleMaterialRef.current) middleMaterialRef.current.uniforms.uTime.value = time;
    if (farMaterialRef.current) farMaterialRef.current.uniforms.uOpacity.value = THREE.MathUtils.damp(farMaterialRef.current.uniforms.uOpacity.value, THREE.MathUtils.lerp(0.5, 0.94, reveal), 0.75, delta);
    if (middleMaterialRef.current) middleMaterialRef.current.uniforms.uOpacity.value = THREE.MathUtils.damp(middleMaterialRef.current.uniforms.uOpacity.value, THREE.MathUtils.lerp(0.38, 0.84, reveal), 0.75, delta);
    if (reducedMotion) return;
    if (farRef.current) farRef.current.rotation.y += delta * 0.00065;
    if (middleRef.current) middleRef.current.rotation.y -= delta * 0.0012;
  });

  return (
    <>
      <points ref={farRef} geometry={farGeometry} frustumCulled={false} renderOrder={-1}>
        <shaderMaterial ref={farMaterialRef} uniforms={farUniforms} vertexShader={starsVertexShader} fragmentShader={starsFragmentShader} transparent vertexColors depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points ref={middleRef} geometry={middleGeometry} frustumCulled={false} renderOrder={0}>
        <shaderMaterial ref={middleMaterialRef} uniforms={middleUniforms} vertexShader={starsVertexShader} fragmentShader={starsFragmentShader} transparent vertexColors depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}
