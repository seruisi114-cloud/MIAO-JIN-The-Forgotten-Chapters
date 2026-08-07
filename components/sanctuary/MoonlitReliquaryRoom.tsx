"use client";

import { useFrame } from "@react-three/fiber";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createBlackLacquerTexture, createMoonGlowTexture, createMoonSurfaceTexture, createStarSeaTexture } from "./ReliquaryTextures";
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
  const moonGlowTexture = useMemo(() => createMoonGlowTexture(), []);
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
    moonGlowTexture.dispose();
    starSeaTexture.dispose();
  }, [lacquerTexture, moonGlowTexture, moonTexture, starSeaTexture]);

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    if (windowRef.current) windowRef.current.visible = skipIntro || elapsed.current >= 0.65;
    if (pedestalRef.current) pedestalRef.current.visible = skipIntro || elapsed.current >= 2.55;
    if (moonMaterialRef.current) moonMaterialRef.current.emissiveIntensity = 0.22 + Math.sin(clock.elapsedTime * 0.1) * 0.006;
  });

  return (
    <group>
      <group ref={windowRef} position={[1.62, 3.18, -5.62]} visible={skipIntro}>
        <mesh position={[0, 0, -0.08]}>
          <shapeGeometry args={[archWindow, 32]} />
          <meshBasicMaterial map={starSeaTexture} color="#8ba0bd" />
        </mesh>
        <points position={[0, 0, 0.008]}>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[windowStars, 3]} /></bufferGeometry>
          <pointsMaterial color={sanctuaryPalette.moonWhite} size={0.018} transparent opacity={0.28} depthWrite={false} sizeAttenuation />
        </points>
        <mesh position={[0.86, 0.31, 0.02]} rotation={[-0.04, -0.46, 0.02]}>
          <sphereGeometry args={[1.05, 96, 64]} />
          <meshStandardMaterial ref={moonMaterialRef} map={moonTexture} bumpMap={moonTexture} bumpScale={0.075} color="#e0dfd8" roughness={0.95} metalness={0} emissive="#53657c" emissiveMap={moonTexture} emissiveIntensity={0.14} />
        </mesh>
        <sprite position={[0.86, 0.31, -0.12]} scale={[2.62, 2.62, 1]}>
          <spriteMaterial map={moonGlowTexture} color="#a8bed6" transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
        <mesh position={[0, 0, 0.12]} castShadow>
          <extrudeGeometry args={[archFrame, { depth: 0.28, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.07, bevelThickness: 0.065 }]} />
          <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.018} color="#111e2d" roughness={0.43} metalness={0.18} clearcoat={0.44} clearcoatRoughness={0.42} />
        </mesh>
        <mesh position={[0, 0, 0.43]}>
          <extrudeGeometry args={[archInlay, { depth: 0.018, bevelEnabled: false }]} />
          <meshStandardMaterial color="#92774d" roughness={0.5} metalness={0.84} transparent opacity={0.72} />
        </mesh>
      </group>

      <mesh position={[-4.72, 3.15, -5.35]} receiveShadow>
        <boxGeometry args={[5.6, 7.1, 0.44]} />
        <meshStandardMaterial bumpMap={lacquerTexture} bumpScale={0.014} color="#0a1422" roughness={0.8} metalness={0.04} />
      </mesh>
      <mesh position={[5.53, 3.15, -5.35]} receiveShadow>
        <boxGeometry args={[3.35, 7.1, 0.44]} />
        <meshStandardMaterial bumpMap={lacquerTexture} bumpScale={0.014} color="#091320" roughness={0.8} metalness={0.04} />
      </mesh>
      <mesh position={[0.4, 7.05, -5.35]} receiveShadow>
        <boxGeometry args={[14, 1.25, 0.44]} />
        <meshStandardMaterial color="#050a13" roughness={0.9} metalness={0.02} />
      </mesh>

      <mesh position={[0, -0.18, -0.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[15.5, 15]} />
        <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.009} color="#081321" roughness={0.61} metalness={0.08} clearcoat={0.17} clearcoatRoughness={0.69} />
      </mesh>

      <group ref={pedestalRef} visible={skipIntro}>
        <OctagonalPedestal width={4.85} depth={3.3} height={0.1} y={0.05}>
          <meshStandardMaterial color="#7a633f" roughness={0.53} metalness={0.8} />
        </OctagonalPedestal>
        <OctagonalPedestal width={4.68} depth={3.13} height={0.34} y={0.22}>
          <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.016} color="#132438" roughness={0.44} metalness={0.13} clearcoat={0.4} clearcoatRoughness={0.48} />
        </OctagonalPedestal>
        <OctagonalPedestal width={4.43} depth={2.9} height={0.07} y={0.43}>
          <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.011} color="#21364e" roughness={0.31} metalness={0.16} clearcoat={0.65} clearcoatRoughness={0.32} />
        </OctagonalPedestal>
        <OctagonalPedestal width={4.18} depth={2.68} height={0.025} y={0.47}>
          <meshStandardMaterial color="#a18858" roughness={0.5} metalness={0.87} />
        </OctagonalPedestal>
        <OctagonalPedestal width={4.03} depth={2.53} height={0.035} y={0.495}>
          <meshPhysicalMaterial bumpMap={lacquerTexture} bumpScale={0.008} color="#16283b" roughness={0.36} metalness={0.13} clearcoat={0.48} clearcoatRoughness={0.42} />
        </OctagonalPedestal>
      </group>

      <group position={[-0.56, -0.165, 4.22]}>
        <mesh rotation={[-Math.PI / 2, 0, -0.045]}>
          <planeGeometry args={[0.028, 5.5]} />
          <meshStandardMaterial color="#9b7d4c" roughness={0.58} metalness={0.78} transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.34, 0, 0]} rotation={[-Math.PI / 2, 0, -0.045]}>
          <planeGeometry args={[0.012, 4.1]} />
          <meshStandardMaterial color="#758aa7" roughness={0.74} metalness={0.2} transparent opacity={0.32} />
        </mesh>
      </group>
    </group>
  );
}
