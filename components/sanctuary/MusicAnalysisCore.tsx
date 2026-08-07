"use client";

import { Html, Line } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { sanctuaryPalette } from "./visualSystem";

type MusicAnalysisCoreProps = {
  position: [number, number, number];
  index: number;
  skipIntro?: boolean;
  onHoverChange: (index: number | null) => void;
  onOpen: () => void;
};

export function MusicAnalysisCore({ position, index, skipIntro = false, onHoverChange, onOpen }: MusicAnalysisCoreProps) {
  const rootRef = useRef<THREE.Group>(null);
  const lineMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const [isHovered, setIsHovered] = useState(false);
  const melodyPath = useMemo(() => [
    [-0.82, 0.025, 1.1],
    [-0.36, 0.03, 0.18],
    [0.22, 0.035, -0.9],
    [-0.12, 0.04, -2.2],
    [0.08, 0.045, -3.7],
  ] as [number, number, number][], []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 5.9, 7.7);
    if (rootRef.current) rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, Math.max(0.001, reveal), 2, delta));
    if (lineMaterialRef.current) lineMaterialRef.current.opacity = THREE.MathUtils.damp(lineMaterialRef.current.opacity, hovered.current ? 0.72 : 0.24, 1.8, delta);
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
    onOpen();
  };

  return (
    <group ref={rootRef} position={position} scale={skipIntro ? 1 : 0.001}>
      <mesh position={[0, 1.55, -1.48]} onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
        <boxGeometry args={[2.55, 3.3, 5.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      {[0, 1, 2].map((archIndex) => {
        const z = -archIndex * 1.44;
        const scale = 1 - archIndex * 0.12;
        return (
          <group key={archIndex} position={[0, 0, z]} scale={scale}>
            <mesh position={[-1.02, 1.24, 0]}>
              <boxGeometry args={[0.18, 2.48, 0.28]} />
              <meshStandardMaterial color="#0a111c" roughness={0.72} metalness={0.12} />
            </mesh>
            <mesh position={[1.02, 1.24, 0]}>
              <boxGeometry args={[0.18, 2.48, 0.28]} />
              <meshStandardMaterial color="#0a111c" roughness={0.72} metalness={0.12} />
            </mesh>
            <mesh position={[0, 2.42, 0]}>
              <torusGeometry args={[1.02, 0.09, 10, 64, Math.PI]} />
              <meshStandardMaterial color="#101a28" roughness={0.66} metalness={0.16} />
            </mesh>
            <mesh position={[0, 2.42, 0.08]}>
              <torusGeometry args={[0.91, 0.012, 8, 64, Math.PI]} />
              <meshStandardMaterial color={sanctuaryPalette.agedGold} roughness={0.55} metalness={0.74} transparent opacity={isHovered ? 0.52 : 0.2} />
            </mesh>
          </group>
        );
      })}

      <Line points={melodyPath} color={sanctuaryPalette.agedGold} lineWidth={isHovered ? 1.05 : 0.58} transparent opacity={isHovered ? 0.72 : 0.24} />
      {melodyPath.slice(1, 4).map((point, pointIndex) => (
        <mesh key={pointIndex} position={point}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial ref={pointIndex === 1 ? lineMaterialRef : undefined} color={sanctuaryPalette.champagneGold} transparent opacity={isHovered ? 0.72 : 0.24} depthWrite={false} />
        </mesh>
      ))}

      <Html center position={[0, 0.24, 0.65]} distanceFactor={9.4} zIndexRange={[24, 8]} style={{ pointerEvents: "none" }}>
        <div className={`corridor-inscription${isHovered ? " is-readable" : ""}`}>
          <span>旋律回廊</span>
          <small>声音留下的路径</small>
        </div>
      </Html>
    </group>
  );
}
