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
    const fineScratch = hash(Math.floor(u * 620), Math.floor(v * 180), 12.7) > 0.993 ? 5 : 0;
    return [5 + grain * 9 + longGrain * 5 + handPolish + fineScratch, 9 + grain * 12 + longGrain * 5 + fineScratch, 16 + grain * 18 + longGrain * 7 + fineScratch];
  });
  texture.repeat.set(1.8, 1.2);
  return texture;
}

export function createMoonstoneTexture() {
  return makeTexture(384, 256, (u, v) => {
    const broadCloud = fbm(u * 3.1, v * 3.8, 17.3);
    const mineralCloud = fbm(u * 9.5, v * 7.2, 21.6);
    const vein = Math.pow(Math.abs(Math.sin((u * 1.42 + v * 0.74 + broadCloud * 0.52) * Math.PI)), 22);
    const depth = 0.73 + broadCloud * 0.2 + mineralCloud * 0.07;
    return [151 * depth + vein * 18, 169 * depth + vein * 19, 184 * depth + vein * 22];
  });
}

export function createAgedBrassTexture() {
  const texture = makeTexture(384, 192, (u, v) => {
    const brushing = Math.pow(Math.abs(Math.sin((u * 84 + v * 1.6) * Math.PI)), 8);
    const patina = fbm(u * 8.5, v * 5.4, 64.2);
    const wear = fbm(u * 21, v * 18, 71.4);
    return [112 + patina * 45 + brushing * 10 + wear * 4, 91 + patina * 37 + brushing * 8, 55 + patina * 24 + brushing * 5];
  });
  texture.repeat.set(2.2, 1);
  return texture;
}

export function createVellumTexture() {
  return makeTexture(320, 240, (u, v, x, y) => {
    const fiber = fbm(u * 18, v * 22, 23.9);
    const strand = (x + y * 7) % 41 === 0 ? 5 : 0;
    const age = fbm(u * 3.2, v * 3.7, 27.2);
    return [202 + fiber * 24 + age * 8 + strand, 191 + fiber * 22 + age * 7 + strand, 166 + fiber * 18 + age * 5];
  });
}

export function createMoonSurfaceTexture() {
  const craters = [
    [0.2, 0.26, 0.1, 17], [0.62, 0.2, 0.075, 11], [0.76, 0.58, 0.135, 18],
    [0.41, 0.7, 0.085, 12], [0.16, 0.61, 0.05, 8], [0.52, 0.45, 0.042, 7],
    [0.34, 0.42, 0.028, 5], [0.83, 0.34, 0.035, 6], [0.55, 0.78, 0.03, 5],
  ];
  return makeTexture(512, 512, (u, v) => {
    const macro = fbm(u * 3.4, v * 3.2, 29.1);
    const grain = fbm(u * 11.2, v * 10.4, 31.7);
    const maria = Math.pow(Math.max(0, 0.58 - fbm(u * 2.15 + 2.2, v * 2.4, 36.2)), 1.4) * 78;
    let craterShade = 0;
    for (const [cx, cy, radius, strength] of craters) {
      const distance = Math.hypot(u - cx, v - cy);
      const rim = Math.exp(-Math.pow((distance - radius) / 0.018, 2));
      const basin = Math.max(0, 1 - distance / radius);
      craterShade += rim * strength - basin * strength * 0.62;
    }
    const base = 143 + macro * 28 + grain * 34 - maria + craterShade;
    return [base * 0.94, base * 0.98, base * 1.04];
  });
}

export function createMoonGlowTexture() {
  const size = 192;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = (x + 0.5) / size * 2 - 1;
      const ny = (y + 0.5) / size * 2 - 1;
      const distance = Math.hypot(nx, ny);
      const strength = Math.pow(Math.max(0, 1 - distance), 2.6);
      const offset = (y * size + x) * 4;
      pixels[offset] = 188;
      pixels[offset + 1] = 210;
      pixels[offset + 2] = 236;
      pixels[offset + 3] = Math.round(strength * 255);
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createStarSeaTexture() {
  return makeTexture(512, 512, (u, v, x, y) => {
    const cloud = fbm(u * 4.8, v * 5.2, 42.4);
    const fineCloud = fbm(u * 11.4, v * 9.6, 46.7);
    const primaryLane = v - (0.46 + (u - 0.5) * 0.14 + Math.sin(u * 5.1) * 0.055 + Math.sin(u * 12.4) * 0.014);
    const secondaryLane = v - (0.68 - (u - 0.5) * 0.2 + Math.sin(u * 3.4 + 0.8) * 0.07);
    const veil = Math.exp(-Math.pow(primaryLane / 0.15, 2)) * (0.48 + cloud * 0.52)
      + Math.exp(-Math.pow(secondaryLane / 0.23, 2)) * (0.16 + fineCloud * 0.22);
    const starHash = hash(x, y, 57.1);
    const star = starHash > 0.9991 ? 102 : starHash > 0.9972 ? 24 : 0;
    const vertical = 0.62 + (1 - v) * 0.38;
    return [4 + cloud * 7 + veil * 7 + star, 12 + cloud * 15 + veil * 16 + star, (29 + cloud * 28 + veil * 34) * vertical + star];
  });
}
