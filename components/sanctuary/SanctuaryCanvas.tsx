"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CentralAltar } from "./CentralAltar";
import { DormantNebula } from "./DormantNebula";
import { SanctuaryFloor } from "./SanctuaryFloor";
import { SanctuaryLighting } from "./SanctuaryLighting";
import { SanctuaryParticles } from "./SanctuaryParticles";
import { SanctuaryPillars } from "./SanctuaryPillars";
import { StarDome } from "./StarDome";
import { StatuePlaceholder } from "./StatuePlaceholder";
import { TransitionOrigin } from "@/components/transitions/SacredTransitionOverlay";
import { chapter01 } from "@/config/chapters";

const chapterPositions: Array<[number, number, number]> = [
  [0, 0, -2.75],
  [-3.05, 0, -0.5],
  [3.05, 0, -0.5],
  [-2.1, 0, 2.25],
  [2.1, 0, 2.25],
];

type SanctuaryCanvasProps = {
  restoring: boolean;
  activeIndex: number | null;
  activatingIndex: number | null;
  onActiveChange: (index: number | null) => void;
  onActivate: (index: number) => void;
  onActivationPosition: (origin: TransitionOrigin) => void;
  onOpenCreatorNote: () => void;
  onHoverCreatorNote: (hovered: boolean) => void;
};

function SanctuaryWorld({ reducedMotion, restoring, activeIndex, activatingIndex, onActiveChange, onActivate, onActivationPosition, onOpenCreatorNote, onHoverCreatorNote }: { reducedMotion: boolean } & SanctuaryCanvasProps) {
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
      <SanctuaryFloor skipIntro={restoring} />
      <SanctuaryPillars skipIntro={restoring} />
      <CentralAltar chapterPositions={chapterPositions} activeIndex={activeIndex} skipIntro={restoring} onOpenCreatorNote={onOpenCreatorNote} onHoverCreatorNote={onHoverCreatorNote} />
      <StatuePlaceholder position={chapterPositions[1]} chapter={chapter01.chapterLabel} revealDelay={5.8} index={1} activating={activatingIndex === 1} skipIntro={restoring} onHoverChange={onActiveChange} onActivate={onActivate} onActivationPosition={onActivationPosition} />
      <StatuePlaceholder position={chapterPositions[2]} chapter="第二篇章" revealDelay={6.6} index={2} activating={false} skipIntro={restoring} onHoverChange={onActiveChange} onActivate={onActivate} onActivationPosition={onActivationPosition} />
      <StatuePlaceholder position={chapterPositions[3]} chapter="第三篇章" revealDelay={7.4} index={3} activating={false} skipIntro={restoring} onHoverChange={onActiveChange} onActivate={onActivate} onActivationPosition={onActivationPosition} />
      <DormantNebula position={chapterPositions[0]} seed={301} revealDelay={8.1} index={0} skipIntro={restoring} onHoverChange={onActiveChange} />
      <DormantNebula position={chapterPositions[4]} seed={719} revealDelay={8.8} index={4} skipIntro={restoring} onHoverChange={onActiveChange} />
      <SanctuaryParticles reducedMotion={reducedMotion} skipIntro={restoring} />
    </group>
  );
}

export function SanctuaryCanvas({ restoring, activeIndex, activatingIndex, onActiveChange, onActivate, onActivationPosition, onOpenCreatorNote, onHoverCreatorNote }: SanctuaryCanvasProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 4.05, 10.4], rotation: [-0.34, 0, 0], fov: 43, near: 0.1, far: 90 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ camera, gl, scene }) => {
        camera.position.set(0, 4.05, 10.4);
        camera.rotation.set(0, 0, 0);
        camera.lookAt(0, 0, 0);
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.fov = 43;
          camera.zoom = 1;
          camera.updateProjectionMatrix();
        }
        gl.setClearColor("#060a13", 1);
        gl.outputColorSpace = "srgb";
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.34;
        scene.fog = new THREE.FogExp2("#07101e", 0.032);
      }}
    >
      <StarDome />
      <SanctuaryLighting />
      <SanctuaryWorld reducedMotion={reducedMotion} restoring={restoring} activeIndex={activeIndex} activatingIndex={activatingIndex} onActiveChange={onActiveChange} onActivate={onActivate} onActivationPosition={onActivationPosition} onOpenCreatorNote={onOpenCreatorNote} onHoverCreatorNote={onHoverCreatorNote} />
    </Canvas>
  );
}
