"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { createAgedBrassTexture, createBlackLacquerTexture, createVellumTexture } from "./ReliquaryTextures";
import { sanctuaryPalette } from "./visualSystem";

type GiftLetterCoreProps = {
  position: [number, number, number];
  index: number;
  skipIntro?: boolean;
  onHoverChange: (index: number | null) => void;
  onOpenGiftLetter: () => void;
};

function createFlapShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.8, 0.35);
  shape.lineTo(0.8, 0.35);
  shape.lineTo(0, -0.26);
  shape.closePath();
  return shape;
}

export function GiftLetterCore({ position, index, skipIntro = false, onHoverChange, onOpenGiftLetter }: GiftLetterCoreProps) {
  const rootRef = useRef<THREE.Group>(null);
  const letterRef = useRef<THREE.Group>(null);
  const sealRef = useRef<THREE.MeshStandardMaterial>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const [isHovered, setIsHovered] = useState(false);
  const lacquerTexture = useMemo(() => createBlackLacquerTexture(), []);
  const brassTexture = useMemo(() => createAgedBrassTexture(), []);
  const vellumTexture = useMemo(() => createVellumTexture(), []);
  const flapShape = useMemo(() => createFlapShape(), []);

  useEffect(() => () => {
    lacquerTexture.dispose();
    brassTexture.dispose();
    vellumTexture.dispose();
    document.body.style.cursor = "";
  }, [brassTexture, lacquerTexture, vellumTexture]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 5.8, 7.4);
    if (rootRef.current) {
      const target = Math.max(0.001, reveal * 0.7);
      rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, target, 2, delta));
    }
    if (letterRef.current) {
      letterRef.current.position.y = THREE.MathUtils.damp(letterRef.current.position.y, hovered.current ? 1.23 : 1.17, 2, delta);
      letterRef.current.rotation.x = THREE.MathUtils.damp(letterRef.current.rotation.x, hovered.current ? -0.29 : -0.35, 2, delta);
    }
    if (sealRef.current) {
      sealRef.current.emissiveIntensity = THREE.MathUtils.damp(sealRef.current.emissiveIntensity, hovered.current ? 0.12 : 0.018, 2, delta);
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
    onOpenGiftLetter();
  };

  return (
    <group ref={rootRef} position={position} rotation={[0, -0.3, 0]} scale={skipIntro ? 0.7 : 0.001}>
      <RoundedBox args={[2.25, 0.17, 1.3]} radius={0.075} smoothness={5} position={[0, 0.46, 0]} castShadow>
        <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.011} color="#101c2a" roughness={0.42} metalness={0.1} clearcoat={0.34} clearcoatRoughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[1.62, 0.38, 0.76]} radius={0.065} smoothness={4} position={[0, 0.2, 0]}>
        <meshStandardMaterial bumpMap={lacquerTexture} bumpScale={0.008} color="#08111b" roughness={0.7} metalness={0.06} />
      </RoundedBox>
      <mesh position={[0, 0.545, 0.64]}>
        <boxGeometry args={[1.72, 0.035, 0.025]} />
        <meshStandardMaterial map={brassTexture} color={sanctuaryPalette.agedGold} roughness={0.54} metalness={0.8} />
      </mesh>

      <group
        ref={letterRef}
        position={[0, 1.17, 0.08]}
        rotation={[-0.35, -0.03, 0.035]}
        onPointerEnter={(event) => handlePointer(event, true)}
        onPointerLeave={(event) => handlePointer(event, false)}
        onClick={handleClick}
      >
        <RoundedBox args={[1.78, 1.08, 0.06]} radius={0.035} smoothness={4}>
          <meshPhysicalMaterial map={vellumTexture} bumpMap={vellumTexture} bumpScale={0.006} color="#b4a688" roughness={0.94} metalness={0} clearcoat={0.02} transparent opacity={isHovered ? 0.98 : 0.9} />
        </RoundedBox>
        <mesh position={[0, 0.06, 0.038]}>
          <shapeGeometry args={[flapShape]} />
          <meshStandardMaterial map={vellumTexture} bumpMap={vellumTexture} bumpScale={0.005} color="#a29478" roughness={0.96} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.18, 0.075]}>
          <circleGeometry args={[0.14, 40]} />
          <meshStandardMaterial ref={sealRef} map={brassTexture} bumpMap={brassTexture} bumpScale={0.006} color="#826b45" roughness={0.58} metalness={0.78} emissive={sanctuaryPalette.champagneGold} emissiveIntensity={0.018} />
        </mesh>
        <Html center position={[0, -0.18, 0.09]} distanceFactor={9} zIndexRange={[24, 8]} style={{ pointerEvents: "none" }}>
          <span className={`gift-letter-monogram${isHovered ? " is-readable" : ""}`}>月</span>
        </Html>
        <Html center position={[0, -0.76, 0.04]} distanceFactor={8.7} zIndexRange={[24, 8]} style={{ pointerEvents: "none" }}>
          <div className={`gift-letter-copy${isHovered ? " is-readable" : ""}`} aria-hidden="true">
            <span>封存寄语</span>
            <small>待你亲手封存</small>
          </div>
        </Html>
      </group>
    </group>
  );
}
