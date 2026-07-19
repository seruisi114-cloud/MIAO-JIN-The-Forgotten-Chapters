"use client";

import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec3 vPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.55;
    for (int i = 0; i < 4; i++) {
      value += noise(p) * amplitude;
      p = p * 2.03 + 3.17;
      amplitude *= 0.48;
    }
    return value;
  }

  void main() {
    vec3 direction = normalize(vPosition);
    vec2 uv = vec2(atan(direction.z, direction.x) / 6.28318 + 0.5, asin(direction.y) / 3.14159 + 0.5);
    float drift = uTime * 0.0025;
    float cloud = fbm(vec2(uv.x * 4.0 + drift, uv.y * 5.5));
    float ribbonA = exp(-pow(abs(uv.y - 0.57 - sin(uv.x * 8.0 + drift) * 0.055), 2.0) * 95.0);
    float ribbonB = exp(-pow(abs(uv.y - 0.31 - sin(uv.x * 5.0 - drift) * 0.04), 2.0) * 120.0);
    float mist = (ribbonA * 0.7 + ribbonB * 0.34) * smoothstep(0.28, 0.82, cloud);
    vec3 base = vec3(0.021, 0.046, 0.098);
    float violetVeil = exp(-pow(abs(uv.y - 0.72 + sin(uv.x * 4.0 - drift) * 0.035), 2.0) * 86.0) * smoothstep(0.36, 0.82, cloud);
    vec3 blueMist = vec3(0.078, 0.16, 0.31);
    vec3 violetMist = vec3(0.115, 0.064, 0.19);
    vec3 color = base + blueMist * mist * 0.82 + violetMist * violetVeil * 0.28 + vec3(0.03, 0.045, 0.085) * cloud * 0.24;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function StarDome() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock, pointer }, delta) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, pointer.x * 0.008, 0.75, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -pointer.y * 0.005, 0.75, delta);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh scale={34} renderOrder={-4}>
        <sphereGeometry args={[1, 64, 40]} />
        <shaderMaterial ref={materialRef} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <Stars radius={42} depth={24} count={960} factor={2.1} saturation={0} fade speed={0.12} />
      <Stars radius={34} depth={18} count={86} factor={4.2} saturation={0} fade speed={0.08} />
      <Stars radius={29} depth={13} count={32} factor={6.2} saturation={0.08} fade speed={0.055} />
    </group>
  );
}
