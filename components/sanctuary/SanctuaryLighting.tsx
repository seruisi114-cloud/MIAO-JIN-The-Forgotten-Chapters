"use client";

export function SanctuaryLighting() {
  return (
    <>
      <ambientLight color="#8fa6cc" intensity={0.72} />
      <hemisphereLight color="#9eafd0" groundColor="#19150f" intensity={0.6} />
      <directionalLight color="#b4c2d8" intensity={1.12} position={[-4, 7, 5]} />
      <spotLight color="#d8dce4" intensity={1.34} position={[0, 8.5, 1]} angle={0.84} penumbra={1} distance={20} decay={1.75} />
      <pointLight color="#a58c5e" intensity={0.76} distance={13} decay={2} position={[0, 1.1, 0]} />
      <pointLight color="#496da7" intensity={0.7} distance={18} decay={2} position={[0, 3.5, -5]} />
    </>
  );
}
