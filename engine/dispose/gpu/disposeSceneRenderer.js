/**
 * disableSceneRenderer.js - GPU Scene Renderer Disabler
 *
 * PURPOSE:
 *   Disables the GPU scene renderer and cleans up its resources when
 *   GPU rendering fails (shader compile error, context lost, etc.).
 *   Marks the GPU as failed so the app falls back to CPU rendering.
 *
 * ARCHITECTURE ROLE:
 *   Called by setDrawSceneModel when a GPU rendering error is caught.
 *   Also callable directly when GPU initialization fails. Ensures
 *   graceful degradation to the CPU render path.
 */

"use strict";

// Import shared GPU renderer state
import {gpuState} from '@engine/state/gpu/scene.js';

/**
 * disableSceneRenderer - Disables the GPU renderer and cleans up resources
 *
 * @param {Error} err - The error that caused the GPU renderer to fail
 * @returns {void}
 */
export function disposeSceneRenderer(err) {
  // Dispose of the renderer if it has a cleanup method
  if (gpuState.renderer && typeof gpuState.renderer.dispose === 'function') {
    try {
      gpuState.renderer.dispose();
    } catch {
      // Ignore cleanup failures (renderer is already broken)
    }
  }

  // Clear the renderer and mark GPU as failed
  gpuState.renderer = null;
  gpuState.failed = true;

  // Log the failure for debugging
  console.error('GPU renderer failed:', err);
  console.info('Falling back to CPU rendering.');
}
