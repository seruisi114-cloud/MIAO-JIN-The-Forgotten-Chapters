"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { sanctuaryPalette } from "./visualSystem";

export function SanctuaryLighting() {
  const moonlightTarget = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    moonlightTarget.position.set(-0.56, 1.08, 0.86);
    moonlightTarget.updateMatrixWorld();
  }, [moonlightTarget]);

  return (
    <>
      <primitive object={moonlightTarget} />
      <hemisphereLight color="#9cb1cb" groundColor="#020711" intensity={1.08} />
      <spotLight
        color={sanctuaryPalette.moonWhite}
        intensity={12.6}
        position={[3.05, 7.65, -3.72]}
        target={moonlightTarget}
        angle={0.58}
        penumbra={0.98}
        distance={20}
        decay={1.58}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
      />
      <spotLight
        color="#8099bb"
        intensity={5.5}
        position={[-4.2, 4.5, 5.6]}
        target={moonlightTarget}
        angle={0.64}
        penumbra={1}
        distance={17}
        decay={1.65}
      />
      <directionalLight color="#6f86a7" intensity={1.15} position={[-4.4, 3.2, 4.4]} />
      <pointLight color="#b89961" intensity={0.68} distance={4.1} decay={2.08} position={[-0.55, 0.9, 1.7]} />
    </>
  );
}
