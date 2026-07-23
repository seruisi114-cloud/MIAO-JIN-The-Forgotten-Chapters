"use client";

import { Edges, Html, Line, Sparkles } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { archiveCoreVertexShader, archiveMonumentFragmentShader } from "@/three/shaders/archiveCore";

type CreatorArchiveCoreProps = {
  position: [number, number, number];
  index: number;
  skipIntro?: boolean;
  onHoverChange: (index: number | null) => void;
  onOpenCreatorArchive: () => void;
};

const archiveGlyphs: Array<Array<[number, number, number]>> = [
  [[-0.52, 0.74, 0.19], [-0.31, 0.83, 0.2], [-0.08, 0.78, 0.2], [0.12, 0.88, 0.2], [0.36, 0.8, 0.2], [0.52, 0.86, 0.19]],
  [[-0.42, 0.28, 0.2], [-0.18, 0.36, 0.21], [0.03, 0.31, 0.21], [0.27, 0.4, 0.21], [0.45, 0.34, 0.2]],
  [[-0.36, -0.25, 0.2], [-0.15, -0.15, 0.21], [0.08, -0.22, 0.21], [0.34, -0.12, 0.2]],
];

export function CreatorArchiveCore({ position, index, skipIntro = false, onHoverChange, onOpenCreatorArchive }: CreatorArchiveCoreProps) {
  const rootRef = useRef<THREE.Group>(null);
  const monumentRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const nebulaMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const rippleMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const rippleTime = useRef(-1);
  const [isHovered, setIsHovered] = useState(false);
  const nebulaUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 },
  }), []);
  const archiveShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.52);
    shape.lineTo(0.58, 1.31);
    shape.lineTo(0.94, 0.78);
    shape.lineTo(0.86, -0.92);
    shape.lineTo(0.55, -1.28);
    shape.lineTo(0, -1.42);
    shape.lineTo(-0.55, -1.28);
    shape.lineTo(-0.86, -0.92);
    shape.lineTo(-0.94, 0.78);
    shape.lineTo(-0.58, 1.31);
    shape.closePath();
    return shape;
  }, []);

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 4.1, 5.8);
    if (rootRef.current) rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, Math.max(0.001, reveal), 2.25, delta));
    if (monumentRef.current) monumentRef.current.position.y = 1.65 + Math.sin(clock.elapsedTime * 0.35) * 0.035;
    if (nebulaMaterialRef.current) {
      nebulaMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
      nebulaMaterialRef.current.uniforms.uHover.value = THREE.MathUtils.damp(nebulaMaterialRef.current.uniforms.uHover.value, hovered.current ? 1 : 0, 2.3, delta);
    }
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
    onHoverChange(active ? index : null);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    rippleTime.current = 0;
    onOpenCreatorArchive();
  };

  return (
    <group ref={rootRef} position={position} scale={skipIntro ? 1 : 0.001}>
      <group position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh><torusGeometry args={[0.92, 0.012, 8, 112, Math.PI * 1.58]} /><meshBasicMaterial color="#b89a61" transparent opacity={isHovered ? 0.56 : 0.3} depthWrite={false} /></mesh>
        <mesh rotation={[0, 0, 2.08]}><torusGeometry args={[1.14, 0.006, 8, 112, Math.PI * 0.84]} /><meshBasicMaterial color="#d0bc8c" transparent opacity={0.16} depthWrite={false} /></mesh>
      </group>

      <group ref={monumentRef} position={[0, 1.65, 0]}>
        <mesh onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
          <extrudeGeometry args={[archiveShape, { depth: 0.24, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.075, bevelThickness: 0.055, curveSegments: 8 }]} />
          <meshPhysicalMaterial color="#0b1627" roughness={0.16} metalness={0.18} transmission={0.62} thickness={1.42} ior={1.47} clearcoat={0.88} clearcoatRoughness={0.14} envMapIntensity={1.2} transparent opacity={0.56} emissive="#183354" emissiveIntensity={isHovered ? 0.18 : 0.07} />
          <Edges scale={1.002} threshold={20} color={isHovered ? "#bea66f" : "#665a41"} />
        </mesh>
        <mesh position={[0, 0, -0.08]} scale={[1.055, 1.04, 1]}>
          <shapeGeometry args={[archiveShape, 8]} />
          <meshBasicMaterial color="#13223a" transparent opacity={0.22} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, 0.251]}>
          <shapeGeometry args={[archiveShape, 8]} />
          <shaderMaterial ref={nebulaMaterialRef} uniforms={nebulaUniforms} vertexShader={archiveCoreVertexShader} fragmentShader={archiveMonumentFragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>

        <Line points={[[-0.58, 1.31, 0.27], [-0.94, 0.78, 0.27], [-0.9, 0.18, 0.27]]} color="#b99a60" lineWidth={0.52} transparent opacity={isHovered ? 0.74 : 0.36} />
        <Line points={[[0.58, 1.31, 0.27], [0.94, 0.78, 0.27], [0.9, 0.18, 0.27]]} color="#b99a60" lineWidth={0.52} transparent opacity={isHovered ? 0.74 : 0.36} />
        <Line points={[[-0.86, -0.92, 0.27], [-0.55, -1.28, 0.27], [-0.16, -1.38, 0.27]]} color="#8c774e" lineWidth={0.4} transparent opacity={isHovered ? 0.62 : 0.27} />
        <Line points={[[0.86, -0.92, 0.27], [0.55, -1.28, 0.27], [0.16, -1.38, 0.27]]} color="#8c774e" lineWidth={0.4} transparent opacity={isHovered ? 0.62 : 0.27} />

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
        <Sparkles count={62} scale={[2.8, 3.35, 1.6]} size={0.58} speed={isHovered ? 0.18 : 0.065} color="#c8ac70" opacity={isHovered ? 0.52 : 0.26} noise={0.42} />
        <Sparkles count={32} scale={[2.35, 2.9, 1.35]} size={0.42} speed={isHovered ? 0.12 : 0.04} color="#91acd1" opacity={isHovered ? 0.28 : 0.13} noise={0.7} />
      </group>

      <mesh ref={rippleRef} position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.82, 0.84, 96]} />
        <meshBasicMaterial ref={rippleMaterialRef} color="#e0e6ed" transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html center position={[0, 3.48, 0.1]} distanceFactor={9.4} zIndexRange={[30, 10]} style={{ pointerEvents: "none" }}>
        <div className={`sanctuary-label sanctuary-label--entry sanctuary-label--creator${isHovered ? " is-hovered" : ""}`}>
          <span>创作者档案</span>
          <small>金淼 · 宇宙档案空间</small>
        </div>
      </Html>
    </group>
  );
}
