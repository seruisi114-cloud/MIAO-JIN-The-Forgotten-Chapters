export const moonlitSceneVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const moonlitSceneFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform float uPlaying;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform vec2 uCameraFloat;

  const float PI = 3.14159265359;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.52;
    mat2 rotation = mat2(0.82, -0.57, 0.57, 0.82);
    for (int i = 0; i < 4; i++) {
      value += amplitude * valueNoise(p);
      p = rotation * p * 2.03 + 9.7;
      amplitude *= 0.5;
    }
    return value;
  }

  float moonCrater(vec2 p, vec2 center, float radius) {
    float distanceFromCenter = length(p - center) / radius;
    float bowl = 1.0 - smoothstep(0.0, 0.82, distanceFromCenter);
    float rim = smoothstep(0.7, 0.9, distanceFromCenter) * (1.0 - smoothstep(0.9, 1.08, distanceFromCenter));
    return rim * 0.7 - bowl * 0.34;
  }

  float starLayer(vec2 uv, float scale, float threshold, float radius) {
    vec2 cell = uv * scale;
    vec2 id = floor(cell);
    vec2 local = fract(cell) - 0.5;
    float seed = hash21(id);
    vec2 offset = vec2(hash21(id + 4.13), hash21(id + 7.91)) - 0.5;
    float cluster = smoothstep(0.18, 0.82, valueNoise(id * 0.055));
    float present = smoothstep(threshold, 1.0, seed) * mix(0.22, 1.0, cluster);
    float sparkle = 0.84 + 0.16 * sin(uTime * (0.25 + seed * 0.42) + seed * 24.0);
    return present * smoothstep(radius, 0.0, length(local - offset * 0.48)) * sparkle;
  }

  void main() {
    vec2 uv = vUv + uCameraFloat;
    vec2 pointer = uPointer * vec2(0.006, 0.004);
    float time = uTime * mix(0.2, 0.28, uPlaying);
    float horizon = 0.455;

    vec3 night = mix(vec3(0.006, 0.014, 0.038), vec3(0.018, 0.045, 0.105), uv.y);
    night += vec3(0.015, 0.016, 0.045) * smoothstep(0.25, 0.9, uv.y);

    vec2 nebulaUv = uv + pointer * 0.45;
    float broadNebula = fbm(nebulaUv * vec2(2.5, 4.2) + vec2(time * 0.025, -time * 0.012));
    float fineNebula = fbm(nebulaUv * vec2(6.8, 3.1) - vec2(time * 0.018, 2.7));
    float nebulaMask = smoothstep(0.43, 0.78, broadNebula * 0.72 + fineNebula * 0.38);
    nebulaMask *= smoothstep(0.38, 0.7, uv.y) * (1.0 - smoothstep(0.92, 1.0, uv.y));
    vec3 nebulaColor = mix(vec3(0.025, 0.075, 0.19), vec3(0.14, 0.055, 0.22), fineNebula);
    night += nebulaColor * nebulaMask * mix(0.39, 0.55, uPlaying);

    float galaxy = exp(-pow((uv.y - (0.72 - uv.x * 0.16)), 2.0) / 0.008);
    galaxy *= fbm(uv * vec2(7.0, 18.0) + vec2(time * 0.018, 1.3));
    night += mix(vec3(0.035, 0.09, 0.19), vec3(0.15, 0.09, 0.23), uv.x) * galaxy * mix(0.21, 0.29, uPlaying);

    float skyMask = smoothstep(horizon + 0.015, horizon + 0.09, uv.y);
    float farStars = starLayer(uv + pointer * 0.15, 145.0, 0.982, 0.19);
    float midStars = starLayer(uv - pointer * 0.28, 72.0, 0.971, 0.15);
    float brightStars = starLayer(uv + pointer * 0.55, 38.0, 0.982, 0.13);
    night += skyMask * farStars * vec3(0.22, 0.31, 0.48) * 0.72;
    night += skyMask * midStars * vec3(0.55, 0.67, 0.86) * 0.7;
    night += skyMask * brightStars * mix(vec3(0.69, 0.8, 1.0), vec3(0.82, 0.68, 0.39), hash21(floor(uv * 38.0))) * 0.72;

    float moonDrift = sin(uTime * 0.052) * 0.004;
    vec2 moonPosition = vec2(0.72 + moonDrift, 0.765);
    vec2 moonUv = uv - moonPosition;
    moonUv.x *= uAspect;
    float moonRadius = 0.078;
    float moonDistance = length(moonUv);
    float moonDisk = smoothstep(moonRadius + 0.0015, moonRadius - 0.0015, moonDistance);
    vec2 moonSurfaceUv = moonUv / moonRadius;
    float moonZ = sqrt(max(0.0, 1.0 - dot(moonSurfaceUv, moonSurfaceUv)));
    vec3 moonNormal = normalize(vec3(moonSurfaceUv, moonZ));
    float moonLight = smoothstep(-0.2, 0.82, dot(moonNormal, normalize(vec3(-0.42, 0.55, 0.9))));
    float moonTexture = fbm(moonSurfaceUv * 4.7 + vec2(1.2, 4.8));
    float moonFineTexture = fbm(moonSurfaceUv * 15.0 - vec2(2.8, 7.4));
    float moonCraters =
      moonCrater(moonSurfaceUv, vec2(-0.34, 0.26), 0.22) +
      moonCrater(moonSurfaceUv, vec2(0.28, -0.14), 0.17) +
      moonCrater(moonSurfaceUv, vec2(0.05, 0.38), 0.11) +
      moonCrater(moonSurfaceUv, vec2(-0.12, -0.48), 0.14) +
      moonCrater(moonSurfaceUv, vec2(0.48, 0.28), 0.09);
    vec3 moonColor = mix(vec3(0.42, 0.53, 0.7), vec3(0.9, 0.94, 0.98), moonLight);
    moonColor *= 0.72 + moonTexture * 0.24 + moonFineTexture * 0.075 + moonCraters * 0.11;
    moonColor += vec3(0.08, 0.13, 0.22) * pow(1.0 - moonZ, 2.2);
    float musicalBreath = 0.5 + 0.5 * sin(uTime * mix(0.48, 0.74, uPlaying));
    float moonBreath = 0.95 + (0.045 + uPlaying * 0.045) * sin(uTime * 0.62) + musicalBreath * uPlaying * 0.018;
    night = mix(night, moonColor * moonBreath, moonDisk);

    float moonHalo = exp(-moonDistance * 24.0) * (1.0 - moonDisk);
    float wideHalo = exp(-moonDistance * 7.1) * 0.14;
    float lunarRim = smoothstep(moonRadius + 0.008, moonRadius, moonDistance) * (1.0 - moonDisk);
    night += vec3(0.48, 0.65, 0.92) * (moonHalo * 0.54 + wideHalo + lunarRim * 0.3) * moonBreath;

    float downward = smoothstep(moonPosition.y, horizon - 0.08, uv.y);
    float beamProgress = clamp((moonPosition.y - uv.y) / (moonPosition.y - horizon), 0.0, 1.0);
    float beamWidth = mix(0.012, 0.105, beamProgress);
    float beam = exp(-pow(abs(uv.x - moonPosition.x) / beamWidth, 2.0) * 2.2);
    beam *= smoothstep(horizon - 0.06, horizon + 0.04, uv.y) * smoothstep(moonPosition.y + 0.02, moonPosition.y - 0.08, uv.y);
    beam *= 0.7 + fbm(vec2(uv.x * 18.0 + time * 0.03, uv.y * 6.0)) * 0.3;
    night += vec3(0.48, 0.62, 0.85) * beam * mix(0.075, 0.12, uPlaying);

    float mountainNoise = valueNoise(vec2(uv.x * 5.5 + 3.0, 2.0));
    float mountainFine = valueNoise(vec2(uv.x * 15.0 - 1.0, 8.0));
    float mountainLine = horizon + mountainNoise * 0.075 + mountainFine * 0.022;
    float mountains = 1.0 - smoothstep(mountainLine, mountainLine + 0.008, uv.y);
    mountains *= smoothstep(horizon - 0.12, horizon + 0.02, uv.y);
    vec3 mountainColor = mix(vec3(0.008, 0.018, 0.045), vec3(0.025, 0.055, 0.095), mountainNoise);
    night = mix(night, mountainColor, mountains * 0.86);
    float mountainMist = exp(-abs(uv.y - mountainLine) * 34.0) * 0.12;
    night += vec3(0.12, 0.2, 0.34) * mountainMist;

    float waterMask = 1.0 - smoothstep(horizon - 0.006, horizon + 0.006, uv.y);
    float waterDepth = clamp((horizon - uv.y) / horizon, 0.0, 1.0);
    float wave = sin(uv.y * 430.0 + valueNoise(vec2(uv.y * 34.0, time * 0.18)) * 5.0 + time * mix(0.4, 0.54, uPlaying));
    float longWave = sin(uv.x * 19.0 + uv.y * 72.0 - time * 0.22);
    float crossWave = sin(uv.x * 34.0 - uv.y * 96.0 + time * 0.17);
    vec3 water = mix(vec3(0.004, 0.012, 0.032), vec3(0.014, 0.045, 0.09), (1.0 - waterDepth) * 0.72);
    water += vec3(0.035, 0.075, 0.13) * (wave * 0.5 + 0.5) * (0.025 + uPlaying * 0.018);
    water += vec3(0.08, 0.09, 0.12) * (longWave * 0.5 + 0.5) * 0.018;
    water += vec3(0.09, 0.13, 0.2) * (crossWave * 0.5 + 0.5) * mix(0.008, 0.014, uPlaying);

    float reflectionWidth = mix(0.022, 0.16, waterDepth);
    float reflection = exp(-pow(abs(uv.x - moonPosition.x) / reflectionWidth, 2.0) * 2.1);
    reflection *= (0.42 + 0.58 * smoothstep(0.12, 0.95, sin(uv.y * 610.0 + time * mix(0.72, 0.94, uPlaying)) * 0.5 + 0.5));
    reflection *= (1.0 - waterDepth * 0.62);
    water += vec3(0.47, 0.61, 0.82) * reflection * mix(0.21, 0.3, uPlaying);

    float goldReflection = exp(-pow(abs(uv.x - moonPosition.x) / (reflectionWidth * 1.65), 2.0) * 2.8);
    goldReflection *= smoothstep(0.74, 0.98, sin(uv.y * 380.0 - time * 0.36 + uv.x * 24.0) * 0.5 + 0.5);
    water += vec3(0.55, 0.4, 0.18) * goldReflection * (0.018 + uPlaying * 0.018) * (1.0 - waterDepth * 0.72);

    float reflectedStars = starLayer(vec2(uv.x + wave * 0.0007, 1.0 - uv.y * 0.72), 62.0, 0.982, 0.17);
    water += reflectedStars * mix(vec3(0.17, 0.24, 0.35), vec3(0.48, 0.36, 0.18), hash21(floor(uv * 62.0))) * 0.34;
    night = mix(night, water, waterMask * 0.96);

    float goldPathOne = exp(-abs(uv.y - (0.505 + sin(uv.x * 7.0 + time * 0.15) * 0.008)) * 420.0);
    float goldPathTwo = exp(-abs(uv.y - (0.39 + sin(uv.x * 9.0 - time * 0.11) * 0.006)) * 520.0);
    float pathFade = smoothstep(0.04, 0.25, uv.x) * (1.0 - smoothstep(0.72, 0.98, uv.x));
    night += vec3(0.58, 0.43, 0.2) * (goldPathOne * 0.15 + goldPathTwo * 0.09) * pathFade * mix(0.78, 1.08, uPlaying);

    float inkMist = fbm(vec2(uv.x * 3.0 + time * 0.015, uv.y * 9.0));
    inkMist *= smoothstep(0.36, 0.74, inkMist) * smoothstep(0.12, 0.53, uv.y) * (1.0 - smoothstep(0.52, 0.63, uv.y));
    night = mix(night, vec3(0.025, 0.065, 0.12), inkMist * 0.2);

    float vignette = smoothstep(0.94, 0.2, length((uv - 0.5) * vec2(0.9, 1.05)));
    night *= mix(0.58, 1.0, vignette);
    night = pow(max(night, 0.0), vec3(0.94));
    gl_FragColor = vec4(night, 1.0);
  }
`;

export const moonlitParticleVertexShader = /* glsl */ `
  precision highp float;

  attribute float aSize;
  attribute float aSeed;
  attribute float aTone;
  attribute float aTrail;
  uniform float uTime;
  uniform float uPlaying;
  uniform float uPixelRatio;
  uniform float uKind;
  uniform vec2 uPointer;
  varying float vTone;
  varying float vAlpha;
  varying float vTrail;

  void main() {
    vec2 point = position.xy;
    float pace = mix(0.7, 0.86, uPlaying);

    if (uKind < 0.5) {
      point.y = mod(point.y + 1.0 + uTime * (0.004 + aSeed * 0.008) * pace, 2.0) - 1.0;
      point.x += sin(uTime * (0.12 + aSeed * 0.08) + aSeed * 21.0) * (0.008 + aSeed * 0.011);
      float pointerDistance = max(length(point - uPointer), 0.12);
      point += (point - uPointer) * (0.0018 / pointerDistance);
      vAlpha = 0.28 + aSeed * 0.38;
    } else if (uKind < 1.5) {
      float orbit = uTime * (0.055 + aSeed * 0.035) * pace + aSeed * 19.0;
      point.x += sin(orbit) * (0.025 + aSeed * 0.04);
      point.y += cos(orbit * 0.78) * (0.018 + aSeed * 0.035);
      float pointerDistance = length(point - uPointer);
      point += normalize(point - uPointer + vec2(0.0001)) * smoothstep(0.35, 0.0, pointerDistance) * 0.04;
      vAlpha = mix(0.58, 0.9, uPlaying) * (0.76 + aSeed * 0.24);
    } else {
      float rise = mod(aSeed * 1.2 + uTime * (0.018 + aSeed * 0.016) * mix(0.18, 1.0, uPlaying), 1.28);
      point.y += rise;
      point.x += sin(uTime * (0.18 + aSeed * 0.12) + aSeed * 31.0) * (0.012 + aSeed * 0.018);
      float life = smoothstep(0.0, 0.14, rise) * (1.0 - smoothstep(0.78, 1.24, rise));
      float pointerDistance = max(length(point - uPointer), 0.14);
      point += (point - uPointer) * (0.0012 / pointerDistance);
      vAlpha = life * mix(0.035, 0.66, uPlaying) * (0.6 + aSeed * 0.4);
    }

    gl_Position = vec4(point, position.z, 1.0);
    gl_PointSize = aSize * uPixelRatio * mix(1.0, 1.16, uPlaying);
    vTone = aTone;
    vTrail = aTrail;
  }
`;

export const moonlitParticleFragmentShader = /* glsl */ `
  precision highp float;

  varying float vTone;
  varying float vAlpha;
  varying float vTrail;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    point.y *= mix(1.0, 2.5, vTrail);
    float distanceToCenter = length(point);
    float core = smoothstep(0.22, 0.0, distanceToCenter);
    float halo = smoothstep(0.5, 0.04, distanceToCenter) * 0.42;
    vec3 moonWhite = vec3(0.79, 0.87, 1.0);
    vec3 ancientGold = vec3(0.82, 0.67, 0.38);
    vec3 blueWhite = vec3(0.58, 0.72, 0.98);
    vec3 color = vTone < 0.34
      ? mix(moonWhite, ancientGold, vTone / 0.34)
      : mix(ancientGold, blueWhite, (vTone - 0.34) / 0.66);
    float alpha = (core + halo) * vAlpha;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;
