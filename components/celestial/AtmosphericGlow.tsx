"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type AtmosphericGlowProps = {
  awakened: boolean;
  hovered: boolean;
  opacity?: number;
};

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uIntensity;
  uniform float uAwaken;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 3.4);
    vec3 coldBlue = vec3(0.28, 0.39, 0.58);
    vec3 paleGold = vec3(0.53, 0.43, 0.25);
    vec3 color = mix(coldBlue, paleGold, uAwaken * 0.28);
    gl_FragColor = vec4(color, rim * uIntensity);
  }
`;

export function AtmosphericGlow({ awakened, hovered, opacity = 0.14 }: AtmosphericGlowProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uIntensity: { value: opacity * 0.35 }, uAwaken: { value: 0 } }), [opacity]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uAwaken.value = THREE.MathUtils.damp(materialRef.current.uniforms.uAwaken.value, awakened ? 1 : 0, 0.75, delta);
    materialRef.current.uniforms.uIntensity.value = THREE.MathUtils.damp(materialRef.current.uniforms.uIntensity.value, opacity * (awakened ? 1 : 0.38) * (hovered ? 1.22 : 1), 0.9, delta);
  });

  return (
    <mesh scale={1.055} renderOrder={-1}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial ref={materialRef} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}
