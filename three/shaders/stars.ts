export const starsVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vBreath;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float breath = 0.82 + sin(uTime * (0.32 + aPhase * 0.08) + aPhase * 6.2831) * 0.18;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = aSize * breath * uPixelRatio * (22.0 / max(2.0, -viewPosition.z));
    vColor = color;
    vBreath = breath;
  }
`;

export const starsFragmentShader = /* glsl */ `
  precision highp float;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vBreath;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float distanceToCenter = length(p);
    float core = 1.0 - smoothstep(0.02, 0.16, distanceToCenter);
    float halo = 1.0 - smoothstep(0.08, 0.5, distanceToCenter);
    float alpha = (core * 0.52 + halo * 0.24) * uOpacity * vBreath;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;
