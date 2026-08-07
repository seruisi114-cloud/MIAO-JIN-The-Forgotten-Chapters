"use client";

import { sanctuaryPalette } from "./visualSystem";

export function SanctuaryLighting() {
  return (
    <>
      <ambientLight color={sanctuaryPalette.indigoMist} intensity={0.23} />
      <directionalLight color={sanctuaryPalette.moonWhite} intensity={1.28} position={[2.8, 7.4, -3.8]} />
      <spotLight color={sanctuaryPalette.moonWhite} intensity={1.08} position={[1.25, 7.8, -3.6]} angle={0.48} penumbra={1} distance={18} decay={2.05} />
      <pointLight color={sanctuaryPalette.champagneGold} intensity={0.2} distance={5.6} decay={2.4} position={[0, 1.18, 0.6]} />
    </>
  );
}
