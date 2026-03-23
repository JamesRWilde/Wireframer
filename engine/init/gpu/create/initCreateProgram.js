/**
 * program.js - WebGL Shader Program Linker
 *
 * PURPOSE:
 *   Compiles vertex and fragment shaders, attaches them to a program,
 *   and links the program. Provides error handling with detailed info
 *   logs for shader compilation failures.
 *
 * ARCHITECTURE ROLE:
 *   Called by scenePrograms to create the fill and wire shader programs.
 *   A low-level utility that encapsulates the WebGL program creation
 *   workflow.
 *
 * WHY THIS EXISTS:
 *   Expressly states the purpose of this linking helper within the WebGL
 *   initialization pipeline.
 */

"use strict";

// Import shader compilation helper for individual vertex/fragment shaders
import { compileShader }from '@engine/init/gpu/initCompileShader.js';

/**
 * program - Creates and links a WebGL shader program
 *
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {string} vs - Vertex shader source code
 * @param {string} fs - Fragment shader source code
 * @returns {WebGLProgram} The linked shader program
 * @throws {Error} If shader compilation or program linking fails
 */
export function createProgram(gl, vs, fs) {
  // Compile individual vertex and fragment shaders
  const v = compileShader(gl, gl.VERTEX_SHADER, vs);
  const f = compileShader(gl, gl.FRAGMENT_SHADER, fs);

  // Create program and attach compiled shaders
  const program = gl.createProgram();
  gl.attachShader(program, v);
  gl.attachShader(program, f);

  // Link the program (binds attribute/uniform locations)
  gl.linkProgram(program);

  // Shaders can be deleted after linking (program retains compiled code)
  gl.deleteShader(v);
  gl.deleteShader(f);

  // Check for linking errors
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Scene GPU program link failed: ${info}`);
  }

  return program;
}
