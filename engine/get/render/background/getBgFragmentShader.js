/**
 * Background particle fragment shader with soft circular falloff.
 */
export function getBgFragmentShader() {
  return `precision highp float;

varying float vAlpha;
varying vec3 vColor;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  float alpha = vAlpha * (1.0 - smoothstep(0.4, 0.5, dist));
  gl_FragColor = vec4(vColor, alpha);
}`;
}
