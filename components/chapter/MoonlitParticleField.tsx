"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { moonlitParticleFragmentShader, moonlitParticleVertexShader } from "@/three/shaders/moonlitStarSea";

type MoonlitParticleFieldProps = {
  playing: boolean;
  reducedMotion: boolean;
  mobile: boolean;
};

type ParticleCloudProps = MoonlitParticleFieldProps & {
  count: number;
  kind: "dust" | "fireflies";
  seed: number;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function ParticleCloud({ count, kind, seed, playing, reducedMotion, mobile }: ParticleCloudProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const random = seededRandom(seed);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    const tones = new Float32Array(count);
    const trails = new Float32Array(count);

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      const firefly = kind === "fireflies";
      positions[offset] = firefly ? -0.25 + random() * 0.68 : -1 + random() * 2;
      positions[offset + 1] = firefly ? -0.2 + random() * 0.58 : -1 + random() * 2;
      positions[offset + 2] = 0;
      sizes[index] = firefly ? 7 + random() * 11 : 1.4 + random() * (mobile ? 4.2 : 5.8);
      seeds[index] = random();
      tones[index] = random();
      trails[index] = firefly ? random() * 0.18 : (random() > 0.82 ? 0.55 + random() * 0.42 : random() * 0.14);
    }

    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    result.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    result.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    result.setAttribute("aTone", new THREE.BufferAttribute(tones, 1));
    result.setAttribute("aTrail", new THREE.BufferAttribute(trails, 1));
    return result;
  }, [count, kind, mobile, seed]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPlaying: { value: 0 },
    uPixelRatio: { value: 1 },
    uKind: { value: kind === "fireflies" ? 1 : 0 },
    uPointer: { value: new THREE.Vector2() },
  }), [kind]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ gl, pointer }, delta) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uTime.value += delta * (reducedMotion ? 0.1 : 1);
    material.uniforms.uPlaying.value = THREE.MathUtils.damp(material.uniforms.uPlaying.value, playing ? 1 : 0, 1.6, delta);
    material.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), mobile ? 1.25 : 1.5);
    material.uniforms.uPointer.value.lerp(reducedMotion ? new THREE.Vector2() : pointer, 1 - Math.exp(-delta * 2));
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={moonlitParticleVertexShader}
        fragmentShader={moonlitParticleFragmentShader}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function MoonlitParticleField({ playing, reducedMotion, mobile }: MoonlitParticleFieldProps) {
  return (
    <>
      <ParticleCloud count={mobile ? 76 : 132} kind="dust" seed={71901} playing={playing} reducedMotion={reducedMotion} mobile={mobile} />
      <ParticleCloud count={mobile ? 22 : 32} kind="fireflies" seed={190726} playing={playing} reducedMotion={reducedMotion} mobile={mobile} />
    </>
  );
}
