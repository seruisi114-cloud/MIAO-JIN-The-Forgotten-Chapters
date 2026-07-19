"use client";

import { Html } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

type DormantNebulaProps = {
  position: [number, number, number];
  seed: number;
  revealDelay: number;
  index: number;
  skipIntro?: boolean;
  onHoverChange: (index: number | null) => void;
};

const pointVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uHover;
  varying float vAlpha;
  void main() {
    vec3 transformed = position;
    transformed.y += sin(uTime * 0.22 + aPhase) * (0.018 + uHover * 0.035);
    transformed.xz *= 1.0 + sin(uTime * 0.16 + aPhase) * 0.018 * uHover;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_PointSize = aSize * (92.0 / max(1.0, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = 0.52 + sin(aPhase) * 0.16;
  }
`;

const pointFragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float soft = smoothstep(0.5, 0.08, distanceToCenter);
    soft *= smoothstep(0.52, 0.28, distanceToCenter);
    if (soft < 0.01) discard;
    gl_FragColor = vec4(uColor, soft * vAlpha * uOpacity);
  }
`;

const cloudVertexShader = /* glsl */ `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const cloudFragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uHover;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vView;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash(i);
    float n100 = hash(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash(i + vec3(1.0));
    return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y), mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
  }

  void main() {
    vec3 samplePosition = vPosition * 3.1 + vec3(uTime * 0.025, -uTime * 0.012, uTime * 0.018);
    float cloud = noise(samplePosition) * 0.62 + noise(samplePosition * 2.15 + 3.2) * 0.38;
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.4);
    float density = smoothstep(0.28, 0.82, cloud) * 0.28 + rim * (0.16 + uHover * 0.12);
    vec3 color = mix(vec3(0.012, 0.024, 0.06), vec3(0.08, 0.15, 0.29), rim + cloud * 0.24);
    gl_FragColor = vec4(color, density);
  }
`;

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createParticles(seed: number, count: number, gold = false) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const radius = Math.pow(random(), 0.68);
    const angle = random() * Math.PI * 2;
    const offset = index * 3;
    positions[offset] = Math.cos(angle) * radius * (0.7 + random() * 0.42);
    positions[offset + 1] = (random() - 0.5) * (0.28 + radius * 0.52);
    positions[offset + 2] = Math.sin(angle) * radius * 0.72 + (random() - 0.5) * 0.2;
    sizes[index] = gold ? 0.38 + random() * 0.42 : 0.72 + random() * 1.35;
    phases[index] = random() * Math.PI * 2;
  }
  return { positions, sizes, phases };
}

export function DormantNebula({ position, seed, revealDelay, index, skipIntro = false, onHoverChange }: DormantNebulaProps) {
  const rootRef = useRef<THREE.Group>(null);
  const mistMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const goldMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const cloudMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const initialScale = skipIntro ? 1 : 0.001;
  const [isHovered, setIsHovered] = useState(false);
  const mist = useMemo(() => createParticles(seed, 210), [seed]);
  const gold = useMemo(() => createParticles(seed + 909, 22, true), [seed]);
  const mistUniforms = useMemo(() => ({ uTime: { value: 0 }, uHover: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color("#172542") } }), []);
  const goldUniforms = useMemo(() => ({ uTime: { value: 0 }, uHover: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color("#a88e5f") } }), []);
  const cloudUniforms = useMemo(() => ({ uTime: { value: 0 }, uHover: { value: 0 } }), []);

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, revealDelay, revealDelay + 1.25);
    if (rootRef.current) {
      rootRef.current.rotation.y += delta * (hovered.current ? 0.13 : 0.025);
      const target = reveal * (hovered.current ? 1.08 : 1);
      rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, Math.max(0.001, target), 2, delta));
    }
    [mistMaterialRef.current, goldMaterialRef.current].forEach((material) => {
      if (!material) return;
      material.uniforms.uTime.value = clock.elapsedTime;
      material.uniforms.uHover.value = THREE.MathUtils.damp(material.uniforms.uHover.value, hovered.current ? 1 : 0, 2, delta);
    });
    if (mistMaterialRef.current) mistMaterialRef.current.uniforms.uOpacity.value = THREE.MathUtils.damp(mistMaterialRef.current.uniforms.uOpacity.value, reveal * 0.82, 2, delta);
    if (goldMaterialRef.current) goldMaterialRef.current.uniforms.uOpacity.value = THREE.MathUtils.damp(goldMaterialRef.current.uniforms.uOpacity.value, reveal * 0.68, 2, delta);
    if (cloudMaterialRef.current) {
      cloudMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
      cloudMaterialRef.current.uniforms.uHover.value = THREE.MathUtils.damp(cloudMaterialRef.current.uniforms.uHover.value, hovered.current ? 1 : 0, 2, delta);
    }
  });

  const handlePointer = (event: ThreeEvent<PointerEvent>, active: boolean) => {
    event.stopPropagation();
    hovered.current = active;
    setIsHovered(active);
    onHoverChange(active ? index : null);
  };

  const particleLayer = (data: ReturnType<typeof createParticles>, material: "mist" | "gold") => (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[data.phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material === "mist" ? mistMaterialRef : goldMaterialRef}
        uniforms={material === "mist" ? mistUniforms : goldUniforms}
        vertexShader={pointVertexShader}
        fragmentShader={pointFragmentShader}
        transparent
        depthWrite={false}
        blending={material === "gold" ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );

  return (
    <group ref={rootRef} position={position} scale={initialScale} onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)}>
      {particleLayer(mist, "mist")}
      {particleLayer(gold, "gold")}
      <mesh scale={[0.85, 0.48, 0.75]}>
        <sphereGeometry args={[1, 48, 36]} />
        <shaderMaterial ref={cloudMaterialRef} uniforms={cloudUniforms} vertexShader={cloudVertexShader} fragmentShader={cloudFragmentShader} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh scale={[0.62, 0.32, 0.58]} rotation={[0.2, 0.45, -0.1]}>
        <sphereGeometry args={[1, 40, 28]} />
        <shaderMaterial uniforms={cloudUniforms} vertexShader={cloudVertexShader} fragmentShader={cloudFragmentShader} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <Html center position={[0, -0.72, 0]} distanceFactor={8.5} style={{ pointerEvents: "none" }}>
        <div className={`sanctuary-label sanctuary-label--dormant${isHovered ? " is-hovered" : ""}`}>尚未留下旋律。</div>
      </Html>
    </group>
  );
}
