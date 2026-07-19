"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type CameraDriftProps = {
  reducedMotion: boolean;
};

export function CameraDrift({ reducedMotion }: CameraDriftProps) {
  useFrame(({ camera, clock, pointer }, delta) => {
    if (reducedMotion) return;
    const time = clock.elapsedTime;
    const smoothing = 1 - Math.exp(-delta * 0.85);
    const advance = Math.min(time / 24, 1) * 0.17;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.055, smoothing);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.035, smoothing);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5 - advance + Math.sin(time * 0.16) * 0.018, smoothing);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
