"use client";

import { useFrame } from "@react-three/fiber";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createBlackLacquerTexture, createMoonSurfaceTexture, createStarSeaTexture } from "./ReliquaryTextures";
import { sanctuaryPalette } from "./visualSystem";

function createArchShape(width: number, height: number) {
  const radius = width / 2;
  const shoulder = height / 2 - radius;
  const shape = new THREE.Shape();
  shape.moveTo(-radius, -height / 2);
  shape.lineTo(-radius, shoulder);
  for (let index = 0; index <= 40; index += 1) {
    const angle = Math.PI - index / 40 * Math.PI;
    shape.lineTo(Math.cos(angle) * radius, shoulder + Math.sin(angle) * radius);
  }
  shape.lineTo(radius, -height / 2);
  shape.closePath();
  return shape;
}

function createArchFrameShape(width: number, height: number, thickness: number) {
  const outer = createArchShape(width, height);
  const inner = createArchShape(width - thickness * 2, height - thickness * 2.08);
  outer.holes.push(new THREE.Path(inner.getPoints(110)));
  return outer;
}

function createOctagonalShape(width: number, depth: number, cut: number) {
  const x = width / 2;
  const z = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-x + cut, -z);
  shape.lineTo(x - cut, -z);
  shape.lineTo(x, -z + cut);
  shape.lineTo(x, z - cut);
  shape.lineTo(x - cut, z);
  shape.lineTo(-x + cut, z);
  shape.lineTo(-x, z - cut);
  shape.lineTo(-x, -z + cut);
  shape.closePath();
  return shape;
}

function OctagonalPedestal({ width, depth, height, y, children }: { width: number; depth: number; height: number; y: number; children: ReactNode }) {
  const geometry = useMemo(() => {
    const result = new THREE.ExtrudeGeometry(createOctagonalShape(width, depth, Math.min(width, depth) * 0.13), {
      depth: height,
      bevelEnabled: true,
      bevelSegments: 5,
      bevelSize: 0.07,
      bevelThickness: 0.06,
    });
    result.rotateX(Math.PI / 2);
    result.translate(0, height / 2, 0);
    result.computeVertexNormals();
    return result;
  }, [depth, height, width]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return <mesh geometry={geometry} position={[-0.56, y, 0.86]} castShadow receiveShadow>{children}</mesh>;
}

export function MoonlitReliquaryRoom({ skipIntro = false }: { skipIntro?: boolean }) {
  const windowRef = useRef<THREE.Group>(null);
  const pedestalRef = useRef<THREE.Group>(null);
  const moonMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const lacquerTexture = useMemo(() => createBlackLacquerTexture(), []);
  const moonTexture = useMemo(() => createMoonSurfaceTexture(), []);
  const starSeaTexture = useMemo(() => createStarSeaTexture(), []);
  const archWindow = useMemo(() => createArchShape(5.65, 7.15), []);
  const archFrame = useMemo(() => createArchFrameShape(6.12, 7.62, 0.31), []);
  const archInlay = useMemo(() => createArchFrameShape(5.82, 7.31, 0.052), []);
  const windowStars = useMemo(() => {
    const values = new Float32Array(18 * 3);
    for (let index = 0; index < 18; index += 1) {
      const lane = (index * 13) % 23;
      values[index * 3] = -2.25 + lane / 22 * 4.5;
      values[index * 3 + 1] = -2.62 + ((index * 7) % 19) / 18 * 5.25;
      values[index * 3 + 2] = 0.025;
    }
    return values;
  }, []);

  useEffect(() => () => {
    lacquerTexture.dispose();
    moonTexture.dispose();
    starSeaTexture.dispose();
  }, [lacquerTexture, moonTexture, starSeaTexture]);

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    if (windowRef.current) windowRef.current.visible = skipIntro || elapsed.current >= 0.65;
    if (pedestalRef.current) pedestalRef.current.visible = skipIntro || elapsed.current >= 2.55;
    if (moonMaterialRef.current) moonMaterialRef.current.emissiveIntensity = 0.22 + Math.sin(clock.elapsedTime * 0.1) * 0.006;
  });

  return (
    <group>
      <group ref={windowRef} position={[1.48, 3.12, -5.62]} visible={skipIntro}>
        <mesh position={[0, 0, -0.08]}>
          <shapeGeometry args={[archWindow, 32]} />
          <meshBasicMaterial map={starSeaTexture} color="#6f829f" />
        </mesh>
        <points position={[0, 0, 0.008]}>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[windowStars, 3]} /></bufferGeometry>
          <pointsMaterial color={sanctuaryPalette.moonWhite} size={0.018} transparent opacity={0.28} depthWrite={false} sizeAttenuation />
        </points>
        <mesh position={[0.82, 0.5, 0.035]}>
          <circleGeometry args={[1.28, 96]} />
          <meshStandardMaterial ref={moonMaterialRef} map={moonTexture} bumpMap={moonTexture} bumpScale={0.055} color="#c5ced4" roughness={0.92} metalness={0} emissive="#536b88" emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[0.82, 0.5, -0.01]} scale={1.09}>
          <circleGeometry args={[1.28, 96]} />
          <meshBasicMaterial color="#8ea9c6" transparent opacity={0.045} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh position={[0, 0, 0.12]} castShadow>
          <extrudeGeometry args={[archFrame, { depth: 0.28, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.07, bevelThickness: 0.065 }]} />
          <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.02} color="#0a1320" roughness={0.48} metalness={0.2} clearcoat={0.36} clearcoatRoughness={0.48} />
        </mesh>
        <mesh position={[0, 0, 0.43]}>
          <extrudeGeometry args={[archInlay, { depth: 0.018, bevelEnabled: false }]} />
          <meshStandardMaterial color="#786342" roughness={0.55} metalness={0.82} transparent opacity={0.62} />
        </mesh>
      </group>

      <mesh position={[-4.72, 3.15, -5.35]} receiveShadow>
        <boxGeometry args={[5.6, 7.1, 0.44]} />
        <meshStandardMaterial bumpMap={lacquerTexture} bumpScale={0.016} color="#060c16" roughness={0.85} metalness={0.04} />
      </mesh>
      <mesh position={[5.53, 3.15, -5.35]} receiveShadow>
        <boxGeometry args={[3.35, 7.1, 0.44]} />
        <meshStandardMaterial bumpMap={lacquerTexture} bumpScale={0.016} color="#060c16" roughness={0.85} metalness={0.04} />
      </mesh>
      <mesh position={[0.4, 7.05, -5.35]} receiveShadow>
        <boxGeometry args={[14, 1.25, 0.44]} />
        <meshStandardMaterial color="#02050b" roughness={0.92} metalness={0.02} />
      </mesh>

      <mesh position={[0, -0.18, -0.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[15.5, 15]} />
        <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.009} color="#050b14" roughness={0.66} metalness={0.08} clearcoat={0.12} clearcoatRoughness={0.75} />
      </mesh>

      <group ref={pedestalRef} visible={skipIntro}>
        <OctagonalPedestal width={5.1} depth={3.55} height={0.13} y={0.065}>
          <meshStandardMaterial color="#6d593b" roughness={0.55} metalness={0.78} />
        </OctagonalPedestal>
        <OctagonalPedestal width={4.92} depth={3.37} height={0.46} y={0.29}>
          <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.018} color="#111f30" roughness={0.48} metalness={0.14} clearcoat={0.34} clearcoatRoughness={0.52} />
        </OctagonalPedestal>
        <OctagonalPedestal width={4.66} depth={3.12} height={0.085} y={0.555}>
          <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.012} color="#1b2c40" roughness={0.32} metalness={0.18} clearcoat={0.62} clearcoatRoughness={0.34} />
        </OctagonalPedestal>
      </group>
    </group>
  );
}
