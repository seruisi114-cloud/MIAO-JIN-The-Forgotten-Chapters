export const nebulaVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const nebulaFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uMotion;
  uniform float uAwaken;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.52;
    mat2 rotation = mat2(0.82, 0.57, -0.57, 0.82);

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.03 + 13.7;
      amplitude *= 0.48;
    }

    return value;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(1.75, 1.0);
    float drift = uTime * 0.008 * uMotion;
    vec2 swept = vec2(p.x * 0.82 + p.y * 0.38, p.y * 1.22 - p.x * 0.12);
    float field = fbm(swept * 1.72 + vec2(drift, -drift * 0.65));
    float veil = fbm(swept * 3.45 - vec2(drift * 0.4, drift));
    float broadCloud = smoothstep(0.46, 0.78, field) * (0.5 + veil * 0.5);
    float darkLane = smoothstep(0.42, 0.67, fbm(swept * 2.5 + vec2(7.2, -3.8)));
    float edgeFalloff = 1.0 - smoothstep(0.72, 1.34, length(p * vec2(0.72, 1.0)));
    float shape = broadCloud * (0.65 + darkLane * 0.35) * (0.42 + edgeFalloff * 0.58);

    vec3 voidColor = vec3(0.006, 0.009, 0.017);
    vec3 nightBlue = mix(vec3(0.026, 0.047, 0.092), vec3(0.038, 0.072, 0.145), uAwaken);
    vec3 ancientGold = vec3(0.145, 0.105, 0.052);
    float goldenVeil = smoothstep(0.58, 0.88, fbm(swept * 2.05 + vec2(-4.2, 8.1)));
    vec3 color = mix(voidColor, nightBlue, shape * (0.84 + uAwaken * 0.28));
    color += ancientGold * goldenVeil * (0.05 + uAwaken * 0.32);
    color *= 0.92 + veil * 0.14;
    float alpha = 0.92;

    gl_FragColor = vec4(color, alpha);
  }
`;
