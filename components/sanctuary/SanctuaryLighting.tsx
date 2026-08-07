"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { sanctuaryPalette } from "./visualSystem";

export function SanctuaryLighting() {
  const moonlightTarget = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    moonlightTarget.position.set(-0.56, 0.78, 0.86);
    moonlightTarget.updateMatrixWorld();
  }, [moonlightTarget]);

  return (
    <>
      <primitive object={moonlightTarget} />
      <hemisphereLight color="#8299b4" groundColor="#010308" intensity={0.72} />
      <spotLight
        color={sanctuaryPalette.moonWhite}
        intensity={9.2}
        position={[2.35, 7.9, -3.9]}
        target={moonlightTarget}
        angle={0.5}
        penumbra={0.96}
        distance={19}
        decay={1.62}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
      />
      <spotLight
        color="#7890ab"
        intensity={4.2}
        position={[3.8, 4.4, 6.8]}
        target={moonlightTarget}
        angle={0.48}
        penumbra={1}
        distance={16}
        decay={1.7}
      />
      <directionalLight color="#6f89aa" intensity={0.9} position={[-4.2, 3.6, 3.8]} />
      <pointLight color="#93a9c1" intensity={2.8} distance={10.5} decay={1.8} position={[2.8, 3.35, 4.6]} />
      <pointLight color="#ad8d58" intensity={1.1} distance={5.2} decay={2.05} position={[-0.55, 1.24, 2.12]} />
    </>
  );
}
