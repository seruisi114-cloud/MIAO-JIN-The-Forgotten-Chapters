"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TransitionOrigin } from "@/components/transitions/CosmicDissolveTransition";
import { createBlackLacquerTexture, createMoonstoneTexture, createStarSeaTexture } from "./ReliquaryTextures";
import { sanctuaryPalette } from "./visualSystem";

type MoonSeaMusicBoxProps = {
  position: [number, number, number];
  activating: boolean;
  skipIntro?: boolean;
  onHoverChange: (index: number | null) => void;
  onActivate: (index: number) => void;
  onActivationPosition: (origin: TransitionOrigin) => void;
};

type OctagonalLayerProps = {
  width: number;
  depth: number;
  height: number;
  cut: number;
  y: number;
  children: ReactNode;
};

function createOctagonalShape(width: number, depth: number, cut: number) {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth + cut, -halfDepth);
  shape.lineTo(halfWidth - cut, -halfDepth);
  shape.lineTo(halfWidth, -halfDepth + cut);
  shape.lineTo(halfWidth, halfDepth - cut);
  shape.lineTo(halfWidth - cut, halfDepth);
  shape.lineTo(-halfWidth + cut, halfDepth);
  shape.lineTo(-halfWidth, halfDepth - cut);
  shape.lineTo(-halfWidth, -halfDepth + cut);
  shape.closePath();
  return shape;
}

function OctagonalLayer({ width, depth, height, cut, y, children }: OctagonalLayerProps) {
  const geometry = useMemo(() => {
    const result = new THREE.ExtrudeGeometry(createOctagonalShape(width, depth, cut), {
      depth: height,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: Math.min(height * 0.2, 0.045),
      bevelThickness: Math.min(height * 0.16, 0.035),
      curveSegments: 2,
    });
    result.rotateX(Math.PI / 2);
    result.translate(0, height / 2, 0);
    result.computeVertexNormals();
    return result;
  }, [cut, depth, height, width]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={[0, y, 0]} castShadow receiveShadow>
      {children}
    </mesh>
  );
}

function CornerHardware({ x, z, rotation = 0 }: { x: number; z: number; rotation?: number }) {
  return (
    <group position={[x, 0.47, z]} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.34, 0.34, 0.045]} radius={0.025} smoothness={4}>
        <meshStandardMaterial color="#88724c" roughness={0.48} metalness={0.84} />
      </RoundedBox>
      <mesh position={[-0.11, 0.1, 0.027]}>
        <circleGeometry args={[0.018, 16]} />
        <meshStandardMaterial color="#b49a65" roughness={0.4} metalness={0.92} />
      </mesh>
      <mesh position={[0.11, -0.1, 0.027]}>
        <circleGeometry args={[0.018, 16]} />
        <meshStandardMaterial color="#b49a65" roughness={0.4} metalness={0.92} />
      </mesh>
    </group>
  );
}

export function MoonSeaMusicBox({ position, activating, skipIntro = false, onHoverChange, onActivate, onActivationPosition }: MoonSeaMusicBoxProps) {
  const rootRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const lidMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const innerSeaMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const sealMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const hovered = useRef(false);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const projectedCenter = useRef(new THREE.Vector3());
  const previousOrigin = useRef<TransitionOrigin>({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const lacquerTexture = useMemo(() => createBlackLacquerTexture(), []);
  const moonstoneTexture = useMemo(() => createMoonstoneTexture(), []);
  const innerSeaTexture = useMemo(() => createStarSeaTexture(), []);

  useEffect(() => () => {
    lacquerTexture.dispose();
    moonstoneTexture.dispose();
    innerSeaTexture.dispose();
    document.body.style.cursor = "";
  }, [innerSeaTexture, lacquerTexture, moonstoneTexture]);

  useFrame(({ camera }, delta) => {
    elapsed.current += delta;

    if (rootRef.current) {
      rootRef.current.visible = skipIntro || elapsed.current >= 3.65;
    }

    if (lidRef.current) {
      const targetRotation = activating ? -0.98 : 0;
      lidRef.current.rotation.x = THREE.MathUtils.damp(lidRef.current.rotation.x, targetRotation, activating ? 1.5 : 2.6, delta);
    }

    if (lidMaterialRef.current) {
      lidMaterialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        lidMaterialRef.current.emissiveIntensity,
        activating ? 0.2 : hovered.current ? 0.075 : 0.018,
        1.8,
        delta,
      );
      lidMaterialRef.current.opacity = THREE.MathUtils.damp(lidMaterialRef.current.opacity, activating ? 0.48 : hovered.current ? 0.9 : 0.97, 1.6, delta);
    }

    if (innerSeaMaterialRef.current) {
      innerSeaMaterialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        innerSeaMaterialRef.current.emissiveIntensity,
        activating ? 1.18 : hovered.current ? 0.48 : 0.16,
        1.8,
        delta,
      );
    }

    if (sealMaterialRef.current) {
      sealMaterialRef.current.emissiveIntensity = THREE.MathUtils.damp(
        sealMaterialRef.current.emissiveIntensity,
        activating ? 0.72 : hovered.current ? 0.12 : 0.015,
        2.2,
        delta,
      );
    }

    if (activating && rootRef.current) {
      rootRef.current.localToWorld(projectedCenter.current.set(0, 0.72, 0.36));
      projectedCenter.current.project(camera);
      const origin = {
        x: (projectedCenter.current.x * 0.5 + 0.5) * 100,
        y: (-projectedCenter.current.y * 0.5 + 0.5) * 100,
      };
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
    if (!activating) onActivate(1);
  };

  return (
    <group
      ref={rootRef}
      position={position}
      rotation={[0, -0.055, 0]}
      scale={0.9}
      onPointerEnter={(event) => handlePointer(event, true)}
      onPointerLeave={(event) => handlePointer(event, false)}
      onClick={handleClick}
    >
      <OctagonalLayer width={4.08} depth={2.66} height={0.09} cut={0.47} y={0.045}>
        <meshStandardMaterial color="#665337" roughness={0.5} metalness={0.86} />
      </OctagonalLayer>
      <OctagonalLayer width={3.96} depth={2.55} height={0.18} cut={0.44} y={0.14}>
        <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.018} color="#0c1420" roughness={0.34} metalness={0.16} clearcoat={0.72} clearcoatRoughness={0.28} />
      </OctagonalLayer>
      <OctagonalLayer width={3.84} depth={2.44} height={0.72} cut={0.41} y={0.56}>
        <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.026} color="#20344b" roughness={0.31} metalness={0.2} clearcoat={0.8} clearcoatRoughness={0.24} />
      </OctagonalLayer>
      <OctagonalLayer width={3.91} depth={2.5} height={0.055} cut={0.43} y={0.895}>
        <meshStandardMaterial color="#7e6845" roughness={0.47} metalness={0.88} />
      </OctagonalLayer>

      <OctagonalLayer width={3.22} depth={1.84} height={0.04} cut={0.32} y={0.94}>
        <meshStandardMaterial ref={innerSeaMaterialRef} map={innerSeaTexture} color="#6681a2" emissive="#19345a" emissiveIntensity={0.16} roughness={0.6} />
      </OctagonalLayer>

      <group ref={lidRef} position={[0, 0.94, -1.27]}>
        <group position={[0, 0, 1.27]}>
          <OctagonalLayer width={3.96} depth={2.55} height={0.15} cut={0.44} y={0.075}>
            <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.018} color="#263c54" roughness={0.29} metalness={0.2} clearcoat={0.74} clearcoatRoughness={0.27} />
          </OctagonalLayer>
          <OctagonalLayer width={3.68} depth={2.27} height={0.035} cut={0.39} y={0.17}>
            <meshStandardMaterial color="#7d6847" roughness={0.48} metalness={0.88} />
          </OctagonalLayer>
          <OctagonalLayer width={3.48} depth={2.08} height={0.09} cut={0.35} y={0.22}>
            <meshPhysicalMaterial
              ref={lidMaterialRef}
              map={moonstoneTexture}
              bumpMap={moonstoneTexture}
              bumpScale={0.032}
              color="#d8ddd9"
              roughness={0.52}
              metalness={0.01}
              transmission={0.045}
              thickness={0.8}
              ior={1.39}
              clearcoat={0.28}
              clearcoatRoughness={0.48}
              emissive="#122947"
              emissiveIntensity={0.018}
              transparent
              opacity={0.97}
            />
          </OctagonalLayer>
        </group>
      </group>

      <CornerHardware x={-1.6} z={1.23} />
      <CornerHardware x={1.6} z={1.23} />
      <CornerHardware x={-1.92} z={0.88} rotation={Math.PI / 4} />
      <CornerHardware x={1.92} z={0.88} rotation={-Math.PI / 4} />

      <RoundedBox args={[0.72, 0.38, 0.065]} radius={0.035} smoothness={5} position={[0, 0.55, 1.285]}>
        <meshStandardMaterial ref={sealMaterialRef} color="#85704c" roughness={0.44} metalness={0.9} emissive={sanctuaryPalette.champagneGold} emissiveIntensity={0.015} />
      </RoundedBox>
      <mesh position={[0, 0.55, 1.327]}>
        <circleGeometry args={[0.055, 24]} />
        <meshStandardMaterial color="#32291d" roughness={0.58} metalness={0.68} />
      </mesh>

      <Html center position={[0, 0.55, 1.365]} distanceFactor={8.2} zIndexRange={[24, 8]} style={{ pointerEvents: "none" }}>
        <div className={`reliquary-engraving${skipIntro ? " is-restored" : ""}${isHovered ? " is-awake" : ""}`}>
          <strong>《月下星海》</strong>
          <span>MIAO JIN</span>
        </div>
      </Html>
    </group>
  );
}
