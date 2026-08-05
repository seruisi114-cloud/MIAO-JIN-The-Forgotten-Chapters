"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type GoldenStarRibbonProps = {
  active: boolean;
  hovered: boolean;
};

function makeRibbonCurve(radius: number, lift: number, phase: number) {
  const points = Array.from({ length: 12 }, (_, index) => {
    const angle = index / 12 * Math.PI * 2;
    const drift = Math.sin(angle * 3 + phase) * 0.07;
    return new THREE.Vector3(
      Math.cos(angle) * (radius + drift),
      Math.sin(angle * 2 + phase) * lift,
      Math.sin(angle) * (radius * 0.58 + drift),
    );
  });
  return new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.42);
}

export function GoldenStarRibbon({ active, hovered }: GoldenStarRibbonProps) {
  const rootRef = useRef<THREE.Group>(null);
  const particleRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const primaryCurve = useMemo(() => makeRibbonCurve(0.92, 0.19, 0.2), []);
  const primaryPoints = useMemo(() => primaryCurve.getPoints(180), [primaryCurve]);
  const movingPositions = useMemo(() => new Float32Array(14 * 3), []);

  useFrame(({ clock }, delta) => {
    const speed = active ? 0.16 : hovered ? 0.034 : 0.009;
    if (rootRef.current) {
      rootRef.current.rotation.y += delta * (active ? 0.78 : hovered ? 0.08 : 0.012);
      rootRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.08) * 0.026;
    }
    if (particleRef.current) {
      const attribute = particleRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let index = 0; index < 14; index += 1) {
        const trailOffset = index % 4 * 0.0028;
        const progress = (clock.elapsedTime * speed + index / 14 - trailOffset) % 1;
        const point = primaryCurve.getPointAt(progress);
        const offset = index * 3;
        attribute.array[offset] = point.x;
        attribute.array[offset + 1] = point.y;
        attribute.array[offset + 2] = point.z;
      }
      attribute.needsUpdate = true;
    }
    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, active ? 0.76 : hovered ? 0.42 : 0.2, 3.4, delta);
      materialRef.current.size = THREE.MathUtils.damp(materialRef.current.size, active ? 0.054 : hovered ? 0.036 : 0.026, 3.4, delta);
    }
  });

  return (
    <group ref={rootRef} rotation={[0.38, -0.18, -0.24]}>
      <Line points={primaryPoints} color="#d4b975" lineWidth={active ? 1.05 : hovered ? 0.78 : 0.5} transparent opacity={active ? 0.82 : hovered ? 0.57 : 0.31} depthTest={false} depthWrite={false} />
      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[movingPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={materialRef} color="#ead8a4" size={0.032} sizeAttenuation transparent opacity={0.38} depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}
