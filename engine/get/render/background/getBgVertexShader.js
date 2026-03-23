/**
 * getBgVertexShader.js - Background Particle Vertex Shader
 *
 * PURPOSE:
 *   Provides GLSL source for the vertex shader that animates background
 *   particles with velocity, size, and pulsation effects.
 *
 * ARCHITECTURE ROLE:
 *   Used by GPU background renderer to construct shader programs.
 *
 * WHY THIS EXISTS:
 *   Centralizes shader source code for worker-safe injection and easier
 *   future maintenance of visual style effects.
 */
export function getBgVertexShader() {
  return `precision highp float;

attribute vec2 aSeedPos;
attribute vec2 aVelocity;
attribute float aSize;
attribute float aAlphaBase;
attribute float aSpeed;
attribute float aPhase;

uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
uniform float uVelocityScale;

varying float vAlpha;
varying vec3 vColor;

void main() {
  float t = uTime * 0.001 * uVelocityScale;
  vec2 pos = aSeedPos + aVelocity * aSpeed * t;
  pos = mod(pos, uResolution);

  vec2 clipPos = (pos / uResolution) * 2.0 - 1.0;
  clipPos.y = -clipPos.y;

  gl_Position = vec4(clipPos, 0.0, 1.0);
  gl_PointSize = max(1.0, aSize);

  float pulse = 0.5 + 0.5 * sin(t * 1.7 + aPhase);
  vColor = uColor;
  vAlpha = clamp((aAlphaBase + pulse * 0.35) * uOpacity, 0.0, 1.0);
}`;
}
