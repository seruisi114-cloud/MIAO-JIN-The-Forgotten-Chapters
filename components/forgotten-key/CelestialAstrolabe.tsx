"use client";

import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { FloatingRunes } from "./FloatingRunes";
import { GoldenStarMap } from "./GoldenStarMap";

type CelestialAstrolabeProps = {
  reducedMotion: boolean;
  awakened: boolean;
  errorSignal: number;
  inputFocused: boolean;
  keyLength: number;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function fadeGroup(group: THREE.Group | null, factor: number, delta: number) {
  if (!group) return;
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.Points)) return;
    const material = object.material as THREE.Material & { opacity: number; transparent: boolean };
    if (!material.transparent) return;
    if (material.userData.baseOpacity === undefined) material.userData.baseOpacity = material.opacity;
    material.opacity = THREE.MathUtils.damp(material.opacity, material.userData.baseOpacity * factor, 1.4, delta);
  });
}

export function CelestialAstrolabe({ reducedMotion, awakened, errorSignal, inputFocused, keyLength }: CelestialAstrolabeProps) {
  const rootRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Group>(null);
  const middleRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const sealRef = useRef<THREE.Mesh>(null);
  const sealMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const sealLightRef = useRef<THREE.PointLight>(null);
  const goldLightRef = useRef<THREE.PointLight>(null);
  const hovered = useRef(false);
  const errorTime = useRef(-1);
  const wakeTime = useRef(0);

  const ticks = useMemo(() => {
    const random = seededRandom(511041);
    return Array.from({ length: 60 }, (_, index) => {
      const angle = (index / 60) * Math.PI * 2;
      const major = index % 6 === 0;
      return {
        angle,
        radius: 1.02 + (random() - 0.5) * 0.018,
        length: major ? 0.14 : 0.066 + random() * 0.018,
        opacity: major ? 0.68 : 0.25 + random() * 0.14,
      };
    });
  }, []);

  useEffect(() => {
    if (errorSignal > 0) errorTime.current = 0;
  }, [errorSignal]);

  useEffect(() => {
    wakeTime.current = 0;
  }, [awakened]);

  useFrame(({ clock, pointer }, delta) => {
    const root = rootRef.current;
    if (!root) return;
    const time = clock.elapsedTime;
    const smoothing = 1 - Math.exp(-delta * 2.2);
    if (awakened) wakeTime.current = Math.min(5.5, wakeTime.current + delta);
    const firstRing = awakened ? THREE.MathUtils.smoothstep(wakeTime.current, 0.85, 2.0) : 0;
    const secondRing = awakened ? THREE.MathUtils.smoothstep(wakeTime.current, 1.75, 3.0) : 0;
    const finalReveal = awakened ? THREE.MathUtils.smoothstep(wakeTime.current, 2.5, 4.3) : 0;
    const hoverSpeed = hovered.current || inputFocused ? 1.6 : 1;
    const awakenSpeed = THREE.MathUtils.lerp(0.72, 3.8, secondRing);

    root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, reducedMotion ? 0 : -pointer.y * 0.045, smoothing);
    root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, reducedMotion ? 0 : pointer.x * 0.058, smoothing);
    root.position.y = -0.12 + (reducedMotion ? 0 : Math.sin(time * 0.31) * 0.022);
    const targetScale = THREE.MathUtils.lerp(0.43, 1, secondRing);
    root.scale.setScalar(THREE.MathUtils.damp(root.scale.x, targetScale, 1.15, delta));
    fadeGroup(innerRef.current, awakened ? THREE.MathUtils.lerp(0.26, 1, firstRing) : 0.26, delta);
    fadeGroup(middleRef.current, awakened ? THREE.MathUtils.lerp(0.06, 1, secondRing) : 0.06, delta);
    fadeGroup(outerRef.current, awakened ? THREE.MathUtils.lerp(0.035, 1, finalReveal) : 0.035, delta);

    if (errorTime.current >= 0) {
      errorTime.current += delta;
      const decay = Math.max(0, 1 - errorTime.current / 0.58);
      root.position.x = Math.sin(errorTime.current * 48) * 0.045 * decay;
      if (errorTime.current > 0.58) errorTime.current = -1;
    } else {
      root.position.x = THREE.MathUtils.damp(root.position.x, 0, 8, delta);
    }

    if (!reducedMotion) {
      if (outerRef.current) outerRef.current.rotation.z += delta * 0.018 * hoverSpeed * awakenSpeed;
      if (middleRef.current) middleRef.current.rotation.z -= delta * 0.031 * hoverSpeed * awakenSpeed;
      if (innerRef.current) innerRef.current.rotation.z += delta * 0.012 * hoverSpeed * awakenSpeed;
    }

    if (sealRef.current) {
      const base = THREE.MathUtils.lerp(inputFocused ? 1.15 : 0.96, 1.62, firstRing);
      const pulse = base + Math.sin(time * (firstRing > 0.5 ? 1.1 : 0.68)) * THREE.MathUtils.lerp(0.07, 0.18, firstRing);
      sealRef.current.scale.setScalar(pulse);
    }
    if (sealMaterialRef.current) sealMaterialRef.current.opacity = THREE.MathUtils.damp(sealMaterialRef.current.opacity, THREE.MathUtils.lerp(inputFocused ? 0.96 : 0.82, 1, firstRing), 1, delta);
    if (sealLightRef.current) sealLightRef.current.intensity = THREE.MathUtils.damp(sealLightRef.current.intensity, THREE.MathUtils.lerp(inputFocused ? 0.72 : 0.36, 1.75, firstRing), 0.7, delta);
    if (goldLightRef.current) goldLightRef.current.intensity = THREE.MathUtils.damp(goldLightRef.current.intensity, THREE.MathUtils.lerp(hovered.current || inputFocused ? 0.7 : 0.34, 1.12, finalReveal), 0.8, delta);
  });

  const handlePointer = (event: ThreeEvent<PointerEvent>, active: boolean) => {
    event.stopPropagation();
    hovered.current = active;
  };

  return (
    <group ref={rootRef} position={[0, -0.12, 0.72]} scale={0.43}>
      <pointLight ref={goldLightRef} color="#bca06b" intensity={0.5} distance={3.8} decay={2.6} position={[0, 0, 0.7]} />

      <mesh onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)}>
        <torusGeometry args={[0.92, 0.11, 48, 192]} />
        <meshPhysicalMaterial color="#08090d" roughness={0.36} metalness={0.62} clearcoat={0.62} clearcoatRoughness={0.44} emissive="#21180b" emissiveIntensity={awakened ? 0.24 : 0.11} />
      </mesh>

      <mesh position={[0, 0, -0.055]}>
        <circleGeometry args={[0.82, 160]} />
        <meshPhysicalMaterial color="#01030a" roughness={0.72} metalness={0.18} transparent opacity={0.9} depthWrite={false} />
      </mesh>

      <group ref={outerRef}>
        {[1.1, 1.17, 1.24].map((radius, index) => (
          <mesh key={radius} position={[0, 0, 0.045 + index * 0.006]}>
            <torusGeometry args={[radius, index === 1 ? 0.012 : 0.006, 10, 192]} />
            <meshBasicMaterial color="#bca06b" transparent opacity={0.18 + index * 0.08} depthWrite={false} />
          </mesh>
        ))}
        {ticks.map((tick, index) => (
          <mesh key={index} position={[Math.cos(tick.angle) * tick.radius, Math.sin(tick.angle) * tick.radius, 0.082]} rotation={[0, 0, tick.angle + Math.PI / 2]}>
            <boxGeometry args={[tick.length, 0.009, 0.008]} />
            <meshBasicMaterial
              color={index % 6 === 0 && index / 6 < keyLength ? "#ead9ad" : "#c9ae75"}
              transparent
              opacity={index % 6 === 0 && index / 6 < keyLength ? 0.92 : tick.opacity}
            />
          </mesh>
        ))}
      </group>

      <group ref={middleRef}>
        {[0.72, 0.79, 0.84].map((radius, index) => (
          <mesh key={radius} position={[0, 0, 0.06 + index * 0.008]}>
            <torusGeometry args={[radius, index === 1 ? 0.015 : 0.005, 10, 160]} />
            <meshBasicMaterial color="#a98a55" transparent opacity={0.22 + index * 0.08} depthWrite={false} />
          </mesh>
        ))}
        {Array.from({ length: 12 }, (_, index) => {
          const angle = index / 12 * Math.PI * 2;
          return (
            <mesh key={index} position={[Math.cos(angle) * 0.81, Math.sin(angle) * 0.81, 0.105]} rotation={[0, 0, angle]}>
              <octahedronGeometry args={[index % 3 === 0 ? 0.027 : 0.016, 0]} />
              <meshBasicMaterial color="#d3bd8c" transparent opacity={index % 3 === 0 ? 0.66 : 0.35} />
            </mesh>
          );
        })}
      </group>

      <group ref={innerRef}>
        <mesh position={[0, 0, 0.07]}>
          <torusGeometry args={[0.61, 0.007, 8, 144]} />
          <meshBasicMaterial color="#bca06b" transparent opacity={0.34} depthWrite={false} />
        </mesh>
      </group>

      <GoldenStarMap awakened={awakened} reducedMotion={reducedMotion} />

      <FloatingRunes awakened={awakened} reducedMotion={reducedMotion} />

      <mesh position={[0, 0, 0.125]}>
        <ringGeometry args={[0.035, 0.048, 64]} />
        <meshBasicMaterial color="#d3bd8c" transparent opacity={awakened ? 0.78 : 0.38} />
      </mesh>
      <mesh ref={sealRef} position={[0, 0, 0.15]}>
        <sphereGeometry args={[0.026, 28, 28]} />
        <meshBasicMaterial ref={sealMaterialRef} color="#e8e5dc" transparent opacity={0.82} />
      </mesh>
      <pointLight ref={sealLightRef} color="#e8e5dc" intensity={0.36} distance={awakened ? 2.4 : 0.95} decay={2.7} position={[0, 0, 0.2]} />
    </group>
  );
}
