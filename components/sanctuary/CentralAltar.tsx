"use client";

import { Sparkles } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { AltarConnections } from "./AltarConnections";

type CentralAltarProps = {
  chapterPositions: Array<[number, number, number]>;
  activeIndex: number | null;
  skipIntro?: boolean;
  onOpenCreatorNote: () => void;
  onHoverCreatorNote: (hovered: boolean) => void;
};

export function CentralAltar({ chapterPositions, activeIndex, skipIntro = false, onOpenCreatorNote, onHoverCreatorNote }: CentralAltarProps) {
  const rootRef = useRef<THREE.Group>(null);
  const starRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const middleRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const rippleMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const initialScale = skipIntro ? 1 : 0.001;
  const rippleTime = useRef(-1);

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 4.35, 5.45);
    if (rootRef.current) rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, Math.max(0.001, reveal), 2.2, delta));
    const pulse = 1 + Math.sin(clock.elapsedTime * 0.75) * (hovered.current ? 0.12 : 0.045);
    if (starRef.current) starRef.current.scale.setScalar(THREE.MathUtils.damp(starRef.current.scale.x, pulse, 2.2, delta));
    if (lightRef.current) lightRef.current.intensity = THREE.MathUtils.damp(lightRef.current.intensity, hovered.current ? 0.78 : 0.38, 1.8, delta);
    if (outerRingRef.current) outerRingRef.current.rotation.z += delta * (hovered.current ? 0.12 : 0.035);
    if (middleRingRef.current) middleRingRef.current.rotation.z -= delta * (hovered.current ? 0.1 : 0.026);
    if (innerRingRef.current) innerRingRef.current.rotation.z += delta * (hovered.current ? 0.075 : 0.018);
    if (rippleTime.current >= 0 && rippleRef.current && rippleMaterialRef.current) {
      rippleTime.current += delta;
      const progress = Math.min(1, rippleTime.current / 1.35);
      rippleRef.current.scale.setScalar(0.5 + progress * 2.7);
      rippleMaterialRef.current.opacity = (1 - progress) * 0.42;
      if (progress >= 1) rippleTime.current = -1;
    }
  });

  const handlePointer = (event: ThreeEvent<PointerEvent>, active: boolean) => {
    event.stopPropagation();
    hovered.current = active;
    onHoverCreatorNote(active);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    rippleTime.current = 0;
    onOpenCreatorNote();
  };

  return (
    <group ref={rootRef} position={[0, 0.08, 0]} scale={initialScale}>
      <AltarConnections chapterPositions={chapterPositions} activeIndex={activeIndex} />

      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.08, 1.24, 0.26, 96]} />
        <meshPhysicalMaterial color="#111521" roughness={0.34} metalness={0.48} clearcoat={0.32} clearcoatRoughness={0.5} emissive="#151a2a" emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.78, 0.9, 0.12, 96]} />
        <meshStandardMaterial color="#18202f" roughness={0.32} metalness={0.46} emissive="#2a2416" emissiveIntensity={0.16} />
      </mesh>

      <mesh ref={outerRingRef} position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.68, 0.014, 10, 128]} />
        <meshBasicMaterial color="#b79d69" transparent opacity={0.62} depthWrite={false} />
      </mesh>
      <mesh ref={middleRingRef} position={[0, 0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.49, 0.008, 8, 112]} />
        <meshBasicMaterial color="#c4ae7c" transparent opacity={0.46} depthWrite={false} />
      </mesh>
      <mesh ref={innerRingRef} position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.29, 0.005, 8, 96]} />
        <meshBasicMaterial color="#d0bd91" transparent opacity={0.32} depthWrite={false} />
      </mesh>

      {Array.from({ length: 24 }, (_, index) => {
        const angle = index / 24 * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.91, 0.31, Math.sin(angle) * 0.91]} rotation={[-Math.PI / 2, 0, -angle]}>
            <boxGeometry args={[index % 4 === 0 ? 0.09 : 0.045, 0.007, 0.008]} />
            <meshBasicMaterial color="#c2a972" transparent opacity={index % 4 === 0 ? 0.68 : 0.34} />
          </mesh>
        );
      })}

      <mesh
        position={[0, 0.72, 0]}
        onPointerEnter={(event) => handlePointer(event, true)}
        onPointerLeave={(event) => handlePointer(event, false)}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.36, 24, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={starRef} position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.115, 36, 36]} />
        <meshBasicMaterial color="#ebe8df" transparent opacity={0.94} />
      </mesh>
      <mesh position={[0, 0.72, 0]} scale={2.2}>
        <sphereGeometry args={[0.115, 24, 24]} />
        <meshBasicMaterial color="#cdd6e4" transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={rippleRef} position={[0, 0.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.735, 96]} />
        <meshBasicMaterial ref={rippleMaterialRef} color="#d9dee8" transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.32, 0.95, 48, 1, true]} />
        <meshBasicMaterial color="#d9e0eb" transparent opacity={0.055} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <Sparkles count={24} scale={[1.8, 1.4, 1.8]} size={0.65} speed={0.08} color="#bda36d" opacity={0.34} noise={0.35} />
      <pointLight ref={lightRef} position={[0, 0.76, 0]} color="#e4e4df" intensity={0.52} distance={4.8} decay={2.25} />
    </group>
  );
}
