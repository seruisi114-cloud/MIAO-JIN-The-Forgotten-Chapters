"use client";

import { Edges, Html } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TransitionOrigin } from "@/components/transitions/CosmicDissolveTransition";
import { sanctuaryPalette } from "./visualSystem";

type MoonSeaMusicBoxProps = {
  position: [number, number, number];
  activating: boolean;
  skipIntro?: boolean;
  onHoverChange: (index: number | null) => void;
  onActivate: (index: number) => void;
  onActivationPosition: (origin: TransitionOrigin) => void;
};

function makeOctagonalShape(width: number, depth: number, cut: number) {
  const shape = new THREE.Shape();
  const x = width / 2;
  const y = depth / 2;
  shape.moveTo(-x + cut, -y);
  shape.lineTo(x - cut, -y);
  shape.lineTo(x, -y + cut);
  shape.lineTo(x, y - cut);
  shape.lineTo(x - cut, y);
  shape.lineTo(-x + cut, y);
  shape.lineTo(-x, y - cut);
  shape.lineTo(-x, -y + cut);
  shape.closePath();
  return shape;
}

export function MoonSeaMusicBox({ position, activating, skipIntro = false, onHoverChange, onActivate, onActivationPosition }: MoonSeaMusicBoxProps) {
  const rootRef = useRef<THREE.Group>(null);
  const moonstoneRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const seamRef = useRef<THREE.MeshStandardMaterial>(null);
  const innerLightRef = useRef<THREE.PointLight>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const projectedCenter = useRef(new THREE.Vector3());
  const previousOrigin = useRef<TransitionOrigin>({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const boxShape = useMemo(() => makeOctagonalShape(3.6, 2.15, 0.3), []);
  const lidShape = useMemo(() => makeOctagonalShape(3.42, 1.98, 0.26), []);
  const stars = useMemo(() => {
    const values = new Float32Array(18 * 3);
    for (let index = 0; index < 18; index += 1) {
      const angle = index * 2.399;
      const radius = 0.18 + (index % 6) * 0.18;
      values[index * 3] = Math.cos(angle) * radius * 1.3;
      values[index * 3 + 1] = 1.15 + Math.sin(index * 1.7) * 0.035;
      values[index * 3 + 2] = Math.sin(angle) * radius * 0.58;
    }
    return values;
  }, []);

  useFrame(({ camera, clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 3.6, 6.8);
    if (rootRef.current) {
      const target = Math.max(0.001, reveal * (activating ? 1.035 : 1));
      rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, target, 1.9, delta));
      rootRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.18) * 0.008;
    }
    if (moonstoneRef.current) {
      moonstoneRef.current.emissiveIntensity = THREE.MathUtils.damp(moonstoneRef.current.emissiveIntensity, activating ? 0.42 : hovered.current ? 0.18 : 0.075, 2.2, delta);
    }
    if (seamRef.current) {
      seamRef.current.emissiveIntensity = THREE.MathUtils.damp(seamRef.current.emissiveIntensity, activating ? 1.7 : hovered.current ? 0.46 : 0.08, 2.8, delta);
    }
    if (innerLightRef.current) {
      innerLightRef.current.intensity = THREE.MathUtils.damp(innerLightRef.current.intensity, activating ? 2.4 : hovered.current ? 0.72 : 0.18, 2.3, delta);
    }
    if (activating && rootRef.current) {
      rootRef.current.localToWorld(projectedCenter.current.set(0, 1.05, 0.12));
      projectedCenter.current.project(camera);
      const origin = { x: (projectedCenter.current.x * 0.5 + 0.5) * 100, y: (-projectedCenter.current.y * 0.5 + 0.5) * 100 };
      if (Math.abs(origin.x - previousOrigin.current.x) > 0.18 || Math.abs(origin.y - previousOrigin.current.y) > 0.18) {
        previousOrigin.current = origin;
        onActivationPosition(origin);
      }
    }
  });

  const handlePointer = (event: ThreeEvent<PointerEvent>, active: boolean) => {
    event.stopPropagation();
    hovered.current = active;
    setIsHovered(active);
    document.body.style.cursor = active ? "pointer" : "";
    onHoverChange(active ? 1 : null);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onActivate(1);
  };

  return (
    <group ref={rootRef} position={position} scale={skipIntro ? 1 : 0.001}>
      <mesh position={[0, 0.33, 0]}>
        <cylinderGeometry args={[2.02, 2.3, 0.62, 8]} />
        <meshPhysicalMaterial color="#05080e" roughness={0.46} metalness={0.34} clearcoat={0.32} clearcoatRoughness={0.52} />
      </mesh>
      <mesh position={[0, 0.67, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
        <extrudeGeometry args={[boxShape, { depth: 0.66, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.08, bevelThickness: 0.08 }]} />
        <meshPhysicalMaterial color="#070b12" roughness={0.34} metalness={0.26} clearcoat={0.52} clearcoatRoughness={0.4} />
        <Edges threshold={28} color={sanctuaryPalette.agedGold} />
      </mesh>

      <mesh position={[0, 1.085, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[lidShape, { depth: 0.15, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.08, bevelThickness: 0.06 }]} />
        <meshPhysicalMaterial ref={moonstoneRef} color="#b7c3cf" roughness={0.42} metalness={0.02} transmission={0.22} thickness={0.82} ior={1.4} clearcoat={0.32} clearcoatRoughness={0.42} emissive="#193154" emissiveIntensity={0.075} transparent opacity={0.92} />
      </mesh>

      <mesh position={[0, 1.052, 1.085]} scale={[1.12, 0.018, 0.024]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial ref={seamRef} color={sanctuaryPalette.agedGold} roughness={0.5} metalness={0.82} emissive={sanctuaryPalette.champagneGold} emissiveIntensity={0.08} />
      </mesh>

      {[[-1.56, -0.78], [1.56, -0.78], [-1.56, 0.78], [1.56, 0.78]].map(([x, z], index) => (
        <mesh key={index} position={[x, 0.76, z]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.24, 0.72, 0.24]} />
          <meshStandardMaterial color={sanctuaryPalette.agedGold} roughness={0.58} metalness={0.72} />
        </mesh>
      ))}

      <points position={[0, 0, 0.02]}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]} /></bufferGeometry>
        <pointsMaterial color={sanctuaryPalette.moonWhite} size={0.028} transparent opacity={isHovered ? 0.36 : 0.16} depthWrite={false} sizeAttenuation />
      </points>
      <pointLight ref={innerLightRef} position={[0, 1.2, 0.1]} color={sanctuaryPalette.moonBlue} intensity={0.18} distance={4.6} decay={2.3} />

      <Html center position={[0, 0.62, 1.18]} distanceFactor={8.7} zIndexRange={[24, 8]} style={{ pointerEvents: "none" }}>
        <div className={`reliquary-plaque${isHovered ? " is-awake" : ""}`}>
          <strong>《月下星海》</strong>
          <span>MIAO JIN</span>
        </div>
      </Html>
    </group>
  );
}
