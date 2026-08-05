"use client";

import { Html } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { sanctuaryMotion, sanctuaryPalette } from "./visualSystem";

type MusicAnalysisCoreProps = {
  position: [number, number, number];
  index: number;
  skipIntro?: boolean;
  onHoverChange: (index: number | null) => void;
  onOpen: () => void;
};

export function MusicAnalysisCore({ position, index, skipIntro = false, onHoverChange, onOpen }: MusicAnalysisCoreProps) {
  const rootRef = useRef<THREE.Group>(null);
  const nebulaRef = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const [isHovered, setIsHovered] = useState(false);
  const particles = useMemo(() => {
    const points = new Float32Array(24 * 3);
    for (let i = 0; i < 24; i += 1) {
      const progress = i / 23;
      const angle = progress * Math.PI * 3.4;
      const radius = 0.34 + Math.sin(progress * Math.PI) * 0.86;
      points[i * 3] = Math.cos(angle) * radius;
      points[i * 3 + 1] = 0.36 + progress * 1.46;
      points[i * 3 + 2] = Math.sin(angle) * radius * 0.42;
    }
    return points;
  }, []);

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 6.7, 8);
    if (rootRef.current) {
      const target = Math.max(0.001, reveal * (hovered.current ? 1.06 : 1));
      rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, target, 2.4, delta));
      rootRef.current.position.y = position[1];
    }
    if (nebulaRef.current) {
      const breathe = 1 + Math.sin(clock.elapsedTime * sanctuaryMotion.breathe) * (hovered.current ? 0.035 : 0.018);
      nebulaRef.current.scale.setScalar(THREE.MathUtils.damp(nebulaRef.current.scale.x, breathe, 1.8, delta));
    }
  });

  const handlePointer = (event: ThreeEvent<PointerEvent>, active: boolean) => {
    event.stopPropagation();
    hovered.current = active;
    setIsHovered(active);
    onHoverChange(active ? index : null);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onOpen();
  };

  return (
    <group ref={rootRef} position={position} scale={skipIntro ? 1 : 0.001}>
      <mesh position={[0, 1.08, 0]} onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
        <sphereGeometry args={[1.35, 26, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      <group ref={nebulaRef} position={[0, 1.08, 0]}>
        <mesh position={[-0.62, -0.14, -0.18]} scale={[0.24, 0.88, 0.22]} rotation={[0.08, 0.24, -0.2]}>
          <octahedronGeometry args={[0.72, 2]} />
          <meshPhysicalMaterial color={sanctuaryPalette.indigoMist} roughness={0.18} transmission={0.62} thickness={1.05} ior={1.45} clearcoat={0.82} transparent opacity={isHovered ? 0.32 : 0.2} depthWrite={false} emissive={sanctuaryPalette.deepIndigo} emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0.58, -0.22, -0.1]} scale={[0.2, 0.7, 0.18]} rotation={[-0.04, -0.3, 0.24]}>
          <octahedronGeometry args={[0.72, 2]} />
          <meshPhysicalMaterial color={sanctuaryPalette.moonBlue} roughness={0.22} transmission={0.55} thickness={0.9} ior={1.42} clearcoat={0.74} transparent opacity={isHovered ? 0.22 : 0.12} depthWrite={false} emissive={sanctuaryPalette.deepIndigo} emissiveIntensity={0.07} />
        </mesh>
        <mesh scale={[1.1, 0.9, 0.76]} rotation={[0.08, 0.18, -0.04]}>
          <octahedronGeometry args={[0.82, 4]} />
          <meshPhysicalMaterial color={sanctuaryPalette.indigoMist} emissive={sanctuaryPalette.deepIndigo} emissiveIntensity={isHovered ? 0.24 : 0.13} roughness={0.24} transmission={0.46} thickness={1.34} clearcoat={0.72} clearcoatRoughness={0.24} transparent opacity={isHovered ? 0.46 : 0.36} depthWrite={false} />
        </mesh>
        <mesh scale={[1.48, 0.94, 0.82]} rotation={[0.2, 0.35, -0.12]}>
          <sphereGeometry args={[0.82, 40, 28]} />
          <meshBasicMaterial color={sanctuaryPalette.indigoMist} transparent opacity={isHovered ? 0.075 : 0.035} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0.22, 0.5]} scale={[1, 0.62, 1]}>
          <torusGeometry args={[1.08, 0.008, 8, 120, Math.PI * 1.18]} />
          <meshBasicMaterial color={sanctuaryPalette.champagneGold} transparent opacity={isHovered ? 0.34 : 0.13} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <pointLight color={sanctuaryPalette.moonBlue} intensity={isHovered ? 0.62 : 0.28} distance={3.6} decay={2.2} position={[0, 0.08, 0.4]} />
      </group>

      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
        <pointsMaterial color={sanctuaryPalette.champagneGold} size={0.022} transparent opacity={isHovered ? 0.36 : 0.12} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>

      <Html center position={[0, -0.05, 0.1]} distanceFactor={9.2} zIndexRange={[30, 10]} style={{ pointerEvents: "none" }}>
        <div className={`sanctuary-label sanctuary-label--entry sanctuary-label--analysis${isHovered ? " is-hovered" : ""}`}>
          <span>音乐解析</span>
          <small>进入声音星云</small>
        </div>
      </Html>
    </group>
  );
}
