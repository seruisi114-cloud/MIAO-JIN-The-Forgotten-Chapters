"use client";

import { Line } from "@react-three/drei";
import { sanctuaryPalette } from "./visualSystem";

type VaultArchProps = {
  position: [number, number, number];
  radius: number;
  columnHeight: number;
  opacity: number;
  scale?: number;
};

function VaultArch({ position, radius, columnHeight, opacity, scale = 1 }: VaultArchProps) {
  const crownY = columnHeight;
  return (
    <group position={position} scale={scale}>
      {[-radius, radius].map((x) => (
        <group key={x} position={[x, columnHeight / 2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.24, columnHeight, 28]} />
            <meshPhysicalMaterial
              color={sanctuaryPalette.obsidianLift}
              roughness={0.68}
              metalness={0.14}
              clearcoat={0.16}
              emissive={sanctuaryPalette.deepIndigo}
              emissiveIntensity={0.08}
              transparent
              opacity={opacity}
            />
          </mesh>
          <mesh position={[0, -columnHeight / 2 + 0.05, 0]}>
            <cylinderGeometry args={[0.34, 0.46, 0.18, 32]} />
            <meshStandardMaterial color={sanctuaryPalette.obsidianLift} roughness={0.76} transparent opacity={opacity} />
          </mesh>
          <mesh position={[0, columnHeight / 2 - 0.04, 0]}>
            <cylinderGeometry args={[0.38, 0.19, 0.2, 32]} />
            <meshStandardMaterial color={sanctuaryPalette.obsidianLift} roughness={0.7} transparent opacity={opacity} />
          </mesh>
          <mesh position={[0, columnHeight / 2 - 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.012, 8, 40]} />
            <meshBasicMaterial color={sanctuaryPalette.agedGold} transparent opacity={opacity * 0.66} depthWrite={false} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, crownY, 0]}>
        <torusGeometry args={[radius, 0.13, 12, 96, Math.PI]} />
        <meshPhysicalMaterial color={sanctuaryPalette.obsidianLift} roughness={0.65} metalness={0.16} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, crownY, 0.035]}>
        <torusGeometry args={[radius - 0.08, 0.014, 8, 96, Math.PI]} />
        <meshBasicMaterial color={sanctuaryPalette.champagneGold} transparent opacity={opacity * 0.72} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function CelestialVaultRuins() {
  return (
    <group>
      <VaultArch position={[0, 0.02, -6.1]} radius={2.62} columnHeight={3.92} opacity={0.72} scale={1.06} />
      <VaultArch position={[-4.3, 0.18, -5.65]} radius={1.58} columnHeight={3.28} opacity={0.38} scale={0.96} />
      <VaultArch position={[4.3, 0.18, -5.65]} radius={1.58} columnHeight={3.28} opacity={0.38} scale={0.96} />

      <group position={[0, 0, -6.45]}>
        <mesh position={[0, 4.82, 0]}>
          <torusGeometry args={[5.65, 0.075, 10, 128, Math.PI]} />
          <meshPhysicalMaterial color={sanctuaryPalette.obsidianLift} roughness={0.72} metalness={0.18} transparent opacity={0.38} />
        </mesh>
        <mesh position={[0, 4.82, 0.04]}>
          <torusGeometry args={[5.54, 0.012, 8, 128, Math.PI]} />
          <meshBasicMaterial color={sanctuaryPalette.agedGold} transparent opacity={0.24} depthWrite={false} />
        </mesh>
        <Line points={[[-5.65, 0.3, 0], [-5.65, 4.82, 0]]} color={sanctuaryPalette.agedGold} lineWidth={0.38} transparent opacity={0.2} />
        <Line points={[[5.65, 0.3, 0], [5.65, 4.82, 0]]} color={sanctuaryPalette.agedGold} lineWidth={0.38} transparent opacity={0.2} />
      </group>
    </group>
  );
}
