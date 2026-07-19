"use client";

import { Html, Line } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TransitionOrigin } from "@/components/transitions/SacredTransitionOverlay";
import { chapter01 } from "@/config/chapters";
import { memoryGuardianFragmentShader, memoryGuardianVertexShader } from "@/three/shaders/memoryGuardian";
import { MemoryGuardianParticles } from "./MemoryGuardianParticles";
import { StatueCrack } from "./StatueCrack";

type MemoryGuardianStatueProps = {
  state: "dormant" | "awakened";
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

const guardianProfile = [
  new THREE.Vector2(0.035, 0),
  new THREE.Vector2(0.34, 0.015),
  new THREE.Vector2(0.43, 0.11),
  new THREE.Vector2(0.36, 0.24),
  new THREE.Vector2(0.31, 0.54),
  new THREE.Vector2(0.25, 0.87),
  new THREE.Vector2(0.4, 1.08),
  new THREE.Vector2(0.33, 1.24),
  new THREE.Vector2(0.21, 1.38),
  new THREE.Vector2(0.13, 1.58),
  new THREE.Vector2(0.03, 1.68),
];

const moonGlyphs: Array<Array<[number, number, number]>> = [
  [[-0.26, 0.62, 0.31], [-0.1, 0.7, 0.36], [0.08, 0.68, 0.37], [0.24, 0.78, 0.3]],
  [[-0.21, 0.98, 0.3], [-0.08, 1.1, 0.37], [0.03, 1.03, 0.39], [0.16, 1.17, 0.31]],
  [[-0.17, 1.35, 0.19], [-0.04, 1.26, 0.27], [0.12, 1.32, 0.23]],
];

export function MemoryGuardianStatue({ state, labelPlacement, position, chapter, revealDelay, index, activating, skipIntro = false, onHoverChange, onActivate, onActivationPosition }: MemoryGuardianStatueProps) {
  const rootRef = useRef<THREE.Group>(null);
  const guardianMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const baseRingRef = useRef<THREE.MeshBasicMaterial>(null);
  const baseRingMeshRef = useRef<THREE.Mesh>(null);
  const innerLightRef = useRef<THREE.PointLight>(null);
  const moonCoreRef = useRef<THREE.Mesh>(null);
  const moonCoreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const moonHaloRef = useRef<THREE.Group>(null);
  const reflectionRef = useRef<THREE.MeshBasicMaterial>(null);
  const moonBeamRef = useRef<THREE.MeshBasicMaterial>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const rippleMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const rippleTime = useRef(-1);
  const projectedCenter = useRef(new THREE.Vector3());
  const previousOrigin = useRef<TransitionOrigin>({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const isMoonlit = state === "awakened";
  const labelPosition: [number, number, number] = labelPlacement === "left"
    ? [-1.72, 0.36, 0.02]
    : labelPlacement === "right"
      ? [1.72, 0.36, 0.02]
      : [0, -0.82, 0.12];

  const guardianUniforms = useMemo(() => ({
      uTime: { value: 0 },
      uAwakened: { value: isMoonlit ? 1 : 0 },
      uFormation: { value: skipIntro && isMoonlit ? 1 : 0 },
      uHover: { value: 0 },
      uActivation: { value: 0 },
      uOpacity: { value: 0 },
  }), [isMoonlit, skipIntro]);

  useFrame(({ camera, clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, revealDelay, revealDelay + 0.95);
    const formation = isMoonlit ? THREE.MathUtils.smoothstep(elapsed.current, revealDelay + 0.15, revealDelay + 3.95) : 0;
    const activationTarget = activating ? 1 : 0;
    const hoverTarget = hovered.current ? 1 : 0;

    const guardianMaterial = guardianMaterialRef.current;
    if (guardianMaterial) {
      guardianMaterial.uniforms.uTime.value = clock.elapsedTime;
      guardianMaterial.uniforms.uFormation.value = THREE.MathUtils.damp(guardianMaterial.uniforms.uFormation.value, formation, 2.4, delta);
      guardianMaterial.uniforms.uHover.value = THREE.MathUtils.damp(guardianMaterial.uniforms.uHover.value, hoverTarget, 3, delta);
      guardianMaterial.uniforms.uActivation.value = THREE.MathUtils.damp(guardianMaterial.uniforms.uActivation.value, activationTarget, 4.8, delta);
      guardianMaterial.uniforms.uOpacity.value = THREE.MathUtils.damp(guardianMaterial.uniforms.uOpacity.value, reveal, 2.8, delta);
    }

    if (rootRef.current) {
      const targetScale = activating ? 1.11 : hovered.current ? 1.045 : 1;
      rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, Math.max(0.001, reveal * targetScale), 2.7, delta));
      rootRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.38 + position[0]) * 0.016;
    }
    if (baseRingRef.current) baseRingRef.current.opacity = THREE.MathUtils.damp(baseRingRef.current.opacity, reveal * (activating ? 0.96 : hovered.current ? 0.62 : isMoonlit ? 0.34 : 0.12), 2.4, delta);
    if (baseRingMeshRef.current) baseRingMeshRef.current.rotation.z += delta * (activating ? 1.7 : hovered.current ? 0.2 : 0.035);
    if (innerLightRef.current) innerLightRef.current.intensity = THREE.MathUtils.damp(innerLightRef.current.intensity, reveal * (activating ? 3.2 : hovered.current ? 1.1 : 0.38), 3.2, delta);
    if (moonCoreRef.current && moonCoreMaterialRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * (activating ? 2.2 : hovered.current ? 1.35 : 0.62)) * (activating ? 0.24 : hovered.current ? 0.12 : 0.05);
      moonCoreRef.current.scale.setScalar(THREE.MathUtils.damp(moonCoreRef.current.scale.x, pulse * (activating ? 1.42 : 1), 3.5, delta));
      moonCoreMaterialRef.current.opacity = THREE.MathUtils.damp(moonCoreMaterialRef.current.opacity, activating ? 1 : hovered.current ? 0.86 : 0.58, 2.8, delta);
    }
    if (moonHaloRef.current) {
      moonHaloRef.current.rotation.z += delta * (activating ? 0.34 : hovered.current ? 0.075 : 0.018);
      moonHaloRef.current.scale.setScalar(THREE.MathUtils.damp(moonHaloRef.current.scale.x, activating ? 1.22 : hovered.current ? 1.06 : 1, 2.2, delta));
    }
    if (reflectionRef.current) reflectionRef.current.opacity = THREE.MathUtils.damp(reflectionRef.current.opacity, isMoonlit ? (activating ? 0.32 : hovered.current ? 0.18 : 0.09) : 0.015, 2, delta);
    if (moonBeamRef.current) moonBeamRef.current.opacity = THREE.MathUtils.damp(moonBeamRef.current.opacity, isMoonlit ? (activating ? 0.3 : hovered.current ? 0.11 : 0.04) : 0, 2.6, delta);

    if (activating && rootRef.current) {
      rootRef.current.localToWorld(projectedCenter.current.set(0, 1.02, 0.39));
      projectedCenter.current.project(camera);
      const origin = {
        x: (projectedCenter.current.x * 0.5 + 0.5) * 100,
        y: (-projectedCenter.current.y * 0.5 + 0.5) * 100,
      };
      if (Math.abs(origin.x - previousOrigin.current.x) > 0.18 || Math.abs(origin.y - previousOrigin.current.y) > 0.18) {
        previousOrigin.current = origin;
        onActivationPosition(origin);
      }
    }
    if (rippleTime.current >= 0 && rippleRef.current && rippleMaterialRef.current) {
      rippleTime.current += delta;
      const progress = Math.min(1, rippleTime.current / 1.25);
      rippleRef.current.scale.setScalar(0.45 + progress * 2.15);
      rippleMaterialRef.current.opacity = (1 - progress) * (isMoonlit ? 0.52 : 0.18);
      if (progress >= 1) rippleTime.current = -1;
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
    rippleTime.current = 0;
    onActivate(index);
  };

  return (
    <group ref={rootRef} position={position}>
      <mesh
        position={[0, 1.02, 0.04]}
        onPointerEnter={(event) => handlePointer(event, true)}
        onPointerLeave={(event) => handlePointer(event, false)}
        onClick={handleClick}
      >
        <boxGeometry args={[1.82, 2.56, 1.52]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.5, 0.64, 0.25, 56]} />
        <meshPhysicalMaterial color={isMoonlit ? "#111b2a" : "#11151d"} roughness={0.58} metalness={0.2} clearcoat={0.18} emissive={isMoonlit ? "#526c91" : "#111722"} emissiveIntensity={isMoonlit ? 0.12 : 0.01} />
      </mesh>
      <mesh ref={baseRingMeshRef} position={[0, 0.252, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.51, 0.012, 8, 96]} />
        <meshBasicMaterial ref={baseRingRef} color={isMoonlit ? "#c9b27d" : "#6d665a"} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <latheGeometry args={[guardianProfile, 72]} />
        <shaderMaterial
          ref={guardianMaterialRef}
          uniforms={guardianUniforms}
          vertexShader={memoryGuardianVertexShader}
          fragmentShader={memoryGuardianFragmentShader}
          transparent
          depthWrite={isMoonlit}
        />
      </mesh>
      <mesh position={[0, 0.38, -0.015]} scale={[1.035, 1.015, 1.035]}>
        <latheGeometry args={[guardianProfile, 72]} />
        <meshBasicMaterial color={isMoonlit ? "#dbe5eb" : "#59616d"} side={THREE.BackSide} transparent opacity={isMoonlit ? 0.055 : 0.075} depthWrite={false} />
      </mesh>

      <mesh position={[isMoonlit ? -0.035 : 0, 1.43, 0]} rotation={[isMoonlit ? -0.22 : 0, 0, isMoonlit ? -0.08 : 0]} scale={[0.76, 1.14, 0.72]}>
        <capsuleGeometry args={[0.13, 0.2, 12, 32]} />
        <meshPhysicalMaterial color={isMoonlit ? "#8e9dac" : "#272d36"} roughness={0.72} metalness={0.06} transmission={isMoonlit ? 0.06 : 0.18} transparent opacity={isMoonlit ? 0.78 : 0.34} emissive={isMoonlit ? "#7890ad" : "#10141b"} emissiveIntensity={isMoonlit ? 0.13 : 0.01} />
      </mesh>
      <mesh position={[0, 1.48, -0.01]} rotation={[0, 0, -0.16]} scale={[1.18, 1, 0.92]}>
        <torusGeometry args={[0.23, 0.06, 18, 64, Math.PI * 1.35]} />
        <meshPhysicalMaterial color={isMoonlit ? "#687889" : "#202630"} roughness={0.78} metalness={0.08} transparent opacity={isMoonlit ? 0.72 : 0.3} emissive={isMoonlit ? "#5f7593" : "#10141b"} emissiveIntensity={isMoonlit ? 0.12 : 0.01} />
      </mesh>

      <group position={[0, 1.02, 0.12]}>
        <mesh position={[-0.19, isMoonlit ? 0.01 : -0.08, 0]} rotation={[0.18, 0, isMoonlit ? -0.76 : -0.28]} scale={[0.68, 1.2, 0.68]}>
          <capsuleGeometry args={[0.058, 0.34, 9, 20]} />
          <meshPhysicalMaterial color={isMoonlit ? "#718398" : "#242a33"} roughness={0.74} metalness={0.06} transparent opacity={isMoonlit ? 0.76 : 0.3} emissive={isMoonlit ? "#6680a3" : "#111720"} emissiveIntensity={isMoonlit ? 0.12 : 0.01} />
        </mesh>
        <mesh position={[0.19, isMoonlit ? 0.01 : -0.08, 0]} rotation={[0.18, 0, isMoonlit ? 0.76 : 0.28]} scale={[0.68, 1.2, 0.68]}>
          <capsuleGeometry args={[0.058, 0.34, 9, 20]} />
          <meshPhysicalMaterial color={isMoonlit ? "#718398" : "#242a33"} roughness={0.74} metalness={0.06} transparent opacity={isMoonlit ? 0.76 : 0.3} emissive={isMoonlit ? "#6680a3" : "#111720"} emissiveIntensity={isMoonlit ? 0.12 : 0.01} />
        </mesh>
      </group>

      {isMoonlit ? (
        <>
          <pointLight ref={innerLightRef} position={[0, 1.02, 0.32]} color="#cbdfff" intensity={0} distance={3.1} decay={2.1} />
          <mesh ref={moonCoreRef} position={[0, 1.02, 0.39]}>
            <icosahedronGeometry args={[0.08, 3]} />
            <meshBasicMaterial ref={moonCoreMaterialRef} color="#f0f3ee" transparent opacity={0.58} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[0, 1.02, 0.37]} scale={3.1}>
            <sphereGeometry args={[0.08, 24, 24]} />
            <meshBasicMaterial color="#a9c7f2" transparent opacity={activating ? 0.14 : 0.055} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <group ref={moonHaloRef} position={[0, 1.08, -0.2]} rotation={[0, 0, 0.42]}>
            <mesh>
              <torusGeometry args={[0.66, 0.014, 10, 112, Math.PI * 1.48]} />
              <meshBasicMaterial color="#cdb681" transparent opacity={activating ? 0.82 : isHovered ? 0.5 : 0.28} depthWrite={false} />
            </mesh>
            <mesh rotation={[0, 0, 2.28]}>
              <torusGeometry args={[0.61, 0.006, 8, 88, Math.PI * 0.58]} />
              <meshBasicMaterial color="#e0d1a9" transparent opacity={0.2} depthWrite={false} />
            </mesh>
          </group>
          {moonGlyphs.map((points, glyph) => (
            <Line key={glyph} points={points} color={glyph === 1 ? "#dbe7f5" : "#c8af77"} lineWidth={0.42} transparent opacity={activating ? 0.68 : isHovered ? 0.38 : 0.2} />
          ))}
          <mesh position={[0, 1.72, -0.04]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.5, 2.9, 48, 1, true]} />
            <meshBasicMaterial ref={moonBeamRef} color="#c9d8ed" transparent opacity={0.04} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[0, 0.266, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.12, 0.42, 1]}>
            <circleGeometry args={[0.86, 64]} />
            <meshBasicMaterial ref={reflectionRef} color="#8fa9cf" transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </>
      ) : (
        <>
          <Line points={[[-0.22, 0.56, 0.3], [0.02, 0.68, 0.35], [0.21, 0.59, 0.29]]} color="#5f625f" lineWidth={0.28} transparent opacity={0.12} />
          <Line points={[[0, 0.82, 0.34], [-0.08, 1.08, 0.28], [0.06, 1.3, 0.18]]} color="#686a65" lineWidth={0.24} transparent opacity={0.1} />
        </>
      )}

      <MemoryGuardianParticles awakened={isMoonlit} hovered={isHovered} activating={activating} index={index} />
      <mesh ref={rippleRef} position={[0, 0.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.48, 0.5, 80]} />
        <meshBasicMaterial ref={rippleMaterialRef} color={isMoonlit ? "#d9e5f2" : "#5d6269"} transparent opacity={0} depthWrite={false} />
      </mesh>

      {activating ? (
        <Html center position={[0, 1.02, 0.41]} distanceFactor={8.5} style={{ pointerEvents: "none" }}>
          <StatueCrack />
        </Html>
      ) : null}
      <Html center position={labelPosition} distanceFactor={9.2} zIndexRange={[30, 10]} style={{ pointerEvents: "none" }}>
        <div className={`sanctuary-label sanctuary-label--chapter sanctuary-label--${labelPlacement}${isHovered ? " is-hovered" : ""}${isMoonlit ? " is-awakened" : " is-dormant"}`}>
          <span>{chapter}</span>
          <small>{isMoonlit ? `《${chapter01.title}》` : "沉睡中的篇章"}</small>
        </div>
      </Html>
    </group>
  );
}
