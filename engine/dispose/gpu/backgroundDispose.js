/**
 * backgroundDispose.js - Helper to dispose GPU resources for the background renderer
 *
 * PURPOSE:
 *   Releases GPU resources allocated by the background renderer by deleting the WebGL buffer and program.
 *   Prevents memory/resource leaks in the browser and ensures proper cleanup when the renderer is no longer needed.
 *
 * PARAMETERS:
 *   @param {WebGLRenderingContext} gl - The WebGL context used for rendering.
 *     - Must be a valid, active context. If the context is lost, deletion is a no-op.
 *   @param {WebGLBuffer} buffer - The buffer object to delete.
 *     - If null or already deleted, this is a no-op.
 *   @param {WebGLProgram} program - The shader program object to delete.
 *     - If null or already deleted, this is a no-op.
 *
 * USAGE:
 *   backgroundDispose(gl, buffer, program);
 *
 * BEST PRACTICES:
 *   - Always call this when the renderer is disposed or the canvas is removed from the DOM.
 *   - Do not use buffer or program after calling this function.
 *   - Safe to call multiple times; redundant deletions are ignored by WebGL.
 *
 * MAINTAINER GUIDELINES:
 *   - This file must only contain this function and its export.
 *   - Update comments if WebGL resource management changes.
 */
export function backgroundDispose(gl, buffer, program) {
  if (buffer) gl.deleteBuffer(buffer);
  if (program) gl.deleteProgram(program);
}
