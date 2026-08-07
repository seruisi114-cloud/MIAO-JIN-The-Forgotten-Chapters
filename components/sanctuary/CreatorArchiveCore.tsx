"use client";

import { Html } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { sanctuaryPalette } from "./visualSystem";

type CreatorArchiveCoreProps = {
  position: [number, number, number];
  index: number;
  skipIntro?: boolean;
  onHoverChange: (index: number | null) => void;
  onOpenCreatorArchive: () => void;
};

export function CreatorArchiveCore({ position, index, skipIntro = false, onHoverChange, onOpenCreatorArchive }: CreatorArchiveCoreProps) {
  const rootRef = useRef<THREE.Group>(null);
  const pageRef = useRef<THREE.Group>(null);
  const moonLightRef = useRef<THREE.SpotLight>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 5.2, 7.1);
    if (rootRef.current) {
      const target = Math.max(0.001, reveal);
      rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, target, 2, delta));
    }
    if (pageRef.current) {
      pageRef.current.rotation.x = THREE.MathUtils.damp(pageRef.current.rotation.x, hovered.current ? -0.47 : -0.54, 1.8, delta);
    }
    if (moonLightRef.current) {
      moonLightRef.current.intensity = THREE.MathUtils.damp(moonLightRef.current.intensity, hovered.current ? 1.08 : 0.22, 1.8, delta);
    }
  });

  const handlePointer = (event: ThreeEvent<PointerEvent>, active: boolean) => {
    event.stopPropagation();
    hovered.current = active;
    setIsHovered(active);
    document.body.style.cursor = active ? "pointer" : "";
    onHoverChange(active ? index : null);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onOpenCreatorArchive();
  };

  return (
    <group ref={rootRef} position={position} scale={skipIntro ? 1 : 0.001}>
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[2.46, 0.22, 1.36]} />
        <meshPhysicalMaterial color={sanctuaryPalette.obsidian} roughness={0.42} metalness={0.2} clearcoat={0.28} clearcoatRoughness={0.58} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[1.82, 0.48, 0.9]} />
        <meshStandardMaterial color="#080c13" roughness={0.66} metalness={0.14} />
      </mesh>
      <mesh position={[0, 0.57, 0.68]}>
        <boxGeometry args={[2.0, 0.045, 0.035]} />
        <meshStandardMaterial color={sanctuaryPalette.agedGold} roughness={0.58} metalness={0.7} />
      </mesh>

      <group ref={pageRef} position={[0, 1.02, 0.08]} rotation={[-0.54, 0.04, -0.025]}>
        <mesh position={[-0.24, 0.04, -0.05]} rotation={[0, 0, -0.025]}>
          <planeGeometry args={[1.7, 1.18, 1, 1]} />
          <meshStandardMaterial color="#b8b4a6" roughness={0.92} metalness={0} side={THREE.DoubleSide} transparent opacity={0.56} />
        </mesh>
        <mesh position={[0.18, 0.02, 0]} rotation={[0, 0, 0.018]} onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
          <planeGeometry args={[1.78, 1.22, 1, 1]} />
          <meshStandardMaterial color="#d3cdbd" roughness={0.94} metalness={0} side={THREE.DoubleSide} transparent opacity={isHovered ? 0.88 : 0.68} />
        </mesh>
        <mesh position={[0.18, -0.34, 0.018]} scale={[1.28, 0.012, 0.012]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={sanctuaryPalette.agedGold} transparent opacity={isHovered ? 0.62 : 0.28} />
        </mesh>
        <Html center position={[0.18, 0.02, 0.04]} distanceFactor={8.2} zIndexRange={[24, 8]} style={{ pointerEvents: "none" }}>
          <div className={`manuscript-copy${isHovered ? " is-readable" : ""}`}>
            <span>金淼</span>
            <strong>《月下星海》</strong>
            <small>来自东方创作者的一段月光叙事。</small>
          </div>
        </Html>
      </group>

      <spotLight ref={moonLightRef} position={[-0.6, 4.2, 2.1]} color={sanctuaryPalette.moonWhite} angle={0.42} penumbra={1} intensity={0.22} distance={8} decay={2.2} />
    </group>
  );
}
