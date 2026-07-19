import * as THREE from "three";

export type PlanetPalette = {
  shadow: string;
  midtone: string;
  highlight: string;
  cloud: string;
};

export type PlanetTextures = {
  surface: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  clouds: THREE.CanvasTexture;
  rings: THREE.CanvasTexture;
};

function fract(value: number) {
  return value - Math.floor(value);
}

function hash(x: number, y: number, seed: number) {
  return fract(Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123);
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

function fbm(x: number, y: number, seed: number, octaves = 5) {
  let value = 0;
  let amplitude = 0.52;
  let frequency = 1;
  for (let octave = 0; octave < octaves; octave += 1) {
    value += noise(x * frequency, y * frequency, seed + octave * 3.17) * amplitude;
    frequency *= 2.03;
    amplitude *= 0.48;
  }
  return value;
}

function colorChannels(color: string) {
  const parsed = new THREE.Color(color);
  return [parsed.r * 255, parsed.g * 255, parsed.b * 255] as const;
}

function makeTexture(canvas: HTMLCanvasElement, colorSpace = false) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 4;
  if (colorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createPlanetTextures(seed: number, palette: PlanetPalette, size = 512): PlanetTextures {
  const width = size;
  const height = Math.max(64, Math.floor(size / 2));
  const surfaceCanvas = document.createElement("canvas");
  const bumpCanvas = document.createElement("canvas");
  const cloudCanvas = document.createElement("canvas");
  surfaceCanvas.width = bumpCanvas.width = cloudCanvas.width = width;
  surfaceCanvas.height = bumpCanvas.height = cloudCanvas.height = height;

  const surfaceContext = surfaceCanvas.getContext("2d")!;
  const bumpContext = bumpCanvas.getContext("2d")!;
  const cloudContext = cloudCanvas.getContext("2d")!;
  const surfaceImage = surfaceContext.createImageData(width, height);
  const bumpImage = bumpContext.createImageData(width, height);
  const cloudImage = cloudContext.createImageData(width, height);
  const shadow = colorChannels(palette.shadow);
  const midtone = colorChannels(palette.midtone);
  const highlight = colorChannels(palette.highlight);
  const cloud = colorChannels(palette.cloud);

  for (let y = 0; y < height; y += 1) {
    const latitude = y / height;
    for (let x = 0; x < width; x += 1) {
      const longitude = x / width;
      const warpedX = longitude * 5.4 + Math.sin(latitude * Math.PI * 7 + seed) * 0.16;
      const warpedY = latitude * 4.2;
      const continental = fbm(warpedX, warpedY, seed, 5);
      const detail = fbm(warpedX * 3.1 + 7.3, warpedY * 3.1 - 2.4, seed + 9.2, 4);
      const bands = Math.sin(latitude * Math.PI * (18 + seed * 1.7) + continental * 4.2) * 0.5 + 0.5;
      const polarShade = Math.pow(Math.abs(latitude - 0.5) * 2, 1.8);
      const value = THREE.MathUtils.clamp(continental * 0.7 + detail * 0.22 + bands * 0.09 - polarShade * 0.12, 0, 1);
      const mixPoint = value < 0.54 ? value / 0.54 : (value - 0.54) / 0.46;
      const from = value < 0.54 ? shadow : midtone;
      const to = value < 0.54 ? midtone : highlight;
      const offset = (y * width + x) * 4;

      surfaceImage.data[offset] = THREE.MathUtils.lerp(from[0], to[0], mixPoint);
      surfaceImage.data[offset + 1] = THREE.MathUtils.lerp(from[1], to[1], mixPoint);
      surfaceImage.data[offset + 2] = THREE.MathUtils.lerp(from[2], to[2], mixPoint);
      surfaceImage.data[offset + 3] = 255;

      const bumpValue = Math.floor(THREE.MathUtils.clamp(value * 0.8 + detail * 0.2, 0, 1) * 255);
      bumpImage.data.set([bumpValue, bumpValue, bumpValue, 255], offset);

      const cloudNoise = fbm(longitude * 8.4 + seed, latitude * 5.1, seed + 20.7, 5);
      const cloudAlpha = Math.floor(THREE.MathUtils.smoothstep(cloudNoise, 0.57, 0.83) * 116);
      cloudImage.data.set([cloud[0], cloud[1], cloud[2], cloudAlpha], offset);
    }
  }

  surfaceContext.putImageData(surfaceImage, 0, 0);
  bumpContext.putImageData(bumpImage, 0, 0);
  cloudContext.putImageData(cloudImage, 0, 0);

  const ringCanvas = document.createElement("canvas");
  ringCanvas.width = 1024;
  ringCanvas.height = 64;
  const ringContext = ringCanvas.getContext("2d")!;
  const ringImage = ringContext.createImageData(ringCanvas.width, ringCanvas.height);
  const ringColor = colorChannels("#9f927a");
  for (let y = 0; y < ringCanvas.height; y += 1) {
    const radial = y / (ringCanvas.height - 1);
    const edgeFade = Math.sin(radial * Math.PI);
    for (let x = 0; x < ringCanvas.width; x += 1) {
      const angular = x / ringCanvas.width;
      const striation = 0.35 + fbm(radial * 28, angular * 5, seed + 41, 3) * 0.65;
      const gap = noise(angular * 34, radial * 3, seed + 60) > 0.72 ? 0.08 : 1;
      const alpha = Math.floor(edgeFade * striation * gap * 150);
      const offset = (y * ringCanvas.width + x) * 4;
      ringImage.data.set([ringColor[0], ringColor[1], ringColor[2], alpha], offset);
    }
  }
  ringContext.putImageData(ringImage, 0, 0);

  return {
    surface: makeTexture(surfaceCanvas, true),
    bump: makeTexture(bumpCanvas),
    clouds: makeTexture(cloudCanvas, true),
    rings: makeTexture(ringCanvas, true),
  };
}

export function disposePlanetTextures(textures: PlanetTextures) {
  Object.values(textures).forEach((texture) => texture.dispose());
}
