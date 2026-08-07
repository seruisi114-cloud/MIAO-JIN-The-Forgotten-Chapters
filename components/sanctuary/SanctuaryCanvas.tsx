"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CreatorArchiveCore } from "./CreatorArchiveCore";
import { SanctuaryLighting } from "./SanctuaryLighting";
import { StarDome } from "./StarDome";
import { TransitionOrigin } from "@/components/transitions/CosmicDissolveTransition";
import { ChapterEntryCameraRig } from "./ChapterEntryCameraRig";
import { MusicAnalysisCore } from "./MusicAnalysisCore";
import { sanctuaryPalette } from "./visualSystem";
import { MoonlitReliquaryRoom } from "./MoonlitReliquaryRoom";
import { MoonSeaMusicBox } from "./MoonSeaMusicBox";

const musicBoxPosition: [number, number, number] = [0, -0.02, 0.55];
const creatorPosition: [number, number, number] = [-3.55, -0.02, -1.08];
const analysisPosition: [number, number, number] = [3.55, -0.02, -1.36];

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
    const targetY = reducedMotion ? 0 : pointer.x * 0.008;
    const targetX = reducedMotion ? 0 : -pointer.y * 0.004;
    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, targetY, 1.35, delta);
    rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, targetX, 1.35, delta);
    rootRef.current.position.x = THREE.MathUtils.damp(rootRef.current.position.x, reducedMotion ? 0 : -pointer.x * 0.018, 1.2, delta);
  });

  return (
    <group ref={rootRef}>
      <MoonlitReliquaryRoom skipIntro={restoring} />
      <MoonSeaMusicBox position={musicBoxPosition} activating={activatingIndex === 1} skipIntro={restoring} onHoverChange={onActiveChange} onActivate={onActivate} onActivationPosition={onActivationPosition} />
      <CreatorArchiveCore position={creatorPosition} index={2} skipIntro={restoring} onHoverChange={onActiveChange} onOpenCreatorArchive={onOpenCreatorArchive} />
      <MusicAnalysisCore position={analysisPosition} index={3} skipIntro={restoring} onHoverChange={onActiveChange} onOpen={onOpenMusicAnalysis} />
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
      camera={{ position: compactLayout ? [0.8, 5.25, 15.8] : [1.05, 4.35, 12.6], fov: compactLayout ? 48 : 42, near: 0.1, far: 90 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ camera, gl, scene }) => {
        camera.position.set(compactLayout ? 0.8 : 1.05, compactLayout ? 5.25 : 4.35, compactLayout ? 15.8 : 12.6);
        camera.rotation.set(0, 0, 0);
        camera.lookAt(0.12, compactLayout ? 1.02 : 0.92, 0.08);
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.fov = compactLayout ? 48 : 42;
          camera.zoom = 1;
          camera.updateProjectionMatrix();
        }
        gl.setClearColor(sanctuaryPalette.deepIndigo, 1);
        gl.outputColorSpace = "srgb";
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.48;
        scene.fog = new THREE.FogExp2(sanctuaryPalette.deepIndigo, 0.032);
      }}
    >
      <StarDome />
      <SanctuaryLighting />
      <SanctuaryWorld reducedMotion={reducedMotion} restoring={restoring} enteringChapter={enteringChapter} activatingIndex={activatingIndex} onActiveChange={onActiveChange} onActivate={onActivate} onActivationPosition={onActivationPosition} onOpenCreatorArchive={onOpenCreatorArchive} onOpenMusicAnalysis={onOpenMusicAnalysis} />
    </Canvas>
  );
}
