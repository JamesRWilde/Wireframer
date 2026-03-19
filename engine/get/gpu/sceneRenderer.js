/**
 * sceneRenderer.js - GPU Scene Renderer Singleton Getter
 *
 * PURPOSE:
 *   Lazily creates and returns the singleton GPU scene renderer instance.
 *   Caches the renderer in gpuState to avoid redundant WebGL context
 *   creation. Marks the GPU as failed if initialization fails, preventing
 *   repeated attempts.
 *
 * ARCHITECTURE ROLE:
 *   Called by drawSceneModel and other GPU render modules to obtain the
 *   renderer. This is the single entry point for GPU renderer access.
 *
 * DETAILS:
 *   - Returns cached renderer if already created
 *   - Returns null immediately if GPU previously failed (fast fail path)
 *   - Creates renderer on first successful call
 *   - Marks gpuState.failed on creation failure
 */

"use strict";

// Import GPU state singleton for renderer caching
import { gpuState } from '@engine/state/gpu/scene.js';

// Import renderer factory for initial creation
import { sceneRenderer as createSceneRenderer } from '@engine/init/gpu/create/sceneRenderer.js';

/**
 * sceneRenderer - Returns the singleton GPU scene renderer
 *
 * @returns {Object|null} The GPU renderer object, or null if unavailable
 */
export function sceneRenderer() {
  // Return cached renderer or null if GPU previously failed
  if (gpuState.renderer || gpuState.failed) {
    return gpuState.renderer;
  }

  // Get the GPU canvas element
  const gpuCanvas = globalThis.gpuCanvas;
  if (!gpuCanvas) {
    console.warn('[sceneRenderer-get] no gpuCanvas');
    gpuState.failed = true;
    return null;
  }

  // Create WebGL context from canvas
  const gl = gpuCanvas.getContext('webgl2') || gpuCanvas.getContext('webgl') || gpuCanvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('[sceneRenderer-get] WebGL not supported');
    gpuState.failed = true;
    return null;
  }

  // Store the WebGL context globally for other modules to access
  globalThis.gpuGl = gl;

  // Create the renderer (compiles shaders, sets up buffers)
  gpuState.renderer = createSceneRenderer(gl);

  // Mark as failed if creation returned null
  if (!gpuState.renderer) { 
    console.warn('[sceneRenderer-get] createSceneRenderer failed'); 
    gpuState.failed = true; 
  }

  return gpuState.renderer;
}
