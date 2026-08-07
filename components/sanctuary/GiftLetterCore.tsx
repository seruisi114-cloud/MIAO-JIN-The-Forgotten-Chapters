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
      const target = Math.max(0.001, reveal * 0.86);
      rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, target, 2, delta));
    }
    if (letterRef.current) {
      letterRef.current.position.y = THREE.MathUtils.damp(letterRef.current.position.y, hovered.current ? 1.55 : 1.48, 2, delta);
      letterRef.current.rotation.x = THREE.MathUtils.damp(letterRef.current.rotation.x, hovered.current ? -0.08 : -0.13, 2, delta);
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
    <group ref={rootRef} position={position} rotation={[0, -0.22, 0]} scale={skipIntro ? 0.86 : 0.001}>
      <RoundedBox args={[2.46, 0.2, 1.46]} radius={0.085} smoothness={6} position={[0, 0.45, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.013} color="#142235" roughness={0.38} metalness={0.12} clearcoat={0.46} clearcoatRoughness={0.42} />
      </RoundedBox>
      <RoundedBox args={[1.72, 0.42, 0.82]} radius={0.065} smoothness={5} position={[0, 0.2, 0]}>
        <meshStandardMaterial bumpMap={lacquerTexture} bumpScale={0.009} color="#09131f" roughness={0.65} metalness={0.08} />
      </RoundedBox>
      <mesh position={[0, 0.56, 0.715]}>
        <boxGeometry args={[2.06, 0.045, 0.03]} />
        <meshStandardMaterial map={brassTexture} color={sanctuaryPalette.agedGold} roughness={0.54} metalness={0.8} />
      </mesh>

      <RoundedBox args={[1.96, 1.72, 0.09]} radius={0.06} smoothness={5} position={[0, 1.42, -0.22]}>
        <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.012} color="#111f30" roughness={0.43} metalness={0.11} clearcoat={0.28} clearcoatRoughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[1.74, 1.5, 0.035]} radius={0.045} smoothness={4} position={[0, 1.42, -0.16]}>
        <meshStandardMaterial map={brassTexture} color="#806943" roughness={0.56} metalness={0.82} />
      </RoundedBox>
      <RoundedBox args={[1.6, 1.36, 0.055]} radius={0.035} smoothness={4} position={[0, 1.42, -0.125]}>
        <meshStandardMaterial bumpMap={lacquerTexture} bumpScale={0.008} color="#07111d" roughness={0.72} metalness={0.04} />
      </RoundedBox>

      {[-0.84, 0.84].map((x) => (
        <group key={`letter-support-${x}`} position={[x, 0.85, -0.13]}>
          <RoundedBox args={[0.08, 1.04, 0.1]} radius={0.025} smoothness={4}>
            <meshStandardMaterial map={brassTexture} color="#8d754c" roughness={0.5} metalness={0.86} />
          </RoundedBox>
          <mesh position={[0, 0.54, 0.015]}>
            <sphereGeometry args={[0.075, 32, 20]} />
            <meshStandardMaterial map={brassTexture} color="#aa8f5e" roughness={0.46} metalness={0.88} />
          </mesh>
        </group>
      ))}

      <group
        ref={letterRef}
        position={[0, 1.48, 0.08]}
        rotation={[-0.13, -0.03, 0.025]}
        onPointerEnter={(event) => handlePointer(event, true)}
        onPointerLeave={(event) => handlePointer(event, false)}
        onClick={handleClick}
      >
        <RoundedBox args={[1.72, 1.04, 0.065]} radius={0.035} smoothness={5} castShadow>
          <meshPhysicalMaterial map={vellumTexture} bumpMap={vellumTexture} bumpScale={0.008} color="#d0c1a2" roughness={0.92} metalness={0} clearcoat={0.018} transparent opacity={isHovered ? 1 : 0.97} />
        </RoundedBox>
        <mesh position={[0, 0.06, 0.038]}>
          <shapeGeometry args={[flapShape]} />
          <meshStandardMaterial map={vellumTexture} bumpMap={vellumTexture} bumpScale={0.006} color="#b9a98b" roughness={0.96} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.18, 0.075]}>
          <circleGeometry args={[0.14, 40]} />
          <meshStandardMaterial ref={sealRef} map={brassTexture} bumpMap={brassTexture} bumpScale={0.006} color="#9c8052" roughness={0.54} metalness={0.82} emissive={sanctuaryPalette.champagneGold} emissiveIntensity={0.018} />
        </mesh>
        <Html center position={[0, -0.18, 0.09]} distanceFactor={9} zIndexRange={[24, 8]} style={{ pointerEvents: "none" }}>
          <span className={`gift-letter-monogram${isHovered ? " is-readable" : ""}`}>月</span>
        </Html>
      </group>

      <Html center position={[0, 0.48, 0.755]} distanceFactor={8.2} zIndexRange={[24, 8]} style={{ pointerEvents: "none" }}>
        <div className={`gift-letter-copy gift-letter-copy--plaque${isHovered ? " is-readable" : ""}`} aria-hidden="true">
          <span>给金淼的话</span>
          <small>封存于月光</small>
        </div>
      </Html>
    </group>
  );
}
