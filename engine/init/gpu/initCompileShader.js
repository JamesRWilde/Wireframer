/**
 * compileShader.js - WebGL Shader Compiler
 *
 * PURPOSE:
 *   Compiles a single WebGL shader (vertex or fragment) from source code,
 *   with error handling that includes the compilation info log.
 *
 * ARCHITECTURE ROLE:
 *   Called by program.js to compile individual shaders before linking.
 *   A low-level utility that encapsulates the shader compilation workflow.
 *
 * WHY THIS EXISTS:
 *   Makes shader compilation and error diagnostics reusable across GPU pipeline
 *   initialization steps.
 */

"use strict";

/**
 * compileShader - Compiles a WebGL shader from source code
 *
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @param {string} source - GLSL source code string
 * @returns {WebGLShader} The compiled shader object
 * @throws {Error} If shader compilation fails (includes info log)
 */
export function compileShader(gl, type, source) {
  // Create and compile the shader
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // Check for compilation errors
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Scene GPU shader compile failed: ${info}`);
  }

  return shader;
}
