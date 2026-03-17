// Import shared GPU renderer state
import { gpuState } from '../state/gpuSceneState.js';

/**
 * disableSceneGpuRenderer - Disables the GPU renderer and cleans up resources
 * 
 * Called when GPU rendering fails (shader compile error, context lost, etc.).
 * Disposes of the renderer resources and marks the GPU as failed so the app
 * falls back to CPU rendering.
 * 
 * @param {Error} err - The error that caused the GPU renderer to fail
 */
export function disableSceneGpuRenderer(err) {
  if (gpuState.renderer && typeof gpuState.renderer.dispose === 'function') {
    try {
      gpuState.renderer.dispose();
    } catch {
      // Ignore cleanup failures.
    }
  }
  gpuState.renderer = null;
  gpuState.failed = true;
  console.warn('Wireframer: GPU scene renderer disabled, falling back to 2D.', err);
}
