"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { ProceduralPlanet } from "@/components/celestial/ProceduralPlanet";
import type { PlanetPalette } from "@/components/celestial/PlanetTexture";

type AwakeningPlanetsProps = {
  awakened: boolean;
  reducedMotion: boolean;
};

const blueGiant: PlanetPalette = {
  shadow: "#02050c",
  midtone: "#101c34",
  highlight: "#32466d",
  cloud: "#8a98b4",
};

const distantBlue: PlanetPalette = {
  shadow: "#02040a",
  midtone: "#0b1428",
  highlight: "#293754",
  cloud: "#77849f",
};

const lowerShadow: PlanetPalette = {
  shadow: "#010309",
  midtone: "#080f20",
  highlight: "#1c2943",
  cloud: "#68758e",
};

const minorBody: PlanetPalette = {
  shadow: "#02040a",
  midtone: "#11192a",
  highlight: "#3b465c",
  cloud: "#727d91",
};

export function AwakeningPlanets({ awakened, reducedMotion }: AwakeningPlanetsProps) {
  const orbitRef = useRef<THREE.Group>(null);
  const orbitMaterials = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const wakeTime = useRef(0);

  useFrame((_, delta) => {
    if (awakened) wakeTime.current = Math.min(5.5, wakeTime.current + delta);
    else wakeTime.current = 0;
    const reveal = awakened ? THREE.MathUtils.smoothstep(wakeTime.current, 3.6, 5.0) : 0;
    orbitMaterials.current.forEach((material, index) => {
      if (material) material.opacity = THREE.MathUtils.damp(material.opacity, THREE.MathUtils.lerp(0.01, 0.16 - index * 0.025, reveal), 0.8, delta);
    });
    if (orbitRef.current && !reducedMotion) orbitRef.current.rotation.z += delta * THREE.MathUtils.lerp(0.001, 0.006, reveal);
  });

  return (
    <group renderOrder={-1}>
      <ProceduralPlanet
        awakened={awakened}
        reducedMotion={reducedMotion}
        position={[-3.7, 2.35, -7.4]}
        scale={1.62}
        seed={0.73}
        palette={blueGiant}
        drift={0.021}
        revealDelay={2.75}
        rings
        ringRotation={[1.2, 0.18, -0.2]}
      />
      <ProceduralPlanet
        awakened={awakened}
        reducedMotion={reducedMotion}
        position={[4.35, 0.72, -10.5]}
        scale={1.42}
        seed={1.91}
        palette={distantBlue}
        drift={0.015}
        revealDelay={3.0}
        rings
        ringRotation={[1.36, -0.12, 0.26]}
        opacity={0.72}
      />
      <ProceduralPlanet
        awakened={awakened}
        reducedMotion={reducedMotion}
        position={[-0.45, -4.25, -12.5]}
        scale={2.15}
        seed={3.42}
        palette={lowerShadow}
        drift={0.009}
        revealDelay={3.25}
        opacity={0.48}
      />

      {[
        { position: [-5.1, -0.6, -17] as [number, number, number], scale: 0.14, seed: 5.1 },
        { position: [5.6, 3.15, -20] as [number, number, number], scale: 0.19, seed: 6.3 },
        { position: [2.8, -3.5, -18] as [number, number, number], scale: 0.1, seed: 7.7 },
        { position: [-1.9, 3.8, -22] as [number, number, number], scale: 0.08, seed: 9.2 },
      ].map((body) => (
        <ProceduralPlanet
          key={body.seed}
          awakened={awakened}
          reducedMotion={reducedMotion}
          position={body.position}
          scale={body.scale}
          seed={body.seed}
          palette={minorBody}
          detail="low"
          drift={0.006}
          revealDelay={3.7}
          opacity={0.38}
        />
      ))}

      <group ref={orbitRef} position={[0, 0, -5.2]} rotation={[0.12, 0.28, -0.12]}>
        {[0, 1, 2].map((index) => (
          <mesh key={index} rotation={[0, 0, index * 1.82]}>
            <torusGeometry args={[3.25 + index * 0.38, 0.003 + index * 0.0015, 6, 180, Math.PI * (0.42 + index * 0.08)]} />
            <meshBasicMaterial
              ref={(material) => { orbitMaterials.current[index] = material; }}
              color="#ad986b"
              transparent
              opacity={0.01}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
