"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type ChapterEntryCameraRigProps = {
  active: boolean;
  reducedMotion: boolean;
};

const START_TARGET = new THREE.Vector3(-0.56, 1.13, 0.52);
const PLANET_TARGET = new THREE.Vector3(-0.56, 1.14, 0.86);
const PLANET_APPROACH = new THREE.Vector3(0.02, 1.7, 3.45);

export function ChapterEntryCameraRig({ active, reducedMotion }: ChapterEntryCameraRigProps) {
  const startPosition = useRef(new THREE.Vector3());
  const startTarget = useRef(START_TARGET.clone());
  const currentTarget = useRef(START_TARGET.clone());
  const startFov = useRef(43);
  const elapsed = useRef(0);
  const wasActive = useRef(false);

  useFrame(({ camera }, delta) => {
    if (!active) return;
    if (!wasActive.current) {
      wasActive.current = true;
      elapsed.current = 0;
      startPosition.current.copy(camera.position);
      startTarget.current.copy(currentTarget.current);
      if (camera instanceof THREE.PerspectiveCamera) startFov.current = camera.fov;
    }
    elapsed.current += delta;
    const duration = reducedMotion ? 0.72 : 3.05;
    const rawProgress = THREE.MathUtils.clamp(elapsed.current / duration, 0, 1);
    const progress = 1 - Math.pow(1 - rawProgress, 3);
    const drift = Math.sin(rawProgress * Math.PI) * 0.08;

    camera.position.lerpVectors(startPosition.current, PLANET_APPROACH, progress);
    camera.position.x += drift * 0.18;
    camera.position.y += drift;
    currentTarget.current.lerpVectors(startTarget.current, PLANET_TARGET, progress);
    camera.lookAt(currentTarget.current);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(startFov.current, 35, progress);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
