"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { SanctuaryLighting } from "./SanctuaryLighting";
import { TransitionOrigin } from "@/components/transitions/CosmicDissolveTransition";
import { ChapterEntryCameraRig } from "./ChapterEntryCameraRig";
import { CreatorArchiveCore } from "./CreatorArchiveCore";
import { GiftLetterCore } from "./GiftLetterCore";
import { MoonlitReliquaryRoom } from "./MoonlitReliquaryRoom";
import { MoonSeaMusicBox } from "./MoonSeaMusicBox";

const musicBoxPosition: [number, number, number] = [-0.56, 0.46, 0.86];

type SanctuaryCanvasProps = {
  restoring: boolean;
  enteringChapter: boolean;
  activatingIndex: number | null;
  onActiveChange: (index: number | null) => void;
  onActivate: (index: number) => void;
  onActivationPosition: (origin: TransitionOrigin) => void;
  onOpenCreatorArchive: () => void;
  onOpenGiftLetter: () => void;
};

function SanctuaryWorld({ reducedMotion, restoring, enteringChapter, activatingIndex, onActiveChange, onActivate, onActivationPosition, onOpenCreatorArchive, onOpenGiftLetter }: { reducedMotion: boolean } & SanctuaryCanvasProps) {
  return (
    <group>
      <MoonlitReliquaryRoom skipIntro={restoring} />
      <CreatorArchiveCore
        position={[-3.48, 0.09, 0.44]}
        index={2}
        skipIntro={restoring}
        onHoverChange={onActiveChange}
        onOpenCreatorArchive={onOpenCreatorArchive}
      />
      <GiftLetterCore
        position={[3.12, 0.08, 0.82]}
        index={3}
        skipIntro={restoring}
        onHoverChange={onActiveChange}
        onOpenGiftLetter={onOpenGiftLetter}
      />
      <MoonSeaMusicBox
        position={musicBoxPosition}
        activating={activatingIndex === 1}
        skipIntro={restoring}
        onHoverChange={onActiveChange}
        onActivate={onActivate}
        onActivationPosition={onActivationPosition}
      />
      <ChapterEntryCameraRig active={enteringChapter} reducedMotion={reducedMotion} />
    </group>
  );
}

export function SanctuaryCanvas({ restoring, enteringChapter, activatingIndex, onActiveChange, onActivate, onActivationPosition, onOpenCreatorArchive, onOpenGiftLetter }: SanctuaryCanvasProps) {
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

  const cameraPosition: [number, number, number] = compactLayout ? [1.05, 3.25, 13.2] : [1.18, 2.62, 10.75];
  const cameraTarget: [number, number, number] = compactLayout ? [-0.43, 1.28, 0.5] : [-0.56, 1.13, 0.52];

  return (
    <Canvas
      key={`${compactLayout ? "compact" : "wide"}-${restoring ? "restored" : "initial"}`}
      dpr={[1, 1.5]}
      shadows
      camera={{ position: cameraPosition, fov: compactLayout ? 42 : 33, near: 0.1, far: 90 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ camera, gl, scene }) => {
        camera.position.set(...cameraPosition);
        camera.rotation.set(0, 0, 0);
        camera.lookAt(...cameraTarget);
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.fov = compactLayout ? 42 : 33;
          camera.zoom = 1;
          camera.updateProjectionMatrix();
        }
        gl.setClearColor("#0b1b32", 1);
        gl.outputColorSpace = "srgb";
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 3.08;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFShadowMap;
        scene.fog = new THREE.FogExp2("#09172b", 0.018);
      }}
    >
      <SanctuaryLighting />
      <SanctuaryWorld
        reducedMotion={reducedMotion}
        restoring={restoring}
        enteringChapter={enteringChapter}
        activatingIndex={activatingIndex}
        onActiveChange={onActiveChange}
        onActivate={onActivate}
        onActivationPosition={onActivationPosition}
        onOpenCreatorArchive={onOpenCreatorArchive}
        onOpenGiftLetter={onOpenGiftLetter}
      />
    </Canvas>
  );
}
