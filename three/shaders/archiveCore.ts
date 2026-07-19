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

  void main() {
    vec2 driftUv = vUv * vec2(5.5, 8.5) + vec2(uTime * 0.012, -uTime * 0.005);
    float continents = fbm(driftUv);
    float clouds = fbm(vUv * vec2(9.0, 12.0) + vec2(-uTime * 0.021, uTime * 0.008));
    float bands = sin((vUv.y + continents * 0.09) * 52.0) * 0.5 + 0.5;
    vec3 normal = normalize(vNormal);
    vec3 lightDirection = normalize(vec3(-0.55, 0.72, 0.9));
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float terminator = smoothstep(-0.18, 0.48, dot(normal, lightDirection));
    float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 3.2);

    vec3 darkSea = vec3(0.018, 0.045, 0.09);
    vec3 moonBlue = vec3(0.23, 0.42, 0.61);
    vec3 silver = vec3(0.68, 0.79, 0.89);
    vec3 cloudColor = mix(moonBlue, silver, smoothstep(0.57, 0.82, clouds));
    vec3 surface = mix(darkSea, moonBlue, smoothstep(0.28, 0.78, continents));
    surface = mix(surface, cloudColor, smoothstep(0.62, 0.84, clouds) * 0.42);
    surface += vec3(0.07, 0.09, 0.12) * bands * 0.08;
    surface *= 0.23 + diffuse * 0.77;
    surface *= 0.18 + terminator * 0.82;
    surface += vec3(0.48, 0.67, 0.88) * fresnel * (0.35 + uHover * 0.16 + uActivation * 0.38);
    surface += vec3(0.78, 0.69, 0.48) * uActivation * (0.08 + fresnel * 0.12);

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
    float seamA = 1.0 - smoothstep(0.012, 0.038, abs(vUv.x - 0.5 - sin(vUv.y * 17.0) * 0.035));
    float seamB = 1.0 - smoothstep(0.01, 0.032, abs(vUv.x - 0.34 - sin(vUv.y * 11.0 + 1.7) * 0.025));
    float cracks = max(seamA * smoothstep(0.18, 0.9, vUv.y), seamB * smoothstep(0.32, 0.82, vUv.y));
    vec3 obsidian = mix(vec3(0.008, 0.013, 0.024), vec3(0.035, 0.055, 0.085), grain * 0.58);
    vec3 gold = vec3(0.46, 0.37, 0.21) * cracks * (0.24 + uHover * 0.32);
    vec3 color = obsidian + vec3(0.12, 0.2, 0.29) * fresnel * (0.18 + uHover * 0.14) + gold;
    gl_FragColor = vec4(color, 0.58 + fresnel * 0.18 + uHover * 0.05);
  }
`;
