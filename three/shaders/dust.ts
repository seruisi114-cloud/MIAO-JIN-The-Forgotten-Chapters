export const dustVertexShader = /* glsl */ `
  uniform vec2 uPointer;
  uniform float uGravity;
  uniform float uSize;
  varying vec3 vColor;

  void main() {
    vec3 transformed = position;
    vec2 delta = uPointer - transformed.xy;
    float distanceToPointer = length(delta);
    float influence = (1.0 - smoothstep(0.0, 1.65, distanceToPointer)) * uGravity;
    transformed.xy += delta * influence * 0.12;
    transformed.z += influence * 0.08;

    vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = uSize * (13.0 / max(1.0, -viewPosition.z));
    vColor = color;
  }
`;

export const dustFragmentShader = /* glsl */ `
  precision highp float;
  uniform float uOpacity;
  varying vec3 vColor;

  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float alpha = (1.0 - smoothstep(0.05, 0.5, distanceToCenter)) * uOpacity;
    if (alpha < 0.006) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;
