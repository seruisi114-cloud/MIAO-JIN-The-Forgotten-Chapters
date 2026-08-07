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
      <hemisphereLight color="#bdd1e6" groundColor="#061020" intensity={1.62} />
      <spotLight
        color={sanctuaryPalette.warmMoon}
        intensity={17.8}
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
        color={sanctuaryPalette.sapphireReflection}
        intensity={8.4}
        position={[-4.2, 4.5, 5.6]}
        target={moonlightTarget}
        angle={0.64}
        penumbra={1}
        distance={17}
        decay={1.65}
      />
      <directionalLight color="#829fc8" intensity={1.72} position={[-4.4, 3.2, 4.4]} />
      <pointLight color={sanctuaryPalette.champagneGold} intensity={1.18} distance={5.4} decay={2.08} position={[-0.55, 0.9, 1.7]} />
      <pointLight color="#9ebadb" intensity={1.12} distance={8.4} decay={2.08} position={[3.4, 2.3, 2.6]} />
      <pointLight color={sanctuaryPalette.violetMist} intensity={0.48} distance={9.5} decay={2.2} position={[-4.6, 2.75, -1.8]} />
    </>
  );
}
