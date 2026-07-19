export const rippleVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const rippleFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uStrength;
  uniform vec2 uPointer;
  uniform float uAspect;
  uniform float uPulse;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
  }

  void main() {
    vec2 delta = vUv - uPointer;
    delta.x *= uAspect;
    float angle = atan(delta.y, delta.x);
    float irregularity = (noise(delta * 12.0 + uTime * 0.035) - 0.5) * 0.018;
    float distanceFromPointer = length(delta) + irregularity;
    float foldRadius = 0.105 + sin(angle * 3.0 + uTime * 0.22) * 0.011;
    float fold = exp(-abs(distanceFromPointer - foldRadius) * 92.0);
    float outerFold = exp(-abs(distanceFromPointer - foldRadius * 1.72) * 68.0) * 0.28;
    float membrane = exp(-distanceFromPointer * 12.0) * 0.16;
    float spatialVeil = (fold + outerFold + membrane) * uStrength;
    float pointerGlow = exp(-distanceFromPointer * 10.5) * uStrength * 0.34;
    float pulseRadius = max(uPulse, 0.0) * 0.72;
    float pulseFade = uPulse < 0.0 ? 0.0 : 1.0 - smoothstep(0.55, 1.05, uPulse);
    float pulseWave = exp(-abs(distanceFromPointer - pulseRadius) * 70.0) * pulseFade;

    vec3 moonWhite = vec3(0.66, 0.69, 0.73);
    vec3 ancientGold = vec3(0.34, 0.28, 0.17);
    vec3 color = mix(moonWhite, ancientGold, smoothstep(0.06, 0.22, distanceFromPointer));
    float alpha = spatialVeil * 0.075 + pointerGlow * 0.028 + pulseWave * 0.085;

    gl_FragColor = vec4(color, alpha);
  }
`;
