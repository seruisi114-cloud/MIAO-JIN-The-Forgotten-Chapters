"use client";

import { sanctuaryPalette } from "./visualSystem";

export function SanctuaryLighting() {
  return (
    <>
      <ambientLight color={sanctuaryPalette.moonBlue} intensity={0.36} />
      <directionalLight color={sanctuaryPalette.moonWhite} intensity={1.16} position={[-3.5, 8, 5.5]} />
      <spotLight color={sanctuaryPalette.moonWhite} intensity={1.08} position={[0, 9, 1.5]} angle={0.78} penumbra={1} distance={22} decay={1.9} />
      <pointLight color={sanctuaryPalette.champagneGold} intensity={0.34} distance={10} decay={2.25} position={[0, 1.25, -0.9]} />
    </>
  );
}
