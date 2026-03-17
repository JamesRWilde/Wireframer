/**
 * gpuBackgroundVertShader.js - Vertex shader GLSL source for GPU background particles
 *
 * PURPOSE:
 *   Provides the static GLSL source code for the vertex shader used in the animated background particle renderer.
 *   WebGL requires shader programs to be supplied as raw GLSL strings at runtime for compilation by the GPU driver.
 *   This file exists for modularity, clarity, and to ensure the shader code is static and auditable.
 *
 * SECURITY & BEST PRACTICES:
 *   - This string is NOT executed as JavaScript; it is passed directly to WebGL for GPU compilation.
 *   - Never interpolate or concatenate user input into this string. Keep it static and immutable.
 *   - Do not mutate or export this value under a different name. Use Object.freeze if further immutability is desired.
 *   - All shader code should be kept in dedicated modules for maintainability and auditability.
 *
 * WHY A STRING?:
 *   - WebGL and all GPU APIs require shader code as a string for runtime compilation.
 *   - There is no alternative format (binary, precompiled, etc.) supported by WebGL.
 *   - This is the industry standard and required by the API.
 *
 * USAGE:
 *   import { vertSrc } from './gpuBackgroundVertShader.js';
 *   gl.shaderSource(shader, vertSrc);
 *
 * @type {string}
 */
export const vertSrc = `
  attribute vec2 a_seedPos;
  attribute vec2 a_vel;
  attribute float a_size;
  attribute float a_alphaBase;
  attribute float a_speed;
  attribute float a_phase;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_velocityScale;
  uniform float u_opacityScale;

  varying float v_alpha;

  void main() {
    vec2 pos = a_seedPos + a_vel * (u_time * 60.0) * u_velocityScale;
    vec2 wrapSize = u_resolution + vec2(4.0, 4.0);
    vec2 wrapped = mod(pos + vec2(2.0, 2.0), wrapSize) - vec2(2.0, 2.0);

    float pulse = 0.5 + 0.5 * sin(u_time * a_speed + a_phase);
    float alpha = (a_alphaBase + pulse * 0.14) * u_opacityScale;

    vec2 zeroToOne = wrapped / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clip = zeroToTwo - 1.0;

    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = a_size * 2.0;
    v_alpha = clamp(alpha, 0.0, 1.0);
  }
`;
