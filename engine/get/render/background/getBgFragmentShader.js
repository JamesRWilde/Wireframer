/**
 * getBgFragmentShader.js - Background Particle Fragment Shader
 *
 * PURPOSE:
 *   Provides GLSL source for the fragment shader that renders soft, glowing
 *   particles in the background.
 *
 * ARCHITECTURE ROLE:
 *   Used by GPU background renderer to construct shader programs.
 *
 * WHY THIS EXISTS:
 *   Encapsulates shader source in a single module for easier testing and
 *   replacement, and adds clarity to the one-file-per-utility pattern.
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
