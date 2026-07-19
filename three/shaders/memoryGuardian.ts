export const memoryGuardianVertexShader = /* glsl */ `
  precision highp float;

  varying vec3 vObjectPosition;
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vObjectPosition = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const memoryGuardianFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vObjectPosition;
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;
  uniform float uTime;
  uniform float uAwakened;
  uniform float uFormation;
  uniform float uHover;
  uniform float uActivation;
  uniform float uOpacity;

  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.55;
    for (int octave = 0; octave < 4; octave++) {
      value += noise3(p) * amplitude;
      p = p * 2.03 + vec3(7.1, 3.7, 5.9);
      amplitude *= 0.48;
    }
    return value;
  }

  void main() {
    vec3 position = vObjectPosition;
    float stoneNoise = fbm(position * vec3(3.8, 5.2, 3.8));
    float fineGrain = noise3(position * 28.0);
    float rim = pow(1.0 - max(0.0, dot(normalize(vWorldNormal), normalize(vViewDirection))), 2.2);

    vec3 sleepingStone = mix(vec3(0.035, 0.045, 0.06), vec3(0.105, 0.12, 0.14), stoneNoise * 0.72);
    vec3 moonJade = mix(vec3(0.24, 0.31, 0.42), vec3(0.74, 0.82, 0.86), stoneNoise * 0.68 + fineGrain * 0.08);
    vec3 color = mix(sleepingStone, moonJade, uAwakened * uFormation);

    float verticalVein = 1.0 - smoothstep(0.018, 0.09, abs(sin(position.y * 9.0 + stoneNoise * 7.0 + position.x * 5.0)));
    float starCrack = verticalVein * smoothstep(0.44, 0.84, noise3(position * 17.0 + vec3(1.4, 7.8, 3.1)));
    float moonBand = 1.0 - smoothstep(0.015, 0.055, abs(length(position.xz) - (0.18 + sin(position.y * 7.0) * 0.025)));
    float runeStep = smoothstep(0.82, 0.96, sin(position.y * 31.0 + atan(position.z, position.x) * 5.0) * 0.5 + 0.5);
    float runes = max(starCrack, moonBand * runeStep) * uAwakened * uFormation;

    float pulse = 0.78 + 0.22 * sin(uTime * mix(0.55, 1.65, max(uHover, uActivation)) + position.y * 4.0);
    float energy = (runes * (0.34 + uActivation * 1.55) + rim * (0.08 + uHover * 0.16)) * pulse;
    color += mix(vec3(0.16, 0.22, 0.32), vec3(0.68, 0.82, 0.98), uAwakened) * energy;
    color += vec3(0.53, 0.42, 0.23) * moonBand * uAwakened * (0.06 + uActivation * 0.22);
    color *= 0.82 + fineGrain * 0.17;

    float opacity = mix(0.31, 0.93, uAwakened * uFormation);
    opacity += rim * mix(0.06, 0.12, uAwakened) + uHover * 0.035 + uActivation * 0.04;
    gl_FragColor = vec4(color, clamp(opacity * uOpacity, 0.0, 1.0));
  }
`;

export const guardianParticleVertexShader = /* glsl */ `
  precision highp float;

  attribute float aSeed;
  attribute float aTone;
  uniform float uTime;
  uniform float uEnergy;
  uniform float uAwakened;
  uniform float uPixelRatio;
  varying float vTone;
  varying float vAlpha;

  void main() {
    vec3 transformed = position;
    float time = uTime * mix(0.08, 0.24, uEnergy);
    float angle = time * (0.25 + aSeed * 0.45) + aSeed * 6.28318;
    transformed.x += sin(angle + transformed.y * 2.2) * (0.025 + uEnergy * 0.045);
    transformed.z += cos(angle * 0.83 + transformed.y) * (0.02 + uEnergy * 0.04);
    transformed.y += sin(time * 0.7 + aSeed * 19.0) * 0.035;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    float size = mix(2.0, 4.8, aSeed) * mix(0.55, 1.0, uAwakened) * (1.0 + uEnergy * 0.34);
    gl_PointSize = size * uPixelRatio / max(1.0, -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vTone = aTone;
    vAlpha = mix(0.1, 0.72, uAwakened) * (0.55 + uEnergy * 0.45);
  }
`;

export const guardianParticleFragmentShader = /* glsl */ `
  precision highp float;

  varying float vTone;
  varying float vAlpha;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float distanceToCenter = length(point);
    float core = smoothstep(0.24, 0.0, distanceToCenter);
    float halo = smoothstep(0.5, 0.08, distanceToCenter) * 0.42;
    if (distanceToCenter > 0.5) discard;
    vec3 cool = vec3(0.66, 0.79, 0.98);
    vec3 moon = vec3(0.92, 0.95, 0.94);
    vec3 gold = vec3(0.73, 0.61, 0.39);
    vec3 color = vTone < 0.52 ? mix(cool, moon, vTone * 1.9) : mix(moon, gold, (vTone - 0.52) * 2.08);
    gl_FragColor = vec4(color, (core + halo) * vAlpha);
  }
`;
