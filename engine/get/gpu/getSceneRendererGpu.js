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
 *   Called by setDrawSceneModel and other GPU render modules to obtain the
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
import { gpuState } from '@engine/state/gpu/stateScene.js';

// Import GPU context state helpers
import { getGpuCanvas } from '@engine/get/render/getGpuCanvas.js';
import { setGpuGl } from '@engine/set/gpu/setGpuGl.js';

// Import renderer factory for initial creation
import { getSceneRenderer } from '@engine/get/render/getSceneRenderer.js';

/**
 * sceneRenderer - Returns the singleton GPU scene renderer
 *
 * @returns {Object|null} The GPU renderer object, or null if unavailable
 */
export function getSceneRendererGpu() {
  // Return cached renderer or null if GPU previously failed
  if (gpuState.renderer || gpuState.failed) {
    return gpuState.renderer;
  }

  // Get the GPU canvas element
  const gpuCanvas = getGpuCanvas();
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

  // Store the WebGL context in state for other modules to access
  setGpuGl(gl);

  // Create the renderer (compiles shaders, sets up buffers)
  try {
    gpuState.renderer = getSceneRenderer(gl);
  } catch (err) {
    // CreateSceneRenderer can throw when shader compilation/linking fails.
    console.error('[sceneRenderer-get] createSceneRenderer threw:', err);
    gpuState.renderer = null;
  }

  // Mark as failed if creation returned null
  if (!gpuState.renderer) {
    console.warn('[sceneRenderer-get] createSceneRenderer failed');
    gpuState.failed = true;
  }

  return gpuState.renderer;
}
