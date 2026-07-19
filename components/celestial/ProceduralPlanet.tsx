"use client";

import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { AtmosphericGlow } from "./AtmosphericGlow";
import { createPlanetTextures, disposePlanetTextures, PlanetPalette, PlanetTextures } from "./PlanetTexture";
import { PlanetRings } from "./PlanetRings";

type ProceduralPlanetProps = {
  awakened: boolean;
  reducedMotion: boolean;
  position: [number, number, number];
  scale: number;
  seed: number;
  palette: PlanetPalette;
  drift?: number;
  revealDelay?: number;
  rings?: boolean;
  ringRotation?: [number, number, number];
  detail?: "high" | "low";
  opacity?: number;
};

export function ProceduralPlanet({
  awakened,
  reducedMotion,
  position,
  scale,
  seed,
  palette,
  drift = 0.02,
  revealDelay = 2.7,
  rings = false,
  ringRotation,
  detail = "high",
  opacity = 0.96,
}: ProceduralPlanetProps) {
  const textures = useMemo<PlanetTextures | null>(
    () => (typeof document === "undefined" ? null : createPlanetTextures(seed, palette, detail === "high" ? 512 : 128)),
    [detail, palette, seed],
  );
  const groupRef = useRef<THREE.Group>(null);
  const surfaceRef = useRef<THREE.MeshStandardMaterial>(null);
  const cloudRef = useRef<THREE.MeshStandardMaterial>(null);
  const cloudMeshRef = useRef<THREE.Mesh>(null);
  const wakeTime = useRef(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!textures) return;
    return () => disposePlanetTextures(textures);
  }, [textures]);

  useFrame(({ clock, pointer }, delta) => {
    if (awakened) wakeTime.current = Math.min(5.5, wakeTime.current + delta);
    else wakeTime.current = 0;
    const reveal = awakened ? THREE.MathUtils.smoothstep(wakeTime.current, revealDelay, revealDelay + 1.35) : 0;
    const lockedOpacity = detail === "low" ? 0.035 : 0.11;

    if (surfaceRef.current) {
      surfaceRef.current.opacity = THREE.MathUtils.damp(surfaceRef.current.opacity, THREE.MathUtils.lerp(lockedOpacity, opacity, reveal), 0.76, delta);
      surfaceRef.current.emissiveIntensity = THREE.MathUtils.damp(surfaceRef.current.emissiveIntensity, THREE.MathUtils.lerp(0.015, 0.055, reveal), 0.7, delta);
    }
    if (cloudRef.current) cloudRef.current.opacity = THREE.MathUtils.damp(cloudRef.current.opacity, THREE.MathUtils.lerp(0.008, 0.22, reveal), 0.7, delta);
    if (!groupRef.current || reducedMotion) return;

    groupRef.current.rotation.y += delta * drift;
    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, position[0] - pointer.x * drift * 1.1, 0.8, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, position[1] - pointer.y * drift * 0.68 + Math.sin(clock.elapsedTime * drift * 2.1) * 0.025, 0.8, delta);
    if (cloudMeshRef.current) cloudMeshRef.current.rotation.y -= delta * drift * 0.42;
  });

  const setHover = (event: ThreeEvent<PointerEvent>, active: boolean) => {
    event.stopPropagation();
    setHovered(active);
  };

  if (!textures) return null;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh onPointerEnter={(event) => setHover(event, true)} onPointerLeave={(event) => setHover(event, false)}>
        <sphereGeometry args={[1, detail === "high" ? 96 : 36, detail === "high" ? 96 : 36]} />
        <meshStandardMaterial
          ref={surfaceRef}
          map={textures.surface}
          bumpMap={textures.bump}
          bumpScale={0.055}
          roughness={0.88}
          metalness={0.03}
          emissive="#071023"
          emissiveIntensity={0.015}
          transparent
          opacity={detail === "low" ? 0.035 : 0.11}
          depthWrite
        />
      </mesh>

      <mesh ref={cloudMeshRef} scale={1.008}>
        <sphereGeometry args={[1, detail === "high" ? 72 : 30, detail === "high" ? 72 : 30]} />
        <meshStandardMaterial ref={cloudRef} map={textures.clouds} color="#8c9ab6" roughness={1} transparent opacity={0.008} depthWrite={false} />
      </mesh>

      <AtmosphericGlow awakened={awakened} hovered={hovered} opacity={detail === "low" ? 0.08 : 0.2} />
      {rings ? <PlanetRings texture={textures.rings} awakened={awakened} rotation={ringRotation} /> : null}
    </group>
  );
}
