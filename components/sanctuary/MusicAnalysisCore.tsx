"use client";

import { Html, Line } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const [isHovered, setIsHovered] = useState(false);
  const melodyPath = useMemo(() => [
    [-0.72, 0.035, 1.18],
    [-0.34, 0.04, 0.28],
    [0.18, 0.045, -0.76],
    [-0.08, 0.05, -2.02],
    [0.06, 0.055, -3.62],
  ] as [number, number, number][], []);

  useEffect(() => () => { document.body.style.cursor = ""; }, []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 5.8, 7.1);
    if (rootRef.current) {
      rootRef.current.visible = skipIntro || elapsed.current >= 5.75;
      const target = 0.98 + reveal * 0.02;
      rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, target, 1.7, delta));
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
    onOpen();
  };

  return (
    <group ref={rootRef} position={position} scale={skipIntro ? 1 : 0.98}>
      <mesh position={[0, 0.35, -1.18]} onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
        <boxGeometry args={[2.3, 0.75, 5.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      <mesh position={[0, 0.018, -1.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.15, 5.4]} />
        <meshBasicMaterial color="#02040a" transparent opacity={0.64} depthWrite={false} />
      </mesh>
      <Line points={melodyPath} color={sanctuaryPalette.agedGold} lineWidth={isHovered ? 1 : 0.56} transparent opacity={isHovered ? 0.68 : 0.28} />
      {melodyPath.slice(1, 4).map((point, pointIndex) => (
        <mesh key={pointIndex} position={point}>
          <sphereGeometry args={[pointIndex === 1 ? 0.035 : 0.022, 16, 16]} />
          <meshBasicMaterial color={pointIndex === 1 ? sanctuaryPalette.moonWhite : sanctuaryPalette.champagneGold} transparent opacity={isHovered ? 0.66 : 0.25} depthWrite={false} />
        </mesh>
      ))}
      <mesh position={[0.06, 0.18, -3.58]}>
        <circleGeometry args={[0.19, 36]} />
        <meshBasicMaterial color={sanctuaryPalette.moonWhite} transparent opacity={isHovered ? 0.22 : 0.06} depthWrite={false} />
      </mesh>

      <Html center position={[-0.72, 0.2, 1.26]} distanceFactor={9.2} zIndexRange={[24, 8]} style={{ pointerEvents: "none" }}>
        <div className={`corridor-inscription${isHovered ? " is-readable" : ""}`}>
          <span>旋律回廊</span>
          <small>声音留下的路径</small>
        </div>
      </Html>
    </group>
  );
}
