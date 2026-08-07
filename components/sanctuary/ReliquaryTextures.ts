import * as THREE from "three";

function fract(value: number) {
  return value - Math.floor(value);
}

function hash(x: number, y: number, seed: number) {
  return fract(Math.sin(x * 127.1 + y * 311.7 + seed * 71.3) * 43758.5453);
}

function smooth(value: number) {
  return value * value * (3 - 2 * value);
}

function noise(x: number, y: number, seed: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(fract(x));
  const fy = smooth(fract(y));
  const a = hash(ix, iy, seed);
  const b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed);
  const d = hash(ix + 1, iy + 1, seed);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, fx), THREE.MathUtils.lerp(c, d, fx), fy);
}

function fbm(x: number, y: number, seed: number) {
  let value = 0;
  let amplitude = 0.56;
  let frequency = 1;
  for (let octave = 0; octave < 5; octave += 1) {
    value += noise(x * frequency, y * frequency, seed + octave * 3.7) * amplitude;
    amplitude *= 0.48;
    frequency *= 2.04;
  }
  return value;
}

function makeTexture(width: number, height: number, painter: (u: number, v: number, x: number, y: number) => [number, number, number]) {
  const pixels = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = painter(x / width, y / height, x, y);
      const offset = (y * width + x) * 4;
      pixels[offset] = THREE.MathUtils.clamp(r, 0, 255);
      pixels[offset + 1] = THREE.MathUtils.clamp(g, 0, 255);
      pixels[offset + 2] = THREE.MathUtils.clamp(b, 0, 255);
      pixels[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

export function createBlackLacquerTexture() {
  const texture = makeTexture(512, 256, (u, v) => {
    const grain = fbm(u * 14, v * 3.2, 8.1);
    const longGrain = Math.pow(Math.abs(Math.sin((u * 15 + grain * 0.7) * Math.PI)), 8);
    const handPolish = Math.sin((u * 2.2 + v * 0.5) * Math.PI) * 1.8;
    return [5 + grain * 9 + longGrain * 5 + handPolish, 9 + grain * 12 + longGrain * 5, 16 + grain * 18 + longGrain * 7];
  });
  texture.repeat.set(1.8, 1.2);
  return texture;
}

export function createMoonstoneTexture() {
  return makeTexture(384, 256, (u, v) => {
    const cloud = fbm(u * 4.6, v * 5.2, 17.3);
    const vein = Math.pow(Math.abs(Math.sin((u * 2.4 + v * 1.2 + cloud * 0.86) * Math.PI)), 12);
    const depth = 0.72 + cloud * 0.28;
    return [126 * depth + vein * 28, 147 * depth + vein * 32, 169 * depth + vein * 34];
  });
}

export function createVellumTexture() {
  return makeTexture(320, 240, (u, v, x, y) => {
    const fiber = fbm(u * 18, v * 22, 23.9);
    const strand = (x + y * 7) % 41 === 0 ? 7 : 0;
    return [193 + fiber * 32 + strand, 185 + fiber * 28 + strand, 164 + fiber * 22];
  });
}

export function createMoonSurfaceTexture() {
  const craters = [
    [0.25, 0.28, 0.11, 18], [0.62, 0.22, 0.08, 12], [0.72, 0.58, 0.14, 20],
    [0.42, 0.67, 0.09, 13], [0.18, 0.62, 0.055, 9], [0.53, 0.45, 0.045, 8],
  ];
  return makeTexture(384, 384, (u, v) => {
    const grain = fbm(u * 8.2, v * 8.2, 31.7);
    let craterShade = 0;
    for (const [cx, cy, radius, strength] of craters) {
      const distance = Math.hypot(u - cx, v - cy);
      const rim = Math.exp(-Math.pow((distance - radius) / 0.018, 2));
      const basin = Math.max(0, 1 - distance / radius);
      craterShade += rim * strength - basin * strength * 0.62;
    }
    const base = 151 + grain * 46 + craterShade;
    return [base * 0.91, base * 0.96, base * 1.03];
  });
}

export function createStarSeaTexture() {
  return makeTexture(512, 512, (u, v, x, y) => {
    const cloud = fbm(u * 4.2, v * 5.6, 42.4);
    const veil = Math.exp(-Math.pow((v - 0.48 - Math.sin(u * 7) * 0.045) / 0.13, 2));
    const starHash = hash(x, y, 57.1);
    const star = starHash > 0.9988 ? 96 : starHash > 0.9968 ? 28 : 0;
    const vertical = 0.62 + (1 - v) * 0.38;
    return [4 + cloud * 8 + veil * 6 + star, 13 + cloud * 17 + veil * 14 + star, (31 + cloud * 33 + veil * 30) * vertical + star];
  });
}
