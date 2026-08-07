"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createSanctuaryMarbleTexture } from "./SanctuaryMarbleTexture";
import { sanctuaryPalette } from "./visualSystem";

function BrassInlay({ position, scale }: { position: [number, number, number]; scale: [number, number, number] }) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={sanctuaryPalette.agedGold} roughness={0.52} metalness={0.72} />
    </mesh>
  );
}

export function MoonlitReliquaryRoom({ skipIntro = false }: { skipIntro?: boolean }) {
  const revealRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.MeshBasicMaterial>(null);
  const elapsed = useRef(skipIntro ? 20 : 0);
  const stoneTexture = useMemo(() => createSanctuaryMarbleTexture(27.03, true), []);

  useEffect(() => () => stoneTexture.dispose(), [stoneTexture]);

  useFrame(({ clock }, delta) => {
    elapsed.current += delta;
    const reveal = THREE.MathUtils.smoothstep(elapsed.current, 1.2, 6.6);
    if (revealRef.current) {
      revealRef.current.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const material = object.material as THREE.Material & { opacity?: number };
        if (material.opacity === undefined) return;
        if (material.userData.baseOpacity === undefined) material.userData.baseOpacity = material.opacity;
        material.opacity = THREE.MathUtils.damp(material.opacity, (material.userData.baseOpacity as number) * reveal, 1.4, delta);
      });
    }
    if (moonRef.current) {
      const breath = 0.72 + Math.sin(clock.elapsedTime * 0.16) * 0.025;
      moonRef.current.opacity = THREE.MathUtils.damp(moonRef.current.opacity, reveal * breath, 1.2, delta);
    }
  });

  return (
    <group ref={revealRef}>
      {/* A rectangular room replaces the former circular public sanctuary. */}
      <mesh position={[0, -0.24, -0.5]} receiveShadow>
        <boxGeometry args={[13.6, 0.44, 12.8]} />
        <meshPhysicalMaterial map={stoneTexture} bumpMap={stoneTexture} bumpScale={0.012} color="#070b13" roughness={0.48} metalness={0.18} clearcoat={0.22} clearcoatRoughness={0.7} />
      </mesh>

      {/* Rear wall: one dominant moon window, no repeated arcade. */}
      <mesh position={[-4.72, 2.72, -5.35]}>
        <boxGeometry args={[4.2, 5.9, 0.48]} />
        <meshStandardMaterial map={stoneTexture} color="#0a101a" roughness={0.74} metalness={0.08} />
      </mesh>
      <mesh position={[4.72, 2.72, -5.35]}>
        <boxGeometry args={[4.2, 5.9, 0.48]} />
        <meshStandardMaterial map={stoneTexture} color="#0a101a" roughness={0.74} metalness={0.08} />
      </mesh>
      <mesh position={[0, 5.48, -5.35]}>
        <boxGeometry args={[5.6, 0.4, 0.48]} />
        <meshStandardMaterial map={stoneTexture} color="#0a101a" roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh position={[-6.55, 2.7, -0.7]}>
        <boxGeometry args={[0.52, 5.9, 9.8]} />
        <meshStandardMaterial map={stoneTexture} color="#070b13" roughness={0.78} metalness={0.06} />
      </mesh>
      <mesh position={[6.55, 2.7, -0.7]}>
        <boxGeometry args={[0.52, 5.9, 9.8]} />
        <meshStandardMaterial map={stoneTexture} color="#070b13" roughness={0.78} metalness={0.06} />
      </mesh>

      <group position={[0.65, 2.85, -5.18]}>
        <mesh position={[0, 0, -0.18]}>
          <circleGeometry args={[2.18, 72]} />
          <meshBasicMaterial color="#081735" transparent opacity={0.76} />
        </mesh>
        <mesh position={[0.45, 0.24, -0.12]}>
          <circleGeometry args={[0.92, 64]} />
          <meshBasicMaterial ref={moonRef} color={sanctuaryPalette.moonWhite} transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh position={[0.45, 0.24, -0.16]} scale={1.24}>
          <circleGeometry args={[0.92, 64]} />
          <meshBasicMaterial color={sanctuaryPalette.moonBlue} transparent opacity={0.055} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <torusGeometry args={[2.22, 0.16, 16, 96]} />
          <meshStandardMaterial map={stoneTexture} color="#101827" roughness={0.62} metalness={0.14} />
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <torusGeometry args={[2.04, 0.018, 8, 96]} />
          <meshStandardMaterial color={sanctuaryPalette.agedGold} roughness={0.5} metalness={0.78} />
        </mesh>
      </group>

      {/* Hand-set floor seams guide the eye toward the collection, not toward menu nodes. */}
      <BrassInlay position={[0.25, 0.002, 1.8]} scale={[0.018, 0.016, 6.5]} />
      <BrassInlay position={[-2.75, 0.004, -1.2]} scale={[2.7, 0.012, 0.016]} />
      <BrassInlay position={[3.25, 0.004, -1.9]} scale={[2.2, 0.012, 0.016]} />

      {/* Foreground jambs create the feeling of entering a concealed room. */}
      <mesh position={[-6.55, 2.65, 3.9]} rotation={[0, -0.13, 0]}>
        <boxGeometry args={[1.1, 5.8, 1.6]} />
        <meshStandardMaterial map={stoneTexture} color="#05080e" roughness={0.82} />
      </mesh>
      <mesh position={[6.55, 2.65, 3.9]} rotation={[0, 0.13, 0]}>
        <boxGeometry args={[1.1, 5.8, 1.6]} />
        <meshStandardMaterial map={stoneTexture} color="#05080e" roughness={0.82} />
      </mesh>
      <mesh position={[0, 5.65, 3.8]}>
        <boxGeometry args={[13.8, 1.2, 1.5]} />
        <meshStandardMaterial map={stoneTexture} color="#05080e" roughness={0.84} />
      </mesh>

      {/* Quiet wall mouldings add craft without becoming HUD ornament. */}
      {[-5.2, 5.2].map((x) => (
        <group key={x} position={[x, 2.35, -5.02]}>
          <mesh>
            <boxGeometry args={[0.065, 3.9, 0.08]} />
            <meshStandardMaterial color={sanctuaryPalette.agedGold} roughness={0.58} metalness={0.68} transparent opacity={0.4} />
          </mesh>
          <mesh position={[0, 2.02, 0]}>
            <boxGeometry args={[0.62, 0.05, 0.08]} />
            <meshStandardMaterial color={sanctuaryPalette.agedGold} roughness={0.58} metalness={0.68} transparent opacity={0.28} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
