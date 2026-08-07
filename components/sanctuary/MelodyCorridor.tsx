"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sanctuaryPalette } from "./visualSystem";

export function MelodyCorridor({ active }: { active: boolean }) {
  const noteRefs = useRef<Array<THREE.Mesh | null>>([]);
  const guideCurves = useMemo(
    () => [-1, -0.5, 0, 0.5, 1].map((lane) => new THREE.CatmullRomCurve3([
      new THREE.Vector3(lane * 0.88, -0.28 + Math.abs(lane) * 0.08, 0.58),
      new THREE.Vector3(lane * 0.64, -0.12 + Math.sin(lane * 2) * 0.08, -0.18),
      new THREE.Vector3(lane * 0.34, 0.04 + Math.cos(lane * 2.2) * 0.07, -0.96),
      new THREE.Vector3(lane * 0.08, 0.22, -1.82),
    ], false, "catmullrom", 0.45)),
    [],
  );

  useFrame(({ clock }) => {
    noteRefs.current.forEach((note, index) => {
      if (!note) return;
      const curve = guideCurves[index % guideCurves.length];
      const progress = (clock.elapsedTime * (active ? 0.075 : 0.035) + index * 0.18) % 1;
      note.position.copy(curve.getPointAt(progress));
      note.scale.setScalar(0.7 + Math.sin(progress * Math.PI) * 0.55);
    });
  });

  return (
    <group rotation={[-0.08, 0.08, 0]}>
      {guideCurves.map((curve, index) => (
        <Line
          key={index}
          points={curve.getPoints(54).map((point) => [point.x, point.y, point.z] as [number, number, number])}
          color={index === 2 ? sanctuaryPalette.moonBlue : sanctuaryPalette.champagneGold}
          lineWidth={index === 2 ? 0.7 : 0.42}
          transparent
          opacity={active ? 0.42 - Math.abs(index - 2) * 0.045 : 0.18 - Math.abs(index - 2) * 0.02}
        />
      ))}
      {Array.from({ length: 8 }, (_, index) => (
        <mesh key={index} ref={(node) => { noteRefs.current[index] = node; }} renderOrder={18}>
          <sphereGeometry args={[index % 3 === 0 ? 0.028 : 0.018, 12, 12]} />
          <meshBasicMaterial color={index % 4 === 0 ? sanctuaryPalette.moonWhite : sanctuaryPalette.champagneGold} transparent opacity={active ? 0.72 : 0.34} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}
