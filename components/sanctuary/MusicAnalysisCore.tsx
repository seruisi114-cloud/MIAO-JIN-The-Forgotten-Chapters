"use client";

import { Html, Line, Sparkles } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

type MusicAnalysisCoreProps = {
  position: [number, number, number];
  index: number;
  skipIntro?: boolean;
  onHoverChange: (index: number | null) => void;
  onOpen: () => void;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function MusicAnalysisCore({ position, index, skipIntro = false, onHoverChange, onOpen }: MusicAnalysisCoreProps) {
  const rootRef = useRef<THREE.Group>(null);
  const nebulaRef = useRef<THREE.Group>(null);
  const spectrumRef = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const [isHovered, setIsHovered] = useState(false);
  const particles = useMemo(() => {
    const random = seededRandom(98413);
    const points = new Float32Array(78 * 3);
    for (let i = 0; i < 78; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 0.32 + random() * 1.12;
      points[i * 3] = Math.cos(angle) * radius;
      points[i * 3 + 1] = 1.05 + (random() - 0.5) * 1.55;
      points[i * 3 + 2] = Math.sin(angle) * radius * 0.56;
    }
    return points;
  }, []);
  const wave = useMemo<Array<[number, number, number]>>(
    () => Array.from({ length: 38 }, (_, pointIndex) => {
      const x = -1.05 + pointIndex / 37 * 2.1;
      return [x, 1.05 + Math.sin(pointIndex * 0.72) * 0.18 * (1 - Math.abs(x) * 0.34), 0.54];
    }),
    [],
  );

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 6.7, 8);
    if (rootRef.current) {
      const target = Math.max(0.001, reveal * (hovered.current ? 1.06 : 1));
      rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, target, 2.4, delta));
      rootRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.28 + 2.1) * 0.035;
    }
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y += delta * (hovered.current ? 0.09 : 0.025);
      nebulaRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.16) * 0.08;
    }
    if (spectrumRef.current) {
      spectrumRef.current.children.forEach((child, barIndex) => {
        const mesh = child as THREE.Mesh;
        const pulse = 0.42 + Math.abs(Math.sin(clock.elapsedTime * 0.48 + barIndex * 0.72)) * (hovered.current ? 0.78 : 0.4);
        mesh.scale.y = THREE.MathUtils.damp(mesh.scale.y, pulse, 2.2, delta);
      });
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
        <mesh scale={[1.2, 0.78, 0.72]}>
          <sphereGeometry args={[0.82, 48, 32]} />
          <meshPhysicalMaterial color="#182948" emissive="#284875" emissiveIntensity={isHovered ? 0.2 : 0.09} roughness={0.35} transmission={0.52} thickness={1.2} transparent opacity={0.26} depthWrite={false} />
        </mesh>
        <mesh scale={[1.48, 0.94, 0.82]} rotation={[0.2, 0.35, -0.12]}>
          <sphereGeometry args={[0.82, 40, 28]} />
          <meshBasicMaterial color="#3f4c86" transparent opacity={isHovered ? 0.075 : 0.035} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        {[0.92, 1.18, 1.42].map((radius, ringIndex) => (
          <mesh key={radius} rotation={[Math.PI / 2 + ringIndex * 0.18, ringIndex * 0.4, ringIndex * 0.68]} scale={[1, 0.56 + ringIndex * 0.08, 1]}>
            <torusGeometry args={[radius, ringIndex === 0 ? 0.012 : 0.006, 8, 120, Math.PI * (1.35 + ringIndex * 0.12)]} />
            <meshBasicMaterial color={ringIndex === 1 ? "#d3bd86" : "#91a9ca"} transparent opacity={(isHovered ? 0.42 : 0.18) - ringIndex * 0.035} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>

      <Line points={wave} color="#d4be88" lineWidth={0.65} transparent opacity={isHovered ? 0.66 : 0.3} />
      <group ref={spectrumRef} position={[0, 0.55, 0.58]}>
        {Array.from({ length: 11 }, (_, barIndex) => (
          <mesh key={barIndex} position={[(barIndex - 5) * 0.13, 0, 0]}>
            <boxGeometry args={[0.018, 0.48, 0.018]} />
            <meshBasicMaterial color={barIndex % 3 === 0 ? "#d2bd89" : "#b7c6dd"} transparent opacity={isHovered ? 0.55 : 0.24} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
        <pointsMaterial color="#cab178" size={0.026} transparent opacity={isHovered ? 0.52 : 0.24} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <Sparkles count={26} scale={[2.6, 2.1, 1.5]} position={[0, 1.05, 0]} size={0.46} speed={isHovered ? 0.18 : 0.065} color="#a9c1df" opacity={isHovered ? 0.38 : 0.17} noise={0.7} />

      <Html center position={[0, -0.05, 0.1]} distanceFactor={9.2} zIndexRange={[30, 10]} style={{ pointerEvents: "none" }}>
        <div className={`sanctuary-label sanctuary-label--entry sanctuary-label--analysis${isHovered ? " is-hovered" : ""}`}>
          <span>音乐解析</span>
          <small>进入声音星云</small>
        </div>
      </Html>
    </group>
  );
}
