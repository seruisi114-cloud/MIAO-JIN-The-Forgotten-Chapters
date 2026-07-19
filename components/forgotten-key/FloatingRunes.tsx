"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type FloatingRunesProps = {
  awakened: boolean;
  reducedMotion: boolean;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function FloatingRunes({ awakened, reducedMotion }: FloatingRunesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const wakeTime = useRef(0);
  const fragments = useMemo(() => {
    const random = seededRandom(711904);
    return Array.from({ length: 18 }, (_, index) => {
      const angle = random() * Math.PI * 2;
      const radius = 1.25 + random() * 1.15;
      return {
        base: new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72, (random() - 0.5) * 1.1),
        speed: 0.035 + random() * 0.065,
        phase: random() * Math.PI * 2,
        scale: 0.015 + random() * 0.02,
        kind: index % 5,
      };
    });
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  }, []);

  useEffect(() => {
    wakeTime.current = 0;
  }, [awakened]);

  useFrame(({ clock }, delta) => {
    if (awakened) wakeTime.current = Math.min(5.5, wakeTime.current + delta);
    const reveal = awakened ? THREE.MathUtils.smoothstep(wakeTime.current, 3.55, 5.0) : 0;
    if (materialRef.current) materialRef.current.opacity = THREE.MathUtils.damp(materialRef.current.opacity, reveal * 0.3, 0.75, delta);
    if (!meshRef.current) return;
    const object = new THREE.Object3D();
    fragments.forEach((fragment, index) => {
      const time = reducedMotion ? 0 : clock.elapsedTime * fragment.speed;
      object.position.copy(fragment.base);
      object.position.y += Math.sin(time + fragment.phase) * 0.08;
      object.rotation.set(fragment.phase + time * 0.18, time * 0.22, fragment.phase * 0.5 - time * 0.14);
      const scale = fragment.scale * Math.max(0.01, reveal);
      const length = fragment.kind === 0 ? 2.4 : fragment.kind === 1 ? 1.4 : 0.65;
      object.scale.set(scale * length, scale * 0.18, scale * 0.14);
      object.updateMatrix();
      meshRef.current?.setMatrixAt(index, object.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, fragments.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial ref={materialRef} color="#bca06b" transparent opacity={0} depthWrite={false} />
    </instancedMesh>
  );
}
