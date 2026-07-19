"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type GoldenStarMapProps = {
  awakened: boolean;
  reducedMotion: boolean;
};

const nodes = [
  [-0.46, 0.12], [-0.22, 0.43], [0.04, 0.23], [0.35, 0.42],
  [0.49, 0.06], [0.27, -0.19], [0.08, -0.43], [-0.31, -0.35],
] as const;

const connections = [[0,1], [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,0], [2,5], [0,5]] as const;

export function GoldenStarMap({ awakened, reducedMotion }: GoldenStarMapProps) {
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const nodeMaterialRef = useRef<THREE.PointsMaterial>(null);
  const travelersRef = useRef<THREE.Group>(null);
  const wakeTime = useRef(0);

  useEffect(() => {
    wakeTime.current = 0;
  }, [awakened]);

  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(connections.length * 6);
    connections.forEach(([start, end], index) => {
      const offset = index * 6;
      positions.set([nodes[start][0], nodes[start][1], 0, nodes[end][0], nodes[end][1], 0], offset);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  const nodeGeometry = useMemo(() => {
    const positions = new Float32Array(nodes.flatMap(([x, y]) => [x, y, 0.01]));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame(({ clock }, delta) => {
    if (awakened) wakeTime.current = Math.min(5.5, wakeTime.current + delta);
    const reveal = awakened ? THREE.MathUtils.smoothstep(wakeTime.current, 1.8, 3.25) : 0;
    if (lineMaterialRef.current) lineMaterialRef.current.opacity = THREE.MathUtils.damp(lineMaterialRef.current.opacity, THREE.MathUtils.lerp(0.035, 0.34, reveal), 0.9, delta);
    if (nodeMaterialRef.current) nodeMaterialRef.current.opacity = THREE.MathUtils.damp(nodeMaterialRef.current.opacity, THREE.MathUtils.lerp(0.08, 0.68, reveal), 0.9, delta);
    if (!travelersRef.current || reducedMotion) return;
    travelersRef.current.children.forEach((traveler, index) => {
      const connection = connections[(index * 3 + 1) % connections.length];
      const start = nodes[connection[0]];
      const end = nodes[connection[1]];
      const progress = (clock.elapsedTime * (0.055 + index * 0.012) + index * 0.31) % 1;
      traveler.position.set(
        THREE.MathUtils.lerp(start[0], end[0], progress),
        THREE.MathUtils.lerp(start[1], end[1], progress),
        0.025,
      );
      const material = (traveler as THREE.Mesh).material as THREE.MeshBasicMaterial;
      material.opacity = THREE.MathUtils.damp(material.opacity, THREE.MathUtils.lerp(0.04, 0.9, reveal), 0.9, delta);
    });
  });

  return (
    <group position={[0, 0, 0.095]}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial ref={lineMaterialRef} color="#bca06b" transparent opacity={0.12} depthWrite={false} />
      </lineSegments>
      <points geometry={nodeGeometry}>
        <pointsMaterial ref={nodeMaterialRef} color="#d3bd8c" size={0.025} transparent opacity={0.28} sizeAttenuation depthWrite={false} />
      </points>
      <group ref={travelersRef}>
        {[0, 1, 2].map((index) => (
          <mesh key={index}>
            <sphereGeometry args={[0.008 + index * 0.002, 12, 12]} />
            <meshBasicMaterial color="#e8e5dc" transparent opacity={0.04} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
