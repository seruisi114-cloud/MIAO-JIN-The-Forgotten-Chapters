"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { AwakeningPlanets } from "@/components/forgotten-key/AwakeningPlanets";
import { CelestialAstrolabe } from "@/components/forgotten-key/CelestialAstrolabe";
import { DeepBlueNebula } from "@/components/celestial/DeepBlueNebula";
import { CosmicDust } from "./CosmicDust";
import { CameraDrift } from "./CameraDrift";
import { SpaceRipple } from "./SpaceRipple";
import { Stars } from "./Stars";

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

type UniverseCanvasProps = {
  awakened: boolean;
  errorSignal: number;
  inputFocused: boolean;
  keyLength: number;
};

export function UniverseCanvas({ awakened, errorSignal, inputFocused, keyLength }: UniverseCanvasProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="universe-canvas" aria-label="缓慢流动的深色宇宙入口">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 42, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#05060a", 1);
          gl.outputColorSpace = "srgb";
          gl.toneMapping = 3;
          gl.toneMappingExposure = 0.88;
        }}
      >
        <CameraDrift reducedMotion={reducedMotion} />
        <ambientLight color="#6f7d98" intensity={0.16} />
        <directionalLight color="#8393b4" intensity={0.72} position={[-5, 3.5, 5]} />
        <pointLight color="#b6a273" intensity={awakened ? 0.42 : 0.1} distance={18} decay={2} position={[0, 0, 2.5]} />
        <DeepBlueNebula reducedMotion={reducedMotion} awakened={awakened} />
        <AwakeningPlanets awakened={awakened} reducedMotion={reducedMotion} />
        <Stars reducedMotion={reducedMotion} awakened={awakened} />
        <CosmicDust reducedMotion={reducedMotion} awakened={awakened} />
        <CelestialAstrolabe reducedMotion={reducedMotion} awakened={awakened} errorSignal={errorSignal} inputFocused={inputFocused} keyLength={keyLength} />
        <SpaceRipple reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
