"use client";

import { Line } from "@react-three/drei";

export function CelestialVaultRuins() {
  return (
    <group>
      <group position={[0, 0.1, -4.55]}>
        {[-4.35, 4.35].map((x) => (
          <group key={x} position={[x, 2.35, 0]}>
            <mesh>
              <cylinderGeometry args={[0.16, 0.25, 4.7, 20]} />
              <meshPhysicalMaterial color="#222b3e" roughness={0.66} metalness={0.16} emissive="#263957" emissiveIntensity={0.12} transparent opacity={0.64} />
            </mesh>
            <mesh position={[0, 2.28, 0]}>
              <cylinderGeometry args={[0.34, 0.17, 0.2, 24]} />
              <meshStandardMaterial color="#3d4659" roughness={0.7} emissive="#5f523a" emissiveIntensity={0.08} transparent opacity={0.52} />
            </mesh>
            <mesh position={[0, -2.27, 0]}>
              <cylinderGeometry args={[0.36, 0.47, 0.2, 24]} />
              <meshStandardMaterial color="#293143" roughness={0.74} transparent opacity={0.62} />
            </mesh>
          </group>
        ))}

        <mesh position={[0, 3.9, 0]} rotation={[0, 0, 0.1]}>
          <torusGeometry args={[4.35, 0.055, 8, 112, Math.PI * 0.78]} />
          <meshStandardMaterial color="#5f5542" emissive="#a88d59" emissiveIntensity={0.12} roughness={0.76} metalness={0.32} transparent opacity={0.42} />
        </mesh>
        <mesh position={[0.32, 3.95, -0.04]} rotation={[0, 0, Math.PI + 0.08]}>
          <torusGeometry args={[4.05, 0.018, 8, 96, Math.PI * 0.69]} />
          <meshBasicMaterial color="#c1a66f" transparent opacity={0.25} depthWrite={false} />
        </mesh>

        {[-2.65, 0, 2.65].map((x, index) => (
          <Line
            key={x}
            points={[[x, 0.2, 0.08], [x * 1.18, 2.6, -0.02], [x * 0.7, 5.2 - Math.abs(x) * 0.16, -0.12]]}
            color={index === 1 ? "#aebdce" : "#9d875d"}
            lineWidth={index === 1 ? 0.34 : 0.26}
            transparent
            opacity={index === 1 ? 0.16 : 0.18}
          />
        ))}
      </group>
    </group>
  );
}
