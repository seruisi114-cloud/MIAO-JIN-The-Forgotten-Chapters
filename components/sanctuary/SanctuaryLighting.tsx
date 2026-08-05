"use client";

export function SanctuaryLighting() {
  return (
    <>
      <ambientLight color="#c6d2e0" intensity={0.42} />
      <directionalLight color="#d8e1eb" intensity={1.18} position={[-3.5, 8, 5.5]} />
      <spotLight color="#e3e7e7" intensity={1.08} position={[0, 9, 1.5]} angle={0.78} penumbra={1} distance={22} decay={1.9} />
      <pointLight color="#a88b5b" intensity={0.42} distance={11} decay={2.2} position={[0, 0.9, 0]} />
    </>
  );
}
