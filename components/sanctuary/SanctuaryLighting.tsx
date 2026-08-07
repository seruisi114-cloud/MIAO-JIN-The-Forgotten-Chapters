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
      <hemisphereLight color="#a8bdd5" groundColor="#030915" intensity={1.34} />
      <spotLight
        color={sanctuaryPalette.moonWhite}
        intensity={14.2}
        position={[3.05, 7.65, -3.72]}
        target={moonlightTarget}
        angle={0.64}
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
        intensity={6.4}
        position={[-4.2, 4.5, 5.6]}
        target={moonlightTarget}
        angle={0.64}
        penumbra={1}
        distance={17}
        decay={1.65}
      />
      <directionalLight color="#7892b5" intensity={1.42} position={[-4.4, 3.2, 4.4]} />
      <pointLight color="#b89961" intensity={0.82} distance={4.8} decay={2.08} position={[-0.55, 0.9, 1.7]} />
      <pointLight color="#8fa9c8" intensity={0.72} distance={7.5} decay={2.1} position={[3.4, 2.3, 2.6]} />
    </>
  );
}
