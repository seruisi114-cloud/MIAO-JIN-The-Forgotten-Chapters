"use client";

import { Html, Sparkles } from "@react-three/drei";
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

export function CreatorArchiveCore({ chapterPositions, activeIndex, skipIntro = false, onOpenCreatorNote }: CreatorArchiveCoreProps) {
  const rootRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const ringRefs = useRef<Array<THREE.Mesh | null>>([]);
  const rippleRef = useRef<THREE.Mesh>(null);
  const rippleMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const rippleTime = useRef(-1);
  const [isHovered, setIsHovered] = useState(false);

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 4.2, 5.6);
    if (rootRef.current) rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, Math.max(0.001, reveal), 2.2, delta));

    const pulse = 1 + Math.sin(clock.elapsedTime * 0.68) * (hovered.current ? 0.13 : 0.055);
    if (coreRef.current) coreRef.current.scale.setScalar(THREE.MathUtils.damp(coreRef.current.scale.x, pulse, 2.1, delta));
    if (lightRef.current) lightRef.current.intensity = THREE.MathUtils.damp(lightRef.current.intensity, hovered.current ? 1.05 : 0.5, 1.8, delta);

    const speeds = [0.052, -0.038, 0.026, -0.016];
    ringRefs.current.forEach((ring, index) => {
      if (ring) ring.rotation.z += delta * speeds[index] * (hovered.current ? 2.4 : 1);
    });

    if (rippleTime.current >= 0 && rippleRef.current && rippleMaterialRef.current) {
      rippleTime.current += delta;
      const progress = Math.min(1, rippleTime.current / 1.45);
      rippleRef.current.scale.setScalar(0.48 + progress * 3.1);
      rippleMaterialRef.current.opacity = (1 - progress) * 0.46;
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
    <group ref={rootRef} position={[0, 0.08, 0]} scale={skipIntro ? 1 : 0.001}>
      <AltarConnections chapterPositions={chapterPositions} activeIndex={activeIndex} />

      <mesh position={[0, 0.09, 0]} receiveShadow>
        <cylinderGeometry args={[1.18, 1.36, 0.3, 96]} />
        <meshPhysicalMaterial color="#101522" roughness={0.3} metalness={0.54} clearcoat={0.38} clearcoatRoughness={0.44} emissive="#151d31" emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.86, 1.02, 0.13, 96]} />
        <meshStandardMaterial color="#171f30" roughness={0.3} metalness={0.48} emissive="#312817" emissiveIntensity={0.18} />
      </mesh>

      {[0.76, 0.58, 0.4, 0.25].map((radius, index) => (
        <mesh
          key={radius}
          ref={(node) => { ringRefs.current[index] = node; }}
          position={[0, 0.34 + index * 0.012, 0]}
          rotation={[Math.PI / 2, 0, index * 0.38]}
        >
          <torusGeometry args={[radius, index === 0 ? 0.015 : 0.007, 8, 112, index % 2 === 0 ? Math.PI * 1.68 : Math.PI * 1.42]} />
          <meshBasicMaterial color={index < 2 ? "#bea36d" : "#d4c398"} transparent opacity={0.62 - index * 0.09} depthWrite={false} />
        </mesh>
      ))}

      {Array.from({ length: 32 }, (_, index) => {
        const angle = index / 32 * Math.PI * 2;
        const major = index % 4 === 0;
        return (
          <mesh key={index} position={[Math.cos(angle) * 1.02, 0.35, Math.sin(angle) * 1.02]} rotation={[-Math.PI / 2, 0, -angle]}>
            <boxGeometry args={[major ? 0.12 : 0.052, 0.007, major ? 0.014 : 0.008]} />
            <meshBasicMaterial color="#c6aa72" transparent opacity={major ? 0.72 : 0.34} />
          </mesh>
        );
      })}

      <mesh
        position={[0, 0.86, 0]}
        onPointerEnter={(event) => handlePointer(event, true)}
        onPointerLeave={(event) => handlePointer(event, false)}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.48, 24, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef} position={[0, 0.86, 0]}>
        <sphereGeometry args={[0.14, 40, 40]} />
        <meshPhysicalMaterial color="#f0eee5" emissive="#dce4f1" emissiveIntensity={0.62} roughness={0.18} metalness={0.18} clearcoat={0.6} transparent opacity={0.96} />
      </mesh>
      <mesh position={[0, 0.86, 0]} scale={2.9}>
        <sphereGeometry args={[0.14, 28, 28]} />
        <meshBasicMaterial color="#d8dfeb" transparent opacity={0.075} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0.57, 0]}>
        <cylinderGeometry args={[0.13, 0.38, 1.25, 48, 1, true]} />
        <meshBasicMaterial color="#e0e6ef" transparent opacity={0.052} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.9, 0]} color="#e7e7df" intensity={0.5} distance={5.6} decay={2.15} />

      <mesh ref={rippleRef} position={[0, 0.37, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.77, 0.79, 96]} />
        <meshBasicMaterial ref={rippleMaterialRef} color="#e2e5e9" transparent opacity={0} depthWrite={false} />
      </mesh>

      <Sparkles count={34} scale={[2.1, 1.7, 2.1]} size={0.7} speed={isHovered ? 0.18 : 0.075} color="#c3a76e" opacity={isHovered ? 0.5 : 0.3} noise={0.35} />

      <Html center position={[0, 1.66, 0]} distanceFactor={9.2} style={{ pointerEvents: "none" }}>
        <div className={`creator-archive-inscription${isHovered ? " is-awake" : ""}`}>
          <p>创作者档案</p>
          <strong>金淼</strong>
          <span>作品 · 《月下星海》</span>
          <small>来自东方创作者的一段星海梦境。</small>
          <i aria-hidden="true" />
          <em>作者结语</em>
          <blockquote>月落之后，<br />仍有星辰记得那些未曾说出口的故事。</blockquote>
        </div>
      </Html>
    </group>
  );
}
