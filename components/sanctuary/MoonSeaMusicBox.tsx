"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TransitionOrigin } from "@/components/transitions/CosmicDissolveTransition";
import { createAgedBrassTexture, createBlackLacquerTexture, createMoonstoneTexture, createStarSeaTexture } from "./ReliquaryTextures";
import { MusicBoxAwakening } from "./MusicBoxAwakening";
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

function CornerGuard({ x, z, rotation = 0, brassTexture }: { x: number; z: number; rotation?: number; brassTexture: THREE.Texture }) {
  return (
    <group position={[x, 0.5, z]} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.085, 0.54, 0.04]} radius={0.018} smoothness={4}>
        <meshStandardMaterial map={brassTexture} bumpMap={brassTexture} bumpScale={0.006} color="#9b8257" roughness={0.43} metalness={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.18, 0.055, 0.045]} radius={0.012} smoothness={3} position={[0, 0.23, 0.006]}>
        <meshStandardMaterial map={brassTexture} color="#a1895d" roughness={0.4} metalness={0.92} />
      </RoundedBox>
      <RoundedBox args={[0.18, 0.055, 0.045]} radius={0.012} smoothness={3} position={[0, -0.23, 0.006]}>
        <meshStandardMaterial map={brassTexture} color="#a1895d" roughness={0.4} metalness={0.92} />
      </RoundedBox>
      {[0.16, -0.16].map((y) => (
        <mesh key={y} position={[0, y, 0.028]}>
          <circleGeometry args={[0.018, 20]} />
          <meshStandardMaterial map={brassTexture} color="#b29a69" roughness={0.46} metalness={0.88} />
        </mesh>
      ))}
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
  const activationElapsed = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const lacquerTexture = useMemo(() => createBlackLacquerTexture(), []);
  const brassTexture = useMemo(() => createAgedBrassTexture(), []);
  const moonstoneTexture = useMemo(() => createMoonstoneTexture(), []);
  const innerSeaTexture = useMemo(() => createStarSeaTexture(), []);

  useEffect(() => () => {
    lacquerTexture.dispose();
    brassTexture.dispose();
    moonstoneTexture.dispose();
    innerSeaTexture.dispose();
    document.body.style.cursor = "";
  }, [brassTexture, innerSeaTexture, lacquerTexture, moonstoneTexture]);

  useFrame(({ camera }, delta) => {
    elapsed.current += delta;

    if (rootRef.current) {
      rootRef.current.visible = skipIntro || elapsed.current >= 3.65;
    }

    if (lidRef.current) {
      activationElapsed.current = THREE.MathUtils.clamp(
        activationElapsed.current + (activating ? delta : -delta * 1.8),
        0,
        3.2,
      );
      const openProgress = THREE.MathUtils.smoothstep(activationElapsed.current, 0.12, 1.48);
      const targetRotation = activating ? -1.08 * openProgress : 0;
      lidRef.current.rotation.x = THREE.MathUtils.damp(lidRef.current.rotation.x, targetRotation, activating ? 2.15 : 2.8, delta);
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
      rotation={[0, -0.075, 0]}
      scale={0.88}
      onPointerEnter={(event) => handlePointer(event, true)}
      onPointerLeave={(event) => handlePointer(event, false)}
      onClick={handleClick}
    >
      <OctagonalLayer width={3.94} depth={2.46} height={0.075} cut={0.45} y={0.038}>
        <meshStandardMaterial map={brassTexture} bumpMap={brassTexture} bumpScale={0.004} color="#806943" roughness={0.46} metalness={0.88} />
      </OctagonalLayer>
      <OctagonalLayer width={3.84} depth={2.37} height={0.15} cut={0.42} y={0.12}>
        <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.014} color="#0b121c" roughness={0.3} metalness={0.13} clearcoat={0.78} clearcoatRoughness={0.25} />
      </OctagonalLayer>
      <OctagonalLayer width={3.74} depth={2.29} height={0.78} cut={0.4} y={0.55}>
        <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.021} color="#111d2b" roughness={0.27} metalness={0.16} clearcoat={0.86} clearcoatRoughness={0.22} />
      </OctagonalLayer>
      <OctagonalLayer width={3.81} depth={2.34} height={0.045} cut={0.42} y={0.925}>
        <meshStandardMaterial map={brassTexture} color="#8f764d" roughness={0.43} metalness={0.9} />
      </OctagonalLayer>

      <RoundedBox args={[2.68, 0.025, 0.025]} radius={0.008} smoothness={2} position={[0, 0.82, 1.176]}>
        <meshStandardMaterial map={brassTexture} color="#8d744b" roughness={0.5} metalness={0.86} />
      </RoundedBox>

      <OctagonalLayer width={3.28} depth={1.86} height={0.055} cut={0.32} y={0.936}>
        <meshPhysicalMaterial color="#070b12" roughness={0.72} metalness={0.08} clearcoat={0.12} clearcoatRoughness={0.7} />
      </OctagonalLayer>
      <OctagonalLayer width={3.06} depth={1.64} height={0.026} cut={0.28} y={0.972}>
        <meshStandardMaterial ref={innerSeaMaterialRef} map={innerSeaTexture} color="#7792b1" emissive="#193a66" emissiveIntensity={0.16} roughness={0.62} />
      </OctagonalLayer>

      {[-1.18, -0.59, 0, 0.59, 1.18].map((x) => (
        <mesh key={`inner-inlay-${x}`} position={[x, 0.994, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.018, 0.026, 24]} />
          <meshStandardMaterial map={brassTexture} color="#a58b5a" roughness={0.5} metalness={0.86} />
        </mesh>
      ))}

      <group ref={lidRef} position={[0, 0.962, -1.17]}>
        <group position={[0, 0, 1.17]}>
          <OctagonalLayer width={3.82} depth={2.34} height={0.13} cut={0.42} y={0.065}>
            <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.014} color="#162536" roughness={0.27} metalness={0.16} clearcoat={0.8} clearcoatRoughness={0.25} />
          </OctagonalLayer>
          <OctagonalLayer width={3.55} depth={2.07} height={0.03} cut={0.36} y={0.154}>
            <meshStandardMaterial map={brassTexture} color="#947a4f" roughness={0.44} metalness={0.9} />
          </OctagonalLayer>
          <OctagonalLayer width={3.29} depth={1.84} height={0.064} cut={0.31} y={0.197}>
            <meshPhysicalMaterial
              ref={lidMaterialRef}
              map={moonstoneTexture}
              bumpMap={moonstoneTexture}
              bumpScale={0.018}
              color="#d7dedc"
              roughness={0.46}
              metalness={0.01}
              transmission={0.025}
              thickness={0.62}
              ior={1.39}
              clearcoat={0.22}
              clearcoatRoughness={0.52}
              emissive="#1a3552"
              emissiveIntensity={0.025}
              transparent
              opacity={0.985}
            />
          </OctagonalLayer>
        </group>
      </group>

      <CornerGuard x={-1.58} z={1.16} brassTexture={brassTexture} />
      <CornerGuard x={1.58} z={1.16} brassTexture={brassTexture} />

      <RoundedBox args={[1.48, 0.09, 0.11]} radius={0.028} smoothness={4} position={[0, 0.995, -1.105]}>
        <meshStandardMaterial map={brassTexture} bumpMap={brassTexture} bumpScale={0.004} color="#806945" roughness={0.47} metalness={0.88} />
      </RoundedBox>
      {[-0.91, 0.91].map((x) => (
        <RoundedBox key={x} args={[0.24, 0.13, 0.08]} radius={0.02} smoothness={3} position={[x, 0.985, -1.11]}>
          <meshStandardMaterial map={brassTexture} color="#9a8053" roughness={0.45} metalness={0.9} />
        </RoundedBox>
      ))}

      {[-1.33, 1.33].map((x) => (
        <group key={`hinge-${x}`} position={[x, 1.01, -1.16]}>
          <RoundedBox args={[0.34, 0.12, 0.12]} radius={0.025} smoothness={4}>
            <meshStandardMaterial map={brassTexture} bumpMap={brassTexture} bumpScale={0.004} color="#9a8053" roughness={0.42} metalness={0.92} />
          </RoundedBox>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.42, 32]} />
            <meshStandardMaterial map={brassTexture} color="#ab9161" roughness={0.4} metalness={0.94} />
          </mesh>
        </group>
      ))}

      <RoundedBox args={[0.66, 0.28, 0.055]} radius={0.025} smoothness={5} position={[0, 0.62, 1.183]}>
        <meshStandardMaterial ref={sealMaterialRef} map={brassTexture} bumpMap={brassTexture} bumpScale={0.004} color="#8c754d" roughness={0.42} metalness={0.9} emissive={sanctuaryPalette.champagneGold} emissiveIntensity={0.008} />
      </RoundedBox>

      <RoundedBox args={[1.34, 0.15, 0.035]} radius={0.025} smoothness={4} position={[0, 0.285, 1.18]}>
        <meshStandardMaterial color="#070b11" roughness={0.5} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.285, 1.205]}>
        <circleGeometry args={[0.075, 32]} />
        <meshStandardMaterial map={brassTexture} bumpMap={brassTexture} bumpScale={0.005} color="#9d8253" roughness={0.45} metalness={0.88} />
      </mesh>
      <mesh position={[0, 0.285, 1.228]}>
        <circleGeometry args={[0.024, 24]} />
        <meshStandardMaterial color="#2a2117" roughness={0.58} metalness={0.62} />
      </mesh>

      <MusicBoxAwakening active={activating} hovered={isHovered} />

      <Html center position={[0, 0.62, 1.222]} distanceFactor={8.5} zIndexRange={[24, 8]} style={{ pointerEvents: "none" }}>
        <div className={`reliquary-engraving${skipIntro ? " is-restored" : ""}${isHovered ? " is-awake" : ""}`}>
          <strong>《月下星海》</strong>
          <span>MIAO JIN</span>
        </div>
      </Html>
    </group>
  );
}
