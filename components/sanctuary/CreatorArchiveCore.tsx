"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { createAgedBrassTexture, createBlackLacquerTexture, createVellumTexture } from "./ReliquaryTextures";
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
  const brassTexture = useMemo(() => createAgedBrassTexture(), []);
  const vellumTexture = useMemo(() => createVellumTexture(), []);

  useEffect(() => () => {
    lacquerTexture.dispose();
    brassTexture.dispose();
    vellumTexture.dispose();
    document.body.style.cursor = "";
  }, [brassTexture, lacquerTexture, vellumTexture]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 5.2, 7.1);
    if (rootRef.current) {
      const target = Math.max(0.001, reveal * 0.72);
      rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, target, 2, delta));
    }
    if (pageRef.current) {
      pageRef.current.rotation.x = THREE.MathUtils.damp(pageRef.current.rotation.x, hovered.current ? -0.3 : -0.38, 1.8, delta);
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
    <group ref={rootRef} position={position} rotation={[0, 0.28, 0]} scale={skipIntro ? 0.72 : 0.001}>
      <RoundedBox args={[2.38, 0.16, 1.28]} radius={0.075} smoothness={5} position={[0, 0.48, 0]} castShadow>
        <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.01} color="#111d2a" roughness={0.44} metalness={0.1} clearcoat={0.32} clearcoatRoughness={0.56} />
      </RoundedBox>
      <RoundedBox args={[1.52, 0.4, 0.69]} radius={0.07} smoothness={5} position={[0, 0.2, 0]}>
        <meshStandardMaterial bumpMap={lacquerTexture} bumpScale={0.008} color="#0a121d" roughness={0.68} metalness={0.07} />
      </RoundedBox>
      <mesh position={[0, 0.53, 0.625]}>
        <boxGeometry args={[1.84, 0.034, 0.025]} />
        <meshStandardMaterial map={brassTexture} color={sanctuaryPalette.agedGold} roughness={0.52} metalness={0.78} />
      </mesh>

      <group ref={pageRef} position={[0, 1.12, 0.08]} rotation={[-0.38, 0.04, -0.025]}>
        <RoundedBox args={[1.78, 1.2, 0.055]} radius={0.035} smoothness={4} position={[0.02, 0, -0.045]}>
          <meshPhysicalMaterial color="#14233b" roughness={0.64} metalness={0.04} clearcoat={0.14} clearcoatRoughness={0.7} />
        </RoundedBox>
        <mesh position={[0.18, 0.02, 0.022]} rotation={[0, 0, 0.018]} onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
          <planeGeometry args={[1.62, 1.08, 1, 1]} />
          <meshStandardMaterial bumpMap={vellumTexture} bumpScale={0.005} color="#ad9e80" roughness={0.96} metalness={0} side={THREE.DoubleSide} transparent opacity={isHovered ? 0.95 : 0.84} />
        </mesh>
        <mesh position={[0.18, -0.32, 0.042]} scale={[1.2, 0.01, 0.01]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={sanctuaryPalette.agedGold} transparent opacity={isHovered ? 0.68 : 0.38} />
        </mesh>
        <RoundedBox args={[0.26, 0.095, 0.08]} radius={0.018} smoothness={3} position={[0.58, 0.48, 0.055]} rotation={[0, 0, 0.03]}>
          <meshStandardMaterial map={brassTexture} bumpMap={brassTexture} bumpScale={0.004} color="#8f764d" roughness={0.52} metalness={0.82} />
        </RoundedBox>
        <Html center position={[0.18, 0.02, 0.055]} distanceFactor={8.6} zIndexRange={[24, 8]} style={{ pointerEvents: "none" }}>
          <div className={`manuscript-copy${isHovered ? " is-readable" : ""}`} aria-hidden="true">
            <span>金淼</span>
            <strong>《月下星海》</strong>
            <small>创作手稿 · 月光叙事</small>
          </div>
        </Html>
      </group>
    </group>
  );
}
