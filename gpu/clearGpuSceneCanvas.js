/**
 * clearGpuSceneCanvas - Clears the GPU canvas to prevent stale content
 * 
 * This function clears the dedicated GPU canvas (WebGL rendering surface)
 * to prevent stale GPU-rendered content from showing through when switching
 * to CPU rendering or between frames.
 * 
 * Uses the globally stored WebGL context (globalThis.gpuGl) that was created
 * during GPU renderer initialization.
 */
export function clearGpuSceneCanvas() {
  // Get the globally stored WebGL context
  const gl = globalThis.gpuGl;
  if (!gl) return;
  
  // Clear the WebGL canvas
  gl.viewport(0, 0, globalThis.gpuCanvas?.width || 0, globalThis.gpuCanvas?.height || 0);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}