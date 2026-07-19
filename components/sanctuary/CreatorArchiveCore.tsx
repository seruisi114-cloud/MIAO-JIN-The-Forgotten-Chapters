"use client";

import { Line, Sparkles } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { AltarConnections } from "./AltarConnections";

type CreatorArchiveCoreProps = {
  chapterPositions: Array<[number, number, number]>;
  activeIndex: number | null;
  skipIntro?: boolean;
  onOpenCreatorNote: () => void;
};

const archiveGlyphs: Array<Array<[number, number, number]>> = [
  [[-0.52, 0.74, 0.19], [-0.31, 0.83, 0.2], [-0.08, 0.78, 0.2], [0.12, 0.88, 0.2], [0.36, 0.8, 0.2], [0.52, 0.86, 0.19]],
  [[-0.42, 0.28, 0.2], [-0.18, 0.36, 0.21], [0.03, 0.31, 0.21], [0.27, 0.4, 0.21], [0.45, 0.34, 0.2]],
  [[-0.36, -0.25, 0.2], [-0.15, -0.15, 0.21], [0.08, -0.22, 0.21], [0.34, -0.12, 0.2]],
];

export function CreatorArchiveCore({ chapterPositions, activeIndex, skipIntro = false, onOpenCreatorNote }: CreatorArchiveCoreProps) {
  const rootRef = useRef<THREE.Group>(null);
  const monumentRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const rippleMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const rippleTime = useRef(-1);
  const [isHovered, setIsHovered] = useState(false);

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 4.1, 5.8);
    if (rootRef.current) rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, Math.max(0.001, reveal), 2.25, delta));
    if (monumentRef.current) monumentRef.current.position.y = 1.65 + Math.sin(clock.elapsedTime * 0.35) * 0.035;
    if (haloRef.current) {
      haloRef.current.rotation.z += delta * (hovered.current ? 0.12 : 0.025);
      haloRef.current.rotation.y += delta * 0.008;
    }
    if (coreRef.current && coreMaterialRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * (hovered.current ? 1.15 : 0.52)) * (hovered.current ? 0.14 : 0.055);
      coreRef.current.scale.setScalar(THREE.MathUtils.damp(coreRef.current.scale.x, pulse, 2.1, delta));
      coreMaterialRef.current.opacity = THREE.MathUtils.damp(coreMaterialRef.current.opacity, hovered.current ? 0.92 : 0.58, 2.3, delta);
    }
    if (lightRef.current) lightRef.current.intensity = THREE.MathUtils.damp(lightRef.current.intensity, hovered.current ? 1.15 : 0.42, 2, delta);

    if (rippleTime.current >= 0 && rippleRef.current && rippleMaterialRef.current) {
      rippleTime.current += delta;
      const progress = Math.min(1, rippleTime.current / 1.45);
      rippleRef.current.scale.setScalar(0.42 + progress * 3.25);
      rippleMaterialRef.current.opacity = (1 - progress) * 0.42;
      if (progress >= 1) rippleTime.current = -1;
    }
  });

  const handlePointer = (event: ThreeEvent<PointerEvent>, active: boolean) => {
    event.stopPropagation();
    hovered.current = active;
    setIsHovered(active);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    rippleTime.current = 0;
    onOpenCreatorNote();
  };

  return (
    <group ref={rootRef} position={[0, 0.05, 0]} scale={skipIntro ? 1 : 0.001}>
      <AltarConnections chapterPositions={chapterPositions} activeIndex={activeIndex} />

      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.22, 1.46, 0.3, 96]} />
        <meshPhysicalMaterial color="#090f1a" roughness={0.26} metalness={0.56} clearcoat={0.62} clearcoatRoughness={0.3} envMapIntensity={0.82} emissive="#17243b" emissiveIntensity={0.13} />
      </mesh>
      <mesh position={[0, 0.225, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.06, 0.018, 8, 128]} />
        <meshBasicMaterial color="#bea268" transparent opacity={0.48} depthWrite={false} />
      </mesh>
      {Array.from({ length: 40 }, (_, index) => {
        const angle = index / 40 * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 1.22, 0.24, Math.sin(angle) * 1.22]} rotation={[-Math.PI / 2, 0, -angle]}>
            <boxGeometry args={[index % 5 === 0 ? 0.12 : 0.045, 0.007, 0.009]} />
            <meshBasicMaterial color="#c4aa72" transparent opacity={index % 5 === 0 ? 0.58 : 0.24} />
          </mesh>
        );
      })}

      <group ref={monumentRef} position={[0, 1.65, 0]}>
        <mesh onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
          <boxGeometry args={[2.05, 2.78, 0.32, 8, 12, 2]} />
          <meshPhysicalMaterial color="#07101c" roughness={0.2} metalness={0.48} transmission={0.28} thickness={1.15} ior={1.46} clearcoat={0.76} clearcoatRoughness={0.22} envMapIntensity={1.08} transparent opacity={0.84} emissive="#172943" emissiveIntensity={isHovered ? 0.2 : 0.09} />
        </mesh>
        <mesh position={[0, 0, -0.15]} scale={[1.08, 1.05, 1]}>
          <boxGeometry args={[2.05, 2.78, 0.08]} />
          <meshBasicMaterial color="#13223a" transparent opacity={0.22} depthWrite={false} />
        </mesh>

        {[
          [-1.08, 0, 0.19, 0.024, 2.78],
          [1.08, 0, 0.19, 0.024, 2.78],
          [0, 1.46, 0.19, 2.18, 0.024],
          [0, -1.46, 0.19, 2.18, 0.024],
        ].map(([x, y, z, width, height], index) => (
          <mesh key={index} position={[x, y, z]}>
            <boxGeometry args={[width, height, 0.018]} />
            <meshBasicMaterial color="#c1a66c" transparent opacity={isHovered ? 0.72 : 0.42} depthWrite={false} />
          </mesh>
        ))}

        {archiveGlyphs.map((points, index) => (
          <Line key={index} points={points} color={index === 1 ? "#d5c79f" : "#ad935e"} lineWidth={0.38} transparent opacity={isHovered ? 0.46 : 0.21} />
        ))}

        <group ref={haloRef} position={[0, 0, -0.22]} rotation={[0, 0, 0.32]}>
          {[1.52, 1.75, 2.04].map((radius, index) => (
            <mesh key={radius} rotation={[0, index * 0.2, index * 0.64]} scale={[1, 0.72 + index * 0.04, 1]}>
              <torusGeometry args={[radius, index === 0 ? 0.013 : 0.007, 8, 128, Math.PI * (index === 1 ? 1.4 : 1.68)]} />
              <meshBasicMaterial color={index === 2 ? "#8ca1c0" : "#bfa269"} transparent opacity={(isHovered ? 0.44 : 0.22) - index * 0.04} depthWrite={false} />
            </mesh>
          ))}
        </group>

        <mesh ref={coreRef} position={[0, -0.02, 0.26]}>
          <icosahedronGeometry args={[0.105, 3]} />
          <meshBasicMaterial ref={coreMaterialRef} color="#edf0ea" transparent opacity={0.58} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh position={[0, -0.02, 0.22]} scale={4.2}>
          <sphereGeometry args={[0.105, 24, 24]} />
          <meshBasicMaterial color="#b8cce8" transparent opacity={0.042} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <pointLight ref={lightRef} position={[0, -0.02, 0.3]} color="#dae5f3" intensity={0.42} distance={5.2} decay={2.2} />
        <Sparkles count={46} scale={[2.8, 3.35, 1.6]} size={0.62} speed={isHovered ? 0.18 : 0.065} color="#c8ac70" opacity={isHovered ? 0.52 : 0.26} noise={0.42} />
      </group>

      <mesh ref={rippleRef} position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.82, 0.84, 96]} />
        <meshBasicMaterial ref={rippleMaterialRef} color="#e0e6ed" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
