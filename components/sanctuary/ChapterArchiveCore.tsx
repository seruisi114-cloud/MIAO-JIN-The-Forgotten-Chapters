"use client";

import { Edges, Html, Line, Sparkles } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TransitionOrigin } from "@/components/transitions/SacredTransitionOverlay";
import { chapter01 } from "@/config/chapters";
import { archiveCoreVertexShader, dormantCrystalFragmentShader, frozenNebulaFragmentShader, moonPlanetFragmentShader } from "@/three/shaders/archiveCore";
import { GoldenStarRibbon } from "./GoldenStarRibbon";

const MOON_CORE_Y = 1.32;

type ChapterArchiveCoreProps = {
  kind: "moon-planet" | "relic-core" | "frozen-nebula";
  labelPlacement: "left" | "right" | "top" | "bottom";
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
  const moonCoreRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const particleRef = useRef<THREE.Points>(null);
  const relicEnergyRef = useRef<THREE.Group>(null);
  const nebulaShellRef = useRef<THREE.Group>(null);
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
  const isRelicCore = kind === "relic-core";
  const isFrozenNebula = kind === "frozen-nebula";
  const labelPosition: [number, number, number] = labelPlacement === "left"
    ? [-1.82, 0.25, 0.08]
    : labelPlacement === "right"
      ? [1.82, 0.25, 0.08]
      : labelPlacement === "bottom"
        ? [0, -0.48, 0.08]
        : [0, 2.02, 0.08];

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uActivation: { value: 0 },
  }), []);

  const particlePositions = useMemo(() => {
    const random = seededRandom(74920 + index * 819);
    const count = isMoonPlanet ? 108 : isFrozenNebula ? 62 : 46;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = isMoonPlanet ? 0.72 + random() * 0.86 : isFrozenNebula ? 0.54 + random() * 0.78 : 0.48 + random() * 0.58;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (isMoonPlanet ? MOON_CORE_Y : 0.95) + (random() - 0.5) * (isMoonPlanet ? 1.35 : isFrozenNebula ? 1.4 : 1.08);
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.48;
    }
    return positions;
  }, [index, isFrozenNebula, isMoonPlanet]);

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
    if (moonCoreRef.current) {
      moonCoreRef.current.rotation.y += delta * (activating ? 0.18 : hovered.current ? 0.065 : 0.026);
      moonCoreRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.12) * 0.025;
    }
    if (particleRef.current) {
      particleRef.current.rotation.y += delta * (activating ? 0.95 : isMoonPlanet ? 0.055 : 0.018);
      const target = activating ? 1.38 : hovered.current ? 1.1 : 1;
      particleRef.current.scale.setScalar(THREE.MathUtils.damp(particleRef.current.scale.x, target, 2.3, delta));
    }
    if (relicEnergyRef.current) {
      relicEnergyRef.current.rotation.y += delta * (hovered.current ? 0.44 : 0.12);
      relicEnergyRef.current.rotation.z -= delta * 0.025;
      const pulse = 1 + Math.sin(clock.elapsedTime * 0.72) * (hovered.current ? 0.08 : 0.035);
      relicEnergyRef.current.scale.setScalar(THREE.MathUtils.damp(relicEnergyRef.current.scale.x, pulse, 2.1, delta));
    }
    if (nebulaShellRef.current) {
      nebulaShellRef.current.rotation.y += delta * (hovered.current ? 0.055 : 0.018);
      nebulaShellRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.11) * 0.06;
    }
    if (haloMaterialRef.current) haloMaterialRef.current.opacity = THREE.MathUtils.damp(haloMaterialRef.current.opacity, isMoonPlanet ? (activating ? 0.9 : hovered.current ? 0.42 : 0.19) : 0.05, 2.5, delta);
    if (lightRef.current) lightRef.current.intensity = THREE.MathUtils.damp(lightRef.current.intensity, isMoonPlanet ? (activating ? 3.8 : hovered.current ? 1.25 : 0.44) : isRelicCore ? (hovered.current ? 0.36 : 0.14) : 0.05, 3.1, delta);

    if (activating && rootRef.current) {
      rootRef.current.localToWorld(projectedCenter.current.set(0, MOON_CORE_Y, 0.1));
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
      <mesh position={[0, isMoonPlanet ? MOON_CORE_Y : 1, 0]} onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
        <sphereGeometry args={[1.18, 24, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      {isMoonPlanet ? (
        <group position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh><torusGeometry args={[0.58, 0.012, 8, 96, Math.PI * 1.55]} /><meshBasicMaterial color="#b79b64" transparent opacity={isHovered ? 0.58 : 0.28} depthWrite={false} /></mesh>
          <mesh rotation={[0, 0, 2.18]}><torusGeometry args={[0.72, 0.006, 8, 96, Math.PI * 0.72]} /><meshBasicMaterial color="#d0be94" transparent opacity={0.18} depthWrite={false} /></mesh>
        </group>
      ) : (
        <>
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.54, 0.72, 0.26, 64]} />
            <meshPhysicalMaterial color="#080d16" roughness={0.42} metalness={0.5} clearcoat={0.48} clearcoatRoughness={0.38} envMapIntensity={0.58} emissive={isRelicCore ? "#2a2114" : "#111c2d"} emissiveIntensity={isHovered ? 0.09 : 0.03} />
          </mesh>
          <mesh position={[0, 0.275, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.57, 0.012, 8, 96]} />
            <meshBasicMaterial color="#a78b55" transparent opacity={isHovered ? 0.48 : 0.16} depthWrite={false} />
          </mesh>
        </>
      )}

      {isMoonPlanet ? (
        <>
          <mesh ref={moonCoreRef} position={[0, MOON_CORE_Y, 0]} renderOrder={12}>
            <sphereGeometry args={[0.62, 80, 56]} />
            <shaderMaterial ref={planetMaterialRef} uniforms={uniforms} vertexShader={archiveCoreVertexShader} fragmentShader={moonPlanetFragmentShader} transparent depthTest={false} depthWrite={false} />
          </mesh>
          <mesh position={[0, MOON_CORE_Y, 0]} scale={1.025} renderOrder={13}>
            <sphereGeometry args={[0.62, 64, 40]} />
            <meshPhysicalMaterial color="#829ab3" roughness={0.42} metalness={0.03} transmission={0.08} thickness={0.5} ior={1.28} clearcoat={0.46} clearcoatRoughness={0.36} envMapIntensity={0.9} transparent opacity={0.14} depthTest={false} depthWrite={false} />
          </mesh>
          <mesh position={[0, MOON_CORE_Y, 0]} scale={1.13} renderOrder={11}>
            <sphereGeometry args={[0.62, 48, 32]} />
            <meshBasicMaterial color="#afcff0" side={THREE.BackSide} transparent opacity={0.085} depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <group ref={orbitRef} position={[0, MOON_CORE_Y, 0]} rotation={[0.42, 0.12, -0.28]}>
            {[0.82, 0.96, 1.08].map((radius, ringIndex) => (
              <mesh key={radius} rotation={[Math.PI / 2 + ringIndex * 0.34, ringIndex * 0.72, 0]} scale={[1, 0.62 + ringIndex * 0.05, 1]}>
                <torusGeometry args={[radius, ringIndex === 0 ? 0.012 : 0.007, 8, 128, Math.PI * (ringIndex === 1 ? 1.48 : 1.72)]} />
                <meshBasicMaterial color={ringIndex === 2 ? "#d9ca9f" : "#c2a66b"} transparent opacity={activating ? 0.82 - ringIndex * 0.12 : isHovered ? 0.48 - ringIndex * 0.08 : 0.23 - ringIndex * 0.04} depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
              </mesh>
            ))}
          </group>
          <group position={[0, MOON_CORE_Y, 0]}>
            <GoldenStarRibbon active={activating} hovered={isHovered} />
          </group>
          <mesh position={[0, MOON_CORE_Y, -0.12]} rotation={[0, 0, 0.35]}>
            <torusGeometry args={[0.88, 0.02, 10, 128, Math.PI * 1.48]} />
            <meshBasicMaterial ref={haloMaterialRef} color="#d6c18d" transparent opacity={0.19} depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <pointLight ref={lightRef} position={[0, MOON_CORE_Y + 0.01, 0.42]} color="#b8d8ff" intensity={0.44} distance={4.8} decay={2.1} />
        </>
      ) : isRelicCore ? (
        <>
          <mesh position={[0, 1.03, 0]} scale={[0.82, 1.32, 0.82]} rotation={[0.08, 0.4 + index * 0.2, -0.05]}>
            <octahedronGeometry args={[0.68, 3]} />
            <shaderMaterial ref={crystalMaterialRef} uniforms={uniforms} vertexShader={archiveCoreVertexShader} fragmentShader={dormantCrystalFragmentShader} transparent depthWrite={false} />
          </mesh>
          <mesh position={[0, 1.03, 0]} scale={[0.87, 1.38, 0.87]} rotation={[0.08, 0.4 + index * 0.2, -0.05]}>
            <octahedronGeometry args={[0.68, 0]} />
            <meshPhysicalMaterial color="#17130f" roughness={0.2} metalness={0.5} transmission={0.34} thickness={1.16} ior={1.48} clearcoat={0.82} clearcoatRoughness={0.16} envMapIntensity={0.78} transparent opacity={0.48} depthWrite={false} emissive="#3a2815" emissiveIntensity={isHovered ? 0.1 : 0.035} />
            <Edges scale={1.002} threshold={20} color={isHovered ? "#9a7841" : "#544326"} />
          </mesh>
          <group ref={orbitRef} position={[0, 1.03, 0]} rotation={[0.55, 0.1, 0.36]}>
            <mesh scale={[1, 0.62, 1]}><torusGeometry args={[0.9, 0.009, 8, 112, Math.PI * 1.48]} /><meshBasicMaterial color="#a98245" transparent opacity={isHovered ? 0.44 : 0.18} depthWrite={false} /></mesh>
            <mesh rotation={[0.48, 0.32, 1.52]} scale={[1, 0.7, 1]}><torusGeometry args={[0.76, 0.006, 8, 96, Math.PI * 1.12]} /><meshBasicMaterial color="#d0b577" transparent opacity={isHovered ? 0.34 : 0.12} depthWrite={false} /></mesh>
            {Array.from({ length: 12 }, (_, runeIndex) => {
              const angle = runeIndex / 12 * Math.PI * 2;
              return (
                <group key={runeIndex} position={[Math.cos(angle) * 0.83, Math.sin(angle) * 0.49, Math.sin(angle * 2) * 0.16]} rotation={[0, 0, angle]}>
                  <mesh><boxGeometry args={[runeIndex % 3 === 0 ? 0.1 : 0.065, 0.012, 0.012]} /><meshBasicMaterial color="#b89451" transparent opacity={isHovered ? 0.54 : 0.24} depthWrite={false} /></mesh>
                  {runeIndex % 3 === 0 ? <mesh rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.075, 0.01, 0.01]} /><meshBasicMaterial color="#d1b879" transparent opacity={isHovered ? 0.44 : 0.18} depthWrite={false} /></mesh> : null}
                </group>
              );
            })}
          </group>
          <group ref={relicEnergyRef} position={[0, 1.03, 0.1]}>
            <mesh scale={[0.21, 0.8, 0.21]}><sphereGeometry args={[0.28, 28, 20]} /><meshBasicMaterial color="#b18a4d" transparent opacity={isHovered ? 0.42 : 0.2} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
            <mesh rotation={[0.3, 0.5, 0.2]}><torusKnotGeometry args={[0.27, 0.012, 72, 7, 2, 3]} /><meshBasicMaterial color="#d2b472" transparent opacity={isHovered ? 0.48 : 0.2} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
          </group>
          <Line points={[[-0.28, 0.58, 0.44], [-0.08, 0.8, 0.5], [-0.18, 1.08, 0.46], [0.08, 1.36, 0.36]]} color="#a98447" lineWidth={0.42} transparent opacity={isHovered ? 0.5 : 0.22} />
          <Line points={[[0.25, 0.7, 0.36], [0.1, 0.96, 0.5], [0.22, 1.28, 0.38]]} color="#c6a66c" lineWidth={0.3} transparent opacity={isHovered ? 0.42 : 0.17} />
          <pointLight ref={lightRef} position={[0, 1.03, 0.26]} color="#a77c3d" intensity={0.14} distance={2.8} decay={2.3} />
        </>
      ) : (
        <>
          <mesh position={[0, 1.02, 0]} scale={[0.95, 1.08, 0.95]}>
            <icosahedronGeometry args={[0.7, 4]} />
            <shaderMaterial ref={crystalMaterialRef} uniforms={uniforms} vertexShader={archiveCoreVertexShader} fragmentShader={frozenNebulaFragmentShader} transparent depthWrite={false} />
          </mesh>
          <mesh position={[0, 1.02, -0.02]} scale={[1.05, 1.18, 1.05]}>
            <icosahedronGeometry args={[0.7, 2]} />
            <meshPhysicalMaterial color="#0b1422" roughness={0.18} metalness={0.08} transmission={0.62} thickness={1.3} ior={1.38} clearcoat={0.86} clearcoatRoughness={0.14} envMapIntensity={0.7} transparent opacity={0.26} depthWrite={false} />
            <Edges scale={1.002} threshold={34} color={isHovered ? "#6f7f91" : "#27384d"} />
          </mesh>
          <mesh position={[0, 1.02, -0.1]} scale={1.22}>
            <sphereGeometry args={[0.7, 44, 32]} />
            <meshBasicMaterial color="#44658a" side={THREE.BackSide} transparent opacity={isHovered ? 0.075 : 0.035} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <group ref={nebulaShellRef} position={[0, 1.02, 0]}>
            <mesh scale={[1.2, 1.05, 1.12]} rotation={[0.28, 0.14, 0.12]}>
              <icosahedronGeometry args={[0.72, 3]} />
              <meshBasicMaterial color="#07111f" transparent opacity={isHovered ? 0.2 : 0.12} depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh scale={[1.38, 1.14, 1.26]} rotation={[-0.17, 0.32, -0.09]}>
              <sphereGeometry args={[0.72, 40, 28]} />
              <meshBasicMaterial color="#183458" transparent opacity={isHovered ? 0.07 : 0.035} depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
          <Line points={[[-0.32, 0.72, 0.55], [-0.12, 0.92, 0.63], [-0.2, 1.15, 0.58], [0.04, 1.38, 0.48]]} color="#8f7140" lineWidth={0.36} transparent opacity={isHovered ? 0.42 : 0.18} />
          <Line points={[[0.3, 0.68, 0.44], [0.12, 0.9, 0.62], [0.24, 1.18, 0.5]]} color="#b29254" lineWidth={0.26} transparent opacity={isHovered ? 0.34 : 0.14} />
          <Sparkles count={42} scale={[2.05, 2.1, 1.5]} size={0.42} speed={isHovered ? 0.11 : 0.045} color="#7690ad" opacity={isHovered ? 0.23 : 0.1} noise={0.75} />
          <Sparkles count={14} scale={[1.55, 1.7, 1.2]} size={0.3} speed={0.025} color="#a8874d" opacity={isHovered ? 0.24 : 0.11} noise={0.9} />
        </>
      )}

      <points ref={particleRef} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={isMoonPlanet ? "#d7c48d" : isRelicCore ? "#9c7b43" : "#7d90a8"} size={isMoonPlanet ? 0.028 : isFrozenNebula ? 0.022 : 0.018} transparent opacity={isMoonPlanet ? (activating ? 0.88 : isHovered ? 0.58 : 0.32) : isHovered ? 0.24 : 0.09} depthTest={!isMoonPlanet} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>

      <Html center position={labelPosition} distanceFactor={9.2} zIndexRange={[30, 10]} style={{ pointerEvents: "none" }}>
        <div className={`sanctuary-label sanctuary-label--chapter sanctuary-label--${labelPlacement}${isHovered ? " is-hovered" : ""}${isMoonPlanet ? " is-awakened" : " is-dormant"}`}>
          <span>{chapter}</span>
          <small>{isMoonPlanet ? `《${chapter01.title}》` : isRelicCore ? "未知文明遗迹" : "沉睡档案核心"}</small>
        </div>
      </Html>
    </group>
  );
}
