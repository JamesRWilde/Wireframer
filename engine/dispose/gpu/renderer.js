/**
 * renderer.js - Main dispose function for GPU background renderer
 *
 * PURPOSE:
 *   Handles cleanup of all GPU resources allocated by the background renderer, including buffer and program.
 *
 * PARAMETERS:
 *   @param {WebGLRenderingContext} gl - The WebGL context used for rendering.
 *   @param {WebGLBuffer} buffer - The buffer to delete.
 *   @param {WebGLProgram} program - The program to delete.
 *   @param {function} backgroundDispose - Helper to delete resources.
 *
 * USAGE:
 *   renderer(gl, buffer, program, backgroundDispose);
 *
 * MAINTAINER GUIDELINES:
 *   - This file must only contain this function and its export.
 *   - Update comments if resource management changes.
 */
export function renderer(gl, buffer, program, backgroundDispose) {
  backgroundDispose(gl, buffer, program);
}
