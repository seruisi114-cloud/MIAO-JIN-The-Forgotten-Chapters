"use client";

import { Edges, Html, Line } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TransitionOrigin } from "@/components/transitions/SacredTransitionOverlay";
import { chapter01 } from "@/config/chapters";
import { archiveCoreVertexShader, dormantCrystalFragmentShader, moonPlanetFragmentShader } from "@/three/shaders/archiveCore";

type ChapterArchiveCoreProps = {
  kind: "moon-planet" | "dormant-crystal";
  labelPlacement: "left" | "right" | "bottom";
  position: [number, number, number];
  chapter: string;
  revealDelay: number;
  index: number;
  activating: boolean;
  skipIntro?: boolean;
  onHoverChange: (index: number | null) => void;
  onActivate: (index: number) => void;
  onActivationPosition: (origin: TransitionOrigin) => void;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function ChapterArchiveCore({ kind, labelPlacement, position, chapter, revealDelay, index, activating, skipIntro = false, onHoverChange, onActivate, onActivationPosition }: ChapterArchiveCoreProps) {
  const rootRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const particleRef = useRef<THREE.Points>(null);
  const planetMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const crystalMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const projectedCenter = useRef(new THREE.Vector3());
  const previousOrigin = useRef<TransitionOrigin>({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const isMoonPlanet = kind === "moon-planet";
  const labelPosition: [number, number, number] = labelPlacement === "left"
    ? [-1.82, 0.25, 0.08]
    : labelPlacement === "right"
      ? [1.82, 0.25, 0.08]
      : [0, -0.78, 0.16];

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uActivation: { value: 0 },
  }), []);

  const particlePositions = useMemo(() => {
    const random = seededRandom(74920 + index * 819);
    const count = isMoonPlanet ? 108 : 34;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = isMoonPlanet ? 0.72 + random() * 0.86 : 0.5 + random() * 0.52;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.95 + (random() - 0.5) * (isMoonPlanet ? 1.35 : 1.05);
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.48;
    }
    return positions;
  }, [index, isMoonPlanet]);

  useFrame(({ camera, clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, revealDelay, revealDelay + 1.15);
    const hoverTarget = hovered.current ? 1 : 0;
    const activationTarget = activating ? 1 : 0;
    const material = isMoonPlanet ? planetMaterialRef.current : crystalMaterialRef.current;
    if (material) {
      material.uniforms.uTime.value = clock.elapsedTime;
      material.uniforms.uHover.value = THREE.MathUtils.damp(material.uniforms.uHover.value, hoverTarget, 2.8, delta);
      if (material.uniforms.uActivation) material.uniforms.uActivation.value = THREE.MathUtils.damp(material.uniforms.uActivation.value, activationTarget, 4.4, delta);
    }
    if (rootRef.current) {
      const target = Math.max(0.001, reveal * (activating ? 1.22 : hovered.current ? 1.055 : 1));
      rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, target, 2.65, delta));
      rootRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.34 + index * 1.8) * 0.035;
    }
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * (activating ? 1.35 : hovered.current ? 0.26 : 0.07);
      orbitRef.current.rotation.z += delta * (activating ? 0.34 : 0.018);
    }
    if (particleRef.current) {
      particleRef.current.rotation.y += delta * (activating ? 0.95 : isMoonPlanet ? 0.055 : 0.018);
      const target = activating ? 1.38 : hovered.current ? 1.1 : 1;
      particleRef.current.scale.setScalar(THREE.MathUtils.damp(particleRef.current.scale.x, target, 2.3, delta));
    }
    if (haloMaterialRef.current) haloMaterialRef.current.opacity = THREE.MathUtils.damp(haloMaterialRef.current.opacity, isMoonPlanet ? (activating ? 0.9 : hovered.current ? 0.42 : 0.19) : 0.05, 2.5, delta);
    if (lightRef.current) lightRef.current.intensity = THREE.MathUtils.damp(lightRef.current.intensity, isMoonPlanet ? (activating ? 3.8 : hovered.current ? 1.25 : 0.44) : 0, 3.1, delta);

    if (activating && rootRef.current) {
      rootRef.current.localToWorld(projectedCenter.current.set(0, 1.03, 0.1));
      projectedCenter.current.project(camera);
      const origin = { x: (projectedCenter.current.x * 0.5 + 0.5) * 100, y: (-projectedCenter.current.y * 0.5 + 0.5) * 100 };
      if (Math.abs(origin.x - previousOrigin.current.x) > 0.18 || Math.abs(origin.y - previousOrigin.current.y) > 0.18) {
        previousOrigin.current = origin;
        onActivationPosition(origin);
      }
    }
  });

  const handlePointer = (event: ThreeEvent<PointerEvent>, active: boolean) => {
    event.stopPropagation();
    hovered.current = active;
    setIsHovered(active);
    onHoverChange(active ? index : null);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onActivate(index);
  };

  return (
    <group ref={rootRef} position={position} scale={skipIntro ? 1 : 0.001}>
      <mesh position={[0, 1, 0]} onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
        <sphereGeometry args={[1.18, 24, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.54, 0.72, 0.26, 64]} />
        <meshPhysicalMaterial color="#0a101b" roughness={0.39} metalness={0.46} clearcoat={0.55} clearcoatRoughness={0.34} envMapIntensity={0.72} emissive="#17243a" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 0.275, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.57, 0.012, 8, 96]} />
        <meshBasicMaterial color="#b79b64" transparent opacity={isHovered ? 0.55 : isMoonPlanet ? 0.28 : 0.12} depthWrite={false} />
      </mesh>

      {isMoonPlanet ? (
        <>
          <mesh position={[0, 1.03, 0]}>
            <sphereGeometry args={[0.55, 80, 56]} />
            <shaderMaterial ref={planetMaterialRef} uniforms={uniforms} vertexShader={archiveCoreVertexShader} fragmentShader={moonPlanetFragmentShader} transparent />
          </mesh>
          <mesh position={[0, 1.03, 0]} scale={1.045}>
            <sphereGeometry args={[0.55, 64, 40]} />
            <meshPhysicalMaterial color="#6f91b5" roughness={0.24} metalness={0.06} transmission={0.34} thickness={0.7} ior={1.32} clearcoat={0.7} clearcoatRoughness={0.2} envMapIntensity={1.1} transparent opacity={0.32} depthWrite={false} />
          </mesh>
          <mesh position={[0, 1.03, 0]} scale={1.13}>
            <sphereGeometry args={[0.55, 48, 32]} />
            <meshBasicMaterial color="#9fc7ed" side={THREE.BackSide} transparent opacity={0.075} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <group ref={orbitRef} position={[0, 1.03, 0]} rotation={[0.42, 0.12, -0.28]}>
            {[0.82, 0.96, 1.08].map((radius, ringIndex) => (
              <mesh key={radius} rotation={[Math.PI / 2 + ringIndex * 0.34, ringIndex * 0.72, 0]} scale={[1, 0.62 + ringIndex * 0.05, 1]}>
                <torusGeometry args={[radius, ringIndex === 0 ? 0.012 : 0.007, 8, 128, Math.PI * (ringIndex === 1 ? 1.48 : 1.72)]} />
                <meshBasicMaterial color={ringIndex === 2 ? "#d9ca9f" : "#c2a66b"} transparent opacity={activating ? 0.82 - ringIndex * 0.12 : isHovered ? 0.48 - ringIndex * 0.08 : 0.23 - ringIndex * 0.04} depthWrite={false} blending={THREE.AdditiveBlending} />
              </mesh>
            ))}
          </group>
          <mesh position={[0, 1.03, -0.12]} rotation={[0, 0, 0.35]}>
            <torusGeometry args={[0.88, 0.02, 10, 128, Math.PI * 1.48]} />
            <meshBasicMaterial ref={haloMaterialRef} color="#d6c18d" transparent opacity={0.19} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <pointLight ref={lightRef} position={[0, 1.04, 0.42]} color="#b8d8ff" intensity={0.44} distance={4.8} decay={2.1} />
        </>
      ) : (
        <>
          <mesh position={[0, 1.05, 0]} scale={[0.86, 1.36, 0.86]} rotation={[0.06, 0.3 + index * 0.28, -0.04]}>
            <icosahedronGeometry args={[0.62, 2]} />
            <shaderMaterial ref={crystalMaterialRef} uniforms={uniforms} vertexShader={archiveCoreVertexShader} fragmentShader={dormantCrystalFragmentShader} transparent depthWrite={false} />
          </mesh>
          <mesh position={[0, 1.05, 0]} scale={[0.9, 1.41, 0.9]} rotation={[0.06, 0.3 + index * 0.28, -0.04]}>
            <icosahedronGeometry args={[0.62, 0]} />
            <meshPhysicalMaterial color="#172338" roughness={0.22} metalness={0.22} transmission={0.44} thickness={1.08} ior={1.44} clearcoat={0.78} clearcoatRoughness={0.18} envMapIntensity={0.72} transparent opacity={0.38} depthWrite={false} emissive="#1b2940" emissiveIntensity={0.035} />
            <Edges scale={1.002} threshold={28} color={isHovered ? "#756444" : "#293341"} />
          </mesh>
          <mesh position={[0, 1.05, -0.03]} scale={[0.98, 1.5, 0.98]} rotation={[0.06, 0.3 + index * 0.28, -0.04]}>
            <icosahedronGeometry args={[0.62, 1]} />
            <meshBasicMaterial color="#7d91ac" side={THREE.BackSide} transparent opacity={isHovered ? 0.1 : 0.045} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <Line points={[[-0.18, 0.62, 0.42], [-0.04, 0.84, 0.48], [-0.12, 1.08, 0.44], [0.06, 1.34, 0.35]]} color="#8e7549" lineWidth={0.36} transparent opacity={isHovered ? 0.35 : 0.14} />
          <Line points={[[0.2, 0.72, 0.3], [0.08, 0.96, 0.46], [0.18, 1.2, 0.36]]} color="#ad8e54" lineWidth={0.26} transparent opacity={isHovered ? 0.28 : 0.1} />
        </>
      )}

      <points ref={particleRef} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={isMoonPlanet ? "#d7c48d" : "#7f7156"} size={isMoonPlanet ? 0.028 : 0.018} transparent opacity={isMoonPlanet ? (activating ? 0.88 : isHovered ? 0.58 : 0.32) : isHovered ? 0.18 : 0.07} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>

      <Html center position={labelPosition} distanceFactor={9.2} zIndexRange={[30, 10]} style={{ pointerEvents: "none" }}>
        <div className={`sanctuary-label sanctuary-label--chapter sanctuary-label--${labelPlacement}${isHovered ? " is-hovered" : ""}${isMoonPlanet ? " is-awakened" : " is-dormant"}`}>
          <span>{chapter}</span>
          <small>{isMoonPlanet ? `《${chapter01.title}》` : "沉睡档案"}</small>
        </div>
      </Html>
    </group>
  );
}
