"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CelestialVaultRuins } from "./CelestialVaultRuins";
import { CreatorArchiveCore } from "./CreatorArchiveCore";
import { ArchiveOrbitField } from "./ArchiveOrbitField";
import { ChapterArchiveCore } from "./ChapterArchiveCore";
import { SanctuaryFloor } from "./SanctuaryFloor";
import { SanctuaryLighting } from "./SanctuaryLighting";
import { SanctuaryParticles } from "./SanctuaryParticles";
import { SanctuaryPillars } from "./SanctuaryPillars";
import { StarDome } from "./StarDome";
import { TransitionOrigin } from "@/components/transitions/SacredTransitionOverlay";
import { ChapterEntryCameraRig } from "./ChapterEntryCameraRig";
import { MusicAnalysisCore } from "./MusicAnalysisCore";

const moonPosition: [number, number, number] = [-4.15, -0.5, 2.45];
const creatorPosition: [number, number, number] = [0, 0.55, -1.55];
const analysisPosition: [number, number, number] = [4.25, -0.25, 1.75];

type SanctuaryCanvasProps = {
  restoring: boolean;
  enteringChapter: boolean;
  activatingIndex: number | null;
  onActiveChange: (index: number | null) => void;
  onActivate: (index: number) => void;
  onActivationPosition: (origin: TransitionOrigin) => void;
  onOpenCreatorArchive: () => void;
  onOpenMusicAnalysis: () => void;
};

function SanctuaryWorld({ reducedMotion, restoring, enteringChapter, activatingIndex, onActiveChange, onActivate, onActivationPosition, onOpenCreatorArchive, onOpenMusicAnalysis }: { reducedMotion: boolean } & SanctuaryCanvasProps) {
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
      <ArchiveOrbitField reducedMotion={reducedMotion} />
      <SanctuaryFloor skipIntro={restoring} />
      <SanctuaryPillars skipIntro={restoring} />
      <ChapterArchiveCore kind="moon-planet" labelPlacement="left" position={moonPosition} chapter="核心作品" revealDelay={5.8} index={1} activating={activatingIndex === 1} skipIntro={restoring} onHoverChange={onActiveChange} onActivate={onActivate} onActivationPosition={onActivationPosition} />
      <CreatorArchiveCore position={creatorPosition} index={2} skipIntro={restoring} onHoverChange={onActiveChange} onOpenCreatorArchive={onOpenCreatorArchive} />
      <MusicAnalysisCore position={analysisPosition} index={3} skipIntro={restoring} onHoverChange={onActiveChange} onOpen={onOpenMusicAnalysis} />
      <SanctuaryParticles reducedMotion={reducedMotion} skipIntro={restoring} />
      <ChapterEntryCameraRig active={enteringChapter} reducedMotion={reducedMotion} />
    </group>
  );
}

export function SanctuaryCanvas({ restoring, enteringChapter, activatingIndex, onActiveChange, onActivate, onActivationPosition, onOpenCreatorArchive, onOpenMusicAnalysis }: SanctuaryCanvasProps) {
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
        gl.setClearColor("#071126", 1);
        gl.outputColorSpace = "srgb";
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.72;
        scene.fog = new THREE.FogExp2("#0a1831", 0.024);
      }}
    >
      <StarDome />
      <SanctuaryLighting />
      <SanctuaryWorld reducedMotion={reducedMotion} restoring={restoring} enteringChapter={enteringChapter} activatingIndex={activatingIndex} onActiveChange={onActiveChange} onActivate={onActivate} onActivationPosition={onActivationPosition} onOpenCreatorArchive={onOpenCreatorArchive} onOpenMusicAnalysis={onOpenMusicAnalysis} />
    </Canvas>
  );
}
