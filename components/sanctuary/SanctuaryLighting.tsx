"use client";

export function SanctuaryLighting() {
  return (
    <>
      <ambientLight color="#8c9bb7" intensity={0.44} />
      <hemisphereLight color="#95a4c0" groundColor="#17140f" intensity={0.38} />
      <directionalLight color="#a9b5ca" intensity={0.78} position={[-4, 7, 5]} />
      <spotLight color="#d8dce4" intensity={1.18} position={[0, 8.5, 1]} angle={0.8} penumbra={1} distance={20} decay={1.75} />
      <pointLight color="#a58c5e" intensity={0.62} distance={13} decay={2} position={[0, 1.1, 0]} />
      <pointLight color="#40557e" intensity={0.42} distance={16} decay={2} position={[0, 3.5, -5]} />
    </>
  );
}
