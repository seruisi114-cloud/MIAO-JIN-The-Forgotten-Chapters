"use client";

import { Edges, Html, Line } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { archiveCoreVertexShader, archiveMonumentFragmentShader } from "@/three/shaders/archiveCore";
import { sanctuaryMotion, sanctuaryPalette } from "./visualSystem";

type CreatorArchiveCoreProps = {
  position: [number, number, number];
  index: number;
  skipIntro?: boolean;
  onHoverChange: (index: number | null) => void;
  onOpenCreatorArchive: () => void;
};

export function CreatorArchiveCore({ position, index, skipIntro = false, onHoverChange, onOpenCreatorArchive }: CreatorArchiveCoreProps) {
  const rootRef = useRef<THREE.Group>(null);
  const monumentRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const nebulaMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const rippleMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const memoryRef = useRef<THREE.Points>(null);
  const memoryMaterialRef = useRef<THREE.PointsMaterial>(null);
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
  const memoryPositions = useMemo(() => {
    const positions = new Float32Array(18 * 3);
    for (let particleIndex = 0; particleIndex < 18; particleIndex += 1) {
      const progress = particleIndex / 17;
      const angle = particleIndex * 2.399;
      const radius = 0.18 + Math.sin(progress * Math.PI) * 0.24;
      positions[particleIndex * 3] = Math.cos(angle) * radius;
      positions[particleIndex * 3 + 1] = -1.22 + progress * 2.46;
      positions[particleIndex * 3 + 2] = 0.34 + Math.sin(angle) * 0.13;
    }
    return positions;
  }, []);

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 4.1, 5.8);
    if (rootRef.current) rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, Math.max(0.001, reveal), 2.25, delta));
    if (monumentRef.current) monumentRef.current.position.y = 1.65;
    if (nebulaMaterialRef.current) {
      nebulaMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
      nebulaMaterialRef.current.uniforms.uHover.value = THREE.MathUtils.damp(nebulaMaterialRef.current.uniforms.uHover.value, hovered.current ? 1 : 0, 2.3, delta);
    }
    if (coreRef.current && coreMaterialRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * (hovered.current ? 1.15 : 0.52)) * (hovered.current ? 0.14 : 0.055);
      coreRef.current.scale.setScalar(THREE.MathUtils.damp(coreRef.current.scale.x, pulse, 2.1, delta));
      coreMaterialRef.current.opacity = THREE.MathUtils.damp(coreMaterialRef.current.opacity, hovered.current ? 0.92 : 0.58, 2.3, delta);
    }
    if (lightRef.current) lightRef.current.intensity = THREE.MathUtils.damp(lightRef.current.intensity, hovered.current ? 1.15 : 0.42, 2, delta);
    if (memoryRef.current) {
      const positionAttribute = memoryRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let particleIndex = 0; particleIndex < positionAttribute.count; particleIndex += 1) {
        const nextY = positionAttribute.getY(particleIndex) + delta * 0.055;
        positionAttribute.setY(particleIndex, nextY > 1.3 ? -1.28 : nextY);
      }
      positionAttribute.needsUpdate = true;
    }
    if (memoryMaterialRef.current) {
      const breath = 0.42 + Math.sin(clock.elapsedTime * sanctuaryMotion.breathe) * 0.08;
      memoryMaterialRef.current.opacity = THREE.MathUtils.damp(memoryMaterialRef.current.opacity, hovered.current ? breath + 0.18 : breath, 1.8, delta);
    }

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
      <group ref={monumentRef} position={[0, 1.65, 0]}>
        <mesh onPointerEnter={(event) => handlePointer(event, true)} onPointerLeave={(event) => handlePointer(event, false)} onClick={handleClick}>
          <extrudeGeometry args={[archiveShape, { depth: 0.24, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.075, bevelThickness: 0.055, curveSegments: 8 }]} />
          <meshPhysicalMaterial color={sanctuaryPalette.moonBlue} roughness={0.12} metalness={0.04} transmission={0.84} thickness={1.68} ior={1.46} clearcoat={0.92} clearcoatRoughness={0.1} envMapIntensity={1.18} transparent opacity={0.34} emissive={sanctuaryPalette.deepIndigo} emissiveIntensity={isHovered ? 0.16 : 0.065} />
          <Edges scale={1.002} threshold={20} color={isHovered ? sanctuaryPalette.champagneGold : sanctuaryPalette.agedGold} />
        </mesh>
        <mesh position={[0, 0, -0.08]} scale={[1.055, 1.04, 1]}>
          <shapeGeometry args={[archiveShape, 8]} />
          <meshBasicMaterial color={sanctuaryPalette.deepIndigo} transparent opacity={0.18} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, 0.251]}>
          <shapeGeometry args={[archiveShape, 8]} />
          <shaderMaterial ref={nebulaMaterialRef} uniforms={nebulaUniforms} vertexShader={archiveCoreVertexShader} fragmentShader={archiveMonumentFragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>

        <Line points={[[-0.58, 1.31, 0.27], [-0.94, 0.78, 0.27], [-0.9, -0.82, 0.27], [-0.55, -1.28, 0.27]]} color={sanctuaryPalette.champagneGold} lineWidth={0.52} transparent opacity={isHovered ? 0.72 : 0.34} />
        <Line points={[[0.58, 1.31, 0.27], [0.94, 0.78, 0.27], [0.9, -0.82, 0.27], [0.55, -1.28, 0.27]]} color={sanctuaryPalette.champagneGold} lineWidth={0.52} transparent opacity={isHovered ? 0.72 : 0.34} />

        <mesh position={[0, 0, -0.22]} rotation={[0, 0, 0.32]} scale={[1, 0.72, 1]}>
          <torusGeometry args={[1.64, 0.009, 8, 128, Math.PI * 1.16]} />
          <meshBasicMaterial color={sanctuaryPalette.champagneGold} transparent opacity={isHovered ? 0.3 : 0.12} depthWrite={false} />
        </mesh>

        <mesh ref={coreRef} position={[0, -0.02, 0.26]}>
          <sphereGeometry args={[0.095, 24, 24]} />
          <meshBasicMaterial ref={coreMaterialRef} color={sanctuaryPalette.moonWhite} transparent opacity={0.58} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh position={[0, -0.02, 0.22]} scale={4.2}>
          <sphereGeometry args={[0.105, 24, 24]} />
          <meshBasicMaterial color={sanctuaryPalette.moonBlue} transparent opacity={0.042} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <pointLight ref={lightRef} position={[0, -0.02, 0.3]} color={sanctuaryPalette.moonWhite} intensity={0.42} distance={5.2} decay={2.2} />

        <points ref={memoryRef} renderOrder={20}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[memoryPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial ref={memoryMaterialRef} color={sanctuaryPalette.champagneGold} size={0.022} sizeAttenuation transparent opacity={0.42} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>

        <Html center position={[0, 0.02, 0.34]} distanceFactor={8.8} zIndexRange={[30, 10]} style={{ pointerEvents: "none" }}>
          <div className={`creator-star-stele-copy${isHovered ? " is-awake" : ""}`}>
            <span>创作者档案</span>
            <strong>金淼</strong>
            <i aria-hidden="true" />
            <small>《月下星海》</small>
          </div>
        </Html>
      </group>

      <mesh ref={rippleRef} position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.82, 0.84, 96]} />
        <meshBasicMaterial ref={rippleMaterialRef} color={sanctuaryPalette.moonWhite} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
