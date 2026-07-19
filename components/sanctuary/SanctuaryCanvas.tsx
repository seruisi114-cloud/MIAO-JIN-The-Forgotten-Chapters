"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CelestialVaultRuins } from "./CelestialVaultRuins";
import { CreatorArchiveCore } from "./CreatorArchiveCore";
import { SanctuaryFloor } from "./SanctuaryFloor";
import { SanctuaryLighting } from "./SanctuaryLighting";
import { SanctuaryParticles } from "./SanctuaryParticles";
import { SanctuaryPillars } from "./SanctuaryPillars";
import { StarDome } from "./StarDome";
import { StatuePlaceholder } from "./StatuePlaceholder";
import { TransitionOrigin } from "@/components/transitions/SacredTransitionOverlay";
import { chapter01 } from "@/config/chapters";

const chapterPositions: Array<[number, number, number]> = [
  [-4.82, 0, -1.05],
  [4.82, 0, -1.05],
  [0, 0, 5.02],
];

type SanctuaryCanvasProps = {
  restoring: boolean;
  activeIndex: number | null;
  activatingIndex: number | null;
  onActiveChange: (index: number | null) => void;
  onActivate: (index: number) => void;
  onActivationPosition: (origin: TransitionOrigin) => void;
  onOpenCreatorNote: () => void;
};

function SanctuaryWorld({ reducedMotion, restoring, activeIndex, activatingIndex, onActiveChange, onActivate, onActivationPosition, onOpenCreatorNote }: { reducedMotion: boolean } & SanctuaryCanvasProps) {
  const rootRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.position.set(0, 0, 0);
    rootRef.current.rotation.set(0, 0, 0);
    rootRef.current.scale.set(1, 1, 1);
  }, [restoring]);

  useFrame(({ pointer }, delta) => {
    if (!rootRef.current) return;
    const targetY = reducedMotion ? 0 : pointer.x * 0.018;
    const targetX = reducedMotion ? 0 : -pointer.y * 0.012;
    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, targetY, 1.35, delta);
    rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, targetX, 1.35, delta);
    rootRef.current.position.x = THREE.MathUtils.damp(rootRef.current.position.x, reducedMotion ? 0 : -pointer.x * 0.045, 1.2, delta);
  });

  return (
    <group ref={rootRef}>
      <CelestialVaultRuins reducedMotion={reducedMotion} />
      <SanctuaryFloor skipIntro={restoring} />
      <SanctuaryPillars skipIntro={restoring} />
      <StatuePlaceholder state="awakened" labelPlacement="left" position={chapterPositions[0]} chapter={chapter01.chapterLabel} revealDelay={5.8} index={1} activating={activatingIndex === 1} skipIntro={restoring} onHoverChange={onActiveChange} onActivate={onActivate} onActivationPosition={onActivationPosition} />
      <StatuePlaceholder state="dormant" labelPlacement="right" position={chapterPositions[1]} chapter="第二篇章" revealDelay={6.6} index={2} activating={false} skipIntro={restoring} onHoverChange={onActiveChange} onActivate={onActivate} onActivationPosition={onActivationPosition} />
      <StatuePlaceholder state="dormant" labelPlacement="bottom" position={chapterPositions[2]} chapter="第三篇章" revealDelay={7.4} index={3} activating={false} skipIntro={restoring} onHoverChange={onActiveChange} onActivate={onActivate} onActivationPosition={onActivationPosition} />
      <CreatorArchiveCore chapterPositions={chapterPositions} activeIndex={activeIndex} skipIntro={restoring} onOpenCreatorNote={onOpenCreatorNote} />
      <SanctuaryParticles reducedMotion={reducedMotion} skipIntro={restoring} />
    </group>
  );
}

export function SanctuaryCanvas({ restoring, activeIndex, activatingIndex, onActiveChange, onActivate, onActivationPosition, onOpenCreatorNote }: SanctuaryCanvasProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactLayout, setCompactLayout] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(query.matches);
      setCompactLayout(window.innerWidth / Math.max(window.innerHeight, 1) < 1.15);
    };
    update();
    query.addEventListener("change", update);
    window.addEventListener("resize", update, { passive: true });
    return () => {
      query.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <Canvas
      key={`${compactLayout ? "compact" : "wide"}-${restoring ? "restored" : "initial"}`}
      dpr={[1, 1.5]}
      camera={{ position: compactLayout ? [0, 6.05, 16.4] : [0, 5.15, 13.65], fov: compactLayout ? 47 : 43, near: 0.1, far: 90 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ camera, gl, scene }) => {
        camera.position.set(0, compactLayout ? 6.05 : 5.15, compactLayout ? 16.4 : 13.65);
        camera.rotation.set(0, 0, 0);
        camera.lookAt(0, compactLayout ? 0.52 : 0.44, 0.42);
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.fov = compactLayout ? 47 : 43;
          camera.zoom = 1;
          camera.updateProjectionMatrix();
        }
        gl.setClearColor("#060a13", 1);
        gl.outputColorSpace = "srgb";
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.47;
        scene.fog = new THREE.FogExp2("#07101e", 0.032);
      }}
    >
      <StarDome />
      <SanctuaryLighting />
      <SanctuaryWorld reducedMotion={reducedMotion} restoring={restoring} activeIndex={activeIndex} activatingIndex={activatingIndex} onActiveChange={onActiveChange} onActivate={onActivate} onActivationPosition={onActivationPosition} onOpenCreatorNote={onOpenCreatorNote} />
    </Canvas>
  );
}
