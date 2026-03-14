/**
 * gpuBackgroundFragShader.js - Fragment shader GLSL source for GPU background particles
 *
 * PURPOSE:
 *   Provides the static GLSL source code for the fragment shader used in the animated background particle renderer.
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
 *   import { fragSrc } from './gpuBackgroundFragShader.js';
 *   gl.shaderSource(shader, fragSrc);
 *
 * @type {string}
 */
export const fragSrc = `
  precision highp float;

  uniform vec3 u_color;
  varying float v_alpha;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) discard;

    // Soft circular falloff.
    float falloff = smoothstep(1.0, 0.0, sqrt(r2));
    gl_FragColor = vec4(u_color, v_alpha * falloff);
  }
`;
