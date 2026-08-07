"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { createBlackLacquerTexture, createVellumTexture } from "./ReliquaryTextures";
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
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const [isHovered, setIsHovered] = useState(false);
  const lacquerTexture = useMemo(() => createBlackLacquerTexture(), []);
  const vellumTexture = useMemo(() => createVellumTexture(), []);

  useEffect(() => () => {
    lacquerTexture.dispose();
    vellumTexture.dispose();
    document.body.style.cursor = "";
  }, [lacquerTexture, vellumTexture]);

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
      <RoundedBox args={[2.55, 0.2, 1.42]} radius={0.09} smoothness={5} position={[0, 0.53, 0]} castShadow>
        <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.01} color="#0d1520" roughness={0.5} metalness={0.12} clearcoat={0.24} clearcoatRoughness={0.62} />
      </RoundedBox>
      <RoundedBox args={[1.72, 0.48, 0.78]} radius={0.08} smoothness={5} position={[0, 0.2, 0]}>
        <meshStandardMaterial bumpMap={lacquerTexture} bumpScale={0.008} color="#080d15" roughness={0.72} metalness={0.08} />
      </RoundedBox>
      <mesh position={[0, 0.57, 0.68]}>
        <boxGeometry args={[2.0, 0.045, 0.035]} />
        <meshStandardMaterial color={sanctuaryPalette.agedGold} roughness={0.58} metalness={0.7} />
      </mesh>

      <group ref={pageRef} position={[0, 1.02, 0.08]} rotation={[-0.54, 0.04, -0.025]}>
        <mesh position={[-0.24, 0.04, -0.05]} rotation={[0, 0, -0.025]}>
          <planeGeometry args={[1.7, 1.18, 1, 1]} />
          <meshStandardMaterial bumpMap={vellumTexture} bumpScale={0.004} color="#8f836d" roughness={0.94} metalness={0} side={THREE.DoubleSide} transparent opacity={0.76} />
        </mesh>
        <mesh position={[0.18, 0.02, 0]} rotation={[0, 0, 0.018]} onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
          <planeGeometry args={[1.78, 1.22, 1, 1]} />
          <meshStandardMaterial bumpMap={vellumTexture} bumpScale={0.004} color="#b6aa91" roughness={0.94} metalness={0} side={THREE.DoubleSide} transparent opacity={isHovered ? 0.96 : 0.82} />
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
    </group>
  );
}
