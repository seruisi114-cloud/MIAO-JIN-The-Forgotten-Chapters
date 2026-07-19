import * as THREE from "three";

function fract(value: number) {
  return value - Math.floor(value);
}

function hash(x: number, y: number, seed: number) {
  return fract(Math.sin(x * 127.1 + y * 311.7 + seed * 63.7) * 43758.5453);
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
  let amplitude = 0.54;
  let frequency = 1;
  for (let octave = 0; octave < 5; octave += 1) {
    value += noise(x * frequency, y * frequency, seed + octave * 4.1) * amplitude;
    frequency *= 2.06;
    amplitude *= 0.47;
  }
  return value;
}

export function createSanctuaryMarbleTexture(seed: number, floor = false) {
  const width = floor ? 512 : 256;
  const height = floor ? 512 : 512;
  const pixels = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width;
      const v = y / height;
      const warp = fbm(u * 3.2, v * 3.8, seed) * 1.35;
      const grain = fbm(u * 13.0 + 4.2, v * 11.0 - 1.7, seed + 8.7);
      const vein = Math.pow(Math.abs(Math.sin((u * 2.5 + v * 1.15 + warp) * Math.PI * 2.0)), 17.0);
      const fineVein = Math.pow(Math.abs(Math.sin((u * 7.0 - v * 2.8 + grain * 0.65) * Math.PI)), 25.0);
      const base = floor ? 16 + grain * 16 : 25 + grain * 25;
      const blue = floor ? 13 : 20;
      const offset = (y * width + x) * 4;
      pixels[offset] = Math.min(255, base + vein * 32 + fineVein * 12);
      pixels[offset + 1] = Math.min(255, base + blue + vein * 38 + fineVein * 15);
      pixels[offset + 2] = Math.min(255, base + blue * 2.4 + vein * 52 + fineVein * 20);
      pixels[offset + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(floor ? 2.1 : 1.3, floor ? 2.1 : 2.8);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
