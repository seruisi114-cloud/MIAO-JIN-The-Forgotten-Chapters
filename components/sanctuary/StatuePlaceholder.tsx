"use client";

import { Html, Sparkles } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { TransitionOrigin } from "@/components/transitions/SacredTransitionOverlay";
import { StatueCrack } from "./StatueCrack";
import { chapter01 } from "@/config/chapters";

type StatuePlaceholderProps = {
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

const robeProfile = [
  new THREE.Vector2(0.04, 0),
  new THREE.Vector2(0.32, 0.02),
  new THREE.Vector2(0.38, 0.12),
  new THREE.Vector2(0.31, 0.24),
  new THREE.Vector2(0.28, 0.5),
  new THREE.Vector2(0.24, 0.86),
  new THREE.Vector2(0.36, 1.08),
  new THREE.Vector2(0.31, 1.22),
  new THREE.Vector2(0.2, 1.34),
  new THREE.Vector2(0.16, 1.53),
  new THREE.Vector2(0.04, 1.62),
];

export function StatuePlaceholder({ position, chapter, revealDelay, index, activating, skipIntro = false, onHoverChange, onActivate, onActivationPosition }: StatuePlaceholderProps) {
  const rootRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const innerLightRef = useRef<THREE.PointLight>(null);
  const baseRingRef = useRef<THREE.MeshBasicMaterial>(null);
  const baseRingMeshRef = useRef<THREE.Mesh>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const rippleMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const moonCoreRef = useRef<THREE.Mesh>(null);
  const moonCoreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const moonHaloRef = useRef<THREE.Mesh>(null);
  const moonHaloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const rippleTime = useRef(-1);
  const projectedCenter = useRef(new THREE.Vector3());
  const previousOrigin = useRef<TransitionOrigin>({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const isMoonlit = index === 1;

  useFrame(({ camera, clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, revealDelay, revealDelay + 0.95);
    if (rootRef.current) {
      const target = activating ? 1.075 : hovered.current ? 1.045 : 1;
      rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, Math.max(0.001, reveal * target), 2.5, delta));
      rootRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.42 + position[0]) * 0.018;
    }
    if (materialRef.current) materialRef.current.emissiveIntensity = THREE.MathUtils.damp(materialRef.current.emissiveIntensity, reveal * (activating ? 0.72 : hovered.current ? 0.32 : 0.12), 2.2, delta);
    if (innerLightRef.current) innerLightRef.current.intensity = THREE.MathUtils.damp(innerLightRef.current.intensity, reveal * (activating ? 2.1 : hovered.current ? 0.72 : 0.28), 2, delta);
    if (baseRingRef.current) baseRingRef.current.opacity = THREE.MathUtils.damp(baseRingRef.current.opacity, reveal * (activating ? 1 : hovered.current ? 0.86 : 0.45), 2, delta);
    if (baseRingMeshRef.current) baseRingMeshRef.current.rotation.z += delta * (activating ? 2.2 : hovered.current ? 0.28 : 0.06);
    if (isMoonlit && moonCoreRef.current && moonCoreMaterialRef.current) {
      const corePulse = 1 + Math.sin(clock.elapsedTime * (hovered.current || activating ? 1.45 : 0.72)) * (activating ? 0.28 : hovered.current ? 0.14 : 0.06);
      moonCoreRef.current.scale.setScalar(THREE.MathUtils.damp(moonCoreRef.current.scale.x, corePulse, 2.6, delta));
      moonCoreMaterialRef.current.opacity = THREE.MathUtils.damp(moonCoreMaterialRef.current.opacity, activating ? 1 : hovered.current ? 0.88 : 0.55, 2.2, delta);
    }
    if (isMoonlit && moonHaloRef.current && moonHaloMaterialRef.current) {
      moonHaloRef.current.rotation.z += delta * (activating ? 0.6 : hovered.current ? 0.09 : 0.025);
      moonHaloMaterialRef.current.opacity = THREE.MathUtils.damp(moonHaloMaterialRef.current.opacity, activating ? 0.88 : hovered.current ? 0.62 : 0.26, 2, delta);
    }
    if (activating && rootRef.current) {
      rootRef.current.localToWorld(projectedCenter.current.set(0, 0.96, 0.38));
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
      const progress = Math.min(1, rippleTime.current / 1.15);
      rippleRef.current.scale.setScalar(0.45 + progress * 1.6);
      rippleMaterialRef.current.opacity = (1 - progress) * 0.58;
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
      <group onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.48, 0.6, 0.24, 48]} />
          <meshPhysicalMaterial color={isMoonlit ? "#121824" : "#171b25"} roughness={0.54} metalness={0.22} clearcoat={0.12} emissive={isMoonlit ? "#263653" : "#26334a"} emissiveIntensity={0.08} />
        </mesh>
        <mesh ref={baseRingMeshRef} position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.49, 0.014, 8, 72]} />
          <meshBasicMaterial ref={baseRingRef} color="#c0a66f" transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <latheGeometry args={[robeProfile, 64]} />
          <meshStandardMaterial ref={materialRef} color={isMoonlit ? "#252d3e" : "#2a2f3b"} roughness={0.72} metalness={0.12} emissive={isMoonlit ? "#8fa8ce" : "#9eacc1"} emissiveIntensity={0.12} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0.34, 0]} scale={1.025}>
          <latheGeometry args={[robeProfile, 64]} />
          <meshBasicMaterial color="#cbd3df" side={THREE.BackSide} transparent opacity={0.075} depthWrite={false} />
        </mesh>
        <mesh position={[isMoonlit ? -0.025 : 0, 1.37, 0]} rotation={[0, 0, isMoonlit ? -0.1 : 0]} scale={[0.75, 1.16, 0.72]}>
          <capsuleGeometry args={[0.13, 0.2, 12, 28]} />
          <meshBasicMaterial color="#d6dce7" transparent opacity={0.13} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh position={[0, 1.48, 0]} scale={[1.2, 1, 0.9]}>
          <torusGeometry args={[0.21, 0.055, 16, 48, Math.PI * 1.28]} />
          <meshStandardMaterial color="#343946" roughness={0.72} emissive="#77869e" emissiveIntensity={0.08} />
        </mesh>
        <pointLight ref={innerLightRef} position={[0, 0.9, 0.2]} color="#d8dbe1" intensity={0} distance={2.4} decay={2.3} />
        {isMoonlit ? (
          <>
            <mesh ref={moonHaloRef} position={[0, 1.02, -0.2]} rotation={[0, 0, 0.48]}>
              <torusGeometry args={[0.61, 0.014, 10, 96, Math.PI * 1.56]} />
              <meshBasicMaterial ref={moonHaloMaterialRef} color="#c7ab73" transparent opacity={0.26} depthWrite={false} />
            </mesh>
            <mesh position={[0, 1.02, -0.19]} rotation={[0, 0, -1.86]}>
              <torusGeometry args={[0.57, 0.006, 8, 72, Math.PI * 0.62]} />
              <meshBasicMaterial color="#dfc99c" transparent opacity={0.2} depthWrite={false} />
            </mesh>
            <mesh ref={moonCoreRef} position={[0, 0.96, 0.38]}>
              <sphereGeometry args={[0.07, 28, 28]} />
              <meshBasicMaterial ref={moonCoreMaterialRef} color="#edf0ec" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh position={[0, 0.96, 0.365]} scale={2.4}>
              <sphereGeometry args={[0.07, 20, 20]} />
              <meshBasicMaterial color="#b9cbe6" transparent opacity={0.07} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh position={[0, 0.255, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.27, 0.29, 48]} />
              <meshBasicMaterial color="#c1a66e" transparent opacity={0.34} depthWrite={false} />
            </mesh>
            {Array.from({ length: 8 }, (_, mark) => {
              const angle = mark / 8 * Math.PI * 2;
              return (
                <mesh key={mark} position={[Math.cos(angle) * 0.37, 0.26, Math.sin(angle) * 0.37]} rotation={[-Math.PI / 2, 0, -angle]}>
                  <boxGeometry args={[mark % 2 === 0 ? 0.08 : 0.045, 0.009, 0.008]} />
                  <meshBasicMaterial color="#bda36d" transparent opacity={0.38} />
                </mesh>
              );
            })}
          </>
        ) : null}
      </group>

      <mesh ref={rippleRef} position={[0, 0.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.48, 0.5, 72]} />
        <meshBasicMaterial ref={rippleMaterialRef} color="#d8dce5" transparent opacity={0} depthWrite={false} />
      </mesh>
      <Sparkles count={activating ? 36 : isMoonlit ? 22 : 16} scale={[1.15, 1.9, 0.85]} size={activating ? 1.1 : 0.72} speed={activating ? 0.45 : isHovered ? 0.18 : 0.07} color="#b59b68" opacity={activating ? 0.8 : isHovered ? 0.48 : 0.2} noise={0.4} />
      {activating ? (
        <Html center position={[0, 0.96, 0.4]} distanceFactor={8.5} style={{ pointerEvents: "none" }}>
          <StatueCrack />
        </Html>
      ) : null}
      <Html center position={[0.72, 0.14, 0]} distanceFactor={8.5} style={{ pointerEvents: "none" }}>
        <div className={`sanctuary-label sanctuary-label--chapter${isHovered ? " is-hovered" : ""}`}>
          <span>{chapter}</span>
          <small>{isMoonlit ? `《${chapter01.title}》` : "未命名篇章"}</small>
        </div>
      </Html>
    </group>
  );
}
