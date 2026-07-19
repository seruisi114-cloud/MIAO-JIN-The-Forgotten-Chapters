"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { MoonlitParticleField } from "./MoonlitParticleField";
import { MoonlitShaderPlane } from "./MoonlitShaderPlane";

type MoonlitSceneCanvasProps = {
  playing: boolean;
  onReady?: () => void;
};

export function MoonlitSceneCanvas({ playing, onReady }: MoonlitSceneCanvasProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    const update = () => {
      setReducedMotion(motionQuery.matches);
      setMobile(mobileQuery.matches);
    };
    update();
    motionQuery.addEventListener("change", update);
    mobileQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      mobileQuery.removeEventListener("change", update);
    };
  }, []);

  return (
    <div className="moonlit-scene-canvas" aria-hidden="true">
      <Canvas
        dpr={mobile ? [1, 1.2] : [1, 1.5]}
        camera={{ position: [0, 0, 1], fov: 45, near: 0.1, far: 10 }}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#030611", 1);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
          onReady?.();
        }}
      >
        <MoonlitShaderPlane playing={playing} reducedMotion={reducedMotion} />
        <MoonlitParticleField playing={playing} reducedMotion={reducedMotion} mobile={mobile} />
      </Canvas>
    </div>
  );
}
