export const archiveCoreVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const moonPlanetFragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uHover;
  uniform float uActivation;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.55;
    for (int i = 0; i < 5; i++) {
      value += noise(p) * amplitude;
      p = p * 2.03 + vec2(1.7, 3.1);
      amplitude *= 0.48;
    }
    return value;
  }

  float craters(vec2 uv) {
    vec2 gridUv = uv * vec2(14.0, 9.0);
    vec2 cell = floor(gridUv);
    vec2 local = fract(gridUv) - 0.5;
    vec2 offset = vec2(hash(cell), hash(cell + 13.7)) - 0.5;
    float radius = 0.09 + hash(cell + 4.1) * 0.22;
    float distanceToCrater = length(local - offset * 0.56);
    float bowl = 1.0 - smoothstep(radius * 0.58, radius, distanceToCrater);
    float rim = smoothstep(radius * 0.62, radius * 0.82, distanceToCrater) * (1.0 - smoothstep(radius * 0.82, radius * 1.08, distanceToCrater));
    return bowl * 0.72 - rim * 0.36;
  }

  void main() {
    vec2 driftUv = vUv * vec2(5.5, 8.5) + vec2(uTime * 0.012, -uTime * 0.005);
    float continents = fbm(driftUv);
    float clouds = fbm(vUv * vec2(9.0, 12.0) + vec2(-uTime * 0.008, uTime * 0.003));
    float craterField = craters(vUv) + craters(vUv * 1.73 + 0.17) * 0.46;
    float bands = sin((vUv.y + continents * 0.09) * 52.0) * 0.5 + 0.5;
    vec3 normal = normalize(vNormal);
    vec3 lightDirection = normalize(vec3(-0.55, 0.72, 0.9));
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float terminator = smoothstep(-0.18, 0.48, dot(normal, lightDirection));
    float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 3.2);

    vec3 darkSea = vec3(0.022, 0.042, 0.07);
    vec3 moonBlue = vec3(0.26, 0.36, 0.46);
    vec3 silver = vec3(0.64, 0.72, 0.78);
    vec3 cloudColor = mix(moonBlue, silver, smoothstep(0.57, 0.82, clouds));
    vec3 surface = mix(darkSea, moonBlue, smoothstep(0.28, 0.78, continents));
    surface = mix(surface, cloudColor, smoothstep(0.62, 0.84, clouds) * 0.42);
    surface -= vec3(0.12, 0.14, 0.15) * max(craterField, 0.0);
    surface += vec3(0.13, 0.16, 0.18) * max(-craterField, 0.0);
    surface += vec3(0.07, 0.09, 0.12) * bands * 0.08;
    surface *= 0.23 + diffuse * 0.77;
    surface *= 0.18 + terminator * 0.82;
    surface += vec3(0.48, 0.67, 0.88) * fresnel * (0.35 + uHover * 0.16 + uActivation * 0.38);
    surface += vec3(0.78, 0.69, 0.48) * uActivation * (0.08 + fresnel * 0.12);
    float awakeningFlow = sin((vUv.y * 18.0 + vUv.x * 7.0) - uTime * 1.35) * 0.5 + 0.5;
    float awakeningVein = smoothstep(0.56, 0.92, awakeningFlow + continents * 0.28);
    surface += vec3(0.2, 0.36, 0.58) * uActivation * (0.2 + continents * 0.18);
    surface += vec3(0.63, 0.76, 0.9) * uActivation * awakeningVein * 0.2;

    float alpha = 0.88 + fresnel * 0.1;
    gl_FragColor = vec4(surface, alpha);
  }
`;

export const dormantCrystalFragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uHover;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(41.13, 289.67))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.3);
    float grain = noise(vUv * 18.0 + uTime * 0.006);
    float deepFlow = noise(vec2(vUv.x * 5.0 + sin(vUv.y * 11.0) * 0.16, vUv.y * 9.0 - uTime * 0.08));
    float energyVein = smoothstep(0.68, 0.92, deepFlow) * smoothstep(0.08, 0.92, vUv.y);
    vec2 runeCell = fract(vUv * vec2(8.0, 13.0)) - 0.5;
    float runeCross = (1.0 - smoothstep(0.025, 0.055, abs(runeCell.x))) * step(0.27, abs(runeCell.y));
    runeCross += (1.0 - smoothstep(0.02, 0.045, abs(runeCell.y))) * step(0.32, abs(runeCell.x));
    float runeMask = runeCross * step(0.72, hash(floor(vUv * vec2(8.0, 13.0))));
    float seamA = 1.0 - smoothstep(0.012, 0.038, abs(vUv.x - 0.5 - sin(vUv.y * 17.0) * 0.035));
    float seamB = 1.0 - smoothstep(0.01, 0.032, abs(vUv.x - 0.34 - sin(vUv.y * 11.0 + 1.7) * 0.025));
    float cracks = max(seamA * smoothstep(0.18, 0.9, vUv.y), seamB * smoothstep(0.32, 0.82, vUv.y));
    vec3 obsidian = mix(vec3(0.008, 0.013, 0.024), vec3(0.035, 0.055, 0.085), grain * 0.58);
    vec3 gold = vec3(0.46, 0.37, 0.21) * cracks * (0.24 + uHover * 0.32);
    vec3 innerEnergy = vec3(0.58, 0.42, 0.18) * energyVein * (0.08 + uHover * 0.22);
    vec3 ancientRunes = vec3(0.68, 0.52, 0.25) * runeMask * (0.05 + uHover * 0.16);
    vec3 color = obsidian + vec3(0.12, 0.2, 0.29) * fresnel * (0.18 + uHover * 0.14) + gold + innerEnergy + ancientRunes;
    gl_FragColor = vec4(color, 0.58 + fresnel * 0.18 + uHover * 0.05);
  }
`;

export const frozenNebulaFragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uHover;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(91.7, 217.3))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.56;
    for (int i = 0; i < 5; i++) {
      value += noise(p) * amplitude;
      p = p * 2.06 + vec2(2.4, 1.1);
      amplitude *= 0.47;
    }
    return value;
  }

  void main() {
    vec2 flowUv = vUv * vec2(5.0, 7.0) + vec2(uTime * 0.007, -uTime * 0.004);
    float cloud = fbm(flowUv + fbm(flowUv * 0.72));
    float frost = fbm(vUv * vec2(15.0, 12.0) - uTime * 0.002);
    float seamA = 1.0 - smoothstep(0.01, 0.028, abs(vUv.x - 0.47 - sin(vUv.y * 15.0) * 0.032));
    float seamB = 1.0 - smoothstep(0.008, 0.024, abs(vUv.x - 0.62 - sin(vUv.y * 21.0 + 1.8) * 0.024));
    float cracks = max(seamA, seamB) * smoothstep(0.18, 0.9, vUv.y);
    vec3 normal = normalize(vNormal);
    float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.5);
    vec3 blackNebula = mix(vec3(0.004, 0.008, 0.016), vec3(0.018, 0.04, 0.075), cloud);
    vec3 ice = vec3(0.25, 0.4, 0.56) * fresnel * (0.34 + frost * 0.24 + uHover * 0.2);
    float unfinished = smoothstep(0.22, 0.52, fbm(vUv * 9.0 + vec2(-uTime * 0.002, uTime * 0.003)));
    float sleepingPulse = 0.72 + sin(uTime * 0.24 + cloud * 3.2) * 0.08;
    vec3 antiqueGold = vec3(0.5, 0.39, 0.2) * cracks * (0.28 + uHover * 0.27);
    vec3 suspendedDust = vec3(0.18, 0.29, 0.43) * smoothstep(0.79, 0.94, frost) * 0.12;
    gl_FragColor = vec4((blackNebula + ice + antiqueGold + suspendedDust) * sleepingPulse, (0.38 + cloud * 0.2 + fresnel * 0.17) * mix(0.72, 1.0, unfinished));
  }
`;

export const archiveMonumentFragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(133.1, 317.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.56;
    for (int i = 0; i < 5; i++) {
      value += noise(p) * amplitude;
      p = p * 2.02 + vec2(1.9, 2.7);
      amplitude *= 0.48;
    }
    return value;
  }

  void main() {
    vec2 centered = vUv - 0.5;
    float veil = fbm(vUv * vec2(4.2, 7.0) + vec2(uTime * 0.009, -uTime * 0.004));
    float ribbon = exp(-pow(abs(centered.x - sin(vUv.y * 7.0 + uTime * 0.06) * 0.11), 2.0) * 34.0);
    float dust = step(0.976, hash(floor(vUv * vec2(54.0, 76.0)) + floor(uTime * 0.06)));
    float edge = smoothstep(0.5, 0.17, abs(centered.x)) * smoothstep(0.5, 0.14, abs(centered.y));
    vec3 blueNebula = vec3(0.04, 0.11, 0.22) * veil * 0.68;
    vec3 violetVeil = vec3(0.12, 0.065, 0.19) * ribbon * veil * 0.28;
    vec3 goldDust = vec3(0.72, 0.57, 0.3) * dust * (0.25 + uHover * 0.28);
    vec3 color = blueNebula + violetVeil + goldDust;
    gl_FragColor = vec4(color, edge * (0.26 + veil * 0.34 + uHover * 0.09));
  }
`;
